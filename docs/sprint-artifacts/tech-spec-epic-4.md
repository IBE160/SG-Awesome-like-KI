# Epic Technical Specification: AI-Powered Learning Tools

Date: Sunday, November 30, 2025
Author: BIP
Epic ID: 4
Status: Draft

---

## Overview

The AI Study Buddy is a web application designed to alleviate student information overload by transforming dense study materials into concise summaries and interactive quizzes. Epic 4 focuses on delivering this core 'magic' by enabling users to generate AI-powered summaries and multiple-choice quizzes from their uploaded study materials. This directly addresses the product's primary goal of efficient, personalized, and accessible learning, moving students from overwhelm to confidence.

## Objectives and Scope

**In-scope for Epic 4:**
*   **Core AI Functionality:**
    *   Generate concise summaries from uploaded text/PDF documents.
    *   Generate multiple-choice quizzes with user-selectable length (e.g., short, medium, long).
*   **Learning & Feedback:**
    *   Interactive quiz interface for users to select answers and receive immediate feedback.
    *   Motivational feedback and explanations for quiz answers, including reasoning for correct and incorrect choices.
*   **Frontend Wizards:**
    *   Guided summary generation wizard for configuring summary options.
    *   Guided quiz generation wizard for customizing quiz options (length, question types).

**Out-of-scope for Epic 4:**
*   Personalized Learning Paths (e.g., AI-driven recommendations, workout plans).
*   Smart Progress Tracking (e.g., visualizations of user progress, targeted feedback).
*   Adaptive AI (e.g., AI adjusting difficulty based on user performance).
*   Advanced Accessibility features (e.g., "simplify this" option, dyslexia-friendly settings).
*   Gamification elements.
*   Social Features.
*   LMS Integration.
*   "Chat with your documents" functionality.

## System Architecture Alignment

Epic 4's features heavily rely on the established architecture for AI integration. The Next.js frontend will interact with Supabase for content storage and with Vercel Functions to securely invoke the Claude AI Model for summary and quiz generation. PDF parsing will utilize a separate cloud-based AI service (e.g., Google Cloud Vision AI) invoked via Vercel Functions. Data models for `study_materials` and `generated_content` will be crucial, with `generated_content` storing the AI outputs.

## Detailed Design

### Services and Modules

*   **Next.js Frontend:** Responsible for UI rendering, user interaction, and making API calls to backend services. Handles summary/quiz generation wizards.
*   **Vercel Function (AI Proxy):** Securely proxies requests from the frontend to the Claude AI Model for summary and quiz generation.
    *   Inputs: User request (document content, desired length for quizzes, summary format).
    *   Outputs: AI-generated summary or quiz.
*   **Cloud-based AI Service for PDF Parsing (e.g., Google Cloud Vision AI):** Extracts text content from uploaded PDF files.
    *   Inputs: PDF file.
    *   Outputs: Extracted text.
*   **Supabase Storage:** Stores uploaded study materials (text and PDF files).
*   **Supabase PostgreSQL Database:** Stores metadata about classes, sections, study materials, and AI-generated content.

### Data Models and Contracts

*   **`users`**: (Managed by Supabase Auth)
*   **`classes`**: (Table)
    *   `id` (uuid, primary key)
    *   `name` (text, not null)
    *   `user_id` (uuid, foreign key to `auth.users`)
*   **`class_sections`**: (Table)
    *   `id` (uuid, primary key)
    *   `name` (text, not null)
    *   `class_id` (uuid, foreign key to `classes`)
*   **`study_materials`**: (Table)
    *   `id` (uuid, primary key)
    *   `file_name` (text, not null)
    *   `storage_path` (text, not null)
    *   `class_id` (uuid, foreign key to `classes`)
    *   `class_section_id` (uuid, foreign key to `class_sections`)
*   **`generated_content`**: (Table)
    *   `id` (uuid, primary key)
    *   `type` (text, not null, e.g., 'summary', 'quiz')
    *   `content` (jsonb, not null) - Stores the AI-generated output
    *   `class_id` (uuid, foreign key to `classes`)
    *   `class_section_id` (uuid, foreign key to `class_sections`)
*   **`generated_content_materials`**: (Junction Table)
    *   `generated_content_id` (uuid, foreign key to `generated_content`)
    *   `study_material_id` (uuid, foreign key to `study_materials`)
