# 🚀 HomeRent API - Postman Testing Guide

## Quick Start

### 1. Import Files into Postman

1. Open Postman
2. Click **"Import"** button (top left)
3. Select the files:
   - `HomeRent-API.postman_collection.json` - API endpoints
   - `HomeRent-Dev.postman_environment.json` - Environment variables

### 2. Select Environment

- Click on the **Environment** dropdown (top right)
- Select **"HomeRent - Development"**

### 3. Verify Server is Running

```bash
npm run dev
```

Server should be running on `http://localhost:5000`

---

## 📋 Testing Workflow

### Step 1: Create a New User Account

1. Go to **🔐 Authentication > Sign Up - USER Role**
2. Modify the email and password in body (optional)
3. Send request
4. Response should contain success status and user ID

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "John User"
  }
}
```

### Step 2: Sign In

1. Go to **🔐 Authentication > Sign In**
2. Enter the same email and password from signup
3. Send request
4. ✅ **Token will automatically save to environment variable** `auth_token`

**Expected Response:**
```json
{
  "success": true,
  "session": {
    "token": "eyJ...",
    "user": { ... }
  }
}
```

### Step 3: Get Current User Profile

1. Go to **👤 User Profile > Get Current User**
2. Send request (token is automatically attached via Bearer auth)
3. See your profile with role, email, etc.

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "John User",
    "role": "USER",
    "emailVerified": false,
    "image": null,
    "isActive": true,
    "isBanned": false,
    "ownerProfile": null
  }
}
```

### Step 4: Update Role to OWNER

1. Go to **👤 User Profile > Update User Role to OWNER**
2. Send request
3. ✅ OwnerProfile is **automatically created** in database

**Expected Response:**
```json
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "John User",
    "role": "OWNER"
  }
}
```

### Step 5: Verify OwnerProfile was Created

1. Go to **👤 User Profile > Get Current User**
2. Send request
3. ✅ Now `ownerProfile` should contain owner data

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id_123",
    "email": "user@example.com",
    "name": "John User",
    "role": "OWNER",
    "ownerProfile": {
      "id": "owner_profile_123",
      "userId": "user_id_123",
      "phone": null,
      "nidNumber": null,
      "verified": false,
      "totalProperties": 0,
      "totalEarnings": 0,
      "rating": 0,
      "totalReviews": 0
    }
  }
}
```

---

## 🧪 Complete Test Scenarios

### Scenario 1: USER Workflow (Renter)

```
1. Sign Up as USER
   ↓
2. Verify Email (via email link)
   ↓
3. Sign In
   ↓
4. Get User Profile
   ↓
5. Search Properties
   ↓
6. Make Bookings
```

**Postman Flow:**
- 🔐 Authentication > Sign Up - USER Role
- 🔐 Authentication > Sign In
- 👤 User Profile > Get Current User

### Scenario 2: OWNER Workflow (Property Poster)

```
1. Sign Up as USER
   ↓
2. Sign In
   ↓
3. Update Role to OWNER
   ↓
4. Verify OwnerProfile Created
   ↓
5. Post Properties
   ↓
6. Respond to Bookings
   ↓
