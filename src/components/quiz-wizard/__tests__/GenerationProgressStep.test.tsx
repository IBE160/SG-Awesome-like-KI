// src/components/quiz-wizard/__tests__/GenerationProgressStep.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenerationProgressStep from '../GenerationProgressStep';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('GenerationProgressStep', () => {
  const mockPush = jest.fn();
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    mockPush.mockClear();
    mockOnGenerate.mockClear();
    mockUseRouter.mockReturnValue({ push: mockPush });
  });

  it('renders loading state when isGenerating is true', () => {
    render(
      <GenerationProgressStep
        isGenerating={true}
        status="Generating quiz..."
        error={null}
        generatedContentId={null}
        onGenerate={mockOnGenerate}
      />
    );
    expect(screen.getByText('Generating quiz...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument(); // Tailwind animate-spin creates a progressbar role
  });

  it('renders error state when error is present', () => {
    render(
      <GenerationProgressStep
        isGenerating={false}
        status={null}
        error="Failed to generate."
        generatedContentId={null}
        onGenerate={mockOnGenerate}
      />
    );
    expect(screen.getByText('Error during generation:')).toBeInTheDocument();
    expect(screen.getByText('Failed to generate.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry generation/i })).toBeInTheDocument();
  });

  it('calls onGenerate when retry button is clicked', () => {
    render(
      <GenerationProgressStep
        isGenerating={false}
        status={null}
        error="Failed to generate."
        generatedContentId={null}
        onGenerate={mockOnGenerate}
      />
    );
    screen.getByRole('button', { name: /retry generation/i }).click();
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
  });

  it('redirects to generated quiz page on success', async () => {
    const generatedId = 'quiz-123';
    render(
      <GenerationProgressStep
        isGenerating={false}
        status="Quiz generated successfully!"
        error={null}
        generatedContentId={generatedId}
        onGenerate={mockOnGenerate}
      />
    );

    expect(screen.getByText('Quiz generated successfully!')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(`/quiz/${generatedId}`);
    });
    expect(screen.getByRole('link', { name: /view quiz/i })).toHaveAttribute('href', `/quiz/${generatedId}`);
  });

  it('does not redirect if still generating or error exists', () => {
    render(
      <GenerationProgressStep
        isGenerating={true}
        status="Generating..."
        error={null}
        generatedContentId="quiz-456"
        onGenerate={mockOnGenerate}
      />
    );
    expect(mockPush).not.toHaveBeenCalled();

    render(
      <GenerationProgressStep
        isGenerating={false}
        status={null}
        error="Error!"
        generatedContentId="quiz-789"
        onGenerate={mockOnGenerate}
      />
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
