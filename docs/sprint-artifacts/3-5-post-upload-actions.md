# Story 3.5: Post-Upload Actions

Status: Approved

## Story

As a user,
I want to have the option to generate a summary or quiz immediately after uploading a document,
so that I can quickly get value from the tool without having to organize my content first.

## Acceptance Criteria

1.  After a document has been successfully uploaded, the UI presents immediate options to "Generate Summary" or "Generate Quiz".
2.  Generated content from unorganized documents shall be temporarily stored in an 'Unorganized' area, accessible to the user for later assignment.

## Tasks / Subtasks

- [x] Implement UI for post-upload options (AC: 1)
- [x] Implement API endpoint `/api/generate/[type]` to handle creation of (mock) summaries and quizzes.
- [x] Implement backend logic to store generated content from unorganized documents.
- [x] Implement UI for displaying 'Unorganized' content (AC: 2).
- [x] Implement API endpoint `/api/unorganized` to fetch unorganized content.
- [x] Add navigation to the new 'Unorganized' content page.

## Dev Agent Record

### Completion Notes List

*   **Post-Upload UI:** Created `src/components/PostUploadActionsUI.tsx` to display generation options after a file upload.
*   **Generation API:** Implemented a new dynamic API route at `src/app/api/generate/[type]/route.ts`. This secure endpoint handles requests for 'summary' or 'quiz', verifies ownership of the source document, and creates a new `generated_content` record with mock content.
*   **Upload Page Integration:** Updated `src/app/upload/page.tsx` to correctly call the new generation API and provide users with feedback (loading, success, and error messages) during the generation process.
*   **Unorganized Content API:** Implemented `GET /api/unorganized/route.ts` to fetch all study materials for a user that are not assigned to a class (`class_id` is null) and their associated generated content.
*   **Unorganized Content UI:** Created `src/components/UnorganizedContentList.tsx` and its host page `src/app/unorganized/page.tsx` to display the fetched unorganized content.
*   **Navigation:** Added a link to the '/unorganized' page from the main `/classes` page to ensure the feature is discoverable.

### File List
*   `src/components/PostUploadActionsUI.tsx` (NEW)
*   `src/app/api/generate/[type]/route.ts` (NEW)
*   `src/app/upload/page.tsx` (MODIFIED)
*   `src/app/api/unorganized/route.ts` (NEW)
*   `src/components/UnorganizedContentList.tsx` (NEW)
*   `src/app/unorganized/page.tsx` (NEW)
*   `src/app/classes/page.tsx` (MODIFIED)

## Senior Developer Review (AI)

### Reviewer: Gemini
### Date: December 7, 2025
### Outcome: Approved

### Summary:
The implementation for Story 3.5 is complete and meets all acceptance criteria. The user flow is logical: after uploading a document, the user is immediately presented with options to generate content. This generated content is correctly associated with the source document and, if the document is unassigned, appears on the new "Unorganized Content" page for later review and assignment.

### Acceptance Criteria Coverage:

-   **AC #1: Post-upload options to "Generate Summary" or "Generate Quiz".**
    -   **Status:** IMPLEMENTED.
    -   **Evidence:** `PostUploadActionsUI.tsx` is displayed after a successful upload on `upload/page.tsx`, with buttons that correctly trigger the generation API.
-   **AC #2: Generated content from unorganized documents stored in an 'Unorganized' area.**
    -   **Status:** IMPLEMENTED.
    -   **Evidence:** The `/api/generate` endpoint correctly creates `generated_content` linked to a `study_material`. The new `/unorganized` page and its API correctly fetch and display materials where `class_id` is null, along with their generated content.

### Action Items:
-   None. The story is approved.