7. Receive Payments
```

**Postman Flow:**
- 🔐 Authentication > Sign Up - USER Role
- 🔐 Authentication > Sign In
- 👤 User Profile > Update User Role to OWNER
- 👤 User Profile > Get Current User

---

## 🧪 Test Scenarios (Ready to Use)

Go to **🧪 Test Scenarios** in Postman collection:

### ✅ Scenario 1: USER signup → verify email → login
All requests pre-configured with example data

### ✅ Scenario 2: USER signup → OWNER role → OwnerProfile
Complete owner onboarding flow

---

## ❌ Error Testing

Test error scenarios in **❌ Error Testing** folder:

| Test | Expected Error |
|------|---|
| **Invalid Email Format** | Validation error |
| **Weak Password** | Password must contain uppercase + number + min 8 chars |
| **Invalid Role Update** | Cannot set ADMIN role via API |
| **Unauthorized Access** | 401 - No auth token |
| **Email Already Exists** | Email already registered |

---

## 📊 Schema Validation

Your requests are validated against this schema:

### Signup Schema
```typescript
{
  name: string (2-50 chars)
  email: string (valid email)
  password: string (8-50 chars, uppercase, number required)
}
```

### Login Schema
```typescript
{
  email: string (valid email)
  password: string (required)
}
```

### Update Role Schema
```typescript
{
  role: "USER" | "OWNER" (ADMIN cannot be set via API)
}
```

---

## 🔑 Environment Variables Reference

| Variable | Value | Description |
|----------|-------|---|
| `base_url` | `http://localhost:5000` | Server base URL |
| `auth_token` | Auto-filled after login | JWT token for authenticated requests |
| `user_email` | `user@example.com` | Test user email |
| `user_password` | `Password123` | Test user password |
| `owner_email` | `owner@example.com` | Test owner email |
| `owner_password` | `OwnerPass123` | Test owner password |

---

## 💡 Pro Tips

### 1️⃣ Auto-Save Token After Login
The "Sign In" request has a test script that automatically saves the token. No manual copying needed!

### 2️⃣ View Response Tab
After each request, check the **Response** tab to:
- See formatted JSON
- Check status codes
- Debug errors

### 3️⃣ Use Collections for Organization
All endpoints are organized in folders by feature:
- 🔐 Authentication
- 👤 User Profile
- 🧪 Test Scenarios
- ❌ Error Testing

### 4️⃣ Monitor Console Logs
Watch your terminal to see server-side logs:
```
 /api/auth/sign-up ROUTE HIT
✅ User updated:...
```

---

## 🚨 Troubleshooting

### Issue: "401 Unauthorized"
**Solution:** Make sure you signed in and token is saved in environment
```
Check: Environment dropdown → verify auth_token is populated
```

### Issue: "Email already exists"
**Solution:** Use a unique email for each signup test
```
Good: user1@test.com, user2@test.com, user3@test.com
Bad: user@test.com (repeated)
```

### Issue: "Invalid email format"
**Solution:** Use valid email format
```
✅ user@example.com
✅ john.doe@company.co.uk
❌ invalidmail
❌ user@
```

### Issue: "Weak password"
**Solution:** Password must have uppercase, number, min 8 chars
```
✅ Password123
✅ MySecure456
❌ password123 (no uppercase)
❌ Pass123 (only 7 chars)
```

### Issue: "Cannot connect to server"
**Solution:** Make sure server is running
```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test with curl
curl http://localhost:5000
```

---

## 📚 API Documentation

### Authentication Endpoints (Better-Auth)

| Method | Endpoint | Description |
|--------|----------|---|
| POST | `/api/auth/sign-up` | Register new user |
| POST | `/api/auth/sign-in` | Login user |
| POST | `/api/auth/sign-out` | Logout user |
| GET | `/api/auth/session` | Get current session |

### Custom Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---|---|
| GET | `/api/auth/me` | ✅ Yes | Get current user profile |
| PATCH | `/api/auth/update-role` | ✅ Yes | Update user role (USER → OWNER only) |

---

## 🎯 Next Steps

1. ✅ Test signup/login with Postman collection
2. ✅ Verify database records with Prisma Studio
   ```bash
   npx prisma studio
   ```
3. ✅ Create properties endpoint
4. ✅ Create bookings endpoint
5. ✅ Test complete workflows

---

## ❓ Need Help?

Check:
1. **Server logs** - Terminal showing `npm run dev`
2. **Response section** - Postman response tab shows error details
3. **Database** - Prisma Studio to verify records
4. **.env file** - Ensure PORT, DATABASE_URL, BETTER_AUTH_URL are set

---

**Happy Testing! 🎉**
