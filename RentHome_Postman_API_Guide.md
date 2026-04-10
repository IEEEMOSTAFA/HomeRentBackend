# 🏠 RentHome — Postman API Testing Guide
**Backend: Express + TypeScript | Base URL: `http://localhost:5000`**

> ✅ এই document টা actual backend route files থেকে তৈরি।  
> ⚠️ PRD-এর কিছু route আর actual implementation-এ পার্থক্য আছে — নিচে সেগুলো noted।

---

## 📌 Global Setup (Postman Environment)

```
Variable        | Value
----------------|-------------------------------
BASE_URL        | http://localhost:5000
TOKEN           | (login করার পর session token রাখবে)
```

**Headers (সব protected route-এ):**
```
Content-Type: application/json
Cookie: session={{TOKEN}}   ← BetterAuth uses cookies
```

---

## 1. 🔐 AUTH — BetterAuth Routes

> BetterAuth নিজেই routes handle করে। সাধারণত `/api/auth/*` prefix-এ থাকে।

| Method | Endpoint | Access | Body |
|--------|----------|--------|------|
| POST | `/api/auth/sign-up/email` | Public | `{ name, email, password, role }` |
| POST | `/api/auth/sign-in/email` | Public | `{ email, password }` |
| POST | `/api/auth/sign-out` | Auth | — |
| POST | `/api/auth/verify-email` | Auth | `{ otp }` |
| GET | `/api/auth/get-session` | Auth | — |

### ✅ Register Example
```json
POST /api/auth/sign-up/email
{
  "name": "Rahim Uddin",
  "email": "rahim@example.com",
  "password": "Pass1234!",
  "role": "USER"   // "USER" | "OWNER" | "ADMIN"
}
```

### ✅ Login Example
```json
POST /api/auth/sign-in/email
{
  "email": "rahim@example.com",
  "password": "Pass1234!"
}
```
> **Response-এ cookie পাবে** — Postman automatically সেটা পাঠাবে পরের request-এ।

---

## 2. 👤 USERS — `/api/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users/me` | Auth | নিজের profile দেখো |
| PATCH | `/api/users/me` | Auth | Profile update করো |
| PATCH | `/api/users/me/role` | Auth | Role change করো |
| GET | `/api/users/me/stats` | Auth | নিজের statistics |
| GET | `/api/users` | Admin only | সব users list |
| PATCH | `/api/users/:id/ban` | Admin only | User ban/unban |
| DELETE | `/api/users/:id` | Admin only | User delete |

### ✅ Update Profile Example
```json
PATCH /api/users/me
{
  "name": "Rahim Updated",
  "phone": "01700000000",
  "image": "https://res.cloudinary.com/..."
}
```

### ✅ Change Role Example
```json
PATCH /api/users/me/role
{
  "role": "OWNER"
}
```

### ✅ Ban User (Admin)
```json
PATCH /api/users/clxxx123/ban
{
  "isBanned": true
}
```

---

## 3. 🏠 PROPERTIES — `/api/properties` (Public)

> ⚠️ **Important:** শুধু Public GET routes এখানে আছে।  
> Owner-এর property create/update/delete = `/api/owner/properties` (Section 4)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/properties` | Public | সব approved properties (filter সহ) |
| GET | `/api/properties/:id` | Public | একটা property detail (views++ হবে) |

### ✅ Filter করে Properties দেখো
```
GET /api/properties?city=Dhaka&type=FAMILY_FLAT&minRent=5000&maxRent=20000&bedrooms=2&page=1&pageSize=10&sort=newest
```

**Available Query Params:**
```
search      → full-text search (title, description, area)
city        → Dhaka | Chittagong | Sylhet | Rajshahi | etc.
area        → Mirpur | Gulshan | etc.
type        → FAMILY_FLAT | BACHELOR_ROOM | SUBLET | HOSTEL | OFFICE_SPACE | COMMERCIAL
availableFor → FAMILY | BACHELOR | CORPORATE | ANY
minRent     → number
maxRent     → number
bedrooms    → number
sort        → newest | price_asc | price_desc | rating
page        → number (default: 1)
pageSize    → number (default: 10)
```

---

## 4. 🔑 OWNER — `/api/owner` (Owner Only)

> সব route-এ `OWNER` role লাগবে।

### 4.1 Owner Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/profile` | নিজের owner profile দেখো |
| PATCH | `/api/owner/profile` | Profile update করো |
| GET | `/api/owner/stats` | Dashboard statistics |

