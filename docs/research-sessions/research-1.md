# Technical Research Report: AI Study Buddy

## 1. Executive Summary

The technical research aimed to finalize the technology stack and approach for the "AI Study Buddy" project, focusing on performance, scalability, and constraints such as a 4-week timeline, no budget, and a team with low backend expertise. The conclusion is to proceed with the proposed stack, using **Tailwind CSS** for the UI and **Vercel Functions** for the serverless AI integration. This combination provides the best balance of developer experience, cost-effectiveness, and performance for this specific project.

## 2. Requirements & Constraints Summary

*   **Functional:** Build a web app for uploading study materials (text/PDF) to generate summaries and quizzes.
*   **Performance:** Handle 100 concurrent users; AI generation under 30 seconds.
*   **Constraints:** 4-week timeline, no budget, low backend skills, mobile-responsive.

## 3. Technology Recommendations

*   **Frontend:** Next.js with **Tailwind CSS**.
    *   *Rationale:* Tailwind CSS is a utility-first framework that allows for rapid UI development without writing custom CSS. It's highly customizable and has a strong community, making it a good choice for speed.
*   **Backend (BaaS):** **Supabase**.
    *   *Rationale:* Supabase provides a PostgreSQL database, authentication, and file storage with a generous free tier. Its ease of use is ideal for teams with limited backend experience.
*   **AI Serverless Function:** **Vercel Functions**.
    *   *Rationale:* Vercel offers a seamless, zero-configuration deployment experience for Next.js applications. The developer experience is superior for this stack, which is critical for the short timeline. The free tier is sufficient for the project's initial needs.

## 4. Architecture Decision Record (ADR)

```markdown
# ADR-001: Choice of Serverless Platform for AI Functions

## Status

Accepted

## Context

The project requires a serverless function to handle API calls to a commercial AI service for generating summaries and quizzes. The platform must be easy to use, cost-effective (free tier), and integrate well with a Next.js frontend. The primary options considered were Vercel Functions and AWS Lambda.

## Decision

We will use **Vercel Functions** to host the serverless AI function.

## Consequences

*   **Positive:**
    *   Extremely simple deployment and management, reducing development overhead.
    *   Native integration with the Next.js frontend, improving developer experience.
    *   The free tier is sufficient, aligning with the no-budget constraint.
    *   Reduced complexity compared to setting up AWS Lambda with API Gateway.
*   **Negative:**
    *   Less flexibility and granular control compared to AWS Lambda.
    *   Potential for higher costs than AWS Lambda if the application scales to very high usage beyond the free tier. This is not a concern for the MVP.
*   **Neutral:**
    *   The platform choice does not lock the application into a specific AI provider.
```
