# Anusha Bazaar

Anusha Bazaar is a full-stack grocery e-commerce platform with customer web and mobile apps, admin operations, delivery partner workflows, online payments, real-time tracking, notifications, and cloud deployment.

## Project Highlights

- Customer web storefront and Expo React Native mobile app.
- Spring Boot backend with MySQL, JWT security, Firebase authentication, and REST APIs.
- Product catalog, categories, search, cart, coupons, wishlist, checkout, orders, wallet, and ratings.
- Razorpay payment, verification, refund, and cash-on-delivery support.
- Admin dashboard for products, stores, categories, banners, coupons, customers, orders, delivery partners, reports, and WhatsApp campaigns.
- Delivery partner onboarding, KYC document upload, GPS updates, order acceptance, pickup OTP, delivery OTP, proof-of-delivery, and payouts.
- Push notification support with FCM.
- AWS-ready architecture using EC2, RDS MySQL, S3, ECR, Docker, and GitHub Actions.

## Tech Stack

- Backend: Java 17, Spring Boot 3, Spring Security, Spring Data JPA, MySQL, JWT, Maven.
- Frontend: React, TypeScript, Vite, Material UI, Radix UI, Zustand, Recharts, Tailwind CSS.
- Mobile: React Native, Expo, Firebase Auth/Messaging, React Navigation, React Native Maps.
- Integrations: Razorpay, Firebase, AWS S3, Twilio, Cloudinary.
- DevOps: Docker, GitHub Actions, AWS EC2, AWS RDS, Amazon ECR.

## Workspace Structure

```text
Backend_Original/              Spring Boot backend API
Anushabazaar/                  Customer web storefront
AnushaBazaar-U/                Customer mobile app
adminpanel/                    Admin dashboard
Anushadeliverypartnerapp/      Delivery partner app workspace
docs and handoff files         API documentation and integration notes
```

## Documentation

- `CUSTOMER_APP_API_HANDOFF.md` - customer app API flow.
- `ADMIN_PANEL_API_DOCUMENTATION.txt` - admin API reference.
- `DELIVERY_PARTNER_API_HANDOFF.md` - delivery partner API flow.
- `MULTI_DEVICE_AUTH_HANDOFF.md` - authentication handoff notes.
- `PORTFOLIO_PROJECT_ANUSHA_BAZAAR.md` - portfolio-ready case study, resume bullets, LinkedIn post, demo script, and publishing checklist.

## Public Repository Note

This workspace may contain local environment files, Android signing keys, Firebase configs, certificates, logs, and generated build output. Before publishing publicly, remove or rotate private credentials and use `.env.example` placeholders instead of real values.

## Portfolio Summary

Anusha Bazaar demonstrates end-to-end product development across frontend, mobile, backend, payments, authentication, logistics, admin operations, cloud deployment, and API documentation.
