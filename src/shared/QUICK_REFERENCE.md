# ⚡ Shared Module - Quick Reference

## One-Line Imports

```typescript
import { sendResponse, catchAsync, HTTP_STATUS, ERROR_MESSAGES, type IProperty, isValidEmail, parsePagination } from "../shared";
```

## Response Template

```typescript
return sendResponse(res, {
  statusCode: HTTP_STATUS.OK,
  success: true,
  message: "Success message",
  data: { /* your data */ }
});
```

## Controller Template

```typescript
export const methodName = catchAsync(async (req, res) => {
  // Validate
  if (!isValidEmail(req.body.email)) {
    return sendResponse(res, {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: ERROR_MESSAGES.INVALID_INPUT,
      data: null
    });
  }

  // Process
  const result = await someOperation();

  // Respond
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    success: true,
    message: "Operation successful",
    data: result
  });
});
```

## Common Validators

```typescript
isValidEmail(email)                    // Email validation
isValidPassword(password)              // Password strength check
isValidPhone(phone)                    // Phone validation
isValidUrl(url)                        // URL validation
isCloudinaryUrl(url)                   // Cloudinary URL check
isValidDate(dateStr)                   // Date validation
isFutureDate(dateStr)                  // Future date check
isEmpty(value)                         // Empty value check
```

## Common Status Codes

```typescript
HTTP_STATUS.OK                          // 200
HTTP_STATUS.CREATED                     // 201
HTTP_STATUS.BAD_REQUEST                 // 400
HTTP_STATUS.UNAUTHORIZED                // 401
HTTP_STATUS.FORBIDDEN                   // 403
HTTP_STATUS.NOT_FOUND                   // 404
HTTP_STATUS.INTERNAL_SERVER_ERROR      // 500
```

## Common Enum Values

```typescript
// User Roles
USER_ROLES.ADMIN    // 'ADMIN'
USER_ROLES.OWNER    // 'OWNER'
USER_ROLES.USER     // 'USER'

// Property Status
PROPERTY_STATUS.PENDING     // 'PENDING'
PROPERTY_STATUS.APPROVED    // 'APPROVED'
PROPERTY_STATUS.REJECTED    // 'REJECTED'

// Booking Status
BOOKING_STATUS.PENDING              // 'PENDING'
BOOKING_STATUS.ACCEPTED             // 'ACCEPTED'
BOOKING_STATUS.PAYMENT_PENDING      // 'PAYMENT_PENDING'
BOOKING_STATUS.CONFIRMED            // 'CONFIRMED'
BOOKING_STATUS.DECLINED             // 'DECLINED'
BOOKING_STATUS.CANCELLED            // 'CANCELLED'

// Payment Status
PAYMENT_STATUS.PENDING              // 'PENDING'
PAYMENT_STATUS.SUCCESS              // 'SUCCESS'
PAYMENT_STATUS.FAILED               // 'FAILED'
PAYMENT_STATUS.REFUNDED             // 'REFUNDED'
```

## Pagination

```typescript
// Parse page/limit from query
const { page, limit, skip } = parsePagination(req.query.page, req.query.limit);

// Format paginated result
const result = formatPaginatedResult(data, total, page, limit);
```

## String Utilities

```typescript
generateSlug("My Blog Post")          // "my-blog-post"
truncate(longStr, 50)                 // Truncate to 50 chars + "..."
cleanString("  hello   world  ")      // "hello world"
capitalize("hello")                   // "Hello"
formatDate(new Date())                // "March 26, 2026, 2:30 PM"
formatCurrency(1500)                  // "১,৫০০.০০ ৳"
```

## Object Utilities

```typescript
// Check required fields exist
hasRequiredFields(obj, ["name", "email"])

// Extract specific fields
pickFields(user, ["id", "name", "email"])

// Exclude specific fields
omitFields(user, ["password", "token"])

// Merge objects
mergeObjects(obj1, obj2, obj3)
```

## Response Patterns

### Success Response
```typescript
return sendResponse(res, {
  statusCode: 200,
  success: true,
  message: "Operation successful",
  data: { /* result */ }
});
```

### Error Response
```typescript
return sendResponse(res, {
  statusCode: 400,
  success: false,
  message: "Validation failed",
  data: null
});
```

### Paginated Response
```typescript
return sendResponse(res, {
  statusCode: 200,
  success: true,
  message: "Data fetched",
  data: items,
  meta: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
});
```

## Error Handling

**Wrong:**
```typescript
try {
  // code
} catch (error) {
  res.json({ error: error.message });
}
```

**Right:**
```typescript
export const handler = catchAsync(async (req, res) => {
  // code - errors automatically caught and passed to error handler
});
```

## Type Safety Patterns

```typescript
// Type request body
export const handler = catchAsync(async (
  req: Request<{}, {}, ICreatePropertyDTO>,
  res: Response<IApiResponse<IProperty>>
) => {
  // req.body is now typed as ICreatePropertyDTO
  // response is typed as IApiResponse<IProperty>
});

// Type response generic
return sendResponse<IProperty>(res, {
  statusCode: 200,
  success: true,
  message: "Property created",
  data: property
});
```

## Async Patterns

```typescript
// Retry with backoff
const result = await retryAsync(async () => {
  return await cloudinary.upload(buffer);
}, 3, 1000);

// Sleep
await sleep(1000);  // Wait 1 second
```

## File Locations Quick Map

| Need | File | Function |
|------|------|----------|
| Response formatting | sendResponse.ts | `sendResponse()` |
| Error wrapping | catchAsync.ts | `catchAsync()` |
| Type definitions | interface.ts | `type IUser`, `type IProperty` |
| Constants | constants.ts | `HTTP_STATUS`, `USER_ROLES` |
| Pagination | pagination.ts | `parsePagination()` |
| Validation | validators.ts | `isValidEmail()` |
| Utilities | utils.ts | `formatDate()`, `generateSlug()` |

## Status Codes Quick Lookup

| Use Case | Code | Constant |
|----------|------|----------|
| Success | 200 | `HTTP_STATUS.OK` |
| Created | 201 | `HTTP_STATUS.CREATED` |
| Bad request | 400 | `HTTP_STATUS.BAD_REQUEST` |
| Not authenticated | 401 | `HTTP_STATUS.UNAUTHORIZED` |
| Not authorized | 403 | `HTTP_STATUS.FORBIDDEN` |
| Not found | 404 | `HTTP_STATUS.NOT_FOUND` |
| Server error | 500 | `HTTP_STATUS.INTERNAL_SERVER_ERROR` |

## Tips

- Use `sendResponse()` in every controller
- Wrap every controller with `catchAsync()`
- Use constants instead of magic strings
- Leverage TypeScript interfaces
- Import from `index.ts` for cleaner code
- Check validators before processing
- Use utility functions to avoid duplication
