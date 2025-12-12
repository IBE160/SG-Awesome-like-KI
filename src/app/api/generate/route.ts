import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

import { generateSummaryWithGemini, generateQuizWithGemini, handleGeminiError } from '@/lib/gemini';

const logger = {
  info: (message: string, context?: object) => console.log(`INFO: ${message}`, context),
  warn: (message: string, context?: object) => console.warn(`WARN: ${message}`, context),
  error: (message: string, context?: object) => console.error(`ERROR: ${message}`, context),
};

export async function POST(req: Request) {
  const requestId = uuidv4(); // Generate a unique request ID
  logger.info('API Generate Request received', { requestId, url: req.url, method: req.method });

  let actualDocumentId: string | undefined; // Declare actualDocumentId here to ensure it's always in scope
  let originalDocumentId: string | undefined; // Keep track of the original for initial logging if needed
  let document: any; // Declare document here for broader scope
  let userId: string | undefined; // Declare userId here for broader scope
  let type: string | undefined; // Declare type here for broader scope

  try { // Top-level try block starts here
    const supabase = await createClient();

    const {
      data: { session },
    }
    = await supabase.auth.getSession();

    if (!session) {
      logger.warn('Unauthorized access attempt to API Generate', { requestId });
      throw new NextResponse('Unauthorized', { status: 401 });
    }

    userId = session.user.id; // Assign to the already declared userId
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      logger.error('Failed to parse request body as JSON', { requestId, error: parseError });
      throw new NextResponse('Invalid JSON in request body', { status: 400 });
    }

    type = body.type; // Assign to the already declared type
    originalDocumentId = body.documentId; // Store original documentId
    actualDocumentId = body.documentId; // Initialize actualDocumentId with the original
    if (!actualDocumentId) {
      logger.warn('Missing documentId in request body', { requestId, userId, type });
      throw new NextResponse('Document ID is required', { status: 400 });
    }
    const options = body.options;
    
    logger.info('Request body details', { requestId, userId, type, documentId: originalDocumentId, options });

    let docError: any;
    try {
      ({ data: document, error: docError } = await supabase
        .from('study_materials')
        .select('extracted_text, class_section_id')
        .eq('id', actualDocumentId) // Use actualDocumentId for Supabase query
        .eq('user_id', userId)
        .single());
    } catch (err: any) {
      logger.error('Error during Supabase document retrieval setup', { requestId, err, documentId: actualDocumentId, userId });
      throw new NextResponse('Internal Server Error', { status: 500 }); // Catch setup errors
    }

    if (docError || !document) {
      logger.error('Error retrieving document from Supabase', { requestId, docError, documentId: actualDocumentId, userId });
      throw new NextResponse('Document not found or access denied', { status: 404 });
    }
    logger.info('Document successfully retrieved from Supabase', { requestId, documentId: actualDocumentId, userId, class_section_id: document.class_section_id });

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
        if (!process.env.GEMINI_API_KEY) {
          logger.error('GEMINI_API_KEY is not set for summary generation', { requestId, userId });
          throw new Error("GEMINI_API_KEY is not set.");
        }
        if (document.extracted_text.length < 100) { // Specific check for summary length
          logger.warn('Document content too short for meaningful summarization', { requestId, actualDocumentId, userId, content_length: document.extracted_text.length });
          throw new NextResponse('Document content is too short for meaningful summarization.', { status: 400 });
        }

        const prompt = `Please provide a concise summary of the following text: ${document.extracted_text}`;
        logger.info('Calling Gemini API for summary generation', { requestId, userId, prompt_length: prompt.length });

        startTime = Date.now(); // Assign value here
        const geminiSummary = await generateSummaryWithGemini(prompt, requestId);
        const duration = Date.now() - startTime; // End timer
        summary = geminiSummary;
        logger.info('Gemini API responded successfully for summary generation', { requestId, userId, response_length: summary.length, generation_time_ms: duration, status: 'success' });

      } catch (geminiError: any) {
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Gemini API call failed for summary generation', { requestId, userId, generation_time_ms: duration, status: 'failed', error_message: geminiError.message });
        throw handleGeminiError(geminiError, 'summary', requestId);
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
        if (!process.env.GEMINI_API_KEY) {
          logger.error('GEMINI_API_KEY is not set for quiz generation', { requestId, userId });
          throw new Error("GEMINI_API_KEY is not set.");
        }

        let quizPrompt: string;
        if (effectiveQuizLength === 'short') {
          quizPrompt = `Generate a short multiple-choice quiz (3-5 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer). Text: ${document.extracted_text}`;
        } else if (effectiveQuizLength === 'medium') {
          quizPrompt = `Generate a medium multiple-choice quiz (6-8 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer). Text: ${document.extracted_text}`;
        } else {
          quizPrompt = `Generate a long multiple-choice quiz (9-12 questions) from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer). Text: ${document.extracted_text}`;
        }
        
        logger.info('Calling Gemini API for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, prompt_length: quizPrompt.length, userMessage });
        startTime = Date.now(); // Assign value here
        const geminiQuiz = await generateQuizWithGemini(quizPrompt, requestId);
        const duration = Date.now() - startTime; // End timer
        quiz = JSON.parse(geminiQuiz);
        logger.info('Gemini API responded successfully for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, response_length: geminiQuiz.length, generation_time_ms: duration, status: 'success' });

      } catch (geminiError: any) {
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Gemini API call failed for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, generation_time_ms: duration, status: 'failed', error_message: geminiError.message });
        throw handleGeminiError(geminiError, 'quiz', requestId);
      }
      generatedContent = { quiz, message: userMessage };
    }

    // Database insert operation
    const { data, error: dbError } = await supabase
      .from('generated_content')
      .insert([
        {
          user_id: userId,
          study_material_id: actualDocumentId,
          class_section_id: document.class_section_id,
          type: type,
          content: generatedContent,
        },
      ])
      .select();

    if (dbError) {
      logger.error('Error saving generated content to Supabase', { requestId, dbError, documentId: originalDocumentId, userId, contentType: type });
      throw new NextResponse('Internal Server Error', { status: 500 });
    }
    logger.info('Generated content successfully saved to Supabase', { requestId, generatedContentId: data?.[0]?.id, documentId: originalDocumentId, userId, contentType: type });

    logger.info('API Generate Request completed successfully', { requestId, userId, type, documentId: originalDocumentId });
    return NextResponse.json({ content: generatedContent });
  } catch (err: any) { // Top-level catch block
    if (err instanceof NextResponse) {
      return err; // Return the specific NextResponse
    }
    logger.error('Truly unhandled error during API Generate Request', { requestId, error: err, documentId: originalDocumentId, userId, type });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}