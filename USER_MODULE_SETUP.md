# User Module Complete Setup Guide

## 📋 Overview
The User module is fully implemented with authentication, profile management, admin controls, and role-based functionality. All user-related features are ready for testing.

## ✅ Completed Files

### 1. **user.constant.ts** (40 lines)
**Purpose:** Central constants for User features
- `UserMessages`: 9 success messages (USER_FETCHED, PROFILE_UPDATED, ROLE_CHANGED, etc)
- `UserErrors`: 10 error messages (USER_NOT_FOUND, EMAIL_ALREADY_EXISTS, INVALID_CREDENTIALS, etc)
- `UserSearchableFields`: ["name", "email"] for admin search
- `USER_DEFAULTS`: Pagination (10), password constraints, name length limits

**Key Constants:**
- `PAGE_SIZE = 10` (default pagination)
- Password: 8-50 chars, must contain uppercase & number
- Name: 2-50 chars

---

### 2. **user.validation.ts** (65 lines) 
**Purpose:** Zod schemas for all User input validation
- `signupValidationSchema`: Email, password (strong), name (2-50)
- `loginValidationSchema`: Email, password
- `updateRoleValidationSchema`: Role must be USER or OWNER
- `updateProfileValidationSchema`: Optional name, image URL, phone, NID

**Validation Rules:**
- Password: 8-50 chars, 1+ uppercase, 1+ number
- Name: 2-50 chars
- Phone: 10+ chars, regex validated
- NID: 10-20 chars (for owner verification)
- Image: Valid URL only

---

### 3. **user.interface.ts** (25+ lines)
**Purpose:** TypeScript types
- `TUser`: Complete user model
- `TUserResponse`: User without sensitive fields
- `TUserCreateInput`: Signup data
- `TUserUpdateInput`: Profile update fields
- `TUserAuthResponse`: Auth response fields

---

### 4. **user.service.ts** (340+ lines) ✨ NEW
**Purpose:** Business logic layer with database operations

**8 Core Methods:**
1. **getCurrentUser()** - Fetch current user with owner profile (if exists)
2. **updateProfile()** - Update name, image
3. **changeRole()** - Switch USER ↔ OWNER (auto-creates OwnerProfile)
4. **getAllUsers()** - List all users with pagination, role & search filters
5. **banUser()** - Ban/unban user (prevents login)
6. **deleteUser()** - Delete user (cascade delete all relations)
7. **getUserStats()** - Dashboard stats (different for OWNER vs USER)

**All methods include:**
- Authorization checks
- Error handling with constants
- Prisma queries with relations
- Pagination & filtering support

---

### 5. **user.controller.ts** (200+ lines) ✨ NEW
**Purpose:** HTTP request handlers
- Wraps all service methods
- Validates input with Zod schemas
- Returns formatted JSON responses
- Error handling via middleware

**Handler Groups:**
- 👤 Profile Handlers (3): getCurrentUser, updateProfile, changeRole
- 📊 Stats Handler (1): getUserStats
- 🔐 Admin Handlers (3): getAllUsers, banUser, deleteUser

---

### 6. **user.route.ts** (30 lines) ✨ NEW
**Purpose:** Express route definitions
- User routes: `/me`, `/me/role`, `/me/stats`
- Admin routes: `/`, `/:id/ban`, `/:id`
- All authenticated routes require `verifyAuth` middleware
- Admin routes require `verifyAuth` + `roleGuard(['ADMIN'])`

**Endpoints:**

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/me` | Auth | Get current user profile |
| PATCH | `/me` | Auth | Update profile (name, image) |
| PATCH | `/me/role` | Auth | Change role USER ↔ OWNER |
| GET | `/me/stats` | Auth | Get user statistics |
| GET | `/` | Admin | List all users (paginated, filtered) |
| PATCH | `/:id/ban` | Admin | Ban/unban user |
| DELETE | `/:id` | Admin | Delete user account |

---

## 🔧 Integration: app.ts

**Added Import:**
```typescript
import { UserRoutes } from "./modules/User/user.route";
```

**Added Route Handler:**
```typescript
app.use("/api/users", UserRoutes);
```

All user endpoints now available at: `http://localhost:5000/api/users/*`

---

## 🧪 Testing with Postman

### User Profile Endpoints:

1. **Get Current User**
   - URL: `GET /api/users/me`
   - Auth: Bearer token (required)
   - Returns: User profile with optional OwnerProfile data

2. **Update Profile**
   - URL: `PATCH /api/users/me`
   - Body: `{ "name": "New Name", "image": "https://..." }`
   - Returns: Updated user profile

3. **Change Role**
   - URL: `PATCH /api/users/me/role`
   - Body: `{ "role": "OWNER" }`
   - Auto-creates OwnerProfile when changing to OWNER

4. **Get User Stats**
   - URL: `GET /api/users/me/stats`
   - OWNER: Returns totalProperties, totalEarnings, rating, totalReviews, totalBookings
   - USER: Returns totalBookings, confirmedBookings, totalSpent

