# 🎯 HomeRent API Testing - Complete Setup Summary

## 📦 Files Created/Updated for Testing

### 1. **User Validation Schema** ✅
**File:** `src/modules/User/user.validation.ts`

Added comprehensive Zod validation schemas for:
- `signupValidationSchema` - Email format, password strength (8+ chars, uppercase, number)
- `loginValidationSchema` - Email and password validation
- `updateRoleValidationSchema` - Only USER or OWNER roles allowed
- `updateProfileValidationSchema` - Optional profile updates

**Properties:**
- Name: 2-50 characters
- Email: Valid email format
- Password: 8-50 chars, must contain uppercase + number
- Role: USER or OWNER (ADMIN restricted to system)

---

### 2. **Postman Collection** ✅
**File:** `HomeRent-API.postman_collection.json`

Complete API testing collection with:
- **🔐 Authentication (5 endpoints)**
  - Sign Up - USER Role
  - Sign Up - OWNER Role
  - Sign In (auto-saves token)
  - Get Session
  - Sign Out

- **👤 User Profile (3 endpoints)**
  - Get Current User
  - Update Role to OWNER
  - Update Role to USER

- **🧪 Test Scenarios (2 complete workflows)**
  - Scenario 1: USER signup → verify email → login
  - Scenario 2: USER signup → OWNER role → OwnerProfile creation

- **❌ Error Testing (5 test cases)**
  - Invalid email format
  - Weak password
  - Invalid role update
  - Unauthorized access
  - Email already exists

**Features:**
- Auto-saves auth token after login
- Pre-configured test data
- Bearer token authentication
- Environment variable support

---

### 3. **Postman Environment** ✅
**File:** `HomeRent-Dev.postman_environment.json`

Development environment with variables:
```
base_url: http://localhost:5000
auth_token: (auto-filled after login)
user_email: user@example.com
user_password: Password123
owner_email: owner@example.com
owner_password: OwnerPass123
app_name: HomeRent Backend
environment: development
```

---

### 4. **Testing Guide** ✅
**File:** `POSTMAN_TESTING_GUIDE.md`

Comprehensive guide including:
- Quick start setup
- Step-by-step testing workflow
- Complete test scenarios
- Error testing guide
- Schema validation reference
- Environment variables reference
- Troubleshooting section
- API documentation
- Pro tips

---

### 5. **Helper Functions** ✅
**File:** `POSTMAN_HELPERS.js`

Reusable functions and snippets:
- `generateTestEmail()` - Generate unique test emails
- `generateSignupBody()` - Create signup payload
- `generateLoginBody()` - Create login payload
- `generateUpdateRoleBody()` - Create role update payload
- `validateSignupResponse()` - Validate signup response structure
- `validateLoginResponse()` - Validate login response
- `validateUserProfileResponse()` - Validate user profile
- `validateOwnerProfileResponse()` - Validate owner profile
- Test script examples for responses
- Error test cases
- Usage examples

---

## 🔄 Complete Testing Workflow

### Phase 1: Setup
```bash
1. npm run dev                    # Start server
2. Import .json files in Postman
3. Select Environment: "HomeRent - Development"
```

### Phase 2: User Registration & Authentication
```
1️⃣ Create Account
   POST /api/auth/sign-up

2️⃣ Verify Email
   (Check email link - automatic in better-auth)

3️⃣ Login
   POST /api/auth/sign-in
   → ✅ Token auto-saved

4️⃣ Get Profile
   GET /api/auth/me
```

### Phase 3: Role Transition (USER → OWNER)
```
1️⃣ User currently has role: "USER"

2️⃣ Update to OWNER
   PATCH /api/auth/update-role
   Body: { "role": "OWNER" }

3️⃣ OwnerProfile AUTOMATICALLY created with:
   - phone: null
   - nidNumber: null
   - verified: false
   - totalProperties: 0
   - totalEarnings: 0
   - rating: 0
   - totalReviews: 0

4️⃣ Verify OwnerProfile
   GET /api/auth/me
   → See ownerProfile in response
```

