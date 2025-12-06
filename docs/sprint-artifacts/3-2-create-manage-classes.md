# Story 3.2: Create & Manage Classes

Status: review

## Story

As a user,
I want to create and manage "classes" to organize my study materials,
so that I can easily group related content.

## Acceptance Criteria

1.  Users can create, rename, and delete "classes".
2.  When deleting a class, a confirmation dialog states that all associated content will also be deleted.
3.  Class names shall be limited to 25 alphanumeric characters.
4.  If a user attempts to create a class with a name that already exists, the system shall display an error message: 'A class with this name already exists. Please choose a different name.'

## Tasks / Subtasks

- [x] Implement UI for creating, renaming, and deleting classes (AC: 1)
  - [x] Implement form for creating new classes (input field for name, create button)
  - [x] Implement UI for listing existing classes with options to rename and delete
  - [x] Implement confirmation dialog for class deletion (AC: 2)
  - [x] Implement client-side validation for class name (25 alphanumeric characters, AC: 3)
- [x] Implement API endpoints for class management (AC: 1, 3, 4)
  - [x] `POST /api/classes` for creating classes
  - [x] `PUT /api/classes/{id}` for renaming classes
  - [x] `DELETE /api/classes/{id}` for deleting classes
  - [x] Implement server-side validation for class name (25 alphanumeric characters, uniqueness)
  - [x] Implement logic for cascading deletion of associated content (AC: 2)
- [x] Implement `GET /api/classes` endpoint for retrieving user's classes (AC: 1)

## Dev Notes

### Relevant architecture patterns and constraints

*   **Frontend-Backend Communication:** Next.js Frontend communicates with Supabase via API routes/Route Handlers.
*   **Database:** PostgreSQL on Supabase for `classes` table.
*   **Security:** Row Level Security (RLS) on `classes` table to ensure user data isolation.
*   **Performance:** Efficient retrieval and management of class data.

### Source tree components to touch

*   `src/app/classes/` (for classes UI and API routes)
*   `src/components/` (for UI components related to class management)
*   Supabase configuration and client integration (for `classes` table operations)

### Testing standards summary

*   **Unit Tests:** Client-side validation logic, API utility functions for class management.
*   **Integration Tests:** `POST`, `PUT`, `DELETE /api/classes` endpoints with `classes` table. Test RLS for classes.
*   **E2E Tests:** Simulate user journeys for creating, renaming, and deleting classes, including error scenarios (duplicate names, invalid characters) and confirmation for deletion.

### Project Structure Notes

*   Alignment with unified project structure:
    *   API routes for class management in `src/app/classes/route.ts` or similar.
    *   UI components in `src/components/`.

### References

*   [Source: docs/PRD.md#FR2.2 - Hierarchical Content Organization]
*   [Source: docs/architecture.md#2.1. Tables (`classes`)]
*   [Source: docs/architecture.md#3.1. Main API Endpoints (`/api/classes`)]
*   [Source: docs/UX-Design/ux-design-specification.md#User Journey: Document Upload (Step 1: Select or Create Class/Topic)]
*   [Source: docs/epics.md#Story 3.2: Create & Manage Classes]
*   [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Story 3.2: Create & Manage Classes]

## Dev Agent Record

### Context Reference

- C:\Hannah\SG-Awesome-like-KI\docs\sprint-artifacts\3-2-create-manage-classes.context.xml

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List

*   Implemented API endpoints for class management (`GET`, `POST`, `PUT`, `DELETE`) in `src/app/api/classes/route.ts` and `src/app/api/classes/[id]/route.ts`.
*   Implemented UI for class management in `src/components/ClassManagementUI.tsx` and integrated into `src/app/classes/page.tsx`. This includes forms for creating new classes, UI for listing existing classes with rename and delete options, and a confirmation dialog for class deletion.
*   Implemented client-side validation for class names (25 alphanumeric characters) in `src/components/ClassManagementUI.tsx`.
*   Created and updated integration tests for class management API endpoints in `tests/integration/api/classes/route.test.ts`.
*   Created unit tests for the `ClassManagementUI` component in `tests/unit/ClassManagementUI.test.tsx`.

### File List
*   `src/app/classes/page.tsx` (NEW) - for the classes UI
*   `src/app/api/classes/route.ts` (NEW) - for the classes API endpoint
*   `src/app/api/classes/[id]/route.ts` (NEW) - for the classes API endpoint (PUT/DELETE)
*   `src/components/ClassManagementUI.tsx` (NEW) - custom component for class management
*   `src/lib/supabase/client.ts` (MODIFIED) - for Supabase client integration (classes table operations)
*   `tests/integration/api/classes/route.test.ts` (NEW) - Integration tests for the classes API route
*   `tests/unit/ClassManagementUI.test.tsx` (NEW) - Unit tests for the ClassManagementUI component

### Learnings from Previous Story

**From Story 3-1-document-upload-text-pdf (Status: ready-for-dev)**

*   **New Services Created**: `POST /api/upload` endpoint implemented.
*   **Files Created**: `src/app/upload/page.tsx`, `src/app/api/upload/route.ts`, `src/components/DragAndDropUploadArea.tsx`, `src/components/LoadingGenerationModal.tsx`, `vercel/functions/pdf-parser.ts`
*   **Files Modified**: `src/lib/supabase/client.ts`
*   **Architectural Decisions**: Frontend-Backend Communication, File Storage, Database, PDF Processing, Security, Performance patterns established for `study_materials`. Apply similar patterns for `classes`.
*   **Testing Setup**: Unit, Integration, E2E tests were set up for file upload. Follow these patterns for class management.

[Source: sprint-artifacts/3-1-document-upload-text-pdf.md#Dev-Agent-Record]
