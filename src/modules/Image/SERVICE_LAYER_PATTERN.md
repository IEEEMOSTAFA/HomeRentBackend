# 📋 Image Module Service Layer Pattern Summary

## Complete File Structure ✅

```
src/modules/Image/
│
├── index.ts                           # Central export point
│
├── Routes Layer
│   └── image.routes.ts               # API endpoint definitions
│
├── Middleware Layer  
│   └── image.middleware.ts           # File upload & validation
│
├── Controller Layer
│   └── image.controller.ts           # HTTP request handlers
│
├── Service Layer
│   └── image.service.ts              # Business logic
│
├── Utils Layer
│   └── image.utils.ts                # Cloudinary operations
│
├── Support Files
│   ├── image.interface.ts            # TypeScript interfaces
│   ├── image.constant.ts             # Constants & enums
│   ├── image.validation.ts           # Zod validation schemas
│   │
│   └── Documentation
│       └── IMAGE_MODULE.md           # Complete module docs
```

## Layer Breakdown

### 1️⃣ Routes Layer (`image.routes.ts`)
**Purpose:** Define RESTful API endpoints

```typescript
POST   /api/images/upload              // Upload single image
POST   /api/images/upload-multiple     // Upload multiple images
DELETE /api/images/:imageUrl           // Delete single image
POST   /api/images/delete-multiple     // Delete multiple images
```

**Key Features:**
- Express Router setup
- Middleware composition
- Request/response documentation

---

### 2️⃣ Middleware Layer (`image.middleware.ts`)
**Purpose:** Handle file uploads and request preprocessing

**Middlewares:**
- `handleSingleUpload` - Multer single file upload
- `handleMultipleUpload` - Multer multiple files upload (max 10)
- `validateImageFolder` - Validate folder parameter

**Validation:**
- File type: JPEG, PNG, WebP, GIF
- File size: Max 5MB
- Folder whitelist: homerent, homerent/properties, homerent/profiles, homerent/blog

---

### 3️⃣ Controller Layer (`image.controller.ts`)
**Purpose:** HTTP request handlers that invoke service layer

**Methods:**
```typescript
ImageController.uploadSingleImage()      // Handles POST /upload
ImageController.uploadMultipleImages()   // Handles POST /upload-multiple
ImageController.deleteSingleImage()      // Handles DELETE /:imageUrl
ImageController.deleteMultipleImages()   // Handles POST /delete-multiple
```

**Features:**
- Uses `catchAsync` for error handling
- Uses `sendResponse` for consistent responses
- Calls ImageService for business logic
- Uses constants for status codes and messages

---

### 4️⃣ Service Layer (`image.service.ts`)
**Purpose:** Core business logic and validation

**Methods:**
```typescript
ImageService.uploadSingleImage(file, folder)
ImageService.uploadMultipleImages(files, folder)
ImageService.deleteSingleImage(imageUrl)
ImageService.deleteMultipleImages(imageUrls)
```

**Validation & Error Handling:**
- File existence checks
- MIME type validation
- File size validation
- Image count validation
- URL format validation
- Descriptive error messages
- Try-catch with custom error wrapping

---

### 5️⃣ Utils Layer (`image.utils.ts`)
**Purpose:** Pure utility functions for Cloudinary integration

**Functions:**
```typescript
uploadToCloudinary(fileBuffer, folder)          // Upload single
uploadMultipleToCloudinary(buffers, folder)     // Upload multiple
deleteFromCloudinary(imageUrl)                  // Delete single
deleteMultipleFromCloudinary(imageUrls)         // Delete multiple
```

**Features:**
- Cloudinary SDK integration
- Promise-based API
- Public ID extraction from URLs
- Parallel operation support (Promise.all)

---

## Supporting Files

### Interfaces (`image.interface.ts`)
```typescript
IUploadResponse              // Single upload response
IUploadMultipleResponse      // Multiple upload response
IDeleteRequest               // Delete request payload
IDeleteMultipleRequest       // Batch delete request
ICloudinaryUploadResult      // Cloudinary response
IImageServiceResponse<T>     // Generic service response
```

### Constants (`image.constant.ts`)
```typescript
IMAGE_CONSTANTS.SUPPORTED_FORMATS         // ["image/jpeg", ...]
IMAGE_CONSTANTS.MAX_FILE_SIZE             // 5MB in bytes
IMAGE_CONSTANTS.MAX_IMAGES_PER_REQUEST    // 10
IMAGE_CONSTANTS.DEFAULT_FOLDER            // "homerent"
IMAGE_CONSTANTS.PROPERTY_FOLDER           // "homerent/properties"
IMAGE_CONSTANTS.PROFILE_FOLDER            // "homerent/profiles"
IMAGE_CONSTANTS.BLOG_FOLDER               // "homerent/blog"
IMAGE_CONSTANTS.ERROR_MESSAGES            // All error texts
IMAGE_CONSTANTS.SUCCESS_MESSAGES          // All success texts
HTTP_STATUS                               // Status code constants
```

