import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sections, error } = await supabase
      .from('class_sections')
      .select('id, name, class_id, classes(user_id)') // Select class_id and user_id from classes table
      .eq('classes.user_id', user.id); // Filter sections by user_id of the associated class

    if (error) {
      console.error('Error fetching sections:', error);
      return NextResponse.json({ error: 'Failed to fetch sections.' }, { status: 500 });
    }

    // Filter out sections not owned by the user (if Supabase RLS isn't fully handling it for the join)
    const ownedSections = sections?.filter(section => (section.classes as any)?.user_id === user.id);

    return NextResponse.json({ sections: ownedSections || [] }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/sections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
