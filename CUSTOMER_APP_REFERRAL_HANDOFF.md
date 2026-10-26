# Customer App — Referral & Scratch Card Handoff

**Audience:** Anushabazaar customer app frontend team
**Backend:** Spring Boot, base URL = `VITE_API_BASE_URL` (same as existing app APIs)
**Owner:** Backend (Anusha) team
**Status:** Implemented and tested in `Backend_Original/`. Admin panel pages live under `Marketing → Referrals / Scratch Cards / Reward Config / Fraud Review`.

---

## 1. What changed in the existing signup API

### `POST /api/auth/signup`

**Two new optional fields on the request body:**

```json
{
  "firebaseIdToken": "<existing>",
  "name": "<existing>",
  "email": "<existing>",
  "fcmToken": "<existing>",

  "referralCode": "ABC123",     // NEW — friend's code captured from share link / manual entry
  "deviceId": "<android-id>"    // NEW — used for fraud detection only, never as reward identity
}
```

**Two new fields on the response (`AuthResponse`):**

```json
{
  ...existing fields...,
  "referralCode": "X7K9MQ",     // THIS user's own code — show in Referral tab
  "walletBalance": 0
}
```

> The login API (`POST /api/auth/login`) is unchanged. `referralCode` only matters at first signup — it is ignored on login.

### Behavior
- Every customer gets a unique 6-char code (alphabet excludes `0/O/1/I/L/U` — readable when shared verbally). Saved to DB at signup.
- If `referralCode` is supplied **and** valid **and** not blocked by fraud rules:
  - A `referrer scratch card` is issued to the friend who shared the code.
  - A `referee scratch card` (welcome) is issued to the new user.
  - Both appear in the user's `GET /api/customer/scratchcards` list.
- If fraud rules block the referral, **no error is returned** — signup succeeds, but no cards are issued. The blocked record goes into the admin fraud queue.

---

## 2. New customer-facing endpoints

All require the JWT (existing `Authorization: Bearer <token>` flow). Same auth as `/api/customer/profile`.

### `GET /api/customer/referral/me`
Returns the user's own referral code, share link, and stats.

**Response:**
```json
{
  "referralCode": "X7K9MQ",
  "shareLink": "https://app.anushatechnologies.com/r/X7K9MQ",
  "shareMessage": "Try Anusha Bazaar! Use my code X7K9MQ when you sign up and get up to ₹7 in your wallet. https://app.anushatechnologies.com/r/X7K9MQ",
  "pointsPerRupee": 10,
  "totalInvited": 12,
  "totalPending": 1,
  "totalRewarded": 8,
  "totalEarnedRupees": 84.00
}
```

**UI hint:** Use `shareMessage` directly with React Native's `Share.share({ message })`. Show `referralCode` big, `shareLink` as fallback for "copy".

### `GET /api/customer/referral/validate/{code}`
Validates a code typed by the user before completing signup (optional — also checked server-side at signup).

**Response:**
```json
{ "valid": true,  "selfReferral": false, "referrerName": "Rahul" }
{ "valid": false, "selfReferral": false }
{ "valid": false, "selfReferral": true }
```

### `GET /api/customer/scratchcards`
List of all scratch cards the user owns.

**Response:**
```json
{
  "success": true,
  "pointsPerRupee": 10,
  "cards": [
    {
      "id": 42,
      "type": "REFEREE_SIGNUP",
      "status": "AVAILABLE",
      "minPoints": 10,
      "maxPoints": 70,
      "revealedPoints": null,
      "revealedRupees": null,
      "title": "Welcome bonus",
      "subtitle": "Scratch to win up to ₹7",
      "expiresAt": "2026-06-06T10:24:00",
      "scratchedAt": null,
      "createdAt": "2026-05-07T10:24:00"
    },
    {
      "id": 41,
      "type": "REFERRER_REWARD",
      "status": "SCRATCHED",
      "minPoints": 10,
      "maxPoints": 150,
      "revealedPoints": 80,
      "revealedRupees": 8,
      "title": "Friend joined!",
      "subtitle": "Scratch to win up to ₹15",
      "expiresAt": "2026-06-04T08:11:00",
      "scratchedAt": "2026-05-04T08:13:00",
      "createdAt": "2026-05-04T08:10:00"
    }
  ]
}
```

