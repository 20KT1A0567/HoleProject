# Customer App — Referral Auto-fill Handoff

**Repo:** [AnushaBazaar-U](AnushaBazaar-U/)
**Goal:** when a user taps a referral link, then installs the app from the Play Store, the signup screen must open with the referral code pre-filled. Editable, but pre-filled.

## Backend is already ready

`/api/auth/signup` already accepts these optional fields — no backend work required:

```json
{
  "firebaseIdToken": "...",
  "name": "...",
  "email": "...",
  "fcmToken": "...",
  "referralCode": "AB123",
  "deviceId": "stable-device-id"
}
```

The fraud engine uses `referralCode` + `deviceId` + IP automatically. Just send them on signup.

## What we need to wire in the app

| # | Source of referral code | Survives install? | Already wired? |
| - | ----------------------- | ----------------- | -------------- |
| 1 | Deep link `anushabazaar://refer/CODE` (app already installed) | No (app must be installed) | ❌ |
| 2 | Universal link `https://anushabazaar.com/refer/CODE` (app already installed) | No (app must be installed) | ❌ |
| 3 | **Google Play Install Referrer** (`&referrer=ref=CODE` appended to Play Store URL) | **YES** — even after fresh install | ❌ |
| 4 | Manual entry by user in signup form | n/a | ❌ |

The critical one is **#3**. That's the only path that survives a fresh install from the Play Store. We persist whatever we get into AsyncStorage and let the signup screen read it.

## Packages to install

```bash
cd AnushaBazaar-U
npx expo install react-native-play-install-referrer expo-application
```

- `react-native-play-install-referrer` — wraps Google Play Install Referrer API. **Native module — requires an EAS dev-build, not Expo Go.** You already ship via EAS, so this is fine. Rebuild the AAB after install.
- `expo-application` — gives a stable Android device ID (`getAndroidId()`) so the backend can run device-level fraud checks.

Already installed in your project (no action needed): `@react-native-async-storage/async-storage`, `expo-linking`, `expo-secure-store`.

---

## Files to create / change

### 1. NEW — `src/services/pendingReferral.ts`

This is the single source of truth for the captured code. Everything reads/writes through it.

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const KEY = "anusha.pendingReferralCode";
const READ_FLAG = "anusha.installReferrerRead";

const REFERRAL_PATTERN = /^[A-Z0-9_-]{3,32}$/;

const normalize = (raw: string | null | undefined): string | null => {
  if (!raw) return null;
  const cleaned = raw.trim().toUpperCase();
  return REFERRAL_PATTERN.test(cleaned) ? cleaned : null;
};

const extractCode = (referrerUrl: string): string | null => {
  // referrerUrl arrives as a query-string-like value, e.g.
  //   "ref=AB123"
  //   "utm_source=share&ref=AB123"
  //   "referralCode=AB123"
  if (!referrerUrl) return null;
  try {
    const params = new URLSearchParams(referrerUrl);
    const code =
      params.get("ref") ||
      params.get("referral") ||
      params.get("referralCode") ||
      params.get("utm_content");
    return normalize(code);
  } catch {
    return null;
  }
};

export const setPendingReferral = async (code: string) => {
  const cleaned = normalize(code);
  if (!cleaned) return;
  await AsyncStorage.setItem(KEY, cleaned);
};

export const getPendingReferral = async (): Promise<string | null> => {
  const value = await AsyncStorage.getItem(KEY);
  return normalize(value);
};

export const clearPendingReferral = async () => {
  await AsyncStorage.removeItem(KEY);
};

/**
 * Read Google Play Install Referrer ONCE on first launch after install.
 * Safe to call on every launch — guarded by a flag so it only runs once.
 * Silently no-ops on iOS.
 */
export const captureInstallReferrer = async (): Promise<void> => {
  if (Platform.OS !== "android") return;

  const alreadyRead = await AsyncStorage.getItem(READ_FLAG);
  if (alreadyRead) return;

  let PlayInstallReferrer: any;
  try {
    PlayInstallReferrer = require("react-native-play-install-referrer").PlayInstallReferrer;
  } catch {
    // Module not linked (e.g. running in Expo Go) — skip silently.
    await AsyncStorage.setItem(READ_FLAG, "1");
    return;
  }

  return new Promise((resolve) => {
    PlayInstallReferrer.getInstallReferrerInfo(async (info: any, error: any) => {
      // Mark as read no matter what — Google only serves the value once.
      await AsyncStorage.setItem(READ_FLAG, "1");
      if (error || !info?.installReferrer) {
        resolve();
        return;
      }
      const code = extractCode(info.installReferrer);
      if (code) {
        await setPendingReferral(code);
      }
      resolve();
    });
  });
};

/**
 * Parse a deep-link URL (anushabazaar://refer/CODE or https://anushabazaar.com/refer/CODE
 * or any ?ref=CODE query param) and persist if found.
 */
