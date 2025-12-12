import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

function getRelativeStoragePath(fullPath: string, bucketName: string): string {
  // Construct the expected base URL for Supabase storage objects.
  // This needs to be dynamic based on your Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    // Fallback or error handling if Supabase URL is not available
    return fullPath;
  }
  const objectStorageBaseUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/`;
  if (fullPath.startsWith(objectStorageBaseUrl)) {
    return fullPath.substring(objectStorageBaseUrl.length);
  }
  return fullPath; // Assume it's already a relative path if not a full URL
}

export async function POST(req: NextRequest) {
  try {
    const { studyMaterialId, storagePath } = await req.json();

    if (!studyMaterialId || !storagePath) {
      return NextResponse.json({ error: 'Missing studyMaterialId or storagePath' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase URL or Anon Key not set' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const bucketName = 'study-materials';
    const relativeStoragePath = getRelativeStoragePath(storagePath, bucketName);

    console.log(`Attempting to download from bucket: ${bucketName} with relative path: ${relativeStoragePath}`);

    // 1. Fetch PDF from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName) // Using the defined bucketName
      .download(relativeStoragePath);

    if (downloadError) {
      console.error('Supabase download error:', downloadError);
      return NextResponse.json({ error: `Failed to download file from storage: ${downloadError.message}` }, { status: 500 });
    }

    if (!fileData) {
      return NextResponse.json({ error: 'Downloaded file data is empty.' }, { status: 500 });
    }

    // Convert Blob to Buffer for pdf-parse
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract text using pdf-parse
    const data = await new PDFParse().parseBuffer(buffer);
    const extractedText = data.text;

    if (!extractedText) {
      return NextResponse.json({ error: 'No text extracted from the PDF.' }, { status: 422 });
    }

    // 3. Update 'study_materials' table with the extracted text
    const { error: updateError } = await supabase
      .from('study_materials')
      .update({ extracted_text: extractedText })
      .eq('id', studyMaterialId);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: `Failed to update study material: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ 
      studyMaterialId, 
      extractedTextLength: extractedText.length, 
      message: 'PDF parsed and study material updated successfully.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in PDF parser API route:', error);
    return NextResponse.json({ error: 'Internal Server Error during PDF processing' }, { status: 500 });
  }
}