> ⚠️ For `AVAILABLE` cards, `revealedPoints` and `revealedRupees` are **always null** — points are generated server-side at scratch time so they cannot leak before the user scratches.

### `POST /api/customer/scratchcards/{id}/scratch`
Reveal a scratch card. Atomic — wallet is credited in the same DB transaction.

**Request:** `{}` (empty body, JWT identifies the user)

**Response 200:**
```json
{
  "cardId": 42,
  "revealedPoints": 50,
  "revealedRupees": 5,
  "newWalletBalance": 89.00,
  "message": "You won ₹5! Added to your wallet."
}
```

**Response 400** if card is not AVAILABLE (already scratched, expired, revoked):
```json
{ "error": "Card not available (status=SCRATCHED)" }
```

**Response 404** if the card doesn't belong to this user:
```json
{ "error": "Scratch cahrd not found" }
```

> Always re-fetch `/api/customer/scratchcards` after a successful scratch — the card's status moves to `SCRATCHED` and `revealedPoints` is now filled in. Also re-fetch the wallet (`GET /api/wallet/balance/{userMainId}`) for the updated balance, or use `newWalletBalance` from this response.

---

## 3. Reward math (so the UI can show consistent ₹ values)

| Symbol | Value | Source |
|---|---|---|
| `pointsPerRupee` | **10** | from any of the responses above (don't hardcode — config can change) |
| `revealedPoints` | always a **multiple of 10** | server enforces; UI can display as `pts` or `pts/10 = ₹` |
| Referrer max | up to **150 pts (₹15)** | weighted: ~85% land in 10–100 pts, ~15% in 110–150 |
| Referee max | up to **70 pts (₹7)** | uniform random in 10–70 |

**Display rule:** show the *range* on unscratched cards (e.g. "Win up to ₹15") using `maxPoints / pointsPerRupee`. After scratch, show `revealedRupees` prominently.

---

## 4. Customer app screens to build

### A. Referral tab
- **What to show:**
  - Big banner: "Refer & earn up to ₹15 per friend"
  - User's code in a copy-friendly card (use `referralCode`)
  - "Share" CTA → opens native share sheet with `shareMessage`
  - Stats: `totalInvited`, `totalPending`, `totalRewarded`, `totalEarnedRupees`
  - Link to "Scratch Cards" tab
- **API:** `GET /api/customer/referral/me`

### B. Scratch Cards tab
- **List view:** grid of cards. AVAILABLE cards show "Scratch to reveal" overlay. SCRATCHED cards show won amount. EXPIRED/REVOKED show greyed out.
- **Tap on AVAILABLE card:** open scratch animation (suggestion: `react-native-scratch-card` or a custom Skia/Canvas overlay). After ~50% scratched, call the reveal API and show the result.
- **Critical:** do NOT show points before calling `/scratch`. There is no client-side random — the server returns the value.
- **API:** `GET /api/customer/scratchcards`, `POST /api/customer/scratchcards/{id}/scratch`

### C. Onboarding / signup flow
- **Capture deferred deep link** (Branch / Firebase Dynamic Links). Store `referralCode` from the link in async storage before OTP verification.
- **OTP signup screen:** also offer a manual "Have a referral code?" field that pre-fills from the deep link. Optionally hit `GET /api/customer/referral/validate/{code}` to give live feedback before submitting.
- **At signup submit:** include `referralCode` and `deviceId` in the existing `POST /api/auth/signup` body.
  - `deviceId`: use `react-native-device-info` → `getAndroidId()` (Android) / `getUniqueId()`. This is for fraud only.
- **Post-signup:** the welcome scratch card is already issued — drop the user into the Scratch Cards tab to scratch it as the "wow" moment.

### D. Wallet tab (existing)
- After scratching, the wallet balance increments by `revealedRupees`. The existing wallet history page will show a transaction:
  - `type: CREDIT`
  - `description: "Scratch card reward (50 pts) — REFEREE_SIGNUP"`
- No frontend changes required beyond invalidating the wallet query after scratch.

---

## 5. Edge cases the UI must handle

| Case | What backend does | What UI should do |
|---|---|---|
| User enters their own code | server returns `selfReferral: true` from `/validate`; signup ignores the code silently | Show error "You can't use your own code" before signup |
| Invalid / expired code | `/validate` → `valid: false`; signup ignores | Show "Code not found" but allow signup to proceed |
| Card already scratched (e.g. user double-tapped, two devices open) | 400 with "Card not available (status=SCRATCHED)" | Re-fetch the list; show the existing reveal |
| Card expired | server marks EXPIRED on next scratch attempt; 400 | Filter or grey out cards where `expiresAt < now` |
| Fraud-blocked signup | signup succeeds, no cards issued | No special UI — just don't show any new card. User sees their normal wallet. |
| User on a fresh install, lost referral code | `/api/customer/referral/me` always returns their *own* code | Always fetch on Referral tab open |

---

## 6. Anti-fraud signals the backend uses (for context only — UI does not need to handle)

The backend runs these checks at signup. Each contributes to a fraud score; ≥ threshold (default 70) blocks the referral:

- Device already used by a previously *rewarded* referral → +80
- Same device > 2 signups in 24h → +60
- Same IP > 5 signups in 1h → +50
- Mobile / device / IP on admin blocklist → +100 each
- Referrer's daily cap (default 5) or monthly cap (default 50) hit → +50

> The customer doesn't need to know any of this. Just send a real `deviceId` and the user's mobile-OTP-verified token; the rest is server-side.

---

## 7. Admin-side hooks (for reference)

Admin can:
- Browse all referrals (`Marketing → Referrals`)
- Browse, gift, and revoke scratch cards (`Marketing → Scratch Cards`)
- Tune all reward ranges + caps without redeploy (`Marketing → Reward Config`)
- Approve fraud-blocked referrals manually → cards are then issued retroactively (`Marketing → Fraud Review`)
- Add device/IP/mobile to permanent blocklist

These should not be visible to the customer app, but the customer's wallet may show admin-issued gift cards (`type: ADMIN_GIFT`). Treat them identically to other cards in the UI.

---

## 8. Quick-start checklist for frontend

1. **Update signup form & API call** to include `referralCode` (from deep link / manual entry) and `deviceId` (from `react-native-device-info`).
2. **Display new `referralCode` field** from the auth response on the Referral tab.
3. **Add `GET /api/customer/referral/me`** call to power the Referral tab.
4. **Add Scratch Cards tab** that lists cards, with a scratch animation calling `POST /scratchcards/{id}/scratch` once revealed.
5. **Re-fetch wallet balance** after a successful scratch (or use `newWalletBalance` from the response).
6. **Implement deferred deep links** for `https://app.anushatechnologies.com/r/{CODE}` so that referrals captured before app install survive Play Store install.

---

## 9. Suggested deep link config

- **Pattern:** `https://app.anushatechnologies.com/r/{CODE}` (e.g. `/r/X7K9MQ`)
- **Provider:** Branch.io or Firebase Dynamic Links — both support deferred deep links so the code survives the install hop.
- **Storage:** Save to `AsyncStorage` under key `pendingReferralCode` until OTP verify completes. After successful signup, clear it.

---

## 10. Backend file map (for spelunking when you get stuck)

| Concern | File |
|---|---|
| Signup hook + referral capture | `Backend_Original/src/main/java/com/project/Anusha/controller/CustomerController.java` |
| Customer-facing referral & scratch API | `controller/CustomerReferralController.java` |
| Reward math, fraud rules, card issuance | `service/ReferralService.java` |
| Atomic scratch reveal | `service/ScratchCardService.java` |
| Code generator (6-char unique) | `service/ReferralCodeGenerator.java` |
| Entities | `model/Referral.java`, `model/ScratchCard.java`, `model/ReferralConfig.java`, `model/FraudBlocklist.java` |
| Admin endpoints | `controller/AdminReferralController.java` |

Questions: ping the backend team or check the admin panel's "Reward Config" page to see the live values being used.
