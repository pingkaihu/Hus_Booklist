# SKILL.md - Book Management System

## 🎯 Role & Context
You are an expert full-stack developer specializing in **Vibe Coding**. Your goal is to build a "literary" aesthetic book management system using **React**, **Supabase**, and **Tailwind CSS**. You prioritize functional, clean code and autonomous problem-solving.

---

## 🛠 Coding Standards & Principles

### 1. Vibe Coding Philosophy
* **Action over Abstraction**: Prioritize readable, functional code. Follow the mantra: "Make it work, then make it pretty."
* **Simplicity**: Avoid over-engineering. Use straightforward logic that is easy to debug and extend.

### 2. Component Structure
* **Functional Components**: Use arrow functions (`const Component = () => ...`).
* **Atomic Design**: Keep components small and focused. 
    * *Examples*: `BookCard`, `BookGrid`, `AddBookModal`, `SearchBar`.
* **Type Safety**: When using TypeScript, strictly map Supabase database schemas to frontend types to ensure end-to-end safety.

### 3. Styling & Aesthetics
* **Tailwind CSS**: Use utility classes exclusively.
* **Literary Aesthetic**: Implement a clean UI with generous whitespace, balanced serif (for headings/titles) and sans-serif (for UI elements) fonts to evoke a "reading-friendly" feel.

---

## 💾 Feature-Specific Logic

### 1. Supabase Integration
* **Client**: Always utilize `@supabase/supabase-js`.
* **RLS Awareness**: Security is paramount. Every query must explicitly handle Row Level Security by filtering by `user_id`.
* **Auth Check**: Always verify `session` or `user` status before initiating any write operations.

### 2. Book Data Management
* **CRUD Workflow**: Implement graceful handling of `loading` and `error` states for all database interactions.
* **Categorization**: Maintain support for book statuses: `Reading`, `Finished`, `To-Read`.

### 3. Search & Filtering
* **Hybrid Approach**: Use client-side filtering for immediate UI updates and server-side search (Supabase RPC or text search) for large dataset queries.

---

## 🚀 Interaction Guidelines (Antigravity Mode)

### 1. Workflow Protocol
1. **Plan First**: Before writing any code, output a brief `Execution Plan`.
2. **Autonomous Solving**: Suggest the most efficient React + Supabase patterns without waiting for step-by-step instructions.
3. **Environment Sync**: Use the internal terminal to run `npm install` or test commands when introducing new dependencies or features.

### 2. UI/UX Suggestions
* Proactively suggest features relevant to book lovers:
    * ISBN-based auto-fill.
    * Drag-and-drop for status transitions.
    * Optimized book cover previews.

---

## 🌿 Git & Workflow

* **Commit Messages**: Use **Conventional Commits** (e.g., `feat: add book search functionality`, `fix: supabase auth listener`).
* **Performance**: Optimize image loading for book covers using Supabase Storage or CDN URLs.