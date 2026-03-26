# 📦 Shared Module - Complete Implementation Guide

## What is the Shared Module?

The shared folder contains **all reusable code** across your HomeRent application. Every file is designed to perfectly align with your Prisma schema and ensure consistency across all modules.

## 🎯 Core Purpose

| File | Purpose | Schema Alignment |
|------|---------|-----------------|
| **sendResponse.ts** | Format all API responses | Standardizes response structure for all endpoints |
| **catchAsync.ts** | Handle async errors | Catches errors from all route handlers |
| **interface.ts** | Type definitions | Matches Prisma models exactly |
| **constants.ts** | Store constants & enums | Matches Prisma enums (UserRole, PropertyStatus, etc) |
| **pagination.ts** | Handle pagination | Supports paginated queries on all entities |
| **validators.ts** | Validate input | Ensures data integrity before DB operations |
| **utils.ts** | General helpers | Utility functions for strings, dates, objects |
| **index.ts** | Central exports | Single import point for entire module |

## 📋 File Structure Overview

```
src/shared/
│
├── Core Response Handling
│   ├── sendResponse.ts          # Standardized API responses
│   └── catchAsync.ts            # Error wrapping for async routes
│
├── Type Definitions
│   ├── interface.ts             # All interfaces (matches Prisma schema)
│   └── constants.ts             # All enums & constants
│
├── Utilities
│   ├── pagination.ts            # Pagination calculations
│   ├── validators.ts            # Input validation functions
│   └── utils.ts                 # General utilities
│
├── Central Exports
│   ├── index.ts                 # Single export point
│   │
│   └── Documentation
│       ├── SHARED_MODULE.md     # Detailed documentation
│       └── QUICK_REFERENCE.md   # Quick lookup guide
```

## 🔄 How It Works Together

### Request-Response Cycle

```
HTTP Request
    ↓
Route Handler (controller)
    ↓ (wrapped in catchAsync)
Validate Input (using validators.ts)
    ↓
Process Data (using utils.ts, pagination.ts)
    ↓
Database Query (using interfaces.ts types)
    ↓
Format Response (using sendResponse.ts)
    ↓
HTTP Response
```

### Error Handling Flow

```
Route Handler (catchAsync)
    ↓
Throws Error
    ↓
catchAsync catches and calls next(error)
    ↓
Global Error Handler Middleware
    ↓
sendResponse() formats error
    ↓
HTTP Error Response
```

## 💡 Perfect Integration with Schema

### Enums Match Exactly

**Prisma Schema:**
```prisma
enum UserRole {
  ADMIN
  OWNER
  USER
}

enum PropertyStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**Shared Constants:**
```typescript
export const USER_ROLES = {
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  USER: "USER"
};

export const PROPERTY_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED"
};
```

### Models Match Interfaces

**Prisma Schema:**
```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  role          UserRole  @default(USER)
  createdAt     DateTime  @default(now())
  // ... more fields
}
```

**Shared Interface:**
```typescript
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "OWNER" | "USER";
  createdAt: Date;
  // ... more fields
}
```

## 📚 Complete Usage Example

### Full Property Creation Flow

```typescript
import { 
  sendResponse, 
  catchAsync,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  PROPERTY_STATUS,
  type IProperty,
  type ICreatePropertyDTO,
  type IApiResponse,
  isValidLength,
  isInRange
} from "../shared";
import { ImageService } from "../Image/image.service";
import prisma from "../lib/prisma";

