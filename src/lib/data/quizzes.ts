import { createClient } from '@/lib/supabase';

// Define the QuizQuestion and QuizData interfaces
export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string; // The correct answer text
  explanation: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

interface GeneratedContent {
  id: string;
  study_material_id: string; // Assuming a link to study material
  type: 'summary' | 'quiz';
  content: QuizData; // Store QuizData directly
  user_id: string;
  created_at: string;
}

/**
 * Fetches quiz data from Supabase by its ID.
 * @param quizId The ID of the quiz to fetch.
 * @returns A Promise that resolves to QuizData or null if not found.
 */
export async function fetchQuizById(quizId: string): Promise<QuizData | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('generated_content')
    .select('*')
    .eq('id', quizId)
    .eq('type', 'quiz')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means 'Row not found', which is not an error for us.
    console.error('Error fetching quiz by ID:', error);
    return null;
  }

  if (data) {
    // Assuming 'content' field directly holds the QuizData structure
    return (data as GeneratedContent).content;
  }

  return null;
}
