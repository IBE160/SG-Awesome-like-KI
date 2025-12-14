import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

import { generateSummaryWithClaude, generateQuizWithClaude, handleClaudeError } from '@/lib/claude'; // Updated import

const logger = {
  info: (message: string, context?: object) => console.log(`INFO: ${message}`, context),
  warn: (message: string, context?: object) => console.warn(`WARN: ${message}`, context),
  error: (message: string, context?: object) => console.error(`ERROR: ${message}`, context),
};

// Define constants for minimum text lengths required for different quiz lengths
const MIN_TEXT_LENGTH_SHORT_QUIZ = 100;
const MIN_TEXT_LENGTH_MEDIUM_QUIZ = 500;
const MIN_TEXT_LENGTH_LONG_QUIZ = 1500;

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
    originalDocumentId = body.studyMaterialId; // Store original studyMaterialId
    actualDocumentId = body.studyMaterialId; // Initialize actualDocumentId with the original
    if (!actualDocumentId) {
      logger.warn('Missing studyMaterialId in request body', { requestId, userId, type });
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
      throw NextResponse.json({ error: 'Database error while retrieving document.' }, { status: 500 }); // Catch setup errors and respond with JSON
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
        if (!process.env.ANTHROPIC_API_KEY) { // Changed to ANTHROPIC_API_KEY
          logger.error('ANTHROPIC_API_KEY is not set for summary generation', { requestId, userId });
          return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set on the server. Please add it to your .env.local file.' }, { status: 500 });
        }
        if (document.extracted_text.length < MIN_TEXT_LENGTH_SHORT_QUIZ) { // Re-using constant for consistency
          logger.warn('Document content too short for meaningful summarization', { requestId, actualDocumentId, userId, content_length: document.extracted_text.length });
          throw new NextResponse('Document content is too short for meaningful summarization.', { status: 400 });
        }

        const prompt = `Please provide a concise summary of the following text, ensuring the summary is in the same language as the original text: ${document.extracted_text}`;
        logger.info('Calling Claude API for summary generation', { requestId, userId, prompt_length: prompt.length }); // Changed to Claude

        startTime = Date.now(); // Assign value here
        const claudeSummary = await generateSummaryWithClaude(prompt, requestId); // Changed to Claude
        const duration = Date.now() - startTime; // End timer
        summary = claudeSummary;
        logger.info('Claude API responded successfully for summary generation', { requestId, userId, response_length: summary.length, generation_time_ms: duration, status: 'success' }); // Changed to Claude

      } catch (claudeError: any) { // Changed to Claude
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Claude API call failed for summary generation', { requestId, userId, generation_time_ms: duration, status: 'failed', error_message: claudeError.message }); // Changed to Claude
        throw handleClaudeError(claudeError, 'summary', requestId); // Changed to Claude
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
      let quizQuestionCount = '';

      // Determine max allowed quiz length based on text content (AC3)
      if (textLength < MIN_TEXT_LENGTH_SHORT_QUIZ) {
        logger.warn('Document content too short for meaningful quiz generation', { requestId, documentId: actualDocumentId, userId, content_length: document.extracted_text.length });
        return NextResponse.json({ error: 'Document content is too short for meaningful quiz generation.' }, { status: 400 });
      } else if (textLength < MIN_TEXT_LENGTH_MEDIUM_QUIZ) {
        if (requestedQuizLength !== 'short') {
          effectiveQuizLength = 'short';
          userMessage = `The document content is too short to generate a ${requestedQuizLength} quiz. Generating a short quiz instead.`;
          logger.warn('Adjusting quiz length due to insufficient content', { requestId, userId, requestedQuizLength, effectiveQuizLength, textLength });
        }
        quizQuestionCount = '(3-5 questions)';
      } else if (textLength < MIN_TEXT_LENGTH_LONG_QUIZ) {
        if (requestedQuizLength === 'long') {
          effectiveQuizLength = 'medium';
          userMessage = `The document content is not sufficient for a long quiz. Generating a medium quiz instead.`;
          logger.warn('Adjusting quiz length due to insufficient content', { requestId, userId, requestedQuizLength, effectiveQuizLength, textLength });
        }
        quizQuestionCount = effectiveQuizLength === 'short' ? '(3-5 questions)' : '(6-8 questions)';
      } else {
        // Sufficient length for a long quiz
        quizQuestionCount = effectiveQuizLength === 'short' ? '(3-5 questions)' : effectiveQuizLength === 'medium' ? '(6-8 questions)' : '(9-12 questions)';
      }


      let quiz: any;
      let startTime: number = 0; // Declare startTime here
      try {
        if (!process.env.ANTHROPIC_API_KEY) { // Changed to ANTHROPIC_API_KEY
          logger.error('ANTHROPIC_API_KEY is not set for quiz generation', { requestId, userId });
          return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set on the server. Please add it to your .env.local file.' }, { status: 500 });
        }

        let quizPrompt: string;
        quizPrompt = `Generate a ${effectiveQuizLength} multiple-choice quiz ${quizQuestionCount} from the following text. Provide the output as a JSON array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer). Text: ${document.extracted_text}`;
        
        logger.info('Calling Claude API for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, prompt_length: quizPrompt.length, userMessage }); // Changed to Claude
        startTime = Date.now(); // Assign value here
        const claudeQuiz = await generateQuizWithClaude(quizPrompt, requestId); // Changed to Claude
        const duration = Date.now() - startTime; // End timer
        quiz = JSON.parse(claudeQuiz);
        logger.info('Claude API responded successfully for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, response_length: claudeQuiz.length, generation_time_ms: duration, status: 'success' }); // Changed to Claude

      } catch (claudeError: any) { // Changed to Claude
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Claude API call failed for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, generation_time_ms: duration, status: 'failed', error_message: claudeError.message }); // Changed to Claude
        throw handleClaudeError(claudeError, 'quiz', requestId); // Changed to Claude
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
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}