# Epic Technical Specification: Content Management & Organization

Date: søndag 30. november 2025
Author: BIP
Epic ID: epic-3
Status: Draft

---

## Overview

The AI Study Buddy is a web application designed to alleviate student information overload by transforming dense study materials into concise summaries and interactive quizzes. It aims to create a more inclusive and engaging learning environment, particularly benefiting neurodiverse students, ambitious achievers, and time-strapped individuals. The core value proposition is efficient, personalized, and accessible learning, with a guiding principle of taking students from a state of overwhelm to one of confidence.

## Objectives and Scope

**In-Scope for MVP:**
*   **Core AI Functionality:** Generate concise summaries and multiple-choice quizzes with user-selectable length.
*   **User Experience:** Simple, clean, intuitive UI; clear step-by-step guidance; motivational feedback; strong screen-reader support; reduced-motion options.
*   **Foundation:** Secure user registration/authentication; file upload/management with hierarchical organization.

**Out-of-Scope for MVP:**
*   Personalized Learning Paths, Smart Progress Tracking, Adaptive AI, Advanced Accessibility, Gamification, Social Features, LMS Integration, "Chat with your documents" functionality.

## System Architecture Alignment

The system is designed with a modern, scalable, and secure technology stack, aligning with the PRD's requirements for a web application with AI functionality and secure user data handling. It leverages a Next.js frontend on Vercel, a Supabase backend (BaaS) with PostgreSQL for data, authentication, and storage, and Vercel Functions for secure integration with the Claude AI model (for summaries and quizzes). Robust PDF parsing will be handled by a cloud-based AI service.

## Detailed Design

### Services and Modules

*   **Next.js Frontend (Vercel)**
    *   **Responsibilities:** User interface, user interaction handling, API calls to backend and Vercel functions.
    *   **Inputs/Outputs:** Receives user input, sends API requests, displays data/AI generated content.
    *   **Owner:** Development Team
*   **Supabase Backend (BaaS)**
    *   **Responsibilities:** Database management (PostgreSQL), user authentication, file storage.
    *   **Inputs/Outputs:** Receives data from frontend (e.g., user registration, file metadata), provides data to frontend (e.g., user profiles, class lists).
    *   **Owner:** Development Team (managed via Supabase)
*   **Vercel Function (AI Orchestration)**
    *   **Responsibilities:** Securely mediates communication between frontend and Claude AI model, handles API key protection.
    *   **Inputs/Outputs:** Receives requests for summary/quiz generation from frontend, sends prompts to Claude AI, receives AI responses, sends generated content back to frontend.
    *   **Owner:** Development Team
*   **Claude AI Model (Anthropic)**
    *   **Responsibilities:** Generates summaries and quizzes based on provided text.
    *   **Inputs/Outputs:** Receives text prompts, returns generated text content.
    *   **Owner:** Anthropic (third-party service)
*   **Cloud-based AI Service for PDF Parsing (e.g., Google Cloud Vision AI)**
    *   **Responsibilities:** Extracts text from PDF documents, handles complex layouts.
    *   **Inputs/Outputs:** Receives PDF files, returns extracted text.
    *   **Owner:** Google (third-party service)

### Data Models and Contracts

The database will be implemented in Supabase (PostgreSQL) and includes the following tables:

*   **`users`**: Managed by Supabase Auth. Contains user information.
*   **`classes`**: Represents a class the student is taking.
    *   `id` (uuid, primary key)
    *   `name` (text, not null)
    *   `user_id` (uuid, foreign key to `auth.users`)
*   **`class_sections`**: Represents a topic or chapter within a class.
    *   `id` (uuid, primary key)
    *   `name` (text, not null)
    *   `class_id` (uuid, foreign key to `classes`)
*   **`study_materials`**: Represents an uploaded file.
    *   `id` (uuid, primary key)
    *   `file_name` (text, not null)
    *   `storage_path` (text, not null)
    *   `class_id` (uuid, foreign key to `classes`)
    *   `class_section_id` (uuid, foreign key to `class_sections`)
*   **`generated_content`**: Represents a summary, quiz, etc.
    *   `id` (uuid, primary key)
    *   `type` (text, not null, e.g., 'summary', 'quiz')
    *   `content` (jsonb, not null)
    *   `class_id` (uuid, foreign key to `classes`)
