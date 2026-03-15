import "dotenv/config";
import { db } from "../src/database/db";
import { subjects } from "../src/database/schema/subjects.schema";
import { topics } from "../src/database/schema/topics.schema";
import { questionBank } from "../src/database/schema/questionBank.schema";
import { questionOptions } from "../src/database/schema/questionOption.schema";
import { tests } from "../src/database/schema/test.schema";
import { testQuestions } from "../src/database/schema/testQuestions.schema";
import { slugify } from "../src/common/slug.util";
import { eq } from "drizzle-orm";

// ─── Configuration ──────────────────────────────────────────────────────────

const SUBJECT = { name: "Computer Science", examType: "GATE" };
const TOPIC = { name: "Full-Stack & System Design" };

const TEST = {
  title: "Full-Stack & System Design Mock Test",
  description:
    "A mixed-difficulty test covering web, databases, algorithms and system design concepts.",
  durationMinutes: 30,
  isPublished: true,
};

// ─── Questions ───────────────────────────────────────────────────────────────

const QUESTIONS_DATA = [
  // Easy ──────────────────────────────────────────────────────────────────────
  {
    questionText: "Which HTTP status code indicates a successful POST request that created a resource?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "201 Created is returned when a new resource has been successfully created.",
    options: [
      { optionText: "200 OK", isCorrect: false },
      { optionText: "201 Created", isCorrect: true },
      { optionText: "204 No Content", isCorrect: false },
      { optionText: "202 Accepted", isCorrect: false },
    ],
  },
  {
    questionText: "Which CSS property is used to make a flex container wrap its items?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "flex-wrap: wrap allows flex items to move to the next line when there is not enough space.",
    options: [
      { optionText: "flex-direction", isCorrect: false },
      { optionText: "flex-wrap", isCorrect: true },
      { optionText: "flex-flow", isCorrect: false },
      { optionText: "align-items", isCorrect: false },
    ],
  },
  {
    questionText: "What is the default port for a PostgreSQL server?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "PostgreSQL listens on port 5432 by default.",
    options: [
      { optionText: "3306", isCorrect: false },
      { optionText: "27017", isCorrect: false },
      { optionText: "5432", isCorrect: true },
      { optionText: "1521", isCorrect: false },
    ],
  },
  {
    questionText: "Which JavaScript keyword is used to declare a block-scoped variable?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "'let' and 'const' are block-scoped; 'var' is function-scoped.",
    options: [
      { optionText: "var", isCorrect: false },
      { optionText: "let", isCorrect: true },
      { optionText: "define", isCorrect: false },
      { optionText: "dim", isCorrect: false },
    ],
  },
  {
    questionText: "What does the 'git pull' command do?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "'git pull' fetches changes from the remote and merges them into the current branch.",
    options: [
      { optionText: "Pushes local commits to remote", isCorrect: false },
      { optionText: "Fetches and merges remote changes", isCorrect: true },
      { optionText: "Creates a new branch", isCorrect: false },
      { optionText: "Resets the working tree", isCorrect: false },
    ],
  },
  // Medium ────────────────────────────────────────────────────────────────────
  {
    questionText: "In REST, which HTTP method is idempotent but NOT safe?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "PUT is idempotent (same result on repeated calls) but not safe because it modifies server state. GET is both safe and idempotent.",
    options: [
      { optionText: "GET", isCorrect: false },
      { optionText: "POST", isCorrect: false },
      { optionText: "PUT", isCorrect: true },
      { optionText: "OPTIONS", isCorrect: false },
    ],
  },
  {
    questionText: "What is the purpose of an index in a relational database?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "Indexes speed up SELECT queries by allowing the DB to locate rows without a full table scan, at the cost of additional write overhead.",
    options: [
      { optionText: "To enforce foreign key constraints", isCorrect: false },
      { optionText: "To speed up data retrieval at the cost of write performance", isCorrect: true },
      { optionText: "To compress table storage", isCorrect: false },
      { optionText: "To prevent duplicate rows", isCorrect: false },
    ],
  },
  {
    questionText: "Which React hook should you use to run a side effect after every render?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "useEffect with no dependency array runs after every render. Passing [] makes it run only on mount.",
    options: [
      { optionText: "useState", isCorrect: false },
      { optionText: "useEffect with an empty dependency array", isCorrect: false },
      { optionText: "useEffect with no dependency array", isCorrect: true },
      { optionText: "useMemo", isCorrect: false },
    ],
  },
  {
    questionText: "What is the time complexity of inserting an element into a hash table (average case)?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "On average, hashing gives O(1) insertion due to direct bucket access.",
    options: [
      { optionText: "O(n)", isCorrect: false },
      { optionText: "O(log n)", isCorrect: false },
      { optionText: "O(1)", isCorrect: true },
      { optionText: "O(n log n)", isCorrect: false },
    ],
  },
  {
    questionText: "Which design pattern separates an object's construction from its representation?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "The Builder pattern lets you construct complex objects step by step, separating construction from the final representation.",
    options: [
      { optionText: "Singleton", isCorrect: false },
      { optionText: "Factory Method", isCorrect: false },
      { optionText: "Builder", isCorrect: true },
      { optionText: "Prototype", isCorrect: false },
    ],
  },
  // Hard ──────────────────────────────────────────────────────────────────────
  {
    questionText: "In a microservices architecture, which pattern ensures data consistency across services without distributed transactions?",
    difficulty: "hard",
    marks: 3,
    negativeMarks: 1,
    explanation: "The Saga pattern coordinates a sequence of local transactions, each publishing an event/message to trigger the next step, avoiding two-phase commit.",
    options: [
      { optionText: "Two-Phase Commit", isCorrect: false },
      { optionText: "Saga Pattern", isCorrect: true },
      { optionText: "Outbox Pattern", isCorrect: false },
      { optionText: "Circuit Breaker", isCorrect: false },
    ],
  },
  {
    questionText: "What is the primary advantage of using a Content Delivery Network (CDN)?",
    difficulty: "hard",
    marks: 3,
    negativeMarks: 1,
    explanation: "CDNs cache static assets at edge nodes geographically closer to users, reducing latency and origin-server load.",
    options: [
      { optionText: "Encrypting data at rest", isCorrect: false },
      { optionText: "Reducing database query time", isCorrect: false },
      { optionText: "Serving cached content from servers closer to the user", isCorrect: true },
      { optionText: "Automating CI/CD pipelines", isCorrect: false },
    ],
  },
  {
    questionText: "Which isolation level prevents phantom reads in SQL databases?",
    difficulty: "hard",
    marks: 3,
    negativeMarks: 1,
    explanation: "Serializable is the highest isolation level and prevents dirty reads, non-repeatable reads, and phantom reads.",
    options: [
      { optionText: "Read Uncommitted", isCorrect: false },
      { optionText: "Read Committed", isCorrect: false },
      { optionText: "Repeatable Read", isCorrect: false },
      { optionText: "Serializable", isCorrect: true },
    ],
  },
];

