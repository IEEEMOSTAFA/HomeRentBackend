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

### 5.8 Images (Cloudinary)
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/images/upload` | Auth | Upload single image |
| POST | `/api/images/upload-multiple` | Auth | Upload multiple images (max 10) |
| DELETE | `/api/images/:imageUrl` | Auth | Delete single image |
| POST | `/api/images/delete-multiple` | Auth | Delete multiple images |

**Image Upload Details:**
- **Supported formats:** JPEG, PNG, WebP, GIF
- **Max file size:** 5MB per image
- **Max images per request:** 10 (batch upload)
- **Storage:** Cloudinary CDN (secure_url)
- **Folder structure:** `/homerent` by default, customizable via `folder` field in request body
- **Response:** Returns array of secure Cloudinary URLs for storage in database
- **DELETE format:** URL should be encoded when passed as URL parameter

**Upload Single Example:**
```
POST /api/images/upload
Content-Type: multipart/form-data

{
  "image": <binary>,
  "folder": "homerent/properties" (optional)
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "filename": "property.jpg",
    "size": 245789
  }
}
```

**Upload Multiple Example:**
```
POST /api/images/upload-multiple
Content-Type: multipart/form-data

{
  "images": [<binary1>, <binary2>, ...],
  "folder": "homerent/properties" (optional)
}

Response:
{
  "statusCode": 200,
  "success": true,
  "message": "3 image(s) uploaded successfully",
  "data": {
    "urls": ["https://res.cloudinary.com/...", ...],
    "count": 3,
    "filenames": ["img1.jpg", "img2.jpg", "img3.jpg"]
  }
}
```

### 5.9 Blog
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/blog` | Public | List published posts |
| GET | `/api/blog/:slug` | Public | Get single post |
| POST | `/api/blog` | Admin | Create blog post |
| PATCH | `/api/blog/:id/publish` | Admin | Publish/unpublish |

### 5.10 AI
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

## 8. Booking & Payment Flow

### Flow Diagram
