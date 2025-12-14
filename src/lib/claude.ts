import { NextResponse } from 'next/server'; // Import NextResponse for direct error throwing
import Anthropic from '@anthropic-ai/sdk'; // Import Anthropic SDK

const ANTHROPIC_MODEL_NAME = process.env.ANTHROPIC_MODEL_NAME || 'claude-3-opus-20240229'; // Updated model name

/**
 * Anthropic API client initialization.
 */
let claude: Anthropic | undefined;

// Explicitly use ANTHROPIC_API_KEY from .env.local
const API_KEY_FOR_APP = process.env.ANTHROPIC_API_KEY;

if (!API_KEY_FOR_APP) {
    throw new Error('ANTHROPIC_API_KEY is not set in .env.local for the application.');
}

claude = new Anthropic({ apiKey: API_KEY_FOR_APP }); // Initialize Anthropic client


/**
 * Handles errors from the Anthropic API.
 *
 * @param claudeError The error object returned from the Anthropic API.
 * @param generationType The type of generation that failed (e.g., 'summary', 'quiz').
 * @param requestId A unique ID for the request for logging purposes.
 * @returns An object conforming to { status: number, message: string }.
 */
export function handleClaudeError(claudeError: any, generationType: string, requestId: string): never {
    console.error('--- claudeError object in handleClaudeError ---', claudeError); // For debugging

    let status = 500;
    let message = `AI ${generationType} generation failed: An unexpected error occurred with the Claude API.`;

    // Refined Claude error handling logic.
    if (claudeError instanceof Anthropic.APIError) {
        status = claudeError.status;
        if (claudeError.status === 401 || claudeError.status === 403) {
            message = `Authentication/Authorization error with Claude API. Please check your API key.` ;
        } else if (claudeError.status === 429) {
            message = `Claude API rate limit exceeded. Please try again shortly.`;
        } else if (claudeError.status === 400) {
            message = `Invalid request to Claude API: ${claudeError.message || 'Bad Request'}`;
        } else {
            message = `Claude API internal error: ${claudeError.message || 'Internal Server Error'}`;
        }
    } else if (claudeError.message) {
        message = `Claude API Error: ${claudeError.message}`;
    }

    throw new NextResponse(message, { status });
}


/**
 * Generates a summary using the Claude API.
 *
 * @param prompt The prompt to send to the Claude model for summary generation.
 * @param requestId A unique ID for the request for logging purposes.
 * @returns A promise that resolves to the generated summary string.
 */
export async function generateSummaryWithClaude(prompt: string, requestId: string): Promise<string> {
    if (!claude) {
        throw new Error('Claude API client not initialized. Ensure ANTHROPIC_API_KEY is set.');
    }

    try {
        const response = await claude.messages.create({
            model: ANTHROPIC_MODEL_NAME,
            max_tokens: 1024,
            messages: [{ role: 'user', content: prompt }],
        });
        return response.content[0].text;

    } catch (error: any) {
        throw handleClaudeError(error, 'summary', requestId);
    }
}

/**
 * Generates a quiz using the Claude API.
 *
 * @param quizPrompt The prompt to send to the Claude model for quiz generation.
 * @param requestId A unique ID for the request for logging purposes.
 * @returns A promise that resolves to the generated quiz object (needs to be parsed from string).
 */
export async function generateQuizWithClaude(quizPrompt: string, requestId: string): Promise<string> {
    if (!claude) {
        throw new Error('Claude API client not initialized. Ensure ANTHROPIC_API_KEY is set.');
    }

    try {
        const response = await claude.messages.create({
            model: ANTHROPIC_MODEL_NAME,
            max_tokens: 2048, // Quizzes typically need more tokens
            messages: [{ role: 'user', content: quizPrompt }],
        });
        return response.content[0].text;

    } catch (error: any) {
        throw handleClaudeError(error, 'quiz', requestId);
    }
}
