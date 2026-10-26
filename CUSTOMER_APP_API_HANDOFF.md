# Customer App API Handoff

Based on the current backend source in `Backend_Original` on April 9, 2026.

This file documents the current customer-facing API implementation for the frontend team.

## 1. Base URL

Production base URL:

```text
https://api.anushatechnologies.com
```

Example full URL:

```text
https://api.anushatechnologies.com/api/auth/login
```

## 2. Important Current Notes

1. OTP is not handled by backend for the customer mobile app.
   Phone OTP is handled in Firebase on the device. Backend only receives a verified Firebase ID token.

2. Do not send Firebase UID as `firebaseIdToken`.
   Correct `firebaseIdToken` is a real Firebase JWT, usually starting with `eyJ...`.

3. Current customer auth routes are:
   - `GET /api/auth/check-phone/{phoneNumber}`
   - `POST /api/auth/signup`
   - `POST /api/auth/login`

4. Do not use `/api/auth/app/...`.
   Some comments in backend are old. The actual current routes are under `/api/auth/...`.

5. There is no customer mobile refresh-token endpoint right now.
   Current flow is:
   - Firebase login on device
   - send Firebase ID token to backend
   - backend returns `jwtToken`
   - frontend stores backend JWT

6. Authenticated APIs require:

```http
Authorization: Bearer <jwtToken>
```

7. Phone numbers are safest in Firebase E.164 format:

```text
+919948598350
```

In URLs, encode the plus sign:

```text
%2B919948598350
```

## 3. Postman Setup

Create a Postman environment with these variables:

```text
baseUrl = https://api.anushatechnologies.com
jwtToken =
firebaseIdToken =
customerId =
addressId =
orderId =
orderNumber =
variantId =
itemId =
productId =
userMainId =
phoneE164 = %2B919948598350
```

Use this header for authenticated APIs:

```http
Authorization: Bearer {{jwtToken}}
Content-Type: application/json
```

## 4. Step-by-Step Frontend Flow

### 4.1 New User Signup Flow

1. Firebase phone auth on device
2. Get Firebase ID token from app
3. Check phone:

```http
GET {{baseUrl}}/api/auth/check-phone/{{phoneE164}}
```

4. If `exists=false`, call signup
5. Save:
   - `jwtToken`
   - `customerId`
   - `phoneNumber`
6. Optionally save FCM token again using `/api/save-token`
7. Load profile, cart, addresses, home data

### 4.2 Existing User Login Flow

1. Firebase phone auth on device
2. Get Firebase ID token
3. Check phone
4. If `exists=true`, call login
5. Save:
   - `jwtToken`
   - `customerId`
   - `phoneNumber`
6. Load profile, cart, addresses, orders

### 4.3 Order Placement Flow

1. Login/signup
2. Load stores/categories/products
3. Add cart items by `variantId`
4. Create/select address
5. Place order
6. If payment method is `ONLINE`, call payment initiate
7. Complete Razorpay checkout
8. Call payment verify
9. Use tracking API or Firebase RTDB tracking path

## 5. Auth APIs

### 5.1 Check Phone

Method:

```http
GET /api/auth/check-phone/{phoneNumber}
```

Auth: `Public`

Example:

```http
GET {{baseUrl}}/api/auth/check-phone/{{phoneE164}}
```

Example response:

```json
{
  "exists": true
}
```

### 5.2 Signup

Method:

```http
POST /api/auth/signup
```

Auth: `Public`

Body:

```json
{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "name": "Anusha Customer",
  "email": "anusha@example.com",
  "fcmToken": "your-fcm-token-optional"
}
```

Postman example:

```http
POST {{baseUrl}}/api/auth/signup
Content-Type: application/json

{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "name": "Anusha Customer",
  "email": "anusha@example.com",
  "fcmToken": "your-fcm-token-optional"
}
```

