# ibe160 - Epic Breakdown

**Author:** BIP
**Date:** fredag 14. november 2025
**Project Level:** Level 2+
**Target Scale:** MVP (initial testers)

---

## Overview

This document provides the complete epic and story breakdown for ibe160, decomposing the requirements from the [PRD](./PRD.md) into implementable stories.

The development of the AI Study Buddy MVP will be organized into five key epics, designed to deliver incremental value and ensure a robust foundation.

*   **Epic 1: Foundation & Core Setup:** Establishes the essential infrastructure, security, and project setup.
*   **Epic 2: User Onboarding & Authentication:** Enables secure user account creation and management.
*   **Epic 3: Content Management & Organization:** Facilitates easy upload, organization, and management of study materials.
*   **Epic 4: AI-Powered Learning Tools:** Delivers the core functionality of summaries and quizzes.
*   **Epic 5: UI, UX, & Accessibility Polish:** Ensures an intuitive, accessible, and enjoyable user experience across all features.

These epics will be tackled in a logical sequence, with Epic 1 providing the groundwork, followed by user-facing features (Epics 2, 3, 4), and Epic 5 being integrated throughout to maintain a high standard of quality and usability.

---

## Epic 1: Foundation & Core Setup

Establish the foundational infrastructure, security, and project setup required to build, test, and deploy the application. This enables all future development.

### Story 1.1: Initialize Project Repository & Basic Structure (Supports FR5.1, FR5.2, FR5.3)

As a Developer,
I want to set up the project repository with a clear structure and initial configuration,
So that all team members can easily access, contribute to, and understand the codebase.

**Acceptance Criteria:**

**Given** a new project
**When** the repository is initialized
**Then** it contains a `src` directory for source code, a `docs` directory for documentation, and a `tests` directory for automated tests.
**And** a `.gitignore` file is configured to exclude unnecessary files.
**And** a `README.md` file provides basic project information and setup instructions.

**Prerequisites:** None.

**Technical Notes:** Use `git init` and standard project scaffolding. **Consider adding a `devcontainer` configuration to standardize the development environment.**

### Story 1.2: Set Up Next.js Application & Tailwind CSS (Supports FR5.1, FR5.2, FR5.3)

As a Developer,
I want to initialize the Next.js application with Tailwind CSS,
So that the frontend development can begin with a modern, responsive UI framework.

**Acceptance Criteria:**

**Given** the project repository is initialized
**When** the Next.js application is set up
**Then** it uses the latest stable version of Next.js.
**And** Tailwind CSS is correctly configured for styling.
**And** a basic home page is rendered.

**Prerequisites:** Story 1.1.

**Technical Notes:** Use `npx create-next-app` and follow Tailwind CSS integration guides. **Ensure a lockfile (`package-lock.json` or `yarn.lock`) is used to maintain consistent dependency versions.**

### Story 1.3: Initialize Supabase Project & Client Integration (Supports FR1.1, FR1.2, FR2.1)

As a Developer,
I want to set up a new Supabase project and integrate the Supabase client into the Next.js application,
So that we have a backend-as-a-service for database, authentication, and storage.

**Acceptance Criteria:**

**Given** the Next.js application is set up
**When** the Supabase project is initialized
**Then** a new Supabase project is created.
**And** the Supabase client (`@supabase/supabase-js` and `@supabase/ssr`) is configured in the Next.js application.
**And** environment variables for Supabase URL and Anon Key are securely managed.
**And** the `.env.local` file is included in `.gitignore`.

**Prerequisites:** Story 1.2.

**Technical Notes:** Use Supabase CLI or web interface for project creation. **Encourage the use of the Supabase CLI for managing local development instances to avoid conflicts.**

### Story 1.4: Implement Basic CI/CD Pipeline (Supports NFRs)

As a Developer,
I want to set up a basic Continuous Integration/Continuous Deployment (CI/CD) pipeline,
So that code changes are automatically tested and deployed, ensuring quality and rapid iteration.

**Acceptance Criteria:**

