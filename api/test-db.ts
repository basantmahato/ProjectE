import { db } from "./src/database/db";
import { users } from "./src/database/schema/user.schema";

async function run() {
  const result = await db.select().from(users);
  console.log(result);
}

run();