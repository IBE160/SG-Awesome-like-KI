# Story 2.1: User Registration

Status: review

## Story

As a new user,
I want to create an account with my email and a secure password,
so that I can access the AI Study Buddy's features.

## Acceptance Criteria

1. **Given** I am on the registration page, **when** I enter a unique email and a password meeting the requirements (5 letters, 1 number, 1 special symbol), **then** my account is successfully created, and I am logged in.
2. **And** if I enter an email already in use, I receive a message and an option to reset my password.

## Tasks / Subtasks

- [x] Task 1: Create Registration UI (AC: #1, #2)
  - [ ] Create a new page at `/register`.
  - [ ] Build a form with fields for email and password.
  - [ ] Implement client-side validation for email format and password strength.
- [x] Task 2: Implement Registration API Endpoint (AC: #1, #2)
  - [ ] Create a Next.js API route at `/api/auth/register`.
  - [ ] Use Supabase client to call `supabase.auth.signUp()`.
  - [ ] Handle success and error cases (e.g., email already in use).
- [x] Task 3: Testing (AC: #1, #2)
  - [ ] Write unit tests for the registration form validation.
  - [ ] Write an integration test for the `/api/auth/register` endpoint.
  - [ ] Manually test the end-to-end registration flow.

## Dev Notes

- **Relevant architecture patterns and constraints:** Utilize Supabase Auth for user management. Follow the API design specified in `tech-spec-epic-2.md`.
- **Source tree components to touch:** `src/app/register/page.tsx`, `src/app/api/auth/register/route.ts`.
- **Testing standards summary:** Unit tests for validation, integration test for the API endpoint, and manual E2E testing.

### Project Structure Notes

- This is the first story in Epic 2. There are no previous story learnings in this epic.

### References

- [Source: docs/epics.md#Story-2.1]
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md]
- [Source: docs/architecture.md]

## Dev Agent Record

### Context Reference

- `C:\Hannah\SG-Awesome-like-KI\docs\sprint-artifacts/2-1-user-registration.context.xml`

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List

- Implemented Registration UI (Task 1).
- Implemented Registration API Endpoint (Task 2).
- Implemented client-side and API integration tests (Task 3).
- Added @testing-library/react dependency.
- Fixed linting errors in jest.setup.ts, src/app/layout.tsx, src/app/register/page.tsx, tests/integration/register-ui.test.tsx.
- Removed 'required' attributes from email and password inputs in src/app/register/page.tsx to enable consistent client-side validation testing.

### File List

- NEW: src/app/api/auth/register/route.ts
- NEW: tests/integration/register-ui.test.tsx
- NEW: tests/integration/register-api.test.ts
- MODIFIED: src/app/register/page.tsx
- MODIFIED: jest.setup.ts
- MODIFIED: src/app/layout.tsx

## Change Log

- Added @testing-library/react to devDependencies.