// Controller
export const createProperty = catchAsync(
  async (
    req: Request<{}, {}, ICreatePropertyDTO>,
    res: Response<IApiResponse<IProperty>>
  ) => {
    // 1. Validate Input
    const { title, bedrooms, bathrooms, rentAmount } = req.body;
    
    if (!isValidLength(title, 3, 100)) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: ERROR_MESSAGES.VALIDATION_FAILED,
        data: null
      });
    }

    if (!isInRange(bedrooms, 0, 20)) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: "Invalid bedrooms count",
        data: null
      });
    }

    // 2. Handle Image Uploads
    let imageUrls: string[] = [];
    if (req.files?.length) {
      try {
        imageUrls = await ImageService.uploadMultipleImages(
          req.files,
          "homerent/properties"
        );
      } catch (error) {
        return sendResponse(res, {
          statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          success: false,
          message: "Image upload failed",
          data: null
        });
      }
    }

    // 3. Create in Database
    const property = await prisma.property.create({
      data: {
        ...req.body,
        ownerId: req.user.id,
        status: PROPERTY_STATUS.PENDING, // Use constant
        images: imageUrls
      }
    });

    // 4. Send Success Response
    return sendResponse<IProperty>(res, {
      statusCode: HTTP_STATUS.CREATED,
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      data: property
    });
  }
);
```

### List Properties with Pagination

```typescript
export const getProperties = catchAsync(
  async (
    req: Request<{}, {}, {}, IPropertyFilters>,
    res: Response
  ) => {
    // 1. Parse Pagination
    const { page, limit, skip } = parsePagination(
      req.query.page,
      req.query.limit
    );

    // 2. Query Database
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: {
          status: PROPERTY_STATUS.APPROVED,
          ...(req.query.city && { city: req.query.city })
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.property.count({
        where: { status: PROPERTY_STATUS.APPROVED }
      })
    ]);

    // 3. Format Result
    const meta = calculatePaginationMeta(total, page, limit);

    // 4. Send Response with Pagination
    return sendResponse<IProperty[]>(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: SUCCESS_MESSAGES.RETRIEVED,
      data: properties,
      meta  // Include pagination metadata
    });
  }
);
```

### Error Handling Example

```typescript
export const updateProperty = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Find Property
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.NOT_FOUND,
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
        data: null
      });
    }

    // 2. Check Authorization
    if (property.ownerId !== userId) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.FORBIDDEN,
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
        data: null
      });
    }

    // 3. Validate Status Change
    const newStatus = req.body.status;
    if (newStatus && !isValidEnum(newStatus, PROPERTY_STATUS)) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: ERROR_MESSAGES.INVALID_STATUS,
        data: null
      });
    }

    // 4. Update (errors automatically caught by catchAsync)
    const updated = await prisma.property.update({
      where: { id },
      data: req.body
    });

    return sendResponse<IProperty>(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      data: updated
    });
  }
);
```

## 🎓 Key Patterns

### Pattern 1: Consistent Response

**Always use this pattern:**
```typescript
return sendResponse<T>(res, {
  statusCode: HTTP_STATUS.XXX,
  success: true|false,
  message: "...",
  data: dataOrNull
});
```

### Pattern 2: Error Handling

**Always wrap controllers:**
```typescript
export const handler = catchAsync(async (req, res) => {
  // Code here - errors caught automatically
});
```

### Pattern 3: Validation

**Validate before processing:**
```typescript
if (!isValidEmail(email)) {
  return sendResponse(res, {
    statusCode: HTTP_STATUS.BAD_REQUEST,
    success: false,
    message: "Invalid email",
    data: null
  });
}
```

### Pattern 4: Use Constants

**Never use magic strings:**
```typescript
// ❌ Bad
if (user.role === "ADMIN") { ... }

// ✅ Good
if (user.role === USER_ROLES.ADMIN) { ... }
```

### Pattern 5: Type Safety

**Always type function signatures:**
```typescript
const handler = async (
  req: Request<{}, {}, ICreatePropertyDTO>,
  res: Response<IApiResponse<IProperty>>
) => { ... }
```

## 📊 Response Format Reference

### Success Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { /* your data */ }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "success": false,
  "message": "Validation failed",
  "data": null
}
```

### Paginated Response
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Data fetched",
  "data": [ /* array of items */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🔗 Connection Points

### With Image Module
```typescript
import { ImageService } from "../Image/image.service";
import { isCloudinaryUrl } from "../shared";

// Validate Cloudinary URLs
if (!isCloudinaryUrl(imageUrl)) throw new Error("Invalid URL");

// Upload images
const urls = await ImageService.uploadMultipleImages(files, "homerent");
```

### With Prisma
```typescript
import type { IProperty } from "../shared";
import prisma from "../lib/prisma";

// Type-safe queries
const property: IProperty = await prisma.property.findUnique({
  where: { id: propertyId }
});
```

### With Validation
```typescript
import { isValidEmail, isValidDate, isInRange } from "../shared";

// Input validation before DB operations
if (!isValidEmail(email)) throw new Error("...");
if (!isValidDate(availableFrom)) throw new Error("...");
if (!isInRange(rentAmount, 1000, 500000)) throw new Error("...");
```

## ✅ Best Practices Checklist

- [ ] Every controller wrapped with `catchAsync`
- [ ] Every response uses `sendResponse`
- [ ] All enums use constants from `constants.ts`
- [ ] All types imported from `interface.ts`
- [ ] Input validated using validators
- [ ] No magic strings in code
- [ ] Single import from `index.ts`
- [ ] Error messages from `ERROR_MESSAGES`
- [ ] Success messages from `SUCCESS_MESSAGES`
- [ ] HTTP status from `HTTP_STATUS`

## 📖 Documentation Files

- **SHARED_MODULE.md** - Complete detailed guide
- **QUICK_REFERENCE.md** - Quick lookup for common patterns
- **README.md** - This file (overview and connection points)

## 🚀 Quick Start

1. Import from shared:
   ```typescript
   import { sendResponse, catchAsync, HTTP_STATUS, type IUser } from "../shared";
   ```

2. Wrap controller:
   ```typescript
   export const handler = catchAsync(async (req, res) => { ... });
   ```

3. Use sendResponse:
   ```typescript
   return sendResponse(res, { statusCode: 200, success: true, message: "...", data: result });
   ```

4. Validate input:
   ```typescript
   if (!isValidEmail(email)) { /* error response */ }
   ```

5. Use constants:
   ```typescript
   if (status === PROPERTY_STATUS.APPROVED) { ... }
   ```

That's it! You're now using the complete shared infrastructure perfectly aligned with your Prisma schema.