*   **`generated_content_materials`**: Manages the many-to-many relationship between generated content and study materials.
    *   `generated_content_id` (uuid, foreign key to `generated_content`)
    *   `study_material_id` (uuid, foreign key to `study_materials`)
*   **`generated_content_sections`**: Manages the many-to-many relationship between generated content and class sections.
    *   `generated_content_id` (uuid, foreign key to `generated_content`)
    *   `class_section_id` (uuid, foreign key to `class_sections`)

### APIs and Interfaces

The Next.js frontend will communicate with the backend using API Routes or Route Handlers, following a RESTful and secure design.

*   **`POST /api/auth/register`**: Registers a new user.
*   **`POST /api/auth/login`**: Logs in a user.
*   **`POST /api/auth/logout`**: Logs out a user.
*   **`GET /api/classes`**: Retrieves all classes for the logged-in user.
*   **`POST /api/classes`**: Creates a new class.
*   **`PUT /api/classes/{id}`**: Updates a class.
*   **`DELETE /api/classes/{id}`**: Deletes a class.
*   **`GET /api/classes/{id}/sections`**: Retrieves all sections for a class.
*   **`POST /api/classes/{id}/sections`**: Creates a new section.
*   **`PUT /api/sections/{id}`**: Updates a section.
*   **`DELETE /api/sections/{id}`**: Deletes a section.
*   **`POST /api/upload`**: Uploads a new study material.
*   **`POST /api/generate`**: Triggers the generation of content (summary or quiz) via the Vercel Function.

### Workflows and Sequencing

#### User Registration and Authentication
1.  User navigates to the Landing Page.
2.  User chooses Login or Register.
3.  If Register: User provides details, account created, redirected to Dashboard.
4.  If Login: User provides credentials, on success redirected to Dashboard, else error.

#### Document Upload
1.  User initiates upload.
2.  User selects or creates a Class/Topic.
3.  User selects file, system validates file type and size.
4.  File uploads, then a success message is displayed, and the user is redirected to the Dashboard or Document View.

#### Quiz Generation
1.  User initiates "Generate Quiz" (from a document view or the main dashboard).
2.  User selects document(s) (if not pre-selected).
3.  User configures quiz options (e.g., length, question types).
4.  System displays a loading screen during the quiz generation process.
5.  On successful generation, the user is presented with an option to start the quiz.

#### Summary Generation
1.  User initiates "Generate Summary" (from a document view or the main dashboard).
2.  User selects document(s) (if not pre-selected).
3.  User configures summary options (e.g., paragraph vs. bullet points).
4.  System displays a loading screen during the summary generation process.
5.  On successful generation, the user is presented with an option to view the summary.

## Non-Functional Requirements

### Performance

*   Content generation (summaries/quizzes) must complete within 30 seconds.
*   UI interactions (e.g., opening a document, navigating) should feel instantaneous (<200ms).
*   The Next.js application will be optimized for fast page loads and a responsive user experience.
*   Supabase provides a performant PostgreSQL database.
*   The Vercel Function for AI integration will be designed to be efficient and handle requests asynchronously.

### Security

*   All user data must be protected by Row Level Security (RLS).
*   All data transmission must be encrypted using HTTPS.
*   Passwords must be hashed using a modern, strong algorithm (e.g., bcrypt).
*   User authentication will be handled by Supabase Auth using email and password.
*   RLS will be enabled on all user data tables in Supabase to ensure strict data isolation.
*   The Vercel Function for AI integration will act as a secure intermediary, preventing exposure of the AI model's API key on the client-side.

### Reliability/Availability

*   The application must maintain a 99% uptime during the testing period under a load of 10 concurrent users.
*   The serverless nature of Next.js on Vercel and Supabase allows for automatic scaling to handle varying loads.
*   The architecture is designed to handle at least 100 concurrent users for the MVP.

### Observability

Currently undefined based on provided documentation.

## Dependencies and Integrations

### Project Dependencies (from package.json)
*   `@supabase/ssr`: ^0.7.0 (Supabase Server-Side Rendering support)
*   `@supabase/supabase-js`: ^2.84.0 (Supabase JavaScript client)
*   `@tailwindcss/postcss`: ^4.1.17 (Tailwind CSS PostCSS plugin)
*   `next`: ^16.0.3 (Next.js framework)
*   `react`: ^19.2.0 (React library)
*   `react-dom`: ^19.2.0 (React DOM library)

