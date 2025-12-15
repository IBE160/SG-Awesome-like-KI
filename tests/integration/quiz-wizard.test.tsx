// tests/integration/quiz-wizard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizWizard from '@/components/quiz-wizard/QuizWizard';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));
const mockCreateClient = createClient as jest.Mock;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockUseRouter = useRouter as jest.Mock;
const mockPush = jest.fn();

describe('QuizWizard Integration Tests', () => {
  const mockDocuments = [
    { id: 'doc1', original_name: 'Document 1' },
    { id: 'doc2', original_name: 'Document 2' },
  ];

  beforeEach(() => {
    mockPush.mockClear();
    mockUseRouter.mockReturnValue({ push: mockPush });

    // Mock Supabase session and document fetch
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn((callback) => callback({ data: mockDocuments, error: null })),
      }),
    });

    // Mock fetch API for /api/generate
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ content: { id: 'generated-quiz-id' }, message: null }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('completes the wizard flow and triggers API call successfully', async () => {
    render(<QuizWizard onClose={() => {}} />);

    // Step 1: Document Selection
    await waitFor(() => {
      expect(screen.getByText('Select Document(s)')).toBeInTheDocument();
      expect(screen.getByLabelText('Choose one or more Study Materials:')).toBeInTheDocument();
    });
    
    // Select a document
    fireEvent.change(screen.getByLabelText('Choose one or more Study Materials:'), {
      target: { selectedOptions: [screen.getByText('Document 1')] }
    });

    fireEvent.click(screen.getByText('Next'));

    // Step 2: Quiz Options
    await waitFor(() => {
      expect(screen.getByText('Configure Quiz Options')).toBeInTheDocument();
    });
    // Change quiz length
    fireEvent.click(screen.getByLabelText('Short (3-5 questions)'));
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Generate Quiz (Progress Step)
    await waitFor(() => {
      expect(screen.getByText('Quiz Generation Progress')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Generate')); // Click the Generate button on the last step

    await waitFor(() => {
      expect(screen.getByText('Generating your quiz...')).toBeInTheDocument();
    });

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toBe('/api/generate');
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody).toEqual({
        studyMaterialIds: ['doc1'],
        type: 'quiz',
        options: { quizLength: 'short', questionType: 'multiple_choice' },
      });
    });
    
    // Verify successful generation and redirection
    await waitFor(() => {
      expect(screen.getByText('Quiz generated successfully!')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/quiz/generated-quiz-id');
    });
  });

  it('handles API generation error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'API failed for some reason.' }),
      })
    ) as jest.Mock;

    render(<QuizWizard onClose={() => {}} />);

    // Step 1: Document Selection
    await waitFor(() => screen.getByText('Document 1'));
    fireEvent.change(screen.getByLabelText('Choose one or more Study Materials:'), {
      target: { selectedOptions: [screen.getByText('Document 1')] }
    });
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Quiz Options
    await waitFor(() => screen.getByText('Configure Quiz Options'));
    fireEvent.click(screen.getByLabelText('Medium (6-8 questions)'));
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Generate Quiz
    await waitFor(() => screen.getByText('Quiz Generation Progress'));
    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByText('Error during generation:')).toBeInTheDocument();
      expect(screen.getByText('API failed for some reason.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry generation/i })).toBeInTheDocument();
    });

    // Verify retry functionality
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: { id: 'retried-quiz-id' }, message: null }),
        })
    ) as jest.Mock;
    fireEvent.click(screen.getByRole('button', { name: /retry generation/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial call + retry call
      expect(screen.getByText('Quiz generated successfully!')).toBeInTheDocument();
      expect(mockPush).toHaveBeenCalledWith('/quiz/retried-quiz-id');
    });
  });

  it('prevents navigation if no documents are selected on the first step', async () => {
    render(<QuizWizard onClose={() => {}} />);
    await waitFor(() => {
      expect(screen.getByText('Select Document(s)')).toBeInTheDocument();
    });
    
    // Do NOT select any document
    fireEvent.click(screen.getByText('Next'));

    expect(screen.getByText('Please select at least one document to proceed.')).toBeInTheDocument();
    expect(screen.queryByText('Configure Quiz Options')).not.toBeInTheDocument(); // Should not advance
  });
});
