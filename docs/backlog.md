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

## Closed Items
| Date | Story | Epic | Type | Severity | Owner | Status | Notes |
| ---- | ----- | ---- | ---- | -------- | ----- | ------ | ----- |
| 2025-12-08 | bug-manage-classes-page | - | Bug | High | TBD | Closed | Functionality moved to individual class pages. |
| 2025-12-09 | bug-unorganised-content-fetch | - | Bug | High | Amelia | Closed | Resolved by adding 'created_at' column to database, clarifying Supabase query, and removing filter for generated content to align with feature expectation. |
| 2025-12-07 | tech-debt-supabase-ts-ignore | 3 | Technical Debt | Medium | Sofie | Closed | Resolve `@ts-ignore` workaround for Supabase `createServerClient` cookies configuration. See: docs/sprint-artifacts/tech-debt-supabase-ts-ignore.md |
| 2025-12-07 | implement-logout-api | - | Feature | High | TBD | Closed | Implement missing server-side API endpoint for user logout. |
| 2025-12-08 | bug-fetch-documents | - | Bug | High | Amelia | Closed | Resolved by correcting Supabase table name in API route and ensuring correct `params` handling in Server Component. |
| 2025-12-07 | auth-logout-access-issue | - | Bug | Critical | TBD | Closed | After logging out, users can still access the /profile page by manually entering the URL. |