*   **`generated_content_sections`**: (Junction Table)
    *   `generated_content_id` (uuid, foreign key to `generated_content`)
    *   `class_section_id` (uuid, foreign key to `class_sections`)

### APIs and Interfaces

*   **`POST /api/generate`**: Triggers the generation of content (summary or quiz) via the Vercel Function.
    *   Request:
        ```json
        {
          "documentId": "uuid",
          "type": "summary" | "quiz",
          "options": {
            "summaryFormat": "paragraph" | "bullet_points",
            "quizLength": "short" | "medium" | "long",
            "questionTypes": ["multiple_choice"]
          }
        }
        ```
    *   Response (success):
        ```json
        {
          "generatedContentId": "uuid",
          "status": "success",
          "content": { /* AI generated summary or quiz data */ }
        }
        ```
    *   Response (error):
        ```json
        {
          "status": "error",
          "message": "Error description"
        }
        ```
*   **Internal API (Vercel Function to Claude AI):**
    *   Request: Raw document text, desired output type (summary/quiz), and options.
    *   Response: AI-generated text.

### Workflows and Sequencing

**AI Summary Generation Workflow:**
1.  **User Action:** User selects an uploaded document and initiates "Generate Summary" (via a guided wizard, Story 4.5).
2.  **Frontend:** Collects document ID and summary options.
3.  **Frontend:** Calls `POST /api/generate` with `type: "summary"`.
4.  **Vercel Function:** Receives request, retrieves document content from Supabase Storage (if not already passed), and calls Claude AI with prompt for summary.
5.  **Claude AI:** Generates summary.
6.  **Vercel Function:** Receives summary, stores it in `generated_content` table, links to `study_materials` and potentially `class_sections`.
7.  **Frontend:** Receives response, displays loading spinner during generation, then displays the generated summary. Handles error messages if AI generation fails.

**AI Quiz Generation Workflow:**
1.  **User Action:** User selects an uploaded document and initiates "Generate Quiz" (via a guided wizard, Story 4.6), selecting desired length.
2.  **Frontend:** Collects document ID and quiz options (e.g., length).
3.  **Frontend:** Calls `POST /api/generate` with `type: "quiz"`.
4.  **Vercel Function:** Receives request, retrieves document content, calls Claude AI with prompt for quiz (multiple-choice questions, desired length).
5.  **Claude AI:** Generates quiz. If content cannot support requested length, AI adapts or informs.
6.  **Vercel Function:** Receives quiz, stores it in `generated_content` table, links to `study_materials` and potentially `class_sections`.
7.  **Frontend:** Receives response, displays loading spinner, then displays the generated quiz. Handles error messages if AI generation fails or length is adjusted.

**Interactive Quiz Interface Workflow:**
1.  **User Action:** User starts a generated quiz.
2.  **Frontend:** Displays quiz questions and multiple-choice options.
3.  **User Action:** User selects an answer.
4.  **Frontend:** Provides immediate feedback on correctness.
5.  **User Action:** User completes quiz.
6.  **Frontend:** Displays overall score, motivational feedback, and explanations for each answer (correct/incorrect).

## Non-Functional Requirements

### Performance

*   **Content Generation:** Summaries and quizzes must be generated within 30 seconds (PRD).
*   **UI Interactions:** UI interactions (e.g., opening a document, navigating) should feel instantaneous (<200ms) (PRD).
*   **Scalability:** The architecture is designed to support 100 concurrent users for post-MVP scaling with minimal changes (Architecture).

### Security

*   **Data Protection:** All user data (including study materials and generated content) must be protected by Row Level Security (RLS) in Supabase PostgreSQL (PRD, Architecture).
*   **Data Transmission:** All data transmission must be encrypted using HTTPS (Architecture).
*   **Password Handling:** Passwords must be hashed using a modern, strong algorithm (e.g., bcrypt) (PRD NFRs).
*   **AI API Keys:** AI model API keys must be securely managed and not exposed client-side (Architecture: Vercel Functions as proxy).

### Reliability/Availability

*   **Uptime:** The application must maintain a 99% uptime during the testing period (PRD).
*   **Error Handling:** Robust error handling should be implemented for AI API calls, providing informative messages to the user if generation fails (Epic 4 Stories 4.1, 4.2).
*   **Connection Interruption:** If internet connection is interrupted during upload, the system shall display an error and allow retry (PRD: FR2.1, general reliability).

