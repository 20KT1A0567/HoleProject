# Customer App API Handoff - GST and Invoice

Base URL examples:

- Local: `http://localhost:9000/api`
- Production: use the deployed backend API host, then append `/api`

Authenticated customer APIs require:

```http
Authorization: Bearer <accessToken>
Accept: application/json
Content-Type: application/json
```

## GST Rules Implemented

- Product master has `hsnCode` and `gstRate`.
- Product prices are treated as GST inclusive, like quick-commerce invoices.
- On order placement, GST is snapshotted on each `orderItem`.
- If customer delivery state is `Telangana` or empty, tax splits as `CGST + SGST`.
- If customer delivery state is outside Telangana, tax uses `IGST`.
- Seller shown on invoice:
  - Seller: `ANUSHA BAZAAR`
  - GSTIN: `36AIJPN3614J1Z4`
  - Address: `Manjeera Trinity 501, Manjeera Trinity Corporate, eSeva Ln, Kukatpally Housing Board Colony, K P H B Phase 3, Kukatpally, Hyderabad, Telangana 500072`

## Admin Product GST Fields

Admin panel product create/update now sends these extra fields inside the `product` JSON part:

```json
{
  "name": "Aashirvaad Atta",
  "description": "Whole wheat atta",
  "isActive": true,
  "isTrending": false,
  "bestSeller": true,
  "displayOrder": 1,
  "hsnCode": "11010000",
  "gstRate": 5,
  "categoryId": 1,
  "subCategoryId": 2,
  "storeId": 1,
  "variants": [
    {
      "name": "5 kg",
      "sku": "ATTA-5KG",
      "price": 299,
      "discountPrice": 279,
      "stock": 50,
      "isActive": true,
      "displayOrder": 1
    }
  ]
}
```

Admin endpoints:

- `POST /api/products` multipart form-data
- `PUT /api/products/{productId}` multipart form-data

Multipart keys:

- `product`: JSON blob/string
- `image`: required for create
- `video`: optional

## Customer Auth

### Check Phone

```http
GET /api/auth/check-phone/919876543210
```

Response:

```json
{
  "exists": true
}
```

### Signup

```http
POST /api/auth/signup
```

Request:

```json
{
  "firebaseIdToken": "FIREBASE_ID_TOKEN",
  "name": "Sravan Kumar",
  "email": "sravan@example.com",
  "fcmToken": "optional-fcm-token"
}
```

Response:

```json
{
  "accessToken": "JWT_ACCESS_TOKEN",
  "jwtToken": "JWT_ACCESS_TOKEN",
  "refreshToken": "REFRESH_TOKEN",
  "expiresIn": 900,
  "customerId": 12,
  "phoneNumber": "+919876543210",
  "name": "Sravan Kumar",
  "email": "sravan@example.com",
  "walletBalance": 0,
  "roles": "CUSTOMER"
}
```

### Login

```http
POST /api/auth/login
```

Request:

```json
{
  "firebaseIdToken": "FIREBASE_ID_TOKEN",
  "fcmToken": "optional-fcm-token"
}
```

Use `accessToken` from the response for all protected APIs.

### Refresh Token

```http
POST /api/auth/refresh
```

Request:

```json
{
  "refreshToken": "REFRESH_TOKEN"
}
```

## Catalog APIs

### List Products

```http
GET /api/products?full=true
```

Response item example:

```json
{
  "id": 101,
  "name": "Aashirvaad Atta",
  "description": "Whole wheat atta",
  "imageUrl": "https://...",
  "categoryId": 1,
  "categoryName": "Grocery",
  "subCategoryId": 2,
  "subCategoryName": "Atta",
  "storeId": 1,
  "storeName": "Anusha Bazaar",
  "hsnCode": "11010000",
  "gstRate": 5.00,
  "minPrice": 279,
  "maxPrice": 279,
  "variants": [
    {
      "id": 501,
      "name": "5 kg",
      "sku": "ATTA-5KG",
      "price": 299,
      "discountPrice": 279,
      "stock": 50,
      "isActive": true,
      "displayOrder": 1
    }
  ]
}
```

