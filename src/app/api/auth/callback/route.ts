import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Using createServerClient and CookieOptions

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) { // Using async/await workaround
            return (await cookieStore).get(name)?.value
          },
          async set(name: string, value: string, options: CookieOptions) { // Using async/await workaround
            (await cookieStore).set(name, value, options)
          },
          async remove(name: string, options: CookieOptions) { // Using async/await workaround
            (await cookieStore).set(name, '', options)
          },
        },
      }
    );
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  // For now, let's redirect to the main login page.
  return NextResponse.redirect(requestUrl.origin + '/login'); // Redirect to login page after callback
}