### Observability

*   **Logging:** Implement comprehensive logging for all API interactions, AI calls, and significant system events to facilitate debugging and monitoring.
*   **Metrics:** Collect metrics on content generation times, API response times, error rates, and user engagement to monitor system health and performance.
*   **Tracing:** Implement distributed tracing to track requests across different services (Frontend, Vercel Function, Supabase, external AI services) for easier root cause analysis of performance issues.

## Dependencies and Integrations

*   **Frontend Framework:**
    *   Next.js (`^16.0.5`)
    *   React (`^19.2.0`)
    *   React DOM (`^19.2.0`)
*   **Styling:**
    *   Tailwind CSS (`^4`)
*   **Backend-as-a-Service (BaaS):**
    *   Supabase (`@supabase/supabase-js: ^2.86.0`, `@supabase/ssr: ^0.8.0`) for database, authentication, and file storage.
*   **AI Models:**
    *   Claude AI Model (Anthropic): Used for summary and quiz generation (accessed via Vercel Function).
    *   Cloud-based AI Service for PDF Parsing (e.g., Google Cloud Vision AI): Used for extracting text from PDFs.
*   **Deployment:**
    *   Vercel: For deploying Next.js frontend and Vercel Functions.
*   **CI/CD:**
    *   GitHub Actions: For automated testing and deployment.
*   **Development Dependencies (relevant for integration context):**
    *   TypeScript (`^5`)
    *   ESLint (`^9`)
    *   Jest (`^30.2.0`) for testing

## Acceptance Criteria (Authoritative)

1.  **Story 4.1: AI Summary Generation [FR3.1]**
    *   Given I have an uploaded document, when I request a summary, then the AI generates a concise summary of the document's key points within 30 seconds.
    *   If the AI is unable to generate a summary (e.g., due to insufficient text or too many images), the system displays an informative error message.

2.  **Story 4.2: AI Quiz Generation (Selectable Length) [FR3.2]**
    *   Given I have an uploaded document, when I request a quiz and select a desired length (short, medium, long), then the AI generates a relevant multiple-choice quiz within 30 seconds.
    *   If the AI is unable to generate a quiz, the system displays an informative error message.
    *   If I request a longer quiz than the content can support, the system informs me and generates the longest possible quiz.

3.  **Story 4.3: Interactive Quiz Interface [FR4.1]**
    *   Given I have a generated quiz, when I start the quiz, then I can select answers for each question.
    *   The system provides immediate feedback on whether my answer is correct or incorrect.

4.  **Story 4.4: Motivational Feedback & Explanations [FR4.2]**
    *   Given I have completed a quiz, when I review my results, then I receive a score and positive reinforcement.
    *   For each question, the correct answer and an explanation are displayed.
    *   If the AI cannot provide an explanation for a correct answer, the system explicitly states this.

5.  **Story 4.5: Guided Summary Generation Wizard**
    *   Given I am on a document view or the main dashboard, when I initiate "Generate Summary", then a multi-step wizard opens.
    *   If initiated from a document, that document is pre-selected.
    *   If initiated from the dashboard, I am prompted to select a document.
    *   I can configure options for the summary (e.g., "Paragraph" vs. "Bullet Points").
    *   I see a loading screen with progress information during generation.

6.  **Story 4.6: Guided Quiz Generation Wizard**
    *   Given I am on a document view or the main dashboard, when I initiate "Generate Quiz", then a multi-step wizard opens.
    *   If initiated from a document, that document is pre-selected.
    *   If initiated from the dashboard, I am prompted to select one or more documents.
    *   I can configure options for the quiz (e.g., length, question types).
    *   I see a loading screen with progress information during generation.

## Traceability Mapping

