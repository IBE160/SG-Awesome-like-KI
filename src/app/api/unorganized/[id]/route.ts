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
    // Delete the unorganized material
    const { error: materialError } = await supabase
      .from('unorganized_materials')
      .delete()
      .eq('id', id);

    if (materialError) {
      console.error('Error deleting unorganized material:', materialError);
      return NextResponse.json({ error: materialError.message }, { status: 500 });
    }

    // Optionally, delete associated generated content (summaries, quizzes)
    // This assumes a foreign key constraint with CASCADE DELETE or we explicitly delete them here.
    // If not, we would need to add explicit deletion queries here.

    return NextResponse.json({ message: 'Material deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Server error deleting unorganized material:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
