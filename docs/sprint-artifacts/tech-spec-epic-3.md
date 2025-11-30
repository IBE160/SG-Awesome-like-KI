# Epic Technical Specification: Content Management & Organization

Date: 2025-11-30
Author: BIP
Epic ID: 3
Status: Draft

---

## Overview

This technical specification details Epic 3: Content Management & Organization for the AI Study Buddy application. The primary objective of this epic is to empower users to efficiently upload, organize, and manage their study materials. This functionality is crucial for facilitating the core AI-powered learning tools (summaries and quizzes) by providing a structured environment for user content. The epic focuses on robust file handling for text and PDF documents, along with a hierarchical organization system using "classes" and "class sections" to transform student overwhelm into a sense of control and clarity.

## Objectives and Scope

The main objective of Epic 3 is to establish a robust and intuitive system for users to manage their study content.

**In-Scope:**

*   **Document Upload:** Allow users to upload plain text (.txt) and PDF (.pdf) files.
*   **File Validation:** Enforce file size limits (10MB) and validate file types. Handle errors for unsupported types, password-protected, or corrupted PDFs.
*   **Hierarchical Organization:** Enable creation, renaming, and deletion of "classes" and "class sections" to categorize study materials.
*   **Content Assignment:** Users can assign uploaded documents and generated content to specific classes and sections.
*   **Document Management:** Provide functionality to view uploaded documents and initiate soft deletion (archiving).
*   **Post-Upload Actions:** Present immediate options to "Generate Summary" or "Generate Quiz" after a successful upload.
*   **Temporary Storage for Unorganized Content:** Automatically store generated content from unorganized documents in an 'Unorganized' area for later assignment.

**Out-of-Scope (for Epic 3 MVP):**

*   Advanced document editing or annotation features.
*   Integration with external document sources (e.g., Google Drive, Dropbox) beyond direct upload.
*   Version control for documents.
*   Collaborative document sharing within classes/sections.

## System Architecture Alignment

Epic 3 is central to the AI Study Buddy's architecture by handling the input (study materials) that fuels the AI processing. It directly leverages the **Supabase Backend (BaaS)** for secure file storage and database management, utilizing `study_materials`, `classes`, and `class_sections` tables. User authentication and authorization (RLS) managed by Supabase Auth are critical to ensure that users can only manage their own content. File uploads will be handled by the Next.js Frontend, storing files in Supabase Storage. For PDF content extraction, a **Vercel Function** will integrate with a cloud-based AI service (e.g., Google Cloud Vision AI) to parse text from uploaded PDFs before summarization or quiz generation. This aligns with the overall system design by delegating heavy processing to serverless functions and external AI services, maintaining a responsive frontend. The `Document Preview Component` and `Drag-and-Drop Upload Area` from the UX design specification are key UI elements that align with this architecture, providing intuitive user interaction.

## Detailed Design

### Services and Modules

This epic primarily involves interactions between the Next.js Frontend, Supabase, and Vercel Functions.

*   **Next.js Frontend:**
    *   **File Upload Component:** Handles user interaction for file selection, drag-and-drop, client-side validation (type, size), and initiates upload to Supabase Storage. Provides progress feedback.
    *   **Class/Section Management UI:** Provides interfaces for creating, renaming, deleting, and navigating classes and class sections.
    *   **Document Listing/Management UI:** Displays uploaded documents, allowing assignment to classes/sections and triggering post-upload actions.
    *   **API Client:** Communicates with backend API endpoints for managing classes, sections, and initiating file uploads/processing.
*   **Supabase (PostgreSQL Database):**
    *   Manages `classes`, `class_sections`, `study_materials`, and `generated_content` tables.
    *   Enforces Row Level Security (RLS) for all user-owned data.
*   **Supabase Storage:**
    *   Securely stores uploaded `.txt` and `.pdf` files.
*   **Vercel Function (PDF Processing):**
    *   Triggered upon PDF upload completion in Supabase Storage.
    *   Integrates with a cloud-based AI service (e.g., Google Cloud Vision AI) to extract text content from PDFs.
    *   Stores extracted text back into the database or a temporary storage for AI processing.

