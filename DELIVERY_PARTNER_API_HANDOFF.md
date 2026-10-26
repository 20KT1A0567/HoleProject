# Anusha Delivery Partner App API Handoff

Based on the current backend source in `Backend_Original` on April 9, 2026.

This document is for the delivery frontend team. It covers the current delivery-partner mobile API flow, request shapes, important backend rules, and Postman-ready examples.

## 1. Base URL

Production base URL:

```text
https://api.anushatechnologies.com
```

Example full URL:

```text
https://api.anushatechnologies.com/api/delivery/auth/login
```

## 2. Important Current Notes

1. Phone OTP is handled in Firebase on the device.
   Backend does not send or verify OTP directly for the delivery mobile app.

2. Do not send Firebase UID as `firebaseIdToken`.
   Correct `firebaseIdToken` is the real Firebase ID token JWT, usually starting with `eyJ...`.

3. There is currently no delivery refresh-token endpoint.
   Current flow is:
   - Firebase OTP on device
   - get Firebase ID token
   - send Firebase ID token to backend
   - backend returns `jwtToken`
   - frontend stores backend JWT

4. Primary delivery app routes are:
   - `/api/delivery/auth/*`
   - `/api/delivery-app/*`
   - `/api/documents/*`

5. There are also older ID-based fallback routes still used by the current app:
   - `/api/delivery-person/{id}/*`
   - `/api/delivery-orders/*`
   - `/api/payouts/delivery-person/{id}/*`

6. Preferred frontend rule:
   - use `/api/delivery-app/*` where available
   - use `/api/delivery-orders/*` only for order lists, statistics, and legacy OTP/location flows
   - use `/api/delivery-person/{id}/*` only as fallback/admin-style lookup

7. Authenticated APIs require:

```http
Authorization: Bearer <jwtToken>
```

8. Delivery login can still succeed even if admin approval is pending.
   The frontend must check:
   - `isApprovedByAdmin`
   - `approvalStatus`
   - `onboardingStatus`

9. Required documents depend on vehicle type:
   - `BIKE`, `SCOOTY`, `AUTO`, `HEAVY`:
     - `AADHAAR_FRONT`
     - `AADHAAR_BACK`
     - `PAN_CARD`
     - `DRIVING_LICENSE`
     - `RC_BOOK`
     - `INSURANCE` optional
   - `EV`:
     - `AADHAAR_FRONT`
     - `AADHAAR_BACK`
     - `PAN_CARD`
     - no RC
     - no insurance requirement

10. Locked-after-approval behavior exists.
    Some updates return `403` with `locked: true` after admin approval:
    - profile photo
    - vehicle details
    - bank details
    - approved documents

11. `/api/banks/*` exists in backend, but it is not explicitly public in `SecurityConfig`.
    That means signup-time bank search may return `401` unless backend security is updated.
    Current mobile app already uses a local fallback bank list.

## 3. Postman Environment Setup

Create a Postman environment with these variables:

```text
baseUrl = https://api.anushatechnologies.com
firebaseIdToken =
jwtToken =
deliveryPersonId =
phoneE164 = %2B919948598350
rawPhone = +919948598350
orderId =
orderNumber =
documentId =
bankQuery = union
```

For authenticated JSON APIs, use:

```http
Authorization: Bearer {{jwtToken}}
Content-Type: application/json
```

## 4. Delivery App Frontend Flow

### 4.1 New Delivery Partner Signup Flow

1. Verify mobile using Firebase OTP on device
2. Get Firebase ID token from the Firebase user session
3. Check whether partner already exists:

```http
GET {{baseUrl}}/api/delivery/auth/check-phone/{{phoneE164}}
```

4. If not registered:
   - optionally upload profile photo first
   - call signup
   - save `jwtToken`
   - save `deliveryPersonId`
   - save `approvalStatus`
   - save full onboarding status block
5. Update bank details
6. Upload required KYC documents
7. Poll `/api/delivery-app/status`
8. If approved:
   - allow go online
   - allow order acceptance
9. If pending:
   - keep user in dashboard or verification flow, but block `go online`

### 4.2 Existing Delivery Partner Login Flow

