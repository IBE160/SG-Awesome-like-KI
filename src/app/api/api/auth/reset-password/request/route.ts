import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {

  try {

    const requestUrl = new URL(request.url)

    const formData = await request.formData()

    const email = String(formData.get('email'))

    const cookieStore = await cookies() // Await the promise here

    

    const supabase = createServerClient(

      process.env.NEXT_PUBLIC_SUPABASE_URL!,

      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

      {

        cookies: {

          get(name: string) {

            return cookieStore.get(name)?.value

          },

          set(name: string, value: string, options: CookieOptions) {

            try {

              cookieStore.set({ name, value, ...options })

            } catch (error) {

              // The `set` method was called from a Server Component.

            }

          },

          remove(name: string, options: CookieOptions) {

            try {

              cookieStore.set({ name, value: '', ...options })

            } catch (error) {

              // The `remove` method was called from a Server Component.

            }

          },

        },

      }

    )



    const { error } = await supabase.auth.resetPasswordForEmail(email, {

      redirectTo: `${requestUrl.origin}/login/reset-password`,

    })



    if (error) {

      return NextResponse.json({ message: error.message }, { status: 400 });

    }



    return NextResponse.json({ message: 'Check your email for a password reset link, including your spam folder.' }, { status: 200 });

  } catch (error) {

    let errorMessage = 'An unexpected error occurred.';

    if (error instanceof Error) {

      errorMessage = error.message;

    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });

  }

}