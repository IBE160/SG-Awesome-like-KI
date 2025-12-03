import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Profile from './page';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
  })),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
};

describe('Profile Page', () => {
  let mockSupabase: any;
  let mockRouter: any;

  beforeEach(() => {
    mockSupabase = (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn(),
        updateUser: jest.fn(),
      },
    });
    mockRouter = (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('should redirect to login if no user is authenticated', async () => {
    mockSupabase().auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('Not authenticated') });

    render(<Profile />);

    await waitFor(() => {
      expect(mockRouter().push).toHaveBeenCalledWith('/login');
    });
  });

  it('should display user profile information when authenticated', async () => {
    mockSupabase().auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toHaveValue(mockUser.email);
      expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUser.user_metadata.name);
      expect(screen.getByLabelText(/Email/i)).toBeDisabled(); // Email should be read-only
    });
  });

  it('should update user name successfully', async () => {
    mockSupabase().auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
    mockSupabase().auth.updateUser.mockResolvedValueOnce({ data: { user: { ...mockUser, user_metadata: { name: 'Updated Name' } } }, error: null });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUser.user_metadata.name);
    });

    const nameInput = screen.getByLabelText(/Name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Updated Name');

    const updateButton = screen.getByRole('button', { name: /Update Profile/i });
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(mockSupabase().auth.updateUser).toHaveBeenCalledWith({
        data: { name: 'Updated Name' },
      });
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('should display an error message on update failure', async () => {
    const errorMessage = 'Network error';
    mockSupabase().auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });
    mockSupabase().auth.updateUser.mockResolvedValueOnce({ data: { user: null }, error: new Error(errorMessage) });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toHaveValue(mockUser.user_metadata.name);
    });

    const nameInput = screen.getByLabelText(/Name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'New Name');

    const updateButton = screen.getByRole('button', { name: /Update Profile/i });
    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText(`Error updating profile: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  it('should navigate to privacy policy page', async () => {
    mockSupabase().auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/View Privacy Policy/i)).toBeInTheDocument();
    });

    const privacyPolicyLink = screen.getByText(/View Privacy Policy/i);
    expect(privacyPolicyLink).toHaveAttribute('href', '/privacy-policy');
  });
});
