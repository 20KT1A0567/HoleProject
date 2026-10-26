# Project Proposal for Bharat Innovates 2026

## Project Title

**Anusha Bazaar: Digital Quick-Commerce and Local Retail Enablement Platform**

## Submitted For

**Bharat Innovates 2026**  
Ministry of Education, Government of India  
Nice, France | 14-16 June 2026

## Applicant / Startup Details

**Startup / Project Name:** Anusha Bazaar  
**Organisation:** Anusha Technologies  
**Website / App:** `https://app.anushatechnologies.com`  
**API Base URL:** `https://api.anushatechnologies.com`  
**Founder / Team Lead:** [Add Name]  
**Institution / Incubation Support:** [Add Institution or Incubator]  
**Email:** [Add Email]  
**Phone:** [Add Phone Number]

## Sector Alignment

Anusha Bazaar aligns primarily with the **Agri & Food Technologies** sector listed in the Bharat Innovates 2026 booklet. It also connects with **Smart Cities and Mobility** through location-aware delivery operations, route-based fulfillment, live tracking, and digital enablement for local merchants.

## Executive Summary

Anusha Bazaar is a full-stack quick-commerce and local retail platform designed to connect customers, stores, administrators, and delivery partners through one integrated digital system. The platform enables users to browse grocery and daily-need products, place orders, make secure payments, track deliveries, use coupons and referrals, and manage profiles, addresses, wallets, and order history.

The project includes a customer mobile application, customer web experience, admin control panel, delivery partner application, and a Spring Boot backend. It uses Firebase authentication, JWT-based backend security, Razorpay payments, AWS RDS MySQL, AWS S3 storage, push notifications, WhatsApp campaign support, and CI/CD deployment through GitHub Actions, Amazon ECR, and EC2.

For Bharat Innovates 2026, Anusha Bazaar can be positioned as a practical Indian digital commerce innovation that supports local retail digitisation, faster last-mile delivery, transparent order management, and scalable hyperlocal commerce infrastructure.

## Problem Statement

Small and medium local stores often face difficulty competing with large quick-commerce platforms because they lack integrated digital tools for product cataloguing, online ordering, real-time inventory visibility, delivery assignment, customer engagement, payments, and operational analytics.

Customers expect fast delivery, transparent pricing, easy payment, order tracking, coupons, referrals, and reliable support. Delivery partners need a structured onboarding, KYC, approval, payout, and order execution system. Store and platform administrators need strong controls for products, banners, categories, coupons, customers, delivery partners, orders, notifications, and audit logs.

Most existing local retail operations use disconnected tools such as phone calls, spreadsheets, manual billing, WhatsApp messages, and separate payment links. This increases errors, delays, customer dissatisfaction, and operational cost.

## Proposed Solution

Anusha Bazaar provides an integrated digital commerce platform for local grocery and daily essentials delivery. The system brings the entire commerce cycle into one platform:

- Customer discovery, cart, checkout, online payment, wallet, coupons, referrals, and order tracking.
- Admin operations for stores, products, categories, banners, discounts, customer management, orders, payouts, delivery partner verification, and live dashboards.
- Delivery partner onboarding with Firebase phone authentication, profile setup, bank details, document upload, admin approval, online status, available orders, pickup, location updates, delivery OTP, and payout tracking.
- Backend APIs for secure authentication, role-based access, product management, cart, orders, payments, delivery, notifications, WhatsApp campaigns, and reporting.

The platform is designed to be modular and scalable so it can support multiple stores, delivery zones, customer segments, and future AI-driven features such as smart search, demand prediction, delivery optimization, and personalised offers.

## Innovation and Uniqueness

Anusha Bazaar is not only a shopping app. It is an operational platform for hyperlocal commerce. Its innovation comes from combining customer experience, delivery operations, admin governance, digital payments, notification workflows, and partner onboarding into a single deployable ecosystem.

Key innovation points:

- **End-to-end local commerce stack:** Customer app, delivery app, admin panel, website, and backend are developed as one coordinated system.
- **Firebase plus backend JWT authentication:** Mobile OTP verification is handled by Firebase, while backend authorization is secured using JWT.
- **Delivery partner compliance workflow:** KYC documents, bank details, vehicle details, approval status, onboarding progress, and locked-after-approval controls are supported.
- **Real-time delivery execution:** Delivery partners can go online, accept orders, update location, mark arrival, confirm pickup, generate delivery OTP, and complete proof-of-delivery.
- **Admin governance:** Super admin can create admins, set access codes, define time-limited access, assign modular permissions, and monitor activity.
- **Growth tools:** Coupons, referral rewards, scratch cards, banners, marquee announcements, push notifications, WhatsApp campaigns, and customer engagement features are included.
- **Production-oriented architecture:** Backend is configured for AWS RDS MySQL, AWS S3, Docker, GitHub Actions, Amazon ECR, and EC2 deployment.

