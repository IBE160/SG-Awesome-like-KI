## Case Title
AI Study Buddy

## Background

Students are often overwhelmed by the sheer volume of information they need to process in a short amount of time. This is a critical and validated market problem, with a vast majority of students experiencing daily stress from information overload (see @docs/research-sessions/research-5.md). This overload is a direct consequence of the educational goal to make students highly employable, which requires a comprehensive knowledge base. The tension between this need for comprehensive knowledge and a student's capacity to process it leads to burnout, loss of motivation, and a diminished sense of self-worth, particularly for neurodiverse students (see @docs/brainstorming-sessions/brainstorming-1.md, @docs/brainstorming-sessions/brainstorming-2.md). This application helps students process large quantities of information such as slides, articles, and texts and compresses it into understandable formats with different learning opportunities.

## Purpose

AI Study Buddy is a simple, clean, and user-friendly web application designed to help overwhelmed students process study materials efficiently. It aims to empower students by transforming dense texts into concise summaries and interactive quizzes, providing an alternative, more engaging, and effective pathway to learning. The goal is to create a more inclusive learning environment that addresses both the "how" of learning and the "how" of assessment, framed as empowerment, not just accommodation (see @docs/brainstorming-sessions/brainstorming-2.md, @docs/brainstorming-sessions/brainstorming-5.md).

## Target Users

The target users are students who feel overwhelmed by traditional, text-heavy study methods and are interested in using AI to study in more effective and personalized ways. Initial brainstorming identified the diverse emotional and practical impacts of information overload across different potential user groups (see @docs/brainstorming-sessions/brainstorming-1.md, @docs/brainstorming-sessions/brainstorming-2.md). Subsequent user research consolidated these findings into three core personas (see @docs/research-sessions/research-4.md):

-   **Persona 1: The Overwhelmed Student (Alex):** A university student with ADHD and/or dyslexia who finds traditional study methods exhausting and demotivating. They need an engaging, interactive tool that breaks down large blocks of text and provides positive reinforcement.
-   **Persona 2: The Ambitious Achiever (Ben):** A highly motivated graduate student aiming for top grades. They feel pressure to learn everything thoroughly and need an efficient way to identify critical information, test their knowledge, and track their progress.
-   **Persona 3: The Time-Strapped Parent (Sarah):** A parent pursuing a professional certification while working full-time. They have very limited and fragmented time for studying and need a mobile-friendly tool that allows for on-the-go learning in short bursts.

## Core Functionality

### Must Have (MVP)

-   **Feature 1: User Registration and Authentication:** Simple and secure email/password authentication using Supabase Auth (see @docs/brainstorming-sessions/brainstorming-4.md).
-   **Feature 2: File Upload and Management:**
    -   Users can upload plain text and PDF files. The system will use a cloud-based AI service for robust PDF parsing to handle complex layouts (see @docs/research-sessions/research-3.3.md).
    -   A "soft delete" (archiving) system will be implemented to prevent accidental data loss (see @docs/brainstorming-sessions/brainstorming-4.md).
-   **Feature 3: AI-Powered Content Generation:**
    -   Generate concise summaries from uploaded material. Users can optionally provide learning goals to ensure summaries are highly relevant (see @docs/brainstorming-sessions/brainstorming-5.md).
    -   Generate multiple-choice quizzes from uploaded material. Users can choose a quiz length ("short" or "long") to tailor the assessment to their needs (see @docs/brainstorming-sessions/brainstorming-5.md).
-   **Feature 4: Hierarchical Content Organization:** A system for users to organize their materials into `classes` and `class_sections` (e.g., topics, modules), where all uploaded and generated content is saved (see @docs/brainstorming-sessions/brainstorming-4.md).
-   **Feature 5: Motivational Feedback:** The quiz results screen will display the user's score, a list of incorrectly answered questions, and a positive, motivational quote to encourage continuous learning (see @docs/brainstorming-sessions/brainstorming-2.md).
-   **Feature 6: Clean and Focused UI:** A simple, uncluttered, and readable interface that adheres to basic accessibility best practices to create an equitable experience for all students (see @docs/brainstorming-sessions/brainstorming-2.md, @docs/brainstorming-sessions/brainstorming-5.md).

