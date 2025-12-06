Status: Approved

## Story

As a user,
I want to have the option to generate a summary or quiz immediately after uploading a document,
so that I can quickly get value from the tool without having to organize my content first.

## Acceptance Criteria

1.  After a document has been successfully uploaded, the UI presents immediate options to "Generate Summary" or "Generate Quiz".
2.  Generated content from unorganized documents shall be temporarily stored in an 'Unorganized' area, accessible to the user for later assignment.

## Tasks / Subtasks

- [ ] Implement UI for post-upload options (AC: 1)
  - [ ] Integrate this UI into the document upload flow (`src/app/upload/page.tsx` or similar).
  - [ ] Ensure options are clearly presented and actionable.
- [ ] Implement backend logic for generated content from unorganized documents (AC: 2)
  - [ ] Modify `generated_content` table to allow nullable `class_id` and `class_section_id`.
  - [ ] Implement a mechanism to store/retrieve generated content not yet assigned to a class/section (e.g., an 'Unorganized' logical area in the UI).
- [ ] Update frontend to display 'Unorganized' content and provide assignment options (AC: 2)

## Dev Notes

### Relevant architecture patterns and constraints

*   **Frontend-Backend Communication:** Next.js Frontend communicates with Supabase and Vercel Functions (for generation) via API routes/Route Handlers.
*   **Database:** PostgreSQL on Supabase for `generated_content` table, with nullable `class_id` and `class_section_id`.
*   **Security:** Row Level Security (RLS) on `generated_content` table.
*   **User Flow:** Seamless integration of post-upload actions into the existing upload flow.

### Source tree components to touch

*   `src/app/upload/page.tsx` (MODIFIED) - to present post-upload options
*   `src/app/api/generate/route.ts` (EXISTING or NEW, depending on Epic 4) - API endpoint for triggering generation
*   `src/components/PostUploadActionsUI.tsx` (NEW) - custom component for post-upload options
*   `src/components/UnorganizedContentList.tsx` (NEW) - custom component for displaying unorganized content
*   `src/lib/supabase/client.ts` (MODIFIED) - for Supabase client integration (`generated_content` table operations)

### Testing standards summary

*   **Unit Tests:** Backend logic for handling `generated_content` with nullable `class_id`/`class_section_id`.
*   **Integration Tests:** Post-upload UI interactions with generation API endpoints.
*   **E2E Tests:** Simulate user journey for document upload, verifying post-upload options, and checking that unorganized generated content appears in the designated 'Unorganized' area and can be assigned.

### Project Structure Notes

*   Alignment with unified project structure.
*   UI for post-upload actions should be a natural extension of the document upload UI.

### References

*   [Source: docs/PRD.md#FR3.1 - Summary Generation (implicitly triggered)]
*   [Source: docs/PRD.md#FR3.2 - Quiz Generation (implicitly triggered)]
*   [Source: docs/architecture.md#2.1. Tables (`generated_content`)]
*   [Source: docs/UX-Design/ux-design-specification.md#User Journey: Document Upload]
*   [Source: docs/epics.md#Story 3.5: Post-Upload Actions]
*   [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Story 3.5: Post-Upload Actions]
*   [Source: docs/sprint-artifacts/3-1-document-upload-text-pdf.md#Tasks / Subtasks] (Reference for `Implement post-upload UI with "Generate Summary" and "Generate Quiz" options`)

## Dev Agent Record

### Context Reference

- C:\Hannah\SG-Awesome-like-KI\docs\sprint-artifacts\3-5-post-upload-actions.context.xml

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List

### File List
*   `src/app/upload/page.tsx` (MODIFIED) - to present post-upload options
*   `src/app/api/generate/route.ts` (MODIFIED or NEW) - API endpoint for triggering generation (depends on Epic 4)
*   `src/components/PostUploadActionsUI.tsx` (NEW) - custom component for post-upload options
*   `src/components/UnorganizedContentList.tsx` (NEW) - custom component for displaying unorganized content
*   `src/lib/supabase/client.ts` (MODIFIED) - for Supabase client integration (`generated_content` table operations)

### Learnings from Previous Story

**From Story 3-4-assign-view-content (Status: drafted)**

*   **New Services Created**: `PUT /api/study-materials/{id}/assign` endpoint implemented for assigning/reassigning study materials.
*   **Files Created**: `src/app/api/study-materials/[id]/assign/route.ts`, `src/components/ContentAssignmentUI.tsx`, `src/components/OrganizedContentView.tsx`
*   **Files Modified**: `src/app/classes/[id]/page.tsx`, `src/app/sections/[id]/page.tsx`, `src/lib/supabase/client.ts`
*   **Architectural Decisions**: Continued emphasis on managing relationships and cascading updates for `study_materials` and `generated_content` tables in PostgreSQL on Supabase, with RLS for security.
*   **Testing Setup**: Focus on Unit, Integration, and E2E tests for content assignment and retrieval, ensuring data consistency with cascading moves and RLS.

[Source: sprint-artifacts/3-4-assign-view-content.md#Dev-Agent-Record]
