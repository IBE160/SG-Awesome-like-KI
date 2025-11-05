# Brainstorming Session: Technical Approaches for "AI Study Buddy"

**Date:** 2025-11-05
**Facilitator:** Mary, Business Analyst
**Participant:** BIP

This document contains the core technical design decisions and the results of a structured brainstorming session for the "AI Study Buddy" application.

## 1. Core Technical Design Decisions

This section captures the foundational architectural and data model decisions for the MVP.

### Authentication
- **Method:** The MVP will use email and password authentication only. Social logins will not be implemented at this stage.
- **Service:** Supabase Auth will be used to handle all user registration and authentication.

### File Upload Flow
The user interface and experience for uploading files will follow these steps:
1.  The user clicks a button labeled "Select your file".
2.  The local file browser opens for file selection.
3.  After a file is selected, its name is displayed in the UI for confirmation.
4.  The user must click a separate "Upload" button to initiate the upload to Supabase Storage.

### AI Content Generation Trigger
- **Mechanism:** A **Direct HTTPS Trigger** will be used.
- **Workflow:**
    1. After a file is successfully uploaded to Supabase Storage, the Next.js frontend will receive the file's URL.
    2. The frontend will then make a secure HTTPS call to a dedicated serverless function.
    3. The request will include the user's JWT for authentication and the URL of the file to be processed.
- **Rationale:** This is the most secure and straightforward approach for the MVP, aligning with the goal of providing a result to the user within 30 seconds.

### Database Schema
The following data model will be implemented in Supabase (PostgreSQL) to support a hierarchical structure and flexible content relationships.

- **`classes`**: Represents a class the student is taking.
  - `id`, `name`, `user_id` (links to user)

- **`class_sections`**: Represents a topic, chapter, or week within a class.
  - `id`, `name`, `class_id` (links to `classes`)

- **`study_materials`**: Represents an uploaded file.
  - `id`, `file_name`, `storage_path`, `class_id` (Required), `class_section_id` (Optional)

- **`generated_content`**: Represents a summary, quiz, etc.
  - `id`, `type`, `content`, `class_id` (Required)

- **Junction Tables (for Many-to-Many Relationships):**
  - **`generated_content_materials`**: Links generated content to the multiple source study materials it was based on.
    - `generated_content_id`, `study_material_id`
  - **`generated_content_sections`**: Links generated content to the multiple class sections it covers.
    - `generated_content_id`, `class_section_id`

---

## 2. Structured Brainstorming Session

**Methodology:** Progressive Flow (What If Scenarios → SWOT Analysis → Impact/Effort Matrix)

### 2.1. "What If" Scenarios

This technique was used to explore potential challenges, edge cases, and hidden requirements.

#### Key Scenarios & Solutions

| Scenario | Solution |
| :--- | :--- |
| **What if the AI service is unavailable?** | Inform the user of the temporary outage and suggest they review already-generated content. |
| **What if the AI returns an unsuitable (irrelevant, too long/short) response?** | - **Proactive:** Allow users to provide context (class descriptions, topics, past exams) to improve prompt quality.<br>- **Reactive:** Implement heuristic checks (e.g., length comparison) and an AI self-correction/validation step. |
| **What if a user uploads a PDF with a complex layout (columns, tables)?** | Implement a "pre-cleansing" step using a free, low-maintenance, open-source library (e.g., `pdfminer.six`) to parse and reformat the text before sending it to the AI. |
| **What if a user accidentally deletes important data?** | - **UI Safeguards:** Use a two-step deletion process with a confirmation modal and a prominent red button.<br>- **Backend Architecture:** Implement a "soft delete" (archiving) system by marking items as `is_archived` instead of permanently deleting them from the database. |

### 2.2. Technical SWOT Analysis

An analysis of the chosen tech stack (Next.js, Supabase, Serverless Functions).

#### Strengths
- **Rapid Development:** Supabase as a BaaS and Next.js as a full-stack framework accelerate MVP creation.
- **Scalability & Cost-Effectiveness:** Serverless architecture and generous Supabase free tiers allow the app to scale efficiently.
- **Developer Experience:** Large ecosystems for React/Next.js and simple client libraries for Supabase.
- **Secure by Design:** Managed authentication (Supabase Auth) and separation of API keys in serverless functions.

#### Weaknesses
- **Vendor Lock-in:** High effort to migrate away from the Supabase platform in the future.
- **Serverless "Cold Starts":** Potential for initial delays in function execution, which could impact user experience.
- **Limited Database Control:** Less control over database configuration compared to a self-hosted solution.
- **Reliance on JavaScript/TypeScript:** The stack is heavily JS-focused, though serverless functions offer language flexibility (e.g., Python).

#### Opportunities
- **Real-time Features:** Leverage Supabase's built-in Realtime engine for chat, live scoreboards, etc.
- **Advanced AI Chatbot:** Use the `pgvector` extension in Supabase to build a sophisticated "chat with your documents" feature (RAG).
- **Enhanced Content Sharing & SEO:** Utilize Next.js's Server-Side Rendering (SSR) to create shareable, SEO-friendly pages for quizzes and summaries.
- **Personalized Learning Dashboards:** Combine the flexible database with a powerful frontend to create rich data visualizations.

#### Threats
- **AI Service Costs & Reliability:** The project is dependent on third-party AI providers' pricing, uptime, and model stability.
- **Evolving AI and Data Privacy Landscape:** Risks associated with copyright, data privacy (GDPR), and changing regulations.
- **Rapidly Increasing Competition:** The "AI for Education" space is highly active, requiring constant innovation.
- **Dependency on Third-Party Infrastructure:** The application's stability is tied to the uptime and security of Supabase and the serverless provider.

### 2.3. Impact/Effort Matrix & Action Plan

This matrix prioritized the most critical items discussed, leading to a clear action plan.

| Item | Impact | Effort | Quadrant | Action Plan |
| :--- | :--- | :--- | :--- | :--- |
| **Mitigating AI Inaccuracy** | High | Low | **Quick Win** | **Do First:** Add a clear disclaimer to the UI about potential AI inaccuracies. |
| **Contextual AI (Class Descriptions)** | High | Medium | **Major Project** | **Top Priority:** Begin development. This is essential for the core value proposition. |
| **Handling Complex File Formats** | High | High | **Major Project** | **Plan Carefully:** Research and test the chosen free parsing library against real-world documents to scope the effort. |

---
**Session Outcome:** A clear, prioritized technical roadmap focusing on delivering core value while mitigating key risks for the MVP.