### Nice to Have (Optional Extensions)

-   **Feature 7: Personalized Quiz "Workout Plans":** Offer different quiz modes like "daily" vs. "bootcamp" to cater to diverse study habits (see @docs/brainstorming-sessions/brainstorming-3.md).
-   **Feature 8: Progress Charts and Targeted Feedback:** Provide visualizations of user progress and targeted feedback on weak chapters to enhance motivation and guide study efforts (see @docs/brainstorming-sessions/brainstorming-3.md).
-   **Feature 9: Gamification:** Introduce achievements, trophies, or friendly competitions to increase user engagement (see @docs/brainstorming-sessions/brainstorming-3.md).
-   **Feature 10: Support for More File Types:** Add support for Word documents, slides, images, etc.
-   **Feature 11: AI Chat ("Chat with your Documents"):** Leverage `pgvector` in Supabase to build a sophisticated chatbot that can answer questions about the uploaded materials (see @docs/brainstorming-sessions/brainstorming-4.md).
-   **Feature 12: Real-time Features:** Use Supabase's Realtime engine for features like chat or live scoreboards (see @docs/brainstorming-sessions/brainstorming-4.md).

## Data Requirements

The database schema will be implemented in Supabase (PostgreSQL) to support a hierarchical structure and flexible content relationships (see @docs/brainstorming-sessions/brainstorming-4.md, @docs/research-sessions/research-3.1.md):

-   **`users`**: Managed by Supabase Auth.
-   **`classes`**: Represents a class the student is taking (`id`, `name`, `user_id`).
-   **`class_sections`**: Represents a topic or chapter within a class (`id`, `name`, `class_id`).
-   **`study_materials`**: Represents an uploaded file (`id`, `file_name`, `storage_path`, `class_id`, `class_section_id`).
-   **`generated_content`**: Represents a summary, quiz, etc. (`id`, `type`, `content`, `class_id`).
-   **Junction Tables**: `generated_content_materials` and `generated_content_sections` to manage many-to-many relationships.
-   **Row Level Security (RLS)** will be enabled on all user data tables to ensure strict data isolation.

## User Stories

Detailed user stories have been developed for each persona based on their unique journeys (see @docs/research-sessions/research-4.md):

1.  **As Alex (The Overwhelmed Student),** I want to upload a long, dense document and get a clear, concise summary, so that I can quickly grasp the key concepts without feeling intimidated.
2.  **As Ben (The Ambitious Achiever),** I want to be able to provide my specific learning goals before generating a summary, so that I can ensure the output is tailored to my exam objectives.
3.  **As Sarah (The Time-Strapped Parent),** I want to be able to take a quick, short quiz on my phone while waiting for an appointment, so that I can make tangible progress on my studies in short bursts.

## Technology Stack

-   **Frontend**: React with Next.js and **Tailwind CSS** for rapid, utility-first UI development (see @docs/research-sessions/research-1.md).
-   **Backend (BaaS)**: **Supabase** for its managed PostgreSQL database, user authentication, file storage, and auto-generated APIs. We will use the `@supabase/ssr` package for robust cookie-based session management (see @docs/research-sessions/research-3.1.md).
-   **AI Integration**: A serverless function on **Vercel Functions** will handle API calls to an AI model. This provides a secure, scalable, and cost-effective solution with a superior developer experience for the Next.js stack (see @docs/research-sessions/research-1.md).
-   **AI Model**: **Claude (Anthropic)** is the primary choice due to its cost-effective free tier and strong long-context processing capabilities, which are ideal for academic materials (see @docs/research-sessions/research-3.2.md).
-   **PDF Parsing**: A **Cloud-based AI Service** (e.g., Google Cloud Vision AI) will be used for PDF parsing to ensure high-quality text extraction from complex layouts (see @docs/research-sessions/research-3.3.md).

