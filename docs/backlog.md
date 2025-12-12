# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story’s `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.


## Open Items
| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-12-07 | fix-jest-config-state | - | Documentation | High | TBD | Open | Reference for ongoing Jest configuration and testing issues. See: docs/sprint-artifacts/jest-config-state.md |
| 2025-12-07 | fix-jest-config | - | Technical Debt | High | TBD | Open | Resolve Jest test suite configuration issues (SyntaxError, cookie scope, NextRequest constructor) for Next.js 16 API routes. This is blocking automated verification of other tasks. |
| 2025-12-10 | unrestricted-supabase-tables | - | Security | High | TBD | Open | The `generated_content_materials` and `generated_content_sections` tables in Supabase are currently unrestricted, posing a security risk. |
| 2025-12-10 | missing-section-creation-ui | - | Feature | High | TBD | Open | There is no interface provided to create sections within a class, limiting content organization. |
| 2025-12-11 | section-material-count | - | Bug | High | TBD | Open | The file, summary, and quiz counters for sections on the class details page do not update correctly when materials are assigned to a section. |
| 2025-12-12 | 4.2 | 4 | Bug | High | TBD | Open | Implement AC3 in Backend API: Add logic to `src/app/api/generate/route.ts` to handle cases where content cannot support requested quiz length, inform the user, and generate the longest possible quiz. |
| 2025-12-12 | 4.2 | 4 | Bug | Medium | TBD | Open | Link to Class Sections: When inserting into `generated_content` in `src/app/api/generate/route.ts`, ensure `class_section_id` is populated correctly if available from the `study_materials` record. |
| 2025-12-12 | 4.2 | 4 | Bug | Medium | TBD | Open | Implement Metrics Collection: Add code to `src/app/api/generate/route.ts` to collect metrics (e.g., quiz generation time, success/failure counts) and integrate with a monitoring solution. |
| 2025-12-12 | 4.2 | 4 | Test | Medium | TBD | Open | Expand Backend Unit Tests for Quiz Lengths: Add unit tests in `src/app/api/generate/__tests__/route.test.ts` to verify correct prompt construction for 'medium' and 'long' `quizLength` options. |
| 2025-12-12 | 4.2 | 4 | Test | Medium | TBD | Open | Expand Backend Unit Tests for Specific AI Errors: Add unit tests in `src/app/api/generate/__tests__/route.test.ts` to verify that `handleClaudeError` returns the *specific* error messages for different Claude API error types. |
| 2025-12-12 | 4.2 | 4 | Test | High | TBD | Open | Add Backend Unit Tests for AC3: Write unit tests in `src/app/api/generate/__tests__/route.test.ts` to cover the new logic for AC3, including scenarios where content limitations trigger a shorter quiz and the corresponding user message.

## Closed Items
| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-12-08 | bug-manage-classes-page | - | Bug | High | TBD | Closed | Functionality moved to individual class pages. |
| 2025-12-09 | bug-unorganised-content-fetch | - | Bug | High | Amelia | Closed | Resolved by adding 'created_at' column to database, clarifying Supabase query, and removing filter for generated content to align with feature expectation. |
| 2025-12-07 | tech-debt-supabase-ts-ignore | 3 | Technical Debt | Medium | Sofie | Closed | Resolve `@ts-ignore` workaround for Supabase `createServerClient` cookies configuration. See: docs/sprint-artifacts/tech-debt-supabase-ts-ignore.md |
| 2025-12-07 | implement-logout-api | - | Feature | High | TBD | Closed | Implement missing server-side API endpoint for user logout. |
| 2025-12-08 | bug-fetch-documents | - | Bug | High | Amelia | Closed | Resolved by correcting Supabase table name in API route and ensuring correct `params` handling in Server Component. |
| 2025-12-07 | auth-logout-access-issue | - | Bug | Critical | TBD | Closed | After logging out, users can still access the /profile page by manually entering the URL. |
