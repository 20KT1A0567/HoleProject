# Anusha Bazaar - Portfolio Project Package

## 1. Portfolio Title

Anusha Bazaar - Full-Stack Grocery E-Commerce Platform

## 2. Short Portfolio Summary

Built a full-stack grocery e-commerce ecosystem with a customer web storefront, React Native mobile app, admin dashboard, delivery partner workflows, and a Spring Boot backend. The platform supports product browsing, cart and checkout, Firebase phone authentication, Razorpay payments, order tracking, delivery assignment, coupons, wallet, referrals, push notifications, WhatsApp communication, and cloud deployment.

## 3. One-Line Resume Version

Developed Anusha Bazaar, a production-style grocery commerce platform using Spring Boot, MySQL, React, React Native, Firebase, Razorpay, AWS S3/RDS/EC2, Docker, and GitHub Actions CI/CD.

## 4. Problem Statement

Local grocery businesses need a digital ordering system that connects customers, store admins, and delivery partners in one workflow. Anusha Bazaar solves this by combining a customer shopping experience, operational admin tools, delivery tracking, payments, notifications, and backend APIs into a single scalable platform.

## 5. My Role

Full-stack developer responsible for backend APIs, frontend integration, mobile app flows, admin operations, authentication, payments, order management, deployment setup, API documentation, and handoff material.

## 6. Key Features

- Customer signup and login using Firebase phone OTP.
- Product catalog with categories, subcategories, search, trending products, bestsellers, and product details.
- Cart, checkout, coupons, wishlist, product ratings, and recent ordered products.
- Razorpay payment initiation, verification, refund support, and cash-on-delivery settings.
- Customer wallet APIs for balance and transaction history.
- Address management and profile management.
- Order placement, order history, cancellation, and tracking.
- Real-time delivery tracking support through Firebase RTDB and REST fallback APIs.
- Admin dashboard for orders, products, stores, categories, banners, coupons, customers, and reports.
- Delivery partner onboarding with document upload, approval status, vehicle/bank details, and payout workflows.
- Delivery execution flow with available orders, accept order, pickup OTP, delivery OTP, proof-of-delivery photo, and live GPS ping.
- Push notification token management using FCM.
- WhatsApp notification and campaign support for order/store/customer communication.
- AWS S3 file upload support and AWS RDS MySQL database integration.
- Docker and GitHub Actions deployment pipeline targeting AWS EC2/ECR.

## 7. Tech Stack

Frontend:
- React
- TypeScript
- Vite
- Material UI
- Radix UI
- Zustand
- Recharts
- Tailwind CSS

Mobile:
- React Native
- Expo
- React Navigation
- Firebase Auth and Messaging
- React Native Maps
- Razorpay SDK
- Expo Location, Notifications, Secure Store, Haptics, and Speech

Backend:
- Java 17
- Spring Boot 3
- Spring Security
- Spring Data JPA
- MySQL
- JWT
- Firebase Admin SDK
- Razorpay Java SDK
- AWS S3 SDK
- Twilio
- Cloudinary

Cloud and DevOps:
- AWS EC2
- AWS RDS MySQL
- AWS S3
- Amazon ECR
- Docker
- GitHub Actions
- Maven

## 8. Architecture Overview

The system is split into multiple apps that communicate with the Spring Boot backend:

- Customer web storefront: React/Vite application for browsing, signup, cart, checkout, and account features.
- Customer mobile app: Expo React Native app for mobile-first shopping, Firebase OTP login, cart, orders, wallet, and notifications.
- Admin panel: React/Vite operational dashboard for managing products, stores, orders, banners, coupons, customers, delivery partners, reports, and campaigns.
- Delivery partner app flow: APIs and mobile workflow for onboarding, KYC documents, online status, accepting orders, pickup, delivery, GPS pings, and payout history.
- Backend API: Spring Boot service exposing customer, admin, delivery, payment, wallet, tracking, notification, and upload APIs.
- Cloud services: MySQL on AWS RDS, file storage on AWS S3, Docker images in ECR, deployment to EC2, and CI/CD through GitHub Actions.

## 9. Important Modules From This Folder

