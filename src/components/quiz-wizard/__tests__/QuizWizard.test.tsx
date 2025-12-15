// src/components/quiz-wizard/__tests__/QuizWizard.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizWizard from '../QuizWizard';

// Mock child components
jest.mock('../DocumentSelectionStep', () => {
  return ({ onDocumentSelect, preselectedDocumentIds }: any) => {
    // Simulate selection in the mocked component
    React.useEffect(() => {
      if (preselectedDocumentIds && preselectedDocumentIds.length > 0) {
        onDocumentSelect(preselectedDocumentIds);
      }
    }, [preselectedDocumentIds, onDocumentSelect]);
    return (
      <div data-testid="document-selection-step">
        Document Selection Step
        <button onClick={() => onDocumentSelect(['doc1'])}>Select Doc1</button>
        <button onClick={() => onDocumentSelect([])}>Clear Docs</button>
      </div>
    );
  };
});

jest.mock('../QuizOptionsStep', () => {
  return ({ onSelectOptions, initialOptions }: any) => {
    React.useEffect(() => {
      onSelectOptions(initialOptions); // Ensure options are set
    }, [initialOptions, onSelectOptions]);
    return (
      <div data-testid="quiz-options-step">
        Quiz Options Step
        <button onClick={() => onSelectOptions({ quizLength: 'long', questionType: 'multiple_choice' })}>
          Set Long Quiz
        </button>
      </div>
    );
  };
});

jest.mock('../GenerationProgressStep', () => {
  return ({ isGenerating, status, error, generatedContentId, onGenerate }: any) => (
    <div data-testid="generation-progress-step">
      Generation Progress Step
      {isGenerating && <span data-testid="generating-status">{status}</span>}
      {error && <span data-testid="generation-error">{error}</span>}
      {generatedContentId && <span data-testid="generated-id">{generatedContentId}</span>}
      <button onClick={onGenerate}>Trigger Generate</button>
    </div>
  );
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('QuizWizard', () => {
  // Mock fetch API
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ content: { id: 'generated-quiz-id' } }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the first step by default', () => {
    render(<QuizWizard onClose={() => {}} />);
    expect(screen.getByText('Guided Quiz Generation')).toBeInTheDocument();
    expect(screen.getByText('Document Selection')).toBeInTheDocument();
    expect(screen.getByTestId('document-selection-step')).toBeInTheDocument();
  });

  it('navigates to the next step when "Next" is clicked and document is selected', async () => {
    render(<QuizWizard initialDocumentId="doc1" onClose={() => {}} />);
    
    // Simulate document selection in the mocked component
    fireEvent.click(screen.getByText('Select Doc1'));
    
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
        expect(screen.getByText('Quiz Options')).toBeInTheDocument();
        expect(screen.getByTestId('quiz-options-step')).toBeInTheDocument();
    });
  });

  it('shows error when "Next" is clicked without document selection on first step', async () => {
    render(<QuizWizard onClose={() => {}} />);
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Please select at least one document to proceed.')).toBeInTheDocument();
  });

  it('clears error when "Back" is clicked', async () => {
    render(<QuizWizard onClose={() => {}} />);
    fireEvent.click(screen.getByText('Next')); // Show error
    expect(screen.getByText('Please select at least one document to proceed.')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Back')); // Go back
    expect(screen.queryByText('Please select at least one document to proceed.')).not.toBeInTheDocument();
  });

  it('navigates back to the previous step', async () => {
    render(<QuizWizard initialDocumentId="doc1" onClose={() => {}} />);
    fireEvent.click(screen.getByText('Select Doc1')); // Select a doc to enable next
    fireEvent.click(screen.getByText('Next')); // Go to Quiz Options

    await waitFor(() => {
        expect(screen.getByText('Quiz Options')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back')); // Go back to Document Selection

    await waitFor(() => {
        expect(screen.getByText('Document Selection')).toBeInTheDocument();
    });
  });

  it('triggers quiz generation on the last step when "Generate" is clicked', async () => {
    render(<QuizWizard initialDocumentId="doc1" onClose={() => {}} />);
    
    // Go to Quiz Options
    fireEvent.click(screen.getByText('Select Doc1'));
    fireEvent.click(screen.getByText('Next'));

    // Go to Generate Quiz step
    fireEvent.click(screen.getByText('Set Long Quiz')); // ensure options are passed
    fireEvent.click(screen.getByText('Next')); 

    await waitFor(() => {
        expect(screen.getByText('Generate Quiz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate')); // Click Generate button on last step

    await waitFor(() => {
      expect(screen.getByTestId('generating-status')).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.any(Object));
    });
  });

  it('handles generation error correctly', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to connect to AI.' }),
      })
    ) as jest.Mock;

    render(<QuizWizard initialDocumentId="doc1" onClose={() => {}} />);
    
    // Navigate to generation step
    fireEvent.click(screen.getByText('Select Doc1'));
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Next')); 

    await waitFor(() => {
        expect(screen.getByText('Generate Quiz')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate'));

    await waitFor(() => {
      expect(screen.getByTestId('generation-error')).toHaveTextContent('Failed to connect to AI.');
      expect(screen.queryByTestId('generating-status')).not.toBeInTheDocument();
    });
  });
});