```json
PATCH /api/owner/profile
{
  "businessName": "Rahim Properties",
  "nidNumber": "1234567890123",
  "phone": "01700000000",
  "bio": "Trusted landlord since 2010"
}
```

### 4.2 Owner Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/owner/properties` | নতুন property তৈরি করো |
| GET | `/api/owner/properties` | নিজের সব properties |
| GET | `/api/owner/properties/:id` | একটা property detail |
| PUT | `/api/owner/properties/:id` | Property update করো |
| DELETE | `/api/owner/properties/:id` | Property delete করো |

### ✅ Create Property Example
```json
POST /api/owner/properties
{
  "title": "Spacious Family Flat in Mirpur",
  "description": "3 bed family flat...",
  "type": "FAMILY_FLAT",
  "availableFor": "FAMILY",
  "city": "Dhaka",
  "area": "Mirpur-10",
  "address": "House 5, Road 3, Mirpur-10",
  "rentAmount": 18000,
  "bedrooms": 3,
  "bathrooms": 2,
  "size": 1200,
  "floor": 4,
  "amenities": ["GAS", "LIFT", "PARKING", "GENERATOR"],
  "images": ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."],
  "isAvailable": true
}
```

### ✅ Get Owner Properties (with filter)
```
GET /api/owner/properties?status=PENDING&page=1&pageSize=10
```
**Status options:** `PENDING | APPROVED | REJECTED`

### 4.3 Owner Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/bookings` | নিজের property-র সব bookings |
| PATCH | `/api/owner/bookings/:id` | Booking accept/decline |

```json
PATCH /api/owner/bookings/clxxx123
{
  "status": "ACCEPTED"   // or "DECLINED"
}
```

### 4.4 Owner Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/owner/properties/:propertyId/reviews` | Property-র reviews দেখো |
| PATCH | `/api/owner/reviews/:id/flag` | Review flag করো |

```json
PATCH /api/owner/reviews/clxxx123/flag
{
  "reason": "This review contains false information"
}
```

---

## 5. 📅 BOOKINGS — `/api/bookings`

> ⚠️ Owner-এর booking accept/decline = `/api/owner/bookings/:id` (Section 4.3)  
> এখানে শুধু User booking create ও cancel।

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/bookings` | USER only | Booking request পাঠাও |
| GET | `/api/bookings` | Auth (role filtered) | নিজের bookings list |
| GET | `/api/bookings/:id` | Auth | একটা booking detail |
| PATCH | `/api/bookings/:id/cancel` | USER only | Booking cancel করো |
| PATCH | `/api/bookings/:id/status` | OWNER only | Accept/decline |

### ✅ Create Booking
```json
POST /api/bookings
{
  "propertyId": "clxxx_property_id",
  "moveInDate": "2026-02-01",
  "message": "I am a family of 4, interested in this flat.",
  "months": 6
}
```

**Booking Status Flow:**
```
PENDING → ACCEPTED → PAYMENT_PENDING → CONFIRMED
        ↘ DECLINED
