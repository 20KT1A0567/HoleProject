# Customer App — Delete Account Handoff

**Repo:** [AnushaBazaar-U](AnushaBazaar-U/)
**Goal:** add a Delete Account button on the Profile screen that permanently removes the user's account. Required by Google Play data-safety policy.

## Backend is already deployed

The backend endpoint is live and tested — frontend just needs to call it:

```
DELETE /api/customer/profile
Authorization: Bearer <accessToken>

Success → 200 { "success": true, "message": "Account deleted successfully" }
Failure → 400 { "error": "<reason>" }
Auth    → 401 { "error": "Not authenticated" }
```

What it does server-side:
- Marks `customer.is_active = false` so the user cannot log in
- Anonymizes `name` ("Deleted user") and clears `email`
- **Revokes every active refresh token** for this user across CustomerApp + Website (other devices lose their session immediately)
- Order history is preserved for accounting / GST (soft delete, not hard delete)

## Three frontend files to change

### File 1 — `src/services/api/profile.ts` (MODIFY)

**Add this function below the existing `updateProfile`:**

```ts
/**
 * DELETE /api/customer/profile – self-service account deletion.
 *
 * Soft-deletes the user on the backend (preserves order history for accounting),
 * anonymizes their PII, and revokes every active refresh token so existing
 * sessions on other devices/Website are killed too.
 *
 * Throws on failure so the caller can show an error toast. After a successful
 * call, the caller MUST clear the local session and bounce to the auth flow.
 */
export const deleteAccount = async (token: string): Promise<void> => {
  const response = await fetchWithTimeout(API_BASE, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!response.ok) {
    let message = `Failed to delete account (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // body wasn't JSON — fall back to the default message
    }
    const error: any = new Error(message);
    error.status = response.status;
    throw error;
  }
};
```

The existing `getProfile` and `updateProfile` helpers swallow errors and return `null` — **`deleteAccount` deliberately throws**. A destructive op must surface failures so the UI can keep the user signed in and show "try again."

### File 2 — `src/context/AuthContext.tsx` (MODIFY)

**Three small edits:**

**a) Update the imports block** to add `getAccessToken` from `authSession` and the new API function:

```ts
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_PROFILE_KEY,
  TOKEN_EXPIRY_KEY,
  getAccessToken,            // ← NEW (was already exported by authSession.ts)
  getRefreshToken,
  loadTokenExpiry,
  logoutCustomerSession,
  onSessionExpired,
  onTokenUpdate,
  saveTokens,
} from "../services/authSession";
import { deleteAccount as apiDeleteAccount } from "../services/api/profile";  // ← NEW
```

**b) Extend the context type:**

```ts
type AuthContextType = {
  user: UserType | null;
  jwtToken: string | null;
  loading: boolean;
  login: (user: UserType, token: string, refreshToken?: string | null, expiresIn?: number) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;   // ← NEW
};
```

**c) Add the `deleteAccount` method inside `AuthProvider` (paste right after the existing `logout` function):**

```tsx
/**
 * Permanently delete the user's account.
 *
 * Order matters: hit the backend first so the server can revoke refresh
 * tokens and anonymize PII *before* we destroy the local session — that
 * way a failure leaves the user logged in with a clear error rather than
 * stranded with no way to retry. Then we delete the Firebase auth user
 * and wipe local storage.
 *
 * Throws on backend failure so the caller can show an error toast.
 */
const deleteAccount = async () => {
  const accessToken = jwtToken || (await getAccessToken());
  if (!accessToken) {
    throw new Error("Not signed in");
  }

  // 1. Backend soft-delete + revoke all refresh tokens. If this fails, abort.
  await apiDeleteAccount(accessToken);

  // 2. Best-effort revoke the refresh-token row on the server for THIS device.
  //    Safe to ignore failures — backend step 1 already revoked everything.
  try {
    await logoutCustomerSession();
  } catch {}

  // 3. Delete the Firebase auth record so the same phone can sign up again
  //    cleanly if the user changes their mind later.
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await currentUser.delete();
    }
  } catch {
    // If Firebase delete fails (e.g. requires re-auth), proceed anyway.
    // The backend has already invalidated the session — the worst case is
    // the user has to re-verify their phone if they sign up again.
  }

  // 4. Wipe local session state.
  await clearLocalSession();
};
```

**d) Add `deleteAccount` to the provider value:**

```tsx
<AuthContext.Provider value={{ user, jwtToken, loading, login, logout, deleteAccount }}>
  {children}
</AuthContext.Provider>
```

### File 3 — `src/screens/profile/ProfileScreen.tsx` (MODIFY)

**a) Add `Alert` to the `react-native` import:**

```tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Share,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,                       // ← NEW
} from "react-native";
```

**b) In the `ProfileScreen` component, replace the existing `useAuth` destructure and state declarations with:**

```tsx
const { user, logout, deleteAccount } = useAuth();
const { balance, points } = useWallet() as any;
const insets = useSafeAreaInsets();
const [showLogoutModal, setShowLogoutModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleting, setDeleting] = useState(false);

