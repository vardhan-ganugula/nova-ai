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
export const SERVER_URL = process.env.SERVER_URL || 'http://localhost:8000';

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = Number(process.env.SMTP_PORT);
export const SMTP_USER = process.env.SMTP_USER; 
export const SMTP_PASS = process.env.SMTP_PASS; 

// SMTP Configuration
if(!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is missing. Please check your environment variables.');
}

// AI Configuration
export const OPENROUTER_API_KEY = process.env.OPEN_ROUTER_API_KEY || '';
export const FAL_API_KEY = process.env.FAL_AI_API_KEY || '';

if(!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing. Please check your environment variables.');
}
if(!FAL_API_KEY) {
    throw new Error('Fal AI API key is missing. Please check your environment variables.');
}

// Cloudflare R2 Configuration
export const CLOUDFLARE_R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT || '';
export const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID || ''; 
export const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '';
export const CLOUDFLARE_R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || '';

if(!CLOUDFLARE_R2_ENDPOINT || !CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY || !CLOUDFLARE_R2_BUCKET_NAME) {
    throw new Error('Cloudflare R2 configuration is missing. Please check your environment variables.');
}