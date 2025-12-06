import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();
    const sectionId = params.id;

    if (!name || typeof name !== 'string' || name.length > 25 || !/^[a-zA-Z0-9\s]+$/.test(name)) {
      return NextResponse.json({ error: 'Invalid section name. Must be alphanumeric and max 25 characters.' }, { status: 400 });
    }

    // Verify user owns the class that the section belongs to
    // This requires joining class_sections with classes
    const { data: sectionData, error: fetchSectionError } = await supabase
        .from('class_sections')
        .select(`
            id,
            name,
            class_id,
            classes (
                user_id
            )
        `)
        .eq('id', sectionId)
        .single();

    if (fetchSectionError || !sectionData || sectionData.classes?.user_id !== user.id) {
        console.error('Error verifying section ownership:', fetchSectionError);
        return NextResponse.json({ error: 'Section not found or not owned by user.' }, { status: 404 });
    }

    // Check for uniqueness of section name within this class, excluding the current section
    const { data: existingSection, error: existingSectionError } = await supabase
      .from('class_sections')
      .select('id')
      .eq('class_id', sectionData.class_id)
      .eq('name', name)
      .not('id', 'eq', sectionId) // Exclude the current section from the check
      .single();

    if (existingSection) {
      return NextResponse.json({ error: 'A section with this name already exists in this class. Please choose a different name.' }, { status: 409 });
    }
    
    // Update the class section
    const { data: updatedSection, error: updateError } = await supabase
      .from('class_sections')
      .update({ name: name })
      .eq('id', sectionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating class section:', updateError);
      return NextResponse.json({ error: 'Failed to update class section.' }, { status: 500 });
    }

    return NextResponse.json({ section: updatedSection }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/sections/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const supabase = createRouteHandlerClient({ cookies });
  
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const sectionId = params.id;
  
      // Verify user owns the class that the section belongs to
      const { data: sectionData, error: fetchSectionError } = await supabase
          .from('class_sections')
          .select(`
              id,
              classes (
                  user_id
              )
          `)
          .eq('id', sectionId)
          .single();
  
      if (fetchSectionError || !sectionData || sectionData.classes?.user_id !== user.id) {
          console.error('Error verifying section ownership:', fetchSectionError);
          return NextResponse.json({ error: 'Section not found or not owned by user.' }, { status: 404 });
      }
  
      // Delete the class section
      const { error: deleteError } = await supabase
        .from('class_sections')
        .delete()
        .eq('id', sectionId);
  
      if (deleteError) {
        console.error('Error deleting class section:', deleteError);
        return NextResponse.json({ error: 'Failed to delete class section.' }, { status: 500 });
      }
  
      return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
      console.error('Error in DELETE /api/sections/[id]:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