## Project Timeline (4 Weeks - MVP)

-   **Week 1**: Setup and Authentication.
    -   Set up Supabase project (DB, Auth, Storage) and Next.js application.
    -   Define database schema and RLS policies in SQL migration files.
    -   Implement the authentication flow using `@supabase/ssr`.
-   **Week 2**: Core Backend and UI.
    -   Build the UI for file uploading and content organization (classes/sections).
    -   Implement file uploads to Supabase Storage.
    -   Build out server-side data interaction logic (RSCs and Route Handlers).
-   **Week 3**: AI Integration.
    -   Develop and deploy the Vercel serverless function for PDF parsing and AI content generation (summaries, quizzes) using Claude.
    -   Connect the frontend to the AI function.
-   **Week 4**: Finalizing and Testing.
    -   Implement the quiz interface and motivational feedback screen.
    -   Conduct thorough testing of all features, including RLS policies.
    -   Prepare for deployment.

## Technical Constraints

-   Must be a mobile-responsive web application.
-   Authentication will be handled by Supabase Auth with Row Level Security (RLS) enabled on all user data tables for strict data isolation (see @docs/research-sessions/research-3.1.md).
-   File uploads will be managed through Supabase Storage, with a strict file size limit implemented on the frontend to prevent overload (see @docs/brainstorming-sessions/brainstorming-6.md).
-   Must be able to process both Norwegian and English materials.
-   All AI-generated HTML output must be sanitized, and length checks will be implemented on AI responses to handle unpredictable behavior (see @docs/brainstorming-sessions/brainstorming-6.md).

## Success Criteria

### MVP Success Criteria
-   **Criterion 1**: Users can create an account, log in, and manage their profile securely. All their data is protected via RLS.
-   **Criterion 2**: Users can upload a PDF or plain text file and receive a summary or a quiz within 30 seconds.
-   **Criterion 3**: Generated quizzes contain at least 5 relevant, multiple-choice questions based on the provided material.
-   **Criterion 4**: The application can handle at least 100 concurrent users without significant performance degradation.
-   **Criterion 5**: A user testing session with at least 5 students successfully generates a total of at least 10 summaries and 10 quizzes, validating the core functionality (see @docs/brainstorming-sessions/brainstorming-2.md).

### Post-MVP Success Metrics (see @docs/brainstorming-sessions/brainstorming-7.md)
-   **Engagement:** At least 50% of quizzes taken utilize either a 'daily' or 'bootcamp' mode.
-   **Retention:** Students who receive targeted feedback on a weak chapter are 40% more likely to attempt another quiz on that same chapter within 24 hours.
-   **Adoption:** Users who view their progress charts are 20% more likely to complete a quiz session that day.

## Risks and Mitigations (see @docs/brainstorming-sessions/brainstorming-6.md)

| Risk | Impact | Mitigation for MVP |
| :--- | :--- | :--- |
| **Serverless Function Overload** | High | Accept risk for MVP. Implement clear error handling and user feedback. Design for a future asynchronous job system. |
| **Malware in Uploaded Files** | High | Accept risk for MVP. Strictly enforce file extensions on the frontend. |
| **Unpredictable AI Behavior** | Medium | Implement `try...catch` for JSON parsing, sanitize all HTML output, and add length checks on AI responses. Add a clear disclaimer to the UI about potential AI inaccuracies. |
| **File Storage Overload** | Medium | Implement a strict file size limit on the frontend. |
| **AI API Rate Limits / Costs** | Medium | Use Claude's free tier for the MVP. Monitor usage closely and be prepared to implement caching or rate-limiting if necessary. |
| **Downtime in Services** | Medium | Have links to status pages for Supabase/Vercel/Claude. Plan for user communication during outages. |
