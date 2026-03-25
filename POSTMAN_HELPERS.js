/**
 * Postman Helper Functions
 * 
 * Copy & paste these into Postman's Pre-request Script or Test Script sections
 * 
 * Usage:
 * 1. Go to Pre-request Script tab in a request
 * 2. Paste the relevant function
 * 3. Call it in your request body
 */

// ==================== AUTHENTICATION HELPERS ====================

/**
 * Generate random test email
 * Usage: const email = generateTestEmail();
 * Returns: test.user.1234567890@test.com
 */
function generateTestEmail() {
  const timestamp = Date.now();
  return `test.user.${timestamp}@test.com`;
}

/**
 * Valid test password (meets all requirements)
 * - 8+ characters
 * - Contains uppercase letter
 * - Contains number
 */
const validPassword = "TestPass123";

/**
 * Save auth token from response
 * Usage: In Test Script tab after login response
 */
function saveAuthToken() {
  if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    if (jsonData.session && jsonData.session.token) {
      pm.environment.set("auth_token", jsonData.session.token);
      console.log("✅ Auth token saved!");
    }
  }
}

// ==================== VALIDATION HELPERS ====================

/**
 * Valid email variations for testing
 */
const testEmails = [
  "user@example.com",
  "owner@example.com",
  "test.user@homerent.io",
  "john.doe@company.com"
];

/**
 * Test data sets
 */
const testUsers = {
  user1: {
    name: "Alice User",
    email: "alice.user@example.com",
    password: "AlicePass123"
  },
  user2: {
    name: "Bob Owner",
    email: "bob.owner@example.com",
    password: "BobOwner123"
  },
  user3: {
    name: "Charlie Tester",
    email: "charlie.test@example.com",
    password: "CharlieTest123"
  }
};

// ==================== REQUEST BODY GENERATORS ====================

/**
 * Generate signup request body
 * Usage: JSON.stringify(generateSignupBody("test@example.com"))
 */
function generateSignupBody(email) {
  return {
    name: email.split('@')[0],
    email: email || generateTestEmail(),
    password: "TestPass123"
  };
}

/**
 * Generate login request body
 */
function generateLoginBody(email, password) {
  return {
    email: email,
    password: password || "TestPass123"
  };
}

/**
 * Generate update role request body
 */
function generateUpdateRoleBody(role = "OWNER") {
  return {
    role: role
  };
}

// ==================== RESPONSE VALIDATORS ====================

/**
 * Validate signup response
 * Usage: validateSignupResponse(pm.response.json())
 */
function validateSignupResponse(data) {
  const checks = {
    hasSuccess: data.success === true,
    hasUser: data.user !== undefined,
    hasUserId: data.user?.id !== undefined,
    hasEmail: data.user?.email !== undefined,
    hasName: data.user?.name !== undefined
  };
  
  return checks;
}

/**
 * Validate login response
 */
function validateLoginResponse(data) {
  const checks = {
    hasSuccess: data.success === true,
    hasSession: data.session !== undefined,
    hasToken: data.session?.token !== undefined,
    hasUser: data.session?.user !== undefined,
    hasUserId: data.session?.user?.id !== undefined
  };
  
  return checks;
}

/**
 * Validate user profile response
 */
function validateUserProfileResponse(data) {
  const checks = {
    hasSuccess: data.success === true,
    hasData: data.data !== undefined,
    hasId: data.data?.id !== undefined,
    hasRole: data.data?.role !== undefined,
    hasEmail: data.data?.email !== undefined,
    hasEmailVerified: data.data?.emailVerified !== undefined,
    hasIsActive: data.data?.isActive !== undefined,
    hasIsBanned: data.data?.isBanned !== undefined
  };
  
  return checks;
}

/**
 * Validate owner profile response
 */
function validateOwnerProfileResponse(data) {
  const checks = {
    ...validateUserProfileResponse(data),
    hasRole: data.data?.role === "OWNER",
    hasOwnerProfile: data.data?.ownerProfile !== undefined,
    ownerHasId: data.data?.ownerProfile?.id !== undefined,
    ownerHasUserId: data.data?.ownerProfile?.userId !== undefined,
    ownerHasRating: data.data?.ownerProfile?.rating !== undefined,
    ownerHasVerified: data.data?.ownerProfile?.verified !== undefined
  };
  
  return checks;
}

// ==================== TEST SCRIPT EXAMPLES ====================

/**
 * Copy these into "Test" tab of Postman requests
 */

