# Story 2.4: User Profile Management & RLS Enforcement

Status: ready-for-dev

## Story

As a {{role}},
I want {{action}},
so that {{benefit}}.

## Acceptance Criteria

1. **Given** I am logged in, **when** I navigate to my profile settings, **then** I can view and update basic profile information (e.g., name, email - if allowed by Supabase Auth).
2. **And** all my data (including profile) is protected by Row Level Security (RLS).
3. **And** a clear privacy policy is accessible from my profile.
4. **And** automated tests are in place to verify that RLS policies prevent one user from accessing another user's data.

## Tasks / Subtasks

- [ ] **Task 1: Implement Profile Settings UI (AC: All)**
  - [ ] Create a UI page/component for "Profile Settings" accessible after login.
  - [ ] Display user's basic profile information (name, email).
  - [ ] Implement input fields and forms for updating profile information.
  - [ ] Display link to privacy policy.
- [ ] **Task 2: Implement Profile Management API Endpoints (AC: All)**
  - [ ] Create API routes for:
      - `GET /api/profile` (Retrieve user profile)
      - `PUT /api/profile` (Update user profile)
  - [ ] Integrate with Supabase client to fetch and update user data (eg., from `users` table).
  - [ ] Ensure API endpoints respect RLS policies.
- [ ] **Task 3: Implement Supabase RLS Policies (AC: All)**
  - [ ] Define and implement RLS policies on the `users` table to ensure users can only access/modify their own data.
  - [ ] Implement automated tests for RLS policies.
- [ ] **Task 4: Testing (AC: All)**
  - [ ] Write unit tests for UI components and client-side validation.
  - [ ] Write integration tests for profile API endpoints (retrieve, update).
  - [ ] Write RLS integration tests to verify data isolation.
  - [ ] Write end-to-end tests for the full profile management flow (dependent on registration and login).
  - [ ] Manual testing of UI/UX, profile updates, and RLS behavior.



## Dev Notes

- **Relevant Architecture Patterns & Constraints:**
  - Utilize Supabase Auth for user profile management.
  - Implement Row Level Security (RLS) policies on the `users` table.
  - API Endpoints: `GET /api/profile` (retrieve), `PUT /api/profile` (update).
  - Adherence to data privacy regulations (FR1.2).
- **Source Tree Components to Touch:**
  - Frontend: `src/app/profile/page.tsx` (or similar for profile settings UI).
  - Backend API: `src/app/api/profile/route.ts` (or similar for profile management API).
  - Supabase database configuration for RLS.
- **Testing Standards Summary:**
  - Unit tests for UI components and client-side validation.
  - Integration tests for profile API endpoints (retrieve, update).
  - RLS integration tests to verify data isolation.
  - End-to-End tests for profile management flow.
  - Manual testing of UI/UX and RLS behavior.

### Project Structure Notes

- New UI components for profile management should follow existing Next.js page/component structure.
- New API routes should follow existing Next.js API route structure.

### References

- [Source: docs/epics.md#Story-2.4]
- [Source: docs/architecture.md#Database-Schema]
- [Source: docs/architecture.md#Authentication-and-Authorization]
- [Source: docs/PRD.md#FR1.1---User-Authentication]
- [Source: docs/PRD.md#FR1.2---Data-Privacy-Compliance]



## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/2-4-user-profile-management-rls-enforcement.context.xml`

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List


## Requirements Context Summary

### Epic 2: User Onboarding & Authentication
This epic focuses on enabling secure user account creation and management, providing a personalized and protected space for study materials.

### Story 2.4: User Profile Management & RLS Enforcement (FR1.1, FR1.2)

**User Story Statement:**
As a registered user,
I want to manage my basic profile information,
So that my account details are accurate and my data is protected.

**Acceptance Criteria:**
*   **Given** I am logged in
*   **When** I navigate to my profile settings
*   **Then** I can view and update basic profile information (e.g., name, email - if allowed by Supabase Auth).
*   **And** all my data (including profile) is protected by Row Level Security (RLS).
*   **And** a clear privacy policy is accessible from my profile.
*   **And** automated tests are in place to verify that RLS policies prevent one user from accessing another user's data.

## Project Structure Alignment and Lessons Learned

### Learnings from Previous Story (2.3: Password Reset)

**Status:** Ready for Dev

**Actionable Intelligence for Story 2.4 (User Profile Management & RLS Enforcement):**
*   **Reusable Components:** Supabase Auth is central to user management and should be used for profile updates. Existing API route patterns for authentication should be followed.
*   **Architectural Decisions:** RLS is a core part of the architecture for data protection. Ensure RLS policies are rigorously applied and tested for user profile data.
*   **Pending Items from Previous Stories:** The entire user authentication flow (registration, login, password reset) is currently in `ready-for-dev` status, with all tasks still pending.
    *   **Impact on Story 2.4:** While profile management can be implemented, comprehensive end-to-end testing, especially regarding RLS, will depend on the stability and completion of prior authentication stories. A fully functional user authentication is a prerequisite for a user to log in and manage their profile.


**Relevant Architectural Constraints & Patterns:**
*   **Database Schema:** The `users` table will store user profile information and is managed by Supabase Auth.
*   **Authorization:** Row Level Security (RLS) must be enabled on all user data tables to ensure strict data isolation and prevent unauthorized access.
*   **Compliance:** Adherence to student data privacy regulations (FERPA, COPPA) via RLS and clear privacy policy.

