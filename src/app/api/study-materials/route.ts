import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

type CookieOptions = {
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
};

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // @ts-ignore
        cookies: cookies,
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: studyMaterials, error: studyMaterialsError } = await supabase
      .from('study_materials')
      .select('id, original_name, class_id, class_section_id')
      .eq('user_id', user.id);

    if (studyMaterialsError) {
      console.error('Error fetching study materials:', studyMaterialsError);
      return NextResponse.json({ error: 'Failed to retrieve study materials.' }, { status: 500 });
    }

    return NextResponse.json({ studyMaterials }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/study-materials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