PENDING/ACCEPTED → CANCELLED (user cancel করতে পারে payment এর আগে)
```

---

## 6. 💳 PAYMENTS — `/api/payments`

> ⚠️ **PRD vs Actual পার্থক্য:**  
> PRD বলেছিল `/api/payments/initiate` কিন্তু actual route হলো `/api/payments/create-intent` + `/api/payments/confirm`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/webhook` | Stripe (Public) | Stripe webhook — Postman-এ test করবে না |
| POST | `/api/payments/create-intent` | USER only | Stripe Payment Intent তৈরি করো |
| POST | `/api/payments/confirm` | USER only | Payment confirm করো |
| GET | `/api/payments/my-payments` | USER only | নিজের সব payments |
| GET | `/api/payments/booking/:bookingId` | USER/ADMIN/OWNER | Booking-এর payment দেখো |
| GET | `/api/payments/:id` | USER/ADMIN/OWNER | Payment by ID |
| GET | `/api/payments` | ADMIN only | সব payments |
| POST | `/api/payments/:id/refund` | ADMIN only | Refund করো |

### ✅ Create Payment Intent
```json
POST /api/payments/create-intent
{
  "bookingId": "clxxx_booking_id"
}
```
**Response-এ পাবে:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentId": "clxxx_payment_id"
}
```

### ✅ Confirm Payment (Stripe success-এর পর)
```json
POST /api/payments/confirm
{
  "paymentId": "clxxx_payment_id",
  "stripePaymentIntentId": "pi_xxx"
}
```

### ✅ Admin Refund
```json
POST /api/payments/clxxx123/refund
{
  "reason": "Tenant requested cancellation"
}
```

---

## 7. ⭐ REVIEWS — `/api/reviews`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/reviews` | USER (confirmed booking) | Review দাও |
| GET | `/api/reviews/my` | Auth | নিজের reviews দেখো |
| GET | `/api/reviews/property/:propertyId` | Public | Property-র reviews দেখো |
| PATCH | `/api/reviews/:id/flag` | OWNER only | Review flag করো |
| GET | `/api/reviews` | ADMIN only | সব reviews (filter সহ) |
| PATCH | `/api/reviews/:id/hide` | ADMIN only | Review hide/show করো |
| PATCH | `/api/reviews/:id/visibility` | ADMIN only | Same as /hide (alias) |
| DELETE | `/api/reviews/:id` | ADMIN only | Review delete করো |

### ✅ Create Review
```json
POST /api/reviews
{
  "bookingId": "clxxx_booking_id",
  "rating": 4,
  "comment": "Very clean flat, good location. Owner was cooperative."
}
```

### ✅ Get All Reviews (Admin, with filter)
```
GET /api/reviews?isFlagged=true&page=1&limit=10
```

### ✅ Toggle Review Visibility (Admin)
```json
PATCH /api/reviews/clxxx123/hide
{
  "isHidden": true
}
```

---

## 8. 🔔 NOTIFICATIONS — `/api/notifications`

> শুধু `USER` এবং `OWNER` role notifications পাবে।

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | নিজের notifications দেখো |
| PATCH | `/api/notifications/mark-all-read` | সব notifications পড়া mark করো |
| PATCH | `/api/notifications/:id/read` | একটা notification পড়া mark করো |
| DELETE | `/api/notifications/:id` | একটা notification delete করো |

### ✅ Get Notifications (with filter)
```
GET /api/notifications?isRead=false&page=1&limit=20
```

> ⚠️ **Postman-এ সতর্কতা:** `mark-all-read` endpoint-টা `/:id` এর আগে declare করা হয়েছে, তাই কোনো conflict নেই। কিন্তু Postman-এ manually call করার সময় full URL দাও।

---

## 9. 🖼️ IMAGES — `/api/images`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/images/upload` | Auth | একটা image upload করো |
| POST | `/api/images/upload-multiple` | Auth | একাধিক image upload (max 10) |
| DELETE | `/api/images/:imageUrl` | Auth | একটা image delete করো |
| POST | `/api/images/delete-multiple` | Auth | একাধিক image delete করো |

### ✅ Single Image Upload (Postman)
```
POST /api/images/upload
Body → form-data:
  Key: image    | Type: File    | Value: [file select করো]
  Key: folder   | Type: Text    | Value: homerent/properties  (optional)
```

