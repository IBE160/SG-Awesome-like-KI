import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: classes, error } = await supabase
      .from('classes')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json({ error: 'Failed to fetch classes.' }, { status: 500 });
    }

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/classes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ---------------------------- POST /api/classes ----------------------------
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    // Validate
    if (!name || typeof name !== "string" || name.length > 25 || !/^[\p{L}0-9\s]+$/u.test(name)) {
      return NextResponse.json(
        { error: 'Invalid class name. Must be alphanumeric and max 25 characters.' },
        { status: 400 }
      );
    }

    // Check duplicates
    const { data: existingClass } = await supabase
      .from('classes')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .single();

    if (existingClass) {
      return NextResponse.json(
        { error: 'A class with this name already exists.' },
        { status: 409 }
      );
    }

    // Insert
    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({ name, user_id: user.id })
      .select()
      .single();

    if (createError) {
      console.error('Error creating class:', createError);
      return NextResponse.json({ error: 'Failed to create class.' }, { status: 500 });
    }

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/classes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