**Given** the Next.js application and Supabase integration are set up
**When** a code change is pushed to the main branch
**Then** automated tests (e.g., linting, basic unit tests) are run.
**And** the application is automatically deployed to a staging environment (e.g., Vercel).

**Prerequisites:** Story 1.3.

**Technical Notes:** Use GitHub Actions or Vercel's built-in CI/CD. **Keep the pipeline simple for the MVP, cache dependencies to optimize for speed, and enforce a strict no-flaky-tests policy.**

---

## Epic 2: User Onboarding & Authentication

Allow users to securely create and manage their accounts, providing a personalized and protected space for their study materials.

### Story 2.1: User Registration [FR1.1]

As a new user,
I want to create an account with my email and a secure password,
So that I can access the AI Study Buddy's features.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I enter a unique email and a password meeting the requirements (5 letters, 1 number, 1 special symbol)
**Then** my account is successfully created, and I am logged in.
**And** if I enter an email already in use, I receive a message and an option to reset my password.

**Prerequisites:** Epic 1 (Foundation & Core Setup).

**Technical Notes:** Utilize Supabase Auth for email/password registration. Implement client-side and server-side validation for password strength. **Consider adding a CAPTCHA (e.g., hCaptcha) to prevent bot registrations and a check against a list of common passwords.**

### Story 2.2: User Login & Session Management [FR1.1]

As a registered user,
I want to log in to my account,
So that I can access my personalized study materials and generated content.

**Acceptance Criteria:**

**Given** I have an existing account
**When** I enter my correct email and password
**Then** I am successfully logged in and my session is managed securely.
**And** if I enter incorrect credentials, I receive an error message.
**And** if I exceed 5 failed login attempts, my account is temporarily locked.
**And** when my account is temporarily locked, the system shall display a clear, supportive message explaining what happened and provide an easy path to reset the password.

**Prerequisites:** Epic 1 (Foundation & Core Setup), Story 2.1.

**Technical Notes:** Utilize Supabase Auth for login and `@supabase/ssr` for secure cookie-based session management. **Ensure the library is configured correctly to use secure, HTTP-only cookies to mitigate session hijacking risks.**

### Story 2.3: Password Reset [FR1.1]

As a registered user,
I want to reset my password if I forget it,
So that I can regain access to my account.

**Acceptance Criteria:**

**Given** I am on the login page and click "Forgot Password"
**When** I enter my registered email address
**Then** I receive an email with a secure link to reset my password.
**And** the UI displays a message instructing me to check my spam folder.
**And** the reset link is valid for a limited time (e.g., 1 hour).
**And** I can set a new password meeting the strength requirements.

**Prerequisites:** Epic 1 (Foundation & Core Setup), Story 2.1.

**Technical Notes:** Utilize Supabase Auth's password reset functionality.

### Story 2.4: User Profile Management & RLS Enforcement [FR1.1, FR1.2]

As a registered user,
I want to manage my basic profile information,
So that my account details are accurate and my data is protected.

**Acceptance Criteria:**

**Given** I am logged in
**When** I navigate to my profile settings
**Then** I can view and update basic profile information (e.g., name, email - if allowed by Supabase Auth).
**And** all my data (including profile) is protected by Row Level Security (RLS).
**And** a clear privacy policy is accessible from my profile.
**And** automated tests are in place to verify that RLS policies prevent one user from accessing another user's data.

**Prerequisites:** Epic 1 (Foundation & Core Setup), Story 2.2.

**Technical Notes:** Implement RLS policies in Supabase for user data tables.

---

## Epic 3: Content Management & Organization

Empower users to easily upload, organize, and manage their study materials, creating a structured and clutter-free learning environment.

### Story 3.1: Document Upload (Text & PDF) [FR2.1]

As a user,
I want to upload my study materials in plain text or PDF format,
So that I can use them to generate summaries and quizzes.

**Acceptance Criteria:**