### Filter Products

```http
GET /api/products/filter?categoryId=1&subCategoryId=2&storeId=1&keyword=atta
```

### Product Details

```http
GET /api/products/101
```

## Address APIs

### Create Address

```http
POST /api/addresses
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "addressType": "HOME",
  "flatNumber": "102",
  "addressLine1": "Balaji Deluxe Boys Hostel PG",
  "addressLine2": "Road No. 4",
  "landmark": "Near Avenue Hospital",
  "city": "Hyderabad",
  "state": "Telangana",
  "postalCode": "500072",
  "latitude": 17.4933,
  "longitude": 78.3996,
  "isDefault": true,
  "contactName": "Sravan Kumar",
  "contactPhone": "9876543210"
}
```

Response contains the saved `id`; use that `id` while placing order.

### List Addresses

```http
GET /api/addresses
Authorization: Bearer <accessToken>
```

## Cart APIs

### Merge Guest Cart After Login

```http
POST /api/cart/merge
Authorization: Bearer <accessToken>
```

Request:

```json
[
  {
    "variantId": 501,
    "quantity": 2
  }
]
```

Response:

```json
{
  "cartId": 77,
  "items": [
    {
      "id": 9001,
      "variantId": 501,
      "variantName": "5 kg",
      "productId": 101,
      "productName": "Aashirvaad Atta",
      "productImage": "https://...",
      "quantity": 2,
      "unitPrice": 279.00,
      "totalPrice": 558.00,
      "freeItem": false
    }
  ],
  "freeItems": [],
  "subtotal": 558.00,
  "estimatedDeliveryCharge": 30.00,
  "deliveryCharge": 30.00,
  "platformFee": 2.00,
  "grandTotal": 590.00
}
```

### Add Cart Item

```http
POST /api/cart/items
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "variantId": 501,
  "quantity": 1
}
```

### Update Cart Item Quantity

```http
PUT /api/cart/items/9001?quantity=3
Authorization: Bearer <accessToken>
```

### Clear Cart

```http
DELETE /api/cart
Authorization: Bearer <accessToken>
```

## Checkout Settings

```http
GET /api/checkout-settings
```

Response:

```json
{
  "success": true,
  "settings": {
    "deliveryCharge": 30,
    "platformFee": 2,
    "handlingCharge": 0,
    "smallCartFee": 20,
    "smallCartThreshold": 199,
    "onlinePaymentEnabled": true,
    "cashOnDeliveryEnabled": true
  }
}
```

## Order APIs

### Place COD Order

```http
POST /api/orders
Authorization: Bearer <accessToken>
Idempotency-Key: checkout-<uuid>
```

Request:

```json
{
  "addressId": 10,
  "paymentMethod": "COD",
  "couponCode": "SAVE20"
}
```

### Place Online Order

```json
{
  "addressId": 10,
  "paymentMethod": "ONLINE"
}
```

Supported `paymentMethod` values:

- `COD`
- `ONLINE`
- `WALLET`
- `COD_WALLET`
- `ONLINE_WALLET`

Partial wallet example:

```json
{
  "addressId": 10,
  "paymentMethod": "ONLINE_WALLET",
  "walletAmount": 100
}
```

### Order Response With GST Invoice Fields

