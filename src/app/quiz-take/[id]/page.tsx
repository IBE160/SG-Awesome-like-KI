// src/app/quiz-take/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { QuizProvider } from '@/lib/context/QuizContext';
import QuizInterface from '@/app/components/quiz/QuizInterface';

interface QuizTakePageProps {
  params: {
    id: string; // This will be the generated_content ID
  };
}

export default async function QuizTakePage({ params }: QuizTakePageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient();

  const { data: generatedContent, error: contentError } = await supabase
    .from('generated_content')
    .select('content')
    .eq('id', id)
    .single();

  if (contentError || !generatedContent) {
    console.error('Error fetching generated content:', contentError?.message || 'Content not found');
    notFound(); // Display Next.js 404 page if content is not found
  }

  const quizData = generatedContent.content;

  if (generatedContent.type !== 'quiz' || !quizData || !quizData.quiz) {
    console.error('Fetched content is not a valid quiz:', {
      type: generatedContent.type,
      quizDataExists: !!quizData,
      quizDataQuizExists: !!quizData?.quiz,
      fullQuizData: quizData
    });
    notFound(); // Display 404 if content is not a valid quiz
  }

  // The QuizInterface expects data in a specific format, reconstruct if necessary
  const formattedQuizData = {
    motivationalFeedback: quizData.motivational_feedback || '',
    questions: quizData.quiz.map((q: any) => ({
      questionText: q.question,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation || 'Explanation not available.', // Ensure explanation exists
    })),
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Take Quiz</h1>
      <QuizProvider initialQuizData={formattedQuizData}>
        <QuizInterface />
      </QuizProvider>
    </div>
  );
}
