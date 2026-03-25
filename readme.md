

# 🏠 RentHome - Project Requirements Document

**Bangladesh Rental Property Platform** · Full-Stack · AI-Powered  
*Next.js 15 · Express · PostgreSQL · Prisma · BetterAuth · Stripe · Cloudinary*

---

## Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Technology Stack](#2-technology-stack)
- [3. User Roles & Permissions](#3-user-roles--permissions)
- [4. Core Features](#4-core-features)
- [5. API Endpoints](#5-api-endpoints)
- [6. Database Schema Overview](#6-database-schema-overview)
- [7. AI Features](#7-ai-features)
- [8. Booking & Payment Flow](#8-booking--payment-flow)
- [9. Pages & Routes](#9-pages--routes)
- [10. Deployment Configuration](#10-deployment-configuration)
- [11. Development Timeline](#11-development-timeline)

---

## 1. Project Overview

RentHome is a production-grade rental property platform built for Bangladesh. It connects landlords (Owners) and tenants (Users) through a transparent, broker-free marketplace with online booking and Stripe payment — all managed by Admins via a dedicated control panel.

### 1.1 Problem Statement
- Fragmented, broker-dependent property discovery with no central platform
- No verified, filterable listings by property type (family, bachelor, sublet, hostel, office)
- No online booking or payment system — all done manually over phone
- No transparent communication channel between owners and seekers
- Poor mobile experience for on-the-go property searching

### 1.2 Solution
- Single platform for listing, discovering, booking, and paying for rentals
- Role-based access: Admin controls the platform, Owners post listings, Users book
- Full booking lifecycle from request → owner acceptance → Stripe payment → confirmation
- AI features for property recommendations, description generation, and price suggestions

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 20 LTS | JavaScript server runtime |
| Framework | Express.js + TypeScript 5 | RESTful API, type-safe development |
| Frontend | Next.js 15 + Tailwind CSS | SSR/SSG, responsive UI |
| Database | PostgreSQL 16 | Primary relational store |
| ORM | Prisma 7 | Database access layer, type-safe queries |
| Auth | BetterAuth | Account + Session + Verification |
| Payment | Stripe | Online booking payment, webhooks, refunds |
| Media | Cloudinary | Property image upload and CDN delivery |
| Cache | Redis | Session store, hot listing cache |
| AI | OpenAI API (GPT-4o) | Recommendations, description gen, price hints |
| Frontend Deploy | Vercel | Auto-deploy from main branch |
| Backend Deploy | Railway | Docker-based, auto-migrate on deploy |

---

## 3. User Roles & Permissions

### 3.1 Role Overview

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | Platform controller | • Approve/reject listings<br>• Ban/delete users<br>• View all bookings & payments<br>• Verify OwnerProfile NID<br>• Manage blog posts |
| **OWNER** | Landlord / property poster | • Post/edit/delete listings<br>• Accept/decline bookings<br>• View OwnerProfile stats<br>• Flag inappropriate reviews<br>• Generate AI descriptions |
| **USER** | Tenant / property seeker | • Browse & filter properties<br>• Submit booking requests<br>• Pay via Stripe<br>• Write reviews<br>• Get AI recommendations |

### 3.2 Role Constraints
- Role is set at registration and immutable by the user
- Only Admin can modify a user's role
- All protected routes check role via middleware
- Banned users cannot access any protected endpoints

---

## 4. Core Features

### 4.1 Authentication & User Management
- Email/password registration and login
- Email verification via OTP
- Session management with BetterAuth
- Profile management (name, image, phone)
- Admin user banning and deletion

### 4.2 Property Management (Owner)
- Create property listings with images (Cloudinary upload)
- Edit/delete own properties
- View property status (pending/approved/rejected)
- Track property views and ratings
- AI-assisted description generation
- AI-powered rent price suggestions

### 4.3 Property Moderation (Admin)
- Review pending listings
- Approve/reject with rejection reason
- Set publishedAt timestamp on approval
- Delete any property if necessary

### 4.4 Property Discovery (User)
- Search with full-text on title, description, city, area
- Filters: property type, city, area, rent range, availability, bedrooms
- Sort by rating, newest, price
- View property details with gallery
- View owner profile and verification status

### 4.5 Booking System
- Users submit booking requests with move-in date and message
- Owners accept or decline requests
- 24-hour expiration on pending requests (auto-cancel)
- Booking status tracking: PENDING → ACCEPTED → PAYMENT_PENDING → CONFIRMED
- Cancellation before payment allowed

### 4.6 Payment Integration (Stripe)
- Create Stripe Checkout sessions from bookings
- Webhook handling for payment success/failure
- One payment per booking (enforced by unique constraint)
- Payment status: PENDING, SUCCESS, FAILED, REFUNDED
- Receipt URL stored for user access
- Admin refund capability

### 4.7 Reviews & Ratings
- Users write reviews after confirmed bookings
- One review per booking (database constraint)
- Ratings: 1-5 stars
- Owners can flag inappropriate reviews
- Admins can hide reviews without deletion
- Automatic rating recalculation for properties and owners

### 4.8 Notifications
- In-app notifications for booking status changes
- Payment success/failure notifications
- Review flag notifications to Admin
- Read/unread status tracking
- Action URLs for navigation

### 4.9 Blog (Admin)
- Create, edit, delete blog posts
- Publish/unpublish with timestamp
- Slug-based URLs for SEO
- Tags for categorization
- Featured image support

### 4.10 AI Features

#### Smart Property Recommendations (User)
- Analyzes user's past bookings and reviews
- Considers property type, location, price preferences
- Returns ranked property list via GPT-4o
- Personalized suggestions on dashboard

#### AI Description Generator (Owner)
- Generates professional property descriptions
- Input: property details (type, location, amenities)
- Output: 3-paragraph polished description
- Owner can edit before saving

#### Rent Price Suggestion (Owner)
- Analyzes similar properties in the area
- Considers property size, bedrooms, bathrooms
- Provides competitive rent range
- Market average from database + AI refinement

---

## 5. API Endpoints

### 5.1 Authentication
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, get session |
| POST | `/api/auth/logout` | Auth | Logout, destroy session |
| POST | `/api/auth/verify-email` | Auth | Verify email with OTP |

### 5.2 Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users` | Admin | List all users |
| PATCH | `/api/users/:id/ban` | Admin | Ban/unban user |
| DELETE | `/api/users/:id` | Admin | Delete user (cascade) |
| GET | `/api/users/me` | Auth | Get current user profile |
| PATCH | `/api/users/me` | Auth | Update profile |

### 5.3 Properties
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/properties` | Public | List approved properties with filters |
| GET | `/api/properties/:id` | Public | Get property details (increment views) |
| POST | `/api/properties` | Owner | Create property (status=PENDING) |
| PUT | `/api/properties/:id` | Owner | Update own property |
| DELETE | `/api/properties/:id` | Owner/Admin | Delete property |
| PATCH | `/api/properties/:id/status` | Admin | Approve/reject property |

### 5.4 Bookings
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/bookings` | User | Create booking request |
| GET | `/api/bookings` | Auth | List bookings (filtered by role) |
| PATCH | `/api/bookings/:id/status` | Owner | Accept/decline booking |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel booking (pre-payment) |

### 5.5 Payments
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/payments/initiate` | User | Create Stripe Checkout session |
| POST | `/api/payments/webhook` | Stripe | Webhook handler |
| POST | `/api/payments/:id/refund` | Admin | Process refund |

### 5.6 Reviews
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/reviews` | User | Create review (post-booking) |
| PATCH | `/api/reviews/:id/flag` | Owner | Flag inappropriate review |
| PATCH | `/api/reviews/:id/hide` | Admin | Hide review |

### 5.7 Notifications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/notifications` | Auth | Get user notifications |
| PATCH | `/api/notifications/:id/read` | Auth | Mark as read |

### 5.8 Blog
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/blog` | Public | List published posts |
| GET | `/api/blog/:slug` | Public | Get single post |
| POST | `/api/blog` | Admin | Create blog post |
| PATCH | `/api/blog/:id/publish` | Admin | Publish/unpublish |

### 5.9 AI
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/ai/describe` | Owner | Generate property description |
| POST | `/api/ai/recommend` | User | Get property recommendations |
| POST | `/api/ai/price-hint` | Owner | Get rent price suggestion |

---

## 6. Database Schema Overview

### 6.1 Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **User** | All platform users | id, email, role, isActive, isBanned |
| **Account** | BetterAuth credentials | userId, providerId, password |
| **Session** | User sessions | token, userId, expiresAt |
| **OwnerProfile** | Owner-specific data | userId, verified, nidNumber, rating |
| **Property** | Rental listings | ownerId, title, type, status, rentAmount |
| **Booking** | Rental requests | propertyId, userId, status, totalAmount |
| **Payment** | Stripe payments | bookingId, status, stripeSessionId |
| **Review** | User reviews | bookingId, rating, comment, isFlagged |
| **Notification** | In-app alerts | userId, title, type, isRead |
| **BlogPost** | Admin articles | authorId, title, slug, isPublished |

### 6.2 Enums

| Enum | Values |
|------|--------|
| **UserRole** | ADMIN, OWNER, USER |
| **PropertyType** | FAMILY_FLAT, BACHELOR_ROOM, SUBLET, HOSTEL, OFFICE_SPACE, COMMERCIAL |
| **PropertyStatus** | PENDING, APPROVED, REJECTED |
| **AvailableFor** | FAMILY, BACHELOR, CORPORATE, ANY |
| **BookingStatus** | PENDING, ACCEPTED, PAYMENT_PENDING, CONFIRMED, DECLINED, CANCELLED |
| **PaymentStatus** | PENDING, SUCCESS, FAILED, REFUNDED |

### 6.3 Key Relationships
- User → OwnerProfile: 1:1 (if role=OWNER)
- User → Property: 1:N (owner)
- User → Booking: 1:N (user)
- Property → Booking: 1:N
- Booking → Payment: 1:1
- Booking → Review: 1:1

---

## 7. AI Features

### 7.1 Smart Property Recommendations
**Trigger:** User visits `/dashboard/recommendations`

**Process:**
1. Fetch user's past bookings and reviews
2. Extract preferences (property type, location, price range)
3. Get candidate properties (approved, active)
4. Send structured data to GPT-4o
5. Return ranked property IDs to frontend

**Data Used:**
- User: booking history, reviews
- Property: type, city, rentAmount, rating

### 7.2 AI Description Generator
**Trigger:** Owner clicks "Generate with AI" on property form

**Process:**
1. Collect property details (type, location, size, amenities)
2. Construct prompt for professional description
3. GPT-4o returns 3-paragraph description
4. Populate textarea for owner editing
5. Owner saves to database

**Prompt Structure:**
> Write a professional rental listing description for a [type] in [area], [city]. Features: [N] bedrooms, [M] bathrooms, [size] sqft. Available for [availableFor]. Price: BDT [rentAmount]/month. Highlight: [amenities].

### 7.3 Rent Price Suggestion
**Trigger:** Owner enters property details

**Process:**
1. Query database for similar properties
2. Calculate average rent by city/area/type
3. Send market data + property specs to GPT-4o
4. Return competitive rent range
5. Display as hint bubble

**Data Used:**
- Database average from similar properties
- Property size, bedrooms, bathrooms

---


## Folder Structure



renthome-backend/
├── src/
│   ├── config/
│   │   ├── index.ts                 # Environment configuration
│   │   ├── database.ts              # Database configuration
│   │   ├── redis.ts                 # Redis configuration
│   │   ├── cloudinary.ts            # Cloudinary config
│   │   ├── payment.ts               # Payment gateway configs
│   │   └── constants.ts             # App constants
│   │
│   ├── lib/
│   │   ├── prisma.ts                # Prisma client instance
│   │   ├── redis.ts                 # Redis client instance
│   │   ├── logger.ts                # Winston/Pino logger
│   │   └── queue.ts                 # Bull queue instance
│   │
│   ├── errors/
│   │   ├── AppError.ts              # Custom error class
│   │   ├── handlePrismaError.ts     # Prisma error handler
│   │   ├── handlePrismaValidationError.ts
│   │   ├── handleZodError.ts        # Zod validation errors
│   │   └── errorCodes.ts            # Error code constants
│   │
│   ├── interfaces/
│   │   ├── error.ts                 # Error type definitions
│   │   ├── pagination.ts            # Pagination interfaces
│   │   ├── request.ts               # Extended request interface
│   │   └── response.ts              # Response interfaces
│   │
│   ├── middlewares/
│   │   ├── auth.ts                  # JWT auth middleware
│   │   ├── globalErrorHandler.ts    # Global error handler
│   │   ├── notFound.ts              # 404 handler
│   │   ├── validateRequest.ts       # Zod validation middleware
│   │   ├── roleGuard.ts             # Role-based access control
│   │   ├── rateLimiter.ts           # Rate limiting middleware
│   │   ├── upload.ts                # File upload middleware
│   │   └── cache.ts                 # Redis cache middleware
│   │
│   ├── modules/
│   │   ├── Auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.utils.ts        # JWT helpers, password hashing
│   │   │   ├── auth.validation.ts
│   │   │   ├── auth.constant.ts
│   │   │   ├── auth.interface.ts
│   │   │   └── auth.events.ts       # Auth event handlers
│   │   │
│   │   ├── User/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.route.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.utils.ts
│   │   │   ├── user.validation.ts
│   │   │   ├── user.constant.ts
│   │   │   ├── user.interface.ts
│   │   │   └── user.events.ts
│   │   │
│   │   ├── Property/
│   │   │   ├── property.controller.ts
│   │   │   ├── property.route.ts
│   │   │   ├── property.service.ts
│   │   │   ├── property.utils.ts    # Slug generation, image handling
│   │   │   ├── property.validation.ts
│   │   │   ├── property.constant.ts
│   │   │   ├── property.interface.ts
│   │   │   ├── property.events.ts
│   │   │   └── property.filter.ts   # Search/filter logic
│   │   │
│   │   ├── Booking/
│   │   │   ├── booking.controller.ts
│   │   │   ├── booking.route.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── booking.utils.ts
│   │   │   ├── booking.validation.ts
│   │   │   ├── booking.constant.ts
│   │   │   ├── booking.interface.ts
│   │   │   ├── booking.events.ts
│   │   │   └── booking.workflow.ts  # Booking state machine
│   │   │
│   │   ├── Payment/
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.route.ts
│   │   │   ├── payment.service.ts
│   │   │   ├── payment.utils.ts
│   │   │   ├── payment.validation.ts
│   │   │   ├── payment.constant.ts
│   │   │   ├── payment.interface.ts
│   │   │   ├── payment.events.ts
│   │   │   └── gateways/
│   │   │       ├── shurjopay.ts     # ShurjoPay integration
│   │   │       ├── stripe.ts        # Stripe integration
│   │   │       ├── bkash.ts         # bKash integration
│   │   │       ├── nagad.ts         # Nagad integration
│   │   │       └── index.ts
│   │   │
│   │   ├── Review/
│   │   │   ├── review.controller.ts
│   │   │   ├── review.route.ts
│   │   │   ├── review.service.ts
│   │   │   ├── review.utils.ts
│   │   │   ├── review.validation.ts
│   │   │   ├── review.constant.ts
│   │   │   ├── review.interface.ts
│   │   │   └── review.events.ts
│   │   │
│   │   ├── Category/
│   │   │   ├── category.controller.ts
│   │   │   ├── category.route.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.utils.ts
│   │   │   ├── category.validation.ts
│   │   │   ├── category.constant.ts
│   │   │   └── category.interface.ts
│   │   │
│   │   ├── Dashboard/
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── dashboard.route.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── dashboard.utils.ts
│   │   │   ├── dashboard.validation.ts
│   │   │   ├── dashboard.constant.ts
│   │   │   └── dashboard.interface.ts
│   │   │
│   │   ├── Admin/
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.route.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.utils.ts
│   │   │   ├── admin.validation.ts
│   │   │   ├── admin.constant.ts
│   │   │   └── admin.interface.ts
│   │   │
│   │   ├── Notification/
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.route.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── notification.utils.ts
│   │   │   ├── notification.validation.ts
│   │   │   ├── notification.constant.ts
│   │   │   ├── notification.interface.ts
│   │   │   └── providers/
│   │   │       ├── email.ts         # Email provider
│   │   │       ├── sms.ts           # SMS provider
│   │   │       ├── push.ts          # Push notification
│   │   │       └── index.ts
│   │   │
│   │   ├── Message/
│   │   │   ├── message.controller.ts
│   │   │   ├── message.route.ts
│   │   │   ├── message.service.ts
│   │   │   ├── message.utils.ts
│   │   │   ├── message.validation.ts
│   │   │   ├── message.constant.ts
│   │   │   ├── message.interface.ts
│   │   │   └── message.socket.ts    # WebSocket handlers
│   │   │
│   │   ├── Analytics/
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.route.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── analytics.utils.ts
│   │   │   ├── analytics.validation.ts
│   │   │   ├── analytics.constant.ts
│   │   │   ├── analytics.interface.ts
│   │   │   └── processors/
│   │   │       ├── daily.processor.ts
│   │   │       ├── weekly.processor.ts
│   │   │       └── monthly.processor.ts
│   │   │
│   │   └── Blog/
│   │       ├── blog.controller.ts
│   │       ├── blog.route.ts
│   │       ├── blog.service.ts
│   │       ├── blog.utils.ts
│   │       ├── blog.validation.ts
│   │       ├── blog.constant.ts
│   │       └── blog.interface.ts
│   │
│   ├── routes/
│   │   ├── index.ts                 # Route aggregator
│   │   └── webhooks.ts              # Webhook routes (payment callbacks)
│   │
│   ├── utils/
│   │   ├── catchAsync.ts            # Async error wrapper
│   │   ├── sendResponse.ts          # Response formatter
│   │   ├── pagination.ts            # Pagination helper
│   │   ├── slugify.ts               # Slug generation
│   │   ├── dateHelpers.ts           # Date manipulation
│   │   ├── fileUpload.ts            # File upload helper
│   │   ├── cloudinary.ts            # Cloudinary upload
│   │   ├── cache.ts                 # Redis cache helpers
│   │   └── validators.ts            # Custom validators
│   │
│   ├── jobs/                        # Background jobs
│   │   ├── index.ts                 # Queue initialization
│   │   ├── email.job.ts
│   │   ├── notification.job.ts
│   │   ├── analytics.job.ts
│   │   ├── bookingExpiration.job.ts
│   │   └── paymentReconciliation.job.ts
│   │
│   ├── events/
│   │   ├── index.ts                 # Event emitter setup
│   │   ├── handlers/
│   │   │   ├── user.handler.ts
│   │   │   ├── property.handler.ts
│   │   │   ├── booking.handler.ts
│   │   │   └── payment.handler.ts
│   │   └── listeners.ts             # Event listeners registration
│   │
│   ├── templates/                   # Email templates
│   │   ├── welcome.hbs
│   │   ├── booking-confirmation.hbs
│   │   ├── booking-request.hbs
│   │   ├── payment-receipt.hbs
│   │   ├── property-approved.hbs
│   │   ├── property-rejected.hbs
│   │   ├── reset-password.hbs
│   │   └── partials/
│   │       ├── header.hbs
│   │       └── footer.hbs
│   │
│   ├── __tests__/
│   │   ├── unit/
│   │   │   ├── modules/
│   │   │   │   ├── Auth/
│   │   │   │   ├── User/
│   │   │   │   └── Property/
│   │   │   └── utils/
│   │   ├── integration/
│   │   │   ├── routes/
│   │   │   └── database/
│   │   ├── fixtures/
│   │   │   ├── users.ts
│   │   │   ├── properties.ts
│   │   │   └── bookings.ts
│   │   └── helpers/
│   │       └── testSetup.ts
│   │
│   ├── app.ts                       # Express app setup
│   └── server.ts                    # Server entry point
│
├── prisma/
│   ├── schema.prisma                # Prisma schema
│   ├── migrations/                  # Migration files
│   │   └── ...
│   ├── seed.ts                      # Seed script
│   └── seeds/
│       ├── users.seed.ts
│       ├── categories.seed.ts
│       ├── amenities.seed.ts
│       └── cities.seed.ts
│
├── scripts/
│   ├── deploy.sh
│   ├── backup-db.sh
│   └── cleanup.sh
│
├── uploads/                         # Temporary uploads (not committed)
│   └── .gitkeep
│
├── logs/                            # Application logs (not committed)
│   ├── .gitkeep
│   └── error.log
│
├── .env.example                     # Environment variables example
├── .env.development                 # Development env (not committed)
├── .env.production                  # Production env (not committed)
├── .env.test                        # Test env
├── .gitignore
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── .dockerignore
├── tsconfig.json                    # TypeScript configuration
├── tsconfig.build.json              # Build-specific TypeScript config
├── package.json
├── package-lock.json
├── nodemon.json                     # Nodemon configuration
├── jest.config.ts                   # Jest test configuration
├── docker-compose.yml               # Docker compose for development
├── Dockerfile                       # Docker configuration
├── Dockerfile.dev                   # Development Dockerfile
├── README.md
└── .github/
    └── workflows/
        ├── ci.yml                   # Continuous Integration
        └── deploy.yml               # Deployment workflow

## 8. Booking & Payment Flow

### Flow Diagram :  https://mermaid.ai/d/faf2e05e-8269-4182-9621-f973b2d5ca9e

