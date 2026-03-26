# 🖼️ Image Upload Guide - Cloudinary Integration

This guide explains how to use the image upload API with Cloudinary integration for the HomeRent platform.

## Environment Setup

Make sure your `.env` file contains all required Cloudinary keys:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dnob5pvrf
CLOUDINARY_API_KEY=517416187872537
CLOUDINARY_API_SECRET=y5OkGHGuZgx2lCtJYrqFVlPrlLk
```

## API Endpoints

### 1. Upload Single Image
**Endpoint:** `POST /api/images/upload`

**Access:** Authenticated users

**Request:**
```bash
curl -X POST http://localhost:5000/api/images/upload \
  -F "image=@/path/to/image.jpg" \
  -F "folder=homerent/properties" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**With FormData (Frontend):**
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('folder', 'homerent/properties'); // Optional

const response = await fetch('/api/images/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.data.url); // Save this URL to database
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/abc123.jpg",
    "filename": "property.jpg",
    "size": 245789
  }
}
```

### 2. Upload Multiple Images
**Endpoint:** `POST /api/images/upload-multiple`

**Access:** Authenticated users

**Request:**
```bash
curl -X POST http://localhost:5000/api/images/upload-multiple \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg" \
  -F "folder=homerent/properties" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**With FormData (Frontend):**
```javascript
const formData = new FormData();
const files = fileInput.files; // Multiple files

for (let i = 0; i < files.length; i++) {
  formData.append('images', files[i]);
}
formData.append('folder', 'homerent/properties'); // Optional

const response = await fetch('/api/images/upload-multiple', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
const imageUrls = data.data.urls; // Array of uploaded URLs
console.log(imageUrls); // Save to database
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "3 image(s) uploaded successfully",
  "data": {
    "urls": [
      "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img1.jpg",
      "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img2.jpg",
      "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img3.jpg"
    ],
    "count": 3,
    "filenames": ["img1.jpg", "img2.jpg", "img3.jpg"]
  }
}
```

### 3. Delete Single Image
**Endpoint:** `DELETE /api/images/:imageUrl`

**Access:** Authenticated users

**Request:**
```bash
# URL encode the Cloudinary URL
curl -X DELETE http://localhost:5000/api/images/https%3A%2F%2Fres.cloudinary.com%2F... \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**With Fetch (Frontend):**
```javascript
const imageUrl = "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/abc123.jpg";
const encodedUrl = encodeURIComponent(imageUrl);

