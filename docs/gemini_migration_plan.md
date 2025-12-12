# Gemini Migration Plan

This document outlines the remaining tasks required to fully transition the AI model from Claude to Gemini within the application, up to functionality implemented in Story 4.2. This includes updating automated tests, environment variables, documentation, and a plan for manual verification.

---

## 1. Codebase Changes (Remaining)

### 1.1. Modify `src/app/api/generate/__tests__/route.test.ts` (Continuing)

The automated tests in `src/app/api/generate/__tests__/route.test.ts` need to be updated to reflect the switch from Claude to Gemini. This involves:

*   **Replacing Claude-specific mock implementations:** All instances where `mockAnthropic.prototype.messages.create` was mocked need to be replaced with mocks for `mockGenerateSummaryWithGemini` and `mockGenerateQuizWithGemini`.
*   **Updating `expect` assertions:**
    *   Change `expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(...)` to `expect(mockGenerateSummaryWithGemini).toHaveBeenCalledWith(...)` or `expect(mockGenerateQuizWithGemini).toHaveBeenCalledWith(...)`.
    *   Adjust the expected arguments (`model` name, prompt structure) to match the Gemini functions.
    *   Update expected error messages and HTTP statuses to align with `handleGeminiError` and the simulated Gemini responses.
*   **Refactoring test data:** Ensure mock responses for summaries and quizzes are consistent with what `src/lib/gemini.ts` would return (e.g., direct string for summary, JSON string for quiz).

### 1.2. Update Environment Variables

The application relies on environment variables to configure the AI model. These need to be updated:

*   **`process.env.ANTHROPIC_API_KEY` to `process.env.GEMINI_API_KEY`:** This change is already largely reflected in `src/app/api/generate/route.ts` and needs to be completed in the test file as well.
*   **`process.env.CLAUDE_MODEL_NAME` to `process.env.GEMINI_MODEL_NAME`:** The default model name used in the application and tests needs to be switched.

**Action Items:**

*   Modify `src/app/api/generate/__tests__/route.test.ts` to replace remaining Claude-specific test logic with Gemini mocks and assertions.
*   In `jest.setup.ts`, change `process.env.CLAUDE_MODEL_NAME` to `process.env.GEMINI_MODEL_NAME` and update `process.env.ANTHROPIC_API_KEY` to `process.env.GEMINI_API_KEY`. (This might be handled by test framework directly or require manual update)
*   Instruct user to update `.env` and `.env.test` files with `GEMINI_API_KEY` and `GEMINI_MODEL_NAME`.

---

## 2. Documentation Updates

All relevant documentation files need to be updated to reflect Gemini as the primary AI model instead of Claude.

*   **`docs/proposal.md`:** Update sections mentioning the AI model choice.
*   **`docs/architecture.md`:** Update diagrams and descriptions of the AI component.
*   **`docs/product-brief.md`:** Revise details about the AI model capabilities, costs, and rationale.
*   **`docs/research-sessions/research-3.2.md`:** This file will require a significant rewrite to reflect the new AI model choice and its associated research/rationale, including any new findings on Gemini's cost-effectiveness, capabilities, and limitations relevant to the project.
*   **`docs/sprint-artifacts/*.md` (and `*.context.xml`):** Review and update any sprint artifacts that explicitly mention Claude for summary or quiz generation. This includes:
    *   `docs/sprint-artifacts/4-1-ai-summary-generation.md`
    *   `docs/sprint-artifacts/4-2-ai-quiz-generation-selectable-length.md`
    *   `docs/sprint-artifacts/4-4-motivational-feedback-explanations.md`
    *   `docs/sprint-artifacts/tech-spec-epic-4.md`
    *   `docs/sprint-artifacts/tech-spec-epic-5.md`

**Action Items:**

*   Identify all documentation files mentioning "Claude" and update them to "Gemini", ensuring the rationale and details are accurate for the new model.

---

