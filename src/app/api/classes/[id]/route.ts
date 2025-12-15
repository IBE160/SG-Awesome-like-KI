import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await req.json();

    if (!name || name.length > 25 || !/^[\p{L}0-9\s]+$/u.test(name)) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('classes')
      .update({ name })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Rename error:', error);
      return NextResponse.json({ error: 'Failed to rename class' }, { status: 500 });
    }

    return NextResponse.json({ class: data }, { status: 200 });
  } catch (err) {
    console.error('PATCH /api/classes/[id] error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
    try {
      const params = await paramsPromise;
      const supabase = await createClient();
  
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const classId = params.id;
  
      // Delete the class
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)
        .eq('user_id', user.id); // Ensure user can only delete their own classes
  
      if (deleteError) {
        console.error('Error deleting class:', deleteError);
        return NextResponse.json({ error: 'Failed to delete class.' }, { status: 500 });
      }
  
      return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
      console.error('Error in DELETE /api/classes/[id]:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const classId = params.id;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cls, error } = await supabase
      .from("classes")
      .select("id, name")
      .eq("id", classId)
      .eq("user_id", user.id)
      .single();

    if (error || !cls) {
      console.error("Error fetching class:", error);
      return NextResponse.json({ error: 'Class not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ name: cls.name }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/classes/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  
