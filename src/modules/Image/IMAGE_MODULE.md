# 🖼️ Image Module - Service Layer Documentation

## Module Architecture

The Image module follows a **multi-layer service pattern** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│ HTTP Requests (Postman, Frontend, etc)          │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Routes Layer (image.routes.ts)                  │
│ - Define API endpoints                          │
│ - Connect middleware and controllers            │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Middleware Layer (image.middleware.ts)          │
│ - Handle file uploads with multer              │
│ - Validate folder parameters                    │
│ - Error handling for upload process             │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Controller Layer (image.controller.ts)          │
│ - Parse HTTP requests                           │
│ - Call service methods                          │
│ - Format HTTP responses                         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Service Layer (image.service.ts)                │
│ - Business logic for image operations           │
│ - File validation                               │
│ - Error handling and transformation             │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ Utils Layer (image.utils.ts)                    │
│ - Pure utility functions                        │
│ - Cloudinary API integration                    │
│ - Upload/delete operations                      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│ External Services                               │
│ - Cloudinary CDN                                │
│ - File Storage                                  │
└─────────────────────────────────────────────────┘
```

## File Structure

```
src/modules/Image/
├── index.ts                  # Module exports
├── image.routes.ts          # Route definitions
├── image.controller.ts      # HTTP request handlers
├── image.service.ts         # Business logic layer
├── image.middleware.ts      # Request preprocessing
├── image.utils.ts           # Pure utility functions
├── image.interface.ts       # TypeScript interfaces
├── image.constant.ts        # Constants and enums
└── image.validation.ts      # Zod validation schemas
```

## Layer Responsibilities

### 1. Routes Layer (`image.routes.ts`)
**Responsibility:** Define API endpoints and wire up middleware/controllers

**Features:**
- RESTful endpoint definitions
- Middleware chain composition
- Request routing

**Example:**
```typescript
router.post(
  "/upload",
  handleSingleUpload,        // Middleware
  validateImageFolder,       // Middleware
  ImageController.uploadSingleImage  // Controller
);
```

### 2. Middleware Layer (`image.middleware.ts`)
**Responsibility:** Handle file uploads and request preprocessing

**Features:**
- Multer file upload handling
- File validation (type, size)
- Folder parameter validation

**Example:**
```typescript
export const handleSingleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ ...error });
    }
    next();
  });
};
```

### 3. Controller Layer (`image.controller.ts`)
**Responsibility:** Handle HTTP requests and format responses

**Features:**
- Request parsing
- Business logic invocation
- Response formatting
- Error handling via catchAsync

**Example:**
```typescript
uploadSingleImage: catchAsync(async (req: Request, res: Response) => {
  const folder = req.body.folder || "homerent";
  const imageUrl = await ImageService.uploadSingleImage(req.file, folder);
  
  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Image uploaded successfully",
    data: { url: imageUrl, ... }
  });
})
```

### 4. Service Layer (`image.service.ts`)
**Responsibility:** Implement business logic and validation

**Features:**
- File validation (type, size, count)
- Error handling with custom messages
- Business rule enforcement
- Call utils layer for actual operations

**Example:**
```typescript
async uploadSingleImage(file, folder) {
  // Validate file
  if (!file) throw new Error("No file provided");
  if (!SUPPORTED_FORMATS.includes(file.mimetype)) throw new Error("...");
  if (file.size > MAX_SIZE) throw new Error("...");
  
  // Call utils
  const imageUrl = await uploadToCloudinary(file.buffer, folder);
  return imageUrl;
}
```

### 5. Utils Layer (`image.utils.ts`)
**Responsibility:** Pure utility functions for external service integration

**Features:**
- Cloudinary SDK integration
- Upload/delete operations
- Public ID extraction
- Parallel operation handling

**Example:**
```typescript
export const uploadToCloudinary = async (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto", quality: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
```

## Data Flow Example

### Single Image Upload Flow

```
1. HTTP Request
   POST /api/images/upload
   FormData: { image: File, folder: "homerent/properties" }

2. Routes Layer
   → matches POST /upload
   → pipes through [handleSingleUpload, validateImageFolder, controller]

3. Middleware Layer
   → handleSingleUpload: processes file with multer
   → validateImageFolder: validates folder parameter
   → attaches req.file and req.body to request

4. Controller Layer
   → receives request with attached file
   → extracts folder from req.body
   → calls ImageService.uploadSingleImage(req.file, folder)

5. Service Layer
   → validates file (type, size)
   → calls uploadToCloudinary(file.buffer, folder)

6. Utils Layer
   → creates Cloudinary upload stream
   → uploads to Cloudinary
   → returns secure_url

7. Service Layer (returns)
   → returns imageUrl to controller

8. Controller (response)
   → formats response with IUploadResponse interface
   → calls sendResponse() helper
   → returns 200 with data

9. HTTP Response
   {
     "statusCode": 200,
     "success": true,
     "message": "Image uploaded successfully",
     "data": {
       "url": "https://res.cloudinary.com/...",
       "filename": "image.jpg",
       "size": 245789
     }
   }
```

## Using the Service Layer

### Importing the Service

```typescript
// Option 1: Direct import
import { ImageService } from "./image.service";

// Option 2: From module index
import { ImageService } from "./index";

// Option 3: Named imports
import { ImageService } from "../Image";
```

### Calling Service Methods

```typescript
// Upload single image
const imageUrl = await ImageService.uploadSingleImage(file, "homerent/properties");

// Upload multiple images
const imageUrls = await ImageService.uploadMultipleImages(files, "homerent/properties");

// Delete single image
await ImageService.deleteSingleImage(imageUrl);

// Delete multiple images
await ImageService.deleteMultipleImages(imageUrls);
```

### Error Handling

All service methods throw descriptive errors:

```typescript
try {
  const imageUrl = await ImageService.uploadSingleImage(file, folder);
} catch (error) {
  // Error messages from IMAGE_CONSTANTS
  console.error(error.message);
  // Examples:
  // - "No file provided"
  // - "Only JPEG, PNG, WebP, and GIF images are allowed. Received: image/bmp"
  // - "File size exceeds maximum limit of 5MB"
  // - "Cloudinary upload failed: Resource not found"
}
```

## Integration Examples

### Using in Property Module

```typescript
// property.controller.ts
import { ImageService } from "../Image/image.service";

export const createProperty = catchAsync(async (req, res) => {
  // 1. Handle image uploads
  let imageUrls: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    try {
      imageUrls = await ImageService.uploadMultipleImages(
        req.files,
        "homerent/properties"
      );
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  // 2. Create property with image URLs
  const property = await prisma.property.create({
    data: {
      ownerId: req.user.id,
      title: req.body.title,
      // ... other fields
      images: imageUrls,  // Store URLs array
    }
  });

  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Property created successfully",
    data: property
  });
});

