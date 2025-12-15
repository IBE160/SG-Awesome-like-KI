import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const summaryId = params.id;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: summary, error } = await supabase
      .from("generated_content")
      .select("study_material_id")
      .eq("id", summaryId)
      .eq("type", "summary")
      .eq("user_id", user.id)
      .single();

    if (error || !summary) {
      console.error("Error fetching summary:", error);
      return NextResponse.json({ error: 'Summary not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ study_material_id: summary.study_material_id }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/summaries/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