export const capturePendingReferralFromUrl = async (url: string | null) => {
  if (!url) return;
  try {
    // Quick query-string scan
    const queryMatch = url.match(/[?&](?:ref|referral|referralCode)=([^&#]+)/i);
    if (queryMatch?.[1]) {
      await setPendingReferral(decodeURIComponent(queryMatch[1]));
      return;
    }
    // Path scan: /refer/CODE or /r/CODE
    const pathMatch = url.match(/(?:\/refer\/|\/r\/)([A-Za-z0-9_-]+)/i);
    if (pathMatch?.[1]) {
      await setPendingReferral(pathMatch[1]);
    }
  } catch {
    // Swallow malformed URLs.
  }
};
```

### 2. NEW — `src/services/deviceId.ts`

A stable per-install identifier the backend uses for device-level fraud checks.

```ts
import * as Application from "expo-application";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "anusha.stableDeviceId";

export const getStableDeviceId = async (): Promise<string> => {
  // 1. Fast path: Android ID (stable for the lifetime of the app install)
  if (Platform.OS === "android") {
    const androidId = Application.getAndroidId();
    if (androidId) return androidId;
  }

  // 2. Fallback: SecureStore-persisted random ID
  const cached = await SecureStore.getItemAsync(KEY);
  if (cached) return cached;

  const fresh = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  await SecureStore.setItemAsync(KEY, fresh);
  return fresh;
};
```

### 3. MODIFY — `src/services/api/auth.ts`

Two changes:
- `signupWithFirebaseToken` accepts optional `referralCode` and `deviceId`.
- Include them in the request body when present.

Replace the existing function:

```ts
export const signupWithFirebaseToken = async (
  firebaseIdToken: string,
  name: string,
  email?: string,
  referralCode?: string,
  deviceId?: string,
) => {
  const fcmToken = await getFcmToken();

  const body: any = { firebaseIdToken, name, fcmToken };
  if (email) body.email = email;
  if (referralCode) body.referralCode = referralCode;
  if (deviceId) body.deviceId = deviceId;

  const response = await fetchWithTimeout(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error: any = new Error(`Signup failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return await response.json();
};
```

### 4. MODIFY — `App.tsx`

At the top level (before rendering navigation), wire two listeners. Drop this block into `App.tsx` — inside the outermost component, alongside the other `useEffect`s.

```tsx
import {
  captureInstallReferrer,
  capturePendingReferralFromUrl,
} from "./src/services/pendingReferral";

// ...inside the App component:
useEffect(() => {
  // 1. Read Play Install Referrer once (covers fresh-install attribution)
  captureInstallReferrer();

  // 2. Handle deep links — both cold-start and runtime
  Linking.getInitialURL().then((url) => capturePendingReferralFromUrl(url));
  const sub = Linking.addEventListener("url", ({ url }) =>
    capturePendingReferralFromUrl(url),
  );
  return () => sub.remove();
}, []);
```

Also extend `linking.config.screens` so that tapping a `/refer/CODE` link while the app is installed navigates to the signup screen instead of 404'ing:

```ts
const linking = {
  prefixes: [prefix, "https://anushabazaar.com", "anushabazaar://", "https://api.anushatechnologies.com"],
  config: {
    screens: {
      MainTabs: { /* unchanged */ },
      ProductDetail: "product/:id",
      Profile: "profile",
      Cart: "cart",
      Signup: "refer/:referralCode",   // NEW
    },
  },
} as any;
```

### 5. MODIFY — `src/screens/auth/SignupScreen.tsx`

Three things:
1. Add a `referralCode` state, pre-fill it from `pendingReferral` on mount, and accept it from deep-link route params.
2. Add a "Have a referral code?" input field.
3. Pass `referralCode` through to OtpScreen via `signupData`.

Add these imports at the top:

```tsx
import { getPendingReferral } from "../../services/pendingReferral";
```

Add state + effect right next to the other `useState` calls:

```tsx
const routeReferral = route.params?.referralCode || "";
const [referralCode, setReferralCode] = useState<string>(routeReferral.toUpperCase());

useEffect(() => {
  if (referralCode) return;
  getPendingReferral().then((code) => {
    if (code) setReferralCode(code);
  });
}, []);
```

Add an input below the email field (match your existing input style):

```tsx
<View style={styles.inputGroup}>
  <Text style={styles.label}>Referral Code (optional)</Text>
  <TextInput
    style={styles.input}
    value={referralCode}
    onChangeText={(t) => setReferralCode(t.trim().toUpperCase())}
    placeholder="e.g. AB123"
    autoCapitalize="characters"
    maxLength={32}
    onFocus={() => setFocusedField("referral")}
    onBlur={() => setFocusedField("")}
  />
</View>
```

In `handleSignup`, update the `navigation.navigate("Otp", …)` call to include the code:

```tsx
navigation.navigate("Otp", {
  phone: normalizedPhone,
  verificationId: confirmation.verificationId,
  signupData: {
    name: name.trim(),
    email: email.trim() || undefined,
    referralCode: referralCode.trim() || undefined,   // NEW
  },
});
```

### 6. MODIFY — `src/screens/auth/OtpScreen.tsx`

In `finalizeSession`, pass the referral code + device ID to the API call and clear the stored code on success.

Add imports:

```tsx
import { getStableDeviceId } from "../../services/deviceId";
import { clearPendingReferral } from "../../services/pendingReferral";
```

Replace the signup branch inside `finalizeSession`:

```tsx
if (signupData) {
  const deviceId = await getStableDeviceId();
  const result = await signupWithFirebaseToken(
    firebaseIdToken,
    signupData.name,
    signupData.email,
    signupData.referralCode,
    deviceId,
  );
  // Code has been consumed — drop the pending value so it never re-applies.
  await clearPendingReferral();
  return result;
}
```

---

## Where the referral code comes from — end-to-end

```
SHARE LINK (sent by referrer):
   https://anushabazaar.com/refer/AB123

Case A — app NOT installed (the broken case today):
   1. User taps link
   2. anushabazaar.com/refer/AB123 page redirects to:
      https://play.google.com/store/apps/details?id=com.anushabazaar&referrer=ref=AB123
   3. Play Store installs app
   4. App opens
   5. captureInstallReferrer() reads "ref=AB123" → AsyncStorage["pendingReferralCode"] = "AB123"
   6. User taps "Sign up"
   7. SignupScreen pre-fills "AB123" in the referral field
   8. User can edit, then proceeds to OTP
   9. OtpScreen sends referralCode + deviceId to /api/auth/signup
   10. Backend's ReferralService.handleSignup runs fraud checks, issues scratch cards
   11. clearPendingReferral() drops the value so it never re-applies

Case B — app IS installed:
   1. User taps link
   2. Android opens app via universal link (we set autoVerify=true and host=anushabazaar.com)
   3. expo-linking fires "url" event with https://anushabazaar.com/refer/AB123
   4. capturePendingReferralFromUrl() extracts AB123 → AsyncStorage
   5. Because linking.config.screens.Signup = "refer/:referralCode", navigation lands on Signup
   6. SignupScreen reads route.params.referralCode = "AB123" → pre-fills
   7. Same as steps 7-11 above
```

For Case A to actually work the share link must put the code in `&referrer=`. That's a **website team** task — the `/refer/:code` page on anushabazaar.com must redirect Android users to:

```
https://play.google.com/store/apps/details?id=com.anushabazaar&referrer=ref={CODE}
```

(The website handoff is separate. This doc is app-only.)

---

## Build & verify

```bash
cd AnushaBazaar-U

# 1. Install native deps
npx expo install react-native-play-install-referrer expo-application

# 2. Rebuild — REQUIRED because of the new native module
eas build --profile preview --platform android
# or for local dev:
npx expo prebuild --clean
npx expo run:android --device
```

### Smoke tests

1. **Manual entry path (no native deps):** open Signup, type `TESTCODE` in the referral field, complete signup. Check the DB:
   ```sql
   SELECT * FROM referrals ORDER BY id DESC LIMIT 1;
   ```
   Should show `referee_id` = your new user, `referrer_id` = whoever owns `TESTCODE`, `status` = `QUALIFIED` (assuming fraud score < 70).

2. **Deep-link path (app already installed):**
   - Install app, sign out, kill it.
   - From another phone, send `https://anushabazaar.com/refer/AB123` via WhatsApp, tap it.
   - App should open straight on Signup with `AB123` pre-filled.

3. **Install Referrer path (the real test):**
   - Uninstall the app completely.
   - Open `https://play.google.com/store/apps/details?id=com.anushabazaar&referrer=ref=AB123` in Chrome on the phone (this is what the website's /refer/:code redirect will do for real users).
   - Install via Play Store.
   - Open app → Signup screen → referral field should pre-fill `AB123`.
   - **You only get one shot** — Google serves the install-referrer value exactly once per install, and our `READ_FLAG` guard remembers we've consumed it. To re-test, uninstall and reinstall.

4. **Fraud-score check:** in the database, `fraud_reasons` shows which rules fired. If a referral comes back `BLOCKED`, that column tells you why (e.g. `device_signup_limit_exceeded:3`).

---

## Files touched summary

| File | Action |
| ---- | ------ |
| `src/services/pendingReferral.ts` | **Create** |
| `src/services/deviceId.ts` | **Create** |
| `src/services/api/auth.ts` | Modify `signupWithFirebaseToken` |
| `App.tsx` | Add boot effect + `Signup: "refer/:referralCode"` route |
| `src/screens/auth/SignupScreen.tsx` | Add referral-code input + pre-fill |
| `src/screens/auth/OtpScreen.tsx` | Pass `referralCode` + `deviceId` to API |
| `package.json` | `react-native-play-install-referrer`, `expo-application` |

No other screens, contexts, or navigators need changes.
