import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    if (error.status === 409) { // HTTP 409 Conflict for existing user
      return NextResponse.json({ error: 'Email already in use. Please try to log in or reset your password.' }, { status: 409 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }

  return NextResponse.json({
    message: 'Registration successful! Please check your email for a confirmation link.',
    user: data.user?.id,
  }, { status: 200 });
}
