import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set — skipping migrations");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  const db = drizzle(pool);
  // In production dist/migrate.js → __dirname is dist/, drizzle/ is copied there during build
  const migrationsFolder = path.resolve(__dirname, "drizzle");
  console.log("Running migrations from:", migrationsFolder);
  await migrate(db, { migrationsFolder });
  console.log("Migrations complete");
  await pool.end();
}

runMigrations().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
