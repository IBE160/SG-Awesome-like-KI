import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Correct Supabase SSR cookies config
async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove: (name: string, options: any) => {
          try { cookieStore.delete({ name, ...options }); } catch {}
        }
      }
    }
  );
}

export async function GET(
  req: NextRequest,
  { params: paramsPromise }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await paramsPromise; // MUST await in Next.js 15/16

    const supabase = await createSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the class belongs to the user
    const { data: cls, error: classError } = await supabase
      .from('classes')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (classError || !cls) {
      return NextResponse.json(
        { error: 'Class not found or unauthorized' },
        { status: 404 }
      );
    }

    // Fetch documents belonging to that class
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('class_id', id);

    if (docError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents }, { status: 200 });

  } catch (err) {
    console.error("GET /api/classes/[id]/documents error:", err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

