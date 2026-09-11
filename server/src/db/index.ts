import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {DATABASE_URL, NODE_ENV} from "@utils/config.util.js";

let client = null;
if(  NODE_ENV === 'production') {
        client = postgres(DATABASE_URL, {
        ssl: {
            rejectUnauthorized: false,
        },
    });
}else{
    client = postgres(DATABASE_URL);
}

export const db = drizzle(client);