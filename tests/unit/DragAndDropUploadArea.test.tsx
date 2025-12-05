// tests/unit/DragAndDropUploadArea.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DragAndDropUploadArea } from '@/components/DragAndDropUploadArea';
import { useDropzone } from 'react-dropzone'; // Mock this import
import '@testing-library/jest-dom';

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(),
}));

const mockUseDropzone = useDropzone as jest.Mock;

describe('DragAndDropUploadArea', () => {
  const mockOnFileUpload = jest.fn();
  const mockOnValidationError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDropzone.mockReturnValue({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    });
  });

  it('renders the drag and drop message correctly', () => {
    render(
      <DragAndDropUploadArea
        onFileUpload={mockOnFileUpload}
        onValidationError={mockOnValidationError}
      />
    );
    expect(screen.getByText(/Drag 'n' drop your file here/i)).toBeInTheDocument();
    expect(screen.getByText(/\.txt, \.pdf files, max 10MB/i)).toBeInTheDocument();
  });

  it('calls onFileUpload with a valid .txt file', async () => {
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const dataTransfer = { files: [file] };

    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', {
            value: dataTransfer,
          });
          onDrop([file], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    render(
      <DragAndDropUploadArea
        onFileUpload={mockOnFileUpload}
        onValidationError={mockOnValidationError}
      />
    );

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
      expect(mockOnValidationError).not.toHaveBeenCalled();
    });
  });

  it('calls onFileUpload with a valid .pdf file', async () => {
    const file = new File([new ArrayBuffer(1024)], 'document.pdf', { type: 'application/pdf' }); // 1KB PDF
    const dataTransfer = { files: [file] };

    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', {
            value: dataTransfer,
          });
          onDrop([file], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    render(
      <DragAndDropUploadArea
        onFileUpload={mockOnFileUpload}
        onValidationError={mockOnValidationError}
      />
    );

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith(file);
      expect(mockOnValidationError).not.toHaveBeenCalled();
    });
  });

  it('calls onValidationError for an unsupported file type', async () => {
    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const dataTransfer = { files: [file] };

    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', {
            value: dataTransfer,
          });
          onDrop([file], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    render(
      <DragAndDropUploadArea
        onFileUpload={mockOnFileUpload}
        onValidationError={mockOnValidationError}
      />
    );

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }

    await waitFor(() => {
      expect(mockOnValidationError).toHaveBeenCalledWith('This file type is not supported. Please try another file.');
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  it('calls onValidationError for a file exceeding the size limit', async () => {
    const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024 + 1)], 'large.txt', { type: 'text/plain' }); // > 10MB
    const dataTransfer = { files: [largeFile] };

    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', {
            value: dataTransfer,
          });
          onDrop([largeFile], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    render(
      <DragAndDropUploadArea
        onFileUpload={mockOnFileUpload}
        onValidationError={mockOnValidationError}
      />
    );

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }

    await waitFor(() => {
      expect(mockOnValidationError).toHaveBeenCalledWith('File size exceeds 10MB limit.');
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  it('calls onValidationError when no files are selected', async () => {
    mockUseDropzone.mockImplementation(({ onDrop }) => ({
      getRootProps: () => ({
        onDrop: (event: React.DragEvent<HTMLDivElement>) => {
          Object.defineProperty(event, 'dataTransfer', {
            value: { files: [] },
          });
          onDrop([], [], event);
        },
      }),
      getInputProps: () => ({}),
      isDragActive: false,
      fileRejections: [],
    }));

    render(
      <DragAndDropUploadArea
        onFileUpload={mockOnFileUpload}
        onValidationError={mockOnValidationError}
      />
    );

    const dropzone = screen.getByText(/Drag 'n' drop your file here/i).closest('div');
    if (dropzone) {
      fireEvent.drop(dropzone);
    }

    await waitFor(() => {
      expect(mockOnValidationError).toHaveBeenCalledWith('No files were selected or the selected file is not supported.');
      expect(mockOnFileUpload).not.toHaveBeenCalled();
    });
  });

  it('displays active drag state message', () => {
    mockUseDropzone.mockReturnValue({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: true,
      fileRejections: [],
    });
    render(
      <DragAndDropUploadArea
        onFileUpload={mockOnFileUpload}
        onValidationError={mockOnValidationError}
      />
    );
    expect(screen.getByText(/Drop the files here .../i)).toBeInTheDocument();
  });
});
