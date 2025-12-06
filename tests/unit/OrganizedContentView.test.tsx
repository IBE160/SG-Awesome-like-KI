// tests/unit/OrganizedContentView.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrganizedContentView } from '@/components/OrganizedContentView';

describe('OrganizedContentView', () => {
  const mockGeneratedContent = [
    { id: 'gc1', type: 'summary', content: { text: 'This is a summary.' } },
    { id: 'gc2', type: 'quiz', content: { questions: ['Q1?', 'Q2?'] } },
  ];

  const mockStudyMaterials = [
    {
      id: 'sm1',
      original_name: 'Document A.pdf',
      file_type: 'pdf',
      file_size: 5 * 1024 * 1024,
      extracted_text: 'This is a sample extracted text from Document A.',
      generated_content: mockGeneratedContent,
    },
    {
      id: 'sm2',
      original_name: 'Document B.txt',
      file_type: 'txt',
      file_size: 1 * 1024 * 1024,
      extracted_text: null,
      generated_content: [],
    },
  ];

  it('renders title and description', () => {
    render(<OrganizedContentView studyMaterials={[]} title="My Class Content" description="All study materials in this class." />);
    expect(screen.getByText('My Class Content')).toBeInTheDocument();
    expect(screen.getByText('All study materials in this class.')).toBeInTheDocument();
  });

  it('renders message when no study materials are assigned', () => {
    render(<OrganizedContentView studyMaterials={[]} title="My Class Content" />);
    expect(screen.getByText('No study materials assigned yet.')).toBeInTheDocument();
  });

  it('renders study materials correctly', () => {
    render(<OrganizedContentView studyMaterials={mockStudyMaterials} title="My Class Content" />);
    expect(screen.getByText('Document A.pdf')).toBeInTheDocument();
    expect(screen.getByText('Document B.txt')).toBeInTheDocument();
    expect(screen.getByText('Size: 5.00 MB')).toBeInTheDocument();
    expect(screen.getByText('Size: 1.00 MB')).toBeInTheDocument();
  });

  it('renders extracted text preview when available', () => {
    render(<OrganizedContentView studyMaterials={mockStudyMaterials} title="My Class Content" />);
    expect(screen.getByText('Extracted Text Preview:')).toBeInTheDocument();
    expect(screen.getByText('This is a sample extracted text from Document A....')).toBeInTheDocument();
  });

  it('does not render extracted text preview when not available', () => {
    render(<OrganizedContentView studyMaterials={mockStudyMaterials} title="My Class Content" />);
    expect(screen.queryByText('Extracted text for sec doc 1')).not.toBeInTheDocument(); // Only for Document A
  });

  it('renders generated content correctly', () => {
    render(<OrganizedContentView studyMaterials={mockStudyMaterials} title="My Class Content" />);
    expect(screen.getByText('Generated Content:')).toBeInTheDocument();
    expect(screen.getByText('Type: summary')).toBeInTheDocument();
    expect(screen.getByText(/"text": "This is a summary."/i)).toBeInTheDocument();
    expect(screen.getByText('Type: quiz')).toBeInTheDocument();
    expect(screen.getByText(/"questions": \["Q1\?", "Q2\?"\]/i)).toBeInTheDocument();
  });

  it('renders message when no generated content is available for a document', () => {
    render(<OrganizedContentView studyMaterials={mockStudyMaterials} title="My Class Content" />);
    expect(screen.getByText('No generated content for this document.')).toBeInTheDocument();
  });
});
