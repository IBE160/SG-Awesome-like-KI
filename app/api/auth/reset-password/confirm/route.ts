import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { token, password } = await request.json(); // Assuming token is passed, though Supabase might handle it internally via cookie/URL
  const supabase = createRouteHandlerClient({ cookies });

  // Server-side password strength validation (same as client-side for consistency)
  // New password must meet strength requirements (5 letters, 1 number, 1 special symbol).
  const passwordRegex = /^(?=.*[A-Za-z]{5,})(?=.*\d)(?=.*[!@#$%^&*])[\S]{7,}$/; // At least 7 chars total, 5 letters, 1 number, 1 special
  if (!passwordRegex.test(password)) {
    return NextResponse.json({ message: 'Password does not meet strength requirements (min 5 letters, 1 number, 1 special character, and at least 7 characters total).' }, { status: 400 });
  }

  try {
    // Supabase updateUser handles the password update for the currently authenticated user
    // In a reset flow, the user would typically be temporarily authenticated via the reset token
    // The resetPasswordForEmail redirect handles the session, so updateUser should work here.
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password reset confirmation error:', error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password updated successfully.' }, { status: 200 });
  } catch (e) {
    console.error('Unexpected error during password reset confirmation:', e);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