Success response:

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiJ9...",
  "customerId": 12,
  "phoneNumber": "+919948598350",
  "name": "Anusha Customer",
  "email": "anusha@example.com",
  "roles": null
}
```

Common errors:

```json
{
  "error": "Account already exists. Please login."
}
```

```json
{
  "error": "Invalid or expired Firebase token"
}
```

### 5.3 Login

Method:

```http
POST /api/auth/login
```

Auth: `Public`

Body:

```json
{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "fcmToken": "your-fcm-token-optional"
}
```

Postman example:

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "firebaseIdToken": "{{firebaseIdToken}}",
  "fcmToken": "your-fcm-token-optional"
}
```

Success response:

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiJ9...",
  "customerId": 12,
  "phoneNumber": "+919948598350",
  "name": "Anusha Customer",
  "email": "anusha@example.com",
  "roles": null
}
```

Not found response:

```json
{
  "error": "No account found. Please sign up as a new user."
}
```

## 6. Public Browse APIs

### 6.1 Get Customer Banners

```http
GET {{baseUrl}}/api/customer/banners
```

Auth: `Public`

Response shape:

```json
{
  "success": true,
  "banners": [
    {
      "id": 1,
      "name": "Offer Banner",
      "imageUrl": "https://...",
      "videoUrl": null,
      "targetUrl": null,
      "actionType": "CATEGORY",
      "actionValue": "3",
      "isActive": true,
      "displayOrder": 1,
      "createdAt": "2026-04-09T09:00:00"
    }
  ]
}
```

### 6.2 Get Policy

```http
GET {{baseUrl}}/api/policies/PRIVACY_POLICY
```

Other likely values:
- `TERMS_CONDITIONS`
- `RETURNS_REFUNDS`

Response:

```json
{
  "success": true,
  "policy": {
    "id": 1,
    "type": "PRIVACY_POLICY",
    "content": "<html or text>",
    "updatedAt": "2026-04-08T18:00:00"
  }
}
```

### 6.3 Get Categories

```http
GET {{baseUrl}}/api/categories
```

### 6.4 Get Category By ID

```http
GET {{baseUrl}}/api/categories/1
```

### 6.5 Search Categories

```http
GET {{baseUrl}}/api/categories/search?keyword=grocery
```

### 6.6 Filter Categories By Discount

```http
GET {{baseUrl}}/api/categories/filter/discount?minDiscount=10
```

Category response item:

```json
{
  "id": 1,
  "name": "Groceries",
  "description": "Daily essentials",
  "isActive": true,
  "displayOrder": 1,
  "discount": 10,
  "imageUrl": "https://...",
  "videoUrl": null,
  "createdAt": "2026-04-01T10:00:00",
  "updatedAt": "2026-04-08T10:00:00"
}
```

### 6.7 Get Subcategories

```http
GET {{baseUrl}}/api/subcategories
```

### 6.8 Get Subcategories By Category

```http
GET {{baseUrl}}/api/subcategories/1
```

### 6.9 Get Subcategory Detail

```http
GET {{baseUrl}}/api/subcategories/detail/1
```

Subcategory response item:

```json
{
  "id": 5,
  "name": "Fruits",
  "description": "Fresh fruits",
  "isActive": true,
  "displayOrder": 1,
  "discount": 5,
  "categoryId": 1,
  "categoryName": "Groceries",
  "imageUrl": "https://...",
  "videoUrl": null,
  "createdAt": "2026-04-01T10:00:00",
  "updatedAt": "2026-04-08T10:00:00"
}
```

### 6.10 Get Stores

```http
GET {{baseUrl}}/api/stores
```

Optional query params:
- `name`
- `page`
- `size`
- `sort`

Example:

```http
GET {{baseUrl}}/api/stores?name=anusha&page=0&size=10&sort=displayOrder,asc
```

Response is a Spring `Page<StoreResponse>` object, for example:

```json
{
  "content": [
    {
      "id": 1,
      "name": "Anusha Mart",
      "label": "Popular",
      "displayOrder": 1,
      "active": true,
      "imageUrl": "https://...",
      "address": "Main road",
      "city": "Hyderabad",
      "pincode": "500001",
      "phoneNumber": "9876543210",
      "priceRange": "₹₹",
      "timings": "9 AM - 9 PM",
      "announcement": "Free delivery",
      "delivery": "30 mins",
      "packageCost": "10",
      "rating": 4.5,
      "preferredOrder": 1,
      "createdAt": "2026-04-01T10:00:00",
      "updatedAt": "2026-04-08T10:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0,
  "size": 10
}
```

### 6.11 Get Store By ID

```http
GET {{baseUrl}}/api/stores/1
```

### 6.12 Suggest Stores

```http
GET {{baseUrl}}/api/stores/suggest?q=anu
```

### 6.13 Get Products

```http
GET {{baseUrl}}/api/products
```

Optional query param:
- `storeId`

Example:

```http
GET {{baseUrl}}/api/products?storeId=1
```

### 6.14 Search Products

```http
GET {{baseUrl}}/api/products/search?keyword=milk
```

### 6.15 Trending Products

```http
GET {{baseUrl}}/api/products/trending
```

### 6.16 Bestseller Products

```http
GET {{baseUrl}}/api/products/bestseller
```

### 6.17 Filter Products

Example:

```http
GET {{baseUrl}}/api/products/filter?categoryId=1&subCategoryId=5&storeId=1&minPrice=10&maxPrice=500&trending=true&keyword=milk
```

All supported query params:
- `categoryId`
- `subCategoryId`
- `storeId`
- `minPrice`
- `maxPrice`
- `trending`
- `keyword`

### 6.18 Get Product By ID

```http
GET {{baseUrl}}/api/products/10
```

### 6.19 Get Product Images

```http
GET {{baseUrl}}/api/products/10/images
```

Product response item:

```json
{
  "id": 10,
  "name": "Toned Milk",
  "description": "Fresh milk",
  "isActive": true,
  "isTrending": true,
  "bestSeller": false,
  "displayOrder": 1,
  "imageUrl": "https://...",
  "videoUrl": null,
  "categoryId": 1,
  "categoryName": "Groceries",
  "subCategoryId": 5,
  "subCategoryName": "Dairy",
  "storeId": 1,
  "storeName": "Anusha Mart",
  "images": [
    {
      "id": 100,
      "imageUrl": "https://...",
      "displayOrder": 1,
      "createdAt": "2026-04-08T10:00:00"
    }
  ],
  "variants": [
    {
      "id": 501,
      "name": "500 ml",
      "sku": "MILK-500",
      "price": 30,
      "discountPrice": 28,
      "stock": 40,
      "isActive": true,
      "displayOrder": 1
    }
  ],
  "minPrice": 28,
  "maxPrice": 55
}
```

## 7. Profile APIs

All APIs below require:

```http
Authorization: Bearer {{jwtToken}}
```

### 7.1 Get Profile

```http
GET {{baseUrl}}/api/customer/profile
Authorization: Bearer {{jwtToken}}
```

Response:

```json
{
  "id": 12,
  "name": "Anusha Customer",
  "phoneNumber": "+919948598350",
  "email": "anusha@example.com",
  "isActive": true,
  "createdAt": "2026-04-09T10:00:00",
  "updatedAt": "2026-04-09T10:30:00"
}
```

### 7.2 Update Profile

```http
PUT {{baseUrl}}/api/customer/profile
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "name": "Updated Customer",
  "email": "updated@example.com"
}
```

## 8. Address APIs

### 8.1 Get Addresses

```http
GET {{baseUrl}}/api/addresses
Authorization: Bearer {{jwtToken}}
```

### 8.2 Add Address

```http
POST {{baseUrl}}/api/addresses
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "addressType": "HOME",
  "flatNumber": "Flat 201",
  "addressLine1": "Green Residency",
  "addressLine2": "Near temple",
  "landmark": "Opposite bus stop",
  "city": "Hyderabad",
  "state": "Telangana",
  "postalCode": "500001",
  "latitude": 17.385,
  "longitude": 78.4867,
  "isDefault": true
}
```

### 8.3 Update Address

```http
PUT {{baseUrl}}/api/addresses/{{addressId}}
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "addressType": "WORK",
  "flatNumber": "Floor 3",
  "addressLine1": "Office Tower 5",
  "addressLine2": "Hitech City",
  "landmark": "Near metro",
  "city": "Hyderabad",
  "state": "Telangana",
  "postalCode": "500081",
  "latitude": 17.441,
  "longitude": 78.381,
  "isDefault": false
}
```

### 8.4 Delete Address

```http
DELETE {{baseUrl}}/api/addresses/{{addressId}}
Authorization: Bearer {{jwtToken}}
```

## 9. Cart APIs

### 9.1 Get Cart

```http
GET {{baseUrl}}/api/cart
Authorization: Bearer {{jwtToken}}
```

Response:

```json
{
  "cartId": 9,
  "items": [
    {
      "id": 20,
      "variantId": 501,
      "variantName": "500 ml",
      "productId": 10,
      "productName": "Toned Milk",
      "productImage": "https://...",
      "quantity": 2,
      "unitPrice": 28,
      "totalPrice": 56
    }
  ],
  "subtotal": 56,
  "estimatedDeliveryCharge": 25,
  "grandTotal": 81
}
```

### 9.2 Add Item To Cart

Important: backend expects `variantId`, not `productId`.

```http
POST {{baseUrl}}/api/cart/items
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "variantId": {{variantId}},
  "quantity": 2
}
```

### 9.3 Update Cart Item Quantity

```http
PUT {{baseUrl}}/api/cart/items/{{itemId}}?quantity=3
Authorization: Bearer {{jwtToken}}
```

### 9.4 Remove Cart Item

```http
DELETE {{baseUrl}}/api/cart/items/{{itemId}}
Authorization: Bearer {{jwtToken}}
```

### 9.5 Clear Cart

```http
DELETE {{baseUrl}}/api/cart
Authorization: Bearer {{jwtToken}}
```

### 9.6 Merge Guest Cart

```http
POST {{baseUrl}}/api/cart/merge
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

