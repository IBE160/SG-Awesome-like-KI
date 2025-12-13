import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PDFParse } from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const { studyMaterialId, signedUrl } = await req.json();

    if (!studyMaterialId || !signedUrl) {
      return NextResponse.json({ error: 'Missing studyMaterialId or signedUrl' }, { status: 400 });
    }

    // 1. Fetch PDF from the signed URL
    const fileResponse = await fetch(signedUrl);
    if (!fileResponse.ok) {
        return NextResponse.json({ error: 'Failed to download file from the secure link.' }, { status: fileResponse.status });
    }
    
    // Convert Blob/Response to Buffer for pdf-parse
    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract text using pdf-parse
    const data = await new PDFParse().parseBuffer(buffer);
    const extractedText = data.text;

    if (!extractedText) {
      return NextResponse.json({ error: 'No text extracted from the PDF.' }, { status: 422 });
    }
    
    // The pdf-parser route no longer has direct access to a Supabase client
    // for updating the database. The calling service (`/api/upload`) is now responsible
    // for taking the extracted text and saving it.
    // We will return the extracted text in the response.

    return NextResponse.json({ 
      studyMaterialId, 
      extractedText: extractedText,
      message: 'PDF parsed successfully.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in PDF parser API route:', error);
    if (error instanceof Error && error.message.includes('May not be a PDF file')) {
        return NextResponse.json({ error: 'The provided file does not appear to be a valid PDF.' }, { status: 415 });
    }
    return NextResponse.json({ error: 'Internal Server Error during PDF processing' }, { status: 500 });
  }
}