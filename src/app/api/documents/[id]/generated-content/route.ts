import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate study material belongs to user
    const { data: studyMaterial, error: smError } = await supabase
      .from("study_materials")
      .select("id, user_id")
      .eq("id", studyMaterialId)
      .eq("user_id", user.id)
      .single();

    if (!studyMaterial || smError)
      return NextResponse.json(
        { error: "Study material not found or unauthorized." },
        { status: 404 }
      );

    // Fetch generated content
    const { data: generatedContent, error: genError } = await supabase
      .from("generated_content")
      .select("*")
      .eq("study_material_id", studyMaterialId);

    if (genError)
      return NextResponse.json(
        { error: "Failed to retrieve generated content." },
        { status: 500 }
      );

    return NextResponse.json({ generatedContent }, { status: 200 });
  } catch (err) {
    console.error("GET /api/documents/[id]/generated-content error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