[
  {
    "variantId": 501,
    "quantity": 2
  },
  {
    "variantId": 502,
    "quantity": 1
  }
]
```

## 10. Coupon API

### 10.1 Apply Coupon

Current implementation requires `customerId` as query param even though endpoint is authenticated.

```http
GET {{baseUrl}}/api/coupons/apply?code=WELCOME10&customerId={{customerId}}&cartValue=500
Authorization: Bearer {{jwtToken}}
```

Success response:

```json
{
  "success": true,
  "code": "WELCOME10",
  "discount": 50,
  "finalValue": 450
}
```

Error response:

```json
{
  "success": false,
  "error": "Coupon expired"
}
```

## 11. Wishlist and Rating APIs

### 11.1 Add To Wishlist

```http
POST {{baseUrl}}/api/customer/products/wishlist
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "productId": {{productId}}
}
```

### 11.2 Merge Wishlist

```http
POST {{baseUrl}}/api/customer/products/wishlist/merge
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "productIds": [10, 11, 12]
}
```

### 11.3 Remove From Wishlist

```http
DELETE {{baseUrl}}/api/customer/products/wishlist?productId={{productId}}
Authorization: Bearer {{jwtToken}}
```

### 11.4 Get My Wishlist

```http
GET {{baseUrl}}/api/customer/products/wishlist
Authorization: Bearer {{jwtToken}}
```

Returns an array of `ProductResponse`.

### 11.5 Get Wishlist Compat

```http
GET {{baseUrl}}/api/customer/products/wishlist/{{customerId}}
Authorization: Bearer {{jwtToken}}
```

### 11.6 Submit Rating

```http
POST {{baseUrl}}/api/customer/products/rating
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "productId": {{productId}},
  "rating": 5,
  "comment": "Very good product"
}
```

### 11.7 Get Product Ratings

```http
GET {{baseUrl}}/api/customer/products/{{productId}}/ratings
Authorization: Bearer {{jwtToken}}
```

Response:

```json
{
  "success": true,
  "ratings": [
    {
      "id": 1,
      "rating": 5,
      "comment": "Very good product"
    }
  ]
}
```

### 11.8 Get Product Ratings Compat

```http
GET {{baseUrl}}/api/customer/products/rating/{{productId}}
Authorization: Bearer {{jwtToken}}
```

## 12. Order APIs

### 12.1 Place Order

Backend currently places order from the logged-in user’s cart.

```http
POST {{baseUrl}}/api/orders
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "addressId": {{addressId}},
  "paymentMethod": "COD"
}
```

Possible `paymentMethod` values seen in code/comments:
- `COD`
- `ONLINE`

Order response:

```json
{
  "id": 100,
  "orderId": 100,
  "orderNumber": "GRO-12345678",
  "subtotal": 250,
  "deliveryCharge": 25,
  "tax": 0,
  "discount": 20,
  "grandTotal": 255,
  "paymentMethod": "COD",
  "orderStatus": "PLACED",
  "status": "PLACED",
  "paymentStatus": "PENDING",
  "placedAt": "2026-04-09T20:00:00",
  "createdAt": "2026-04-09T20:00:00",
  "address": {
    "id": 5,
    "addressType": "HOME",
    "flatNumber": "Flat 201",
    "addressLine1": "Green Residency",
    "addressLine2": "Near temple",
    "landmark": "Opposite bus stop",
    "city": "Hyderabad",
    "state": "Telangana",
    "postalCode": "500001"
  },
  "items": [
    {
      "id": 301,
      "productId": 10,
      "variantId": 501,
      "productName": "Toned Milk",
      "variantName": "500 ml",
      "sku": "MILK-500",
      "quantity": 2,
      "unitPrice": 28,
      "totalPrice": 56,
      "imageUrl": "https://..."
    }
  ]
}
```

### 12.2 Get My Orders

```http
GET {{baseUrl}}/api/orders
Authorization: Bearer {{jwtToken}}
```

### 12.3 Get Recent Ordered Products

```http
GET {{baseUrl}}/api/orders/recent-products
Authorization: Bearer {{jwtToken}}
```

Returns an array of `ProductResponse`.

### 12.4 Get Order By ID

```http
GET {{baseUrl}}/api/orders/{{orderId}}
Authorization: Bearer {{jwtToken}}
```

### 12.5 Cancel Order

```http
PATCH {{baseUrl}}/api/orders/{{orderId}}/cancel
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

