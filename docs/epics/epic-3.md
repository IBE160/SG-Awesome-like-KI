# Epic 3: Content Organization & Upload

This epic focuses on the foundational features that allow users to upload their study materials and organize them into a structured hierarchy.

## User Stories

*   **[3.1: Document Upload (Text & PDF)](../sprint-artifacts/3-1-document-upload-text-pdf.md):** As a student, I want to upload my study materials in `.txt` and `.pdf` formats so I can use the tool's learning features on them.
*   **[3.2: Create & Manage Classes](../sprint-artifacts/3-2-create-manage-classes.md):** As a student, I want to create and manage "classes" so that I can group my study materials by subject.
*   **[3.3: Create & Manage Class Sections](../sprint-artifacts/3-3-create-manage-class-sections.md):** As a student, I want to create and manage "sections" within my classes so that I can further organize my materials by topic or chapter.
*   **[3.4: Assign & View Content](../sprint-artifacts/3-4-assign-view-content.md):** As a user, I want to assign uploaded documents and generated content to specific classes and sections, so that I can easily find and access my study materials.
*   **[3.5: Post-Upload Actions](../sprint-artifacts/3-5-post-upload-actions.md):** As a user, I want to have the option to generate a summary or quiz immediately after uploading a document, so that I can quickly get value from the tool without having to organize my content first.

## High-Level Goals

*   Enable file uploads (`.txt`, `.pdf`).
*   Implement a two-level organizational structure (Classes -> Sections).
*   Allow users to create, read, update, and delete (CRUD) classes and sections.
*   Allow users to assign and re-assign documents to different classes/sections.
*   Ensure all data is securely isolated to the authenticated user.

## Key Technologies

*   **Frontend:** Next.js, React
*   **Backend/API:** Next.js API Routes
*   **Database & Auth:** Supabase (PostgreSQL)
*   **File Storage:** Supabase Storage
