# VR Technologies — Full Stack E-Commerce Platform

Multi-store refurbished laptop & accessories platform.
**Tagline:** Refurbished. Reliable. Ready for You.

## Project Structure

```
VR-Technologies/
├── frontend/     → Customer website  (React + TypeScript + Vite + Tailwind)
├── admin/        → Admin panel       (React + TypeScript + Vite + Tailwind + Recharts)
└── backend/      → REST API          (Spring Boot + MySQL + Spring Security + JWT)
```

## Quick Start

### 1. Database
```sql
-- Create MySQL database and run:
mysql -u root -p < backend/src/main/resources/schema.sql
```

### 2. Backend (Spring Boot)
```bash
cd backend
# Edit src/main/resources/application.properties — set DB password
mvn spring-boot:run
# Runs on http://localhost:8080
```

### 3. Frontend (Customer Website)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 4. Admin Panel
```bash
cd admin
npm install
npm run dev
# Runs on http://localhost:5174
# Login: admin@vr.com / admin123
```

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 |
| State    | Zustand (persist) |
| Routing  | React Router v7 |
| HTTP     | Axios |
| Admin Charts | Recharts |
| Backend  | Java 21 + Spring Boot 3.2 |
| Security | Spring Security + JWT (jjwt) |
| Database | MySQL 8 + JPA/Hibernate |
| ORM      | Lombok + JPA |

## 4 Physical Stores
| Store | City |
|-------|------|
| VR Technologies – Ameerpet | Hyderabad |
| VR Technologies – KPHB | Hyderabad |
| VR Technologies – Dilsukhnagar | Hyderabad |
| VR Technologies – Guntur | Guntur, AP |

## Admin Panel Pages
- Dashboard (analytics, charts, KPIs)
- Products (CRUD, multi-store stock)
- Categories & Brands
- Orders (status management, detail view)
- Customers
- Stores
- Inventory (multi-store matrix)
- Banners
- Coupons
- Reviews (approve/reject)
- Reports (Sales, Orders, Stock, Customer)
- Analytics (trends, charts)
- Users & Roles (RBAC)
- Settings (General, Notifications, Security, Integrations)

## Customer Website Pages
- Homepage (hero, categories, featured, stores, deals)
- Product Listing (filters, sort, pagination)
- Product Detail (gallery, specs, store stock, tabs)
- Cart (quantity, coupon, summary)
- Checkout (4-step: Address → Delivery → Payment → Review)
- Login / Register
- Orders & Order Tracking
- Store Locator & Store Detail
- About, Contact, Warranty, Returns, Privacy, Terms

## API Endpoints (Key)
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/products          (public, paginated, filterable)
GET    /api/products/:id      (public)
GET    /api/products/featured (public)
GET    /api/stores            (public)
POST   /api/admin/products    (STORE_MANAGER+)
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/orders      (paginated)
PUT    /api/admin/orders/:id/status
POST   /api/orders            (authenticated)
GET    /api/orders/my         (authenticated)
```

## Admin Roles
| Role | Access |
|------|--------|
| SUPER_ADMIN | Full access |
| STORE_MANAGER | Store products, stock, orders |
| SALES_STAFF | Orders and customers |
| SUPPORT | Customer support, order status |