Body is optional. Backend accepts empty body too.

## 13. Tracking API

### 13.1 Get Order Tracking

```http
GET {{baseUrl}}/api/tracking/{{orderNumber}}
Authorization: Bearer {{jwtToken}}
```

Live response example:

```json
{
  "orderNumber": "GRO-12345678",
  "status": "EN_ROUTE_TO_CUSTOMER",
  "deliveryPersonName": "Ravi Kumar",
  "deliveryPersonPhone": "+919876543210",
  "lat": 19.076,
  "lng": 72.8777,
  "updatedAt": "2026-04-09T20:15:00",
  "isLive": true
}
```

Fallback response example:

```json
{
  "orderNumber": "GRO-12345678",
  "status": "DELIVERED",
  "isLive": false,
  "message": "Order has been delivered. Enjoy!"
}
```

Important:
Backend comment says the customer app should preferably listen directly to Firebase RTDB path:

```text
tracking/{orderNumber}
```

This REST API is the fallback option.
The live tracking payload can include `deliveryPersonPhone` when a rider is assigned.

## 14. Payment APIs

### 14.1 Initiate Razorpay Payment

Use this only after placing an order with `paymentMethod = ONLINE`.

```http
POST {{baseUrl}}/api/payment/initiate
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "orderId": {{orderId}}
}
```