// Update property images
export const updatePropertyImages = catchAsync(async (req, res) => {
  const property = await prisma.property.findUnique({
    where: { id: req.params.id }
  });

  // Upload new images
  let newImageUrls: string[] = [];
  if (req.files?.length) {
    newImageUrls = await ImageService.uploadMultipleImages(
      req.files,
      "homerent/properties"
    );
  }

  // Delete old images
  const { deleteUrls } = req.body;
  if (deleteUrls?.length) {
    await ImageService.deleteMultipleImages(deleteUrls);
  }

  // Update property
  const updatedProperty = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      images: [
        ...property.images.filter(url => !deleteUrls?.includes(url)),
        ...newImageUrls
      ]
    }
  });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property images updated",
    data: updatedProperty
  });
});
```

## Constants Reference

All constants are centralized in `image.constant.ts`:

```typescript
IMAGE_CONSTANTS.SUPPORTED_FORMATS
// ["image/jpeg", "image/png", "image/webp", "image/gif"]

IMAGE_CONSTANTS.MAX_FILE_SIZE
// 5242880 (5MB in bytes)

IMAGE_CONSTANTS.MAX_IMAGES_PER_REQUEST
// 10

IMAGE_CONSTANTS.DEFAULT_FOLDER
// "homerent"

IMAGE_CONSTANTS.ERROR_MESSAGES
// {
//   NO_FILE_PROVIDED: "No file uploaded",
//   INVALID_FILE_TYPE: "Only JPEG, PNG, WebP, and GIF images are allowed",
//   FILE_TOO_LARGE: "File size exceeds maximum limit of 5MB",
//   ...
// }

IMAGE_CONSTANTS.SUCCESS_MESSAGES
// {
//   UPLOADED_SINGLE: "Image uploaded successfully",
//   UPLOADED_MULTIPLE: "image(s) uploaded successfully",
//   ...
// }
```

## Validation Schemas

Zod schemas are available for input validation:

```typescript
import { ImageValidation } from "./image.validation";

// Validate single upload
const result = ImageValidation.uploadSingleSchema.parse({
  body: { folder: "homerent" },
  file: multerFile
});

// Validate multiple uploads
const result = ImageValidation.uploadMultipleSchema.parse({
  body: { folder: "homerent" },
  files: multerFiles
});
```

## Interfaces Reference

Key TypeScript interfaces for type-safe operations:

```typescript
// Upload response type
interface IUploadResponse {
  url: string;
  filename: string;
  size: number;
}

// Multiple upload response
interface IUploadMultipleResponse {
  urls: string[];
  count: number;
  filenames: string[];
}

// Generic service response
interface IImageServiceResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}
```

## Best Practices

1. **Always use ImageService for business logic** - Don't call utils directly from controllers
2. **Validate files in service layer** - Keep validation logic centralized
3. **Handle errors gracefully** - Use catchAsync and sendResponse helpers
4. **Store secure_url from Cloudinary** - Always use HTTPS URLs
5. **Delete old images when updating** - Prevent orphaned files in Cloudinary
6. **Use constants for configuration** - Centralize magic strings and numbers
7. **Type all inputs and outputs** - Leverage TypeScript interfaces
8. **Test with real Cloudinary credentials** - .env must have valid keys

## Testing with Postman

1. **Import Image collection** into Postman
2. **Set environment variables:**
   - `{{base_url}}` = http://localhost:5000
   - `{{token}}` = Bearer token from login
3. **Test upload:** POST /api/images/upload with image file
4. **Test delete:** DELETE /api/images/(encoded-url)

See [IMAGE_UPLOAD_GUIDE.md](../../../IMAGE_UPLOAD_GUIDE.md) for detailed API documentation.
