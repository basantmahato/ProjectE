import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/database/db";
import { samplePapers } from "../src/database/schema/samplePaper.schema";
import { samplePaperSubjects } from "../src/database/schema/samplePaperSubject.schema";
import { samplePaperTopics } from "../src/database/schema/samplePaperTopic.schema";
import { samplePaperQuestions } from "../src/database/schema/samplePaperQuestion.schema";
import { samplePaperQuestionOptions } from "../src/database/schema/samplePaperQuestionOption.schema";

const SAMPLE_PAPER = {
  title: "JEE Main 2025 Sample Paper",
  description: "Sample paper for Physics and Mathematics sections.",
};

const SUBJECTS_DATA = [
  {
    name: "Physics",
    topics: [
      {
        name: "Mechanics",
        questions: [
          {
            questionText: "What is the SI unit of force?",
            explanation: "Force is measured in Newtons (N) in the SI system.",
            orderIndex: 0,
            options: [
              { optionText: "Joule", isCorrect: false },
              { optionText: "Newton", isCorrect: true },
              { optionText: "Pascal", isCorrect: false },
              { optionText: "Watt", isCorrect: false },
            ],
          },
          {
            questionText: "Which law states that every action has an equal and opposite reaction?",
            explanation: "Newton's third law of motion.",
            orderIndex: 1,
            options: [
              { optionText: "Newton's first law", isCorrect: false },
              { optionText: "Newton's second law", isCorrect: false },
              { optionText: "Newton's third law", isCorrect: true },
              { optionText: "Law of gravitation", isCorrect: false },
            ],
          },
        ],
      },
      {
        name: "Electromagnetism",
        questions: [
          {
            questionText: "What does a voltmeter measure?",
            explanation: "A voltmeter measures potential difference (voltage) across two points.",
            orderIndex: 0,
            options: [
              { optionText: "Current", isCorrect: false },
              { optionText: "Resistance", isCorrect: false },
              { optionText: "Voltage", isCorrect: true },
              { optionText: "Power", isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "Mathematics",
    topics: [
      {
        name: "Algebra",
        questions: [
          {
            questionText: "What is the value of (a + b)²?",
            explanation: "Expansion of (a + b)² = a² + 2ab + b².",
            orderIndex: 0,
            options: [
              { optionText: "a² + b²", isCorrect: false },
              { optionText: "a² + 2ab + b²", isCorrect: true },
              { optionText: "a² - 2ab + b²", isCorrect: false },
              { optionText: "(a - b)²", isCorrect: false },
            ],
          },
          {
            questionText: "What is the quadratic formula for ax² + bx + c = 0?",
            explanation: "x = (-b ± √(b² - 4ac)) / 2a",
            orderIndex: 1,
            options: [
              { optionText: "x = -b / 2a", isCorrect: false },
              { optionText: "x = (-b ± √(b² - 4ac)) / 2a", isCorrect: true },
              { optionText: "x = b ± √(b² - 4ac)", isCorrect: false },
              { optionText: "x = (b² - 4ac) / 2a", isCorrect: false },
            ],
          },
        ],
      },
      {
        name: "Calculus",
        questions: [
          {
            questionText: "What is the derivative of xⁿ with respect to x?",
            explanation: "Power rule: d/dx(xⁿ) = n·xⁿ⁻¹.",
            orderIndex: 0,
            options: [
              { optionText: "nxⁿ", isCorrect: false },
              { optionText: "xⁿ⁻¹", isCorrect: false },
              { optionText: "n·xⁿ⁻¹", isCorrect: true },
              { optionText: "(n+1)xⁿ", isCorrect: false },
            ],
          },
        ],
      },
    ],
  },
];

async function seedSamplePaper() {
  const existing = await db
    .select()
    .from(samplePapers)
    .where(eq(samplePapers.title, SAMPLE_PAPER.title));

  if (existing.length > 0) {
    console.log("→ Sample paper already exists:", existing[0].title);
    console.log("  (Delete it first if you want to re-seed.)");
    return;
  }

  const [inserted] = await db
    .insert(samplePapers)
    .values({
      title: SAMPLE_PAPER.title,
      description: SAMPLE_PAPER.description,
    })
    .returning();
  const paper = inserted!;
  console.log("✔ Created sample paper:", paper.title);

  for (const subj of SUBJECTS_DATA) {
    const [subject] = await db
      .insert(samplePaperSubjects)
      .values({
        samplePaperId: paper.id,
        name: subj.name,
      })
      .returning();
    console.log("  ✔ Subject:", subject!.name);

    for (const top of subj.topics) {
      const [topic] = await db
        .insert(samplePaperTopics)
        .values({
          samplePaperSubjectId: subject!.id,
          name: top.name,
        })
        .returning();
      console.log("    ✔ Topic:", topic!.name);

      for (const q of top.questions) {
        const [question] = await db
          .insert(samplePaperQuestions)
          .values({
            samplePaperTopicId: topic!.id,
            questionText: q.questionText,
            explanation: q.explanation,
            orderIndex: q.orderIndex,
          })
          .returning();

        await db.insert(samplePaperQuestionOptions).values(
          q.options.map((opt) => ({
            samplePaperQuestionId: question!.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          }))
        );
        console.log("      ✔ Question:", q.questionText.slice(0, 50) + "...");
      }
    }
  }

  console.log("\n✔ Sample paper seed completed.");
}

seedSamplePaper()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