- `Backend_Original/` - Spring Boot backend API.
- `Anushabazaar/` - customer web storefront.
- `AnushaBazaar-U/` - Expo React Native customer mobile app.
- `adminpanel/` - React/Vite admin panel.
- `Anushadeliverypartnerapp/` - delivery partner app workspace.
- `CUSTOMER_APP_API_HANDOFF.md` - customer API integration documentation.
- `ADMIN_PANEL_API_DOCUMENTATION.txt` - admin API reference.
- `DELIVERY_PARTNER_API_HANDOFF.md` - delivery partner API flow documentation.
- `MULTI_DEVICE_AUTH_HANDOFF.md` - multi-device authentication notes.
- `anusha_bazaar_logo.png`, `anusha_bazaar_banner_1080x540.png`, `anusha_bazaar_video.mp4` - branding/demo assets.

## 10. Portfolio Case Study

Anusha Bazaar is a full-stack grocery e-commerce platform designed for local commerce operations. The project includes customer-facing shopping interfaces, mobile authentication, admin operations, delivery management, online payments, order tracking, notifications, and cloud deployment.

The backend is built with Spring Boot and MySQL, using JWT security and Firebase Admin for verified phone-auth sessions. It exposes APIs for authentication, products, categories, stores, cart, coupons, orders, payments, wallet, tracking, notifications, delivery partners, admin users, analytics, and file uploads.

The customer experience is available through both web and mobile. Customers can browse products, search and filter items, manage addresses, add items to cart, apply coupons, pay through Razorpay or COD, view order history, track delivery, manage wallet activity, and receive push notifications.

The admin panel provides operational control for products, stores, categories, subcategories, banners, coupons, checkout settings, customers, orders, delivery assignment, reports, WhatsApp campaigns, saved filters, audit logs, and command-center style monitoring.

The delivery partner workflow supports Firebase OTP login, document onboarding, online status, available orders, order acceptance, pickup OTP, delivery OTP, proof-of-delivery photo, GPS location updates, payout details, and admin approval status.

For deployment, the backend is prepared with Docker and CI/CD through GitHub Actions. The pipeline can build with Maven, create Docker images, push them to Amazon ECR, and deploy to AWS EC2. The platform also uses AWS RDS for MySQL and AWS S3 for uploaded assets.

## 11. Best Resume Bullets

- Built a full-stack grocery e-commerce platform with customer web, mobile app, admin dashboard, delivery workflows, and Spring Boot backend APIs.
- Implemented Firebase phone OTP authentication with JWT-backed backend sessions for customer, website, admin, and delivery flows.
- Integrated Razorpay payments, payment verification, refund handling, wallet APIs, coupons, order placement, and delivery tracking.
- Developed admin operations for products, categories, stores, banners, coupons, customers, orders, delivery partners, notifications, reports, and WhatsApp campaigns.
- Created delivery partner APIs for onboarding, KYC document upload, live status, order acceptance, pickup/delivery OTPs, GPS pings, proof-of-delivery, and payout history.
- Configured production-style deployment with Docker, GitHub Actions, AWS EC2, Amazon ECR, AWS RDS MySQL, and AWS S3 storage.
- Authored API handoff documentation covering customer app, admin panel, delivery partner app, and multi-device authentication flows.

## 12. LinkedIn Post

I built Anusha Bazaar, a full-stack grocery e-commerce platform connecting customers, admins, stores, and delivery partners.

The project includes:
- Customer web storefront and React Native mobile app
- Spring Boot backend with JWT security and MySQL
- Firebase phone OTP authentication
- Razorpay payments, refunds, wallet, coupons, and order flows
- Admin dashboard for products, stores, orders, customers, banners, reports, and WhatsApp campaigns
- Delivery partner onboarding, GPS updates, OTP-based pickup/delivery, and payout workflows
- AWS deployment setup with EC2, RDS, S3, ECR, Docker, and GitHub Actions

This project helped me work across real product areas: authentication, payments, logistics, admin operations, API design, documentation, and cloud deployment.

Tech stack: Java, Spring Boot, MySQL, React, React Native, Expo, TypeScript, Firebase, Razorpay, AWS, Docker, GitHub Actions.

## 13. GitHub README Opening

# Anusha Bazaar

Anusha Bazaar is a full-stack grocery e-commerce platform with customer web and mobile apps, admin operations, delivery partner workflows, online payments, real-time tracking, notifications, and cloud deployment.

## Features