1. Verify mobile using Firebase OTP
2. Get Firebase ID token
3. Check phone
4. If exists:
   - call login
   - save `jwtToken`
   - save `deliveryPersonId`
   - read `message`, `approvalStatus`, `onboardingStatus`
5. Load:
   - status
   - dashboard
   - order lists
   - payouts

### 4.3 Delivery Execution Flow

Preferred flow for rider app:

1. `PUT /api/delivery-app/online-status`
2. `GET /api/delivery-app/available-orders`
3. `POST /api/delivery-app/orders/{orderId}/accept`
4. `POST /api/delivery-app/orders/{orderNumber}/arrived`
5. `POST /api/delivery-app/orders/{orderNumber}/picked-up`
6. While active:
   - `POST /api/delivery-app/location`
   - optionally `POST /api/delivery-orders/{orderNumber}/update-location`
7. Before final handoff:
   - `POST /api/delivery-app/orders/{orderNumber}/generate-delivery-otp`
8. Final proof-of-delivery:
   - `POST /api/delivery-app/orders/{orderNumber}/confirm-delivery` with `otp` and optional `photo`

Legacy/secondary completion flow also exists:

1. `POST /api/delivery-orders/verify-pickup-otp`
2. `POST /api/delivery-orders/confirm-pickup`
3. `POST /api/delivery-orders/verify-delivery-otp`
4. `POST /api/delivery-orders/confirm-delivery`

## 5. Auth APIs

### 5.1 Check Phone

Method:

```http
GET /api/delivery/auth/check-phone/{phoneNumber}
```

Auth: `Public`

Example:

```http
GET {{baseUrl}}/api/delivery/auth/check-phone/{{phoneE164}}
```

Success response if not registered:

```json
{
  "exists": false,
  "isApproved": false
}
```

Success response if registered:

```json
{
  "exists": true,
  "isApproved": true,
  "approvalStatus": "APPROVED"
}
```

### 5.2 Upload Profile Photo Before Signup

Method:

```http
POST /api/delivery/auth/upload-profile-photo
```

Auth: `Public`

Postman:
- Body
- `form-data`
- key `file` as type `File`

Example response:

```json
{
  "success": true,
  "photoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/abc.jpg",
  "message": "Profile photo uploaded. Pass 'photoUrl' as profilePhotoUrl in the signup request."
}
```

Common errors:

```json
{
  "error": "Photo file is required"
}
```

```json
{
  "error": "Only image files are allowed (JPEG, PNG, WEBP)"
}
```

```json
{
  "error": "File size must not exceed 5MB"
}
```

### 5.3 Signup

Method:

```http
POST /api/delivery/auth/signup
```

Auth: `Public`

Body:

```json
{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "firstName": "Venkatarao",
  "lastName": "Dama",
  "vehicleType": "BIKE",
  "vehicleModel": "Honda Shine",
  "registrationNumber": "AP07DW7277",
  "profilePhotoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/abc.jpg",
  "fcmToken": "optional-device-fcm-token"
}
```

Postman example:

```http
POST {{baseUrl}}/api/delivery/auth/signup
Content-Type: application/json

{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "firstName": "Venkatarao",
  "lastName": "Dama",
  "vehicleType": "BIKE",
  "vehicleModel": "Honda Shine",
  "registrationNumber": "AP07DW7277",
  "profilePhotoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/abc.jpg",
  "fcmToken": "optional-device-fcm-token"
}
```

Success response example:

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiJ9...",
  "deliveryPersonId": 15,
  "phoneNumber": "+919948598350",
  "firstName": "Venkatarao",
  "lastName": "Dama",
  "fullName": "Venkatarao Dama",
  "isApprovedByAdmin": false,
  "approvalStatus": "PENDING",
  "isVerified": true,
  "profilePhotoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/abc.jpg",
  "profilePhotoStatus": "PENDING",
  "profilePhotoLocked": false,
  "vehicleType": "BIKE",
  "vehicleModel": "Honda Shine",
  "registrationNumber": "AP07DW7277",
  "onboardingStatus": {
    "currentStep": "PROFILE_COMPLETED",
    "phoneVerified": true,
    "personalInfoCompleted": true,
    "vehicleCompleted": true
  },
  "message": "Registration successful. Please upload your documents and wait for admin approval."
}
```

Common errors:

```json
{
  "error": "First name is required"
}
```

```json
{
  "error": "Last name is required"
}
```

```json
{
  "error": "Phone number already registered as a delivery person. Please login."
}
```

```json
{
  "error": "Invalid or expired Firebase token"
}
```

### 5.4 Login

Method:

```http
POST /api/delivery/auth/login
```

Auth: `Public`

Body:

```json
{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "fcmToken": "optional-device-fcm-token"
}
```

Postman example:

```http
POST {{baseUrl}}/api/delivery/auth/login
Content-Type: application/json

