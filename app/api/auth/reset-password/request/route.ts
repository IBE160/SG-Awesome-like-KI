import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login/reset-password`,
    });

    if (error) {
      console.error('Password reset request error:', error);
      // Generic error message to prevent email enumeration
      return NextResponse.json({ message: 'If an account with that email exists, you will receive a password reset link.' }, { status: 200 });
    }

    return NextResponse.json({ message: 'If an account with that email exists, you will receive a password reset link.' }, { status: 200 });
  } catch (e) {
    console.error('Unexpected error during password reset request:', e);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
