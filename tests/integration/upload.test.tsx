import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from '@/app/upload/page';
import { mockSupabaseClient } from '../../jest.setup';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('UploadPage Integration Tests', () => {
  const mockPush = jest.fn();

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    jest.restoreAllMocks(); // Ensure all mocks are reset before spying

    // Set up a default fetch spy that handles initial fetches with empty arrays
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url === '/api/classes') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ classes: [] }),
          status: 200,
        } as Response);
      }
      if (url.startsWith('/api/classes/') && url.endsWith('/sections')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sections: [] }),
          status: 200,
        } as Response);
      }
      // For any other fetches not explicitly mocked, return a generic successful empty response
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response);
    });

    mockSupabaseClient._reset();
  });

      it('should display PostUploadActionsUI after a successful file upload', async () => {

        // Only mock the /api/upload call as other initial fetches are handled by beforeEach

        fetchSpy.mockImplementationOnce((input: RequestInfo | URL) => {

          const url = typeof input === 'string' ? input : input.url;

          if (url === '/api/upload') {

            return Promise.resolve({

              ok: true,

              json: () => Promise.resolve({ documentId: 'test-document-id' }),

              status: 200,

            } as Response);

          }

          return fetchSpy.originalImplementation!(input); // Fallback to original spy implementation

        });

    

        render(<UploadPage />);

    // Simulate file selection
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByTestId('drag-and-drop-input'); // Assuming DragAndDropUploadArea has a data-testid="drag-and-drop-input"
    fireEvent.change(input, { target: { files: [file] } });

    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadButton);

    // Wait for the upload to complete and PostUploadActionsUI to appear
    await waitFor(() => {
      expect(screen.getByText('What would you like to do next?')).toBeInTheDocument();
    });

    // Check if the PostUploadActionsUI buttons are rendered
    expect(screen.getByRole('button', { name: /Generate Summary/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Quiz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Document/i })).toBeInTheDocument();
    expect(screen.getByText('Your document ID: test-document-id')).toBeInTheDocument();

    // Verify that the original upload form elements are no longer visible
    expect(screen.queryByRole('button', { name: /Upload Document/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Upload Your Study Material')).not.toBeInTheDocument();
  });

      it('should call handleGenerateSummary when "Generate Summary" button is clicked', async () => {

        // Explicitly mock the sequence of fetch calls

        fetchSpy.mockImplementationOnce(() => // First fetch for /api/classes

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ classes: [] }),

            status: 200,

          } as Response)

        );

        fetchSpy.mockImplementationOnce(() => // Second fetch for /api/classes/{id}/sections

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ sections: [] }),

            status: 200,

          } as Response)

        );

        fetchSpy.mockImplementationOnce(() => // Third fetch for /api/upload

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ documentId: 'test-document-id' }),

            status: 200,

          } as Response)

        );

    

        render(<UploadPage />);

    // Simulate file selection
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByTestId('drag-and-drop-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('What would you like to do next?')).toBeInTheDocument();
    });

    // Spy on console.log to check if the placeholder function is called
    const consoleSpy = jest.spyOn(console, 'log');

    const generateSummaryButton = screen.getByRole('button', { name: /Generate Summary/i });
    fireEvent.click(generateSummaryButton);

    expect(consoleSpy).toHaveBeenCalledWith('Placeholder: Generate Summary for document ID: test-document-id');
    consoleSpy.mockRestore();
  });

      it('should call handleGenerateQuiz when "Generate Quiz" button is clicked', async () => {

        // Explicitly mock the sequence of fetch calls

        fetchSpy.mockImplementationOnce(() => // First fetch for /api/classes

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ classes: [] }),

            status: 200,

          } as Response)

        );

        fetchSpy.mockImplementationOnce(() => // Second fetch for /api/classes/{id}/sections

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ sections: [] }),

            status: 200,

          } as Response)

        );

        fetchSpy.mockImplementationOnce(() => // Third fetch for /api/upload

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ documentId: 'test-document-id' }),

            status: 200,

          } as Response)

        );

    

        render(<UploadPage />);

    // Simulate file selection
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByTestId('drag-and-drop-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('What would you like to do next?')).toBeInTheDocument();
    });

    // Spy on console.log to check if the placeholder function is called
    const consoleSpy = jest.spyOn(console, 'log');

    const generateQuizButton = screen.getByRole('button', { name: /Generate Quiz/i });
    fireEvent.click(generateQuizButton);

    expect(consoleSpy).toHaveBeenCalledWith('Placeholder: Generate Quiz for document ID: test-document-id');
    consoleSpy.mockRestore();
  });

      it('should call handleViewDocument when "View Document" button is clicked', async () => {

        // Explicitly mock the sequence of fetch calls

        fetchSpy.mockImplementationOnce(() => // First fetch for /api/classes

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ classes: [] }),

            status: 200,

          } as Response)

        );

        fetchSpy.mockImplementationOnce(() => // Second fetch for /api/classes/{id}/sections

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ sections: [] }),

            status: 200,

          } as Response)

        );

        fetchSpy.mockImplementationOnce(() => // Third fetch for /api/upload

          Promise.resolve({

            ok: true,

            json: () => Promise.resolve({ documentId: 'test-document-id' }),

            status: 200,

          } as Response)

        );

    

        render(<UploadPage />);

    // Simulate file selection
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByTestId('drag-and-drop-input');
    fireEvent.change(input, { target: { files: [file] } });

    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /Upload Document/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('What would you like to do next?')).toBeInTheDocument();
    });

    // Spy on console.log to check if the placeholder function is called
    const consoleSpy = jest.spyOn(console, 'log');

    const viewDocumentButton = screen.getByRole('button', { name: /View Document/i });
    fireEvent.click(viewDocumentButton);

    expect(consoleSpy).toHaveBeenCalledWith('Placeholder: View document: test-document-id');
    consoleSpy.mockRestore();
  });

  it('should fetch classes on mount', async () => {
    // Explicitly mock the fetch call for /api/classes
    fetchSpy.mockImplementationOnce(() => // First fetch for /api/classes
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ classes: [{ id: 'class1', name: 'Class 1' }] }),
        status: 200,
      } as Response)
    );

    render(<UploadPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Assign to Class/i)).toHaveValue('class1');
    });
    expect(screen.getByText('Class 1')).toBeInTheDocument();
  });

  it('should fetch sections when a class is selected', async () => {
    // Explicitly mock the sequence of fetch calls
    fetchSpy.mockImplementationOnce(() => // First fetch for /api/classes
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ classes: [{ id: 'class1', name: 'Class 1' }] }),
        status: 200,
      } as Response)
    );
    fetchSpy.mockImplementationOnce(() => // Second fetch for /api/classes/{id}/sections
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sections: [{ id: 'section1', name: 'Section 1' }] }),
        status: 200,
      } as Response)
    );

    render(<UploadPage />);

    // Select a class
    await waitFor(() => {
      fireEvent.change(screen.getByLabelText(/Assign to Class/i), { target: { value: 'class1' } });
    });

    // Check if sections are loaded
    await waitFor(() => {
      expect(screen.getByLabelText(/Assign to Section/i)).toHaveValue('section1');
    });
    expect(screen.getByText('Section 1')).toBeInTheDocument();
  });
});
