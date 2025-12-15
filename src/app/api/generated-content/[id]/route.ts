import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Await params here
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove: (name: string, options: CookieOptions) => {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  try {
    // Delete the generated content
    const { error: contentError } = await supabase
      .from('generated_content') // Assuming 'generated_content' is the table name
      .delete()
      .eq('id', id);

    if (contentError) {
      console.error('Error deleting generated content:', contentError);
      return NextResponse.json({ error: contentError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Generated content deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Server error deleting generated content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
