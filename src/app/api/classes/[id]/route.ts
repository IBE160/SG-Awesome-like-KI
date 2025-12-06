import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ---------- CREATE SUPABASE CLIENT ----------
async function createSupabaseClient() {
  const cookieStore = await cookies();

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

// ------------------------ PATCH (Rename) ------------------------
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const supabase = await createSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (!name || !/^[a-zA-Z0-9\s]+$/.test(name) || name.length > 25) {
      return NextResponse.json({ error: "Invalid class name" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("classes")
      .update({ name })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Rename error:", error);
      return NextResponse.json({ error: "Failed to rename class" }, { status: 500 });
    }

    return NextResponse.json({ class: data }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/classes/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ------------------------ DELETE ------------------------
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const supabase = await createSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("DELETE error:", error);
      return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/classes/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
