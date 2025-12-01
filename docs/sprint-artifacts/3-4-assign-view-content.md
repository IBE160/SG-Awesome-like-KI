# Story 3.4: Assign & View Content

Status: ready-for-dev

## Story

As a user,
I want to assign uploaded documents and generated content to specific classes and sections,
so that I can easily find and access my study materials.

## Acceptance Criteria

1.  Users can assign uploaded documents and generated content to specific classes and sections.
2.  Users can view all documents and generated content organized by class and section.
3.  When a document is moved, all its associated generated content (summaries, quizzes) shall automatically move with it.
4.  When viewing a class/section, generated content (summaries, quizzes) is clearly linked to and displayed alongside its source document.

## Tasks / Subtasks

- [ ] Implement UI for assigning content (AC: 1)
  - [ ] Add option to assign class/section during document upload
  - [ ] Implement UI for reassigning existing documents/generated content to different classes/sections
- [ ] Implement UI for viewing organized content (AC: 2, 4)
  - [ ] Display documents and generated content within class/section views
  - [ ] Clearly link generated content to its source document
- [ ] Implement API endpoint for assigning/reassigning study materials (AC: 1, 3)
  - [ ] `PUT /api/study-materials/{id}/assign`
  - [ ] Implement backend logic to update `class_id` and `class_section_id` for study materials
  - [ ] Implement backend logic to automatically move associated generated content (AC: 3)
- [ ] Update API endpoints for `generated_content` to link to `class_id` and `class_section_id` (AC: 1)
- [ ] Implement `GET /api/classes/{id}/documents` (or similar) to retrieve documents for a class/section (AC: 2)
- [ ] Implement `GET /api/documents/{id}/generated-content` (or similar) to retrieve generated content for a document (AC: 4)

## Dev Notes

### Relevant architecture patterns and constraints

*   **Frontend-Backend Communication:** Next.js Frontend communicates with Supabase via API routes/Route Handlers.
*   **Database:** PostgreSQL on Supabase for `study_materials`, `generated_content`, `classes`, and `class_sections` tables. Key is managing relationships and cascading updates.
*   **Security:** Row Level Security (RLS) on all relevant tables to ensure user data isolation.
*   **Data Consistency:** Ensure that moving documents correctly updates associated generated content to maintain consistency (cascading updates).

### Source tree components to touch

*   `src/app/classes/[id]/`, `src/app/sections/[id]/` (for organized content views)
*   `src/components/` (for UI components for content assignment and display)
*   Supabase configuration and client integration (for `study_materials` and `generated_content` table operations)
*   Potentially existing upload UI for initial assignment.

### Testing standards summary

*   **Unit Tests:** Backend logic for `PUT /api/study-materials/{id}/assign` (especially cascading moves).
*   **Integration Tests:** API endpoints for assignment and retrieval of organized content. Test RLS for content assignment.
*   **E2E Tests:** Simulate user journeys for assigning new uploads, reassigning existing content, and viewing content within classes/sections, verifying correct display and links. Test moving a document and verifying associated generated content also moves.

### Project Structure Notes

*   Alignment with unified project structure.
*   API routes for content assignment (e.g., `src/app/api/study-materials/[id]/assign/route.ts`).
*   New UI views for displaying organized content.

### References

*   [Source: docs/PRD.md#FR2.2 - Hierarchical Content Organization]
*   [Source: docs/PRD.md#FR2.3 - Document Management]
*   [Source: docs/architecture.md#2.1. Tables (`study_materials`, `generated_content`)]
*   [Source: docs/architecture.md#3.1. Main API Endpoints (`PUT /api/study-materials/{id}/assign`)]
*   [Source: docs/epics.md#Story 3.4: Assign & View Content]
*   [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Story 3.4: Assign & View Content]

## Dev Agent Record

### Context Reference

- C:\Hannah\SG-Awesome-like-KI\docs\sprint-artifacts\3-4-assign-view-content.context.xml

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List

### File List
*   `src/app/api/study-materials/[id]/assign/route.ts` (NEW) - for content assignment API endpoint
*   `src/app/classes/[id]/page.tsx` (MODIFIED) - for displaying documents/content within a class
*   `src/app/sections/[id]/page.tsx` (MODIFIED) - for displaying documents/content within a section
*   `src/components/ContentAssignmentUI.tsx` (NEW) - custom component for assigning content
*   `src/components/OrganizedContentView.tsx` (NEW) - custom component for viewing organized content
*   `src/lib/supabase/client.ts` (MODIFIED) - for Supabase client integration (study_materials, generated_content table operations)

### Learnings from Previous Story

**From Story 3-3-create-manage-class-sections (Status: drafted)**

*   **New Services Created**: `POST /api/classes/{id}/sections`, `PUT /api/sections/{id}`, `DELETE /api/sections/{id}`, `GET /api/classes/{id}/sections` endpoints implemented.
*   **Files Created**: `src/app/classes/[id]/sections/page.tsx`, `src/app/api/classes/[id]/sections/route.ts`, `src/app/api/sections/[id]/route.ts`, `src/components/ClassSectionManagementUI.tsx`
*   **Files Modified**: `src/lib/supabase/client.ts`
*   **Architectural Decisions**: Continued application of established Frontend-Backend Communication via API routes/Route Handlers, PostgreSQL on Supabase for data, and RLS for security. Emphasize cascading deletions for `class_sections`.
*   **Testing Setup**: Extend Unit, Integration, and E2E testing patterns for class sections, including specific tests for name validation and cascading deletions.

[Source: sprint-artifacts/3-3-create-manage-class-sections.md#Dev-Agent-Record]