{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "fcmToken": "optional-device-fcm-token"
}
```

Success response example:

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiJ9...",
  "deliveryPersonId": 15,
  "phoneNumber": "+919948598350",
  "firstName": "Venkatarao",
  "lastName": "Dama",
  "fullName": "Venkatarao Dama",
  "isApprovedByAdmin": false,
  "approvalStatus": "PENDING",
  "isVerified": true,
  "profilePhotoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/abc.jpg",
  "profilePhotoStatus": "APPROVED",
  "profilePhotoLocked": true,
  "vehicleType": "BIKE",
  "vehicleModel": "Honda Shine",
  "registrationNumber": "AP07DW7277",
  "onboardingStatus": {
    "currentStep": "KYC_UNDER_REVIEW",
    "readyForFinalApproval": true,
    "canGoOnline": false
  },
  "message": "Your account is pending admin approval. Please ensure all documents are uploaded."
}
```

Not-found response:

```json
{
  "error": "No delivery account found. Please register first."
}
```

### 5.5 Fare Rules

Method:

```http
GET /api/delivery/auth/fare-rules
```

Auth: `Public`

Example:

```http
GET {{baseUrl}}/api/delivery/auth/fare-rules
```

### 5.6 Fare Calculation

Method:

```http
POST /api/delivery/auth/fare/calculate
```

Auth: `Public`

Body:

```json
{
  "vehicleType": "BIKE",
  "distanceKm": 9.7
}
```

## 6. FCM Token API

### 6.1 Save FCM Token

Method:

```http
POST /api/save-token
```

Auth: `Public`

Body:

```json
{
  "phone": "{{rawPhone}}",
  "fcmToken": "your-device-fcm-token"
}
```

Response:

```json
{
  "success": true,
  "message": "Token saved successfully"
}
```

## 7. Bank APIs

### 7.1 Get All Banks

Method:

```http
GET /api/banks
```

Current backend note:
- route exists
- but not explicitly public in `SecurityConfig`
- may return `401` before login unless security is adjusted

Example:

```http
GET {{baseUrl}}/api/banks
```

Response:

```json
{
  "success": true,
  "banks": [
    {
      "id": 1,
      "name": "State Bank of India",
      "shortCode": "SBI",
      "ifscPrefix": "SBIN"
    }
  ]
}
```

### 7.2 Search Banks

Method:

```http
GET /api/banks/search?q=union
```

Example:

```http
GET {{baseUrl}}/api/banks/search?q={{bankQuery}}
```

Response:

```json
{
  "success": true,
  "banks": [
    {
      "id": 9,
      "name": "Union Bank of India",
      "shortCode": "UNION",
      "ifscPrefix": "UBIN"
    }
  ]
}
```

## 8. Document APIs

### 8.1 Get Validation Rules

Method:

```http
GET /api/documents/validation-rules
```

Auth: `Public`

Example:

```http
GET {{baseUrl}}/api/documents/validation-rules
```

Response example:

```json
{
  "success": true,
  "rules": {
    "panCard": {
      "format": "5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)",
      "regex": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
      "example": "ABCDE1234F"
    },
    "aadhaarCard": {
      "format": "12 digits",
      "regex": "^\\d{12}$",
      "example": "123456789012"
    },
    "drivingLicense": {
      "format": "10-16 uppercase letters and numbers",
      "regex": "^[A-Z0-9]{10,16}$",
      "example": "DL1234567890123"
    },
    "rcBook": {
      "format": "6-20 uppercase letters, numbers or hyphens",
      "regex": "^[A-Z0-9-]{6,20}$",
      "example": "TS09AB1234"
    },
    "insurance": {
      "format": "Optional. If provided: 6-30 uppercase letters, numbers or hyphens",
      "regex": "^[A-Z0-9-]{6,30}$",
      "example": "POLICY-123456"
    },
    "fileUpload": {
      "maxSize": "5MB",
      "allowedTypes": "image/jpeg, image/jpg, image/png, image/webp",
      "maxFiles": "1 per request"
    }
  }
}
```

