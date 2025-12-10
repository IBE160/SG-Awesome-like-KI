// tests/unit/ClassSectionManagementUI.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClassSectionManagementUI } from '@/components/ClassSectionManagementUI';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
  useParams: () => ({
    id: 'mock-class-id',
  }),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ClassSectionManagementUI', () => {
  const mockClassId = 'mock-class-id';

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear(); // Clear all mock calls on mockFetch
  });

  it('renders correctly with initial sections', () => {
    const mockSections = [
      { id: 'sec1', name: 'Section 1', class_id: mockClassId },
      { id: 'sec2', name: 'Section 2', class_id: mockClassId },
    ];

    render(<ClassSectionManagementUI classId={mockClassId} initialSections={mockSections} />);

    expect(screen.getByText('Manage Sections for Class: mock-class-id')).toBeInTheDocument();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('allows creating a new section', async () => {
    const newSection = { id: 'sec3', name: 'New Section', class_id: mockClassId };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ section: newSection }),
    });

    render(<ClassSectionManagementUI classId={mockClassId} initialSections={[]} />);

    const input = screen.getByPlaceholderText('New section name');
    const createButton = screen.getByText('Create Section');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'New Section' } });
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/api/classes/${mockClassId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Section' }),
      });
      expect(screen.getByText('New Section')).toBeInTheDocument();
      expect(input).toHaveValue(''); // Input should be cleared
    });
  });

  it('displays error if new section name is invalid', async () => {
    render(<ClassSectionManagementUI classId={mockClassId} initialSections={[]} />);

    const input = screen.getByPlaceholderText('New section name');
    const createButton = screen.getByText('Create Section');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Invalid@Name!' } }); // Invalid character
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Section name must be alphanumeric and max 25 characters.')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.change(input, { target: { value: 'averylongsectionnamethatexceeds25characters' } }); // Too long
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Section name must be alphanumeric and max 25 characters.')).toBeInTheDocument();
    });

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('allows renaming an existing section', async () => {
    const initialSections = [{ id: 'sec1', name: 'Old Name', class_id: mockClassId }];
    const updatedSection = { id: 'sec1', name: 'Updated Name', class_id: mockClassId };
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ section: updatedSection }) });

    render(<ClassSectionManagementUI classId={mockClassId} initialSections={initialSections} />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    });
    
    const renameInput = screen.getByDisplayValue('Old Name');
    await act(async () => {
        fireEvent.change(renameInput, { target: { value: 'Updated Name' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/api/sections/${updatedSection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Name' }),
      });
      expect(screen.getByText('Updated Name')).toBeInTheDocument();
    });
  });

  it('allows deleting a section with confirmation', async () => {
    const initialSections = [{ id: 'sec1', name: 'Section to Delete', class_id: mockClassId }];
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    render(<ClassSectionManagementUI classId={mockClassId} initialSections={initialSections} />);

    await act(async () => {
        // Find the delete button for the specific section item
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    });

    // Confirmation dialog should appear
    expect(screen.getByRole('dialog', { name: /Confirm Deletion/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the section "Section to Delete"\? All associated content will be deleted./i)).toBeInTheDocument();

    await act(async () => {
        // Click the delete button specifically within the dialog
        const dialog = screen.getByRole('dialog', { name: /Confirm Deletion/i });
        fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    });


    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(`/api/sections/${initialSections[0].id}`, {
        method: 'DELETE',
      });
      expect(screen.queryByText('Section to Delete')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: /Confirm Deletion/i })).not.toBeInTheDocument();
    });
  });

  it('handles API errors for section creation', async () => {
    mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Duplicate section name' }),
      });

    render(<ClassSectionManagementUI classId={mockClassId} initialSections={[]} />);

    const input = screen.getByPlaceholderText('New section name');
    const createButton = screen.getByText('Create Section');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'Existing Section' } });
      fireEvent.click(createButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Duplicate section name')).toBeInTheDocument();
    });
  });
});