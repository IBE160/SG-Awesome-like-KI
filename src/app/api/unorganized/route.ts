// src/app/api/unorganized/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();

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
        generated_content (
          id,
          type,
          content,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .is('class_id', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching unorganized content:', error);
      return NextResponse.json({ error: 'Failed to fetch unorganized content' }, { status: 500 });
    }

    // Filter out materials that have no generated content
    const unorganizedContent = data.filter(d => d.generated_content && d.generated_content.length > 0);

    return NextResponse.json({ data: unorganizedContent }, { status: 200 });

  } catch (err) {
    console.error('Error in GET /api/unorganized:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
