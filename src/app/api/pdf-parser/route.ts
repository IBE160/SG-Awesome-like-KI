import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { studyMaterialId, signedUrl } = await req.json();

    if (!studyMaterialId || !signedUrl) {
      return NextResponse.json({ error: 'Missing studyMaterialId or signedUrl' }, { status: 400 });
    }

    // Call the Python Flask microservice for PDF parsing
    const pythonParserResponse = await fetch('http://localhost:5000/parse-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studyMaterialId, signedUrl }),
    });

    if (!pythonParserResponse.ok) {
      const errorText = await pythonParserResponse.text();
      console.error('Error from Python PDF parser microservice:', errorText);
      return NextResponse.json(
        { error: `PDF parsing microservice failed: ${errorText}` },
        { status: pythonParserResponse.status }
      );
    }

    const parserData = await pythonParserResponse.json();

    if (!parserData.extractedText) {
      return NextResponse.json({ error: 'No text extracted from the PDF by microservice.' }, { status: 422 });
    }
    
    return NextResponse.json({ 
      studyMaterialId: parserData.studyMaterialId, 
      extractedText: parserData.extractedText,
      message: 'PDF parsed successfully by microservice.' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error in PDF parser API route:', error);
    // Generic error for issues reaching the microservice or other unexpected errors
    return NextResponse.json({ error: 'Internal Server Error during PDF processing microservice call.' }, { status: 500 });
  }
}