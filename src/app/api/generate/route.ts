import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs for placeholder content

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

// -------------------- POST /api/generate --------------------
// This endpoint simulates content generation and stores it in generated_content table.
// It supports both 'summary' and 'quiz' types.
// For unorganized content, class_id and class_section_id will be NULL.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { study_material_id, type, options } = await req.json();

    if (!study_material_id || !type) {
      return NextResponse.json({ error: 'Missing study_material_id or type' }, { status: 400 });
    }

    // Basic validation for type
    if (type !== 'summary' && type !== 'quiz') {
      return NextResponse.json({ error: 'Invalid generation type. Must be "summary" or "quiz".' }, { status: 400 });
    }

    // Verify ownership of the study material
    const { data: studyMaterial, error: smError } = await supabase
      .from('study_materials')
      .select('id, user_id, original_name')
      .eq('id', study_material_id)
      .eq('user_id', user.id)
      .single();

    if (!studyMaterial || smError) {
      return NextResponse.json({ error: 'Study material not found or unauthorized.' }, { status: 404 });
    }

    // --- Simulate content generation (placeholder for Epic 4) ---
    let generatedContentData: any;
    if (type === 'summary') {
      generatedContentData = {
        title: `Summary of ${studyMaterial.original_name}`,
        text: `This is a simulated summary for document ID ${study_material_id}. Options: ${JSON.stringify(options)}`,
      };
    } else { // type === 'quiz'
      generatedContentData = {
        title: `Quiz for ${studyMaterial.original_name}`,
        questions: [
          { id: uuidv4(), question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], answer: 'Paris' },
          { id: uuidv4(), question: 'What is 2 + 2?', options: ['3', '4', '5'], answer: '4' },
        ],
        options: options,
      };
    }
    // --- End simulation ---

    // Insert the generated content into the database
    // class_id and class_section_id are NULL for unorganized content (initially)
    const { data: newGeneratedContent, error: insertError } = await supabase
      .from('generated_content')
      .insert({
        study_material_id: study_material_id,
        user_id: user.id, // Assuming user_id is also a column in generated_content for RLS/ownership
        type: type,
        content: generatedContentData,
        class_id: null,
        class_section_id: null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting generated content:', insertError);
      return NextResponse.json({ error: 'Failed to store generated content.' }, { status: 500 });
    }

    return NextResponse.json({ generatedContent: newGeneratedContent }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/generate:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
