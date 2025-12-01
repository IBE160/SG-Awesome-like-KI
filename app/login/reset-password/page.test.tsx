import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPasswordPage from 'app/login/reset-password/page';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock useRouter and useSearchParams from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockPush = jest.fn();

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
    });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('token=test-token'));
  });

  it('renders the reset password form', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByRole('heading', { name: /Set New Password/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Login/i })).toBeInTheDocument();
  });

  it('updates password and confirm password states on input change', () => {
    render(<ResetPasswordPage />);
    const passwordInput = screen.getByPlaceholderText('New Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New Password') as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: 'NewPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword1!' } });

    expect(passwordInput.value).toBe('NewPassword1!');
    expect(confirmPasswordInput.value).toBe('NewPassword1!');
  });

    it('displays an error if passwords do not match', async () =>{

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByPlaceholderText('New Password');

      const confirmPasswordInput = screen.getByPlaceholderText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Mismatch123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });



  it('displays a success message and redirects on successful password reset', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Password updated successfully.' }),
    });

    render(<ResetPasswordPage />);
    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    fireEvent.change(passwordInput, { target: { value: 'ValidPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPassword1!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Password updated successfully./i)).toBeInTheDocument();
    }, { timeout: 2000 });

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'), { timeout: 3500 }); // Check for redirection after timeout
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/auth/reset-password/confirm',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'test-token', password: 'ValidPassword1!' }),
      })
    );
  });

  it('displays an error message on failed password reset (API error)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to reset password.' }),
    });

    render(<ResetPasswordPage />);
    const passwordInput = screen.getByPlaceholderText('New Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    fireEvent.change(passwordInput, { target: { value: 'ValidPassword1!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPassword1!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to reset password./i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays an error if no token is present', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('')); // No token

    render(<ResetPasswordPage />);
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      
      expect(screen.getByText(/Invalid or missing reset token./i)).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