**Given** I am logged in and on the document upload page
**When** I select a `.txt` or `.pdf` file and initiate upload
**Then** the file is successfully uploaded and stored securely.
**And** if I upload an unsupported file type, I receive an error message: 'This file type is not supported. Please try another file.'
**And** if I upload a password-protected or corrupted PDF, I receive an error: 'This file is password-protected or corrupted and cannot be processed.'
**And** if the internet connection is interrupted during upload, the system shall display an error message and allow the user to retry the upload.
**And** the system enforces a strict file size limit of 10MB.

**Prerequisites:** Epic 2 (User Onboarding & Authentication).

**Technical Notes:** Utilize Supabase Storage for file storage. Implement client-side and server-side validation for file type and size. Integrate with a cloud-based AI service for PDF parsing.

### Story 3.2: Create & Manage Classes [FR2.2]

As a user,
I want to create and manage "classes" to organize my study materials,
So that I can easily group related content.

**Acceptance Criteria:**

**Given** I am logged in and on my content management page
**When** I create a new class
**Then** the class is added to my list of classes.
**And** I can rename and delete existing classes.
**And** when I delete a class, I receive a confirmation dialog stating that all associated content will also be deleted.
**And** class names shall be limited to 25 alphanumeric characters.
**And** if a user attempts to create a class with a name that already exists, the system shall display an error message: 'A class with this name already exists. Please choose a different name.'

**Prerequisites:** Epic 2 (User Onboarding & Authentication).

**Technical Notes:** Design a database schema in Supabase (PostgreSQL) to support class creation and management, ensuring RLS is applied.

### Story 3.3: Create & Manage Class Sections [FR2.2]

As a user,
I want to create and manage "class sections" within my classes,
So that I can further organize my study materials by topic or module.

**Acceptance Criteria:**

**Given** I have created a class
**When** I create a new section within that class
**Then** the section is added to my class.
**And** I can rename and delete existing sections.
**And** when I delete a section, I receive a confirmation dialog stating that all associated content will also be deleted.
**And** section names shall be limited to 25 alphanumeric characters.
**And** if a user attempts to create a section with a name that already exists within the same class, the system shall display an error message: 'A section with this name already exists in this class. Please choose a different name.'

### Story 3.4: Assign & View Content [FR2.2, FR2.3]

As a user,
I want to assign uploaded documents and generated content to specific classes and sections,
So that I can easily find and access my study materials.

**Acceptance Criteria:**

**Given** I have uploaded documents and created classes/sections
**When** I assign a document or generated content to a class/section
**Then** it appears within that class/section.
**And** I can view all documents and generated content organized by class and section.
**And** when a document is moved, all its associated generated content (summaries, quizzes) shall automatically move with it.
**And** when viewing a class/section, generated content (summaries, quizzes) is clearly linked to and displayed alongside its source document.

**Prerequisites:** Story 3.1, Story 3.3.

**Technical Notes:** Implement database relationships between `study_materials`, `generated_content`, `classes`, and `class_sections`.

### Story 3.5: Post-Upload Actions

As a user,
I want to have the option to generate a summary or quiz immediately after uploading a document,
So that I can quickly get value from the tool without having to organize my content first.

**Acceptance Criteria:**

**Given** a document has been successfully uploaded
**When** the upload is complete
**Then** the UI presents immediate options to "Generate Summary" or "Generate Quiz".
**And** generated content from unorganized documents shall be temporarily stored in an 'Unorganized' area, accessible to the user for later assignment.

**Prerequisites:** Story 3.1, Story 3.2.

**Technical Notes:** This will require a flexible UI flow that can handle content generation for both organized and unorganized documents.

---

## Epic 4: AI-Powered Learning Tools

Deliver the core "magic" of the product by transforming study materials into concise summaries and interactive quizzes, making learning more efficient and engaging.

### Story 4.1: AI Summary Generation [FR3.1]

As a user,
I want to generate concise summaries from my uploaded study materials,
So that I can quickly grasp the key concepts.

**Acceptance Criteria:**

