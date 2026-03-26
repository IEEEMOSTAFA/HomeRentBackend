import cloudinary from "../../config/cloudinary.config";

/**
 * Image Utils
 * Layer: Data Access / External Service Integration
 * Responsibility: Pure utility functions for Cloudinary operations
 */

/**
 * Upload a single image buffer to Cloudinary
 * @param fileBuffer - Binary file buffer
 * @param folder - Cloudinary destination folder
 * @returns Secure URL of uploaded image
 * @throws Error if Cloudinary operation fails
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = "homerent"
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          reject(
            new Error(`Cloudinary upload failed: ${error.message}`)
          );
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error("No URL returned from Cloudinary"));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple image buffers to Cloudinary in parallel
 * @param fileBuffers - Array of binary file buffers
 * @param folder - Cloudinary destination folder
 * @returns Array of secure URLs
 * @throws Error if any upload fails
 */
export const uploadMultipleToCloudinary = async (
  fileBuffers: Buffer[],
  folder: string = "homerent"
): Promise<string[]> => {
  try {
    const uploadPromises = fileBuffers.map((buffer) =>
      uploadToCloudinary(buffer, folder)
    );
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Batch upload failed: ${(error as Error).message}`);
  }
};

/**
 * Delete an image from Cloudinary by URL
 * Extracts public ID from URL and deletes from Cloudinary
 * @param imageUrl - Cloudinary image URL
 * @throws Error if deletion fails
 */
export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{ext}
    const urlParts = imageUrl.split("/");
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split(".")[0];
    const folder = urlParts[urlParts.length - 2];

    // Construct full public ID with folder
    const fullPublicId = `${folder}/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    throw new Error(`Cloudinary deletion failed: ${(error as Error).message}`);
  }
};

/**
 * Delete multiple images from Cloudinary in parallel
 * @param imageUrls - Array of Cloudinary image URLs
 * @throws Error if any deletion fails
 */
export const deleteMultipleFromCloudinary = async (
  imageUrls: string[]
): Promise<void> => {
  try {
    const deletePromises = imageUrls.map((url) =>
      deleteFromCloudinary(url)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(`Batch deletion failed: ${(error as Error).message}`);
  }
};
