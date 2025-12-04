import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
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

  // Check if a session exists (user is authenticated)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return NextResponse.json({ message: 'Failed to update password' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Your password has been reset successfully.' }, { status: 200 });
}
