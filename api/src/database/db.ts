import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Logger } from "@nestjs/common";

const logger = new Logger("Database");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: false, // ✅ FIX
});

logger.log("Database pool created");

export const db = drizzle(pool);