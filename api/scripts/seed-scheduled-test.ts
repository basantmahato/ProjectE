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

// ─── Configuration ────────────────────────────────────────────────────────────

const SUBJECT = { name: "Computer Science", examType: "GATE" };
const TOPIC   = { name: "Algorithms & Complexity" };

// Scheduled 24 hours from now, expires 26 hours from now (2-hour window)
const now         = new Date();
const scheduledAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const expiresAt   = new Date(now.getTime() + 26 * 60 * 60 * 1000);

const TEST = {
  title:           "Algorithms & Complexity – Scheduled Mock Test",
  description:     "A timed mock test on algorithmic complexity, sorting, graphs and dynamic programming. Opens in 24 hours.",
  durationMinutes: 30,
  isPublished:     true,
  scheduledAt,
  expiresAt,
};

// ─── Questions ────────────────────────────────────────────────────────────────

const QUESTIONS_DATA = [
  // Easy ───────────────────────────────────────────────────────────────────────
  {
    questionText: "What is the time complexity of linear search in an unsorted array?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "Linear search checks every element in the worst case, giving O(n).",
    options: [
      { optionText: "O(1)",      isCorrect: false },
      { optionText: "O(log n)",  isCorrect: false },
      { optionText: "O(n)",      isCorrect: true  },
      { optionText: "O(n log n)", isCorrect: false },
    ],
  },
  {
    questionText: "Which of the following sorting algorithms is NOT comparison-based?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "Counting Sort uses element values as indices, not pairwise comparisons.",
    options: [
      { optionText: "Merge Sort",    isCorrect: false },
      { optionText: "Quick Sort",    isCorrect: false },
      { optionText: "Counting Sort", isCorrect: true  },
      { optionText: "Heap Sort",     isCorrect: false },
    ],
  },
  {
    questionText: "What data structure does BFS (Breadth-First Search) use internally?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "BFS uses a Queue to process nodes level by level.",
    options: [
      { optionText: "Stack",          isCorrect: false },
      { optionText: "Queue",          isCorrect: true  },
      { optionText: "Priority Queue", isCorrect: false },
      { optionText: "Linked List",    isCorrect: false },
    ],
  },
  {
    questionText: "What is the space complexity of an iterative Fibonacci implementation?",
    difficulty: "easy",
    marks: 1,
    negativeMarks: 0,
    explanation: "An iterative solution only keeps track of two variables at a time — O(1) space.",
    options: [
      { optionText: "O(n)",  isCorrect: false },
      { optionText: "O(n²)", isCorrect: false },
      { optionText: "O(1)",  isCorrect: true  },
      { optionText: "O(log n)", isCorrect: false },
    ],
  },
  // Medium ─────────────────────────────────────────────────────────────────────
  {
    questionText: "What is the average-case time complexity of Quick Sort?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "With a good pivot Quick Sort achieves O(n log n) on average; worst case is O(n²).",
    options: [
      { optionText: "O(n)",      isCorrect: false },
      { optionText: "O(n log n)", isCorrect: true  },
      { optionText: "O(n²)",     isCorrect: false },
      { optionText: "O(log n)",  isCorrect: false },
    ],
  },
  {
    questionText: "Which graph algorithm is used to find the shortest path in a weighted graph with non-negative edges?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 0,
    explanation: "Dijkstra's algorithm uses a priority queue to greedily find shortest paths from a source.",
    options: [
      { optionText: "BFS",                isCorrect: false },
      { optionText: "DFS",                isCorrect: false },
      { optionText: "Dijkstra's",         isCorrect: true  },
      { optionText: "Bellman-Ford",       isCorrect: false },
    ],
  },
  {
    questionText: "What is the key property of a max-heap?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "In a max-heap every parent node is greater than or equal to its children.",
    options: [
      { optionText: "Each node is smaller than its children",       isCorrect: false },
      { optionText: "Each node is greater than or equal to its children", isCorrect: true  },
      { optionText: "All leaf nodes are at the same level",         isCorrect: false },
      { optionText: "The tree is always a complete binary search tree", isCorrect: false },
    ],
  },
  {
    questionText: "In dynamic programming, what does 'overlapping subproblems' mean?",
    difficulty: "medium",
    marks: 2,
    negativeMarks: 1,
    explanation: "Overlapping subproblems means the same sub-problems are solved multiple times; memoisation caches results to avoid redundant work.",
    options: [
      { optionText: "Subproblems never repeat",                           isCorrect: false },
      { optionText: "The same subproblems are encountered multiple times", isCorrect: true  },
      { optionText: "Every subproblem depends on all others",              isCorrect: false },
      { optionText: "The problem can only be solved recursively",          isCorrect: false },
    ],
  },
  // Hard ───────────────────────────────────────────────────────────────────────
  {
    questionText: "What is the time complexity of the Floyd-Warshall algorithm?",
    difficulty: "hard",
    marks: 3,
    negativeMarks: 1,
    explanation: "Floyd-Warshall iterates over all pairs of vertices for every intermediate vertex: O(V³).",
    options: [
      { optionText: "O(V + E)",    isCorrect: false },
      { optionText: "O(V² log V)", isCorrect: false },
      { optionText: "O(V³)",       isCorrect: true  },
      { optionText: "O(E log V)",  isCorrect: false },
    ],
  },
  {
    questionText: "Which NP-complete problem asks whether a subset of integers sums to a target value?",
    difficulty: "hard",
    marks: 3,
    negativeMarks: 1,
    explanation: "The Subset Sum problem is a classic NP-complete decision problem solvable with DP in pseudo-polynomial time.",
    options: [
      { optionText: "Travelling Salesman",  isCorrect: false },
      { optionText: "Subset Sum",           isCorrect: true  },
      { optionText: "Graph Colouring",      isCorrect: false },
      { optionText: "Knapsack (unbounded)", isCorrect: false },
    ],
  },
];

