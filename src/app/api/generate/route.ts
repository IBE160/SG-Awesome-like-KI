import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
// import { Anthropic } from '@anthropic-ai/sdk';

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

export async function POST(request: Request) {
  const { documentId, type } = await request.json();

  if (type !== 'summary') {
    return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
  }

  if (!documentId) {
    return NextResponse.json({ error: 'documentId is required' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // 1. Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Retrieve document from study_materials table to get storage_path
    const { data: document, error: docError } = await supabase
      .from('study_materials')
      .select('storage_path')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found or access denied.' }, { status: 404 });
    }

    // 3. Download document content from Supabase Storage
    const { data: fileContent, error: downloadError } = await supabase
      .storage
      .from('documents') // Assuming 'documents' is your bucket name
      .download(document.storage_path);

    if (downloadError || !fileContent) {
        return NextResponse.json({ error: 'Failed to retrieve document from storage.' }, { status: 500 });
    }
    
    const textContent = await fileContent.text();

    if (textContent.length < 100) { // Example threshold
        return NextResponse.json({ error: 'Insufficient text for summary.' }, { status: 400 });
    }

    // 4. (Placeholder) Call AI model for summary
    // In a real implementation, this would be a call to a service like Anthropic/Claude
    const summaryText = `This is a mock summary for document ID: ${documentId}. The document content has ${textContent.length} characters.`;
    
    // const msg = await anthropic.messages.create({
    //   model: "claude-3-haiku-20240307",
    //   max_tokens: 1024,
    //   messages: [
    //     {"role": "user", "content": `Please summarize the following text:\n\n${textContent}`}
    //   ],
    // });
    // const summaryText = msg.content[0].text;


    // 5. Store the generated summary in the generated_content table
    const { data: generatedContent, error: insertError } = await supabase
      .from('generated_content')
      .insert({
        user_id: userId,
        study_material_id: documentId,
        content_type: 'summary',
        content: { summary: summaryText },
        model_used: 'mock-model-v1', // Or the actual model used e.g., 'claude-3-haiku-20240307'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store generated summary:', insertError);
      return NextResponse.json({ error: 'Failed to save summary.' }, { status: 500 });
    }

    return NextResponse.json(generatedContent, { status: 200 });

  } catch (e) {
    const error = e as Error;
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}