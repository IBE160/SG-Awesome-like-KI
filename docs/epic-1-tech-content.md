# AI Study Buddy - Epic 1: Foundation & Core Setup - Technical Content

## Introduction

This document provides the technical content for **Epic 1: Foundation & Core Setup**. It details the technical approach and considerations for each story in this epic.

## Story 1.1: Initialize Project Repository & Basic Structure

*   **Repository:** A new Git repository will be initialized.
*   **Directory Structure:** The initial directory structure will be:
    *   `src/`: For all source code.
    *   `docs/`: For all project documentation.
    *   `tests/`: For all automated tests.
*   **`.gitignore`:** A standard `.gitignore` file for Node.js projects will be used, with the addition of `.env.local` to exclude environment variables.
*   **`README.md`:** The `README.md` file will include the project title, a brief description, and instructions on how to set up and run the project locally.

## Story 1.2: Set Up Next.js Application & Tailwind CSS

*   **Next.js:** The latest stable version of Next.js will be initialized using `npx create-next-app`.
*   **Tailwind CSS:** Tailwind CSS will be integrated into the Next.js application for utility-first styling. The `tailwind.config.js` file will be configured to purge unused styles in production builds.
*   **Home Page:** A basic home page will be created at `src/app/page.tsx` to verify the setup.

## Story 1.3: Initialize Supabase Project & Client Integration

*   **Supabase Project:** A new Supabase project will be created using the Supabase web interface.
*   **Supabase Client:**
    *   `@supabase/supabase-js`: The core Supabase client library will be used for interacting with the Supabase backend.
    *   `@supabase/ssr`: This library will be used for secure, cookie-based session management on the server-side.
*   **Environment Variables:** The Supabase URL and Anon Key will be stored in a `.env.local` file, which will be added to the `.gitignore` to prevent committing secrets.

## Story 1.4: Implement Basic CI/CD Pipeline

*   **CI/CD Platform:** GitHub Actions will be used for Continuous Integration and Continuous Deployment.
*   **Workflow:** A new workflow file will be created at `.github/workflows/ci.yml`.
*   **Triggers:** The workflow will be triggered on every `push` to the `main` branch and on every `pull_request` to the `main` branch.
*   **Jobs:**
    *   **`lint`:** This job will run a linting tool (e.g., ESLint) to check for code quality.
    *   **`test`:** This job will run the unit and integration tests.
    *   **`build`:** This job will build the Next.js application.
    *   **`deploy`:** This job will deploy the application to a Vercel staging environment. This job will only run on pushes to the `main` branch and if all previous jobs have passed.

## Technical Considerations

*   **Devcontainer:** A `devcontainer` configuration will be considered to standardize the development environment for all team members.
*   **Lockfile:** A lockfile (`package-lock.json` or `yarn.lock`) will be used to ensure consistent dependency versions across all environments.
*   **Supabase CLI:** The Supabase CLI will be encouraged for managing local development instances to avoid conflicts.
*   **CI/CD Pipeline:** The CI/CD pipeline will be kept simple for the MVP, with a focus on speed and reliability. Dependency caching will be used to optimize the pipeline's execution time.
