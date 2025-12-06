// tests/unit/app/assign-content/page.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignContentPage from '@/app/assign-content/page';

// Mock ContentAssignmentUI component
jest.mock('@/components/ContentAssignmentUI', () => ({
  ContentAssignmentUI: () => <div data-testid="mock-content-assignment-ui">Mock Content Assignment UI</div>,
}));

describe('AssignContentPage', () => {
  it('renders the ContentAssignmentUI component', () => {
    render(<AssignContentPage />);
    expect(screen.getByTestId('mock-content-assignment-ui')).toBeInTheDocument();
  });
});
