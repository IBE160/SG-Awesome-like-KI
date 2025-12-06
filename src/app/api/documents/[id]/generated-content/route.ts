import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ---- Supabase Client (correct cookies setup) ----
async function createSupabaseClient() {
  const cookieStore = await cookies(); // required for Next.js 15+

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: any) {
          try { cookieStore.delete({ name, ...options }); } catch {}
        }
      }
    }
  );
}

// ---- GET /api/documents/[id]/generated-content ----
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: studyMaterialId } = await context.params;

    const supabase = await createSupabaseClient();

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