### Data Models and Contracts

The following data models will be implemented in Supabase (PostgreSQL) with RLS enabled.

#### `classes` table
*   `id` (uuid, primary key)
*   `name` (text, not null, max 25 alphanumeric characters)
*   `user_id` (uuid, foreign key to `auth.users`, not null) - enforced by RLS

#### `class_sections` table
*   `id` (uuid, primary key)
*   `name` (text, not null, max 25 alphanumeric characters)
*   `class_id` (uuid, foreign key to `classes`, not null)
*   `user_id` (uuid, foreign key to `auth.users`, not null) - inherited via `classes` relationship for RLS

#### `study_materials` table
*   `id` (uuid, primary key)
*   `file_name` (text, not null)
*   `original_name` (text, not null) - to preserve original file name
*   `storage_path` (text, not null) - path in Supabase Storage
*   `file_type` (text, not null) - 'txt' or 'pdf'
*   `file_size` (integer, not null) - in bytes
*   `extracted_text` (text) - content extracted from PDF, or raw text for TXT files
*   `class_id` (uuid, foreign key to `classes`) - nullable if unorganized
*   `class_section_id` (uuid, foreign key to `class_sections`) - nullable if unorganized or not assigned to a section
*   `user_id` (uuid, foreign key to `auth.users`, not null) - enforced by RLS
*   `created_at` (timestamp with time zone, not null, default `now()`)
*   `is_archived` (boolean, not null, default `false`) - for soft deletion

#### `generated_content` table
*   `id` (uuid, primary key)
*   `type` (text, not null, e.g., 'summary', 'quiz')
*   `content` (jsonb, not null) - stores the actual summary text or quiz questions/answers
*   `source_material_id` (uuid, foreign key to `study_materials`, not null)
*   `class_id` (uuid, foreign key to `classes`) - nullable if unorganized
*   `class_section_id` (uuid, foreign key to `class_sections`) - nullable if unorganized or not assigned to a section
*   `user_id` (uuid, foreign key to `auth.users`, not null) - enforced by RLS
*   `created_at` (timestamp with time zone, not null, default `now()`)

**Contracts:**
*   **File Upload Request:** `POST /api/upload` expecting multipart/form-data with `file` and optional `class_id`, `class_section_id`.
*   **Class/Section Management Requests:** JSON payloads for create/update/delete operations via respective API endpoints.

### APIs and Interfaces

The Next.js Frontend will interact with the backend primarily through API routes (or Route Handlers) exposed by the Next.js application, which in turn will interact with Supabase.

*   **`POST /api/upload`**:
    *   **Description:** Handles file upload to Supabase Storage and triggers PDF processing if applicable.
    *   **Request:** `multipart/form-data` with `file: File`, `class_id?: string`, `class_section_id?: string`.
    *   **Response:** `200 OK` with `study_material_id: string` on success; `400 Bad Request` for validation errors; `500 Internal Server Error` for processing failures.
*   **`GET /api/classes`**:
    *   **Description:** Retrieves all classes for the authenticated user.
    *   **Response:** `200 OK` with `classes: Class[]`.
*   **`POST /api/classes`**:
    *   **Description:** Creates a new class for the authenticated user.
    *   **Request:** `body: { name: string }`.
    *   **Response:** `201 Created` with `class: Class` on success; `400 Bad Request` for validation/duplicate name.
*   **`PUT /api/classes/{id}`**:
    *   **Description:** Updates an existing class.
    *   **Request:** `body: { name: string }`.
    *   **Response:** `200 OK` with `class: Class`; `404 Not Found`.
*   **`DELETE /api/classes/{id}`**:
    *   **Description:** Deletes a class and all associated sections and content.
    *   **Response:** `204 No Content`; `404 Not Found`.
*   **`GET /api/classes/{id}/sections`**:
    *   **Description:** Retrieves all sections for a given class.
    *   **Response:** `200 OK` with `sections: ClassSection[]`.
