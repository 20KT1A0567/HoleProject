# Multi-Device Auth — Frontend Handoff

Goal: one customer can stay signed-in on the **CustomerApp + Website** at the same time, and one admin can stay signed-in on the **AdminPanel + AdminApp** at the same time. The backend now tags each refresh token with a `ClientType`. Sessions on different client types coexist; only same-client logins evict each other.

| Surface           | ClientType    | Auth route prefix              | Status                                  |
| ----------------- | ------------- | ------------------------------ | --------------------------------------- |
| CustomerApp       | `CUSTOMER_APP`| `/api/auth/...`                | Already correct — no changes needed     |
| Customer Website  | `WEBSITE`     | `/api/auth/website/...`        | **Done** in `Anushabazaar`              |
| AdminPanel (web)  | `ADMIN_PANEL` | `/api/auth/adminpanel/...`     | Already correct — no changes needed     |
| AdminApp (mobile) | `ADMIN_APP`   | `/api/auth/adminapp/...`       | **TODO** — see "Admin App" section      |

---

## 1. CustomerApp (`AnushaBazaar-U`) — no changes required

The mobile app already calls `/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`, `/api/auth/logout`, and `/api/auth/check-phone/{phone}`. The backend tags those tokens as `CUSTOMER_APP`.

Because the website now uses a different ClientType (`WEBSITE`), a customer who signs in on both surfaces will keep both sessions live. Nothing to change in the app.

**Smoke test for the team:**
1. Sign in on the mobile app.
2. Sign in on the website with the same phone number.
3. Pull-to-refresh / open profile in the app — request must still succeed (no 401).

---

## 2. AdminPanel (`Anushabazaar_Admin_Panel`) — no changes required

The panel already calls `/api/auth/adminpanel/login`, `.../firebase-login`, `.../verify-admin-code`, `.../refresh`, `.../logout`, etc. Tokens are tagged `ADMIN_PANEL`. The new `ADMIN_APP` ClientType doesn't share a session bucket with the panel, so panel users won't be kicked out when the same admin logs into the mobile app.

**Smoke test:**
1. Sign in on the AdminPanel.
2. Sign in on the AdminApp with the same admin email.
3. Click anything in the panel that hits an admin endpoint — request must still succeed.

---

## 3. Customer Website (`Anushabazaar`) — already updated

Files changed in this repo:

- [Anushabazaar/src/app/services/storefrontApi.ts](Anushabazaar/src/app/services/storefrontApi.ts) — `checkPhoneExists`, `loginWithFirebaseToken`, `signupWithFirebaseToken`, `logoutCustomerSession` now hit `/auth/website/...`.
- [Anushabazaar/src/app/lib/session.ts](Anushabazaar/src/app/lib/session.ts) — `refreshCustomerSessionOnce` now hits `/auth/website/refresh`.

No changes needed elsewhere. The session store, Firebase phone-OTP flow, and React UI all stay the same — only the URL path changed. `vite build` passes.

---

## 4. AdminApp (mobile) — TODO for the AdminApp team

The new endpoints accept the same request/response shapes as `/api/auth/adminpanel/*`. Just point the new app at `/api/auth/adminapp/*` and tokens will be tagged `ADMIN_APP`.

### 4.1 Endpoints

Base URL: `https://api.anushatechnologies.com`

| Method | Path                                    | Body                                                | Notes                                                                                                                              |
| ------ | --------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/adminapp/login`              | `{ email, password }`                               | Returns `LoginResponse`. If `adminCodeRequired: true`, follow up with `/verify-admin-code`.                                        |
| POST   | `/api/auth/adminapp/firebase-login`     | `{ idToken }`                                       | Pass a Firebase ID token whose claim `email` matches an admin user.                                                                |
| POST   | `/api/auth/adminapp/verify-admin-code`  | `{ challengeToken, code }`                          | Use the `adminCodeChallengeToken` returned from `/login` plus the 6-digit access code. Returns the final `LoginResponse` with tokens. |
| POST   | `/api/auth/adminapp/refresh`            | `{ refreshToken }`                                  | Returns `{ accessToken, refreshToken, expiresIn, jwtToken, token }`. Refresh tokens are rotated.                                  |
| POST   | `/api/auth/adminapp/logout`             | `{ refreshToken }`                                  | Revokes only the AdminApp session.                                                                                                |

### 4.2 `LoginResponse` shape (selected fields)

```json
{
  "token": "<JWT access token>",
  "accessToken": "<JWT access token>",
  "refreshToken": "<opaque refresh token>",
  "expiresIn": 900,
  "id": 12,
  "email": "admin@example.com",
  "role": "ROLE_ADMIN",
  "name": "Admin User",
  "mustChangePassword": false,
  "adminCodeRequired": false,
  "adminCodeChallengeToken": null,
  "adminAccessExpiresAt": "2026-09-01T12:00:00",
  "adminAccessRemainingSeconds": 7776000,
  "adminAccessExpired": false,
  "permissions": ["MANAGE_PRODUCTS", "..."]
}
```

When `adminCodeRequired: true`:

- `accessToken`/`refreshToken` are not yet issued.
- Use `adminCodeChallengeToken` + 6-digit code → call `/verify-admin-code` → get the full token pair.

### 4.3 Reference client (React Native / Expo, mirrors `authSession.ts` from CustomerApp)

```ts
// src/services/api/adminAuth.ts
const API_BASE = `${process.env.EXPO_PUBLIC_API_URL || "https://api.anushatechnologies.com/api"}/auth/adminapp`;

