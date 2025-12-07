# Implement Logout API Endpoint

## Description

The application currently lacks a server-side API endpoint for users to securely log out. This prevents proper session termination and impacts the overall authentication flow. During manual verification of the `@ts-ignore` fix, the absence of this functionality was identified as a blocker for complete authentication testing.

This task involves creating a new API route that utilizes Supabase's authentication capabilities to sign out the current user, thereby terminating their session.

## Resolution Plan

1.  **Create a new API route:** Implement a `POST` (or `GET` if state-changing operation is idempotent and safe, but POST is generally preferred for logout for CSRF protection) API route, e.g., `/api/auth/logout`.
2.  **Utilize `createClient` from `src/lib/supabase/server`:** Use the shared Supabase client utility to interact with Supabase Auth.
3.  **Implement `supabase.auth.signOut()`:** Call the Supabase `signOut()` method to invalidate the user's session.
4.  **Handle redirects:** Redirect the user to a login page or home page after successful logout.
5.  **Error handling:** Implement robust error handling for failed logout attempts.
6.  **Add basic tests:** Create a new integration test for the logout API endpoint to verify its functionality.

## Affected Files

*   `src/app/api/auth/logout/route.ts` (NEW)
*   `tests/integration/api/auth/logout/route.test.ts` (NEW)

## References

*   Supabase documentation for `supabase.auth.signOut()`: [https://supabase.com/docs/reference/javascript/auth-signout](https://supabase.com/docs/reference/javascript/auth-signout)
*   Next.js Route Handlers documentation.
