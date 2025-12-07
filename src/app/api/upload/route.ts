import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Define constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = ['text/plain', 'application/pdf'];

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // server only!
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const classId = formData.get('class_id') as string | null;
    const classSectionId = formData.get('class_section_id') as string | null;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 413 });
    }

    // Validate type
    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'This file type is not supported.' }, { status: 400 });
    }

    const extension = file.name.split('.').pop();
    const uniqueName = `${uuidv4()}.${extension}`;
    const storagePath = `study_materials/${userId}/${uniqueName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(storagePath, file);

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Insert metadata
    const { data: record, error: dbError } = await supabase
      .from('study_materials')
      .insert({
        user_id: userId,
        original_name: file.name,
        file_name: uniqueName,
        storage_path: storagePath,
        file_type: extension,
        file_size: file.size,
        class_id: classId,
        class_section_id: classSectionId,
      })
      .select()
      .single();

    if (dbError) {
      console.error(dbError);
      return NextResponse.json({ error: 'Failed to save metadata' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'File uploaded successfully', studyMaterialId: record.id },
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

