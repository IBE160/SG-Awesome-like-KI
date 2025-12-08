import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {

  try {

    const requestUrl = new URL(request.url)

    const formData = await request.formData()

    const email = String(formData.get('email'))

        const supabase = await createClient()


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