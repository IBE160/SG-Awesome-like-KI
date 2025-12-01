# Story 4.5: Guided Summary Generation Wizard

Status: ready-for-dev

## Story

As a user,
I want to be guided through the process of generating a summary,
so that I can easily configure and create a summary from any context.

## Acceptance Criteria

1.  **Given** I am on a document view or the main dashboard, **when** I initiate "Generate Summary", **then** a multi-step wizard opens.
2.  **And** if initiated from a document, that document is pre-selected.
3.  **And** if initiated from the dashboard, I am prompted to select a document.
4.  **And** I can configure options for the summary (e.g., "Paragraph" vs. "Bullet Points").
5.  **And** I see a loading screen with progress information during generation.

## Tasks / Subtasks

- [ ] Design and implement the multi-step wizard UI (AC: #1)
  - [ ] Define wizard steps and navigation logic.
  - [ ] Implement component for wizard container.
- [ ] Implement document selection/pre-selection logic (AC: #2, #3)
  - [ ] Handle initiation from document view (pre-select).
  - [ ] Handle initiation from dashboard (prompt for selection).
  - [ ] Integrate with existing document listing/selection functionality.
- [ ] Implement summary options configuration (AC: #4)
  - [ ] Design UI for summary format options (paragraph, bullet points).
  - [ ] Implement state management for selected options.
- [ ] Integrate loading screen with progress information (AC: #5)
  - [ ] Display loading state during summary generation.
  - [ ] Show progress updates if available from AI generation API.
- [ ] Connect wizard to AI Summary Generation API
  - [ ] Call `POST /api/generate` with summary options.
  - [ ] Handle API response and errors.
- [ ] Testing
  - [ ] Write unit tests for wizard components and logic.
  - [ ] Write integration tests for API calls and UI updates.
  - [ ] Perform manual E2E testing of the wizard flow.

## Dev Notes

-   **Relevant architecture patterns and constraints**: Build as reusable React components. The wizard should follow the existing UI design system (Tailwind CSS, clean/intuitive aesthetic). Integrate with the Vercel Function for AI Summary Generation (`POST /api/generate`). Error handling for API calls should be robust.
-   **Source tree components to touch**: `src/app/`, `src/components/`, `src/app/api/generate/route.ts` (if modifying API for new options), potentially a new `src/lib/summary-generator.ts` for frontend logic.
-   **Testing standards summary**: Unit tests for components, integration tests for the full wizard flow and API interaction, manual E2E testing for UX and functionality.

### Project Structure Notes

-   Alignment with unified project structure (paths, modules, naming)
-   Detected conflicts or variances (with rationale)

### References

- [Source: docs/epics.md#Story 4.5: Guided Summary Generation Wizard]
- [Source: docs/PRD.md]
- [Source: docs/architecture.md]
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md]

## Dev Agent Record

### Context Reference

- C:\Hannah\SG-Awesome-like-KI\docs\sprint-artifacts/4-5-guided-summary-generation-wizard.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
