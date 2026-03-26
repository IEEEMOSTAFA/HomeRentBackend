# 🛠️ Shared Utilities Module - Complete Documentation

## Overview

The `shared` folder contains all common utilities, interfaces, constants, and helpers used across the entire application. All files are designed to work seamlessly with your Prisma schema and API patterns.

## File Structure

```
src/shared/
├── index.ts                 # Central export point
├── sendResponse.ts          # Response formatting
├── catchAsync.ts            # Error wrapper middleware
├── interface.ts             # TypeScript interfaces (aligns with schema)
├── constants.ts             # All constants & enums
├── pagination.ts            # Pagination helpers
├── validators.ts            # Validation functions
├── utils.ts                 # Utility functions
└── SHARED_MODULE.md         # This documentation
```

## File Descriptions

### 1. `sendResponse.ts` - Response Formatting
**Purpose:** Standardize all API responses across the application

**Interface:**
```typescript
interface IApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}
```

**Usage:**
```typescript
import sendResponse from "../shared/sendResponse";

// In controller
return sendResponse(res, {
  statusCode: 200,
  success: true,
  message: "Image uploaded successfully",
  data: { url: "...", filename: "...", size: 123 }
});

// Error response
return sendResponse(res, {
  statusCode: 400,
  success: false,
  message: "Invalid file type",
  data: null
});
```

**Benefits:**
- ✅ Consistent response format across all endpoints
- ✅ Type-safe with generics
- ✅ Null coalescing for data field
- ✅ Clear structure for frontend

---

### 2. `catchAsync.ts` - Error Handling Wrapper
**Purpose:** Wrap async route handlers with try-catch and error passing

**Function:**
```typescript
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => RequestHandler
```

**Usage:**
```typescript
import catchAsync from "../shared/catchAsync";

router.post("/upload", handleUpload, 
  catchAsync(async (req, res) => {
    const imageUrl = await ImageService.uploadImage(req.file);
    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Upload successful",
      data: { url: imageUrl }
    });
  })
);
```

**Benefits:**
- ✅ Eliminates repetitive try-catch blocks
- ✅ Automatically passes errors to error handler
- ✅ Clean, readable controller code
- ✅ Consistent error handling

---

### 3. `interface.ts` - TypeScript Interfaces
**Purpose:** Define all data types matching Prisma schema

**Key Interfaces:**

#### Response Interfaces
```typescript
IApiResponse<T>              // Standard API response
IPaginatedResponse<T>        // Response with pagination meta
IErrorResponse               // Error response structure
```

#### Entity Interfaces (from Prisma schema)
```typescript
IUser                       // User entity
IProperty                   // Property entity
IBooking                    // Booking entity
IPayment                    // Payment entity
IReview                     // Review entity
INotification              // Notification entity
```

#### DTO (Data Transfer Object) Interfaces
```typescript
ICreatePropertyDTO         // For creating properties
ICreateBookingDTO          // For creating bookings
ICreateReviewDTO           // For creating reviews
```

#### Filter Interfaces
```typescript
IPropertyFilters           // For filtering properties
IBookingFilters            // For filtering bookings
```

**Benefits:**
- ✅ Type safety across entire app
- ✅ IDE autocomplete support
- ✅ Matches Prisma schema structure
- ✅ Clear data contracts

**Example Usage:**
```typescript
import type { IProperty, ICreatePropertyDTO } from "../shared";

// Type-safe controller parameter
export const createProperty = async (
  req: Request<{}, {}, ICreatePropertyDTO>,
  res: Response<IApiResponse<IProperty>>
) => {
  // Now req.body is typed as ICreatePropertyDTO
  // Response is typed as IApiResponse<IProperty>
};
```

---

### 4. `constants.ts` - Constants & Enums
**Purpose:** Centralize all magic strings, numbers, and enum values

**Sections:**

#### HTTP Status Constants
```typescript
HTTP_STATUS.OK              // 200
HTTP_STATUS.CREATED         // 201
HTTP_STATUS.BAD_REQUEST     // 400
HTTP_STATUS.UNAUTHORIZED    // 401
HTTP_STATUS.FORBIDDEN       // 403
HTTP_STATUS.NOT_FOUND       // 404
HTTP_STATUS.INTERNAL_SERVER_ERROR  // 500
```

#### Error Messages
```typescript
ERROR_MESSAGES.INVALID_CREDENTIALS
ERROR_MESSAGES.UNAUTHORIZED
ERROR_MESSAGES.NOT_FOUND
ERROR_MESSAGES.VALIDATION_FAILED
ERROR_MESSAGES.PAYMENT_FAILED
// ... and more
```

#### User Role Constants
```typescript
USER_ROLES.ADMIN
USER_ROLES.OWNER
USER_ROLES.USER
```