const response = await fetch(`/api/images/${encodedUrl}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.message); // "Image deleted successfully"
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Image deleted successfully",
  "data": null
}
```

### 4. Delete Multiple Images
**Endpoint:** `POST /api/images/delete-multiple`

**Access:** Authenticated users

**Request:**
```bash
curl -X POST http://localhost:5000/api/images/delete-multiple \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageUrls": [
      "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img1.jpg",
      "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img2.jpg"
    ]
  }'
```

**With Fetch (Frontend):**
```javascript
const imageUrls = [
  "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img1.jpg",
  "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img2.jpg"
];

const response = await fetch('/api/images/delete-multiple', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ imageUrls })
});

const data = await response.json();
console.log(data.message); // "2 image(s) deleted successfully"
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "2 image(s) deleted successfully",
  "data": null
}
```

## Integration with Property Module

### Creating a Property with Images

```typescript
// Property Controller Example
import { ImageService } from '../Image/image.service';
import prisma from '../../lib/prisma';

export async function createProperty(req: Request, res: Response) {
  const { title, description, type, city, area, address, bedrooms, bathrooms, rentAmount, availableFrom, availableFor } = req.body;
  const userId = req.user.id;

  try {
    // Upload images if provided
    let imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      imageUrls = await ImageService.uploadMultipleImages(
        req.files,
        'homerent/properties'
      );
    }

    // Create property with image URLs
    const property = await prisma.property.create({
      data: {
        ownerId: userId,
        title,
        description,
        type,
        city,
        area,
        address,
        bedrooms,
        bathrooms,
        rentAmount,
        availableFrom: new Date(availableFrom),
        availableFor,
        images: imageUrls, // Store URLs in database
      }
    });

    res.status(201).json({
      statusCode: 201,
      success: true,
      message: "Property created successfully",
      data: property
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      data: null
    });
  }
}
```

### Updating Property Images

```typescript
export async function updatePropertyImages(req: Request, res: Response) {
  const { propertyId } = req.params;
  const userId = req.user.id;

  try {
    // Get existing property
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        message: "Property not found",
        data: null
      });
    }

    if (property.ownerId !== userId) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        message: "Unauthorized",
        data: null
      });
    }

    let newImageUrls: string[] = [];
    
    // Upload new images
    if (req.files && Array.isArray(req.files)) {
      newImageUrls = await ImageService.uploadMultipleImages(
        req.files,
        'homerent/properties'
      );
    }

    // Delete old images if requested
    const { deleteUrls } = req.body;
    if (deleteUrls && Array.isArray(deleteUrls)) {
      await ImageService.deleteMultipleImages(deleteUrls);
    }

    // Update property with new images
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        images: {
          ...property.images.filter(url => !deleteUrls?.includes(url)),
          ...newImageUrls
        }
      }
    });

    res.status(200).json({
      statusCode: 200,
      success: true,
      message: "Property images updated successfully",
      data: updatedProperty
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      success: false,
      message: error.message,
      data: null
    });
  }
}
```

## Specifications

| Aspect | Details |
|--------|---------|
| **Supported Formats** | JPEG, PNG, WebP, GIF |
| **Max File Size** | 5MB per image |
| **Max Files Per Request** | 10 images |
| **Storage** | Cloudinary CDN (secure_url) |
| **Default Folder** | `homerent` |
| **Custom Folders** | Via `folder` field in request body |
| **URL Format** | HTTPS secure URLs (https://res.cloudinary.com/...) |
| **Auto optimization** | Quality auto-adjustment, format auto-adjustment |
| **Deletion** | Permanent removal from Cloudinary |

## Error Handling

### Common Errors

**400 - No file uploaded:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "No file uploaded",
  "data": null
}
```

**400 - Invalid file type:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "File upload error: Only JPEG, PNG, WebP, and GIF images are allowed",
  "data": null
}
```

**413 - File too large:**
```json
{
  "statusCode": 400,
  "success": false,
  "message": "File upload error: File too large",
  "data": null
}
```

**500 - Cloudinary error:**
```json
{
  "statusCode": 500,
  "success": false,
  "message": "Cloudinary upload failed: ...",
  "data": null
}
```

## Postman Testing

### Import in Postman

1. **Upload Single Image**
   - Method: POST
   - URL: `{{base_url}}/api/images/upload`
   - Body: form-data
     - Key: `image`, Type: File
     - Key: `folder`, Type: Text, Value: `homerent/properties`

2. **Upload Multiple Images**
   - Method: POST
   - URL: `{{base_url}}/api/images/upload-multiple`
   - Body: form-data
     - Key: `images`, Type: File (select multiple)
     - Key: `folder`, Type: Text, Value: `homerent/properties`

3. **Delete Single Image**
   - Method: DELETE
   - URL: `{{base_url}}/api/images/{{imageUrl}}`
   - Pre-request Script:
     ```javascript
     // Encode the URL
     pm.environment.set("imageUrl", 
       encodeURIComponent(pm.environment.get("imageUrl"))
     );
     ```

4. **Delete Multiple Images**
   - Method: POST
   - URL: `{{base_url}}/api/images/delete-multiple`
   - Body: raw JSON
     ```json
     {
       "imageUrls": ["url1", "url2"]
     }
     ```

## Database Storage

Store the returned Cloudinary URLs in the Property model:

```prisma
model Property {
  // ... other fields
  images          String[]    // Array of Cloudinary URLs
  // ... other fields
}
```

**Example:**
```typescript
// When creating a property
const property = await prisma.property.create({
  data: {
    // ... other fields
    images: [
      "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img1.jpg",
      "https://res.cloudinary.com/dnob5pvrf/image/upload/v1234567890/homerent/properties/img2.jpg"
    ]
  }
});
```

## Troubleshooting

### Issue: 401 Unauthorized
**Solution:** Ensure you're passing the correct Bearer token in the Authorization header

### Issue: Upload fails silently
**Solution:** Check Cloudinary credentials in `.env` file are correct

### Issue: URL returns 403 Forbidden
**Solution:** Cloudinary URL may have expired or been deleted. Regenerate and update database

### Issue: CORS errors
**Solution:** Image routes are already included in Express app. Make sure CORS middleware is configured properly.

## Best Practices

1. **Always store URLs in database** after successful upload
2. **Validate file type on frontend** before uploading (UX)
3. **Show upload progress** for better user experience
4. **Use custom folders** to organize images by type/property
5. **Delete old images** when updating properties to save bandwidth
6. **Use CDN URLs directly** - Cloudinary provides optimized delivery
7. **Don't upload to temporary storage** - use Cloudinary directly
8. **Handle upload errors gracefully** - show user-friendly messages
