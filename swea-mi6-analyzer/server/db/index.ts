import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";

export let db: ReturnType<typeof drizzle> | null = null;
export { schema };

if (process.env.DATABASE_URL) {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  db = drizzle(pool, { schema, mode: "default" });
} else {
  console.warn("DATABASE_URL not set — database features disabled");
}
