import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

import { generateSummaryWithGemini, generateQuizWithGemini, handleGeminiError, GeminiAPIError } from '@/lib/gemini';

const logger = {
  info: (message: string, context?: object) => console.log(`INFO: ${message}`, context),
  warn: (message: string, context?: object) => console.warn(`WARN: ${message}`, context),
  error: (message: string, context?: object) => console.error(`ERROR: ${message}`, context),
};

export async function POST(req: Request) {
  const requestId = uuidv4(); // Generate a unique request ID
  logger.info('API Generate Request received', { requestId, url: req.url, method: req.method });

  const requestMetrics = {
    summary: { success: 0, failed: 0, duration_ms: 0 },
    quiz: { success: 0, failed: 0, duration_ms: 0 },
  };

  let actualDocumentId: string | undefined; // Declare actualDocumentId here to ensure it's always in scope
  let originalDocumentId: string | undefined; // Keep track of the original for initial logging if needed
  let document: any; // Declare document here for broader scope
  let userId: string | undefined; // Declare userId here for broader scope
  let type: string | undefined; // Declare type here for broader scope

  try { // Top-level try block starts here
    const supabase = await createClient();

    const {
      data: { user },
    }
    = await supabase.auth.getUser(); // Changed to getUser

    if (!user) { // Check for user
      logger.warn('Unauthorized access attempt to API Generate', { requestId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    userId = user.id; // Use user.id
    let body;
    try {
      body = await req.json();
      logger.info('Raw request body received', { requestId, body }); // Diagnostic log
    } catch (parseError) {
      logger.error('Failed to parse request body as JSON', { requestId, error: parseError });
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { type, studyMaterialId, studyMaterialIds, options } = body;
    let documentIdToFetch: string | undefined;

    if (type === 'summary') {
      documentIdToFetch = studyMaterialId;
    } else if (type === 'quiz') {
      if (!studyMaterialIds || !Array.isArray(studyMaterialIds) || studyMaterialIds.length === 0) {
        logger.warn('Missing or empty studyMaterialIds for quiz generation', { requestId, userId, type });
        return new NextResponse('Missing or empty studyMaterialIds for quiz generation', { status: 400 });
      }
      documentIdToFetch = studyMaterialIds[0];
    } else {
      logger.warn('Invalid request type', { requestId, userId, type });
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!documentIdToFetch) {
        logger.warn('Missing document ID for content generation', { requestId, userId, type });
        return NextResponse.json({ error: 'Missing document ID for content generation' }, { status: 400 });
    }
    actualDocumentId = documentIdToFetch; // Ensure actualDocumentId for the query is derived from validated ID
    logger.info('Request body details', { requestId, userId, type, documentId: actualDocumentId, options });

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
      return NextResponse.json({ error: 'Document not found or access denied' }, { status: 404 });
    }
    logger.info('Document successfully retrieved from Supabase', { requestId, documentId: actualDocumentId, userId, class_section_id: document.class_section_id });

    if (!document.extracted_text) {
      logger.warn('Document has no extracted text content', { requestId, documentId, userId });
      return NextResponse.json({ error: 'Document has no text content to summarize' }, { status: 400 });
    }

    let generatedContent: any;
    let userMessage: string | null = null; // Initialize user message for AC3
    let quiz: any; // Declare quiz in broader scope
    let motivationalFeedback: string | null = null; // Declare motivationalFeedback in broader scope

    if (type === 'summary') {
      let summary: string;
      let startTime: number = 0; // Declare startTime here
      try {
        if (!process.env.GEMINI_API_KEY) {
          logger.error('GEMINI_API_KEY is not set for summary generation', { requestId, userId });
          return NextResponse.json({ error: 'GEMINI_API_KEY is not set on the server. Please add it to your .env.local file.' }, { status: 500 });
        }
        if (document.extracted_text.length < 100) { // Specific check for summary length
          logger.warn('Document content too short for meaningful summarization', { requestId, actualDocumentId, userId, content_length: document.extracted_text.length });
          return NextResponse.json({ error: 'Document content is too short for meaningful summarization.' }, { status: 400 });
        }

                    const prompt = `Please provide a concise summary of the following text, ensuring the summary is in the same language as the original text: ${document.extracted_text}`;        logger.info('Calling Gemini API for summary generation', { requestId, userId, prompt_length: prompt.length });

        startTime = Date.now(); // Assign value here
        const geminiSummary = await generateSummaryWithGemini(prompt, requestId);
        const duration = Date.now() - startTime; // End timer
        summary = geminiSummary;
        logger.info('Gemini API responded successfully for summary generation', { requestId, userId, response_length: summary.length, generation_time_ms: duration, status: 'success' });
        requestMetrics.summary.success = 1;
        requestMetrics.summary.duration_ms = duration;

      } catch (geminiError: any) {
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Gemini API call failed for summary generation', { requestId, userId, generation_time_ms: duration, status: 'failed', error_message: geminiError.message });
        requestMetrics.summary.failed = 1;
        requestMetrics.summary.duration_ms = duration;
        throw handleGeminiError(geminiError, 'summary', requestId);
      }
      generatedContent = { summary };
    } else if (type === 'quiz') {
      const { quizLength: requestedQuizLength } = options || {};
      if (!requestedQuizLength || !['short', 'medium', 'long'].includes(requestedQuizLength)) {
        logger.warn('Invalid or missing quizLength option for quiz generation', { requestId, userId, quizLength: requestedQuizLength });
        return NextResponse.json({ error: 'Invalid or missing quizLength option' }, { status: 400 });
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
        logger.warn('Document content too short for meaningful quiz generation', { requestId, documentId: actualDocumentId, userId, content_length: document.extracted_text.length });
        return NextResponse.json({ error: 'Document content is too short for meaningful quiz generation.' }, { status: 400 });
      }

      let quiz: any;
      let startTime: number = 0; // Declare startTime here
      try {
        if (!process.env.GEMINI_API_KEY) {
          logger.error('GEMINI_API_KEY is not set for quiz generation', { requestId, userId });
          return NextResponse.json({ error: 'GEMINI_API_KEY is not set on the server. Please add it to your .env.local file.' }, { status: 500 });
        }

        let quizPrompt: string;
        const baseQuizPrompt = `Generate a multiple-choice quiz from the following text. Provide motivational feedback and explanations for quiz answers in a supportive and educational tone. The output should be a JSON object with two fields: 'motivational_feedback' (a string with overall positive reinforcement and encouragement) and 'quiz' (an array of objects, where each object has 'question', 'options' (an array of strings), 'answer' (the correct option string), and 'explanation' (a string explaining the correct answer)). Ensure the quiz and feedback are in the same language as the original text.`;

        if (effectiveQuizLength === 'short') {
          quizPrompt = `Generate a short (3-5 questions) ${baseQuizPrompt} Text: ${document.extracted_text}`;
        } else if (effectiveQuizLength === 'medium') {
          quizPrompt = `Generate a medium (6-8 questions) ${baseQuizPrompt} Text: ${document.extracted_text}`;
        } else {
          quizPrompt = `Generate a long (9-12 questions) ${baseQuizPrompt} Text: ${document.extracted_text}`;
        }
        
        logger.info('Calling Gemini API for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, prompt_length: quizPrompt.length, userMessage });
        startTime = Date.now(); // Assign value here
        const geminiQuiz = await generateQuizWithGemini(quizPrompt, requestId);
        const duration = Date.now() - startTime; // End timer

        // Find the start and end of the JSON object in the response
        const jsonStartIndex = geminiQuiz.indexOf('{');
        const jsonEndIndex = geminiQuiz.lastIndexOf('}');
        let cleanedGeminiResponse = '';

        if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
            cleanedGeminiResponse = geminiQuiz.substring(jsonStartIndex, jsonEndIndex + 1);
        } else {
            // Fallback if direct { } aren't found, try removing markdown fences as before
            cleanedGeminiResponse = geminiQuiz.replace(/```json\n|\n```/g, '');
            logger.warn('JSON object boundaries not found, falling back to markdown fence removal.', { requestId, geminiQuizSample: geminiQuiz.substring(0, 200) });
        }
        
        let parsedGeminiResponse;
        try {
            parsedGeminiResponse = JSON.parse(cleanedGeminiResponse);
            logger.info('Parsed Gemini Response:', { requestId, parsedGeminiResponse });
        } catch (parseError: any) {
            logger.error('Failed to parse Gemini response into JSON', { requestId, cleanedGeminiResponse, parseError: parseError.message });
            throw new GeminiAPIError(`Failed to parse Gemini response: ${parseError.message}`, 500, parseError);
        }

        motivationalFeedback = parsedGeminiResponse.motivational_feedback; // Extract motivational feedback
        let quizData = parsedGeminiResponse.quiz; // Extract quiz

        if (Array.isArray(quizData)) {
          quizData = quizData.map((question: any) => {
            if (!question.explanation || question.explanation.trim() === '') {
              logger.warn('AI did not provide an explanation for a quiz question', { requestId, question: question.question });
              question.explanation = 'Explanation not available.';
            }
            if (typeof question.answer !== 'string') {
                logger.warn('AI did not provide a valid string answer for a quiz question, setting to empty string', { requestId, question: question.question, originalAnswer: question.answer });
                question.answer = ''; // Ensure answer is always a string
                logger.info('Question answer was invalid, set to empty string', { requestId, question: question.question, modifiedQuestion: question });
            }
            return question;
          });
        }
        quiz = quizData; // Assign the processed quiz data back to quiz
        logger.info('Gemini API responded successfully for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, response_length: geminiQuiz.length, generation_time_ms: duration, status: 'success' });
        requestMetrics.quiz.success = 1;
        requestMetrics.quiz.duration_ms = duration;

      } catch (geminiError: any) {
        const duration = Date.now() - startTime; // Calculate duration even on error
        logger.error('Gemini API call failed for quiz generation', { requestId, userId, requestedQuizLength, effectiveQuizLength, generation_time_ms: duration, status: 'failed', error_message: geminiError.message });
        requestMetrics.quiz.failed = 1;
        requestMetrics.quiz.duration_ms = duration;
        throw handleGeminiError(geminiError, 'quiz', requestId);
      }
      generatedContent = { quiz, motivational_feedback: motivationalFeedback, message: userMessage }; // Include motivational_feedback
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
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    logger.info('Generated content successfully saved to Supabase', { requestId, generatedContentId: data?.[0]?.id, documentId: originalDocumentId, userId, contentType: type });

    logger.info('API Generate Request completed successfully', { requestId, userId, type, documentId: originalDocumentId, metrics: requestMetrics });
    return NextResponse.json({ content: generatedContent, message: userMessage, generatedContentId: data?.[0]?.id });
  } catch (err: any) { // Top-level catch block
    if (err instanceof NextResponse) {
      return err; // Return the specific NextResponse
    } else if (err instanceof GeminiAPIError) { // Handle GeminiAPIError
      logger.error('GeminiAPIError caught in top-level handler', { requestId, error: err.message, status: err.status, originalError: err.originalError });
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    logger.error('Truly unhandled error during API Generate Request', { requestId, error: err, documentId: originalDocumentId, userId, type, metrics: requestMetrics });
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}