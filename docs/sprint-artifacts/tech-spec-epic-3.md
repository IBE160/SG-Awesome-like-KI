# Technical Specification: Epic 3 - Content Organization & Upload

## 1. Introduction

This technical specification outlines the architecture, data models, API design, security, and testing strategy for Epic 3, which focuses on enabling users to upload study materials and organize them into a hierarchical structure of classes and sections.

## 2. High-Level Architecture

The application utilizes a Next.js frontend, communicating with a PostgreSQL database (managed by Supabase) via Next.js API Routes/Route Handlers. Supabase Storage is used for file storage, and Vercel Functions are integrated for specific processing tasks like PDF text extraction.

## 3. Technologies Used

*   **Frontend Framework:** Next.js (React)
*   **Backend (API Layer):** Next.js API Routes / Route Handlers
*   **Database:** PostgreSQL (via Supabase)
*   **Object Storage:** Supabase Storage
*   **Serverless Functions:** Vercel Functions (for PDF processing)
*   **Authentication & Authorization:** Supabase Auth with Row Level Security (RLS)
*   **Styling:** Tailwind CSS (inferred from project structure)

## 4. Data Model

The following tables are central to Epic 3:

### `study_materials`

*   **Purpose:** Stores metadata for uploaded documents.
*   **Fields:** `id`, `user_id`, `original_name`, `file_type`, `file_size`, `extracted_text`, `created_at`, `is_archived`.
*   **Relationships:** Linked to `users` (via `user_id`), `class_sections` (via `section_id` - *inferred, not explicitly stated but implied by organization*).

### `classes`

*   **Purpose:** Stores user-defined classes for organizing study materials.
*   **Fields:** `id`, `user_id`, `name`, `created_at`, `updated_at`.
*   **Constraints:** Class names limited to 25 alphanumeric characters, unique per user.
*   **Relationships:** Linked to `users` (via `user_id`). Cascading deletion to associated `class_sections` and `study_materials` (via `class_sections`).

### `class_sections`

*   **Purpose:** Stores user-defined sections within classes.
*   **Fields:** `id`, `class_id`, `name`, `created_at`, `updated_at`.
*   **Constraints:** Section names limited to 25 alphanumeric characters, unique per class.
*   **Relationships:** Linked to `classes` (via `class_id`). Cascading deletion to associated `study_materials`.

## 5. API Design (Next.js API Routes / Route Handlers)

All API routes implement secure authentication and ownership checks using Supabase.

### File Upload (`/api/upload`)

*   `POST /api/upload`: Handles file upload (`.txt`, `.pdf` up to 10MB) to Supabase Storage. Stores metadata in `study_materials`. Triggers PDF text extraction via Vercel Function.

### PDF Processing (`/api/pdf-parser`)

*   `POST /api/pdf-parser`: Vercel Function for PDF text extraction (simulated, integrates with AI service). Handles password-protected/corrupted PDFs.

### Class Management (`/api/classes`, `/api/classes/{id}`)

*   `GET /api/classes`: Retrieves all classes for the authenticated user.
*   `POST /api/classes`: Creates a new class. Validates name uniqueness and length.
*   `PUT /api/classes/{id}`: Renames an existing class. Validates name uniqueness and length. Ensures user ownership.
*   `DELETE /api/classes/{id}`: Deletes a class and cascades deletion to associated sections and study materials. Ensures user ownership.

### Class Section Management (`/api/classes/{id}/sections`, `/api/sections/{id}`)

*   `GET /api/classes/{id}/sections`: Retrieves all sections for a specific class. Ensures user ownership of the parent class.
*   `POST /api/classes/{id}/sections`: Creates a new section within a class. Validates name uniqueness within the class and length. Ensures user ownership of the parent class.
*   `PUT /api/sections/{id}`: Renames an existing section. Validates name uniqueness within its class and length. Ensures user ownership.
*   `DELETE /api/sections/{id}`: Deletes a section and cascades deletion to associated study materials. Ensures user ownership.

## 6. Security Considerations

*   **Authentication:** Supabase Auth for user authentication.
*   **Authorization:** Row Level Security (RLS) implemented on `study_materials`, `classes`, and `class_sections` tables to ensure strict data isolation per user.
*   **Ownership Checks:** All API operations perform explicit server-side checks to verify user ownership of resources (classes, sections, study materials) before allowing modifications or deletions.
*   **Input Validation:** Robust client-side and server-side validation for file types, file sizes, and alphanumeric names to prevent injection attacks and ensure data integrity.

## 7. Testing Strategy

*   **Unit Tests:**
    *   Client-side validation logic (file types, sizes, name lengths).
    *   UI component functionality (`DragAndDropUploadArea`, `ClassManagementUI`, `ClassSectionManagementUI`).
    *   API utility functions.
*   **Integration Tests:**
    *   All API endpoints (`/api/upload`, `/api/classes`, `/api/classes/{id}`, `/api/classes/{id}/sections`, `/api/sections/{id}`) with Supabase database and Storage.
    *   Cover success and error scenarios, including RLS, uniqueness constraints, and cascading deletions.
    *   Vercel Function integration for PDF processing (mocked or actual).
*   **End-to-End (E2E) Tests:**
    *   Simulate full user journeys for file upload, class creation/management, and section creation/management.
    *   Cover valid data flows and various error scenarios (unsupported file types, oversized files, corrupted PDFs, network interruptions, duplicate names, invalid characters, unauthorized access).

## 8. Performance Considerations

*   Efficient handling of large file uploads (up to 10MB) with progress feedback.
*   Optimized database queries for retrieval and management of class/section data.

## 9. Project Structure Alignment

*   API routes in `src/app/api/...`.
*   UI components in `src/components/`.

## Post-Review Follow-ups

*   Note: The `epics` directory and a general `index.md` for project documentation were not found. This suggests that some overarching project documentation is still absent. Consider creating these for better project context and discoverability. (Story 3.4)
*   Note: The `Completion Notes List` has been updated in this review. The `File List` has been explicitly defined. The `Tasks / Subtasks` has been marked complete to reflect that all tasks are now implemented. (Story 3.4)
*   [ ] [Low] Implement E2E tests for content assignment, reassignment, and viewing user journeys to provide more comprehensive testing coverage. (Story 3.4) [file: `docs/sprint-artifacts/3-4-assign-view-content.md`]

*   Supabase client configuration in `src/lib/supabase/client.ts`.