#### Status Enums (matching Prisma)
```typescript
PROPERTY_STATUS.PENDING
PROPERTY_STATUS.APPROVED
PROPERTY_STATUS.REJECTED

BOOKING_STATUS.PENDING
BOOKING_STATUS.ACCEPTED
BOOKING_STATUS.PAYMENT_PENDING
BOOKING_STATUS.CONFIRMED
BOOKING_STATUS.DECLINED
BOOKING_STATUS.CANCELLED

PAYMENT_STATUS.PENDING
PAYMENT_STATUS.SUCCESS
PAYMENT_STATUS.FAILED
PAYMENT_STATUS.REFUNDED
```

**Benefits:**
- ✅ Single source of truth
- ✅ Prevents typos in enum values
- ✅ Easy to maintain and update
- ✅ Type-safe enum checking

**Example Usage:**
```typescript
import { PROPERTY_STATUS, HTTP_STATUS, ERROR_MESSAGES } from "../shared";

// Check status
if (property.status === PROPERTY_STATUS.APPROVED) { ... }

// Return error
return sendResponse(res, {
  statusCode: HTTP_STATUS.NOT_FOUND,
  success: false,
  message: ERROR_MESSAGES.NOT_FOUND,
  data: null
});
```

---

### 5. `pagination.ts` - Pagination Helpers
**Purpose:** Helper functions for pagination calculations

**Functions:**

```typescript
// Parse page/limit from query parameters
parsePagination(page?: number | string, limit?: number | string)
// Returns: { page: 1, limit: 10, skip: 0 }

// Calculate pagination metadata
calculatePaginationMeta(total: number, page: number, limit: number)
// Returns: { page, limit, total, totalPages }

// Format paginated response
formatPaginatedResult<T>(data: T[], total: number, page: number, limit: number)
// Returns: { data, total, page, limit, totalPages }
```

**Example Usage:**
```typescript
import { parsePagination, formatPaginatedResult } from "../shared";

export const getProperties = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: pageLimit } = parsePagination(page, limit);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({ skip, take: pageLimit }),
    prisma.property.count()
  ]);

  const result = formatPaginatedResult(properties, total, Number(page), pageLimit);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Properties fetched",
    data: properties
  });
});
```

**Benefits:**
- ✅ Consistent pagination across app
- ✅ Prevents off-by-one errors
- ✅ Automatic limit boundaries
- ✅ SEO-friendly page numbers (1-indexed)

---

### 6. `validators.ts` - Validation Functions
**Purpose:** Reusable validation functions

**Available Validators:**

```typescript
// Email & Authentication
isValidEmail(email: string)          // Validates email format
isValidPassword(password: string)    // Min 8 chars, 1 upper, 1 lower, 1 number
isValidPhone(phone: string)          // Bangladesh phone formats

// ID Validation
isValidObjectId(id: string)          // Validates CUID format

// Enum Validation
isValidEnum(value: any, enumObj)     // Check if value exists in enum

// Range Validation
isInRange(value: number, min, max)   // Check if number in range
isValidLength(str: string, min, max) // Check if string length in range

// URL Validation
isValidUrl(url: string)              // Validates URL format
isCloudinaryUrl(url: string)         // Checks if Cloudinary URL

// Date Validation
isValidDate(dateStr: string)         // Validates date format
isFutureDate(dateStr: string)        // Checks if date is in future

// Empty Check
isEmpty(value: any)                  // Checks for empty values
```

**Example Usage:**
```typescript
import { isValidEmail, isValidPhone, isCloudinaryUrl } from "../shared";

if (!isValidEmail(email)) throw new Error("Invalid email");
if (!isValidPhone(phone)) throw new Error("Invalid phone");
if (!isCloudinaryUrl(imageUrl)) throw new Error("Invalid image URL");
```

**Benefits:**
- ✅ Reusable across modules
- ✅ Consistent validation rules
- ✅ Bangladesh-specific validators
- ✅ Cloudinary integration support

---

### 7. `utils.ts` - Utility Functions
**Purpose:** General-purpose helper functions

**Sections:**

#### Date & Time
```typescript
formatDate(date, locale = "en-US")   // Format date to readable string
daysBetween(startDate, endDate)      // Calculate days between dates
```

#### Currency
```typescript
formatCurrency(amount)               // Format BDT currency
```

#### String Manipulation
```typescript
generateSlug(str)                    // Convert to URL-friendly slug
truncate(str, length, suffix)        // Truncate with ellipsis
cleanString(str)                     // Remove extra whitespace
capitalize(str)                      // Capitalize first letter
toCommaSeparated(arr)                // Array to comma string
```

#### Object Manipulation
```typescript
hasRequiredFields(obj, fields)       // Check for required fields
pickFields(obj, fields)              // Extract specific fields
omitFields(obj, fields)              // Exclude specific fields
mergeObjects(...objects)             // Merge multiple objects
```

#### Random & Async
```typescript
generateRandomString(length)         // Generate random string
sleep(ms)                            // Promise-based sleep
retryAsync(fn, maxRetries, delay)   // Retry with exponential backoff
```

**Example Usage:**
```typescript
import { generateSlug, pickFields, retryAsync } from "../shared";

// Generate blog post slug
const slug = generateSlug("My Awesome Blog Post");  // "my-awesome-blog-post"

// Extract safe user data
const safeUser = pickFields(user, ["id", "name", "email"]);

// Retry API call with backoff
const result = await retryAsync(
  () => cloudinary.uploader.upload(buffer),
  3,  // max retries
  1000  // initial delay ms
);
```

