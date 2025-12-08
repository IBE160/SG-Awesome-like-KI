import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check class ownership
    const { data: cls, error: classError } = await supabase
      .from("classes")
      .select("id, user_id")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (classError || !cls) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch documents belonging to the class
    const { data: documents, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("class_id", params.id);

    if (docError) {
      console.error("Document fetch error:", docError);
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents }, { status: 200 });

  } catch (err) {
    console.error("GET /api/classes/[id]/documents error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
