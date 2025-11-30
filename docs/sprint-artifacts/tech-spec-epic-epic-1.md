# Epic Technical Specification: Foundation & Core Setup

Date: søndag 30. november 2025
Author: BIP
Epic ID: epic-1
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

1.  The repository contains a `src` directory for source code, a `docs` directory for documentation, and a `tests` directory for automated tests.
2.  A `.gitignore` file is configured to exclude unnecessary files.
3.  A `README.md` file provides basic project information and setup instructions.
4.  The Next.js application uses the latest stable version of Next.js.
5.  Tailwind CSS is correctly configured for styling.
6.  A basic home page is rendered.
7.  A new Supabase project is created.
8.  The Supabase client (`@supabase/supabase-js` and `@supabase/ssr`) is configured in the Next.js application.
9.  Environment variables for Supabase URL and Anon Key are securely managed.
10. The `.env.local` file is included in `.gitignore`.
11. Automated tests (e.g., linting, basic unit tests) are run when a code change is pushed to the main branch.
12. The application is automatically deployed to a staging environment (e.g., Vercel) when a code change is pushed to the main branch.

## Traceability Mapping

| AC # | Spec Section(s) | Component(s)/API(s)                                | Test Idea                                                                     |
| :--- | :-------------- | :------------------------------------------------- | :---------------------------------------------------------------------------- |
| 1    | Epic 1.1        | File System, Git                                   | Verify directory structure and `.gitignore` after cloning.                    |
| 2    | Epic 1.1        | `.gitignore`                                       | Ensure specified files are ignored by Git.                                    |
| 3    | Epic 1.1        | `README.md`                                        | Check `README.md` for project info and setup instructions.                    |
| 4    | Epic 1.2        | Next.js, `package.json`                            | Verify Next.js version in `package.json`.                                     |
| 5    | Epic 1.2        | Tailwind CSS, `tailwind.config.cjs`, `globals.css` | Verify Tailwind setup and basic styling on a test page.                       |
| 6    | Epic 1.2        | Next.js App                                        | Access home page in browser and verify content.                               |
| 7    | Epic 1.3        | Supabase project, `supabase.com`                   | Confirm Supabase project creation via Supabase dashboard.                     |
| 8    | Epic 1.3        | `@supabase/supabase-js`, `@supabase/ssr`           | Verify client configuration in Next.js app (e.g., `_app.tsx` or similar).     |
| 9    | Epic 1.3        | `.env.local`                                       | Check environment variables are correctly loaded and accessible.              |
| 10   | Epic 1.3        | `.gitignore`                                       | Verify `.env.local` is listed in `.gitignore`.                                |
| 11   | Epic 1.4        | GitHub Actions/Vercel CI                           | Trigger a push to main branch and verify automated tests run successfully.    |
| 12   | Epic 1.4        | Vercel Deployment                                  | Trigger a push to main branch and verify automatic deployment to staging.     |

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