const handleDeleteAccount = async () => {
  if (deleting) return;
  setDeleting(true);
  try {
    await deleteAccount();
    setShowDeleteModal(false);
    navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    Alert.alert("Account deleted", "Your account has been permanently removed.");
  } catch (err: any) {
    Alert.alert(
      "Could not delete account",
      err?.message || "Something went wrong. Please try again or contact support.",
    );
  } finally {
    setDeleting(false);
  }
};
```

**c) Add the Delete Account tile immediately below the existing Logout tile:**

```tsx
{/* ── Delete Account ── */}
{user && (
  <View style={styles.cardSection}>
    <Pressable
      style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.85 }]}
      onPress={() => setShowDeleteModal(true)}
    >
      <View style={styles.logoutLeft}>
        <View style={styles.deleteIconBox}>
          <Ionicons name="trash-outline" size={scale(20)} color="#B91C1C" />
        </View>
        <Text style={styles.deleteText}>Delete Account</Text>
      </View>
      <Ionicons name="chevron-forward" size={scale(16)} color="#FCA5A5" />
    </Pressable>
  </View>
)}
```

**d) Add the confirmation modal immediately after the existing Logout modal (just before the closing `</View>` of the screen):**

```tsx
{/* ── Delete Account Modal ── */}
{showDeleteModal && (
  <Pressable
    style={styles.modalOverlay}
    onPress={() => {
      if (!deleting) setShowDeleteModal(false);
    }}
  >
    <Pressable style={styles.modalBox} onPress={() => {}}>
      <View style={[styles.modalIconCircle, { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
        <Ionicons name="trash-outline" size={scale(30)} color="#B91C1C" />
      </View>
      <Text style={styles.modalTitle}>Delete your account?</Text>
      <Text style={styles.modalSub}>
        This permanently removes your profile, wallet balance, saved addresses,
        and wishlist. Order history is kept for accounting. This cannot be undone.
      </Text>
      <View style={styles.modalBtns}>
        <Pressable
          style={[styles.cancelBtn, deleting && { opacity: 0.5 }]}
          onPress={() => !deleting && setShowDeleteModal(false)}
          disabled={deleting}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.confirmBtn, { backgroundColor: "#B91C1C" }, deleting && { opacity: 0.7 }]}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.confirmText}>Delete Account</Text>
          )}
        </Pressable>
      </View>
    </Pressable>
  </Pressable>
)}
```

Two safety details in the modal: it can't be dismissed by tapping the backdrop while the request is in flight, and the Delete button shows a spinner instead of text so the user can't double-tap.

**e) Add these styles next to the existing `logoutText` rule in the `StyleSheet.create` block:**

```tsx
/* ── Delete Account ── */
deleteBtn: {
  backgroundColor: "#FFF7F7",
  borderRadius: scale(18),
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: scale(14),
  paddingHorizontal: scale(16),
  borderWidth: 1,
  borderColor: "#FCA5A5",
},
deleteIconBox: {
  width: scale(38),
  height: scale(38),
  borderRadius: scale(12),
  backgroundColor: "#FEE2E2",
  justifyContent: "center",
  alignItems: "center",
},
deleteText: {
  color: "#B91C1C",
  fontWeight: "700",
  fontSize: scale(15),
},
```

## No native modules — ships in a JS update

All three files are TypeScript only. No `npx expo install ...` step needed, no EAS rebuild required. Ship via OTA update if you're using EAS Update; otherwise the next AAB picks it up.

## Test plan

1. **Happy path**
   - Open the app, log in.
   - Profile → tap **Delete Account** → confirmation modal appears.
   - Tap **Delete Account** → spinner shows on the button, modal can't be dismissed.
   - On 200 response: navigates to MainTabs and shows an "Account deleted" alert.
   - Re-open the app → user is signed out.
   - Try to sign up again with the same phone → works cleanly (Firebase user was deleted in step 3 of the orchestration).

2. **Backend failure**
   - Disconnect from the internet → tap Delete Account → spinner runs → request fails → alert shows the error message → user remains signed in, can retry.

3. **Cross-device session revoke**
   - Sign in on both the CustomerApp (this build) and the Website with the same phone.
   - Delete the account from the app.
   - On the Website, click any authenticated action (e.g. open Profile or Cart) → should return 401 → session is cleared, user is sent back to login.

4. **DB check** (any backend engineer)
   ```sql
   SELECT id, is_active, username, email
   FROM customers
   WHERE phone_number = '+91XXXXXXXXXX';

   SELECT id, revoked, revoked_at, client_type
   FROM refresh_tokens
   WHERE principal_type = 'USER_MAIN'
   AND principal_id = (SELECT user_main_id FROM customers WHERE phone_number = '+91XXXXXXXXXX');
   ```
   Expected: `is_active = 0`, `username = 'Deleted user'`, `email IS NULL`, all matching refresh tokens have `revoked = 1`.

## Files touched summary

| File                                   | Action  | Purpose                                                            |
| -------------------------------------- | ------- | ------------------------------------------------------------------ |
| `src/services/api/profile.ts`          | Modify  | Add `deleteAccount(token)` — throws on failure                     |
| `src/context/AuthContext.tsx`          | Modify  | Add `deleteAccount` to context — orchestrates backend + Firebase + local cleanup |
| `src/screens/profile/ProfileScreen.tsx`| Modify  | Delete tile + confirmation modal + loading state + error alert     |

No package.json changes. No native code changes. No navigation changes.
