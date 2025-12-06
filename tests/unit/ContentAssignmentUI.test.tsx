// tests/unit/ContentAssignmentUI.test.tsx
import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentAssignmentUI } from '@/components/ContentAssignmentUI';

// Mock Next.js fetch
global.fetch = jest.fn();

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('ContentAssignmentUI', () => {
  const mockStudyMaterials = [
    { id: 'sm1', original_name: 'Document 1', class_id: null, class_section_id: null },
    { id: 'sm2', original_name: 'Document 2', class_id: 'class1', class_section_id: 'section1' },
  ];
  const mockClasses = [
    { id: 'class1', name: 'Class A' },
    { id: 'class2', name: 'Class B' },
  ];
  const mockSections = [
    { id: 'section1', name: 'Section X', class_id: 'class1' },
    { id: 'section2', name: 'Section Y', class_id: 'class1' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ studyMaterials: mockStudyMaterials }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ classes: mockClasses }),
        })
      );
  });

  it('renders loading state initially', () => {
    render(<ContentAssignmentUI />);
    expect(screen.getByText('Loading assignment options...')).toBeInTheDocument();
  });

  it('renders correctly after data is loaded', async () => {
    await act(async () => {
      render(<ContentAssignmentUI />);
    });

    expect(screen.getByText('Assign/Reassign Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Select Document:')).toBeInTheDocument();
    expect(screen.getByLabelText('Assign to Class (Optional):')).toBeInTheDocument();
    expect(screen.queryByText('Loading assignment options...')).not.toBeInTheDocument();
  });

  it('displays error message if data fetching fails', async () => {
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch materials' }),
      })
    );
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ classes: mockClasses }),
      })
    );

    await act(async () => {
      render(<ContentAssignmentUI />);
    });

    expect(screen.getByText('Failed to fetch materials')).toBeInTheDocument();
  });

  it('allows selecting a study material and populates class/section dropdowns', async () => {
    await act(async () => {
      render(<ContentAssignmentUI />);
    });

    const docSelect = screen.getByLabelText('Select Document:');
    fireEvent.change(docSelect, { target: { value: 'sm2' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Assign to Class (Optional):')).toHaveValue('class1');
    });

    // Mock sections fetch for the selected class
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ sections: mockSections }),
        })
    );

    const classSelect = screen.getByLabelText('Assign to Class (Optional):');
    fireEvent.change(classSelect, { target: { value: 'class1' } });

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/classes/class1/sections');
        expect(screen.getByLabelText('Assign to Section (Optional):')).toBeInTheDocument();
        expect(screen.getByLabelText('Assign to Section (Optional):')).toHaveValue('section1');
    });
  });

  it('calls the assign API with correct payload', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ sections: mockSections }),
        })
    );
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ studyMaterial: { ...mockStudyMaterials[0], class_id: 'class2' } }),
      })
    );

    await act(async () => {
      render(<ContentAssignmentUI />);
    });

    const docSelect = screen.getByLabelText('Select Document:');
    fireEvent.change(docSelect, { target: { value: 'sm1' } });

    const classSelect = screen.getByLabelText('Assign to Class (Optional):');
    fireEvent.change(classSelect, { target: { value: 'class2' } });

    const assignButton = screen.getByRole('button', { name: /assign content/i });
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/study-materials/sm1/assign',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ class_id: 'class2', class_section_id: null }),
        })
      );
      expect(screen.getByText('Content assigned successfully!')).toBeInTheDocument();
    });
  });

  it('resets section when class selection changes', async () => {
    await act(async () => {
      render(<ContentAssignmentUI />);
    });

    const docSelect = screen.getByLabelText('Select Document:');
    fireEvent.change(docSelect, { target: { value: 'sm2' } });

    await waitFor(() => {
      expect(screen.getByLabelText('Assign to Class (Optional):')).toHaveValue('class1');
      expect(screen.getByLabelText('Assign to Section (Optional):')).toHaveValue('section1');
    });
    
    // Mock sections for new class
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sections: [] }),
      })
    );

    const classSelect = screen.getByLabelText('Assign to Class (Optional):');
    fireEvent.change(classSelect, { target: { value: 'class2' } }); // Change to a class without sections

    await waitFor(() => {
      expect(screen.getByLabelText('Assign to Section (Optional):')).toHaveValue('');
    });
  });
});