## 3. Manual Testing Plan (Up to Story 4.2)

After the code changes and environment variable updates are complete, manual testing is crucial to verify the functionality and correct behavior of the Gemini integration for summary and quiz generation.

### 3.1. Prerequisites

*   Ensure the application is running locally (e.g., `npm run dev`).
*   Ensure `GEMINI_API_KEY` is correctly configured in your `.env` file.
*   Ensure `GEMINI_MODEL_NAME` is correctly configured in your `.env` file (e.g., `gemini-pro`, `gemini-1.5-pro-latest`, etc.).
*   Have at least one document uploaded to the application that contains sufficient text for both summary and quiz generation.

### 3.2. Summary Generation Testing

1.  **Navigate to a document:** Open the application in a browser and go to a page displaying an uploaded document (Story 3.1).
2.  **Initiate Summary Generation:** Locate and click the "Generate Summary" or equivalent button/option.
3.  **Verify Loading State:** Observe that a loading indicator or message appears during the generation process.
4.  **Verify Successful Summary:**
    *   Once complete, check that a summary is displayed.
    *   Read the summary to ensure it is relevant and concise based on the document's content.
    *   Check for any console errors or unexpected behavior.
5.  **Verify Error Handling (Simulated):**
    *   *To simulate API key error:* Temporarily remove or invalidate `GEMINI_API_KEY` in `.env` and restart the app. Attempt summary generation again.
    *   *Expected outcome:* An informative error message indicating an authentication/authorization issue should be displayed to the user.
    *   *To simulate rate limit error:* (If possible, or conceptual): Imagine triggering a rate limit.
    *   *Expected outcome:* An informative error message indicating a rate limit should be displayed.
    *   *To simulate insufficient content error:* Attempt to generate a summary for a very short document (e.g., less than 100 characters).
    *   *Expected outcome:* An informative error message: "Document content is too short for meaningful summarization."

### 3.3. Quiz Generation Testing (Story 4.2)

1.  **Navigate to a document:** Open the application in a browser and go to a page displaying an uploaded document.
2.  **Initiate Quiz Generation:** Locate and click the "Generate Quiz" or equivalent button/option.
3.  **Select Quiz Length:** Choose different quiz lengths (Short, Medium, Long) if available.
4.  **Verify Loading State:** Observe a loading indicator.
5.  **Verify Successful Quiz Generation:**
    *   Check that a quiz is displayed with multiple-choice questions, options, and explanations.
    *   Validate that the quiz content is relevant to the document.
    *   **Verify quiz length adaptation (AC3):**
        *   For a short document (<500 chars), try requesting a "Medium" or "Long" quiz. Verify that the system generates a "Short" quiz and displays the user message: "The document content is too short to generate a [medium/long] quiz. Generating a short quiz instead."
        *   For a medium document (500-1500 chars), try requesting a "Long" quiz. Verify that the system generates a "Medium" quiz and displays the user message: "The document content is not sufficient for a long quiz. Generating a medium quiz instead."
        *   For a long document (>1500 chars), verify all quiz lengths (Short, Medium, Long) generate correctly without messages.
    *   Check for any console errors or unexpected behavior.
6.  **Verify Error Handling (Simulated):**
    *   *To simulate API key error:* Temporarily remove or invalidate `GEMINI_API_KEY` in `.env` and restart the app. Attempt quiz generation.
    *   *Expected outcome:* An informative error message indicating an authentication/authorization issue should be displayed.
    *   *To simulate insufficient content error (too short for any quiz):* Attempt quiz generation for a very short document (<100 chars).
    *   *Expected outcome:* An informative error message: "Document content is too short for meaningful quiz generation."

---

## 4. Next Steps

*   Complete the remaining automated test updates for `src/app/api/generate/__tests__/route.test.ts`.
*   Update environment variables in configuration files.
*   Perform all listed documentation updates.
*   Execute the manual testing plan to ensure full functionality and stability.