*   **`POST /api/classes/{id}/sections`**:
    *   **Description:** Creates a new section within a class.
    *   **Request:** `body: { name: string }`.
    *   **Response:** `201 Created` with `section: ClassSection`; `400 Bad Request`.
*   **`PUT /api/sections/{id}`**:
    *   **Description:** Updates an existing section.
    *   **Request:** `body: { name: string }`.
    *   **Response:** `200 OK` with `section: ClassSection`.
*   **`DELETE /api/sections/{id}`**:
    *   **Description:** Deletes a section and all associated content.
    *   **Response:** `204 No Content`.
*   **`PUT /api/study-materials/{id}/assign`**:
    *   **Description:** Assigns or reassigns a study material to a class/section.
    *   **Request:** `body: { class_id?: string, class_section_id?: string }`.
    *   **Response:** `200 OK`.
*   **`DELETE /api/study-materials/{id}/archive`**:
    *   **Description:** Soft deletes (archives) a study material.
    *   **Response:** `200 OK`.

### Workflows and Sequencing

The user journeys for "Document Upload" (from `UX-Design/ux-design-specification.md`) are the primary workflows for this epic.

#### User Journey: Document Upload

1.  **Select or Create Class/Topic (Step 1):**
    *   User is presented with existing classes/topics or an option to create a new one.
    *   If "Create New Class/Topic" is chosen, a modal/form is displayed for inputting the class/topic name.
    *   System validates class/topic name (length, uniqueness).
    *   Upon selection/creation, the `class_id` is determined.

2.  **Upload Document (Step 2):**
    *   User interacts with the `Drag-and-Drop Upload Area` component.
    *   **Client-Side Validation:** File type (`.txt`, `.pdf`) and size (max 10MB) are validated immediately. Error messages are displayed if validation fails.
    *   File is sent to `POST /api/upload`.
    *   **Server-Side:**
        *   Receives file, uploads to Supabase Storage.
        *   Records `study_materials` entry in PostgreSQL.
        *   If PDF, triggers Vercel Function for text extraction.
        *   If TXT, stores raw text in `extracted_text` field.
    *   **Progress Feedback:** The `Loading Screen/Modal for Generation` or an inline progress indicator provides visual feedback during upload and initial processing.
    *   **Success:** Upon successful upload and initial processing, the UI presents options for `Generate Summary` or `Generate Quiz`.
    *   **Error Handling:** Specific error messages for connection interruptions, invalid file types, size limits, password-protected/corrupted PDFs.

#### Post-Upload Actions:

*   After successful upload, the UI will present immediate options: "Generate Summary" or "Generate Quiz."
*   If the uploaded document was not assigned to a class/section, generated content derived from it will be associated with an "Unorganized" conceptual area for later user assignment.

## Non-Functional Requirements

### Performance

*   **File Upload:** Large files (up to 10MB) should be uploaded efficiently, with progress feedback.
*   **PDF Processing:** Text extraction from PDFs via Vercel Function should complete within reasonable timeframes (e.g., a few seconds for typical documents).
*   **UI Responsiveness:** Interactions with class/section management and document listings should feel instantaneous (<200ms).
*   **API Latency:** Backend API calls for class/section/document management should have low latency.

### Security

*   **Row Level Security (RLS):** All tables containing user-specific data (`classes`, `class_sections`, `study_materials`, `generated_content`) must have RLS policies enabled to ensure users can only access their own data.
*   **Secure File Storage:** Supabase Storage must be configured with appropriate access policies.
*   **Data Transmission:** All communication (frontend to backend, frontend to Vercel Function) must use HTTPS.
*   **Input Validation:** Strict validation on all user inputs (file uploads, class/section names) to prevent injection attacks and other vulnerabilities.

### Reliability/Availability

*   **Error Handling:** Robust error handling mechanisms should be in place for file uploads (network issues, invalid files, processing failures) and API interactions, providing clear user feedback.
*   **Supabase/Vercel Resilience:** Leverage the inherent reliability of Supabase and Vercel's serverless infrastructure.
*   **Data Integrity:** Database transactions should ensure data consistency during class/section/document manipulations.

### Observability