### Development Dependencies (from package.json)
*   `@eslint/js`: ^9.39.1 (ESLint core)
*   `@types/react`: 19.2.7 (TypeScript types for React)
*   `@typescript-eslint/eslint-plugin`: ^8.48.0 (ESLint plugin for TypeScript)
*   `autoprefixer`: ^10.4.22 (PostCSS plugin to parse CSS and add vendor prefixes)
*   `eslint-plugin-react`: ^7.37.5 (ESLint plugin for React specific linting rules)
*   `eslint-plugin-react-hooks`: ^7.0.1 (ESLint plugin for React Hooks specific linting rules)
*   `postcss`: ^8.5.6 (Tool for transforming CSS with JavaScript plugins)
*   `tailwindcss`: ^4.1.17 (Tailwind CSS framework)
*   `typescript`: 5.9.3 (TypeScript language)
*   `typescript-eslint`: ^8.48.0 (TypeScript ESLint parser and utilities)

### External Integrations
*   **Supabase:** Backend-as-a-Service providing PostgreSQL database, user authentication, and file storage.
*   **Vercel:** Hosting platform for Next.js frontend and serverless Vercel Functions used for AI orchestration.
*   **Claude AI Model (Anthropic):** Third-party AI service for generating summaries and quizzes.
*   **Cloud-based AI Service for PDF Parsing (e.g., Google Cloud Vision AI):** Third-party service for robust text extraction from PDF documents.

## Acceptance Criteria (Authoritative)

1.  The file is successfully uploaded and stored securely.
2.  If an unsupported file type is uploaded, an error message is received: 'This file type is not supported. Please try another file.'
3.  If a password-protected or corrupted PDF is uploaded, an error is received: 'This file is password-protected or corrupted and cannot be processed.'
4.  If the internet connection is interrupted during upload, the system shall display an error message and allow the user to retry the upload.
5.  The system enforces a strict file size limit of 10MB.
6.  The class is added to my list of classes.
7.  The user can rename and delete existing classes.
8.  When a class is deleted, a confirmation dialog is received stating that all associated content will also be deleted.
9.  Class names shall be limited to 25 alphanumeric characters.
10. If a user attempts to create a class with a name that already exists, the system shall display an error message: 'A class with this name already exists. Please choose a different name.'
11. The section is added to my class.
12. The user can rename and delete existing sections.
13. When a section is deleted, a confirmation dialog is received stating that all associated content will also be deleted.
14. Section names shall be limited to 25 alphanumeric characters.
15. If a user attempts to create a section with a name that already exists within the same class, the system shall display an error message: 'A section with this name already exists in this class. Please choose a different name.'
16. The document or generated content appears within that class/section.
17. All documents and generated content are organized by class and section.
18. When a document is moved, all its associated generated content (summaries, quizzes) shall automatically move with it.
19. When viewing a class/section, generated content (summaries, quizzes) is clearly linked to and displayed alongside its source document.
20. The UI presents immediate options to "Generate Summary" or "Generate Quiz" after a document has been successfully uploaded.
21. Generated content from unorganized documents shall be temporarily stored in an 'Unorganized' area, accessible to the user for later assignment.

## Traceability Mapping

| AC # | Spec Section(s) | Component(s)/API(s)                                | Test Idea                                                                     |
| :--- | :-------------- | :------------------------------------------------- | :---------------------------------------------------------------------------- |
| 1-5  | Epic 3.1        | Document Upload Component, POST /api/upload        | E2E test: attempt to upload various file types, sizes, and a corrupted PDF.   |
| 6-10 | Epic 3.2        | Class Management UI, POST/PUT/DELETE /api/classes  | E2E test: create, rename, delete classes, and verify error handling.          |
| 11-15| Epic 3.3        | Section Management UI, POST/PUT/DELETE /api/classes/{id}/sections | E2E test: create, rename, delete sections, and verify error handling. |
| 16-19| Epic 3.4        | Content Assignment UI, GET /api/classes, GET /api/classes/{id}/sections | E2E test: assign content, move documents, and verify content organization. |
| 20-21| Epic 3.5        | Post-Upload UI                                     | E2E test: upload a document and verify "Generate" options appear.            |

