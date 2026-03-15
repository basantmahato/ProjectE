import "dotenv/config";
import { db } from "../src/database/db";
import { subjects } from "../src/database/schema/subjects.schema";
import { topics } from "../src/database/schema/topics.schema";
import { questionBank } from "../src/database/schema/questionBank.schema";
import { questionOptions } from "../src/database/schema/questionOption.schema";
import { slugify } from "../src/common/slug.util";
import { eq } from "drizzle-orm";

const QUESTIONS_DATA = [
  {
    questionText: "What is the time complexity of binary search?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "Binary search divides the array in half each step, giving O(log n).",
    options: [
      { optionText: "O(n)", isCorrect: false },
      { optionText: "O(log n)", isCorrect: true },
      { optionText: "O(n²)", isCorrect: false },
      { optionText: "O(1)", isCorrect: false },
    ],
  },
  {
    questionText: "Which data structure uses LIFO order?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "A Stack follows Last In First Out (LIFO).",
    options: [
      { optionText: "Queue", isCorrect: false },
      { optionText: "Stack", isCorrect: true },
      { optionText: "Heap", isCorrect: false },
      { optionText: "Graph", isCorrect: false },
    ],
  },
  {
    questionText: "What does SQL stand for?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "SQL stands for Structured Query Language.",
    options: [
      { optionText: "Structured Query Language", isCorrect: true },
      { optionText: "Sequential Query Language", isCorrect: false },
      { optionText: "Simple Query Language", isCorrect: false },
      { optionText: "Standard Query Language", isCorrect: false },
    ],
  },
  {
    questionText: "Which HTTP method is used to update a resource partially?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "PATCH is used for partial updates; PUT replaces the whole resource.",
    options: [
      { optionText: "PUT", isCorrect: false },
      { optionText: "POST", isCorrect: false },
      { optionText: "PATCH", isCorrect: true },
      { optionText: "DELETE", isCorrect: false },
    ],
  },
  {
    questionText: "What is the output of typeof null in JavaScript?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "typeof null returns 'object' — a well-known JavaScript quirk.",
    options: [
      { optionText: "null", isCorrect: false },
      { optionText: "undefined", isCorrect: false },
      { optionText: "object", isCorrect: true },
      { optionText: "string", isCorrect: false },
    ],
  },
  {
    questionText: "Which sorting algorithm has the best average-case time complexity?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "Merge Sort guarantees O(n log n) in all cases.",
    options: [
      { optionText: "Bubble Sort", isCorrect: false },
      { optionText: "Insertion Sort", isCorrect: false },
      { optionText: "Merge Sort", isCorrect: true },
      { optionText: "Selection Sort", isCorrect: false },
    ],
  },
  {
    questionText: "What is a primary key in a relational database?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "A primary key uniquely identifies each row in a table.",
    options: [
      { optionText: "A key that can be null", isCorrect: false },
      { optionText: "A key that uniquely identifies each row", isCorrect: true },
      { optionText: "A foreign reference to another table", isCorrect: false },
      { optionText: "An index on a column", isCorrect: false },
    ],
  },
  {
    questionText: "In OOP, what is encapsulation?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "Encapsulation bundles data and methods and restricts direct access.",
    options: [
      { optionText: "Inheriting properties from a parent class", isCorrect: false },
      { optionText: "Hiding implementation details inside a class", isCorrect: true },
      { optionText: "Creating multiple forms of a method", isCorrect: false },
      { optionText: "Defining an abstract class", isCorrect: false },
    ],
  },
  {
    questionText: "What does the CAP theorem state?",
    difficulty: "hard",
    marks: 3,
    negativeMarks: 1,
    explanation: "CAP: a distributed system can guarantee only 2 of Consistency, Availability, Partition tolerance.",
    options: [
      { optionText: "A system can have Consistency, Availability, and Partition tolerance simultaneously", isCorrect: false },
      { optionText: "A distributed system can guarantee at most 2 of the 3 CAP properties", isCorrect: true },
      { optionText: "Partition tolerance is always sacrificed first", isCorrect: false },
      { optionText: "Availability is not needed in distributed systems", isCorrect: false },
    ],
  },
  {
    questionText: "Which of the following is NOT a JavaScript primitive type?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "Object is a reference type, not a primitive. Primitives: string, number, boolean, null, undefined, symbol, bigint.",
    options: [
      { optionText: "string", isCorrect: false },
      { optionText: "boolean", isCorrect: false },
      { optionText: "object", isCorrect: true },
      { optionText: "symbol", isCorrect: false },
    ],
  },
];

async function seedQuestions() {
  // 1. Upsert Subject
  let [subject] = await db
    .select()
    .from(subjects)
    .where(eq(subjects.name, "Computer Science"));

  if (!subject) {
    [subject] = await db
      .insert(subjects)
      .values({ name: "Computer Science", slug: slugify("Computer Science"), examType: "GATE" })
      .returning();
    console.log("✔ Created subject:", subject.name);
  } else {
    console.log("→ Subject already exists:", subject.name);
  }

  // 2. Upsert Topic
  let [topic] = await db
    .select()
    .from(topics)
    .where(eq(topics.name, "Data Structures & Algorithms"));

  if (!topic) {
    [topic] = await db
      .insert(topics)
      .values({ name: "Data Structures & Algorithms", slug: slugify("Data Structures & Algorithms"), subjectId: subject.id })
      .returning();
    console.log("✔ Created topic:", topic.name);
  } else {
    console.log("→ Topic already exists:", topic.name);
  }

  // 3. Insert Questions + Options
  let inserted = 0;
  let skipped = 0;

  for (const q of QUESTIONS_DATA) {
    const existing = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.questionText, q.questionText));

    if (existing.length > 0) {
      console.log("→ Skipping (already exists):", q.questionText);
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

    console.log(`✔ Inserted: "${q.questionText}" (${q.options.length} options)`);
    inserted++;
  }

  console.log(`\nDone! ${inserted} question(s) inserted, ${skipped} skipped.`);
}

seedQuestions()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
