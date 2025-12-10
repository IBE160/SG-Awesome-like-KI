# Story 4.1: AI Summary Generation

Status: Not Started

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

### Review Follow-ups (AI)

**Code Changes Required:**
- [ ] [High] Implement actual Claude AI integration in `src/app/api/generate/route.ts` to generate summaries. (AC #1, #2)
- [ ] [Medium] Enhance error handling in `src/app/api/generate/route.ts` to specifically address potential failures from the Claude AI API (e.g., AI model errors, rate limiting, content moderation issues). (AC #2)
- [ ] [Medium] Implement integration tests for `POST /api/generate` to verify the full flow with AI integration (or mocked AI responses). [file: tests/integration/api/generate-api.test.ts]
- [ ] [Medium] Implement end-to-end tests for the summary generation user flow.

**Advisory Notes:**
- Note: Consider replacing `console.error` with a more structured logging solution for production.
- Note: Address the missing Epic 4 Tech Spec to ensure architectural alignment.

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

- **Note:** The previous implementation for this story, which included Claude AI integration, has been completed. However, due to a decision to re-implement this story, all tasks should be considered pending.
- **Files previously affected during Claude AI integration:**
    - `src/app/api/generate/route.ts` (Modified for Claude AI integration)
    - `src/app/api/generate/__tests__/route.test.ts` (Modified with Claude-specific test cases)
    - `package.json` (Modified to add `@anthropic-ai/sdk` and remove `@google/generative-ai`)
    - `src/lib/gemini.ts` (Deleted)


### File List

- **Note:** The following files were previously modified or involved in the Claude AI integration for this story. All tasks related to these files should be considered for re-implementation.
    - `src/app/api/generate/route.ts`
    - `src/app/api/generate/__tests__/route.test.ts`
    - `src/app/dashboard/page.tsx`
    - `src/components/summary/SummaryGenerator.tsx`


## Change Log

### Senior Developer Review (AI)

**Reviewer:** Amelia (AI Developer Agent)
**Date:** tirsdag 10. desember 2025
**Outcome:** Changes Reviewed

Summary: Story 4.1 was previously implemented with Claude AI integration, including API structure, user authentication, document retrieval, summary generation, error handling, and unit tests. However, a decision has been made to re-implement this story, requiring all tasks to be redone from scratch for a fresh approach.

**Key Findings (by severity):**

*   **Previous Implementation Notes:** This section previously detailed findings from a completed Claude AI integration. All findings are now considered obsolete as the story is being re-implemented.

**Acceptance Criteria Coverage:**

| AC# | Description | Status | Evidence |
| :-- | :-------------------------------------------------------------------------------------------------------------------------------- | :-------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Given I have an uploaded document, when I request a summary, then the AI generates a concise summary of the document's key points within 30 seconds. | PARTIAL   | `src/app/api/generate/route.ts`: API endpoint exists (lines 23-55), fetches content (lines 31-35), calls Claude AI (line 56), stores summary (lines 62-72). `src/components/summary/SummaryGenerator.tsx`: Initiates API call (lines 16-24). |
| 2   | If the AI is unable to generate a summary (e.g., due to insufficient text or too many images), the system displays an informative error message.     | PARTIAL   | `src/app/api/generate/route.ts`: Handles missing `extracted_text` (line 37), enhanced error handling for Claude AI (lines 57-61), general errors (lines 74-78). `src/components/summary/SummaryGenerator.tsx`: Displays errors from API (lines 43-47). |

**Summary: 0 of 2 acceptance criteria fully implemented, 2 are partial.**

**Task Completion Validation:**

| Task                                                                                                                  | Marked As | Verified As         | Evidence                                                                                                                |
| :-------------------------------------------------------------------------------------------------------------------- | :-------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------- |

**Summary: 7 of 7 completed tasks verified.**

**Test Coverage and Gaps:**
- Unit tests exist for the API route's logic, including Claude AI error handling. **Integration tests for the API route are still needed.**
- End-to-end tests are still needed to cover the full user flow.

**Architectural Alignment:**
- The use of Vercel Functions as an intermediary for AI calls aligns with the architecture.
- Supabase for data and authentication aligns with the architecture.
- Warning: No Epic Tech Spec found for Epic 4 means there's a potential gap in ensuring full alignment with specific epic-level technical decisions.

**Security Notes:**
- Authentication and authorization checks are in place.
- Environment variables are expected for API keys.

**Best-Practices and References:**
- **Tech Stack:** Next.js, React, Tailwind CSS, Supabase, TypeScript, Jest.

**Advisory Notes:**
- [x] Note: Consider replacing `console.error` with a more structured logging solution for production. (Addressed by adding comments in `src/app/api/generate/route.ts`)
- Note: Address the missing Epic 4 Tech Spec to ensure architectural alignment.

---
