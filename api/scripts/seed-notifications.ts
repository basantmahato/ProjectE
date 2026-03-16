import "dotenv/config";
import { db } from "../src/database/db";
import { notifications } from "../src/database/schema/notification.schema";

const SAMPLE_NOTIFICATIONS = [
  {
    title: "Welcome",
    body: "Thanks for signing up. Explore mock tests, sample papers, and interview prep to get started.",
    type: "info",
  },
  {
    title: "New mock test",
    body: "A new full-length mock test has been added. Give it a try from the Tests section.",
    type: "success",
  },
  {
    title: "Scheduled test reminder",
    body: "Your scheduled test starts in 30 minutes. Make sure you're in a quiet place with a stable connection.",
    type: "warning",
  },
  {
    title: "Premium plan updated",
    body: "Your subscription is now active. You have full access to all features.",
    type: "transaction",
  },
];

async function seed() {
  for (const item of SAMPLE_NOTIFICATIONS) {
    await db.insert(notifications).values({
      title: item.title,
      body: item.body,
      type: item.type,
    });
  }
  console.log(`Seeded ${SAMPLE_NOTIFICATIONS.length} notifications.`);
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