// ─── Seeder ──────────────────────────────────────────────────────────────────

async function seedTest() {
  console.log("── Seeding test ──────────────────────────────────────────────");

  // 1. Upsert Subject
  let [subject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.name, SUBJECT.name));

  if (!subject) {
    [subject] = await db.insert(subjects).values({ ...SUBJECT, slug: slugify(SUBJECT.name) }).returning();
    console.log("✔ Created subject:", subject.name);
  } else {
    console.log("→ Subject already exists:", subject.name);
  }

  // 2. Upsert Topic
  let [topic] = await db
    .select()
    .from(topics)
    .where(eq(topics.name, TOPIC.name));

  if (!topic) {
    [topic] = await db
      .insert(topics)
      .values({ name: TOPIC.name, slug: slugify(TOPIC.name), subjectId: subject.id })
      .returning();
    console.log("✔ Created topic:", topic.name);
  } else {
    console.log("→ Topic already exists:", topic.name);
  }

  // 3. Insert Questions + Options (skip duplicates)
  const questionIds: string[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const q of QUESTIONS_DATA) {
    const existing = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.questionText, q.questionText));

    if (existing.length > 0) {
      console.log("→ Skipping duplicate question:", q.questionText.slice(0, 60));
      questionIds.push(existing[0].id);
      skipped++;
      continue;
    }

    const [question] = await db
      .insert(questionBank)
      .values({
        topicId: topic.id,
        questionText: q.questionText,
        difficulty: q.difficulty,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        explanation: q.explanation,
      })
      .returning();

    await db.insert(questionOptions).values(
      q.options.map((opt) => ({
        questionId: question.id,
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
      }))
    );

    questionIds.push(question.id);
    console.log(`✔ Inserted question: "${q.questionText.slice(0, 60)}..."`);
    inserted++;
  }

  console.log(`\n   Questions: ${inserted} inserted, ${skipped} already existed.\n`);

  // 4. Calculate total marks from the inserted/existing questions
  const totalMarks = QUESTIONS_DATA.reduce((sum, q) => sum + q.marks, 0);

  // 5. Create the Test
  const [test] = await db
    .insert(tests)
    .values({
      slug: slugify(TEST.title),
      title: TEST.title,
      description: TEST.description,
      durationMinutes: TEST.durationMinutes,
      totalMarks,
      isPublished: TEST.isPublished,
    })
    .returning();

  console.log(`✔ Created test: "${test.title}" (id: ${test.id})`);
  console.log(`   Total marks: ${totalMarks} | Duration: ${TEST.durationMinutes} min | Published: ${TEST.isPublished}`);

  // 6. Link Questions to the Test (ordered)
  await db.insert(testQuestions).values(
    questionIds.map((questionId, index) => ({
      testId: test.id,
      questionId,
      questionOrder: index + 1,
    }))
  );

  console.log(`✔ Linked ${questionIds.length} question(s) to the test.\n`);
  console.log("── Done ──────────────────────────────────────────────────────");
}

seedTest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
