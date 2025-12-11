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

// -------------------- POST /api/unorganized-content/[content_id]/assign --------------------
// This endpoint assigns unorganized generated content to a specific class and/or section.
export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ content_id: string }> }) {
  try {
    const { content_id } = await paramsPromise;
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { class_id, class_section_id } = await req.json();

    if (!class_id && !class_section_id) {
      return NextResponse.json({ error: 'Missing class_id or class_section_id for assignment.' }, { status: 400 });
    }

    // Verify ownership of the generated content
    const { data: generatedContent, error: gcError } = await supabase
      .from('generated_content')
      .select('id, user_id')
      .eq('id', content_id)
      .eq('user_id', user.id)
      .single();

    if (!generatedContent || gcError) {
      return NextResponse.json({ error: 'Generated content not found or unauthorized.' }, { status: 404 });
    }

    // Optional: Verify ownership of class_id and class_section_id if provided
    if (class_id) {
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, user_id')
        .eq('id', class_id)
        .eq('user_id', user.id)
        .single();
      if (!classData || classError) {
        return NextResponse.json({ error: 'Class not found or unauthorized.' }, { status: 404 });
      }
    }

    if (class_section_id) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('class_sections')
        .select(`
            id,
            class_id,
            classes (
                user_id
            )
        `)
        .eq('id', class_section_id)
        .single();

      if (sectionError || !sectionData || sectionData.classes?.[0]?.user_id !== user.id) {
        return NextResponse.json({ error: 'Section not found or unauthorized.' }, { status: 404 });
      }
      // Also verify that the section belongs to the provided class_id, if a class_id is provided
      if (class_id && sectionData.class_id !== class_id) {
        return NextResponse.json({ error: 'Section does not belong to the specified class.' }, { status: 400 });
      }
    }

    // Update the generated content with assignment
    const { data: updatedContent, error: updateError } = await supabase
      .from('generated_content')
      .update({
        class_id: class_id || null,
        class_section_id: class_section_id || null,
      })
      .eq('id', content_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error assigning generated content:', updateError);
      return NextResponse.json({ error: 'Failed to assign generated content.' }, { status: 500 });
    }

    return NextResponse.json({ updatedContent }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/unorganized-content/[content_id]/assign:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
