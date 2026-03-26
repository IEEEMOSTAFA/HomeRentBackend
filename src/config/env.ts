import { z } from 'zod';

/**
 * Environment Variable Validation Schema
 * Using Zod for runtime validation of environment variables
 */
const envSchema = z.object({
  // Core Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((v) => parseInt(v, 10)).pipe(z.number().min(1).max(65535)).default('5000'),
  APP_URL: z.string().url(),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // BetterAuth Configuration
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  
  // Authentication Tokens
  ACCESS_TOKEN_SECRET: z.string().min(10, 'ACCESS_TOKEN_SECRET is required'),
  REFRESH_TOKEN_SECRET: z.string().min(10, 'REFRESH_TOKEN_SECRET is required'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('1d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: z.string().default('1d'),
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  
  // Stripe Configuration
  PUBLISH_KEY: z.string().min(1, 'PUBLISH_KEY (Stripe) is required'),
  SECRET_KEY: z.string().min(1, 'SECRET_KEY (Stripe) is required'),
  
  // Email Configuration (Optional - for email notifications)
  APP_USER: z.string().email('APP_USER must be valid email').optional(),
  APP_PASS: z.string().optional(),
  
  // Google OAuth Configuration (Optional - for Google login)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

/**
 * Parse and validate environment variables
 * @throws {Error} If validation fails
 */
const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Environment Validation Failed:');
    console.error(JSON.stringify(parsed.error.flatten(), null, 2));
    throw new Error('Invalid environment variables. Check logs for details.');
  }

  return parsed.data;
};

/**
 * Parsed and validated environment variables
 */
export const env = parseEnv();

/**
 * Type-safe environment configuration object
 * Grouped by service for better organization
 */
export const envConfig = {
  // Core
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  appUrl: env.APP_URL,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // Authentication
  auth: {
    betterAuthUrl: env.BETTER_AUTH_URL,
    betterAuthSecret: env.BETTER_AUTH_SECRET,
    accessTokenSecret: env.ACCESS_TOKEN_SECRET,
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
    accessTokenExpiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    sessionTokenExpiresIn: env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN,
  },

  // Cloudinary
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },

  // Stripe
  stripe: {
    publishKey: env.PUBLISH_KEY,
    secretKey: env.SECRET_KEY,
  },

  // Email (Optional)
  email: {
    user: env.APP_USER,
    password: env.APP_PASS,
  },

  // Google OAuth (Optional)
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
} as const;

/**
 * Export for backward compatibility
 */
export const envVars = envConfig;