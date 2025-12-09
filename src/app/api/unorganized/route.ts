// src/app/api/unorganized/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('study_materials')
      .select(`
        id,
        original_name,
        created_at,
        generated_content!generated_content_study_material_id_fkey (
          id,
          type,
          content
        )
      `)
      .eq('user_id', user.id)
      .is('class_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unorganized content:', error);
      return NextResponse.json({ error: 'Failed to fetch unorganized content' }, { status: 500 });
    }

    // Do not filter out materials that have no generated content.
    // The user expects to see all unorganized files, regardless of whether content has been generated yet.
    const unorganizedContent = data;

    return NextResponse.json({ data: unorganizedContent }, { status: 200 });

  } catch (err) {
    console.error('Error in GET /api/unorganized:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