*   **Logging:** Implement comprehensive logging for file upload events, PDF processing status, and API interactions to monitor system health and diagnose issues.
*   **Metrics:** Collect metrics on upload times, PDF processing durations, and API response times to track performance.
*   **Alerting:** Set up alerts for critical errors (e.g., PDF processing failures, Supabase API errors).

## Dependencies and Integrations

*   **Supabase:** Core dependency for database (PostgreSQL), authentication (Auth), and file storage (Storage).
*   **Next.js:** Frontend framework.
*   **Vercel:** Hosting for Next.js frontend and Vercel Functions for PDF processing.
*   **Cloud-based AI Service (e.g., Google Cloud Vision AI):** For PDF text extraction, integrated via a Vercel Function.
*   **External Libraries:** Client-side libraries for file upload (e.g., `react-dropzone`), validation, and UI components (shadcn/ui).
*   **Epic 1 (Foundation & Core Setup):** Required for basic infrastructure and project setup.
*   **Epic 2 (User Onboarding & Authentication):** Required for user accounts and secure access.

## Acceptance Criteria (Authoritative)

The following acceptance criteria apply to Epic 3, ensuring successful implementation of Content Management & Organization:

*   **Story 3.1: Document Upload (Text & PDF)**
    *   Users can upload `.txt` and `.pdf` files.
    *   The system shall enforce a strict file size limit of 10MB.
    *   The system shall perform basic file extension validation.
    *   If a user attempts to upload an unsupported file type, the system shall display an error message: 'This file type is not supported. Please try another file.'
    *   If an uploaded PDF is password-protected or corrupted, the system shall display an error message: 'This file is password-protected or corrupted and cannot be processed.'
    *   If the internet connection is interrupted during upload, the system shall display an error message and allow the user to retry the upload.
*   **Story 3.2: Create & Manage Classes**
    *   Users can create, rename, and delete "classes".
    *   When deleting a class, a confirmation dialog states that all associated content will also be deleted.
    *   Class names shall be limited to 25 alphanumeric characters.
    *   If a user attempts to create a class with a name that already exists, the system shall display an error message: 'A class with this name already exists. Please choose a different name.'
*   **Story 3.3: Create & Manage Class Sections**
    *   Users can create, rename, and delete "class sections" within classes.
    *   When deleting a section, a confirmation dialog states that all associated content will also be deleted.
    *   Section names shall be limited to 25 alphanumeric characters.
    *   If a user attempts to create a section with a name that already exists within the same class, the system shall display an error message: 'A section with this name already exists in this class. Please choose a different name.'
*   **Story 3.4: Assign & View Content**
    *   Users can assign uploaded documents and generated content to specific classes and sections.
    *   Users can view all documents and generated content organized by class and section.
    *   When a document is moved, all its associated generated content (summaries, quizzes) shall automatically move with it.
    *   When viewing a class/section, generated content (summaries, quizzes) is clearly linked to and displayed alongside its source document.
*   **Story 3.5: Post-Upload Actions**
    *   After a document has been successfully uploaded, the UI presents immediate options to "Generate Summary" or "Generate Quiz".
    *   Generated content from unorganized documents shall be temporarily stored in an 'Unorganized' area, accessible to the user for later assignment.

## Traceability Mapping