export type LoginResponse = {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  id: number;
  email: string;
  role: string;
  name: string;
  mustChangePassword: boolean;
  adminCodeRequired: boolean;
  adminCodeChallengeToken?: string | null;
  permissions: string[];
};

export const adminLogin = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Login failed");
  }
  return (await res.json()) as LoginResponse;
};

export const verifyAdminCode = async (challengeToken: string, code: string) => {
  const res = await fetch(`${API_BASE}/verify-admin-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeToken, code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Invalid code");
  }
  return (await res.json()) as LoginResponse;
};

export const adminRefresh = async (refreshToken: string) => {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) throw new Error("Refresh failed");
  return (await res.json()) as {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
};

export const adminLogout = async (refreshToken: string) => {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
};
```

### 4.4 Login screen flow

```ts
const result = await adminLogin(email, password);

if (result.adminCodeRequired && result.adminCodeChallengeToken) {
  // Show 6-digit access-code screen
  navigate("AdminCodeScreen", { challengeToken: result.adminCodeChallengeToken });
  return;
}

// Direct login — store tokens
await SecureStore.setItemAsync("admin_accessToken", result.accessToken!);
await SecureStore.setItemAsync("admin_refreshToken", result.refreshToken!);
```

After the access-code screen calls `verifyAdminCode(challengeToken, code)`, it returns a `LoginResponse` with the full token pair — store it the same way.

### 4.5 Storage keys

Use **separate** keys from any CustomerApp install. Suggested:

```
admin_accessToken
admin_refreshToken
admin_user
admin_tokenExpiry
```

### 4.6 Auth header & 401 handling

- Send `Authorization: Bearer <accessToken>` on every authenticated admin request (`/api/admin/...`, `/api/admin-panel/...`, etc.).
- On 401: call `adminRefresh(refreshToken)`. If that throws, clear storage and bounce to the login screen.

### 4.7 Smoke tests for the AdminApp team

1. **Cross-client coexistence**: Sign in to AdminPanel (web) and AdminApp (mobile) with the same admin. Both must continue to load admin endpoints without 401.
2. **Same-client eviction**: Log in twice on the AdminApp on different devices. The first device's refresh should fail (the second login revoked it) — that's expected.
3. **2FA path**: For an admin user that has an access code configured, `/login` returns `adminCodeRequired: true` with no tokens. Calling `/verify-admin-code` with the right code returns tokens.
4. **Logout isolation**: Logging out of the AdminApp must NOT log out the AdminPanel session.

---

## Backend changes already merged (Backend_Original)

- [RefreshToken.java](Backend_Original/src/main/java/com/project/Anusha/model/RefreshToken.java) — added `WEBSITE` and `ADMIN_APP` to `ClientType`.
- [RefreshTokenService.java](Backend_Original/src/main/java/com/project/Anusha/service/RefreshTokenService.java) — `issueForAdmin(User, ClientType)` overload accepting `ADMIN_PANEL` or `ADMIN_APP`.
- [WebsiteAuthController.java](Backend_Original/src/main/java/com/project/Anusha/controller/WebsiteAuthController.java) — new `/api/auth/website/*` endpoints (mirrors customer app, tags `WEBSITE`).
- [AdminAppAuthController.java](Backend_Original/src/main/java/com/project/Anusha/controller/AdminAppAuthController.java) — new `/api/auth/adminapp/*` endpoints (mirrors admin panel, tags `ADMIN_APP`).

`/api/auth/**` is already permitAll in `SecurityConfig`, so the new routes are reachable. Clean Maven build passes (280 source files).
