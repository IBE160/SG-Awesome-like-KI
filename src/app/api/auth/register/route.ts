import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is not configured.');
    return NextResponse.json({ error: 'Supabase URL or Anon Key is not configured.' }, { status: 500 });
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      // @ts-ignore
      cookies: cookies,
    }
  );

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
