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



- [x] Implement UI for file selection and drag-and-drop (AC: 1)

  - [x] Integrate `Drag-and-Drop Upload Area` custom component

  - [x] Implement client-side file type validation (.txt, .pdf)

  - [x] Implement client-side file size validation (max 10MB)



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



### Completion Notes List







*   Implemented the UI for file selection and drag-and-drop using `react-dropzone`. Includes client-side file type (.txt, .pdf) and size (max 10MB) validation as per acceptance criteria and UX specification. Unit tests covering the validation logic and component rendering have been created and passed.







#### Plan for "Implement `POST /api/upload` endpoint (AC: 1, 2, 3, 4, 5, 6, 7)":







1.  **Create Next.js Route Handler:**



    *   Create `src/app/api/upload/route.ts` to handle `POST /api/upload` requests.



    *   Parse `multipart/form-data` to extract the uploaded `file`, `class_id`, and `class_section_id`.



    *   Initialize and use the Supabase client for server-side operations.







2.  **Server-side Validation:**



    *   Implement server-side validation for file type (`.txt`, `.pdf`) and size (max 10MB).



    *   Return `NextResponse.json({ error: '...' }, { status: 400 })` for validation failures (AC 2, 3, 4, 7).







3.  **Supabase Storage Upload:**



    *   Generate a unique filename (e.g., UUID).



    *   Upload the file to Supabase Storage using `supabase.storage.from('study_materials').upload(storagePath, fileBuffer, { contentType: fileType })`.







4.  **Store Metadata in `study_materials` Table:**



    *   Retrieve the authenticated `user_id` from the Supabase session.



    *   Insert `file_name`, `original_name`, `storage_path`, `file_type`, `file_size`, `class_id`, `class_section_id`, `user_id`, and `created_at` into the `study_materials` table.



    *   Return `NextResponse.json({ study_material_id: ... }, { status: 200 })` on success.







5.  **PDF Text Extraction Integration:**



    *   If `file_type` is `application/pdf`:



        *   Call an internal Vercel Function (e.g., `/api/process-pdf`) or another external service to handle PDF text extraction. This Vercel function will be created in `vercel/functions/pdf-parser.ts`.



        *   Handle potential errors from the PDF processing function (e.g., password-protected/corrupted PDFs) and return an appropriate error response (AC 5).



    *   If `file_type` is `text/plain`:



        *   Read the file content directly and store it in the `extracted_text` field of the `study_materials` table.







6.  **Error Handling & Retry Logic:**



    *   Implement `try-catch` blocks for all Supabase and Vercel Function interactions.



    *   Return `NextResponse.json({ error: 'Server error' }, { status: 500 })` for unexpected errors.



    *   Client-side retry will be based on these server responses (AC 6).



### File List

*   `src/app/upload/page.tsx` (NEW) - for the upload UI

*   `src/app/api/upload/route.ts` (NEW) - for the file upload API endpoint

*   `src/components/DragAndDropUploadArea.tsx` (NEW) - custom component for file upload UI

*   `src/components/LoadingGenerationModal.tsx` (NEW) - custom component for loading state

*   `src/lib/supabase/client.ts` (MODIFIED) - for Supabase client integration

*   `vercel/functions/pdf-parser.ts` (NEW) - Vercel Function for PDF processing

*   `tests/unit/DragAndDropUploadArea.test.tsx` (NEW) - Unit tests for DragAndDropUploadArea component
