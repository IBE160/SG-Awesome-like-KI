// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['text/plain', 'application/pdf'];

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const classId = formData.get('class_id') as string | null;
    const classSectionId = formData.get('class_section_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Server-side validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'This file type is not supported. Please try another file.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique file name and path for Supabase Storage
    const fileExtension = file.name.split('.').pop();
    const storagePath = `study_materials/${user.id}/${uuidv4()}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('study_materials')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false, // Do not overwrite existing files
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to storage.' }, { status: 500 });
    }

    // Store file metadata in the 'study_materials' table
    const { data: materialData, error: insertError } = await supabase
      .from('study_materials')
      .insert({
        user_id: user.id,
        file_name: file.name,
        original_name: file.name,
        storage_path: uploadData.path,
        file_type: file.type,
        file_size: file.size,
        class_id: classId,
        class_section_id: classSectionId,
        // extracted_text will be populated by Vercel Function for PDFs or directly for TXT
        // For now, it's null, or file content for TXT files
        extracted_text: file.type === 'text/plain' ? buffer.toString('utf-8') : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Supabase database insert error:', insertError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('study_materials').remove([uploadData.path]);
      return NextResponse.json({ error: 'Failed to record file metadata.' }, { status: 500 });
    }

    // Trigger Vercel Function for PDF text extraction if it's a PDF
    if (file.type === 'application/pdf') {
      // For now, this is a placeholder. The actual Vercel Function call would go here.
      // Example:
      // await fetch(`${process.env.VERCEL_URL}/api/process-pdf`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ studyMaterialId: materialData.id, storagePath: uploadData.path }),
      // });
      console.log(`PDF uploaded. Triggering Vercel Function for text extraction for material ID: ${materialData.id}`);
    }

    return NextResponse.json(
      { message: 'File uploaded successfully', studyMaterialId: materialData.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('General upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
