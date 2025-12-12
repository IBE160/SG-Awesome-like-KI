
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/logger';

// Helper function to handle Claude API errors more specifically
function handleClaudeError(claudeError: any, generationType: string, requestId: string) {
  logger.error(`Error from Claude API during ${generationType} generation:`, { error: claudeError, generationType, requestId });

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

export async function POST(req: Request) {
  const requestId = uuidv4(); // Generate a unique request ID
  logger.info('API Generate Request received', { requestId, url: req.url, method: req.method });

  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    logger.warn('Unauthorized access attempt to API Generate', { requestId });
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  let body;
  try {
    body = await req.json();
  } catch (parseError) {
    logger.error('Failed to parse request body as JSON', { requestId, error: parseError });
    return new NextResponse('Invalid JSON in request body', { status: 400 });
  }

  const { type, documentId, options } = body;
  logger.info('Request body details', { requestId, userId, type, documentId, options });

  if (!['summary', 'quiz'].includes(type)) {
    logger.warn('Invalid generation type requested', { requestId, userId, type });
    return new NextResponse('Invalid type', { status: 400 });
  }

  if (!documentId) {
    logger.warn('Missing documentId in request', { requestId, userId });
    return new NextResponse('Missing documentId', { status: 400 });
  }

  try {
    const { data: document, error: docError } = await supabase
      .from('study_materials')
      .select('extracted_text')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (docError || !document) {
      logger.error('Error retrieving document from Supabase', { requestId, docError, documentId, userId });
      return new NextResponse('Document not found or access denied', { status: 404 });
    }
    logger.info('Document successfully retrieved from Supabase', { requestId, documentId, userId });

    if (!document.extracted_text) {
      logger.warn('Document has no extracted text content', { requestId, documentId, userId });
      return new NextResponse('Document has no text content to summarize', { status: 400 });
    }

    if (document.extracted_text.length < 100 && type === 'summary') {
      logger.warn('Document content too short for meaningful summarization', { requestId, documentId, userId, content_length: document.extracted_text.length });
      return new NextResponse('Document content is too short for meaningful summarization.', { status: 400 });
    }

    let generatedContent: any;

    if (type === 'summary') {
      let summary: string;
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          logger.error('ANTHROPIC_API_KEY is not set for summary generation', { requestId, userId });
          throw new Error("ANTHROPIC_API_KEY is not set.");
        }

        const prompt = `Please provide a concise summary of the following text: ${document.extracted_text}`;
        logger.info('Calling Claude API for summary generation', { requestId, userId, prompt_length: prompt.length });

        const claudeResponse = await anthropic.messages.create({
          model: process.env.CLAUDE_MODEL_NAME || 'claude-3-opus-20240229',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });
        summary = claudeResponse.content[0].text;
        logger.info('Claude API responded successfully for summary generation', { requestId, userId, response_length: summary.length });

      } catch (claudeError: any) {
        return handleClaudeError(claudeError, 'summary', requestId);
      }
      generatedContent = { summary };
    } else if (type === 'quiz') {
      const { quizLength } = options || {};
      if (!quizLength || !['short', 'medium', 'long'].includes(quizLength)) {
        logger.warn('Invalid or missing quizLength option for quiz generation', { requestId, userId, quizLength });
        return new NextResponse('Invalid or missing quizLength option', { status: 400 });
      }

      let quiz: any;
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          logger.error('ANTHROPIC_API_KEY is not set for quiz generation', { requestId, userId });
          throw new Error("ANTHROPIC_API_KEY is not set.");
        }

        let quizPrompt: string;
        if (quizLength === 'short') {
          quizPrompt = `Generate a short multiple-choice quiz (3-5 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), and 'answer' (the correct option string). Text: ${document.extracted_text}`;
        } else if (quizLength === 'medium') {
          quizPrompt = `Generate a medium multiple-choice quiz (6-8 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), and 'answer' (the correct option string). Text: ${document.extracted_text}`;
        } else {
          quizPrompt = `Generate a long multiple-choice quiz (9-12 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), and 'answer' (the correct option string). Text: ${document.extracted_text}`;
        }
        
        logger.info('Calling Claude API for quiz generation', { requestId, userId, quizLength, prompt_length: quizPrompt.length });
        const claudeResponse = await anthropic.messages.create({
          model: process.env.CLAUDE_MODEL_NAME || 'claude-3-opus-20240229',
          max_tokens: 2048,
          messages: [{ role: 'user', content: quizPrompt }],
        });
        quiz = JSON.parse(claudeResponse.content[0].text);
        logger.info('Claude API responded successfully for quiz generation', { requestId, userId, quizLength, response_length: claudeResponse.content[0].text.length });

      } catch (claudeError: any) {
        return handleClaudeError(claudeError, 'quiz', requestId);
      }
      generatedContent = { quiz };
    }

    const { data, error: dbError } = await supabase
      .from('generated_content')
      .insert([
        {
          user_id: userId,
          study_material_id: documentId,
          content_type: type,
          content: generatedContent,
        },
      ])
      .select();

    if (dbError) {
      logger.error('Error saving generated content to Supabase', { requestId, dbError, documentId, userId, contentType: type });
      return new NextResponse('Internal Server Error', { status: 500 });
    }
    logger.info('Generated content successfully saved to Supabase', { requestId, generatedContentId: data?.[0]?.id, documentId, userId, contentType: type });

    logger.info('API Generate Request completed successfully', { requestId, userId, type, documentId });
    return NextResponse.json(data);
  } catch (error: any) {
    logger.error('Unhandled error during API Generate Request', { requestId, error, documentId, userId, type });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}