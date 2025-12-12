import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import Anthropic from '@anthropic-ai/sdk';
import { logger } from '@/lib/logger';

// Helper function to handle Claude API errors more specifically
function handleClaudeError(claudeError: any, generationType: string, requestId: string): never { // Changed return type to never
  console.log('--- claudeError object in handleClaudeError ---', claudeError); // Temporary log
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

  throw new NextResponse(message, { status }); // THROW instead of return
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const requestId = uuidv4(); // Generate a unique request ID
  logger.info('API Generate Request received', { requestId, url: req.url, method: req.method });

  try { // Top-level try block starts here
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      logger.warn('Unauthorized access attempt to API Generate', { requestId });
      throw new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      logger.error('Failed to parse request body as JSON', { requestId, error: parseError });
      throw new NextResponse('Invalid JSON in request body', { status: 400 });
    }

    const { type, documentId, options } = body;
    logger.info('Request body details', { requestId, userId, type, documentId, options });

    if (!['summary', 'quiz'].includes(type)) {
      logger.warn('Invalid generation type requested', { requestId, userId, type });
      throw new NextResponse('Invalid type', { status: 400 });
    }

    if (!documentId) {
      logger.warn('Missing documentId in request', { requestId, userId });
      throw new NextResponse('Missing documentId', { status: 400 });
    }

    let document: any;
    let docError: any;
    try {
      ({ data: document, error: docError } = await supabase
        .from('study_materials')
        .select('extracted_text, class_section_id')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single());
    } catch (err: any) {
      logger.error('Error during Supabase document retrieval setup', { requestId, err, documentId, userId });
      throw new NextResponse('Internal Server Error', { status: 500 }); // Catch setup errors
    }

    if (docError || !document) {
      logger.error('Error retrieving document from Supabase', { requestId, docError, documentId, userId });
      throw new NextResponse('Document not found or access denied', { status: 404 });
    }
    logger.info('Document successfully retrieved from Supabase', { requestId, documentId, userId, class_section_id: document.class_section_id });

    if (!document.extracted_text) {
      logger.warn('Document has no extracted text content', { requestId, documentId, userId });
      throw new NextResponse('Document has no text content to summarize', { status: 400 });
    }

    let generatedContent: any;
    let userMessage: string | null = null; // Initialize user message for AC3

    if (type === 'summary') {
      let summary: string;
      let startTime: number = 0; // Declare startTime here
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          logger.error('ANTHROPIC_API_KEY is not set for summary generation', { requestId, userId });
          throw new Error("ANTHROPIC_API_KEY is not set.");
        }
        if (document.extracted_text.length < 100) { // Specific check for summary length
          logger.warn('Document content too short for meaningful summarization', { requestId, documentId, userId, content_length: document.extracted_text.length });
          throw new NextResponse('Document content is too short for meaningful summarization.', { status: 400 });
        }

        const prompt = `Please provide a concise summary of the following text: ${document.extracted_text}`;
        logger.info('Calling Claude API for summary generation', { requestId, userId, prompt_length: prompt.length });

        startTime = Date.now(); // Assign value here
        const claudeResponse = await anthropic.messages.create({
          model: process.env.CLAUDE_MODEL_NAME || 'claude-3-opus-20240229',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });
        const duration = Date.now() - startTime; // End timer
        summary = claudeResponse.content[0].text;
        logger.info('Claude API responded successfully for summary generation', { requestId, userId, response_length: summary.length, generation_time_ms: duration, status: 'success' });

      } catch (claudeError: any) {
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Claude API call failed for summary generation', { requestId, userId, generation_time_ms: duration, status: 'failed', error_message: claudeError.message });
        throw handleClaudeError(claudeError, 'summary', requestId); // THROW from handleClaudeError
      }
      generatedContent = { summary };
    } else if (type === 'quiz') {
      const { quizLength: requestedQuizLength } = options || {};
      if (!requestedQuizLength || !['short', 'medium', 'long'].includes(requestedQuizLength)) {
        logger.warn('Invalid or missing quizLength option for quiz generation', { requestId, userId, quizLength: requestedQuizLength });
        throw new NextResponse('Invalid or missing quizLength option', { status: 400 });
      }

      const textLength = document.extracted_text.length;
      let effectiveQuizLength = requestedQuizLength;

      // Determine max allowed quiz length based on text content (AC3)
      if (textLength < 500 && requestedQuizLength !== 'short') {
        effectiveQuizLength = 'short';
        userMessage = `The document content is too short to generate a ${requestedQuizLength} quiz. Generating a short quiz instead.`;
        logger.warn('Adjusting quiz length due to insufficient content', { requestId, userId, requestedQuizLength, effectiveQuizLength, textLength });
      } else if (textLength >= 500 && textLength < 1500 && requestedQuizLength === 'long') {
        effectiveQuizLength = 'medium';
        userMessage = `The document content is not sufficient for a long quiz. Generating a medium quiz instead.`;
        logger.warn('Adjusting quiz length due to insufficient content', { requestId, userId, requestedQuizLength, effectiveQuizLength, textLength });
      }
      // If content is very short for any quiz, warn the user and return 400
      if (textLength < 100) {
        logger.warn('Document content too short for meaningful quiz generation', { requestId, documentId, userId, content_length: document.extracted_text.length });
        throw new NextResponse('Document content is too short for meaningful quiz generation.', { status: 400 });
      }

      let quiz: any;
      let startTime: number = 0; // Declare startTime here
      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          logger.error('ANTHROPIC_API_KEY is not set for quiz generation', { requestId, userId });
          throw new Error("ANTHROPIC_API_KEY is not set.");
        }

        let quizPrompt: string;
        if (effectiveQuizLength === 'short') {
          quizPrompt = `Generate a short multiple-choice quiz (3-5 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer). Text: ${document.extracted_text}`;
        } else if (effectiveQuizLength === 'medium') {
          quizPrompt = `Generate a medium multiple-choice quiz (6-8 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer). Text: ${document.extracted_text}`;
        } else {
          quizPrompt = `Generate a long multiple-choice quiz (9-12 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer). Text: ${document.extracted_text}`;
        }
        
        logger.info('Calling Claude API for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, prompt_length: quizPrompt.length, userMessage });
        startTime = Date.now(); // Assign value here
        const claudeResponse = await anthropic.messages.create({
          model: process.env.CLAUDE_MODEL_NAME || 'claude-3-opus-20240229',
          max_tokens: 2048,
          messages: [{ role: 'user', content: quizPrompt }],
        });
        const duration = Date.now() - startTime; // End timer
        quiz = JSON.parse(claudeResponse.content[0].text);
        logger.info('Claude API responded successfully for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, response_length: claudeResponse.content[0].text.length, generation_time_ms: duration, status: 'success' });

      } catch (claudeError: any) {
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Claude API call failed for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, generation_time_ms: duration, status: 'failed', error_message: claudeError.message });
        throw handleClaudeError(claudeError, 'quiz', requestId); // THROW from handleClaudeError
      }
      generatedContent = { quiz, message: userMessage };
    }

    // Database insert operation
    const { data, error: dbError } = await supabase
      .from('generated_content')
      .insert([
        {
          user_id: userId,
          study_material_id: documentId,
          class_section_id: document.class_section_id,
          content_type: type,
          content: generatedContent,
        },
      ])
      .select();

    if (dbError) {
      logger.error('Error saving generated content to Supabase', { requestId, dbError, documentId, userId, contentType: type });
      throw new NextResponse('Internal Server Error', { status: 500 });
    }
    logger.info('Generated content successfully saved to Supabase', { requestId, generatedContentId: data?.[0]?.id, documentId, userId, contentType: type });

    logger.info('API Generate Request completed successfully', { requestId, userId, type, documentId });
    return NextResponse.json(data);
  } catch (err: any) { // Top-level catch block
    if (err instanceof NextResponse) {
      return err; // Return the specific NextResponse
    }
    logger.error('Truly unhandled error during API Generate Request', { requestId, error: err, documentId, userId, type });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}