import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ---------- CREATE SUPABASE CLIENT ----------
async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: any) {
          try { cookieStore.delete({ name, ...options }); } catch {}
        }
      }
    }
  );
}

// -------------------- GET /api/unorganized-content --------------------
// This endpoint retrieves all generated content that is not assigned to a class or section.
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: unorganizedContent, error } = await supabase
      .from('generated_content')
      .select(`
        id,
        type,
        content,
        study_material_id,
        study_materials (
          original_name
        )
      `)
      .is('class_id', null)
      .is('class_section_id', null)
      .eq('user_id', user.id); // Ensure ownership

    if (error) {
      console.error('Error fetching unorganized content:', error);
      return NextResponse.json({ error: 'Failed to retrieve unorganized content.' }, { status: 500 });
    }

    return NextResponse.json({ unorganizedContent }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/unorganized-content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
