# Engineering Backlog

This backlog collects cross-cutting or future action items that emerge from reviews and planning.

Routing guidance:

- Use this file for non-urgent optimizations, refactors, or follow-ups that span multiple stories/epics.
- Must-fix items to ship a story belong in that story’s `Tasks / Subtasks`.
- Same-epic improvements may also be captured under the epic Tech Spec `Post-Review Follow-ups` section.


## Open Items
| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-12-07 | 3.4 | 3 | Testing | Low | TBD | Open | Implement E2E tests for content assignment, reassignment, and viewing user journeys. |
| 2025-12-07 | fix-jest-config-state | - | Documentation | High | TBD | Open | Reference for ongoing Jest configuration and testing issues. See: docs/sprint-artifacts/jest-config-state.md |
| 2025-12-07 | fix-jest-config | - | Technical Debt | High | TBD | Open | Resolve Jest test suite configuration issues (SyntaxError, cookie scope, NextRequest constructor) for Next.js 16 API routes. This is blocking automated verification of other tasks. |
| 2025-12-08 | bug-manage-classes-page | - | Bug | High | TBD | Open | The page 'manage classes' doesn't work. |
| 2025-12-09 | bug-unorganised-content-fetch | - | Bug | High | TBD | Open | When pressing unorganised content, the page loads, but where I should see my content I only get the message Error: Failed to fetch unorganized content |
## Closed Items
| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-12-07 | tech-debt-supabase-ts-ignore | 3 | Technical Debt | Medium | Sofie | Closed | Resolve `@ts-ignore` workaround for Supabase `createServerClient` cookies configuration. See: docs/sprint-artifacts/tech-debt-supabase-ts-ignore.md |
| 2025-12-07 | implement-logout-api | - | Feature | High | TBD | Closed | Implement missing server-side API endpoint for user logout. |
| 2025-12-08 | bug-fetch-documents | - | Bug | High | Amelia | Closed | Resolved by correcting Supabase table name in API route and ensuring correct `params` handling in Server Component. |
| 2025-12-07 | auth-logout-access-issue | - | Bug | Critical | TBD | Closed | After logging out, users can still access the /profile page by manually entering the URL. |
