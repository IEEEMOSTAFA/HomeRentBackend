/**
 * Configuration Module
 * Central export point for all application configurations
 */

// Environment variables with validation
export { env, envConfig, envVars } from './env';

// Cloudinary configuration
export { default as cloudinary } from './cloudinary.config';

// Multer file upload configuration
export {
  upload,
  uploadSingle,
  uploadMultiple,
  multerConfig,
  default as multer,
} from './multer.config';

// Legacy default export for backward compatibility
import { envConfig } from './env';

export default {
  port: envConfig.port,
  database_url: envConfig.database.url,
  appUrl: envConfig.appUrl,
  nodeEnv: envConfig.nodeEnv,
  isDevelopment: envConfig.isDevelopment,
  isProduction: envConfig.isProduction,
  isTest: envConfig.isTest,
  auth: envConfig.auth,
  cloudinary: envConfig.cloudinary,
  stripe: envConfig.stripe,
};