### 8.2 Upload KYC Document

Method:

```http
POST /api/documents/upload
```

Auth: `Bearer JWT required`

Postman:
- Body
- `form-data`
- fields:
  - `deliveryPersonId`
  - `documentType`
  - `documentNumber` when applicable
  - `file` as type `File`

Allowed `documentType` values:
- `AADHAAR_FRONT`
- `AADHAAR_BACK`
- `PAN_CARD`
- `DRIVING_LICENSE`
- `RC_BOOK`
- `INSURANCE`

Example:

```http
POST {{baseUrl}}/api/documents/upload
Authorization: Bearer {{jwtToken}}
```

Form-data example:

```text
deliveryPersonId = {{deliveryPersonId}}
documentType = PAN_CARD
documentNumber = GRAPR0182K
file = [select image file]
```

Success response:

```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "document": {
    "id": 51,
    "documentType": "PAN_CARD",
    "documentNumber": "GRAPR0182K",
    "documentUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/pan/xyz.jpg",
    "fileName": "xyz.jpg",
    "status": "PENDING",
    "uploadedAt": "2026-04-09T13:10:00"
  },
  "uploadDetails": {
    "success": true,
    "url": "https://bucket.s3.region.amazonaws.com/delivery-boys/pan/xyz.jpg",
    "fileName": "xyz.jpg"
  }
}
```

Common errors:

```json
{
  "error": "Invalid document type"
}
```

```json
{
  "error": "Invalid document number format"
}
```

```json
{
  "error": "Cannot replace approved document",
  "locked": true
}
```

### 8.3 Get Document By ID

Method:

```http
GET /api/documents/{documentId}
```

Auth: `Bearer JWT required`

Important note:
- current backend returns only a placeholder success response
- do not rely on this route for real document detail loading

### 8.4 Delete Document

Method:

```http
DELETE /api/documents/{documentId}
```

Auth: `Bearer JWT required`

Important note:
- current backend returns only a placeholder success response
- treat this as not fully implemented

## 9. JWT-Based Delivery App APIs

All routes in this section require:

```http
Authorization: Bearer {{jwtToken}}
```

### 9.1 Get My Status

```http
GET {{baseUrl}}/api/delivery-app/status
```

Response contains:
- `deliveryPerson`
- `documents`
- `allDocumentsApproved`
- `completionStatus`
- `onboardingStatus`

Important `onboardingStatus` fields:
- `currentStep`
- `phoneVerified`
- `personalInfoCompleted`
- `vehicleCompleted`
- `bankCompleted`
- `profilePhotoUploaded`
- `profilePhotoApproved`
- `requiredDocumentsUploaded`
- `requiredDocumentsApproved`
- `requiredDocuments`
- `optionalDocuments`
- `missingRequiredDocuments`
- `missingApprovedDocuments`
- `documentChecklist`
- `readyForFinalApproval`
- `loginAllowed`
- `canGoOnline`
- `completionPercent`

### 9.2 Update Online Status

```http
PUT {{baseUrl}}/api/delivery-app/online-status
Content-Type: application/json

{
  "isOnline": true
}
```

Success response:

```json
{
  "success": true,
  "message": "Online status updated successfully",
  "isOnline": true
}
```

Blocked response if pending approval:

```json
{
  "success": false,
  "error": "You cannot go online until your account is approved by the admin. Please ensure all documents are uploaded and approved.",
  "approvalStatus": "PENDING"
}
```

### 9.3 Update Profile

```http
PUT {{baseUrl}}/api/delivery-app/profile
Content-Type: application/json

{
  "firstName": "Venkatarao",
  "lastName": "Dama",
  "profilePhotoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/new.jpg"
}
```

Locked response example:

```json
{
  "success": false,
  "error": "Profile photo is locked after approval",
  "locked": true
}
```

### 9.4 Upload Profile Photo After Signup

```http
POST {{baseUrl}}/api/delivery-app/profile-photo
Authorization: Bearer {{jwtToken}}
```

Postman:
- Body
- `form-data`
- key `file` as type `File`

Success response:

```json
{
  "success": true,
  "message": "Profile photo uploaded successfully. Awaiting admin approval.",
  "profilePhotoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/new.jpg",
  "profilePhotoStatus": "PENDING"
}
```

### 9.5 Get Dashboard

```http
GET {{baseUrl}}/api/delivery-app/dashboard
```

Response:

```json
{
  "success": true,
  "dashboard": {
    "totalEarnings": 0,
    "weeklyEarnings": 0,
    "totalCompletedOrders": 0,
    "weeklyCompletedOrders": 0,
    "isOnline": false,
    "isVerified": true,
    "isApprovedByAdmin": false,
    "vehicleType": "BIKE",
    "vehicleModel": "Honda Shine",
    "registrationNumber": "AP07DW7277"
  }
}
```

### 9.6 Update Vehicle

```http
PUT {{baseUrl}}/api/delivery-app/vehicle
Content-Type: application/json

{
  "vehicleType": "BIKE",
  "vehicleModel": "Honda Shine",
  "registrationNumber": "AP07DW7277"
}
```

Locked response example:

```json
{
  "success": false,
  "locked": true,
  "error": "Vehicle details are locked after admin approval. Contact support to make changes."
}
```

### 9.7 Update Bank Details

```http
PUT {{baseUrl}}/api/delivery-app/bank-details
Content-Type: application/json

{
  "accountName": "Venkatarao Dama",
  "accountNumber": "655774268996669",
  "bankName": "Union Bank of India",
  "ifscCode": "UBIN0809002"
}
```

Locked response example:

```json
{
  "success": false,
  "locked": true,
  "error": "Bank details are locked after admin approval. Contact support to make changes."
}
```

### 9.8 Get Delivery Person By Phone

```http
GET {{baseUrl}}/api/delivery-app/phone/{{phoneE164}}
```

Important note:
- controller comment suggests public/admin
- but current security config makes `/api/delivery-app/**` authenticated
- frontend should call this only after JWT login

### 9.9 Get My Payouts

```http
GET {{baseUrl}}/api/delivery-app/payouts
```

## 10. Primary Delivery Order APIs

These are the preferred rider-facing action endpoints.

### 10.1 GPS Ping

```http
POST {{baseUrl}}/api/delivery-app/location
Content-Type: application/json

{
  "lat": 17.385,
  "lng": 78.4867
}
```

### 10.2 Available Orders

```http
GET {{baseUrl}}/api/delivery-app/available-orders
```

Returns currently broadcasted orders:

```json
{
  "success": true,
  "orders": [
    {
      "id": 101,
      "orderNumber": "GRO-12345678",
      "status": "BROADCASTED_TO_RIDERS"
    }
  ]
}
```

### 10.3 Accept Order

```http
POST {{baseUrl}}/api/delivery-app/orders/{{orderId}}/accept
```

Response:

```json
{
  "success": true,
  "message": "Order accepted successfully",
  "order": {
    "id": 101,
    "orderNumber": "GRO-12345678"
  }
}
```

### 10.4 Mark Arrived At Store

```http
POST {{baseUrl}}/api/delivery-app/orders/{{orderNumber}}/arrived
```

### 10.5 Picked Up With OTP

```http
POST {{baseUrl}}/api/delivery-app/orders/{{orderNumber}}/picked-up
Content-Type: application/json

{
  "otp": "1234"
}
```

### 10.6 Generate Delivery OTP

```http
POST {{baseUrl}}/api/delivery-app/orders/{{orderNumber}}/generate-delivery-otp
```

Response:

```json
{
  "success": true,
  "message": "OTP sent to customer",
  "otp": "4321"
}
```

### 10.7 Confirm Delivery With Photo

```http
POST {{baseUrl}}/api/delivery-app/orders/{{orderNumber}}/confirm-delivery
Authorization: Bearer {{jwtToken}}
```