```json
{
  "id": 123,
  "orderId": 123,
  "orderNumber": "AB12CD34EF56",
  "sellerName": "ANUSHA BAZAAR",
  "sellerGstin": "36AIJPN3614J1Z4",
  "sellerAddress": "Manjeera Trinity 501, Manjeera Trinity Corporate, eSeva Ln, Kukatpally Housing Board Colony, K P H B Phase 3, Kukatpally, Hyderabad, Telangana 500072",
  "sellerState": "Telangana",
  "sellerStateCode": "36",
  "placeOfSupply": "Telangana",
  "placeOfSupplyCode": "36",
  "reverseCharge": false,
  "subtotal": 558.00,
  "taxableAmount": 531.42,
  "tax": 26.58,
  "cgstAmount": 13.29,
  "sgstAmount": 13.29,
  "igstAmount": 0.00,
  "deliveryCharge": 30.00,
  "platformFee": 2.00,
  "smallCartFee": 0.00,
  "discount": 0.00,
  "grandTotal": 590.00,
  "paymentMethod": "COD",
  "paymentStatus": "pending",
  "orderStatus": "PLACED",
  "placedAt": "2026-04-30T10:30:00",
  "address": {
    "id": 10,
    "flatNumber": "102",
    "addressLine1": "Balaji Deluxe Boys Hostel PG",
    "city": "Hyderabad",
    "state": "Telangana",
    "postalCode": "500072"
  },
  "items": [
    {
      "id": 7001,
      "productId": 101,
      "variantId": 501,
      "productName": "Aashirvaad Atta",
      "variantName": "5 kg",
      "sku": "ATTA-5KG",
      "quantity": 2,
      "unitPrice": 279.00,
      "totalPrice": 558.00,
      "hsnCode": "11010000",
      "gstRate": 5.00,
      "taxableAmount": 531.42,
      "cgstRate": 2.50,
      "sgstRate": 2.50,
      "igstRate": 0.00,
      "cgstAmount": 13.29,
      "sgstAmount": 13.29,
      "igstAmount": 0.00,
      "totalTaxAmount": 26.58,
      "imageUrl": "https://...",
      "storeName": "Anusha Bazaar"
    }
  ]
}
```

Frontend invoice display should use the order response directly. Do not recalculate GST on the frontend.

### List My Orders

```http
GET /api/orders
Authorization: Bearer <accessToken>
```

### Get One Order / Invoice

```http
GET /api/orders/123
Authorization: Bearer <accessToken>
```

Use this endpoint for:

- Order details screen
- Invoice download/print
- Tax summary

## Online Payment Flow

### 1. Place order with `ONLINE`

```http
POST /api/orders
```

Request:

```json
{
  "addressId": 10,
  "paymentMethod": "ONLINE"
}
```

### 2. Initiate Razorpay

```http
POST /api/payment/initiate
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "orderId": 123
}
```

Response:

```json
{
  "razorpayOrderId": "order_Pabc123",
  "amount": 59000,
  "currency": "INR",
  "receipt": "AB12CD34EF56",
  "keyId": "rzp_live_xxxxx"
}
```

### 3. Verify Razorpay Success

```http
POST /api/payment/verify
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "razorpayOrderId": "order_Pabc123",
  "razorpayPaymentId": "pay_Pabc456",
  "razorpaySignature": "signature_from_razorpay",
  "receipt": "AB12CD34EF56"
}
```

Response:

```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

## Refund APIs

### Customer Refund Request

```http
POST /api/payment/refund/request
Authorization: Bearer <accessToken>
```

Request:

```json
{
  "orderId": 123,
  "amount": 590,
  "reason": "Customer requested cancellation"
}
```

### Refund Status

```http
GET /api/payment/refund-status/123
Authorization: Bearer <accessToken>
```

## Recommended Customer App Invoice UI

Show these sections:

- Seller: `sellerName`, `sellerGstin`, `sellerAddress`
- Invoice metadata: `orderNumber`, `placedAt`, `placeOfSupply`
- Bill To / Ship To: `address`
- Item table:
  - product name
  - HSN
  - quantity
  - unit price
  - taxable amount
  - CGST amount
  - SGST amount
  - IGST amount
  - total amount
- Totals:
  - `subtotal`
  - `taxableAmount`
  - `cgstAmount`
  - `sgstAmount`
  - `igstAmount`
  - `tax`
  - `discount`
  - `deliveryCharge`
  - `platformFee`
  - `smallCartFee`
  - `grandTotal`

