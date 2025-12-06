# Story 3.3: Create & Manage Class Sections

Status: in-progress

## Story

As a user,
I want to create and manage "class sections" within my classes,
so that I can further organize my study materials by topic or module.

## Acceptance Criteria

1.  Users can create, rename, and delete "class sections" within classes.
2.  When deleting a section, a confirmation dialog states that all associated content will also be deleted.
3.  Section names shall be limited to 25 alphanumeric characters.
4.  If a user attempts to create a section with a name that already exists within the same class, the system shall display an error message: 'A section with this name already exists in this class. Please choose a different name.'

## Tasks / Subtasks

- [x] Implement UI for creating, renaming, and deleting class sections (AC: 1)
  - [x] Implement form for creating new sections (input field for name, create button)
  - [x] Implement UI for listing existing sections within a class with options to rename and delete
  - [x] Implement confirmation dialog for section deletion (AC: 2)
  - [x] Implement client-side validation for section name (25 alphanumeric characters, AC: 3)
- [x] Implement API endpoints for class section management (AC: 1, 3, 4)
  - [x] `POST /api/classes/{id}/sections` for creating sections
  - [x] `PUT /api/sections/{id}` for renaming sections
  - [x] `DELETE /api/sections/{id}` for deleting sections
  - [x] Implement server-side validation for section name (25 alphanumeric characters, uniqueness)
  - [x] Implement logic for cascading deletion of associated content (AC: 2)
- [x] Implement `GET /api/classes/{id}/sections` endpoint for retrieving a class's sections (AC: 1)

## Dev Notes

### Relevant architecture patterns and constraints

*   **Frontend-Backend Communication:** Next.js Frontend communicates with Supabase via API routes/Route Handlers.
*   **Database:** PostgreSQL on Supabase for `class_sections` table, linked to `classes` table.
*   **Security:** Row Level Security (RLS) on `class_sections` table to ensure user data isolation, inherited via `classes` relationship.
*   **Performance:** Efficient retrieval and management of class section data.

### Source tree components to touch

*   `src/app/classes/[id]/sections/` (for class sections UI and API routes)
*   `src/components/` (for UI components related to class section management)
*   Supabase configuration and client integration (for `class_sections` table operations)

### Testing standards summary

*   **Unit Tests:** Client-side validation logic, API utility functions for class section management.
*   **Integration Tests:** `POST`, `PUT`, `DELETE /api/classes/{id}/sections` and `DELETE /api/sections/{id}` endpoints with `class_sections` table. Test RLS for class sections.
*   **E2E Tests:** Simulate user journeys for creating, renaming, and deleting class sections, including error scenarios (duplicate names within a class, invalid characters) and confirmation for deletion.

### Project Structure Notes

*   Alignment with unified project structure:
    *   API routes for class section management in `src/app/classes/[id]/sections/route.ts` or similar.
    *   UI components in `src/components/`.

### References