| AC Number | Spec Section(s)         | Component(s)/API(s)                       | Test Idea                                     |
| --------- | ----------------------- | ----------------------------------------- | --------------------------------------------- |
| 1.1       | FR3.1                   | Frontend, Vercel Function, Claude AI      | Generate summary, check content and time      |
| 1.2       | FR3.1                   | Frontend, Vercel Function, Claude AI      | Test with insufficient text/images, check error |
| 2.1       | FR3.2                   | Frontend, Vercel Function, Claude AI      | Generate quiz (short, medium, long), check content and time |
| 2.2       | FR3.2                   | Frontend, Vercel Function, Claude AI      | Test with insufficient content for length, check error |
| 2.3       | FR3.2                   | Frontend, Vercel Function, Claude AI      | Test with AI inability, check error message |
| 3.1       | FR4.1                   | Frontend (Quiz Interface)                 | Take quiz, select answers                     |
| 3.2       | FR4.1                   | Frontend (Quiz Interface)                 | Check immediate feedback for correct/incorrect |
| 4.1       | FR4.2                   | Frontend (Quiz Review), Claude AI         | Complete quiz, check score and reinforcement |
| 4.2       | FR4.2                   | Frontend (Quiz Review), Claude AI         | Check explanations for correct answers        |
| 4.3       | FR4.2                   | Frontend (Quiz Review), Claude AI         | Test AI inability to explain, check explicit statement |
| 5.1       | Epic 4 Story 4.5        | Frontend (Summary Wizard)                 | Open summary wizard, check multi-step flow    |
| 5.2       | Epic 4 Story 4.5        | Frontend (Summary Wizard)                 | Initiate from document/dashboard, check pre-selection/prompt |
| 5.3       | Epic 4 Story 4.5        | Frontend (Summary Wizard)                 | Configure summary options, check UI update    |
| 5.4       | Epic 4 Story 4.5        | Frontend (Summary Wizard)                 | Check loading screen with progress info       |
| 6.1       | Epic 4 Story 4.6        | Frontend (Quiz Wizard)                    | Open quiz wizard, check multi-step flow       |
| 6.2       | Epic 4 Story 4.6        | Frontend (Quiz Wizard)                    | Initiate from document/dashboard, check pre-selection/prompt |
| 6.3       | Epic 4 Story 4.6        | Frontend (Quiz Wizard)                    | Configure quiz options, check UI update       |
| 6.4       | Epic 4 Story 4.6        | Frontend (Quiz Wizard)                    | Check loading screen with progress info       |

## Risks, Assumptions, Open Questions

*   **Risk: AI Hallucinations/Inaccuracies (AI Summary Generation, AI Quiz Generation)**
    *   Mitigation: Robust prompt engineering, basic output validation, UI disclaimer about potential inaccuracies, human review (post-MVP).
*   **Risk: AI API Latency/Rate Limits**
    *   Mitigation: Implement loading spinners and progress indicators, asynchronous processing, consider caching strategies for frequent requests, monitor API usage.
*   **Risk: Cost of AI API Usage**
    *   Mitigation: Monitor API usage closely, implement soft limits for power users (post-MVP), optimize prompts for token efficiency.
*   **Risk: Inability to Parse Complex PDFs**
    *   Mitigation: Utilize robust cloud-based AI service for PDF parsing (e.g., Google Cloud Vision AI), provide clear error messages for unparsable files.
*   **Assumption: Claude AI Model availability and stability.**
    *   Next Step: Continuously monitor API status and have a fallback plan if feasible (e.g., alternative AI provider, manual content creation for critical paths - highly unlikely for MVP).
*   **Question: What specific 'question types' (beyond multiple-choice) will be supported for quizzes in future iterations?**
    *   Next Step: User research and product roadmap planning.

## Test Strategy Summary

*   **Levels of Testing:**
    *   **Unit Tests:** Focus on individual components and functions (e.g., Vercel Functions for AI proxy, frontend components for quiz interface, utility functions for content processing). Framework: Jest.
    *   **Integration Tests:** Verify interactions between components (e.g., Frontend calling Vercel Function, Vercel Function interacting with Claude AI and Supabase).
    *   **End-to-End (E2E) Tests:** Simulate full user flows (e.g., uploading a document, generating a summary, taking a quiz).
*   **Frameworks:**
    *   Jest: For unit and integration testing.
    *   Potentially Playwright or Cypress for E2E testing (to be determined).
*   **Coverage:**
    *   All acceptance criteria for Epic 4 stories must be covered by automated tests.
    *   Emphasis on testing AI error handling scenarios (e.g., insufficient text, AI unable to generate).
    *   Cross-browser testing for the interactive quiz interface and guided wizards.
*   **Edge Cases:**
    *   Test generation with very short/long documents.
    *   Test quiz generation with various length selections, including requests for quizzes longer than content supports.
    *   Test error handling for network interruptions during AI calls.
    *   Test with documents containing complex formatting or images that might challenge PDF parsing.
