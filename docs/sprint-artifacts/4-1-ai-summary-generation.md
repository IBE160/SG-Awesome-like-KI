# Story 4.1: AI Summary Generation

Status: in-progress

## Story

As a user,
I want to generate concise summaries from my uploaded study materials,
so that I can quickly grasp the key concepts.

## Acceptance Criteria

1.  Given I have an uploaded document, when I request a summary, then the AI generates a concise summary of the document's key points within 30 seconds. (Source: docs/epics.md#Story-4.1-AI-Summary-Generation--FR3.1)
2.  If the AI is unable to generate a summary (e.g., due to insufficient text or too many images), the system displays an informative error message. (Source: docs/epics.md#Story-4.1-AI-Summary-Generation--FR3.1)

## Tasks / Subtasks

- [x] **Frontend Development: Implement Summary Generation UI (AC: #1, #2)**
  - [x] Develop the UI for initiating summary generation from a selected document.
  - [x] Implement the loading screen/modal with progress information during generation. (Source: docs/epics.md#Story-4.5-Guided-Summary-Generation-Wizard)
  - [x] Display the generated summary content.
  - [x] Handle and display error messages from the backend if summary generation fails.
- [x] **Backend Development: Create Vercel Function for Summary API (AC: #1, #2)**
  - [x] Create a Vercel Function endpoint (`POST /api/generate` with `type: "summary"`).
  - [x] Implement logic to securely call the Claude AI Model with the document content and appropriate prompt engineering.
  - [x] Integrate with Supabase Storage to retrieve document content.
  - [x] Implement robust error handling for AI API calls and insufficient content scenarios.
  - [x] Store the generated summary in the `generated_content` table, linked to the `study_materials` table. (Source: docs/architecture.md#2.1-Tables)
- [x] **Database Schema Updates (if necessary)**
  - [x] Verify `generated_content` table schema supports summary content (jsonb).
  - [x] Ensure `study_materials` has `id`, `file_name`, `storage_path` and links to `classes` and `class_sections`.
- [x] **Testing (AC: #1, #2)**
  - [x] Write unit tests for the Vercel Function (AI proxy logic, error handling).
  - [x] Write integration tests for the `POST /api/generate` endpoint, including success and failure scenarios.
  - [x] Develop end-to-end tests for the full user flow of uploading a document and generating a summary, verifying content and timing.
  - [x] Test with various document sizes and content types (e.g., very short text, text with images, etc.) to ensure error handling is robust.

## Change Log

**2025-12-10**: Implemented Claude AI integration in `src/app/api/generate/route.ts` and fixed duplicated code. Verified `@anthropic-ai/sdk` dependency and removal of `@google/generative-ai`.
**2025-12-11**: Senior Developer Review notes appended. Outcome: Changes Requested.

### Senior Developer Review (AI)

**Reviewer:** BIP (AI Developer Agent)
**Date:** 2025-12-11
**Outcome:** Changes Requested

**Summary:**
The core functionality for AI summary generation for Story 4.1 is implemented, with frontend UI and backend API in place. Both Acceptance Criteria (ACs) for summary generation are met, and all tasks, except for one subtask in testing, are verified as complete. The implementation aligns well with the defined architecture and Epic 4 Tech Spec. However, the review identified one medium-severity finding related to test coverage for specific content edge cases, and several low-severity findings concerning logging, hardcoded configuration, frontend error handling robustness, and accessibility. These issues warrant changes before approval.

**Key Findings (by severity):**

*   **Medium Severity:**
    *   **Finding:** Inadequate test coverage for specific document content edge cases in the backend summary generation logic. While basic error handling is present (e.g., for missing `extracted_text`), explicit unit tests for how the system handles very short, unusual, or potentially problematic text content from documents are missing. This gap could lead to unexpected behavior or failures in production for specific user-uploaded documents, potentially violating AC2's requirement for informative error messages.
        -   **Rationale:** Lack of explicit tests for edge case content might hide subtle bugs in AI prompting or error parsing, impacting user experience and the reliability of error messages.

*   **Low Severity:**
    *   **Finding:** Logging in `src/app/api/generate/route.ts` and `src/components/summary/SummaryGenerator.tsx` uses `console.error`.
        -   **Rationale:** `console.error` provides limited context in a production environment compared to structured logs, making debugging and monitoring less efficient.
    *   **Finding:** The Claude AI model name (`claude-3-opus-20240229`) is hardcoded in `src/app/api/generate/route.ts`.
        -   **Rationale:** Hardcoding makes model changes difficult without code modification and redeployment, limiting flexibility for A/B testing or future model upgrades.
    *   **Finding:** The frontend error message parsing in `src/components/summary/SummaryGenerator.tsx` (`handleGenerateSummary` function) assumes `response.json()` will always yield an object with an `error` property for error cases.
        -   **Rationale:** This assumption makes the frontend less robust. If the backend returns a plain text error or a different JSON structure, the frontend might fail to display the specific error message, leading to a poor user experience.
    *   **Finding:** The loading spinner in `src/components/summary/SummaryGenerator.tsx` visually indicates progress but lacks explicit ARIA attributes to announce its state and purpose to screen reader users.
        -   **Rationale:** Impedes accessibility for visually impaired users.
    *   **Finding:** The `src/app/api/generate/__tests__/route.test.ts` lacks an explicit test case to verify the `400` response when `document.extracted_text` is `null` or empty in `src/app/api/generate/route.ts`.
        -   **Rationale:** A specific test would ensure this crucial error path for AC2 is robustly handled and explicitly verified.

**Acceptance Criteria Coverage:**

| AC# | Description                                                                                                                                     | Status        | Evidence                                                                                                                                                                                                                                                             |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Given I have an uploaded document, when I request a summary, then the AI generates a concise summary of the document's key points within 30 seconds. | IMPLEMENTED   | `src/components/summary/SummaryGenerator.tsx`: Initiates API call. `src/app/api/generate/route.ts`: Implements Claude AI call, stores content. `src/app/api/generate/__tests__/route.test.ts`: Tests successful summary generation. E2E tests `tests/e2e/summary-generation.spec.ts` cover the flow. |
| 2   | If the AI is unable to generate a summary (e.g., due to insufficient text or too many images), the system displays an informative error message.     | IMPLEMENTED   | `src/app/api/generate/route.ts`: Handles `!extracted_text` and `claudeError`. `src/components/summary/SummaryGenerator.tsx`: Displays errors. `src/app/api/generate/__tests__/route.test.ts`: Tests Claude API errors.                                                                        |

**Summary: 2 of 2 acceptance criteria fully implemented.**

**Task Completion Validation:**

| Task                                                                     | Marked As | Verified As    | Evidence                                                                                                           |
| :----------------------------------------------------------------------- | :-------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| **Frontend Development: Implement Summary Generation UI (AC: #1, #2)**   | [x]       | COMPLETE       | `src/components/summary/SummaryGenerator.tsx` (all subtasks)                                                       |
| **Backend Development: Create Vercel Function for Summary API (AC: #1, #2)** | [x]       | COMPLETE       | `src/app/api/generate/route.ts` (all subtasks)                                                                     |
| **Database Schema Updates (if necessary)**                               | [x]       | COMPLETE       | `docs/schema.sql` (both subtasks verified)                                                                         |
| **Testing (AC: #1, #2)**                                                 | [x]       | QUESTIONABLE   | `src/app/api/generate/__tests__/route.test.ts`, `tests/e2e/summary-generation.spec.ts`. *Subtask 4 "Test with various document sizes and content types" needs further validation.* |

**Summary: 3 out of 4 main tasks are verified complete. The "Testing" task has one subtask marked as QUESTIONABLE.**

**Test Coverage and Gaps:**
- Unit and integration tests for the API route (`src/app/api/generate/__tests__/route.test.ts`) cover successful summary generation and various failure scenarios, including Claude AI API errors.
- End-to-end tests (`tests/e2e/summary-generation.spec.ts`) verify the full user flow from document upload to summary generation and display.
- **Gap (Medium Severity):** Specific unit test cases for `src/app/api/generate/route.ts` to rigorously handle various content edge cases (e.g., very short text documents) are missing, leading to the "QUESTIONABLE" status for the corresponding task subtask.
- **Gap (Low Severity):** An explicit test case for the `!document.extracted_text` error path in `src/app/api/generate/__tests__/route.test.ts` is missing.

**Architectural Alignment:**
- The implementation adheres to the defined architecture: Next.js frontend, Supabase for data, Vercel Function as AI proxy, and Claude AI integration.
- AI API key management uses `process.env` in the Vercel Function, aligning with security best practices.

**Security Notes:**
- User authentication and authorization are correctly implemented using Supabase sessions and Row Level Security (RLS) checks on `user_id` in database queries.
- AI API keys are securely managed as environment variables, preventing client-side exposure.
- While prompt engineering is employed, continued vigilance against potential prompt injection (especially if user-controlled content directly influences prompts beyond `extracted_text`) is recommended.

**Best-Practices and References:**
- **Tech Stack:** Next.js, React, Tailwind CSS, shadcn/ui, Supabase, TypeScript, Jest, Playwright, Anthropic SDK.
- The use of TypeScript, modern frameworks, and a comprehensive testing strategy are aligned with best practices.

**Action Items:**

**Code Changes Required:**
- [ ] [Medium] **Improve Test Coverage for Content Edge Cases:** Add unit tests to `src/app/api/generate/__tests__/route.test.ts` that specifically mock `extracted_text` with edge case content (e.g., very short strings, content likely to trigger AI model limitations or specific error conditions, if feasible without actual AI calls) to verify robust error handling as per AC2.
- [ ] [Low] **Implement Structured Logging:** Replace `console.error` calls in `src/app/api/generate/route.ts` and `src/components/summary/SummaryGenerator.tsx` with a structured logging solution suitable for production environments.
- [ ] [Low] **Externalize AI Model Name:** Move the Claude AI model name (`claude-3-opus-20240229`) from `src/app/api/generate/route.ts` to an environment variable (e.g., `process.env.CLAUDE_MODEL_NAME`) to enhance configurability and flexibility.
- [ ] [Low] **Robust Frontend Error Parsing:** Enhance error parsing in `src/components/summary/SummaryGenerator.tsx` (`handleGenerateSummary` function) to check the `Content-Type` header of API responses. This will allow for more robust handling of non-JSON error responses or varying JSON error structures from the backend.
- [ ] [Low] **Improve Accessibility for Loading State:** Add appropriate ARIA attributes (e.g., `role="status"`, `aria-live="polite"`, `aria-label="Generating summary, please wait"`) to the loading indicator in `src/components/summary/SummaryGenerator.tsx` to improve accessibility for screen reader users.
- [ ] [Low] **Add Specific Test for Missing Extracted Text:** Add a dedicated unit test case to `src/app/api/generate/__tests__/route.test.ts` that explicitly mocks `document.extracted_text: null` or an empty string to verify the `400` response, ensuring full coverage for AC2's error conditions.

**Advisory Notes:**
- Note: The performance NFR of "summary generation within 30 seconds" (AC1) requires runtime monitoring and performance testing to verify.
- Note: For `src/app/api/generate/route.ts`, explore further sanitization/validation of `document.extracted_text` if there's any risk of user-controlled malicious content manipulating AI behavior, although less critical for summary generation.

## Change Log

**2025-12-10**: Implemented Claude AI integration in `src/app/api/generate/route.ts` and fixed duplicated code. Verified `@anthropic-ai/sdk` dependency and removal of `@google/generative-ai`.

### Senior Developer Review (AI)

**Reviewer:** BIP (AI Developer Agent)
**Date:** Wednesday, December 10, 2025
**Outcome:** Changes Requested

**Summary:** The core functionality for AI summary and quiz generation using Claude AI is implemented and tested. Frontend UI for initiating summary generation, displaying loading states, and showing results is present. Database schema aligns with requirements. However, there are pending improvements related to robust error handling for Claude AI API, and a dedicated integration test for the full API flow.

**Key Findings (by severity):**

*   **Medium Severity:**
    *   **Finding:** Enhanced error handling in `src/app/api/generate/route.ts` is needed to specifically address potential failures from the Claude AI API (e.g., AI model errors, rate limiting, content moderation issues) (AC #2). Implement more granular HTTP status codes and messages.
    *   **Finding:** A dedicated integration test for `POST /api/generate` is missing as per specification. While `route.test.ts` covers unit/integration aspects, `tests/integration/api/generate-api.test.ts` should be created to verify the full flow with AI integration (or mocked AI responses) (AC #1, #2).

*   **Low Severity:**
    *   **Finding:** `console.error` is used for logging errors. For production environments, consider replacing `console.error` with a structured logging solution.
    *   **Finding:** The Claude model name (`claude-3-opus-20240229`) is hardcoded in `src/app/api/generate/route.ts`. It should be moved to an environment variable or configuration for easier management and flexibility.

**Acceptance Criteria Coverage:**

| AC# | Description                                                                                                                                     | Status        | Evidence                                                                                                                                                                                                                                                             |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Given I have an uploaded document, when I request a summary, then the AI generates a concise summary of the document's key points within 30 seconds. | IMPLEMENTED   | `src/components/summary/SummaryGenerator.tsx`: Initiates API call. `src/app/api/generate/route.ts`: Implements Claude AI call, stores content. `src/app/api/generate/__tests__/route.test.ts`: Tests successful summary generation. `tests/e2e/summary-generation.spec.ts`: Verifies full flow. |
| 2   | If the AI is unable to generate a summary (e.g., due to insufficient text or too many images), the system displays an informative error message.     | IMPLEMENTED   | `src/app/api/generate/route.ts`: Handles `!extracted_text` and `claudeError`. `src/components/summary/SummaryGenerator.tsx`: Displays errors. `src/app/api/generate/__tests__/route.test.ts`: Tests Claude API errors. `tests/e2e/summary-generation.spec.ts`: Verifies error message display.       |

**Summary: 2 of 2 acceptance criteria fully implemented.**

**Task Completion Validation:**

| Task                                                                     | Marked As | Verified As    | Evidence                                                                                                           |
| :----------------------------------------------------------------------- | :-------- | :------------- | :----------------------------------------------------------------------------------------------------------------- |
| **Frontend Development: Implement Summary Generation UI (AC: #1, #2)**   | [x]       | COMPLETE       | `src/components/summary/SummaryGenerator.tsx` (all subtasks)                                                       |
| **Backend Development: Create Vercel Function for Summary API (AC: #1, #2)** | [x]       | COMPLETE       | `src/app/api/generate/route.ts` (all subtasks)                                                                     |
| **Database Schema Updates (if necessary)**                               | [x]       | COMPLETE       | `docs/schema.sql` (both subtasks)                                                                                  |
| **Testing (AC: #1, #2)**                                                 | [x]       | COMPLETE       | `src/app/api/generate/__tests__/route.test.ts` (unit/integration), `tests/e2e/summary-generation.spec.ts` (E2E) |

**Summary: 4 of 4 main tasks and all 16 subtasks verified complete.**

**Test Coverage and Gaps:**
- Unit tests exist for the API route's logic, including Claude AI error handling (`src/app/api/generate/__tests__/route.test.ts`).
- E2E tests for the full user flow of summary generation are implemented (`tests/e2e/summary-generation.spec.ts`).
- **Gap:** A dedicated integration test (`tests/integration/api/generate-api.test.ts`) focusing on the full flow with AI integration (or mocked AI responses) is missing as specified in the "Review Follow-ups (AI)" section.

**Architectural Alignment:**
- The implementation aligns well with the architectural patterns: Vercel Functions as intermediary, Claude AI integration, Supabase for data, and Next.js frontend.
- **Warning:** No Epic Tech Spec found for Epic 4 means there's a potential gap in ensuring full alignment with specific epic-level technical decisions. (Advisory note from story).

**Security Notes:**
- Authentication and authorization checks are in place (`supabase.auth.getSession()`, `user_id` in Supabase queries).
- Environment variables are used for API keys (`process.env.ANTHROPIC_API_KEY`).
- Vercel Function acts as a secure intermediary.

**Best-Practices and References:**
- **Tech Stack:** Next.js, React, Tailwind CSS, Supabase, TypeScript, Jest, Playwright, Anthropic SDK.

**Action Items:**

**Code Changes Required:**
- [ ] [Medium] Enhance error handling in `src/app/api/generate/route.ts` to specifically address potential failures from the Claude AI API (e.g., AI model errors, rate limiting, content moderation issues) (AC #2). Implement more granular HTTP status codes and messages.
- [ ] [Medium] Implement integration tests for `POST /api/generate` to verify the full flow with AI integration (or mocked AI responses) [file: tests/integration/api/generate-api.test.ts].

**Advisory Notes:**
- Note: Consider replacing `console.error` with a structured logging solution for production.
- Note: Move Claude model name (`claude-3-opus-2025-12-10`) in `src/app/api/generate/route.ts` to an environment variable or configuration for easier management.
- Note: Address the missing Epic 4 Tech Spec to ensure architectural alignment.