*   [Source: docs/PRD.md#FR2.2 - Hierarchical Content Organization]
*   [Source: docs/architecture.md#2.1. Tables (`class_sections`)]
*   [Source: docs/architecture.md#3.1. Main API Endpoints (`/api/classes/{id}/sections`, `/api/sections/{id}`)]
*   [Source: docs/UX-Design/ux-design-specification.md#User Journey: Document Upload (Step 1: Select or Create Class/Topic)]
*   [Source: docs/epics.md#Story 3.3: Create & Manage Class Sections]
*   [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Story 3.3: Create & Manage Class Sections]

## Dev Agent Record

### Context Reference

- C:\Hannah\SG-Awesome-like-KI\docs\sprint-artifacts\3-3-create-manage-class-sections.context.xml

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List

### File List
*   `src/app/classes/[id]/sections/page.tsx` (NEW) - for the class sections UI
*   `src/app/api/classes/[id]/sections/route.ts` (NEW) - for the class sections API endpoint (POST, GET)
*   `src/app/api/sections/[id]/route.ts` (NEW) - for the class sections API endpoint (PUT, DELETE)
*   `src/components/ClassSectionManagementUI.tsx` (NEW) - custom component for class section management
*   `tests/integration/api/class_sections/route.test.ts` (NEW) - integration tests for class sections API
*   `tests/unit/ClassSectionManagementUI.test.tsx` (NEW) - unit tests for ClassSectionManagementUI

### Learnings from Previous Story

**From Story 3-2-create-manage-classes (Status: drafted)**

*   **New Services Created**: `POST /api/classes`, `PUT /api/classes/{id}`, `DELETE /api/classes/{id}`, `GET /api/classes` endpoints implemented.
*   **Files Created**: `src/app/classes/page.tsx`, `src/app/api/classes/route.ts`, `src/components/ClassManagementUI.tsx`
*   **Files Modified**: `src/lib/supabase/client.ts`
*   **Architectural Decisions**: Similar patterns as established for `study_materials` and `classes` should be applied for `class_sections`. This includes Frontend-Backend Communication via API routes/Route Handlers, PostgreSQL on Supabase for data, and RLS for security.
*   **Testing Setup**: Follow the established patterns for Unit, Integration, and E2E tests for class management, adapting them for class section management.

[Source: sprint-artifacts/3-2-create-manage-classes.md#Dev-Agent-Record]

## Change Log

| Date         | Version | Changes                      | Author |
| ------------ | ------- | ---------------------------- | ------ |
| 2025-12-06   | 1.1     | Senior Developer Review notes appended | BIP    |

## Senior Developer Review (AI)

### Reviewer: BIP
### Date: December 6, 2025
### Outcome: Changes Requested

### Summary:
Story 3.3, "Create & Manage Class Sections," fully implements the UI and API for managing class sections, with comprehensive client-side and server-side validation, and robust security checks for user ownership. All unit and integration tests specific to this story are passing. The cascading deletion logic for `study_materials` (AC #2) has been updated to `ON DELETE CASCADE` in `docs/schema.sql`, aligning with the acceptance criteria that "all associated content will also be deleted." The previously noted documentation gap (missing Epic Tech Spec for Epic 3) also applies here.

### Key Findings (by severity):

**MEDIUM severity issues:**
- **Missing Epic Tech Spec (Documentation Gap):** No `tech-spec-epic-3.md` was found in the expected location. This indicates a potential documentation gap for Epic 3.
    - **Evidence:** Glob search for `tech-spec-epic-3*.md` returned no results.

### Acceptance Criteria Coverage:

- **AC #1: Users can create, rename, and delete "class sections" within classes.**
    - **Create:** IMPLEMENTED. Evidence: `src/app/api/classes/[id]/sections/route.ts` (POST), `src/components/ClassSectionManagementUI.tsx` (UI), `tests/integration/api/class_sections/route.test.ts` (passing), `tests/unit/ClassSectionManagementUI.test.tsx` (passing).
    - **Rename:** IMPLEMENTED. Evidence: `src/app/api/sections/[id]/route.ts` (PUT), `src/components/ClassSectionManagementUI.tsx` (UI), `tests/integration/api/class_sections/route.test.ts` (passing), `tests/unit/ClassSectionManagementUI.test.tsx` (passing).
    - **Delete:** IMPLEMENTED. Evidence: `src/app/api/sections/[id]/route.ts` (DELETE), `src/components/ClassSectionManagementUI.tsx` (UI), `tests/integration/api/class_sections/route.test.ts` (passing), `tests/unit/ClassSectionManagementUI.test.tsx` (passing).
- **AC #2: When deleting a section, a confirmation dialog states that all associated content will also be deleted.**
    - UI for dialog: IMPLEMENTED. Evidence: `src/components/ClassSectionManagementUI.tsx` (confirmation dialog).
    - Backend cascading delete: IMPLEMENTED. Evidence: `docs/schema.sql` (cascading foreign keys for `study_materials`).
- **AC #3: Section names shall be limited to 25 alphanumeric characters.**
    - IMPLEMENTED. Evidence: `src/components/ClassSectionManagementUI.tsx` (client-side), `src/app/api/classes/[id]/sections/route.ts` & `src/app/api/sections/[id]/route.ts` (server-side), `tests/unit/ClassSectionManagementUI.test.tsx` (passing), `tests/integration/api/class_sections/route.test.ts` (passing).
- **AC #4: If a user attempts to create a section with a name that already exists within the same class, the system shall display an error message: 'A section with this name already exists in this class. Please choose a different name.'**
    - IMPLEMENTED. Evidence: `src/app/api/classes/[id]/sections/route.ts` (server-side uniqueness check), `src/components/ClassSectionUI.tsx` (UI error display), `tests/integration/api/class_sections/route.test.ts` (passing), `tests/unit/ClassSectionManagementUI.test.tsx` (passing).

### Task Completion Validation:

- [x] Implement UI for creating, renaming, and deleting class sections (AC: 1) - VERIFIED COMPLETE.
    - [x] Implement form for creating new sections (input field for name, create button) - VERIFIED COMPLETE.
    - [x] Implement UI for listing existing sections within a class with options to rename and delete - VERIFIED COMPLETE.
    - [x] Implement confirmation dialog for section deletion (AC: 2) - VERIFIED COMPLETE.
    - [x] Implement client-side validation for section name (25 alphanumeric characters, AC: 3) - VERIFIED COMPLETE.
- [x] Implement API endpoints for class section management (AC: 1, 3, 4) - VERIFIED COMPLETE.
    - [x] `POST /api/classes/{id}/sections` for creating sections - VERIFIED COMPLETE.
    - [x] `PUT /api/sections/{id}` for renaming sections - VERIFIED COMPLETE.
    - [x] `DELETE /api/sections/{id}` for deleting sections - VERIFIED COMPLETE.
    - [x] Implement server-side validation for section name (25 alphanumeric characters, uniqueness within class) - VERIFIED COMPLETE.
    - [x] Implement logic for cascading deletion of associated content (AC: 2) - VERIFIED COMPLETE.
- [x] Implement `GET /api/classes/{id}/sections` endpoint for retrieving a class's sections (AC: 1) - VERIFIED COMPLETE.

**Summary: All 11 completed tasks verified.**

### Test Coverage and Gaps:
- Unit tests for `ClassSectionManagementUI.test.tsx` are comprehensive and passing.
- Integration tests for `api/class_sections/route.test.ts` are comprehensive and passing.

### Architectural Alignment:
- Overall design aligns with `architecture.md` (Next.js, Supabase, API routes, RLS).
- RLS implementation for section ownership verification in API routes is good.
- The cascading delete for `generated_content_sections` is correct. The issue with `study_materials` has been resolved by updating the schema.

### Security Notes:
- Authentication and authorization are correctly implemented.
- Ownership checks for all API operations (create, read, update, delete) are robust, verifying user ownership of the parent class.
- Server-side validation helps prevent injection attacks via section names.

### Best-Practices and References:
- Next.js App Router for API routes and pages.
- React functional components and hooks.
- Tailwind CSS for styling.
- Supabase for BaaS, incl. Auth and RLS.
- Comprehensive unit and integration testing.

### Action Items:

**Advisory Notes:**
- Note: Consider creating `tech-spec-epic-3.md` as part of project documentation if this is a required artifact for the Epic.