### ✅ Multiple Images Upload
```
POST /api/images/upload-multiple
Body → form-data:
  Key: images   | Type: File    | Value: [multiple files] 
  Key: folder   | Type: Text    | Value: homerent/properties  (optional)
```
> **Postman tip:** `images` key-এ multiple file add করতে — একই key নাম দিয়ে multiple row তৈরি করো।

### ✅ Delete Single Image
```
DELETE /api/images/https%3A%2F%2Fres.cloudinary.com%2Fdemo%2Fimage%2Fupload%2Fsample.jpg
```
> URL encode করে পাঠাতে হবে। Postman-এ `Params` tab-এ দাও — auto-encode করবে।

### ✅ Delete Multiple Images
```json
POST /api/images/delete-multiple
{
  "imageUrls": [
    "https://res.cloudinary.com/demo/image/upload/v1/sample1.jpg",
    "https://res.cloudinary.com/demo/image/upload/v1/sample2.jpg"
  ]
}
```

---

## 10. 📝 BLOG — `/api/blog` (Public)

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/blog` | Public | Published posts দেখো |
| GET | `/api/blog/:slug` | Public | একটা post (slug দিয়ে) |

```
GET /api/blog?page=1&pageSize=10
GET /api/blog/best-apartments-dhaka-2026
```

---

## 11. 🔴 ADMIN — `/api/admin` (Admin Only)

> সব route-এ `ADMIN` role + session লাগবে।

### 11.1 Property Moderation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/properties/pending` | Pending properties দেখো |
| PATCH | `/api/admin/properties/:id/status` | Approve / Reject করো |
| DELETE | `/api/admin/properties/:id` | Property force delete করো |

```json
PATCH /api/admin/properties/clxxx123/status
{
  "status": "APPROVED"    // or "REJECTED"
}
```

```json
// Reject with reason:
{
  "status": "REJECTED",
  "rejectionReason": "Images are not clear. Please re-upload."
}
```

### 11.2 Owner Verification

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/owners/unverified` | Unverified owners list |
| PATCH | `/api/admin/owners/:id/verify` | Owner verify করো |

```json
PATCH /api/admin/owners/clxxx123/verify
{
  "verified": true
}
```

### 11.3 Review Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/reviews/flagged` | Flagged reviews দেখো |
| PATCH | `/api/admin/reviews/:id/visibility` | Review hide/show করো |

```json
PATCH /api/admin/reviews/clxxx123/visibility
{
  "isHidden": true
}
```

### 11.4 Payment Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/payments` | সব payments দেখো |
| POST | `/api/admin/payments/:id/refund` | Payment refund করো |

```
GET /api/admin/payments?status=SUCCESS&page=1&limit=20
```

### 11.5 Blog Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/blog` | সব blog posts (published + unpublished) |
| POST | `/api/admin/blog` | নতুন post তৈরি করো |
| PATCH | `/api/admin/blog/:id` | Post update করো |
| PATCH | `/api/admin/blog/:id/publish` | Publish / Unpublish করো |
| DELETE | `/api/admin/blog/:id` | Post delete করো |

```json
POST /api/admin/blog
{
  "title": "Top 10 Affordable Rentals in Dhaka 2026",
  "slug": "top-10-affordable-rentals-dhaka-2026",
  "content": "Full article content here...",
  "featuredImage": "https://res.cloudinary.com/...",
  "tags": ["Dhaka", "Budget", "Family"],
  "isPublished": false
}
```

```json
PATCH /api/admin/blog/clxxx123/publish
{
  "isPublished": true
}
```

### 11.6 Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/analytics` | Dashboard overview stats |

```
GET /api/admin/analytics
Response: total users, properties, bookings, revenue, etc.
```

---

## 12. 🤖 AI — `/api/ai` (Role-specific)

