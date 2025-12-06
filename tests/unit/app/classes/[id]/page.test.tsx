// tests/unit/app/classes/[id]/page.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClassDetailsPage from '../../../src/app/classes/[id]/page';

// Mock useParams
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

// Mock OrganizedContentView component
jest.mock('@/components/OrganizedContentView', () => ({
  OrganizedContentView: ({ studyMaterials, title, description }: any) => (
    <div data-testid="mock-organized-content-view">
      <h2>{title}</h2>
      <p>{description}</p>
      {studyMaterials.map((sm: any) => (
        <div key={sm.id}>{sm.original_name}</div>
      ))}
    </div>
  ),
}));

// Mock global fetch
global.fetch = jest.fn();

const mockClassId = 'test-class-id';
const mockStudyMaterials = [
  { id: 'sm1', original_name: 'Doc 1', generated_content: [] },
  { id: 'sm2', original_name: 'Doc 2', generated_content: [] },
];

describe('ClassDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ studyMaterials: mockStudyMaterials }),
      })
    );
    require('next/navigation').useParams.mockReturnValue({ id: mockClassId });
  });

  it('renders loading state initially', () => {
    render(<ClassDetailsPage />);
    expect(screen.getByText('Loading class content...')).toBeInTheDocument();
  });

  it('fetches class content and renders OrganizedContentView', async () => {
    await act(async () => {
      render(<ClassDetailsPage />);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/classes/${mockClassId}/documents`);
      expect(screen.getByTestId('mock-organized-content-view')).toBeInTheDocument();
      expect(screen.getByText(`Content for Class: ${mockClassId}`)).toBeInTheDocument();
      expect(screen.getByText('Doc 1')).toBeInTheDocument();
      expect(screen.getByText('Doc 2')).toBeInTheDocument();
    });
  });

  it('displays error message if fetching class content fails', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch' }),
      })
    );

    await act(async () => {
      render(<ClassDetailsPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });

  it('renders with no study materials when none are returned', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ studyMaterials: [] }),
      })
    );

    await act(async () => {
      render(<ClassDetailsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-organized-content-view')).toBeInTheDocument();
      expect(screen.queryByText('Doc 1')).not.toBeInTheDocument();
    });
  });
});
