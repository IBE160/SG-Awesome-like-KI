import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, context: any) {
  const classId: string = context.params.id; // Explicitly cast to string
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check class ownership
    const { data: cls, error: classError } = await supabase
      .from("classes")
      .select("id, user_id")
      .eq("id", classId)
      .eq("user_id", user.id)
      .single();

    if (classError || !cls) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch study materials belonging to the class
    const { data: studyMaterials, error: docError } = await supabase
      .from("study_materials")
      .select("*")
      .eq("class_id", classId);

    if (docError) {
      console.error("Document fetch error:", docError);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ studyMaterials }, { status: 200 });

  } catch (err) {
    console.error("GET /api/classes/[id]/documents error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
