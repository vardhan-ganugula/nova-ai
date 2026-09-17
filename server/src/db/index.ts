import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {DATABASE_URL, NODE_ENV} from "@utils/config.util.js";

let client = null;
if (NODE_ENV === 'production' || process.env.VERCEL) {
  // In serverless environments, limit connection pool and handle SSL
  const hasSslInUrl = DATABASE_URL.includes('sslmode=');
  client = postgres(DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ...(hasSslInUrl ? {} : { ssl: { rejectUnauthorized: false } }),
  });
} else {
  client = postgres(DATABASE_URL);
}

export const db = drizzle(client);