**Given** I have an uploaded document
**When** I request a summary
**Then** the AI generates a concise summary of the document's key points within 30 seconds.
**And** if the AI is unable to generate a summary (e.g., due to insufficient text or too many images), the system displays an informative error message.

**Prerequisites:** Epic 3 (Content Management & Organization).

**Technical Notes:** Integrate with Claude AI via Vercel Functions. Implement robust error handling for AI API calls. **Mitigate AI risks by: 1) using robust prompt engineering, 2) performing basic output validation, 3) displaying a UI disclaimer about potential inaccuracies, 4) monitoring API usage, and 5) providing clear UI feedback (e.g., a loading spinner) during generation.**

### Story 4.2: AI Quiz Generation (Selectable Length) [FR3.2]

As a user,
I want to generate multiple-choice quizzes from my uploaded study materials with a selectable length,
So that I can test my knowledge effectively.

**Acceptance Criteria:**

**Given** I have an uploaded document
**When** I request a quiz and select a desired length (short, medium, long)
**Then** the AI generates a relevant multiple-choice quiz within 30 seconds.
**And** if the AI is unable to generate a quiz, the system displays an informative error message.
**And** if I request a longer quiz than the content can support, the system informs me and generates the longest possible quiz.

**Prerequisites:** Epic 3 (Content Management & Organization).

**Technical Notes:** Integrate with Claude AI via Vercel Functions. Implement robust error handling for AI API calls. **Mitigate AI risks by: 1) using robust prompt engineering, 2) performing basic output validation, 3) displaying a UI disclaimer about potential inaccuracies, 4) monitoring API usage, and 5) providing clear UI feedback (e.g., a loading spinner) during generation.**

### Story 4.3: Interactive Quiz Interface [FR4.1]

As a user,
I want to take generated quizzes through an interactive interface,
So that I can actively test my understanding.

**Acceptance Criteria:**

**Given** I have a generated quiz
**When** I start the quiz
**Then** I can select answers for each question.
**And** the system provides immediate feedback on whether my answer is correct or incorrect.

**Prerequisites:** Story 4.2.

**Technical Notes:** Design a clean and accessible UI for quiz taking.

### Story 4.4: Motivational Feedback & Explanations [FR4.2]

As a user,
I want to receive motivational feedback and explanations for quiz answers,
So that I can learn from my mistakes and build confidence.

**Acceptance Criteria:**

**Given** I have completed a quiz
**When** I review my results
**Then** I receive a score and positive reinforcement.
**And** for each question, the correct answer and an explanation are displayed.
**And** if the AI cannot provide an explanation for a correct answer, the system explicitly states this.

**Prerequisites:** Story 4.3.

**Technical Notes:** Integrate AI-generated explanations into the quiz review UI. **The AI prompt should be engineered to generate feedback in a supportive, encouraging, and educational tone, acting as a helpful tutor rather than a simple grader.**

### Story 4.5: Guided Summary Generation Wizard

As a user,
I want to be guided through the process of generating a summary,
So that I can easily configure and create a summary from any context.

**Acceptance Criteria:**

**Given** I am on a document view or the main dashboard
**When** I initiate "Generate Summary"
**Then** a multi-step wizard opens.
**And** if initiated from a document, that document is pre-selected.
**And** if initiated from the dashboard, I am prompted to select a document.
**And** I can configure options for the summary (e.g., "Paragraph" vs. "Bullet Points").
**And** I see a loading screen with progress information during generation.

**Prerequisites:** Epic 3.

**Technical Notes:** This story covers the frontend workflow for summary generation.

### Story 4.6: Guided Quiz Generation Wizard

As a user,
I want to be guided through the process of generating a quiz,
So that I can easily customize and create a quiz from any context.

**Acceptance Criteria:**

**Given** I am on a document view or the main dashboard
**When** I initiate "Generate Quiz"
**Then** a multi-step wizard opens.
**And** if initiated from a document, that document is pre-selected.
**And** if initiated from the dashboard, I am prompted to select one or more documents.
**And** I can configure options for the quiz (e.g., length, question types).
**And** I see a loading screen with progress information during generation.

