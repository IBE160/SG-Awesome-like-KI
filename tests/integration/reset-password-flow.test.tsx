import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ForgotPasswordPage from '../../src/app/login/forgot-password/page';
import ResetPasswordPage from '../../src/app/login/reset-password/page';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

global.fetch = jest.fn();

const mockPush = jest.fn();

describe('Password Reset Flow - Integration Test', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
    });
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  it('should allow a user to request a password reset and set a new password', async () => {
    // 1. Render the Forgot Password page
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Check your email for a password reset link, including your spam folder.' }),
    });
    const { rerender } = render(<ForgotPasswordPage />);

    // 2. User fills in email and submits
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    // 3. Verify the reset link request was sent and a confirmation message is shown
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password/request', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(
        screen.getByText(/Check your email for a password reset link, including your spam folder./i)
      ).toBeInTheDocument();
    });

    // 4. Simulate navigating to the Reset Password page with a token
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('code=mock-reset-token'));
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true }); // for session exchange
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Your password has been reset successfully.' }),
    });
    rerender(<ResetPasswordPage />);

    await waitFor(() => {
        expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    });

    // 5. User enters a new password and submits
    const newPassword = 'newSecurePassword1!';
    await userEvent.type(screen.getByLabelText('New Password'), newPassword);
    await userEvent.type(screen.getByLabelText('Confirm New Password'), newPassword);
    await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    // 6. Verify the password was updated and the user is redirected to login
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(screen.getByText(/Your password has been reset successfully. Redirecting to login.../i)).toBeInTheDocument();
    });

    // 7. Verify redirection to login page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    }, { timeout: 3500 });
  });
});