> ⚠️ এই routes PRD-তে define করা কিন্তু route file শেয়ার করা হয়নি। Assume করা হচ্ছে নিচের structure।

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/ai/describe` | OWNER only | AI দিয়ে description তৈরি করো |
| POST | `/api/ai/recommend` | USER only | AI property recommendations পাও |
| POST | `/api/ai/price-hint` | OWNER only | AI rent price suggestion পাও |

### ✅ AI Description Generator
```json
POST /api/ai/describe
{
  "type": "FAMILY_FLAT",
  "city": "Dhaka",
  "area": "Mirpur-10",
  "bedrooms": 3,
  "bathrooms": 2,
  "size": 1200,
  "availableFor": "FAMILY",
  "rentAmount": 18000,
  "amenities": ["GAS", "LIFT", "PARKING"]
}
```

### ✅ AI Recommendations (User)
```json
POST /api/ai/recommend
{
  "limit": 5
}
// Backend নিজেই user-এর booking history দেখবে
```

### ✅ AI Price Hint (Owner)
```json
POST /api/ai/price-hint
{
  "city": "Dhaka",
  "area": "Mirpur-10",
  "type": "FAMILY_FLAT",
  "bedrooms": 3,
  "bathrooms": 2,
  "size": 1200
}
```

---

## ⚠️ PRD vs Actual Route — পার্থক্যের সারসংক্ষেপ

| Feature | PRD-তে ছিল | Actual Route |
|---------|-----------|--------------|
| Payment initiate | `POST /api/payments/initiate` | `POST /api/payments/create-intent` |
| Payment confirm | (নেই) | `POST /api/payments/confirm` |
| Owner properties | `POST /api/properties` (owner) | `POST /api/owner/properties` |
| Owner bookings | `PATCH /api/bookings/:id/status` | `PATCH /api/owner/bookings/:id` |
| Admin routes | `/api/properties/:id/status` | `/api/admin/properties/:id/status` |
| Admin blog | `/api/blog` (admin) | `/api/admin/blog` |
| Review visibility alias | (নেই) | `PATCH /api/reviews/:id/visibility` (alias) |
| Mark all read | (নেই) | `PATCH /api/notifications/mark-all-read` |
| Delete notification | (নেই) | `DELETE /api/notifications/:id` |
| Owner stats | (নেই) | `GET /api/owner/stats` |
| User stats | (নেই) | `GET /api/users/me/stats` |
| Change role | (নেই) | `PATCH /api/users/me/role` |
| Owner NID verification | Admin-only | `GET /api/admin/owners/unverified` + `PATCH /api/admin/owners/:id/verify` |

---

## 🧪 Testing Sequence (Postman Collection Order)

সব ঠিকঠাক test করতে এই order follow করো:

```
1.  Register (USER)                → /api/auth/sign-up/email
2.  Register (OWNER)               → /api/auth/sign-up/email  
3.  Register (ADMIN)               → /api/auth/sign-up/email
4.  Login as OWNER                 → /api/auth/sign-in/email
5.  Upload property images         → /api/images/upload-multiple
6.  Create property                → /api/owner/properties
7.  Login as ADMIN                 → /api/auth/sign-in/email
8.  Approve property               → /api/admin/properties/:id/status
9.  Login as USER                  → /api/auth/sign-in/email
10. Browse properties              → /api/properties
11. View property detail           → /api/properties/:id
12. Create booking                 → /api/bookings
13. Login as OWNER                 → /api/auth/sign-in/email
14. Accept booking                 → /api/owner/bookings/:id
15. Login as USER                  → /api/auth/sign-in/email
16. Create payment intent          → /api/payments/create-intent
17. Confirm payment                → /api/payments/confirm
18. Write review                   → /api/reviews
19. Check notifications            → /api/notifications
20. Login as ADMIN                 → /api/auth/sign-in/email
21. View analytics                 → /api/admin/analytics
```

---

*Generated from actual backend route files: admin.route.ts, blog.route.ts, booking.route.ts, image.routes.ts, notification.route.ts, owner.route.ts, payment.route.ts, property.route.ts, review.route.ts, user.route.ts*
