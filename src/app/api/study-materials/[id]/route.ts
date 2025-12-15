import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const studyMaterialId = params.id;
    console.log(`[API/STUDY-MATERIALS] Attempting to fetch original_name for studyMaterialId: ${studyMaterialId}`);
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[API/STUDY-MATERIALS] Unauthorized: No user found.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: studyMaterial, error } = await supabase
      .from("study_materials")
      .select("id, original_name")
      .eq("id", studyMaterialId)
      .eq("user_id", user.id)
      .single();

    if (error || !studyMaterial) {
      console.error("[API/STUDY-MATERIALS] Error fetching study material:", error);
      return NextResponse.json({ error: 'Study material not found or unauthorized' }, { status: 404 });
    }
    console.log(`[API/STUDY-MATERIALS] Successfully fetched original_name: "${studyMaterial.original_name}" for studyMaterialId: ${studyMaterialId}`);
    return NextResponse.json({ name: studyMaterial.original_name }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/study-materials/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
