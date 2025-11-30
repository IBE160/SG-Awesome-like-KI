# Story 3.1: Document Upload (Text & PDF)

Status: ready-for-dev

## Story

As a user,
I want to upload my study materials in plain text or PDF format,
so that I can use them to generate summaries and quizzes.

## Acceptance Criteria

1.  Users can upload `.txt` and `.pdf` files.
2.  The system shall enforce a strict file size limit of 10MB.
3.  The system shall perform basic file extension validation.
4.  If a user attempts to upload an unsupported file type, the system shall display an error message: 'This file type is not supported. Please try another file.'
5.  If an uploaded PDF is password-protected or corrupted, the system shall display an error message: 'This file is password-protected or corrupted and cannot be processed.'
6.  If the internet connection is interrupted during upload, the system shall display an error message and allow the user to retry the upload.
7.  The system enforces a strict file size limit of 10MB.

## Tasks / Subtasks

- [ ] Implement UI for file selection and drag-and-drop (AC: 1)
  - [ ] Integrate `Drag-and-Drop Upload Area` custom component
  - [ ] Implement client-side file type validation (.txt, .pdf)
  - [ ] Implement client-side file size validation (max 10MB)
- [ ] Implement `POST /api/upload` endpoint (AC: 1, 2, 3, 4, 5, 6, 7)
  - [ ] Handle file upload to Supabase Storage
  - [ ] Store file metadata in `study_materials` table
  - [ ] Implement server-side file type and size validation
  - [ ] Integrate Vercel Function for PDF text extraction
  - [ ] Handle errors for unsupported file types, oversized files, corrupted/password-protected PDFs
  - [ ] Implement retry logic for network interruptions during upload
- [ ] Implement `Loading Screen/Modal for Generation` component for upload progress (AC: 6)
- [ ] Implement post-upload UI with "Generate Summary" and "Generate Quiz" options (AC: 1)

## Dev Notes

### Relevant architecture patterns and constraints

*   **Frontend-Backend Communication:** Next.js Frontend communicates with Supabase and Vercel Functions via API routes/Route Handlers.
*   **File Storage:** Supabase Storage is used for secure file storage.
*   **Database:** PostgreSQL on Supabase for `study_materials` table.
*   **PDF Processing:** Vercel Function integrates with a cloud-based AI service (e.g., Google Cloud Vision AI) for text extraction.
*   **Security:** Row Level Security (RLS) on `study_materials` table to ensure user data isolation.
*   **Performance:** Efficient handling of large file uploads (up to 10MB) with progress feedback.

### Source tree components to touch

*   `src/app/upload/` (for upload UI and API route)
*   `src/components/` (for `Drag-and-Drop Upload Area`, `Loading Screen/Modal for Generation` custom components)
*   Supabase configuration and client integration
*   Vercel Function for PDF processing

### Testing standards summary

*   **Unit Tests:** Client-side validation logic, API utility functions.
*   **Integration Tests:** `POST /api/upload` endpoint with Supabase Storage and `study_materials` table.
*   **E2E Tests:** Simulate user journey for file upload, including valid files, error scenarios (unsupported type, oversized, corrupted PDF, network interrupt), and post-upload options.

### Project Structure Notes

*   Alignment with unified project structure:
    *   API routes for upload in `src/app/upload/route.ts` or similar.
    *   UI components in `src/components/`.
    *   Supabase client configuration in `src/lib/supabase/` or `utils/supabase/`.

### References

*   [Source: docs/PRD.md#FR2.1 - Document Upload]
*   [Source: docs/architecture.md#5. File Handling]
*   [Source: docs/UX-Design/ux-design-specification.md#Custom Component: Drag-and-Drop Upload Area]
*   [Source: docs/UX-Design/ux-design-specification.md#Custom Component: Loading Screen/Modal for Generation]
*   [Source: docs/epics.md#Story 3.1: Document Upload (Text & PDF)]
*   [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Story 3.1: Document Upload (Text & PDF)]

## Dev Agent Record

### Context Reference

*   [Source: sprint-artifacts/3-1-document-upload-text-pdf.context.xml]

### Agent Model Used

gemini-1.5-flash

### Debug Log References

### Completion Notes List

### File List
*   `src/app/upload/page.tsx` (NEW) - for the upload UI
*   `src/app/api/upload/route.ts` (NEW) - for the file upload API endpoint
*   `src/components/DragAndDropUploadArea.tsx` (NEW) - custom component for file upload UI
*   `src/components/LoadingGenerationModal.tsx` (NEW) - custom component for loading state
*   `src/lib/supabase/client.ts` (MODIFIED) - for Supabase client integration
*   `vercel/functions/pdf-parser.ts` (NEW) - Vercel Function for PDF processing
