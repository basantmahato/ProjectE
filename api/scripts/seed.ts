import "dotenv/config";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../src/database/db";
import { users } from "../src/database/schema/user.schema";

async function seed() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const name = process.env.ADMIN_NAME ?? "Admin";

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    console.log("Admin user already exists:", email);
    process.exit(0);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    password: hashed,
    name,
    role: "admin",
  });

  console.log("Admin user created:", email);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
