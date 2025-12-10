
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Removed Gemini specific imports
import Anthropic from '@anthropic-ai/sdk'; // Corrected import for Anthropic

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { type, documentId, options } = await req.json();

  if (!['summary', 'quiz'].includes(type)) { // Allow both 'summary' and 'quiz' types
    return new NextResponse('Invalid type', { status: 400 });
  }

  if (!documentId) {
    return new NextResponse('Missing documentId', { status: 400 });
  }

  try { // Outer try block reintroduced
    // 1. Retrieve document content from Supabase
    const { data: document, error: docError } = await supabase
      .from('study_materials')
      .select('extracted_text')
      .eq('id', documentId)
      .eq('user_id', session.user.id)
      .single();

    if (docError || !document) {
      // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
      console.error('Error retrieving document:', docError);
      return new NextResponse('Document not found or access denied', { status: 404 });
    }

    if (!document.extracted_text) {
      return new NextResponse('Document has no text content to summarize', { status: 400 });
    }

    let generatedContent: any; // To hold either summary or quiz

    if (type === 'summary') {
      let summary: string;
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error("ANTHROPIC_API_KEY is not set.");
        }

        const prompt = `Please provide a concise summary of the following text: ${document.extracted_text}`;
        const claudeResponse = await anthropic.messages.create({
          model: 'claude-3-opus-20240229', // or another appropriate Claude model
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });
        summary = claudeResponse.content[0].text; // Extract the text from the response

      } catch (claudeError: any) {
        // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
        console.error('Error from Claude API during summary generation:', claudeError);
        return new NextResponse(`AI summary generation failed: ${claudeError.message}`, { status: 500 });
      }
      generatedContent = { summary };
    } else if (type === 'quiz') {
      const { quizLength } = options || {}; // Extract quizLength from options
      if (!quizLength || !['short', 'medium', 'long'].includes(quizLength)) {
        return new NextResponse('Invalid or missing quizLength option', { status: 400 });
      }

      let quiz: any; // Placeholder for quiz structure
      try { // Inner try block for quiz generation
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error("ANTHROPIC_API_KEY is not set.");
        }

        let quizPrompt: string;
        if (quizLength === 'short') {
          quizPrompt = `Generate a short multiple-choice quiz (3-5 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), and 'answer' (the correct option string). Text: ${document.extracted_text}`;
        } else if (quizLength === 'medium') {
          quizPrompt = `Generate a medium multiple-choice quiz (6-8 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), and 'answer' (the correct option string). Text: ${document.extracted_text}`;
        } else { // long
          quizPrompt = `Generate a long multiple-choice quiz (9-12 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), and 'answer' (the correct option string). Text: ${document.extracted_text}`;
        }
        
        const claudeResponse = await anthropic.messages.create({
          model: 'claude-3-opus-20240229', // or another appropriate Claude model
          max_tokens: 2048, // Increased max tokens for quiz generation
          messages: [{ role: 'user', content: quizPrompt }],
        });
        quiz = JSON.parse(claudeResponse.content[0].text); // Assuming Claude returns JSON directly
      } catch (claudeError: any) { // Catch for quiz generation error
        // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
        console.error('Error from Claude API during quiz generation:', claudeError);
        return new NextResponse(`AI quiz generation failed: ${claudeError.message}`, { status: 500 });
      }
      generatedContent = { quiz };
    }

    // 3. Store the generated content in the `generated_content` table
    const { data, error } = await supabase
      .from('generated_content')
      .insert([
        {
          user_id: session.user.id,
          study_material_id: documentId,
          content_type: type, // Use the dynamic type
          content: generatedContent,
        },
      ])
      .select();

    if (error) {
      // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
      console.error('Error saving content:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) { // Outer catch block restored
    // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
    console.error('Error generating content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

    // 3. Store the generated content in the `generated_content` table
    const { data, error } = await supabase
      .from('generated_content')
      .insert([
        {
          user_id: session.user.id,
          study_material_id: documentId,
          content_type: type, // Use the dynamic type
          content: generatedContent,
        },
      ])
      .select();

    if (error) {
      // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
      console.error('Error saving content:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) { // Outer catch block restored
    // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
    console.error('Error generating content:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}