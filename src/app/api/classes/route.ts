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

// ---------------------------- PUT /api/classes ----------------------------
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, newName } = await req.json();

    if (!id || typeof id !== 'string' || !newName || typeof newName !== 'string' || newName.length > 25 || !/^[\p{L}0-9\s]+$/u.test(newName)) {
      return NextResponse.json(
        { error: 'Invalid class ID or new name. Name must be alphanumeric and max 25 characters.' },
        { status: 400 }
      );
    }

    // Check ownership before updating
    const { data: existingClass, error: fetchError } = await supabase
      .from('classes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingClass) {
      return NextResponse.json({ error: 'Class not found or unauthorized.' }, { status: 404 });
    }

    const { data: updatedClass, error: updateError } = await supabase
      .from('classes')
      .update({ name: newName })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating class:', updateError);
      return NextResponse.json({ error: 'Failed to update class.' }, { status: 500 });
    }

    return NextResponse.json({ class: updatedClass }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/classes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ---------------------------- DELETE /api/classes ----------------------------
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid class ID.' },
        { status: 400 }
      );
    }

    // Check ownership before deleting
    const { data: existingClass, error: fetchError } = await supabase
      .from('classes')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingClass) {
      return NextResponse.json({ error: 'Class not found or unauthorized.' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting class:', deleteError);
      return NextResponse.json({ error: 'Failed to delete class.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Class deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/classes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
