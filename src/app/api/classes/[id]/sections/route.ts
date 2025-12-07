import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const classId = params.id;

    const { data: sections, error } = await supabase
      .from('class_sections')
      .select('*')
      .eq('class_id', classId);

    if (error) {
      console.error('Error fetching class sections:', error);
      return NextResponse.json({ error: 'Failed to fetch class sections.' }, { status: 500 });
    }

    return NextResponse.json({ sections }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/classes/[id]/sections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
    try {
      const params = await paramsPromise;
      const supabase = await createClient();
  
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const classId = params.id;
      const { name } = await req.json();
  
      if (!name || typeof name !== 'string' || name.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(name)) {
        return NextResponse.json({ error: 'Invalid section name. Must be alphanumeric and max 25 characters.' }, { status: 400 });
      }
  
      // Check if the user owns the class before creating a section in it (RLS on classes table)
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id')
        .eq('id', classId)
        .eq('user_id', user.id)
        .single();
  
      if (classError || !classData) {
        console.error('Error verifying class ownership:', classError);
        return NextResponse.json({ error: 'Class not found or not owned by user.' }, { status: 404 });
      }
  
      // Check for uniqueness of section name within this class
      const { data: existingSection, error: existingSectionError } = await supabase
        .from('class_sections')
        .select('id')
        .eq('class_id', classId)
        .eq('name', name)
        .single();
  
      if (existingSection) {
        return NextResponse.json({ error: 'A section with this name already exists in this class. Please choose a different name.' }, { status: 409 });
      }
  
      // Create the new class section
      const { data: newSection, error: createError } = await supabase
        .from('class_sections')
        .insert({
          name: name,
          class_id: classId,
        })
        .select()
        .single();
  
      if (createError) {
        console.error('Error creating class section:', createError);
        return NextResponse.json({ error: 'Failed to create class section.' }, { status: 500 });
      }
  
      return NextResponse.json({ section: newSection }, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/classes/[id]/sections:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