## Risks, Assumptions, Open Questions

*   **Risks:**
    *   **AI model hallucinations/inaccuracies:** Summaries and quizzes generated by the AI might contain factual errors or inconsistencies.
        *   _Mitigation:_ Implement robust prompt engineering, perform basic output validation (e.g., length, basic coherence checks), display clear UI disclaimers about potential inaccuracies, and enable human review for critical content.
    *   **Supabase RLS misconfiguration:** Incorrectly configured Row Level Security (RLS) could lead to unauthorized data access.
        *   _Mitigation:_ Develop automated tests specifically for RLS policies, conduct regular security audits, and follow Supabase best practices.
    *   **Performance bottlenecks with AI API calls:** Delays in AI model responses could negatively impact user experience, especially during content generation.
        *   _Mitigation:_ Implement asynchronous handling of AI requests, display clear loading indicators, explore caching strategies for common prompts/responses where applicable, and monitor API performance closely.
    *   **PDF parsing failures:** Complex or image-heavy PDF documents might not be parsed accurately by the cloud-based AI service, leading to incomplete or garbled input for summary/quiz generation.
        *   _Mitigation:_ Utilize a robust, specialized cloud-based AI service for PDF parsing, provide informative error messages to the user for failed parses, and potentially offer alternative input methods (e.g., manual text input) for problematic documents.
*   **Assumptions:**
    *   **Target User Age:** It is assumed that the primary target users are over 13, or that educational institutions will manage and provide parental consent as required by COPPA.
    *   **AI Model Efficacy & Cost:** The chosen AI models (Claude AI from Anthropic, Google Cloud Vision AI for PDF parsing) are assumed to be sufficiently powerful, accurate, and cost-effective for the MVP's requirements and potential initial scaling.
    *   **Platform Scalability:** Next.js on Vercel and Supabase are assumed to provide adequate scalability and performance to handle the MVP's user load and anticipated growth post-MVP.
*   **Questions:**
    *   **AI Service Cost Implications:** What are the exact cost implications and potential cost escalations of the chosen AI services at higher user volumes?
        *   _Next step:_ Conduct a detailed cost analysis during the initial spike/research phase and continuously monitor usage.
    *   **Offline Capabilities:** Will the application require any offline capabilities for content access or quiz-taking?
        *   _Next step:_ Discuss with the product team; if required, explore PWA capabilities or local storage options post-MVP.
    *   **AI Model Update Strategy:** What is the strategy for handling AI model updates or potential breaking changes from third-party services (Claude AI, Google Cloud Vision AI)?
        *   _Next step:_ Define an API abstraction layer, implement versioning for AI integrations, and establish a monitoring process for third-party API changes.

## Test Strategy Summary

*   **Test Levels:**
    *   **Unit Tests:** Focused on individual functions, components (React components, utility functions), and small modules to ensure correctness in isolation.
    *   **Integration Tests:** Covering interactions between different components and services, such as the Next.js frontend communicating with the Supabase backend, or the Vercel Function integrating with the Claude AI model.
    *   **End-to-End (E2E) Tests:** Simulating full user journeys (e.g., user registration, document upload, summary generation, quiz taking) to validate the complete system flow from the user's perspective.
    *   **Acceptance Tests:** Directly verifying that the implemented features meet the Acceptance Criteria (ACs) detailed in this Technical Specification, ensuring that user requirements are satisfied.
*   **Frameworks:**
    *   **Frontend:** Jest and React Testing Library for unit and integration tests of React components. Cypress or Playwright for comprehensive E2E test scenarios.
    *   **Backend/API Routes:** Jest or Vitest for testing Supabase-related functions, API route handlers, and Vercel Functions.
*   **Coverage of ACs:**
    *   A primary goal is to ensure that every Acceptance Criterion (AC) defined in this document has at least one corresponding automated test case, providing high confidence in feature completeness and correctness.
*   **Edge Cases:**
    *   Testing will explicitly cover edge cases identified during requirements gathering and design, including: file size limits, unsupported file types, empty documents, password-protected/corrupted PDFs, invalid user inputs (e.g., during registration), and graceful handling of network errors during file uploads or AI API calls.
