import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== 'string' || name.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(name)) {
      return NextResponse.json({ error: 'Invalid class name. Must be alphanumeric and max 25 characters.' }, { status: 400 });
    }

    // Check for uniqueness
    const { data: existingClass, error: existingClassError } = await supabase
      .from('classes')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .single();

    if (existingClass) {
      return NextResponse.json({ error: 'A class with this name already exists. Please choose a different name.' }, { status: 409 });
    }

    // Create the new class
    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({
        name: name,
        user_id: user.id,
      })
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