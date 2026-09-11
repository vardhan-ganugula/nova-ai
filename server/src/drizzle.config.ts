import { defineConfig } from "drizzle-kit";
import {DATABASE_URL, NODE_ENV} from "@utils/config.util.js";


export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
    ...(NODE_ENV === 'production' && {ssl : 'require'})
  },
});