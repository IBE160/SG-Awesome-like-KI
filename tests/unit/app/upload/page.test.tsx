// tests/unit/app/upload/page.test.tsx
import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadPage from '@/app/upload/page';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock DragAndDropUploadArea to simplify testing UploadPage's logic
jest.mock('@/components/DragAndDropUploadArea', () => ({
  DragAndDropUploadArea: ({ onFileUpload, onValidationError }: any) => (
    <div data-testid="drag-and-drop-area">
      <button onClick={() => onFileUpload(new File(['test'], 'test.txt', { type: 'text/plain' }))}>Mock Upload</button>
      <button onClick={() => onValidationError('Mock Validation Error')}>Mock Error</button>
    </div>
  ),
}));

const mockClasses = [
  { id: 'class1', name: 'Class A' },
  { id: 'class2', name: 'Class B' },
];
const mockSections = [
  { id: 'section1', name: 'Section X' },
  { id: 'section2', name: 'Section Y' },
];

describe('UploadPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => // Mock for initial class fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ classes: mockClasses }),
        })
      )
      .mockImplementationOnce(() => // Mock for section fetch when class1 is selected
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sections: mockSections }),
        })
      )
      .mockImplementation(() => // Default mock for subsequent fetches (upload, etc.)
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Upload successful' }),
        })
      );
  });

  it('renders correctly with initial UI elements', async () => {
    await act(async () => {
      render(<UploadPage />);
    });

    expect(screen.getByText('Upload Your Study Material')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Assign to Class (Optional):')).toBeInTheDocument();
    expect(screen.queryByLabelText('Assign to Section (Optional):')).not.toBeInTheDocument(); // Section dropdown should not be visible initially
  });

  it('fetches classes and displays them in the dropdown', async () => {
    await act(async () => {
      render(<UploadPage />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Assign to Class (Optional):')).toHaveValue('');
      expect(screen.getByText('Class A')).toBeInTheDocument();
      expect(screen.getByText('Class B')).toBeInTheDocument();
    });
  });

  it('fetches sections when a class is selected and displays them', async () => {
    await act(async () => {
      render(<UploadPage />);
    });

    const classSelect = screen.getByLabelText('Assign to Class (Optional):');
    fireEvent.change(classSelect, { target: { value: 'class1' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Assign to Section (Optional):')).toBeInTheDocument();
      expect(screen.getByText('Section X')).toBeInTheDocument();
      expect(screen.getByText('Section Y')).toBeInTheDocument();
    });
  });

  it('sends class_id and class_section_id with formData on upload', async () => {
    await act(async () => {
      render(<UploadPage />);
    });

    // Select file
    fireEvent.click(screen.getByRole('button', { name: /mock upload/i }));

    // Select class
    const classSelect = screen.getByLabelText('Assign to Class (Optional):');
    fireEvent.change(classSelect, { target: { value: 'class1' } });

    // Select section (mock sections fetch again for this interaction)
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sections: mockSections }),
      })
    );
    const sectionSelect = screen.getByLabelText('Assign to Section (Optional):');
    fireEvent.change(sectionSelect, { target: { value: 'section1' } });

    fireEvent.click(screen.getByRole('button', { name: /upload document/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        body: expect.any(FormData),
      }));
    });

    const formData = (global.fetch as jest.Mock).mock.calls[
        (global.fetch as jest.Mock).mock.calls.length - 1
    ][1].body;
    expect(formData.get('file')).toBeInstanceOf(File);
    expect(formData.get('class_id')).toBe('class1');
    expect(formData.get('class_section_id')).toBe('section1');
  });

  it('resets class and section selection on successful upload', async () => {
    await act(async () => {
      render(<UploadPage />);
    });

    fireEvent.click(screen.getByRole('button', { name: /mock upload/i }));
    fireEvent.change(screen.getByLabelText('Assign to Class (Optional):'), { target: { value: 'class1' } });
    fireEvent.click(screen.getByRole('button', { name: /upload document/i }));

    await waitFor(() => {
      expect(screen.getByText('File uploaded and processed successfully!')).toBeInTheDocument();
      expect(screen.getByLabelText('Assign to Class (Optional):')).toHaveValue('');
      expect(screen.queryByLabelText('Assign to Section (Optional):')).not.toBeInTheDocument();
    });
  });

  it('handles server-side upload errors', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => // Mock for initial class fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ classes: mockClasses }),
        })
      )
      .mockImplementationOnce(() => // Mock for section fetch when class1 is selected
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sections: mockSections }),
        })
      )
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error during upload' }),
      })
    );

    await act(async () => {
      render(<UploadPage />);
    });

    fireEvent.click(screen.getByRole('button', { name: /mock upload/i }));
    fireEvent.click(screen.getByRole('button', { name: /upload document/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error during upload')).toBeInTheDocument();
    });
  });

  it('handles network errors with retry logic', async () => {
    jest.useFakeTimers();

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => // Mock for initial class fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ classes: mockClasses }),
        })
      )
      .mockImplementationOnce(() => // Mock for section fetch when class1 is selected
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ sections: mockSections }),
        })
      )
      .mockImplementationOnce(() => Promise.reject(new Error('Network Down'))) // First attempt fail
      .mockImplementationOnce(() => Promise.reject(new Error('Network Down'))) // Second attempt fail
      .mockImplementationOnce(() => Promise.reject(new Error('Network Down'))) // Third attempt fail
      .mockImplementationOnce(() => Promise.reject(new Error('Network Down'))); // Fourth attempt fail (max retries)


    await act(async () => {
      render(<UploadPage />);
    });

    fireEvent.click(screen.getByRole('button', { name: /mock upload/i }));
    fireEvent.click(screen.getByRole('button', { name: /upload document/i }));

    await waitFor(() => {
      expect(screen.getByText(/Network error or server unreachable. Retrying \(1\/3\)\.\.\./i)).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000); // Advance timer for retry
    });

    await waitFor(() => {
      expect(screen.getByText(/Network error or server unreachable. Retrying \(2\/3\)\.\.\./i)).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000); // Advance timer for retry
    });

    await waitFor(() => {
      expect(screen.getByText(/Network error or server unreachable. Retrying \(3\/3\)\.\.\./i)).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(2000); // Advance timer for retry
    });

    await waitFor(() => {
      expect(screen.getByText('Network error. Max retries reached. Please try again later.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});