Success response:

```json
{
  "razorpayOrderId": "order_Q1ABCDEF123456",
  "amount": 25500,
  "currency": "INR",
  "receipt": "TXN-12345678",
  "keyId": "rzp_test_xxxxx"
}
```

### 14.2 Verify Razorpay Payment

After successful Razorpay checkout on frontend:

```http
POST {{baseUrl}}/api/payment/verify
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "razorpayOrderId": "order_Q1ABCDEF123456",
  "razorpayPaymentId": "pay_Q1ABCDE123456",
  "razorpaySignature": "generated-signature",
  "receipt": "TXN-12345678"
}
```

Success response:

```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### 14.3 Request Razorpay Refund

Use this only for an already cancelled/rejected online order. Normal customer cancellation should first call `PATCH /api/orders/{{orderId}}/cancel`; backend automatically tries Razorpay refund for paid online orders.

```http
POST {{baseUrl}}/api/payment/refund/request
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "orderId": {{orderId}},
  "reason": "Customer cancelled order"
}
```

Optional partial refund:

```json
{
  "orderId": 3001,
  "amount": 100.00,
  "reason": "Partial refund approved"
}
```

Success response:

```json
{
  "success": true,
  "orderId": 3001,
  "orderNumber": "AB1234567890",
  "paymentMethod": "ONLINE",
  "paymentStatus": "REFUNDED",
  "refundStatus": "PROCESSED",
  "refundId": "rfnd_XXXXXXXXXXXX",
  "refundAmount": 485.00,
  "refundReason": "Customer cancelled order",
  "refundedAt": "2026-04-21T12:00:00",
  "message": "Refund processed successfully"
}
```

### 14.4 Get Refund Status

```http
GET {{baseUrl}}/api/payment/refund-status/{{orderId}}
Authorization: Bearer {{jwtToken}}
```

Success response:

```json
{
  "success": true,
  "orderId": 3001,
  "orderNumber": "AB1234567890",
  "paymentMethod": "ONLINE",
  "paymentStatus": "REFUNDED",
  "refundStatus": "PROCESSED",
  "refundId": "rfnd_XXXXXXXXXXXX",
  "refundAmount": 485.00,
  "refundReason": "Customer cancelled order",
  "refundedAt": "2026-04-21T12:00:00",
  "message": "Refund status fetched"
}
```

Refund status values:

- `NOT_REQUESTED` - no Razorpay refund has been created yet
- `PENDING` - Razorpay accepted refund, processing is pending
- `PROCESSED` - refund processed by Razorpay
- `FAILED` - refund failed; show support/admin review message

## 15. FCM Token API

### 15.1 Save FCM Token

This route is public.

```http
POST {{baseUrl}}/api/save-token
Content-Type: application/json