Postman form-data:

```text
otp = 4321
photo = [optional file]
```

Response:

```json
{
  "success": true,
  "message": "Order delivered successfully!",
  "orderNumber": "GRO-12345678",
  "deliveredAt": "2026-04-09T20:30:00",
  "photoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/delivery-photos/proof.jpg"
}
```

### 10.8 Legacy Final Delivery Shortcut

```http
POST {{baseUrl}}/api/delivery-app/orders/{{orderNumber}}/delivered
```

Use this only if your frontend is still on the older no-photo flow.

## 11. Legacy Delivery Order APIs

These routes still exist and are used by the current app service layer.

### 11.1 Get Orders By Delivery Person

```http
GET {{baseUrl}}/api/delivery-orders/delivery-person/{{deliveryPersonId}}
```

### 11.2 Get Active Orders

```http
GET {{baseUrl}}/api/delivery-orders/delivery-person/{{deliveryPersonId}}/active
```

### 11.3 Get Completed Orders

```http
GET {{baseUrl}}/api/delivery-orders/delivery-person/{{deliveryPersonId}}/completed
```

### 11.4 Get Recent Orders

```http
GET {{baseUrl}}/api/delivery-orders/delivery-person/{{deliveryPersonId}}/recent?limit=5
```

### 11.5 Get Statistics

```http
GET {{baseUrl}}/api/delivery-orders/delivery-person/{{deliveryPersonId}}/statistics
```

### 11.6 Get Order By Numeric ID

```http
GET {{baseUrl}}/api/delivery-orders/101
```

### 11.7 Get Order By Order Number

```http
GET {{baseUrl}}/api/delivery-orders/number/{{orderNumber}}
```

### 11.8 Accept Order By Order Number

```http
POST {{baseUrl}}/api/delivery-orders/{{orderNumber}}/accept
Content-Type: application/json

{
  "deliveryPersonId": {{deliveryPersonId}}
}
```

### 11.9 Reject Order

```http
POST {{baseUrl}}/api/delivery-orders/{{orderNumber}}/reject
Content-Type: application/json

{
  "deliveryPersonId": {{deliveryPersonId}},
  "reason": "Too far"
}
```

### 11.10 Verify Pickup OTP

```http
POST {{baseUrl}}/api/delivery-orders/verify-pickup-otp
Content-Type: application/json

{
  "orderNumber": "{{orderNumber}}",
  "otp": "1234"
}
```

### 11.11 Confirm Pickup

```http
POST {{baseUrl}}/api/delivery-orders/confirm-pickup
Content-Type: application/json

{
  "orderNumber": "{{orderNumber}}",
  "otp": "1234"
}
```

### 11.12 Verify Delivery OTP

```http
POST {{baseUrl}}/api/delivery-orders/verify-delivery-otp
Content-Type: application/json

{
  "orderNumber": "{{orderNumber}}",
  "otp": "4321"
}
```

### 11.13 Confirm Delivery

```http
POST {{baseUrl}}/api/delivery-orders/confirm-delivery
Content-Type: application/json

{
  "orderNumber": "{{orderNumber}}",
  "otp": "4321"
}
```

### 11.14 Update Live Active-Order Location

```http
POST {{baseUrl}}/api/delivery-orders/{{orderNumber}}/update-location
Content-Type: application/json

{
  "deliveryPersonId": {{deliveryPersonId}},
  "lat": 17.385,
  "lng": 78.4867
}
```

### 11.15 Cancel Order

```http
POST {{baseUrl}}/api/delivery-orders/{{orderId}}/cancel
Content-Type: application/json

{
  "reason": "Vehicle issue"
}
```

## 12. Legacy Delivery Person APIs

These are older ID-based profile endpoints.

### 12.1 Get Delivery Person By ID

```http
GET {{baseUrl}}/api/delivery-person/{{deliveryPersonId}}
```

### 12.2 Get Documents By ID

```http
GET {{baseUrl}}/api/delivery-person/{{deliveryPersonId}}/documents
```

### 12.3 Get Dashboard By ID

```http
GET {{baseUrl}}/api/delivery-person/{{deliveryPersonId}}/dashboard
```

