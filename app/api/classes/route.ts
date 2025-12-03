import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const cookieStore = cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get: (name) => cookieStore.get(name)?.value,
                set: (name, value, options) => cookieStore.set(name, value, options),
                remove: (name, options) => cookieStore.delete(name, options),
            }
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('classes')
      .insert({ name, user_id: user.id })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: `Supabase error: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Error in /api/classes:', e);
    return NextResponse.json({ message: `An unexpected error occurred: ${e.message}` }, { status: 500 });
  }
}