### Validation (`image.validation.ts`)
```typescript
ImageValidation.uploadSingleSchema        // Zod schema
ImageValidation.uploadMultipleSchema      // Zod schema
ImageValidation.deleteSingleSchema        // Zod schema
ImageValidation.deleteMultipleSchema      // Zod schema
```

### Exports (`index.ts`)
```typescript
export { ImageRoutes }
export { ImageController }
export { ImageService }
export { handleSingleUpload, handleMultipleUpload, validateImageFolder }
export { uploadToCloudinary, uploadMultipleToCloudinary, ... }
export { IMAGE_CONSTANTS, HTTP_STATUS }
export type { IUploadResponse, IUploadMultipleResponse, ... }
export { ImageValidation }
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      HTTP Request                           │
│      POST /api/images/upload (FormData + File)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Routes (image.routes.ts)     │
        │  - Match endpoint               │
        │  - Chain middleware & controller
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ Middleware (image.middleware)  │
        │ - handleSingleUpload()         │
        │ - validateImageFolder()        │
        │ - Attach file to request       │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │ Controller (image.controller)  │
        │ - Parse request                │
        │ - Call ImageService            │
        │ - Format response              │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │   Service (image.service)      │
        │ - Validate file                │
        │ - Call uploadToCloudinary()    │
        │ - Handle errors                │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │     Utils (image.utils)        │
        │ - Upload to Cloudinary         │
        │ - Return secure_url            │
        └────────────┬───────────────────┘
                     │
                     ▼
        ┌────────────────────────────────┐
        │   Cloudinary CDN (External)    │
        │ - Store image                  │
        │ - Return secure_url            │
        └────────────┬───────────────────┘
                     │
                     ▼ (Response back through layers)
        ┌────────────────────────────────┐
        │        HTTP Response            │
        │  200 OK - Image URL + Metadata │
        └────────────────────────────────┘
```

---

## Service Layer Usage Pattern

### In Controllers
```typescript
// Controllers use service layer, not utils
const imageUrl = await ImageService.uploadSingleImage(req.file, folder);
```

### In Other Modules
```typescript
// Import and use the service
import { ImageService } from '../Image/image.service';

// In another module's controller or service
const urls = await ImageService.uploadMultipleImages(files, 'homerent/properties');
```

### Error Handling
```typescript
try {
  const url = await ImageService.uploadSingleImage(file, folder);
} catch (error) {
  // Service throws descriptive errors
  console.error(error.message);
  // Propagate to controller which handles with catchAsync
}
```

---

## Key Principles ✨

| Principle | Implementation |
|-----------|-------------------|
| **Separation of Concerns** | Each layer has single responsibility |
| **Validation at Service Layer** | All business rules enforced in service |
| **Error Handling** | Descriptive messages from constants |
| **Reusability** | Service can be called from any module |
| **Type Safety** | Interfaces for all inputs/outputs |
| **Constants Centralization** | All magic strings in constants file |
| **Clean Code** | Well-documented, following patterns |
| **Testability** | Each layer can be tested independently |

---

## Configuration Files

### Environment Variables (`.env`)
```env
CLOUDINARY_CLOUD_NAME=dnob5pvrf
CLOUDINARY_API_KEY=517416187872537
CLOUDINARY_API_SECRET=y5OkGHGuZgx2lCtJYrqFVlPrlLk
```

### Package Dependencies
```json
{
  "cloudinary": "^2.9.0",
  "multer": "^2.1.1"
}
```

### Config Files
- `src/config/cloudinary.config.ts` - Cloudinary initialization
- `src/config/multer.config.ts` - Multer configuration

---

## Integration Points

### App Routes (`src/app.ts`)
```typescript
import { ImageRoutes } from "./modules/Image/image.routes";

app.use("/api/images", ImageRoutes);
```

### Property Module Usage
```typescript
// Upload images when creating property
const imageUrls = await ImageService.uploadMultipleImages(
  req.files,
  "homerent/properties"
);

// Store URLs in property
const property = await prisma.property.create({
  data: {
    // ... other fields
    images: imageUrls
  }
});
```

---

## Documentation Files

1. **IMAGE_MODULE.md** (This module)
   - Complete service layer architecture
   - Layer responsibilities
   - Integration examples
   - Best practices

2. **IMAGE_UPLOAD_GUIDE.md** (API documentation)
   - API endpoint details
   - Request/response examples
   - Postman testing guide
   - Error handling

---

## ✅ Checklist

- [x] Routes layer with all endpoints
- [x] Middleware layer for file uploads
- [x] Controller layer with catchAsync & sendResponse
- [x] Service layer with validation & error handling
- [x] Utils layer for Cloudinary operations
- [x] TypeScript interfaces for type safety
- [x] Constants for all configuration
- [x] Validation schemas with Zod
- [x] Module index for clean exports
- [x] Comprehensive documentation
- [x] Integration with main app.ts
- [x] npm packages installed (cloudinary, multer)
- [x] Environment variables configured

---

## Related Documentation

- See [IMAGE_UPLOAD_GUIDE.md](../../../IMAGE_UPLOAD_GUIDE.md) for API usage
- See [PRD.md](../../../PRD.md) for project requirements
- See other modules (Admin, Owner, User) for similar patterns
