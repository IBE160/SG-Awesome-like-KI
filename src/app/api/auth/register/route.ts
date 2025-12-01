import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase URL or Anon Key is not configured.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Attempt to sign up the user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // Supabase error handling: e.g., "User already registered"
    if (error.message.includes('already registered')) {
        return NextResponse.json({ error: 'Email already in use. Please try to log in or reset your password.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }

  // On successful signup, Supabase typically sends a verification email.
  // The 'data' object contains user information, but we might not want to send all of it to the client.
  return NextResponse.json({ message: 'Registration successful! Please check your email for a confirmation link.', user: data.user?.id }, { status: 200 });
}
