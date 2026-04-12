<div align="center">

<img src="https://img.shields.io/badge/RentHome-Bangladesh%20Rental%20Platform-10b981?style=for-the-badge&logo=house&logoColor=white" alt="RentHome" />

<br/>

# 🏠 RentHome Backend

**Production-grade rental property API for Bangladesh**  
Broker-free · Online Booking · Stripe Payments · AI-Powered

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF?style=flat-square&logo=stripe&logoColor=white)](https://stripe.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [AI Features](#-ai-features)
- [Booking & Payment Flow](#-booking--payment-flow)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)

---

## 🌟 Overview

RentHome is a production-grade rental property platform built specifically for Bangladesh. It connects **Owners** (landlords) and **Users** (tenants) through a transparent, broker-free marketplace — with online booking, Stripe payment, and AI-powered features — all managed by **Admins** via a dedicated control panel.

### Problems Solved

| Problem | Solution |
|---------|----------|
| Fragmented, broker-dependent property discovery | Central marketplace with verified listings |
| No filterable listings by property type | Filter by family, bachelor, sublet, hostel, office |
| No online booking or payment | Full booking lifecycle + Stripe integration |
| No transparent owner-tenant communication | In-app notifications & booking status tracking |
| Poor mobile experience | Responsive Next.js 15 frontend |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 20 LTS | JavaScript server runtime |
| **Framework** | Express.js + TypeScript 5 | RESTful API, type-safe development |
| **Frontend** | Next.js 15 + Tailwind CSS | SSR/SSG, responsive UI |
| **Database** | PostgreSQL 16 | Primary relational store |
| **ORM** | Prisma 7 | Type-safe database access |
| **Auth** | BetterAuth | Session, account & email verification |
| **Payment** | Stripe | Checkout, webhooks & refunds |
| **Media** | Cloudinary | Image upload & CDN delivery |
| **Cache** | Redis | Session store & hot listing cache |
| **AI** | OpenAI GPT-4o | Recommendations, descriptions, price hints |
| **Deploy** | Render | Backend hosting |
| **Frontend Deploy** | Vercel | Auto-deploy from main branch |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Next.js 15)               │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP / REST
┌─────────────────────▼───────────────────────────────┐
│              Express.js API Server                   │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │   Auth   │  │  Routes  │  │   Middlewares       │ │
│  │BetterAuth│  │ /api/... │  │ auth, role, rate    │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│  ┌──────────────────────────────────────────────────┐│
│  │              Feature Modules                     ││
│  │  Property · Booking · Payment · Review · Blog    ││
│  └──────────────────────────────────────────────────┘│
└────────┬────────────┬─────────────┬──────────────────┘
         │            │             │
  ┌──────▼──┐  ┌──────▼──┐  ┌──────▼──────┐
  │PostgreSQL│  │  Redis  │  │  External   │
  │+ Prisma │  │  Cache  │  │  Services   │
  └─────────┘  └─────────┘  │ Stripe      │
                             │ Cloudinary  │
                             │ OpenAI      │
                             └─────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis
- Stripe account
- Cloudinary account
- OpenAI API key

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/IEEEMOSTAFA/HomeRentBackend.git
cd HomeRentBackend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Run database migrations
npx prisma migrate dev

# 5. Seed the database (optional)
npx prisma db seed

# 6. Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server with hot-reload
npm run build        # Build for production (prisma generate + nest build)
npm run start:prod   # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npx prisma studio    # Open Prisma database GUI
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory. **Never commit this file.**

```env
# ── Server ────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── Database ──────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/renthome"

# ── Auth ──────────────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
BETTER_AUTH_SECRET=your_better_auth_secret

# ── Stripe ────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# ── Cloudinary ────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Redis ─────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── OpenAI ────────────────────────────────────────────
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# ── Frontend URL (for CORS) ───────────────────────────
FRONTEND_URL=http://localhost:3001
```

> ⚠️ See `.env.example` for all available variables with descriptions.

---

## 📡 API Reference

Base URL: `https://homerent-backend.onrender.com/api`

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login, get session |
| `POST` | `/auth/logout` | Auth | Logout, destroy session |
| `POST` | `/auth/verify-email` | Auth | Verify email with OTP |

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/users` | Admin | List all users |
| `PATCH` | `/users/:id/ban` | Admin | Ban / unban user |
| `DELETE` | `/users/:id` | Admin | Delete user (cascade) |
| `GET` | `/users/me` | Auth | Get current user profile |
| `PATCH` | `/users/me` | Auth | Update profile |

### Properties

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/properties` | Public | List approved properties with filters |
| `GET` | `/properties/:id` | Public | Get property details |
| `POST` | `/properties` | Owner | Create property (status=PENDING) |
| `PUT` | `/properties/:id` | Owner | Update own property |
| `DELETE` | `/properties/:id` | Owner/Admin | Delete property |
| `PATCH` | `/properties/:id/status` | Admin | Approve / reject property |

### Bookings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/bookings` | User | Create booking request |
| `GET` | `/bookings` | Auth | List bookings (filtered by role) |
| `PATCH` | `/bookings/:id/status` | Owner | Accept / decline booking |
| `PATCH` | `/bookings/:id/cancel` | User | Cancel booking (pre-payment) |

### Payments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/payments/initiate` | User | Create Stripe Checkout session |
| `POST` | `/payments/webhook` | Stripe | Webhook handler |
| `POST` | `/payments/:id/refund` | Admin | Process refund |

### Reviews

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/reviews` | User | Create review (post-booking) |
| `PATCH` | `/reviews/:id/flag` | Owner | Flag inappropriate review |
| `PATCH` | `/reviews/:id/hide` | Admin | Hide review |

### Notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/notifications` | Auth | Get user notifications |
| `PATCH` | `/notifications/:id/read` | Auth | Mark as read |

### Blog

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/blog` | Public | List published posts |
| `GET` | `/blog/:slug` | Public | Get single post |
| `POST` | `/blog` | Admin | Create blog post |
| `PATCH` | `/blog/:id/publish` | Admin | Publish / unpublish |

### AI

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/ai/describe` | Owner | Generate property description |
| `POST` | `/ai/recommend` | User | Get property recommendations |
| `POST` | `/ai/price-hint` | Owner | Get rent price suggestion |

---

## 🗄 Database Schema

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `User` | All platform users | id, email, role, isActive, isBanned |
| `Account` | BetterAuth credentials | userId, providerId, password |
| `Session` | User sessions | token, userId, expiresAt |
| `OwnerProfile` | Owner-specific data | userId, verified, nidNumber, rating |
| `Property` | Rental listings | ownerId, title, type, status, rentAmount |
| `Booking` | Rental requests | propertyId, userId, status, totalAmount |
| `Payment` | Stripe payments | bookingId, status, stripeSessionId |
| `Review` | User reviews | bookingId, rating, comment, isFlagged |
| `Notification` | In-app alerts | userId, title, type, isRead |
| `BlogPost` | Admin articles | authorId, title, slug, isPublished |

### Enums

```prisma
enum UserRole        { ADMIN  OWNER  USER }
enum PropertyType    { FAMILY_FLAT  BACHELOR_ROOM  SUBLET  HOSTEL  OFFICE_SPACE  COMMERCIAL }
enum PropertyStatus  { PENDING  APPROVED  REJECTED }
enum AvailableFor    { FAMILY  BACHELOR  CORPORATE  ANY }
enum BookingStatus   { PENDING  ACCEPTED  PAYMENT_PENDING  CONFIRMED  DECLINED  CANCELLED }
enum PaymentStatus   { PENDING  SUCCESS  FAILED  REFUNDED }
```

### Key Relationships

```
User ──────────── OwnerProfile   (1:1, if role=OWNER)
User ──────────── Property       (1:N, as owner)
User ──────────── Booking        (1:N, as tenant)
Property ───────── Booking       (1:N)
Booking ─────────── Payment      (1:1)
Booking ─────────── Review       (1:1)
```

---

## 🤖 AI Features

### 1. Smart Property Recommendations
> **Route:** `POST /api/ai/recommend` · **Access:** User

Analyzes the user's booking history and reviews, extracts preferences (type, location, price), and returns a ranked list of properties via GPT-4o.

### 2. AI Description Generator
> **Route:** `POST /api/ai/describe` · **Access:** Owner

Owner provides property details → GPT-4o generates a 3-paragraph professional listing description → Owner edits and saves.

**Prompt template:**
```
Write a professional rental listing for a [type] in [area], [city].
Features: [N] bedrooms, [M] bathrooms, [size] sqft.
Available for: [availableFor]. Price: BDT [rentAmount]/month.
Highlight: [amenities list].
```

### 3. Rent Price Suggestion
> **Route:** `POST /api/ai/price-hint` · **Access:** Owner

Queries the database for similar properties → calculates market average → sends to GPT-4o → returns a competitive rent range with reasoning.

---

## 💳 Booking & Payment Flow

```
User submits booking request
         │
         ▼
  Status: PENDING ──── 24hr timeout ──→ CANCELLED (auto)
         │
    Owner reviews
         │
    ┌────┴────┐
    │         │
 ACCEPTED  DECLINED
    │
    ▼
Status: PAYMENT_PENDING
    │
User initiates Stripe Checkout
    │
    ├── Payment Success → Status: CONFIRMED ✅
    │                     Notification sent
    │
    └── Payment Failed  → Status: PAYMENT_PENDING 🔄
                          User can retry
```

> 📊 Full flow diagram: [View on Mermaid](https://mermaid.ai/d/faf2e05e-8269-4182-9621-f973b2d5ca9e)

---

## 🚢 Deployment

### Deploy to Render (Recommended)

**1. Set Build & Start commands in Render dashboard:**

```bash
# Build Command
npm install && npm run build

# Start Command
npm run start:prod
```

**2. Ensure `package.json` has:**

```json
{
  "scripts": {
    "build": "prisma generate && nest build",
    "start:prod": "prisma migrate deploy && node dist/main",
    "postinstall": "prisma generate"
  }
}
```

**3. Add all environment variables** from the [Environment Variables](#-environment-variables) section in the Render dashboard under **Environment → Add Environment Variable**.

**4. PostgreSQL on Render:**
- Create a new PostgreSQL instance on Render
- Use the **Internal Database URL** as `DATABASE_URL`

### Health Check Endpoint

```
GET /health → { "status": "ok" }
```

Use [cron-job.org](https://cron-job.org) to ping every 10 minutes and prevent Render free-tier sleep.

---

## 📁 Project Structure

```
renthome-backend/
├── src/
│   ├── config/              # App configuration (db, redis, cloudinary, stripe)
│   ├── lib/                 # External service clients (prisma, redis, logger)
│   ├── middlewares/         # auth, roleGuard, validateRequest, rateLimiter, errorHandler
│   ├── modules/             # Feature modules
│   │   ├── Auth/
│   │   ├── User/
│   │   ├── Property/
│   │   ├── Booking/
│   │   ├── Payment/
│   │   ├── Review/
│   │   ├── Notification/
│   │   └── Blog/
│   ├── routes/              # Route definitions
│   ├── utils/               # catchAsync, sendResponse, pagination
│   ├── jobs/                # Background jobs (email, analytics)
│   ├── events/              # Event system (handlers, listeners)
│   ├── templates/           # Email templates (.hbs)
│   ├── tests/               # unit/ and integration/
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── scripts/                 # DevOps (deploy.sh, backup-db.sh)
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

---

## 👥 User Roles & Permissions

| Role | Key Permissions |
|------|----------------|
| **ADMIN** | Approve/reject listings · Ban users · View all bookings & payments · Verify owner NID · Manage blog |
| **OWNER** | Post/edit/delete listings · Accept/decline bookings · View stats · Generate AI descriptions |
| **USER** | Browse & filter properties · Submit booking requests · Pay via Stripe · Write reviews · Get AI recommendations |

> Role is set at registration and is **immutable by the user**. Only Admin can modify a user's role.

---

## 🤝 Contributing

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes
git commit -m "feat: add your feature"

# 4. Push to the branch
git push origin feature/your-feature-name

# 5. Open a Pull Request
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ for Bangladesh

**[Live API](https://homerent-backend.onrender.com)** · **[Frontend Repo](#)** · **[Report Bug](https://github.com/IEEEMOSTAFA/HomeRentBackend/issues)**

</div>