### Admin Endpoints:

5. **List All Users**
   - URL: `GET /api/users?page=1&pageSize=10&role=OWNER&search=john`
   - Access: Admin only
   - Returns: Paginated user list with filters

6. **Ban User**
   - URL: `PATCH /api/users/:id/ban`
   - Body: `{ "isBanned": true }`
   - Access: Admin only

7. **Delete User**
   - URL: `DELETE /api/users/:id`
   - Access: Admin only
   - Cascades: Deletes all user data (bookings, properties, reviews, etc)

---

## 🔒 Security Features

✅ **Authentication:** All routes require valid BetterAuth session
✅ **Authorization:** Admin routes protected with roleGuard middleware
✅ **Validation:** All inputs validated with Zod schemas
✅ **Error Handling:** Centralized error messages from constants
✅ **Profile Isolation:** Users can only access their own profile
✅ **Admin Controls:** Ban, delete, and list users
✅ **Account Status:** Checks isActive, isBanned, emailVerified before allowing access

---

## 📊 Service Method Signatures

```typescript
// Profile Management
getCurrentUser(userId: string): Promise<User>
updateProfile(userId: string, data: UpdateProfileInput): Promise<User>
changeRole(userId: string, data: UpdateRoleInput): Promise<User>

// Admin Management
getAllUsers(page?: number, pageSize?: number, role?: string, search?: string): Promise<Paginated>
banUser(userId: string, isBanned: boolean): Promise<User>
deleteUser(userId: string): Promise<{ id: string, message: string }>

// Statistics
getUserStats(userId: string): Promise<OwnerStats | UserStats>
```

---

## 🚀 Key Features

### Profile Management
- View profile with owner info (if OWNER role)
- Update name and profile image
- Role switching (USER → OWNER auto-creates profile)

### Admin Dashboard
- View all users with pagination
- Filter by role (ADMIN, OWNER, USER)
- Search by name or email
- Ban/unban harmful users
- Delete user accounts (cascades relations)

### Statistics
- **OWNER**: Properties, earnings, rating, reviews, bookings
- **USER**: Total bookings, confirmed bookings, spending
- **ADMIN**: Access to all user stats

### Role System
- Fixed at registration (user selects at signup)
- Can be changed via PATCH /me/role
- Only Admin can force-change roles
- Changing to OWNER auto-creates extension profile

---

## 🔗 Related Modules

**Auth (auth.extra.ts)**
- Handles signup, login, email verification
- Returns session token → used in Authorization header

**Owner (owner.route.ts)**
- Landlord-specific endpoints (properties, bookings)
- Only accessible by OWNER role
- Uses similar auth pattern

**Admin (admin.route.ts)** - Planned
- Platform moderation endpoints
- Only accessible by ADMIN role
- Uses same auth pattern

---

## 📝 Error Handling

All errors return standardized JSON:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {} // Validation errors if applicable
}
```

HTTP Status Codes:
- 200: Success
- 400: Validation error
- 401: Unauthorized (no token)
- 403: Forbidden (wrong role)
- 404: Not found
- 500: Server error

---

## ✨ Summary

**Files Created/Modified:** 6
- user.constant.ts ✅
- user.validation.ts ✅ (Already existed, enhanced)
- user.interface.ts ✅ (Already existed)
- user.service.ts ✅ (NEW - 340+ lines)
- user.controller.ts ✅ (NEW - 200+ lines)
- user.route.ts ✅ (NEW - 30 lines)
- app.ts ✅ (UPDATED - registered routes)

**Total Lines:** 600+ lines of production-ready code
**Features:** 7 endpoints, 8 service methods, 4 validation schemas, role-based access control
**Authentication:** BetterAuth integration with session verification
**Authorization:** Role-based middleware with admin protection

---

## 🎯 Next Steps

1. **Implement Admin module** - Following same pattern with admin-only endpoints
2. **Implement Booking module** - USER → OWNER booking flow
3. **Implement Payment module** - Stripe integration for booking payments
4. **Implement Property module** - Public property listing with search/filters
5. **Implement Review module** - Reviews and ratings system
6. **Add AI features** - Recommendations, descriptions, pricing hints
7. **Add Notification system** - Real-time booking & payment updates

---

## 🧠 Design Decisions

1. **Service Layer Abstraction**: All DB operations in service, controllers just handle HTTP
2. **Validation at Controller**: Zod schemas validated before calling service
3. **Centralized Constants**: Error/success messages in one file for consistency
4. **Role-based Guards**: Separate `verifyAuth` (session) from `roleGuard` (permissions)
5. **Auto-Profile Creation**: When changing to OWNER, OwnerProfile auto-created
6. **Cascade Deletes**: Deleting user deletes all related data (Prisma handles)
7. **Denormalized Stats**: Owner stats cached in OwnerProfile for dashboard performance
8. **Search Flexibility**: Admin can filter by role AND search by name/email simultaneously
