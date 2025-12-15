import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ id: string }> }) {
  try {
    const params = await paramsPromise;
    const quizId = params.id;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: quiz, error } = await supabase
      .from("generated_content")
      .select("study_material_id")
      .eq("id", quizId)
      .eq("type", "quiz")
      .eq("user_id", user.id)
      .single();

    if (error || !quiz) {
      console.error("Error fetching quiz:", error);
      return NextResponse.json({ error: 'Quiz not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ study_material_id: quiz.study_material_id }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/quizzes/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