---

## 📊 Schema Alignment

### User Model (schema.prisma)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          UserRole  @default(USER)      // Fixed at signup
  isActive      Boolean   @default(true)
  isBanned      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

### Validations Applied
✅ name: 2-50 characters  
✅ email: Valid format, unique  
✅ password: 8-50 chars, uppercase + number  
✅ role: USER or OWNER (ADMIN only via system)  
✅ isActive: true by default  
✅ isBanned: false by default  
✅ emailVerified: false by default  

### OwnerProfile Auto-Creation
When user updates role to OWNER:
```typescript
await prisma.ownerProfile.create({
  data: {
    userId: session.user.id,
    phone: null,
    nidNumber: null,
    verified: false,
    totalProperties: 0,
    totalEarnings: 0,
    rating: 0,
    totalReviews: 0,
  },
});
```

---

## ✨ Key Features

### ✅ Auto Token Saving
```javascript
// Runs automatically after Sign In
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.session && jsonData.session.token) {
        pm.environment.set("auth_token", jsonData.session.token);
    }
}
```

### ✅ Bearer Token Authentication
All authenticated requests automatically include:
```
Authorization: Bearer {{auth_token}}
```

### ✅ Environment Variables
Dynamic URLs and credentials:
```
base_url: {{base_url}}
auth_token: {{auth_token}}
```

### ✅ Request Organization
Requests organized by feature:
- 🔐 Authentication
- 👤 User Profile
- 🧪 Test Scenarios
- ❌ Error Testing

---

## 🚀 Quick Start Commands

```bash
# Start server
npm run dev

# In another terminal, open Postman and:
# 1. Import HomeRent-API.postman_collection.json
# 2. Import HomeRent-Dev.postman_environment.json
# 3. Select Environment: "HomeRent - Development"
# 4. Start with "🔐 Authentication > Sign Up"
```

---

## 🧪 Test Cases Included

### Authentication (5 tests)
- ✅ Sign up new user
- ✅ Sign up duplicate email handling
- ✅ Sign in with credentials
- ✅ Get session info
- ✅ Sign out

### User Profile (3 tests)
- ✅ Get current user
- ✅ Update role USER → OWNER
- ✅ Update role OWNER → USER

### Scenarios (2 complete workflows)
- ✅ Basic user workflow
- ✅ Owner onboarding workflow

### Errors (5 error cases)
- ✅ Invalid email validation
- ✅ Weak password validation
- ✅ Invalid role validation
- ✅ Unauthorized access (no token)
- ✅ Email duplication

---

## 📋 Validation Rules (Quick Reference)

| Field | Rule | Example ✅ | Invalid ❌ |
|-------|------|----------|-----------|
| Name | 2-50 chars | "John Doe" | "Jo", "x" * 51 |
| Email | Valid format | "user@test.com" | "invalid", "test@" |
| Password | 8-50, A-Z, 0-9 | "Pass123" | "pass123", "Pass" |
| Role | USER\|OWNER | "OWNER" | "ADMIN", "user" |

---

## 📈 Next Steps

1. ✅ Test auth endpoints with Postman
2. ⏳ Create Property endpoints
3. ⏳ Create Booking endpoints
4. ⏳ Create Payment endpoints
5. ⏳ Create Review endpoints
6. ⏳ Create Admin endpoints

---

## 📞 Support Files Reference

| File | Purpose |
|------|---------|
| `POSTMAN_TESTING_GUIDE.md` | Detailed testing instructions |
| `POSTMAN_HELPERS.js` | Reusable functions & snippets |
| `HomeRent-API.postman_collection.json` | All endpoints |
| `HomeRent-Dev.postman_environment.json` | Environment variables |
| `src/modules/User/user.validation.ts` | Validation schemas |

---

**Status:** ✅ Ready for Testing
**Created:** March 25, 2026
**Last Updated:** March 25, 2026, 23:45
