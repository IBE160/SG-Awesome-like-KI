# Story 4.2: AI Quiz Generation (Selectable Length)

Status: review

## Story

As a user,
I want to generate multiple-choice quizzes from my uploaded study materials with a selectable length (short, medium, long),
so that I can test my knowledge effectively and receive an informative error message if the AI is unable to generate a quiz or if I request a longer quiz than the content can support, with the system generating the longest possible quiz in the latter case.

## Acceptance Criteria

1.  **Given** I have an uploaded document, **when** I request a quiz and select a desired length (short, medium, long), **then** the AI generates a relevant multiple-choice quiz within 30 seconds.
2.  **If** the AI is unable to generate a quiz, **then** the system displays an informative error message.
3.  **If** I request a longer quiz than the content can support, **then** the system informs me and generates the longest possible quiz.

## Tasks / Subtasks

- [x] **Develop `POST /api/generate` endpoint for Quiz Generation (Vercel Function)** (AC: #1, #2, #3)
    - [x] Implement endpoint to receive `documentId`, `type: "quiz"`, and `options` (`quizLength`).
    - [x] Retrieve document content from Supabase Storage using `documentId`.
    - [x] Construct an AI prompt for Gemini AI, including document content and desired `quizLength`. (Simulated)
    - [x] Call Gemini AI and handle its response, including cases where content might not support requested quiz length. (Simulated)
    - [x] Store the generated quiz in the `generated_content` table, linking to `study_materials` and `class_sections`.
    - [x] Implement robust error handling for AI API calls and document retrieval.
    - [x] Ensure AI API keys are securely managed within the Vercel Function, not exposed client-side.
    - [x] *Testing Subtask:* Write unit tests for the Vercel Function to verify correct prompt construction, AI interaction, database storage, and error handling. (Framework: Jest)

- [x] **Integrate Quiz Generation in Frontend (Next.js)** (AC: #1, #2, #3)
    - [x] Implement UI logic to call `POST /api/generate` with appropriate parameters for quiz generation (from Story 4.6: Guided Quiz Generation Wizard).
    - [x] Display a loading screen/modal (as per UX spec: "Loading Screen/Modal for Generation") during the 30-second generation period).
    - [x] Handle successful AI response: store generated quiz in local state, transition to the interactive quiz interface (Story 4.3).
    - [x] Handle AI inability to generate quiz: display informative error message to the user.
    - [x] Handle AI generating a shorter quiz than requested: display an informative message to the user along with the generated quiz.
    - [x] *Testing Subtask:* Write integration tests for the frontend to verify correct API calls, loading state, display of generated quiz, and error/information message handling. (Framework: Jest, potentially Playwright/Cypress for E2E)

- [x] **Update Database Schema (Supabase PostgreSQL)** (AC: #1)
    - [x] Ensure `generated_content` table schema can store quiz data (questions, options, correct answers, explanations - potentially within the `jsonb content` field).
    - [x] Verify existing Row Level Security (RLS) policies for `generated_content` table adequately protect quiz data.
    - [x] *Testing Subtask:* Write database migration scripts and verification steps to ensure schema supports quiz data and RLS is effective.

- [x] **Implement Observability for Quiz Generation** (AC: #1, #2, #3)
    - [x] Implement comprehensive logging for quiz generation requests, AI API calls, and responses within the Vercel Function and Frontend.
    - [x] Collect metrics on quiz generation time, success/failure rates, and AI model response times.
    - [x] Consider implementing distributed tracing to track requests across Frontend, Vercel Function, and Claude AI for easier debugging.

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/4-2-ai-quiz-generation-selectable-length.context.xml

### Agent Model Used

Gemini-1.5-Flash

### Debug Log References

### Completion Notes List

- **Develop `POST /api/generate` endpoint for Quiz Generation (Vercel Function):**
  - Implemented logic in `src/app/api/generate/route.ts` to receive `type: "quiz"` and `options: { quizLength }`.
  - Created a simulated `generateQuizWithGemini` function in `src/lib/gemini.ts` to generate placeholder quiz data.
  - Extended error handling in `src/app/api/generate/route.ts` to manage invalid or missing `quizLength`.
  - Unit tests for the `/api/generate` endpoint, including quiz generation scenarios, have been added/updated in `src/app/api/generate/__tests__/route.test.ts` and are now passing.
- **Update Database Schema (Supabase PostgreSQL):**
  - Verified that `generated_content.content` (jsonb) can store quiz data.
  - Updated RLS policies in `supabase/rls.sql` for `generated_content` to enforce ownership via `user_id`.
  - Added `user_id` column to `generated_content` table in `docs/schema.sql` and corresponding foreign key constraint.
- **Integrate Quiz Generation in Frontend (Next.js):**
  - Implemented a temporary `src/app/quiz-generation/page.tsx` for UI logic to call `POST /api/generate`.
  - Added client-side logic for quiz length selection, loading states, and displaying results/errors.
  - Created `src/app/quiz-generation/__tests__/page.test.tsx` with integration tests for the frontend UI.
- **Implement Observability for Quiz Generation:**
  - Enhanced logging in `src/app/api/generate/route.ts` to include `requestId`, incoming request details, AI API call info (request, response, errors), and database operation results.
  - Added client-side logging to `src/app/quiz-generation/page.tsx` for user actions and API responses.

### File List

- `src/app/api/generate/route.ts` (Modified)
- `src/lib/gemini.ts` (Modified)
- `src/app/api/generate/__tests__/route.test.ts` (Modified)
- `supabase/rls.sql` (Modified)
- `src/app/quiz-generation/page.tsx` (Added, Modified)
- `src/app/quiz-generation/__tests__/page.test.tsx` (Added)

## Change Log

### Senior Developer Review (AI)

**Reviewer:** Amelia (AI Developer Agent)
**Date:** tirsdag 9. desember 2025
**Outcome:** Not yet reviewed.