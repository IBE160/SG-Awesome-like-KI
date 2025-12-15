// src/components/quiz-wizard/__tests__/DocumentSelectionStep.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentSelectionStep from '../DocumentSelectionStep';
import { createClient } from '@/lib/supabase/client';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockCreateClient = createClient as jest.Mock;

describe('DocumentSelectionStep', () => {
  const mockOnDocumentSelect = jest.fn();
  const mockDocuments = [
    { id: 'doc1', original_name: 'Document 1' },
    { id: 'doc2', original_name: 'Document 2' },
    { id: 'doc3', original_name: 'Document 3' },
  ];

  beforeEach(() => {
    mockOnDocumentSelect.mockClear();
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn((callback) => callback({ data: mockDocuments, error: null })), // Mock for .then() when used with promises
      }),
    });
  });

  it('renders loading state initially', () => {
    render(<DocumentSelectionStep onDocumentSelect={mockOnDocumentSelect} />);
    expect(screen.getByText('Loading documents...')).toBeInTheDocument();
  });

  it('renders documents after fetching', async () => {
    render(<DocumentSelectionStep onDocumentSelect={mockOnDocumentSelect} />);
    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
      expect(screen.getByText('Document 3')).toBeInTheDocument();
      expect(screen.queryByText('Loading documents...')).not.toBeInTheDocument();
    });
  });

  it('allows multiple document selections', async () => {
    render(<DocumentSelectionStep onDocumentSelect={mockOnDocumentSelect} />);
    await waitFor(() => {
      const selectElement = screen.getByLabelText('Choose one or more Study Materials:');
      fireEvent.change(selectElement, { target: { selectedOptions: [
        screen.getByText('Document 1'),
        screen.getByText('Document 3'),
      ]}});
    });
    // This assertion relies on the mock's behavior, might need adjustment if mock is too simple
    expect(mockOnDocumentSelect).toHaveBeenCalledWith(expect.arrayContaining(['doc1', 'doc3']));
  });

  it('pre-selects documents if preselectedDocumentIds are provided', async () => {
    render(<DocumentSelectionStep onDocumentSelect={mockOnDocumentSelect} preselectedDocumentIds={['doc2']} />);
    await waitFor(() => {
      const selectElement = screen.getByLabelText('Choose one or more Study Materials:') as HTMLSelectElement;
      expect(selectElement.value).toBe('doc2'); // value of a multiple select is the first selected option
      expect(Array.from(selectElement.options).filter(opt => opt.selected).map(opt => opt.value)).toEqual(['doc2']);
      expect(mockOnDocumentSelect).toHaveBeenCalledWith(['doc2']);
    });
  });

  it('handles error during document fetching', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn((callback) => callback({ data: null, error: { message: 'Failed to fetch' } })),
      }),
    });
    render(<DocumentSelectionStep onDocumentSelect={mockOnDocumentSelect} />);
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('shows message when no documents are available', async () => {
    mockCreateClient.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        then: jest.fn((callback) => callback({ data: [], error: null })),
      }),
    });
    render(<DocumentSelectionStep onDocumentSelect={mockOnDocumentSelect} />);
    await waitFor(() => {
      expect(screen.getByText('No study materials uploaded yet. Please upload one first.')).toBeInTheDocument();
    });
  });

  it('calls onDocumentSelect with empty array if no preselected and no selection made', async () => {
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
    render(<DocumentSelectionStep onDocumentSelect={mockOnDocumentSelect} />);
    await waitFor(() => {
      // Ensure it's called with an empty array if no preselected and nothing selected yet
      expect(mockOnDocumentSelect).toHaveBeenCalledWith([]); 
    });
  });
});
