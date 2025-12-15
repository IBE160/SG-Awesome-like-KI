import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Use 'id' here
) {
  try {
    const { id } = await params; // Await params here
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (!user || userError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetClassId, targetSectionId } = await req.json();

    // Validate material ownership and existence
    const { data: material, error: fetchError } = await supabase
      .from('study_materials')
      .select('id, user_id')
      .eq('id', id) // Use 'id' here
      .eq('user_id', user.id)
      .single();

    if (fetchError || !material) {
      return NextResponse.json({ error: 'Study material not found or unauthorized.' }, { status: 404 });
    }

    // Prepare update data
    const updateData: { class_id: string | null; class_section_id: string | null } = {
      class_id: targetClassId,
      class_section_id: targetSectionId,
    };

    // If targetClassId is null (moving to unorganized), ensure sectionId is also null
    if (targetClassId === null) {
      updateData.class_section_id = null;
    }

    // Perform the update
    const { error: updateError } = await supabase
      .from('study_materials')
      .update(updateData)
      .eq('id', id) // Use 'id' here
      .eq('user_id', user.id); // Ensure ownership

    if (updateError) {
      console.error('Error moving study material:', updateError);
      return NextResponse.json({ error: updateError.message || 'Failed to move study material.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Study material moved successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/study-materials/[id]/move:', error); // Update log
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
