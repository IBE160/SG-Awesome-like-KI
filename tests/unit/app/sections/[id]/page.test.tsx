// tests/unit/app/sections/[id]/page.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SectionDetailsPage from '@/app/sections/[id]/page';

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

const mockSectionId = 'test-section-id';
const mockStudyMaterials = [
  { id: 'sm1', original_name: 'Sec Doc 1', generated_content: [] },
  { id: 'sm2', original_name: 'Sec Doc 2', generated_content: [] },
];

describe('SectionDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ studyMaterials: mockStudyMaterials }),
      })
    );
    require('next/navigation').useParams.mockReturnValue({ id: mockSectionId });
  });

  it('renders loading state initially', () => {
    render(<SectionDetailsPage />);
    expect(screen.getByText('Loading section content...')).toBeInTheDocument();
  });

  it('fetches section content and renders OrganizedContentView', async () => {
    await act(async () => {
      render(<SectionDetailsPage />);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/sections/${mockSectionId}/documents`);
      expect(screen.getByTestId('mock-organized-content-view')).toBeInTheDocument();
      expect(screen.getByText(`Content for Section: ${mockSectionId}`)).toBeInTheDocument();
      expect(screen.getByText('Sec Doc 1')).toBeInTheDocument();
      expect(screen.getByText('Sec Doc 2')).toBeInTheDocument();
    });
  });

  it('displays error message if fetching section content fails', async () => {
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch' }),
      })
    );

    await act(async () => {
      render(<SectionDetailsPage />);
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
      render(<SectionDetailsPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-organized-content-view')).toBeInTheDocument();
      expect(screen.queryByText('Sec Doc 1')).not.toBeInTheDocument();
    });
  });
});