- Customer authentication with Firebase phone OTP.
- Product browsing, search, categories, cart, checkout, coupons, wishlist, ratings, and orders.
- Razorpay payment, verification, refund, wallet, and COD support.
- Admin dashboard for products, stores, categories, banners, coupons, customers, orders, delivery, reports, and campaigns.
- Delivery partner onboarding, document upload, GPS ping, order acceptance, pickup OTP, delivery OTP, proof-of-delivery, and payouts.
- Push notifications through FCM and WhatsApp campaign support.
- Spring Boot backend with MySQL, JWT security, AWS S3 uploads, Docker, and GitHub Actions CI/CD.

## 14. Demo Script For Portfolio Video

1. Show the customer home page with categories, banners, product sections, search, and product detail.
2. Add products to cart and show cart quantity updates.
3. Open checkout and show address, coupon, payment, and order placement flow.
4. Show order history and tracking screen.
5. Switch to admin panel and show dashboard metrics, products, orders, customers, coupons, banners, and delivery assignment.
6. Show delivery partner workflow: login/onboarding, available orders, accept order, pickup OTP, delivery OTP, and payout/status screen.
7. End with backend/API documentation and deployment pipeline overview.

## 15. Screenshot Checklist

Use these screenshots in your portfolio:

- Customer home screen.
- Product listing or category screen.
- Product details screen.
- Cart screen.
- Checkout/payment screen.
- Order tracking screen.
- Profile/wallet/order history screen.
- Admin dashboard.
- Admin product management.
- Admin order details or delivery assignment.
- Delivery partner dashboard.
- Delivery partner order execution screen.
- GitHub Actions or deployment screenshot, if available.
- API documentation screenshot showing structured handoff work.

## 16. Public Posting Checklist

Before uploading this project to GitHub or adding a public portfolio link:

- Remove or rotate secrets, keys, certificates, `.jks` files, API keys, Firebase config secrets, database credentials, AWS credentials, Razorpay keys, Twilio keys, and private certificates.
- Do not upload `node_modules/`, build caches, Gradle caches, `.part` files, logs, local backups, or generated build output unless required.
- Add a clean `.gitignore` for Node, Java, Gradle, Expo, Android, secrets, build outputs, logs, and local environment files.
- Replace production URLs and credentials with `.env.example` placeholders.
- Add setup instructions for backend, web, mobile, and admin apps.
- Add screenshots or a demo video.
- Add a clear note that sensitive production configuration is excluded.
- Run builds/tests where possible before publishing.

## 17. Suggested GitHub Repository Structure

For a clean public portfolio repo, consider this structure:

```text
anusha-bazaar/
  backend/
  customer-web/
  customer-mobile/
  admin-panel/
  delivery-partner-app/
  docs/
  media/
  README.md
  .gitignore
  .env.example
```

## 18. Suggested Portfolio Card

Title:
Anusha Bazaar - Grocery E-Commerce Platform

Subtitle:
Full-stack commerce, admin, delivery, payment, and cloud deployment system.

Description:
Developed a grocery e-commerce platform with customer web/mobile apps, admin dashboard, delivery partner workflows, Spring Boot APIs, Firebase OTP login, Razorpay payments, AWS storage/database, Docker, and GitHub Actions deployment.

Tech:
Spring Boot, Java, MySQL, React, TypeScript, React Native, Expo, Firebase, Razorpay, AWS, Docker, GitHub Actions.

Highlights:
- End-to-end customer ordering flow.
- Admin and delivery operations.
- Secure auth and payment integration.
- Cloud-ready deployment pipeline.
- Detailed API handoff documentation.

## 19. Interview Explanation

Anusha Bazaar is an end-to-end grocery commerce platform. I built it as a multi-application system instead of a single demo app because real commerce needs separate experiences for customers, admins, and delivery partners.

The backend is a Spring Boot API with MySQL, JWT security, Firebase Admin verification, payment integration, file uploads, notifications, and delivery/order modules. The customer side includes web and mobile interfaces. The admin side handles operations like product management, orders, delivery assignment, banners, coupons, analytics, and campaigns. The delivery flow handles onboarding, KYC documents, order acceptance, pickup and delivery OTPs, GPS pings, and payouts.

The hardest parts were connecting the full order lifecycle across customer, admin, delivery, payment, notification, and tracking systems, and documenting the APIs clearly enough for frontend/mobile handoff.

## 20. Final Portfolio Summary

Anusha Bazaar demonstrates full-stack product development across frontend, mobile, backend, cloud, payments, authentication, logistics, admin operations, and documentation. It is suitable to present as a major capstone or production-style portfolio project.