{
  "phone": "+919948598350",
  "fcmToken": "your-device-fcm-token"
}
```

Success response:

```json
{
  "success": true,
  "message": "Token saved successfully"
}
```

Note:
You can also pass `fcmToken` in signup/login request body. This route is useful for token refresh on app startup.

## 16. Wallet APIs

These routes are authenticated, but they also require `userMainId`.

### 16.1 Add Money

```http
POST {{baseUrl}}/api/wallet/add
Authorization: Bearer {{jwtToken}}
Content-Type: application/json

{
  "userMainId": {{userMainId}},
  "amount": 100,
  "description": "Wallet topup"
}
```

### 16.2 Get Wallet Balance

```http
GET {{baseUrl}}/api/wallet/balance/{{userMainId}}
Authorization: Bearer {{jwtToken}}
```

### 16.3 Get Wallet History

```http
GET {{baseUrl}}/api/wallet/history/{{userMainId}}
Authorization: Bearer {{jwtToken}}
```

Important gap:
Current customer auth/profile responses do not expose `userMainId`, so frontend cannot reliably call wallet APIs unless:
- backend adds `userMainId` to auth/profile response, or
- frontend gets it from another source

## 17. Current Backend Gaps / Quirks For Frontend Team

1. No customer refresh-token endpoint exists.
   Current mobile auth is backend JWT only.

2. `check-phone` should use Firebase-style phone number with country code where possible.

3. Coupon API requires `customerId` in query even though the route is authenticated.

4. Wallet APIs require `userMainId`, but current auth/profile responses do not return it.

5. Product add-to-cart uses `variantId`, not `productId`.

6. Tracking is better via Firebase RTDB for real-time updates.

7. `/api/save-token` is public and can be used after auth, or whenever FCM token rotates.

## 18. Minimum Frontend Integration Checklist

1. Use Firebase OTP on device
2. Send real Firebase ID token to backend auth
3. Save backend `jwtToken`
4. Save backend `customerId`
5. Use `Authorization: Bearer <jwtToken>` for secured routes
6. Use `variantId` for cart
7. Use `addressId` for order placement
8. Use `orderId` for payment initiate
9. Use `orderNumber` for tracking
10. Use `customerId` for coupon apply
