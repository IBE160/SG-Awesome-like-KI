import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get('email'));
  const password = String(formData.get('password'));
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookieStore).get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          (await cookieStore).set(name, value, options)
        },
        async remove(name: string, options: CookieOptions) {
          (await cookieStore).set(name, '', options)
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Implement more specific error handling based on Supabase error codes if available
    // For now, a general error message for invalid credentials or locked account
    if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
      return NextResponse.redirect(`${requestUrl.origin}/login?message=Invalid credentials`, {
        status: 301,
      });
    } else if (error.message.includes('temporarily locked')) {
      return NextResponse.redirect(`${requestUrl.origin}/login?message=Account temporarily locked.`, {
        status: 301,
      });
    }
    
    return NextResponse.redirect(`${requestUrl.origin}/login?message=Could not authenticate user`, {
      status: 301,
    });
  }

  // Redirect to home page or dashboard on successful login
  // Supabase auth-helpers will automatically set the session cookie
  return NextResponse.redirect(requestUrl.origin, {
    status: 301,
  });
}
