/**
 * Cloudinary Configuration
 * Media management and CDN delivery setup
 */
import { v2 as cloudinary } from 'cloudinary';
import { envConfig } from './env';

/**
 * Configure Cloudinary with validated environment variables
 * @throws {Error} If Cloudinary configuration fails
 */
try {
  cloudinary.config({
    cloud_name: envConfig.cloudinary.cloudName,
    api_key: envConfig.cloudinary.apiKey,
    api_secret: envConfig.cloudinary.apiSecret,
  });

  // Verify configuration on startup (development only)
  if (envConfig.isDevelopment) {
    console.log('✅ Cloudinary configured successfully');
  }
} catch (error) {
  console.error('❌ Cloudinary configuration failed:', error);
  throw new Error('Failed to configure Cloudinary. Check environment variables.');
}

export default cloudinary;
