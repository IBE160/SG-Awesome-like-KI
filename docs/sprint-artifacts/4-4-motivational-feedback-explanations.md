# Story 4.4: Motivational Feedback & Explanations

Status: ready-for-dev

## Story

As a user,
I want to receive motivational feedback and explanations for quiz answers,
so that I can learn from my mistakes and build confidence.

## Acceptance Criteria

1.  Given I have completed a quiz, when I review my results, then I receive a score and positive reinforcement.
2.  For each question, the correct answer and an explanation are displayed.
3.  If the AI cannot provide an explanation for a correct answer, the system explicitly states this.

## Tasks / Subtasks

-   [ ] **Backend: Modify Quiz Generation Logic** (AC: #2, #3)
    -   [ ] Update the Vercel Function that calls the Claude AI model.
    -   [ ] Engineer the AI prompt to request an explanation for each quiz answer and to provide motivational feedback. The tone should be supportive and educational.
    -   [ ] Modify the data structure in the `generated_content` table's `content` field to store the explanation alongside each question and answer.
    -   [ ] Implement error handling for cases where the AI fails to provide an explanation.
-   [ ] **Frontend: Update Quiz Interface** (AC: #1, #2, #3)
    -   [ ] Design and implement a UI to display the final score and motivational feedback upon quiz completion.
    -   [ ] In the quiz review screen, display the AI-generated explanation for each question.
    -   [ ] Display a message when an explanation is not available for a question.
-   [ ] **Testing**
    -   [ ] Write unit tests for the Vercel Function to ensure the prompt is correctly formatted and the response is parsed correctly.
    -   [ ] Write integration tests to verify the end-to-end flow of generating a quiz with explanations and displaying them on the frontend.
    -   [ ] Manually test the UI to ensure it is clear, supportive, and handles all cases gracefully.

## Dev Notes

-   **AI Integration**: The core of this feature is the interaction with the Claude AI model. The AI prompt must be carefully engineered to produce the desired supportive and educational tone. All AI interactions are funneled through a Vercel Function to protect the API key. [Source: docs/architecture.md#1.2.-Component-Interaction]
-   **Database**: The explanations and feedback will be stored within the `content` JSONB field of the `generated_content` table. The data structure for quizzes will need to be updated to accommodate this new information. [Source: docs/architecture.md#2.1.-Tables]
-   **Frontend**: The quiz review interface will need to be updated to display the new information. The design should align with the "Calm & Focused" color palette and "Guided Minimalism" principles. [Source: docs/epics.md#Story 5.1]

### Project Structure Notes

-   **Vercel Function**: The existing function for AI generation should be modified.
-   **Frontend Component**: The React component for the quiz review screen will need to be updated.

### References

-   [Source: docs/epics.md#Story 4.4: Motivational Feedback & Explanations [FR4.2]]
-   [Source: docs/architecture.md]

### Learnings from Previous Story

- No specific learnings to carry over from Story 4.3 (Interactive Quiz Interface) as there were no outstanding completion notes or review items.

## Change Log

- 2025-11-30: Initial draft by Bob (Scrum Master)
- 2025-11-30: Remedied minor issues (missing learnings, vague citations, missing change log) by Bob (Scrum Master)

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/4-4-motivational-feedback-explanations.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