## Current Project Components

### 1. Customer Mobile Application

The customer app is built using Expo and React Native. It supports:

- Firebase phone authentication.
- Home, category, product, cart, checkout, order, and profile flows.
- Address management and location selection.
- Razorpay online payment support.
- Coupons, referrals, wallet, wishlist, saved filters, and notifications.
- Product images, banners, best seller sections, and responsive mobile UI.

### 2. Admin Panel

The admin panel is built using React, TypeScript, Vite, Material UI, Redux Toolkit, Firebase, and Playwright tests. It supports:

- Admin login and protected routes.
- Products, categories, subcategories, banners, stores, and settings.
- Orders, customers, delivery partners, payouts, and live operations.
- Coupons, discounts, referrals, scratch cards, notifications, marquee messages, and WhatsApp campaigns.
- Super admin controls, modular permissions, access codes, time-limited access, and audit logs.

### 3. Delivery Partner Application

The delivery workflow supports:

- Firebase phone OTP login and signup.
- Delivery partner profile, bank details, vehicle details, and KYC documents.
- Admin approval status and onboarding status checks.
- Online/offline status.
- Available orders, accept order, arrival, pickup, delivery OTP, delivery confirmation, and location updates.
- Payout tracking and order statistics.

### 4. Backend System

The backend is a Java Spring Boot application using:

- Java 17 and Spring Boot 3.4.2.
- Spring Security and JWT.
- Spring Data JPA with MySQL.
- Firebase Admin SDK.
- AWS S3 integration.
- Razorpay payment integration.
- Twilio / WhatsApp campaign support.
- Email service, push notification support, and app policy management.
- CI/CD pipeline with Docker, GitHub Actions, Amazon ECR, and EC2.

## Technical Architecture

```text
Customer App / Website
        |
        | HTTPS + JWT
        v
Spring Boot Backend API
        |
        |-- MySQL Database on AWS RDS
        |-- AWS S3 / Cloudinary for media and documents
        |-- Firebase Auth and FCM
        |-- Razorpay Payment Gateway
        |-- WhatsApp / Notification Services
        |
Admin Panel and Delivery Partner App
```

## Key Features

- Customer signup and login using Firebase phone authentication.
- Secure backend login using Firebase ID token and JWT issue.
- Product browsing by store, category, subcategory, search, and filters.
- Cart, checkout, COD / online payment, Razorpay verification, and order history.
- Address management and location-based delivery support.
- Delivery partner onboarding, KYC upload, approval, and order execution.
- Delivery OTP and proof-of-delivery flow.
- Admin order management, customer management, product management, and delivery monitoring.
- Coupons, discounts, referrals, scratch cards, wallet, free item offers, and banners.
- WhatsApp campaign management and push notification support.
- Role-based admin access, audit logs, access code verification, and permission control.

## Target Beneficiaries

- Local grocery stores and small retailers seeking digital sales channels.
- Customers in towns and cities who need convenient local delivery.
- Delivery partners seeking structured earning opportunities.
- Local entrepreneurs and store operators who need admin tools for online commerce.
- Regional communities where digitisation of commerce can improve service access and employment.

## Market Relevance

India's quick-commerce and local retail digitisation market is growing rapidly, but many local stores remain outside structured digital commerce platforms. Anusha Bazaar targets this gap by giving local operators a practical platform for online ordering, digital payments, delivery management, and customer engagement.

The solution is especially relevant for tier-2, tier-3, and semi-urban markets where trusted local shops already exist, but digital infrastructure is fragmented. By digitising store operations and delivery workflows, the platform can help smaller sellers participate in the modern commerce economy.

## Social and Economic Impact

Anusha Bazaar can create impact in the following ways:

- Helps local stores reach digital customers without building their own apps.
- Generates delivery partner earning opportunities.
- Improves customer access to groceries and essentials.
- Reduces manual order errors through structured digital workflows.
- Promotes digital payments and transparent order records.
- Builds operational data that can support better demand planning and local supply chains.

## Scalability Plan

The platform can scale in phases:

### Phase 1: Local Launch

Deploy in one city or service zone with a limited number of stores, delivery partners, and product categories.

### Phase 2: Multi-Store Expansion

Add more stores, sub-store support, delivery zones, product catalogues, marketing campaigns, and admin roles.

### Phase 3: Regional Expansion

Expand to nearby towns with standardised onboarding, delivery workflows, payout systems, and localised offers.

### Phase 4: Intelligence Layer

Add AI-assisted smart search, product recommendations, demand forecasting, route optimization, fraud detection, and automated campaign targeting.

## Competitive Advantage

- Built as a complete working software ecosystem, not just a prototype.
- Covers customer, admin, delivery, backend, payment, notification, and deployment needs.
- Designed for Indian phone authentication, Indian payments, and local delivery realities.
- Supports operational governance through approval workflows, permissions, audit logs, and admin access restrictions.
- Modular architecture enables future integration with AI, analytics, ERP, inventory systems, and logistics partners.

## Implementation Status

The project folder shows active implementation across:

- Customer mobile app: `AnushaBazaar-U`
- Customer web/frontend: `Anushabazaar`
- Admin panel: `Anushabazaar_Admin_Panel`
- Delivery partner app: `Anushadeliverypartnerapp`
- Backend API: `Backend_Original`
- API handoff and documentation files for customer, admin, delivery, referrals, invoices, and authentication flows.

The backend already includes controllers and services for authentication, products, categories, cart, orders, payments, delivery, tracking, wallet, banners, coupons, referrals, notifications, payouts, documents, stores, admin operations, and WhatsApp campaigns.

## Roadmap

| Timeline | Milestone | Expected Outcome |
| --- | --- | --- |
| Month 1 | Stabilise MVP and pilot operations | Customer ordering, admin operations, and delivery flow ready for live pilot |
| Month 2 | Local merchant onboarding | Add stores, products, delivery zones, and partner onboarding |
| Month 3 | Growth and retention features | Coupons, referrals, scratch cards, banners, notifications, and WhatsApp campaigns |
| Month 4 | Analytics dashboard | Sales, customer, order, delivery, and campaign analytics |
| Month 5 | AI-enabled improvements | Smart search, recommendations, demand prediction, route suggestions |
| Month 6 | Multi-location expansion | Repeatable rollout model for new service areas |

## Expected Support from Bharat Innovates 2026

Participation in Bharat Innovates 2026 can help Anusha Bazaar:

- Present the platform to investors, industry leaders, universities, and research institutions.
- Build collaborations for AI, logistics, retail digitisation, and smart city commerce.
- Receive feedback from global innovation ecosystem stakeholders.
- Explore partnerships with incubators, local commerce networks, and technology providers.
- Position the project as a scalable Indian innovation for hyperlocal commerce and food-tech enablement.

## Funding / Resource Requirement

Indicative requirement: **INR [Add Amount]** for:

- Cloud infrastructure and security hardening.
- App store deployment, testing devices, and production monitoring.
- Merchant onboarding and local operations.
- Delivery partner onboarding and verification.
- AI features for recommendations, demand forecasting, and route optimisation.
- Marketing, customer acquisition, and support operations.

## Conclusion

Anusha Bazaar is a practical, scalable, and India-focused digital commerce platform that strengthens local retail through technology. By combining customer ordering, merchant operations, delivery partner management, secure payments, admin governance, notifications, and cloud deployment, it addresses a real market need in hyperlocal grocery and essentials delivery.

The project is well aligned with Bharat Innovates 2026 because it represents applied innovation from India's digital ecosystem, supports entrepreneurship, creates local economic opportunity, and has the potential to evolve into a larger smart commerce infrastructure for towns and cities.

## Annexure: Project Evidence from Repository

- `Backend_Original`: Spring Boot backend with REST APIs, security, payments, delivery, admin, and deployment configuration.
- `AnushaBazaar-U`: React Native / Expo customer mobile application.
- `Anushabazaar_Admin_Panel`: React TypeScript admin panel with operations modules.
- `Anushadeliverypartnerapp`: Delivery partner application folder.
- `CUSTOMER_APP_API_HANDOFF.md`: Customer app API documentation.
- `DELIVERY_PARTNER_API_HANDOFF.md`: Delivery partner API documentation.
- `ADMIN_IMPLEMENTATION_DETAILS.txt`: Admin and super admin workflow notes.
- `ADMIN_PANEL_API_DOCUMENTATION.txt`: Admin API documentation.
