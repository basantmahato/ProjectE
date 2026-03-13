import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/database/db";
import { users } from "../src/database/schema/user.schema";
import { blogPosts } from "../src/database/schema/blogPost.schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";

const BLOG_POSTS_DATA = [
  {
    slug: "how-to-prepare-for-competitive-exams",
    title: "How to Prepare for Competitive Exams",
    content: `Competitive exams require a structured approach and consistent effort. Here are key strategies that work.

**1. Create a study plan**
Break your syllabus into manageable chunks and assign realistic deadlines. Allocate more time to weak areas while revising strong topics regularly.

**2. Practice with mock tests**
Taking full-length mock tests under exam conditions helps you manage time and build stamina. Analyze your performance to identify patterns and improve.

**3. Revise systematically**
Spaced repetition works. Revise the same topic at increasing intervals (e.g., after 1 day, 3 days, 1 week) to retain information longer.

**4. Stay healthy**
Adequate sleep, exercise, and a balanced diet improve concentration and memory. Avoid last-minute cramming the night before the exam.

**5. Use quality resources**
Stick to a few trusted books and online platforms. Too many sources can lead to confusion and wasted time.

Consistency and a calm mindset will take you far. Good luck!`,
    excerpt: "A practical guide to preparing for competitive exams: study plans, mock tests, revision techniques, and staying healthy.",
    featuredImage: null,
    images: null,
    metaTitle: "How to Prepare for Competitive Exams | ProjE",
    metaDescription: "Learn how to prepare for competitive exams with a study plan, mock tests, revision strategies, and healthy habits. Practical tips for students.",
    metaKeywords: ["competitive exams", "exam preparation", "study tips", "mock tests", "revision"],
    canonicalUrl: null,
    ogTitle: "How to Prepare for Competitive Exams",
    ogDescription: "A practical guide to preparing for competitive exams with proven strategies.",
    ogImage: null,
    twitterCard: "summary_large_image",
    twitterTitle: "How to Prepare for Competitive Exams",
    twitterDescription: "Practical tips for exam preparation: study plans, mocks, and revision.",
    twitterImage: null,
    isPublished: true,
  },
  {
    slug: "best-practices-for-online-mock-tests",
    title: "Best Practices for Online Mock Tests",
    content: `Taking mock tests online is different from paper-based practice. These practices will help you get the most out of them.

**Simulate exam conditions**
Use a quiet room, set a timer, and avoid distractions. Turn off notifications and use the same device type if possible.

**Review every question**
After submitting, go through each question—right and wrong. Understand why the correct answer is correct and why you might have chosen the wrong one.

**Track your progress**
Note your scores, time per section, and weak areas. Over time you’ll see trends and can focus revision where it matters.

**Use the platform’s features**
Familiarize yourself with navigation, flagging, and review before the real exam. This reduces stress on exam day.

**Stay consistent**
One full mock per week (or as per your plan) is more useful than many rushed attempts. Quality practice beats quantity.

Following these practices will make your mock tests more effective and improve your real exam performance.`,
    excerpt: "Get the most from online mock tests: simulate exam conditions, review answers, track progress, and stay consistent.",
    featuredImage: null,
    images: null,
    metaTitle: "Best Practices for Online Mock Tests | ProjE",
    metaDescription: "Best practices for taking online mock tests: simulate exam conditions, review answers, track progress, and improve performance.",
    metaKeywords: ["mock tests", "online exams", "exam practice", "test preparation", "study tips"],
    canonicalUrl: null,
    ogTitle: "Best Practices for Online Mock Tests",
    ogDescription: "How to make the most of online mock tests and improve your exam performance.",
    ogImage: null,
    twitterCard: "summary",
    twitterTitle: "Best Practices for Online Mock Tests",
    twitterDescription: "Tips for effective online mock test practice.",
    twitterImage: null,
    isPublished: true,
  },
  {
    slug: "interview-prep-tips-for-freshers",
    title: "Interview Prep Tips for Freshers",
    content: `As a fresher, interviews can feel overwhelming. Here’s a focused approach to prepare well.

**Know the job role**
Read the job description carefully. Map each requirement to what you’ve learned (projects, coursework, internships). Prepare short examples for common questions.

**Practice common questions**
“Tell me about yourself,” “Why this company?” and “Describe a challenge you faced” appear in almost every interview. Prepare clear, concise answers and practice out loud.

**Revise fundamentals**
For technical roles, brush up on basics: data structures, algorithms, core concepts of your domain, and one or two projects in depth.

**Do mock interviews**
Practice with friends, mentors, or online platforms. Record yourself to notice body language and filler words. Get feedback and improve.

**Prepare your questions**
Have 2–3 thoughtful questions about the role, team, or company. It shows interest and helps you evaluate the opportunity.

Stay confident, be honest, and treat each interview as a learning experience. You’ve got this!`,
    excerpt: "Interview preparation for freshers: know the role, practice common questions, revise fundamentals, and do mock interviews.",
    featuredImage: null,
    images: null,
    metaTitle: "Interview Prep Tips for Freshers | ProjE",
    metaDescription: "Interview preparation tips for freshers: role alignment, common questions, technical revision, mock interviews, and confidence.",
    metaKeywords: ["interview tips", "freshers", "job interview", "career", "placement preparation"],
    canonicalUrl: null,
    ogTitle: "Interview Prep Tips for Freshers",
    ogDescription: "A practical guide to interview preparation for freshers and new graduates.",
    ogImage: null,
    twitterCard: "summary",
    twitterTitle: "Interview Prep Tips for Freshers",
    twitterDescription: "Prepare for your first interviews with these focused tips.",
    twitterImage: null,
    isPublished: true,
  },
];

async function seedBlog() {
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL));

  if (!admin) {
    console.error(
      `No admin user found with email "${ADMIN_EMAIL}". Run the main seed first: pnpm run db:seed`
    );
    process.exit(1);
  }

  if (admin.role !== "admin") {
    console.error(`User ${ADMIN_EMAIL} is not an admin. Cannot seed blogs.`);
    process.exit(1);
  }

  console.log(`Seeding blogs as admin: ${admin.email} (${admin.name ?? "Admin"})\n`);

  for (const post of BLOG_POSTS_DATA) {
    const existing = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, post.slug));

    if (existing.length > 0) {
      console.log("→ Blog post already exists:", post.slug);
      continue;
    }

    const now = new Date();
    await db.insert(blogPosts).values({
      slug: post.slug,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt ?? null,
      featuredImage: post.featuredImage ?? null,
      images: post.images ?? null,
      metaTitle: post.metaTitle ?? null,
      metaDescription: post.metaDescription ?? null,
      metaKeywords: post.metaKeywords ?? null,
      canonicalUrl: post.canonicalUrl ?? null,
      ogTitle: post.ogTitle ?? null,
      ogDescription: post.ogDescription ?? null,
      ogImage: post.ogImage ?? null,
      twitterCard: post.twitterCard ?? null,
      twitterTitle: post.twitterTitle ?? null,
      twitterDescription: post.twitterDescription ?? null,
      twitterImage: post.twitterImage ?? null,
      isPublished: post.isPublished,
      publishedAt: post.isPublished ? now : null,
      authorId: admin.id,
      createdAt: now,
      updatedAt: now,
    });

    console.log("✔ Created blog post:", post.title);
  }

  console.log("\n✔ Blog seed completed.");
}

seedBlog()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