**Benefits:**
- ✅ Reusable functionality
- ✅ DRY principle
- ✅ Common patterns implemented
- ✅ Ready for Bangladesh locale

---

### 8. `index.ts` - Central Exports
**Purpose:** Single entry point for shared module

**Usage:**
```typescript
// Instead of importing from multiple files:
// import sendResponse from "./sendResponse";
// import { HTTP_STATUS } from "./constants";
// import catchAsync from "./catchAsync";

// Import everything from one place:
import { 
  sendResponse, 
  catchAsync, 
  HTTP_STATUS,
  isValidEmail,
  formatDate,
  type IProperty,
  type IApiResponse
} from "../shared";
```

**Benefits:**
- ✅ Single import point
- ✅ Cleaner imports throughout app
- ✅ Easy to see available utilities
- ✅ Simplified namespace management

---

## Integration with Schema

### How Shared Interfaces Match Prisma Schema

```
Prisma Schema          →  Shared Interface
─────────────────────────────────────────────
User                   →  IUser
Property               →  IProperty
Booking                →  IBooking
Payment                →  IPayment
Review                 →  IReview
Notification           →  INotification

PropertyStatus enum    →  PROPERTY_STATUS constant
BookingStatus enum     →  BOOKING_STATUS constant
UserRole enum          →  USER_ROLES constant
```

### Response Format

Every API endpoint should use the standardized response:

```typescript
{
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null
}
```

### Error Handling

Errors are caught by `catchAsync` and passed to global error handler:

```typescript
controller
  ↓ (catchAsync wraps)
  ↓ (error thrown)
  ↓ (next(error))
  ↓
Global Error Handler Middleware
  ↓
Error Response (formatted via sendResponse)
```

---

## Usage Examples

### Complete Controller Example

```typescript
import { 
  sendResponse, 
  catchAsync,
  type IProperty,
  type IApiResponse,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from "../shared";

export const createProperty = catchAsync(async (req, res) => {
  const { title, description, city } = req.body;

  // Validation using shared validators
  if (!isValidLength(title, 3, 100)) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      data: null
    });
  }

  // Create property
  const property = await prisma.property.create({
    data: { ...req.body, ownerId: req.user.id }
  });

  // Success response
  return sendResponse<IProperty>(res, {
    statusCode: HTTP_STATUS.CREATED,
    success: true,
    message: SUCCESS_MESSAGES.CREATED,
    data: property
  });
});
```

### Complete Pagination Example

```typescript
import { 
  sendResponse,
  parsePagination,
  formatPaginatedResult,
  type IPaginatedResponse,
  type IProperty
} from "../shared";

export const getProperties = catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query.page, req.query.limit);

  const [properties, total] = await Promise.all([
    prisma.property.findMany({ skip, take: limit }),
    prisma.property.count()
  ]);

  const result = formatPaginatedResult(properties, total, page, limit);

  return sendResponse<IProperty[]>(res, {
    statusCode: 200,
    success: true,
    message: "Properties fetched",
    data: properties,
    meta: result // Include pagination metadata
  });
});
```

---

## Best Practices

1. **Always use sendResponse** for responses
2. **Wrap controllers with catchAsync** for error handling
3. **Use constants** instead of magic strings
4. **Leverage interfaces** for type safety
5. **Use validators** for input validation
6. **Use utility functions** to avoid code duplication
7. **Import from index.ts** for cleaner imports
8. **Follow the response format** exactly as defined

---

## File Import Map

Quick reference for what to import from shared:

```typescript
// Response handling
import { sendResponse, catchAsync } from "../shared";

// Type definitions
import type { IUser, IProperty, IApiResponse } from "../shared";

// Constants
import { HTTP_STATUS, ERROR_MESSAGES, USER_ROLES } from "../shared";

// Utilities
import { 
  parsePagination, 
  isValidEmail, 
  formatDate,
  generateSlug 
} from "../shared";

// All at once (recommended)
import { 
  sendResponse,
  catchAsync,
  HTTP_STATUS,
  ERROR_MESSAGES,
  type IProperty,
  type IApiResponse,
  parsePagination,
  isValidEmail
} from "../shared";
```

---

## Troubleshooting

**Issue:** TypeScript error about `IProperty` not matching database result
**Solution:** Ensure Prisma types and shared interfaces stay in sync

**Issue:** Response format inconsistent across endpoints
**Solution:** Always use `sendResponse()` helper function

**Issue:** Repeated error handling code
**Solution:** Wrap controllers with `catchAsync()` middleware

**Issue:** Magic strings throughout code
**Solution:** Use constants from `constants.ts`

---

## Related Documentation

- See [PRD.md](../../PRD.md) for API specifications
- See [IMAGE_MODULE.md](../modules/Image/IMAGE_MODULE.md) for module pattern
- See [schema.prisma](../../prisma/schema.prisma) for database schema
