import 'dotenv/config';
import { db } from '../src/database/db';
import { subjects } from '../src/database/schema/subjects.schema';
import { topics } from '../src/database/schema/topics.schema';
import { notes } from '../src/database/schema/note.schema';
import { slugify } from '../src/common/slug.util';
import { randomUUID } from 'crypto';

const SUBJECTS_DATA = [
  { name: 'Physics', examType: 'JEE' },
  { name: 'Mathematics', examType: 'JEE' },
  { name: 'Chemistry', examType: 'JEE' },
];

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  Physics: ['Kinematics', 'Newton\'s Laws of Motion', 'Work, Energy and Power'],
  Mathematics: ['Calculus', 'Algebra', 'Trigonometry'],
  Chemistry: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry'],
};

const NOTES_BY_TOPIC: Record<string, Array<{ title: string; content: string; orderIndex?: number }>> = {
  'Kinematics': [
    { title: 'Introduction to Kinematics', content: 'Kinematics is the branch of mechanics that describes the motion of points, bodies, and systems of bodies without considering the forces that cause the motion. Key quantities include displacement, velocity, and acceleration.', orderIndex: 0 },
    { title: 'Equations of Motion', content: 'For uniformly accelerated motion: v = u + at, s = ut + (1/2)at², v² = u² + 2as. Here u is initial velocity, v is final velocity, a is acceleration, t is time, and s is displacement.', orderIndex: 1 },
  ],
  "Newton's Laws of Motion": [
    { title: 'First Law - Inertia', content: 'Newton\'s first law states that a body remains at rest or in uniform motion in a straight line unless acted upon by an external force. This is the principle of inertia.', orderIndex: 0 },
    { title: 'Second Law - F = ma', content: 'The acceleration of a body is directly proportional to the net force acting on it and inversely proportional to its mass. F = ma is the fundamental equation of dynamics.', orderIndex: 1 },
  ],
  'Work, Energy and Power': [
    { title: 'Work Done by a Force', content: 'Work W is defined as W = F·s cos θ, where F is the force, s is displacement, and θ is the angle between force and displacement. Work is a scalar quantity measured in joules.', orderIndex: 0 },
  ],
  'Calculus': [
    { title: 'Limits and Continuity', content: 'The limit of a function at a point describes the value the function approaches as the input approaches that point. A function is continuous at a point if its limit equals its value there.', orderIndex: 0 },
    { title: 'Derivatives', content: 'The derivative of a function f(x) at a point gives the instantaneous rate of change. It is defined as the limit of the difference quotient as Δx tends to zero.', orderIndex: 1 },
  ],
  'Algebra': [
    { title: 'Linear Equations', content: 'A linear equation in one variable has the form ax + b = 0. The solution is x = -b/a when a ≠ 0. Systems of linear equations can be solved by substitution or elimination.', orderIndex: 0 },
  ],
  'Trigonometry': [
    { title: 'Basic Trigonometric Ratios', content: 'For a right triangle, sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent. The Pythagorean identity is sin²θ + cos²θ = 1.', orderIndex: 0 },
  ],
  'Organic Chemistry': [
    { title: 'Introduction to Organic Compounds', content: 'Organic chemistry is the study of carbon-containing compounds. Carbon forms four bonds and can form long chains and rings, leading to a vast variety of molecules.', orderIndex: 0 },
  ],
  'Inorganic Chemistry': [
    { title: 'Periodic Table and Periodicity', content: 'The periodic table organizes elements by atomic number and electron configuration. Periodicity refers to recurring trends in properties such as ionization energy, electronegativity, and atomic radius.', orderIndex: 0 },
  ],
  'Physical Chemistry': [
    { title: 'States of Matter', content: 'Matter exists in solid, liquid, and gas phases. Phase transitions depend on temperature and pressure. The kinetic theory explains gas behavior using the ideal gas law PV = nRT.', orderIndex: 0 },
  ],
};

async function seedNotes() {
  console.log('Seeding subjects, topics, and notes...');

  const subjectNameToId = new Map<string, string>();

  for (const sub of SUBJECTS_DATA) {
    const slug = slugify(sub.name);
    const [inserted] = await db.insert(subjects).values({ slug, name: sub.name, examType: sub.examType }).returning();
    if (inserted) {
      subjectNameToId.set(sub.name, inserted.id);
      console.log(`  Subject: ${sub.name} (id: ${inserted.id})`);
    }
  }

  const topicNameToId = new Map<string, string>();

  for (const [subjectName, topicNames] of Object.entries(TOPICS_BY_SUBJECT)) {
    const subjectId = subjectNameToId.get(subjectName);
    if (!subjectId) continue;
    for (const topicName of topicNames) {
      const topicSlug = slugify(topicName);
      const [inserted] = await db.insert(topics).values({ subjectId, slug: topicSlug, name: topicName }).returning();
      if (inserted) {
        topicNameToId.set(topicName, inserted.id);
        console.log(`  Topic: ${topicName} (subject: ${subjectName})`);
      }
    }
  }

  for (const [topicName, notesData] of Object.entries(NOTES_BY_TOPIC)) {
    const topicId = topicNameToId.get(topicName);
    if (!topicId) continue;
    for (const note of notesData) {
      const baseSlug = slugify(note.title);
      const slug = `${baseSlug}-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
      const [inserted] = await db
        .insert(notes)
        .values({
          topicId,
          slug,
          title: note.title,
          content: note.content,
          orderIndex: note.orderIndex ?? null,
        })
        .returning();
      if (inserted) {
        console.log(`  Note: ${note.title} (topic: ${topicName})`);
      }
    }
  }

  console.log('Done seeding subjects, topics, and notes.');
}

seedNotes().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
