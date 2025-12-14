import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryWizard from '../SummaryWizard';
import * as DocumentSelectionStep from '../DocumentSelectionStep';
import * as SummaryOptionsStep from '../SummaryOptionsStep';
import * as GenerationProgressStep from '../GenerationProgressStep';

// Mock child components
jest.mock('../DocumentSelectionStep', () => ({
  __esModule: true,
  default: jest.fn(({ onDocumentSelect, preselectedDocumentId }) => (
    <div data-testid="DocumentSelectionStep">
      <input
        type="text"
        data-testid="document-id-input"
        defaultValue={preselectedDocumentId || ''}
        onChange={(e) => onDocumentSelect(e.target.value)}
      />
    </div>
  )),
}));

jest.mock('../SummaryOptionsStep', () => ({
  __esModule: true,
  default: jest.fn(({ onSelectOptions, initialFormat }) => (
    <div data-testid="SummaryOptionsStep">
      <select
        data-testid="summary-format-select"
        defaultValue={initialFormat}
        onChange={(e) => onSelectOptions({ format: e.target.value as any })}
      >
        <option value="paragraph">Paragraph</option>
        <option value="bullet_points">Bullet Points</option>
      </select>
    </div>
  )),
}));

jest.mock('../GenerationProgressStep', () => ({
  __esModule: true,
  default: jest.fn(({ isGenerating, status, error, generatedContentId, onGenerate, selectedDocumentId }) => (
    <div data-testid="GenerationProgressStep">
      {isGenerating && <p>Generating...</p>}
      {status && <p>{status}</p>}
      {error && <p>Error: {error}</p>}
      {generatedContentId && <p>Generated ID: {generatedContentId}</p>}
      <button data-testid="generate-button" onClick={onGenerate} disabled={isGenerating || !selectedDocumentId}>
        {isGenerating ? 'Generating...' : 'Start Generation'}
      </button>
    </div>
  )),
}));

describe('SummaryWizard', () => {
  beforeEach(() => {
    // Clear mocks before each test
    (DocumentSelectionStep.default as jest.Mock).mockClear();
    (SummaryOptionsStep.default as jest.Mock).mockClear();
    (GenerationProgressStep.default as jest.Mock).mockClear();
  });

  it('renders the first step by default', () => {
    render(<SummaryWizard />);
    expect(screen.getByText('Document Selection')).toBeInTheDocument();
    expect(screen.getByTestId('DocumentSelectionStep')).toBeInTheDocument();
  });

  it('navigates to the next step when "Next" is clicked after selecting a document', async () => {
    render(<SummaryWizard />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    const documentInput = screen.getByTestId('document-id-input');

    // Simulate document selection
    fireEvent.change(documentInput, { target: { value: 'doc-123' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Summary Options')).toBeInTheDocument();
      expect(screen.getByTestId('SummaryOptionsStep')).toBeInTheDocument();
    });
  });

  it('navigates to the previous step when "Back" is clicked', async () => {
    render(<SummaryWizard />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    const backButton = screen.getByRole('button', { name: /back/i });
    const documentInput = screen.getByTestId('document-id-input');

    // Go to next step
    fireEvent.change(documentInput, { target: { value: 'doc-123' } });
    fireEvent.click(nextButton);
    await waitFor(() => expect(screen.getByText('Summary Options')).toBeInTheDocument());

    // Go back
    fireEvent.click(backButton);
    await waitFor(() => expect(screen.getByText('Document Selection')).toBeInTheDocument());
  });

  it('triggers generation on the last step when "Generate" is clicked', async () => {
    jest.spyOn(window, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: { id: 'generated-456' } }),
    } as Response);

    render(<SummaryWizard />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    const documentInput = screen.getByTestId('document-id-input');

    // Step 1: Document Selection
    fireEvent.change(documentInput, { target: { value: 'doc-123' } });
    fireEvent.click(nextButton); // Go to Summary Options

    // Step 2: Summary Options
    await waitFor(() => expect(screen.getByText('Summary Options')).toBeInTheDocument());
    fireEvent.click(nextButton); // Go to Generate Summary

    // Step 3: Generation Progress
    await waitFor(() => expect(screen.getByText('Generate Summary')).toBeInTheDocument());
    
    const generateButton = screen.getByRole('button', { name: /Generate/i });
    fireEvent.click(generateButton);

    await waitFor(() => expect(screen.getByText('Generated ID: generated-456')).toBeInTheDocument());
    expect(window.fetch).toHaveBeenCalledWith('/api/generate', expect.any(Object));
  });

  it('disables "Next" button on first step if no document is selected', () => {
    render(<SummaryWizard />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables "Next" button on first step if a document is selected', () => {
    render(<SummaryWizard />);
    const nextButton = screen.getByRole('button', { name: /next/i });
    const documentInput = screen.getByTestId('document-id-input');
    fireEvent.change(documentInput, { target: { value: 'doc-123' } });
    expect(nextButton).not.toBeDisabled();
  });

  it('handles initialDocumentId for pre-selection', async () => {
    render(<SummaryWizard initialDocumentId="pre-selected-doc" />);
    const documentInput = screen.getByTestId('document-id-input');
    await waitFor(() => expect(documentInput).toHaveValue('pre-selected-doc'));
  });
});
