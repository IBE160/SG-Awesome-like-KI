import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_FILE_TYPES = ['text/plain', 'application/pdf'];

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 413 });
    }

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'This file type is not supported' }, { status: 415 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const uniqueName = `${uuidv4()}.${extension}`;
    const storagePath = `${user.id}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from('study-materials')
      .upload(storagePath, file);

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 });
    }

    const { data: record, error: dbError } = await supabase
      .from('study_materials')
      .insert({
        user_id: user.id,
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

    if (dbError || !record) {
      console.error('Metadata Insert Error:', dbError);
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 });
    }

    // If text file, extract text directly
    if (file.type === 'text/plain') {
        const textContent = await file.text();
        await supabase
            .from('study_materials')
            .update({ extracted_text: textContent })
            .eq('id', record.id);
    }
    // If PDF, trigger text extraction
    else if (file.type === 'application/pdf') {
      try {
        const parserUrl = `${req.nextUrl.origin}/api/pdf-parser`;
        const parserResponse = await fetch(parserUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studyMaterialId: record.id, storagePath: storagePath }),
        });

        const parserData = await parserResponse.json();

        if (parserResponse.ok) {
            await supabase
                .from('study_materials')
                .update({ extracted_text: parserData.extractedText })
                .eq('id', record.id);
        } else {
            // Save the parsing error message to the record
            await supabase
                .from('study_materials')
                .update({ extracted_text: `PDF_PARSING_ERROR: ${parserData.error}` })
                .eq('id', record.id);
             return NextResponse.json({ error: parserData.error, studyMaterialId: record.id }, { status: 422 });
        }
      } catch (e) {
          console.error('PDF Parser invocation error:', e);
          // Still return a success for the upload, but log the parsing error
           await supabase
                .from('study_materials')
                .update({ extracted_text: 'PDF_PARSING_ERROR: Invocation failed.' })
                .eq('id', record.id);
      }
    }

    return NextResponse.json({ message: 'File uploaded successfully', studyMaterialId: record.id }, { status: 200 });

  } catch (err) {
    console.error('Overall Server Error in POST /api/upload:', err);
    return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
  }
}