**Prerequisites:** Epic 3.

**Technical Notes:** This story covers the frontend workflow for quiz generation.

---

## Epic 5: Core Experience & UI Implementation

Ensure the application is intuitive, accessible, and enjoyable to use, fulfilling the promise of a clean, supportive, and frustration-free experience.

### Story 5.1: Implement Core UI Design System

As a Developer,
I want to implement the core UI design system based on Tailwind CSS and our UX principles,
So that all user-facing components have a consistent, clean, and friendly aesthetic.

**Acceptance Criteria:**

**Given** the Next.js application is set up with shadcn/ui
**When** core UI components (e.g., buttons, forms, layout) are implemented
**Then** they adhere to the principles of "Guided Minimalism" (abundant white space, single-column focus, clear CTAs).
**And** they are styled consistently using the "Calm & Focused" color palette.
**And** shadcn/ui components are themed to match the design specification.

**Prerequisites:** Epic 1 (Foundation & Core Setup).

**Technical Notes:** Create a component library for reusable UI elements.

### Story 5.2: Ensure Mobile Responsiveness [FR5.2]

As a user,
I want the application to be fully functional and visually appealing on various screen sizes (mobile, tablet, desktop),
So that I can access my study materials and tools from any device.

**Acceptance Criteria:**

**Given** any user-facing screen
**When** viewed on a mobile phone, tablet, or desktop browser
**Then** the layout adjusts gracefully, and all interactive elements remain accessible and usable.
**And** the application functions correctly on the latest stable versions of Chrome, Edge, and Safari.

**Prerequisites:** Epic 1 (Foundation & Core Setup).

**Technical Notes:** Utilize Tailwind CSS responsive utilities. Test across various device emulators and actual devices.

### Story 5.3: Implement WCAG AA & Screen Reader Support [FR5.3]

As a user with disabilities,
I want to use the application effectively with assistive technologies like screen readers,
So that I can have an inclusive and equitable learning experience.

**Acceptance Criteria:**

**Given** any user-facing screen
**When** navigated using a screen reader (e.g., NVDA, VoiceOver)
**Then** all interactive elements are correctly identified and labeled.
**And** all content is perceivable and understandable.
**And** the application meets WCAG 2.1 Level AA compliance.
**And** when an asynchronous action completes (e.g., a summary is generated), the system shall use ARIA live regions to announce the state change to screen reader users.

**Prerequisites:** Epic 1 (Foundation & Core Setup).

**Technical Notes:** Use semantic HTML, ARIA attributes where necessary. Conduct accessibility audits.

### Story 5.4: Implement Reduced Motion Options [FR5.3]

As a user sensitive to motion,
I want to minimize animations and transitions in the application,
So that I can use the tool comfortably without discomfort.

**Acceptance Criteria:**

**Given** I have enabled a "reduced motion" setting in my operating system or browser
**When** I interact with the application
**Then** all non-essential animations and transitions are either removed or significantly reduced.

**Prerequisites:** Epic 1 (Foundation & Core Setup).

**Technical Notes:** Utilize CSS media queries (`@media (prefers-reduced-motion)`) and JavaScript to control animations.

### Story 5.5: Build Custom UX Components

As a Developer,
I want to build the high-effort custom components defined in the UX specification,
So that the core user workflows are intuitive and engaging.

**Acceptance Criteria:**

**Given** the core UI foundation is in place
**When** the custom components are built
**Then** the `Document Preview Component` is implemented with all its specified states and actions.
**And** the `Drag-and-Drop Upload Area` is fully functional and accessible.
**And** the `Loading Screen/Modal for Generation` provides clear user feedback.
**And** the `Quiz Interface` and `Summary View` components are implemented as designed.

**Prerequisites:** Story 5.1.

**Technical Notes:** Build these as reusable React components, ensuring they meet all behavior, state, and accessibility requirements from the UX specification.

---

_For implementation: Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown._
