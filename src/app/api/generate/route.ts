
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Removed Gemini specific imports
import Anthropic from '@anthropic-ai/sdk'; // Corrected import for Anthropic
import { logger } from '@/lib/logger';

// Helper function to handle Claude API errors more specifically
function handleClaudeError(claudeError: any, generationType: string) {
  // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
  logger.error(`Error from Claude API during ${generationType} generation:`, { error: claudeError, generationType });

  let status = 500;
  let message = `AI ${generationType} generation failed: ${claudeError.message}`;

  // Attempt to extract a more specific status code if available
  // Anthropic SDK errors often include a 'status' property for HTTP status codes,
  // or an 'error' object with 'type' and 'message' for API-specific errors.
  if (claudeError.status) {
    status = claudeError.status;
    if (status === 401 || status === 403) {
      message = `Authentication/Authorization error with Claude API. Please check your API key.`;
    } else if (status === 429) {
      message = `Claude API rate limit exceeded. Please try again shortly.`;
    } else if (status >= 400 && status < 500) {
      // Client-side errors (e.g., bad request, invalid prompt, content moderation)
      message = `Invalid request to Claude API: ${claudeError.message}`;
    } else if (status >= 500 && status < 600) {
      // Server-side errors from Claude API
      message = `Claude API internal error: ${claudeError.message}`;
    }
  } else if (claudeError.error && claudeError.error.type) {
    // Handle specific Anthropic APIError types if they follow this structure
    // e.g., 'invalid_request_error', 'rate_limit_error', 'authentication_error'
    message = `Claude API Error (${claudeError.error.type}): ${claudeError.error.message}`;
    if (claudeError.error.type === 'rate_limit_error') {
      status = 429;
    } else if (claudeError.error.type === 'authentication_error') {
      status = 401;
    } else if (claudeError.error.type === 'permission_error') {
      status = 403;
    } else {
      status = 400; // Default for other client-side API errors
    }
  }
  // Further checks could involve specific error codes from Claude if documented

  return new NextResponse(message, { status });
}

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
      logger.error('Error retrieving document:', { docError, documentId, userId: session.user.id });
      return new NextResponse('Document not found or access denied', { status: 404 });
    }

    if (!document.extracted_text) {
      return new NextResponse('Document has no text content to summarize', { status: 400 });
    }

    if (document.extracted_text.length < 100 && type === 'summary') {
      return new NextResponse('Document content is too short for meaningful summarization.', { status: 400 });
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
          model: process.env.CLAUDE_MODEL_NAME || 'claude-3-opus-20240229', // Use environment variable for model name
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });
        summary = claudeResponse.content[0].text; // Extract the text from the response

      } catch (claudeError: any) {
        return handleClaudeError(claudeError, 'summary');
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
          model: process.env.CLAUDE_MODEL_NAME || 'claude-3-opus-20240229', // Use environment variable for model name
          max_tokens: 2048, // Increased max tokens for quiz generation
          messages: [{ role: 'user', content: quizPrompt }],
        });
        quiz = JSON.parse(claudeResponse.content[0].text); // Assuming Claude returns JSON directly
      } catch (claudeError: any) { // Catch for quiz generation error
        return handleClaudeError(claudeError, 'quiz');
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
      logger.error('Error saving content:', { error, documentId, userId: session.user.id, contentType: type });
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) { // Outer catch block restored
    // NOTE: For production environments, consider replacing `console.error` with a structured logging solution.
    logger.error('Error generating content:', { error, documentId, userId: session.user.id, contentType: type });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}