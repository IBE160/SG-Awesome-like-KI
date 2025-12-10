// src/lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the Gemini API key from environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

// Initialize the GoogleGenerativeAI client with the API key
const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function generateSummaryWithGemini(text: string): Promise<string> {
  if (!text || text.trim().length < 50) {
    throw new Error("Insufficient text to generate a meaningful summary.");
  }

  try {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Summarize the following text in a concise way, highlighting the key points:\n\n${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();
    
    return summary;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Failed to generate summary with Gemini AI.");
  }
}

export async function generateQuizWithGemini(text: string, quizLength: "short" | "medium" | "long"): Promise<any> {
  if (!text || text.trim().length < 100) {
    throw new Error("Insufficient text to generate a meaningful quiz.");
  }

  let numberOfQuestions: number;
  switch (quizLength) {
    case "short":
      numberOfQuestions = 3;
      break;
    case "medium":
      numberOfQuestions = 5;
      break;
    case "long":
      numberOfQuestions = 8;
      break;
    default:
      numberOfQuestions = 3; // Default to short
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Create a multiple-choice quiz with ${numberOfQuestions} questions based on the following text. For each question, provide 4 options (A, B, C, D), indicate the correct answer, and provide a brief explanation for the correct answer. The output should be a JSON object with a "questions" array. Each object in the array should have "id", "question", "options" (an array of strings), "correctAnswer", and "explanation" fields.

    Text:
    ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const quizJson = response.text();
    
    // The model sometimes returns the JSON wrapped in ```json ... ```, so we need to clean it up
    const cleanedJson = quizJson.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    throw new Error("Failed to generate quiz with Gemini AI.");
  }
}