| Acceptance Criteria ID | Spec Section(s)                                             | Component(s)/API(s)                                                                    | Test Idea                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| :--------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1.1                  | Detailed Design (Services/Modules, APIs), NFR (Security) | Next.js File Upload Component, Supabase Storage, `POST /api/upload`                    | E2E: Upload valid .txt and .pdf files.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 3.1.2                  | Detailed Design (APIs)                                      | Next.js File Upload Component, `POST /api/upload`                                      | Unit/Integration: Verify server-side rejection for files > 10MB. E2E: Attempt to upload file > 10MB, verify error message.                                                                                                                                                                                                                                                                                                                                             |
| 3.1.3                  | Detailed Design (APIs)                                      | Next.js File Upload Component, `POST /api/upload`                                      | Unit/Integration: Verify server-side rejection for unsupported types. E2E: Attempt to upload unsupported file (e.g., .docx), verify error.                                                                                                                                                                                                                                                                                                                          |
| 3.1.4                  | Detailed Design (APIs)                                      | Next.js File Upload Component, `POST /api/upload`                                      | E2E: Attempt to upload unsupported file type (e.g., `.docx`), verify specific error message.                                                                                                                                                                                                                                                                                                                                                                       |
| 3.1.5                  | Detailed Design (APIs, Services/Modules)                    | Next.js File Upload Component, Vercel Function (PDF Processing), `POST /api/upload`    | E2E: Upload password-protected/corrupted PDF, verify specific error message from PDF processing.                                                                                                                                                                                                                                                                                                                                                                 |
| 3.1.6                  | Detailed Design (Workflows)                                 | Next.js File Upload Component, `POST /api/upload`                                      | E2E: Simulate network interruption during upload (e.g., by disabling network), verify error and retry option.                                                                                                                                                                                                                                                                                                                                                         |
| 3.2.1                  | Detailed Design (Services/Modules, Data Models, APIs)       | Class Management UI, `GET /api/classes`, `POST /api/classes`, `PUT /api/classes/{id}`, `DELETE /api/classes/{id}` | E2E: Create, rename, delete classes.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 3.2.2                  | Detailed Design (APIs, Data Models)                         | Class Management UI, `DELETE /api/classes/{id}`                                        | E2E: Delete class with associated content, verify confirmation and cascading deletion.                                                                                                                                                                                                                                                                                                                                                                           |
| 3.2.3                  | Detailed Design (Data Models)                               | Class Management UI, `POST /api/classes`                                               | Unit/Integration: Verify database schema constraint. E2E: Attempt to create class with >25 chars, verify error.                                                                                                                                                                                                                                                                                                                                                     |
| 3.2.4                  | Detailed Design (APIs)                                      | Class Management UI, `POST /api/classes`                                               | E2E: Attempt to create class with duplicate name, verify error message.                                                                                                                                                                                                                                                                                                                                                                                           |
| 3.3.1                  | Detailed Design (Services/Modules, Data Models, APIs)       | Section Management UI, `GET /api/classes/{id}/sections`, `POST /api/classes/{id}/sections`, `PUT /api/sections/{id}`, `DELETE /api/sections/{id}` | E2E: Create, rename, delete sections within a class.                                                                                                                                                                                                                                                                                                                                                                                                              |
| 3.3.2                  | Detailed Design (APIs, Data Models)                         | Section Management UI, `DELETE /api/sections/{id}`                                     | E2E: Delete section with associated content, verify confirmation and cascading deletion.                                                                                                                                                                                                                                                                                                                                                                         |
| 3.3.3                  | Detailed Design (Data Models)                               | Section Management UI, `POST /api/classes/{id}/sections`                               | Unit/Integration: Verify database schema constraint. E2E: Attempt to create section with >25 chars, verify error.                                                                                                                                                                                                                                                                                                                                                   |
| 3.3.4                  | Detailed Design (APIs)                                      | Section Management UI, `POST /api/classes/{id}/sections`                               | E2E: Attempt to create section with duplicate name in same class, verify error message.                                                                                                                                                                                                                                                                                                                                                                            |
| 3.4.1                  | Detailed Design (Workflows, APIs)                           | Document Listing UI, `PUT /api/study-materials/{id}/assign`                            | E2E: Assign document to a class/section.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 3.4.2                  | Detailed Design (Workflows)                                 | Document Listing UI, Class/Section View UI                                             | E2E: Verify documents/content appear correctly in assigned classes/sections.                                                                                                                                                                                                                                                                                                                                                                                        |
| 3.4.3                  | Detailed Design (Data Models, Workflows)                    | `PUT /api/study-materials/{id}/assign`                                                 | E2E: Move document between classes/sections, verify associated generated content moves automatically.                                                                                                                                                                                                                                                                                                                                                             |
| 3.4.4                  | Detailed Design (Workflows)                                 | Class/Section View UI                                                                  | E2E: Verify generated content is linked and displayed with source document in class/section view.                                                                                                                                                                                                                                                                                                                                                                   |
| 3.5.1                  | Detailed Design (Workflows)                                 | Next.js File Upload Component (Post-upload UI)                                         | E2E: Upload a document, verify "Generate Summary" and "Generate Quiz" options appear immediately.                                                                                                                                                                                                                                                                                                                                                                   |
| 3.5.2                  | Detailed Design (Data Models, Workflows)                    | `generated_content` table, Backend Logic                                               | E2E: Generate content from unassigned document, verify it appears in an 'Unorganized' area and can be assigned later.                                                                                                                                                                                                                                                                                                                                                 |

