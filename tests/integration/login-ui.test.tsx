import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@/lib/supabase/client';
import LoginPage from 'app/login/page';
import { useRouter } from 'next/navigation';

// Mock Supabase and Next.js router
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage', () => {
  const mockSignInWithPassword = jest.fn();
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
    mockSignInWithPassword.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
  });

  it('renders a login form with email and password fields', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot your password?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign up/i })).toBeInTheDocument();
  });

  it('displays an error message for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login credentials' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays an error message for a locked account', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'lockout' },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'locked@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Your account is temporarily locked/)).toBeInTheDocument();
    });
  });

  it('navigates to the home page on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'correctpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });


  it('links to the forgot password page', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /Forgot your password?/i })).toHaveAttribute('href', '/login/forgot-password');
  });
});
