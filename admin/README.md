# Admin Dashboard

Admin management dashboard for the ProjE backend. Built with React, TypeScript, Vite, Tailwind CSS, React Query, React Hook Form, and Axios.

## Setup

1. Install dependencies: `pnpm install`
2. Create `.env` (optional):
   - `VITE_API_URL` – API base URL (default: `/api` for Vite proxy to `http://localhost:3000`)
3. Start the API backend on port 3000.
4. Run the admin app: `pnpm dev` (runs on port 5174).

## Login

Use an admin user account (role `admin`) from your backend. Only users with role `admin` can access the dashboard.

## Features

- **Dashboard** – Overview counts (users, subjects, topics, tests).
- **Users** – List all users (email, name, role, plan, total marks).
- **Subjects** – Create, delete subjects (name, exam type).
- **Topics** – Create, edit, delete topics (by subject).
- **Question Bank** – Create, delete questions; filter by topic.
- **Question Options** – Create, delete options; filter by question.
- **Tests** – Create, delete tests; manage test questions (add/remove from question bank).
- **Mock Tests** – Same as Tests for mock exams.
- **Sample Papers** – Create, delete sample papers.
- **Interview Prep** – Create, delete job roles; add topics per role.
- **Blog** – Create, delete blog posts (slug, title, content, excerpt).
- **Notifications** – Send notifications to all users (title, body, type).
- **Notes** – Browse by subject/topic; create, delete notes per topic.

## Tech Stack

- **Axios** – API client with auth header and 401 redirect.
- **React Hook Form** – Forms with validation.
- **Zod** – Schema validation (with `@hookform/resolvers/zod`).
- **React Query** – Data fetching and cache.
- **Tailwind CSS** – Styling.
- **React Router** – Routing and protected routes.