## Risks, Assumptions, Open Questions

### Risks:

*   **PDF Parsing Accuracy:** The accuracy of text extraction from complex or image-heavy PDFs by the chosen AI service might vary, impacting the quality of summaries and quizzes. (Mitigation: Thorough testing with diverse PDF documents, fallback for manual content entry if parsing fails.)
*   **Supabase RLS Complexity:** Incorrectly configured RLS policies could lead to data leakage between users. (Mitigation: Extensive RLS unit and integration tests, peer review of policies, automated security scans.)
*   **Network Latency/Reliability:** Uploads of larger files and calls to external AI services are susceptible to network issues, potentially leading to failed operations or poor user experience. (Mitigation: Implement robust retry mechanisms, progress indicators, and informative error messages; optimize file chunking if needed.)
*   **AI Service Costs:** High volume of PDF parsing requests to third-party AI services could lead to unexpected costs. (Mitigation: Monitor usage, implement quotas/rate limiting if necessary, explore cost-effective alternatives if scaling.)

### Assumptions:

*   **PDF Structure:** Assume that most uploaded PDFs will contain extractable text content, not purely image-based.
*   **User Internet Connection:** Assume users have a reasonably stable internet connection for uploads.
*   **Supabase Reliability:** Assume Supabase services (Auth, DB, Storage) provide adequate uptime and performance for MVP needs.
*   **AI Service Integration:** Assume the chosen cloud-based AI service for PDF parsing has reliable APIs and documentation for integration.

### Open Questions:

*   **Specific PDF Parsing AI Service:** Which specific cloud-based AI service (e.g., Google Cloud Vision AI, AWS Textract) will be used for PDF content extraction? The choice might influence integration complexity and cost.
*   **"Unorganized" Content UX:** What are the exact UX/UI details for the "Unorganized" area where content from unassigned documents will be temporarily stored? How will users be prompted to organize it?
*   **PDF Re-processing:** If a PDF is replaced or updated, should the extracted text be automatically re-processed, or should this be a manual user action?

## Test Strategy Summary

The test strategy for Epic 3 will focus on ensuring the robust implementation of document upload, content organization, and document management functionalities, alongside the validation of key non-functional requirements like security and reliability.

*   **Unit Tests:** For individual components and utility functions (e.g., client-side file validation, API utility functions).
*   **Integration Tests:** To verify the interaction between the Next.js Frontend, Supabase APIs, and Supabase Storage (e.g., `POST /api/upload` successfully uploads to storage and creates a DB entry). This includes testing RLS policies to prevent unauthorized data access.
*   **End-to-End (E2E) Tests:** Using tools like Playwright or Cypress to simulate user journeys for:
    *   **Document Upload:** Testing successful uploads of various valid text/PDF files, error scenarios for invalid file types, oversized files, password-protected/corrupted PDFs, and network interruptions.
    *   **Class/Section Management:** Creating, renaming, and deleting classes and sections, including confirmation dialogs and error handling for duplicate names or invalid characters.
    *   **Content Assignment:** Assigning and reassigning documents to classes/sections, and verifying content appears correctly. Testing that generated content moves with source documents.
    *   **Post-Upload Actions:** Verifying the "Generate Summary" and "Generate Quiz" options appear correctly.
*   **Manual Testing:** Crucial for verifying UX aspects, error messages, and overall user flow, especially for file upload and organization.
*   **Security Testing:** Manual and automated checks for RLS effectiveness and input sanitization.
*   **Performance Testing:** Basic load testing for file uploads and API endpoints.