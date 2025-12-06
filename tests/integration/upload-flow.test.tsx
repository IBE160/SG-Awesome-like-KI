// tests/integration/upload-flow.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from '@/app/upload/page';
import { useDropzone } from 'react-dropzone'; // Mock this import
import { useRouter } from 'next/navigation';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(),
}));
const mockUseDropzone = useDropzone as jest.Mock;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
const mockUseRouter = useRouter as jest.Mock;

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
}));

describe('Upload Flow Integration', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    mockUseRouter.mockReturnValue({ push: mockPush });

    // Mock successful dropzone behavior
    mockUseDropzone.mockReturnValue({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    });

    // Mock fetch for API calls
    global.fetch = jest.fn((url: RequestInfo | URL, init?: RequestInit) => {
      if (url === '/api/classes') {
        return Promise.resolve(
          new Response(JSON.stringify({ classes: [] }), { status: 200 })
        );
      }
      if (url === '/api/upload' && init?.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify({ uploadedFile: { id: 'doc-123', name: 'test.txt' } }), { status: 200 })
        );
      }
      if (url === '/api/generate' && init?.method === 'POST') {
        return Promise.resolve(
          new Response(JSON.stringify({ generatedContent: { id: 'gen-123' } }), { status: 200 })
        );
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    }) as jest.Mock;
  });

  it('should display post-upload actions after a successful file upload', async () => {
    render(<UploadPage />);

    // Simulate file drop
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = { files: [file] };

    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
          onDrop([file], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }

    // Wait for the file to be selected and ready for upload
    await waitFor(() => {
      expect(screen.getByText(/File ready for upload: test.txt/i)).toBeInTheDocument();
    });

    // Simulate clicking the upload button
    fireEvent.click(screen.getByRole('button', { name: /Upload Document/i }));

    // Wait for upload success message and post-upload actions to appear
    await waitFor(() => {
      expect(screen.getByText(/File uploaded and processed successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/Document Uploaded Successfully!/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Summary/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate Quiz/i })).toBeInTheDocument();
      expect(screen.getByText(/Document ID: doc-123/i)).toBeInTheDocument();
    });
  });

  it('should call the generate API for summary when "Generate Summary" is clicked', async () => {
    // First, complete a successful upload
    render(<UploadPage />);
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = { files: [file] };

    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
          onDrop([file], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }
    await waitFor(() => expect(screen.getByText(/File ready for upload: test.txt/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Upload Document/i }));
    await waitFor(() => expect(screen.getByText(/Document Uploaded Successfully!/i)).toBeInTheDocument());

    // Now click the generate summary button
    fireEvent.click(screen.getByRole('button', { name: /Generate Summary/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ study_material_id: 'doc-123', type: 'summary' }),
      }));
    });
  });

  it('should call the generate API for quiz when "Generate Quiz" is clicked', async () => {
    // First, complete a successful upload
    render(<UploadPage />);
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = { files: [file] };

    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
          onDrop([file], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }
    await waitFor(() => expect(screen.getByText(/File ready for upload: test.txt/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Upload Document/i }));
    await waitFor(() => expect(screen.getByText(/Document Uploaded Successfully!/i)).toBeInTheDocument());

    // Now click the generate quiz button
    fireEvent.click(screen.getByRole('button', { name: /Generate Quiz/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ study_material_id: 'doc-123', type: 'quiz' }),
      }));
    });
  });
});
