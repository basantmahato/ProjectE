import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/database/db";
import { interviewPrepJobRoles } from "../src/database/schema/interviewPrepJobRole.schema";
import { interviewPrepTopics } from "../src/database/schema/interviewPrepTopic.schema";
import { interviewPrepSubtopics } from "../src/database/schema/interviewPrepSubtopic.schema";

const JOB_ROLES_DATA = [
  {
    name: "Frontend Developer",
    description: "React, JavaScript, CSS, and UI/UX fundamentals.",
    topics: [
      {
        name: "React",
        explanation: "React is a library for building user interfaces. Focus on components, state, and hooks.",
        subtopics: [
          { name: "Hooks", explanation: "useState, useEffect, useContext, and custom hooks." },
          { name: "State Management", explanation: "Local state vs global state; when to use Redux or Context." },
          { name: "Performance", explanation: "Memo, useMemo, useCallback, and React.memo." },
        ],
      },
      {
        name: "JavaScript",
        explanation: "Core JS concepts frequently asked in frontend interviews.",
        subtopics: [
          { name: "Closures", explanation: "Functions that remember their lexical scope." },
          { name: "Event Loop", explanation: "Call stack, task queue, microtasks, and async behavior." },
        ],
      },
    ],
  },
  {
    name: "Backend Engineer",
    description: "APIs, databases, and system design basics.",
    topics: [
      {
        name: "REST APIs",
        explanation: "Design and implement RESTful APIs.",
        subtopics: [
          { name: "HTTP Methods", explanation: "GET, POST, PUT, PATCH, DELETE and idempotency." },
          { name: "Status Codes", explanation: "2xx, 4xx, 5xx and when to use each." },
        ],
      },
      {
        name: "Databases",
        explanation: "SQL and NoSQL concepts.",
        subtopics: [
          { name: "Indexes", explanation: "How indexes work and when they help or hurt." },
          { name: "Transactions", explanation: "ACID, isolation levels, and consistency." },
        ],
      },
    ],
  },
];

async function seedInterviewPrep() {
  for (const roleData of JOB_ROLES_DATA) {
    const existing = await db
      .select()
      .from(interviewPrepJobRoles)
      .where(eq(interviewPrepJobRoles.name, roleData.name));

    if (existing.length > 0) {
      console.log("→ Job role already exists:", roleData.name);
      continue;
    }

    const [role] = await db
      .insert(interviewPrepJobRoles)
      .values({
        name: roleData.name,
        description: roleData.description ?? null,
      })
      .returning();
    console.log("✔ Created job role:", role!.name);

    for (const topicData of roleData.topics) {
      const [topic] = await db
        .insert(interviewPrepTopics)
        .values({
          jobRoleId: role!.id,
          name: topicData.name,
          explanation: topicData.explanation ?? null,
        })
        .returning();
      console.log("  ✔ Topic:", topic!.name);

      for (const subData of topicData.subtopics) {
        await db.insert(interviewPrepSubtopics).values({
          topicId: topic!.id,
          name: subData.name,
          explanation: subData.explanation ?? null,
        });
        console.log("    ✔ Subtopic:", subData.name);
      }
    }
  }

  console.log("\n✔ Interview prep seed completed.");
}

seedInterviewPrep()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
