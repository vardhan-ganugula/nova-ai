import {config} from 'dotenv';
config();

export const NODE_ENV = process.env.NODE_ENV || 'production';
export const PORT = process.env.PORT || 3000; 
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const USE_UPSTASH = process.env.USE_UPSTASH === 'true';
const rawServerUrl =
  process.env.SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:8000');

export const SERVER_URL = rawServerUrl.trim().replace(/\/api\/?$/i, '').replace(/\/+$/, '');

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = Number(process.env.SMTP_PORT);
export const SMTP_USER = process.env.SMTP_USER; 
export const SMTP_PASS = process.env.SMTP_PASS; 

// SMTP Configuration
if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
  console.warn('⚠️ SMTP configuration is missing. Email sending will be disabled.');
}

// AI Configuration
export const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY || '';
export const FAL_API_KEY = process.env.FAL_AI_API_KEY || '';

if (!OPENROUTER_API_KEY) {
  console.warn('⚠️ OpenRouter API key is missing. Set OPEN_ROUTER_API_KEY in environment.');
}
if (!FAL_API_KEY) {
  console.warn('⚠️ Fal AI API key is missing. Set FAL_AI_API_KEY in environment.');
}

// Cloudflare R2 Configuration
export const CLOUDFLARE_R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT || '';
export const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID || ''; 
export const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '';
export const CLOUDFLARE_R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';

if (!CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY || !CLOUDFLARE_R2_BUCKET_NAME) {
  console.warn('⚠️ Cloudflare R2 configuration is missing. Image storage operations will be disabled.');
}

// Token Deduction & Allocation Configuration
export const DOWNLOAD_WATERMARK_FREE_TOKEN_COST = Number(process.env.DOWNLOAD_WATERMARK_FREE_TOKEN_COST) || 1;
export const DAILY_FREE_TOKENS = Number(process.env.DAILY_FREE_TOKENS) || 50;

// Meta / Instagram OAuth Configuration
export const INSTAGRAM_APP_ID = (process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID || '').trim();
export const INSTAGRAM_APP_SECRET = (process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET || '').trim();
export const INSTAGRAM_REDIRECT_URI = (
  process.env.INSTAGRAM_REDIRECT_URI || `${SERVER_URL}/api/integrations/instagram/callback`
).trim();

// Social Token Encryption Key (AES-256-GCM)
export const SOCIAL_TOKEN_ENCRYPTION_KEY =
  process.env.SOCIAL_TOKEN_ENCRYPTION_KEY ||
  process.env.SESSION_SECRET ||
  'vimitron_social_token_secret_key_32_bytes!';