// ─── Seeder ───────────────────────────────────────────────────────────────────

async function seedScheduledTest() {
  console.log("── Seeding scheduled test ────────────────────────────────────");
  console.log(`   scheduledAt : ${scheduledAt.toISOString()}`);
  console.log(`   expiresAt   : ${expiresAt.toISOString()}\n`);

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
  let skipped  = 0;

  for (const q of QUESTIONS_DATA) {
    const existing = await db
      .select()
      .from(questionBank)
      .where(eq(questionBank.questionText, q.questionText));

    if (existing.length > 0) {
      console.log("→ Skipping duplicate:", q.questionText.slice(0, 60));
      questionIds.push(existing[0].id);
      skipped++;
      continue;
    }

    const [question] = await db
      .insert(questionBank)
      .values({
        topicId:       topic.id,
        questionText:  q.questionText,
        difficulty:    q.difficulty,
        marks:         q.marks,
        negativeMarks: q.negativeMarks,
        explanation:   q.explanation,
      })
      .returning();

    await db.insert(questionOptions).values(
      q.options.map((opt) => ({
        questionId: question.id,
        optionText: opt.optionText,
        isCorrect:  opt.isCorrect,
      }))
    );

    questionIds.push(question.id);
    console.log(`✔ Inserted: "${q.questionText.slice(0, 60)}..."`);
    inserted++;
  }

  console.log(`\n   Questions: ${inserted} inserted, ${skipped} already existed.\n`);

  // 4. Calculate total marks
  const totalMarks = QUESTIONS_DATA.reduce((sum, q) => sum + q.marks, 0);

  // 5. Create the scheduled Test
  const [test] = await db
    .insert(tests)
    .values({
      slug:            slugify(TEST.title),
      title:           TEST.title,
      description:     TEST.description,
      durationMinutes: TEST.durationMinutes,
      totalMarks,
      isPublished:     TEST.isPublished,
      scheduledAt:     TEST.scheduledAt,
      expiresAt:       TEST.expiresAt,
    })
    .returning();

  console.log(`✔ Created test : "${test.title}"`);
  console.log(`   id          : ${test.id}`);
  console.log(`   Total marks : ${totalMarks} | Duration: ${TEST.durationMinutes} min`);
  console.log(`   scheduledAt : ${test.scheduledAt?.toISOString()}`);
  console.log(`   expiresAt   : ${test.expiresAt?.toISOString()}`);

  // 6. Link Questions to the Test
  await db.insert(testQuestions).values(
    questionIds.map((questionId, index) => ({
      testId:        test.id,
      questionId,
      questionOrder: index + 1,
    }))
  );

  console.log(`✔ Linked ${questionIds.length} question(s) to the test.\n`);
  console.log("── Done ──────────────────────────────────────────────────────");
}

seedScheduledTest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