### 12.4 Update Online Status By ID

```http
PUT {{baseUrl}}/api/delivery-person/{{deliveryPersonId}}/online-status
Content-Type: application/json

{
  "isOnline": true
}
```

### 12.5 Update Vehicle By ID

```http
PUT {{baseUrl}}/api/delivery-person/{{deliveryPersonId}}/vehicle
Content-Type: application/json

{
  "vehicleType": "BIKE",
  "vehicleModel": "Honda Shine",
  "registrationNumber": "AP07DW7277"
}
```

### 12.6 Update Profile By ID

```http
PUT {{baseUrl}}/api/delivery-person/{{deliveryPersonId}}/profile
Content-Type: application/json

{
  "firstName": "Venkatarao",
  "lastName": "Dama",
  "profilePhotoUrl": "https://bucket.s3.region.amazonaws.com/delivery-boys/profile-photos/new.jpg"
}
```

## 13. Payout APIs

### 13.1 Get My Payouts

Preferred app route:

```http
GET {{baseUrl}}/api/delivery-app/payouts
```

### 13.2 Get Payouts By Delivery Person ID

```http
GET {{baseUrl}}/api/payouts/delivery-person/{{deliveryPersonId}}
```

### 13.3 Get Recent Payouts

```http
GET {{baseUrl}}/api/payouts/delivery-person/{{deliveryPersonId}}/recent?limit=5
```

### 13.4 Get Total Paid

```http
GET {{baseUrl}}/api/payouts/delivery-person/{{deliveryPersonId}}/total-paid
```

Example response:

```json
{
  "success": true,
  "deliveryPersonId": 15,
  "totalPaidAmount": 2500.0
}
```

## 14. Important Onboarding Status Values

`currentStep` may be:

```text
ACCOUNT_CREATED
OTP_VERIFIED
PROFILE_COMPLETED
DOCUMENTS_UPLOADED
KYC_UNDER_REVIEW
REJECTED
APPROVED
```

Useful frontend interpretation:

- `ACCOUNT_CREATED`
  - account exists but OTP/profile flow incomplete
- `OTP_VERIFIED`
  - phone verified, personal details not complete
- `PROFILE_COMPLETED`
  - personal + vehicle done, remaining bank/docs pending
- `DOCUMENTS_UPLOADED`
  - required docs uploaded but not fully approved
- `KYC_UNDER_REVIEW`
  - ready for admin review
- `REJECTED`
  - one or more required items rejected
- `APPROVED`
  - full rider access

## 15. Current Backend Gaps / Quirks

1. No delivery refresh-token endpoint exists.
   Current mobile flow is backend JWT only.

2. Login can return success even when rider is still pending approval.
   Frontend must not assume login means full access.

3. `/api/delivery-app/phone/{phoneNumber}` is authenticated in current security config, even though controller comments imply broader use.

4. `/api/banks/*` exists but is not explicitly public in `SecurityConfig`.
   Signup-time bank search may need:
   - backend security update, or
   - frontend local fallback list

5. `GET /api/documents/{id}` and `DELETE /api/documents/{id}` are placeholder responses in current backend.

6. App code still mixes:
   - `/api/delivery-app/*`
   - `/api/delivery-orders/*`
   - `/api/delivery-person/{id}/*`
   So frontend integration should be cleaned gradually instead of assuming one single API family today.

7. Going online is backend-protected.
   Even if frontend shows the switch, backend returns `403` until admin approval is complete.

8. Approved profile photo, approved documents, approved bank details, and approved vehicle details can become locked for editing.

## 16. Minimum Frontend Integration Checklist

1. Use Firebase OTP on device
2. Send real Firebase ID token to backend auth
3. Save backend `jwtToken`
4. Save backend `deliveryPersonId`
5. Read `approvalStatus` and `onboardingStatus`
6. Upload bank details before final review
7. Upload docs based on vehicle type
8. Poll `/api/delivery-app/status`
9. Block `go online` until backend approval
10. Prefer `/api/delivery-app/*` for self-service flows
11. Use `/api/delivery-orders/*` for current list/statistics/live tracking compatibility
12. Use `/api/delivery-app/payouts` or fallback payout routes for payout history