// Test: Save token after successful login
const testSaveToken = `
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  if (jsonData.session && jsonData.session.token) {
    pm.environment.set("auth_token", jsonData.session.token);
    pm.test("✅ Auth token saved to environment", () => {
      pm.expect(pm.environment.get("auth_token")).to.be.truthy;
    });
  }
}
`;

// Test: Validate response structure
const testValidateStructure = `
pm.test("Response has required fields", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success");
  pm.expect(jsonData).to.have.property("data");
});
`;

// Test: Check HTTP status
const testStatusCode = `
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});
`;

// Test: Parse and log response
const testLogResponse = `
const jsonData = pm.response.json();
console.log("Response:", JSON.stringify(jsonData, null, 2));

if (jsonData.data?.id) {
  console.log("User ID:", jsonData.data.id);
}

if (jsonData.session?.token) {
  console.log("Auth Token:", jsonData.session.token.substring(0, 20) + "...");
}
`;

// ==================== COMMON ERROR TESTS ====================

const errorTests = {
  invalidEmail: {
    name: "Invalid Email Format",
    body: {
      name: "Test User",
      email: "notanemail",
      password: "TestPass123"
    },
    expectError: true
  },
  
  weakPassword: {
    name: "Weak Password",
    body: {
      name: "Test User",
      email: "test@example.com",
      password: "weak"
    },
    expectError: true
  },
  
  invalidRole: {
    name: "Invalid Role",
    body: {
      role: "ADMIN"
    },
    expectError: true
  },
  
  missingEmail: {
    name: "Missing Email",
    body: {
      name: "Test User",
      password: "TestPass123"
    },
    expectError: true
  }
};

// ==================== USAGE EXAMPLES ====================

/**
 * EXAMPLE 1: Use in Pre-request Script
 * 
 * // Generate unique email
 * const email = generateTestEmail();
 * 
 * // Set request body
 * const requestBody = generateSignupBody(email);
 * pm.request.body.update(JSON.stringify(requestBody));
 */

/**
 * EXAMPLE 2: Use in Test Script
 * 
 * // Get response
 * const jsonData = pm.response.json();
 * 
 * // Validate response
 * const validation = validateSignupResponse(jsonData);
 * console.log("Validation results:", validation);
 * 
 * // Save token if login
 * if (pm.request.url.includes("sign-in")) {
 *   pm.environment.set("auth_token", jsonData.session.token);
 * }
 */

/**
 * EXAMPLE 3: Run validation tests
 * 
 * pm.test("Signup response is valid", () => {
 *   const jsonData = pm.response.json();
 *   const validation = validateSignupResponse(jsonData);
 *   
 *   pm.expect(validation.hasSuccess).to.equal(true);
 *   pm.expect(validation.hasUserId).to.equal(true);
 *   pm.expect(validation.hasEmail).to.equal(true);
 * });
 */

// ==================== REFERENCE TABLE ====================

/*
Authentication Endpoints:
┌─────────────────────────┬┬────────────┬──────────────────────────────────┐
│ Method │ Endpoint           │ Auth │ Description                      │
├─────────────────────────┼┼────────────┼──────────────────────────────────┤
│ POST   │ /api/auth/sign-up  │ No   │ Register new user                │
│ POST   │ /api/auth/sign-in  │ No   │ Login user                       │
│ POST   │ /api/auth/sign-out │ Yes  │ Logout user                      │
│ GET    │ /api/auth/session  │ Yes  │ Get current session              │
│ GET    │ /api/auth/me       │ Yes  │ Get current user profile         │
│ PATCH  │ /api/auth/update-role │ Yes  │ Update user role (USER→OWNER)│
└─────────────────────────┴┴────────────┴──────────────────────────────────┘

User Roles:
- USER: Can search properties, make bookings (default)
- OWNER: Can post properties, manage listings
- ADMIN: Can approve/reject listings, ban users (system-only)

Password Requirements:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 number (0-9)
- Maximum 50 characters

Example Valid Passwords:
✅ TestPass123
✅ MySecure456
✅ HomeRent789

Example Invalid Passwords:
❌ password123 (no uppercase)
❌ PASSWORD123 (no lowercase)
❌ Pass123 (only 7 chars)
❌ testpass (no number or uppercase)
*/

// Export for use
module.exports = {
  generateTestEmail,
  validPassword,
  saveAuthToken,
  testEmails,
  testUsers,
  generateSignupBody,
  generateLoginBody,
  generateUpdateRoleBody,
  validateSignupResponse,
  validateLoginResponse,
  validateUserProfileResponse,
  validateOwnerProfileResponse,
  errorTests
};
