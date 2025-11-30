# Story 4.1: AI Summary Generation

Status: ready-for-dev

## Story

As a user,
I want to generate concise summaries from my uploaded study materials,
so that I can quickly grasp the key concepts.

## Acceptance Criteria

1.  Given I have an uploaded document, when I request a summary, then the AI generates a concise summary of the document's key points within 30 seconds. (Source: docs/epics.md#Story-4.1-AI-Summary-Generation--FR3.1)
2.  If the AI is unable to generate a summary (e.g., due to insufficient text or too many images), the system displays an informative error message. (Source: docs/epics.md#Story-4.1-AI-Summary-Generation--FR3.1)

## Tasks / Subtasks

- [ ] **Frontend Development: Implement Summary Generation UI (AC: #1, #2)**
  - [ ] Develop the UI for initiating summary generation from a selected document.
  - [ ] Implement the loading screen/modal with progress information during generation. (Source: docs/epics.md#Story-4.5-Guided-Summary-Generation-Wizard)
  - [ ] Display the generated summary content.
  - [ ] Handle and display error messages from the backend if summary generation fails.
- [ ] **Backend Development: Create Vercel Function for Summary API (AC: #1, #2)**
  - [ ] Create a Vercel Function endpoint (`POST /api/generate` with `type: "summary"`).
  - [ ] Implement logic to securely call the Claude AI Model with the document content and appropriate prompt engineering.
  - [ ] Integrate with Supabase Storage to retrieve document content.
  - [ ] Implement robust error handling for AI API calls and insufficient content scenarios.
  - [ ] Store the generated summary in the `generated_content` table, linked to the `study_materials` table. (Source: docs/architecture.md#2.1-Tables)
- [ ] **Database Schema Updates (if necessary)**
  - [ ] Verify `generated_content` table schema supports summary content (jsonb).
  - [ ] Ensure `study_materials` has `id`, `file_name`, `storage_path` and links to `classes` and `class_sections`.
- [ ] **Testing (AC: #1, #2)**
  - [ ] Write unit tests for the Vercel Function (AI proxy logic, error handling).
  - [ ] Write integration tests for the `POST /api/generate` endpoint, including success and failure scenarios.
  - [ ] Develop end-to-end tests for the full user flow of uploading a document and generating a summary, verifying content and timing.
  - [ ] Test with various document sizes and content types (e.g., very short text, text with images, etc.) to ensure error handling is robust.

## Dev Notes

- **Relevant architecture patterns and constraints:**
  - Utilize Vercel Functions as a secure intermediary for AI API calls to prevent client-side exposure of API keys. (Source: docs/architecture.md#1.2-Component-Interaction)
  - Frontend (`Next.js`) communicates with backend via RESTful API routes. (Source: docs/architecture.md#3.-API-Design)
  - Supabase PostgreSQL will be used for storing generated content. (Source: docs/architecture.md#2.-Database-Schema)
  - Ensure RLS policies protect generated content, allowing only the owner to access. (Source: docs/architecture.md#4.-Authentication-and-Authorization)
- **Source tree components to touch:**
  - `src/app/page.tsx` or new summary generation page for frontend UI.
  - `src/pages/api/generate.ts` (or equivalent Route Handler) for the Vercel Function.
  - Supabase client integration files.
  - Database migration files for schema updates if needed.
- **Testing standards summary:**
  - Jest for unit and integration tests. (Source: package.json)
  - E2E testing framework to be determined (e.g., Playwright or Cypress). (Source: docs/sprint-artifacts/tech-spec-epic-4.md#Test-Strategy-Summary)
  - All ACs must be covered by automated tests. (Source: docs/sprint-artifacts/tech-spec-epic-4.md#Test-Strategy-Summary)

### Project Structure Notes

- API endpoint should reside in `src/pages/api` or `app/api` depending on Next.js version used for API Routes/Route Handlers. Current `next.config.ts` implies `app` directory structure. Will place API route in `app/api/generate`.
- New frontend components related to summary generation should be placed in `src/app/components/summary` or similar logical grouping.
- Supabase client configuration is already established (Epic 1), ensure reuse.

### References

- [Source: docs/epics.md#Story-4.1-AI-Summary-Generation--FR3.1]
- [Source: docs/PRD.md#FR3.1---Summary-Generation]
- [Source: docs/architecture.md#1.1.-System-Diagram]
- [Source: docs/architecture.md#1.2.-Component-Interaction]
- [Source: docs/architecture.md#2.1.-Tables]
- [Source: docs/architecture.md#3.1.-Main-API-Endpoints]
- [Source: docs/architecture.md#4.-Authentication-and-Authorization]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#AI-Summary-Generation-Workflow]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Performance]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Security]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Risks,-Assumptions,-Open-Questions]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Test-Strategy-Summary]

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/4-1-ai-summary-generation.context.xml

### Agent Model Used

Gemini-1.5-Flash

### Debug Log References

### Completion Notes List

### File List

## Change Log
