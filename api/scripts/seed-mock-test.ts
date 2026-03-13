import "dotenv/config";
import { db } from "../src/database/db";
import { subjects } from "../src/database/schema/subjects.schema";
import { topics } from "../src/database/schema/topics.schema";
import { questionBank } from "../src/database/schema/questionBank.schema";
import { questionOptions } from "../src/database/schema/questionOption.schema";
import { tests } from "../src/database/schema/test.schema";
import { testQuestions } from "../src/database/schema/testQuestions.schema";
import { eq } from "drizzle-orm";

// ─── Configuration ──────────────────────────────────────────────────────────

const SUBJECT = { name: "Computer Science", examType: "GATE" };
const TOPIC = { name: "Mock Test – Programming & DB" };

const MOCK_TEST = {
  title: "Programming & Database Mock Test",
  description:
    "Practice mock test with questions from the question bank. No scheduling – attempt anytime.",
  durationMinutes: 25,
  isPublished: true,
};

// ─── Questions (with options) ─────────────────────────────────────────────────

const QUESTIONS_DATA = [
  {
    questionText: "Which keyword is used to define a constant in JavaScript (ES6)?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "const declares a block-scoped constant that cannot be reassigned.",
    options: [
      { optionText: "var", isCorrect: false },
      { optionText: "let", isCorrect: false },
      { optionText: "const", isCorrect: true },
      { optionText: "constant", isCorrect: false },
    ],
  },
  {
    questionText: "What does ACID stand for in database transactions?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "ACID: Atomicity, Consistency, Isolation, Durability.",
    options: [
      { optionText: "Atomicity, Consistency, Isolation, Durability", isCorrect: true },
      { optionText: "Accuracy, Consistency, Integrity, Data", isCorrect: false },
      { optionText: "Atomic, Consistent, Independent, Durable", isCorrect: false },
      { optionText: "All, Commit, Insert, Delete", isCorrect: false },
    ],
  },
  {
    questionText: "Which HTTP method is used to retrieve a resource?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "GET is used to request a representation of the specified resource.",
    options: [
      { optionText: "POST", isCorrect: false },
      { optionText: "GET", isCorrect: true },
      { optionText: "PUT", isCorrect: false },
      { optionText: "DELETE", isCorrect: false },
    ],
  },
  {
    questionText: "What is the time complexity of accessing an element in an array by index?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "Array index access is direct memory offset, so O(1).",
    options: [
      { optionText: "O(n)", isCorrect: false },
      { optionText: "O(log n)", isCorrect: false },
      { optionText: "O(1)", isCorrect: true },
      { optionText: "O(n²)", isCorrect: false },
    ],
  },
  {
    questionText: "In SQL, which clause is used to filter rows after grouping?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "HAVING filters groups; WHERE filters rows before grouping.",
    options: [
      { optionText: "WHERE", isCorrect: false },
      { optionText: "HAVING", isCorrect: true },
      { optionText: "FILTER", isCorrect: false },
      { optionText: "GROUP BY", isCorrect: false },
    ],
  },
  {
    questionText: "What is a closure in JavaScript?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "A closure is a function that retains access to variables from its outer (enclosing) scope.",
    options: [
      { optionText: "A function that closes the program", isCorrect: false },
      { optionText: "A function that retains access to its lexical scope", isCorrect: true },
      { optionText: "A private method inside a class", isCorrect: false },
      { optionText: "An async function", isCorrect: false },
    ],
  },
  {
    questionText: "Which normal form requires that every non-key attribute depends on the whole primary key?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "2NF requires no partial dependency: non-key attributes must depend on the entire primary key.",
    options: [
      { optionText: "1NF", isCorrect: false },
      { optionText: "2NF", isCorrect: true },
      { optionText: "3NF", isCorrect: false },
      { optionText: "BCNF", isCorrect: false },
    ],
  },
  {
    questionText: "What is the worst-case time complexity of Quick Sort?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "When the pivot is always the smallest or largest, Quick Sort degrades to O(n²).",
    options: [
      { optionText: "O(n log n)", isCorrect: false },
      { optionText: "O(n)", isCorrect: false },
      { optionText: "O(n²)", isCorrect: true },
      { optionText: "O(log n)", isCorrect: false },
    ],
  },
  {
    questionText: "Which of the following is true about a RESTful API?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "REST is stateless: each request contains all information needed; the server does not store client context.",
    options: [
      { optionText: "It must use XML", isCorrect: false },
      { optionText: "It is stateless", isCorrect: true },
      { optionText: "It requires WebSockets", isCorrect: false },
      { optionText: "It cannot use JSON", isCorrect: false },
    ],
  },
  {
    questionText: "What does the 'N+1 query problem' refer to?",
    difficulty: "hard",
    marks: 3,
    negativeMarks: 1,
    explanation: "N+1: one query to fetch a list, then N extra queries (e.g. one per item) to load related data. Solved by eager loading or batching.",
    options: [
      { optionText: "Writing N queries plus one backup query", isCorrect: false },
      { optionText: "1 query for the list plus N queries for related data per item", isCorrect: true },
      { optionText: "A query that returns N+1 rows", isCorrect: false },
      { optionText: "A problem that occurs after N queries", isCorrect: false },
    ],
  },
];

// ─── Seeder ──────────────────────────────────────────────────────────────────

async function seedMockTest() {
  console.log("── Seeding mock test ───────────────────────────────────────────");

  // 1. Upsert Subject
  let [subject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.name, SUBJECT.name));

  if (!subject) {
    [subject] = await db.insert(subjects).values(SUBJECT).returning();
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
      .values({ name: TOPIC.name, subjectId: subject.id })
      .returning();
    console.log("✔ Created topic:", topic.name);
  } else {
    console.log("→ Topic already exists:", topic.name);
  }

  // 3. Insert Questions + Options (skip duplicates by questionText)
  const questionIds: string[] = [];
  let inserted = 0;
  let skipped = 0;

  for (const q of QUESTIONS_DATA) {
    const existing = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.questionText, q.questionText));

    if (existing.length > 0) {
      console.log("→ Skipping duplicate question:", q.questionText.slice(0, 50) + "...");
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
    console.log(`✔ Inserted question: "${q.questionText.slice(0, 50)}..." (${q.options.length} options)`);
    inserted++;
  }

  console.log(`\n   Questions: ${inserted} inserted, ${skipped} already existed.\n`);

  const totalMarks = QUESTIONS_DATA.reduce((sum, q) => sum + q.marks, 0);

  // 4. Create the Mock Test (no scheduling)
  const [test] = await db
    .insert(tests)
    .values({
      title: MOCK_TEST.title,
      description: MOCK_TEST.description,
      durationMinutes: MOCK_TEST.durationMinutes,
      totalMarks,
      isPublished: MOCK_TEST.isPublished,
      isMock: true,
      scheduledAt: null,
      expiresAt: null,
    })
    .returning();

  console.log(`✔ Created mock test: "${test.title}" (id: ${test.id})`);
  console.log(`   Total marks: ${totalMarks} | Duration: ${MOCK_TEST.durationMinutes} min | Published: ${MOCK_TEST.isPublished}`);
  console.log(`   No scheduling (mock test).`);

  // 5. Link Questions to the Mock Test (test_questions)
  await db.insert(testQuestions).values(
    questionIds.map((questionId, index) => ({
      testId: test.id,
      questionId,
      questionOrder: index + 1,
    }))
  );

  console.log(`✔ Linked ${questionIds.length} question(s) with options to the mock test.\n`);
  console.log("── Done ──────────────────────────────────────────────────────");
}

seedMockTest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
