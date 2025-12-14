import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SummaryWizard from '@/components/summary-wizard/SummaryWizard';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// Mock Supabase client globally to return NO documents by default
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })), // Default: no documents
      })),
    })),
  })),
}));

// Mock next/navigation's useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('SummaryWizard Integration Test', () => {
  const mockPush = jest.fn();
  const mockDocuments = [
    { id: 'doc1', original_name: 'Document One' },
    { id: 'doc2', original_name: 'Document Two' },
  ];

  beforeEach(() => {
    (createClient as jest.Mock).mockClear();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    mockPush.mockClear();

    // Reset createClient mock to default (no documents) before each test
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    }));


    // Mock fetch for API calls
    global.fetch = jest.fn((url: RequestInfo | URL, init?: RequestInit) => {
      if (url === '/api/generate') {
        if (init?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ content: { id: 'generated-summary-id-123', type: 'summary' } }),
          });
        }
      }
      return Promise.reject(new Error('Unhandled fetch request'));
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('completes the wizard flow and generates a summary', async () => {
    // Override createClient mock for this test to return documents
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: mockDocuments, error: null })),
        })),
      })),
    }));

    render(<SummaryWizard />);

    // Step 1: Document Selection
    expect(screen.getByText('Document Selection')).toBeInTheDocument();
    expect(screen.getByText('Loading documents...')).toBeInTheDocument();

    // Wait for documents to load and select one
    await waitFor(() => {
      expect(screen.getByLabelText('Choose a Study Material:')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Document One' })).toBeInTheDocument();
    });

    const docSelect = screen.getByLabelText('Choose a Study Material:');
    fireEvent.change(docSelect, { target: { value: 'doc1' } });
    expect(docSelect).toHaveValue('doc1');

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Summary Options
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Summary Options/i })).toBeInTheDocument();
      expect(screen.getByLabelText('Paragraph')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('radio', { name: /bullet points/i }));
    expect(screen.getByRole('radio', { name: /bullet points/i })).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Generate Summary (and trigger generation)
    await waitFor(() => {
      expect(screen.getByText('Generating Summary...')).toBeInTheDocument();
    });

    // Check if API call was made
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          studyMaterialId: 'doc1',
          type: 'summary',
          options: { format: 'bullet_points' },
        }),
      }));
    });

    // Verify success state and navigation button
    await waitFor(() => {
      expect(screen.getByText('Summary Generated Successfully!')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view summary/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /view summary/i }));
    expect(mockPush).toHaveBeenCalledWith('/summary-view/generated-summary-id-123');
  });

  it('handles generation error gracefully', async () => {
    // Override createClient mock for this test to return documents
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: mockDocuments, error: null })),
        })),
      })),
    }));

    // Mock fetch to return an error
    global.fetch = jest.fn(() => Promise.resolve({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    })) as jest.Mock;

    render(<SummaryWizard />);

    // Step 1: Document Selection
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText('Choose a Study Material:'), { target: { value: 'doc1' } });
    });
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 2: Summary Options
    await waitFor(() => screen.getByRole('heading', { name: /Summary Options/i }));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Generate Summary (and trigger generation)
    await waitFor(() => {
      expect(screen.getByText('Generation Failed!')).toBeInTheDocument();
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('pre-selects document if initialDocumentId is provided', async () => {
    // Override createClient mock for this test to return documents
    (createClient as jest.Mock).mockImplementation(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: mockDocuments, error: null })),
        })),
      })),
    }));

    render(<SummaryWizard initialDocumentId="doc2" />);

    // Wait for documents to load
    await waitFor(() => {
      expect(screen.getByLabelText('Choose a Study Material:')).toHaveValue('doc2');
    });

    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(screen.getByRole('heading', { name: /Summary Options/i })).toBeInTheDocument());
  });

  it('shows alert if no document is selected on first step and next is clicked', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<SummaryWizard />);

    await waitFor(() => {
        expect(screen.getByText('Document Selection')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /Choose a Study Material:/i })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /Choose a Study Material:/i })).toHaveValue('');
    });
    
    // Now, confirm button is disabled due to null selectedDocumentId
    await screen.findByRole('button', { name: /next/i, disabled: true }); // Ensure it's explicitly disabled

    fireEvent.click(screen.getByRole('button', { name: /next/i }));

    expect(alertMock).toHaveBeenCalledWith('Please select a document to proceed.');
    expect(screen.getByText('Document Selection')).toBeInTheDocument(); // Should stay on the same step
    alertMock.mockRestore();
  });
});
