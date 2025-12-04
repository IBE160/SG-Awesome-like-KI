import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ResetPasswordPage from './page';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

global.fetch = jest.fn();

const mockPush = jest.fn();

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
    });
    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  it('renders the reset password form when code is present and session is exchanged', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('code=valid-token'));
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Reset Password/i })).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    });
  });

  it('displays error if token is missing', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(''));
    render(<ResetPasswordPage />);
    expect(await screen.findByText(/Password reset token is missing or invalid./i)).toBeInTheDocument();
  });

  it('displays error if session exchange fails', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('code=invalid-token'));
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<ResetPasswordPage />);
    expect(await screen.findByText(/Invalid or expired password reset link./i)).toBeInTheDocument();
  });

  it('displays error if passwords do not match', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('code=valid-token'));
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<ResetPasswordPage />);

    await waitFor(() => expect(screen.getByLabelText('New Password')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPassword1!' } });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { target: { value: 'DifferentPassword1!' } });
    await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    expect(await screen.findByText(/Passwords do not match./i)).toBeInTheDocument();
  });

  it('calls the confirm api on successful submission', async () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams('code=valid-token'));
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true }); // for session exchange
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Your password has been reset successfully.' }),
    });

    render(<ResetPasswordPage />);

    await waitFor(() => expect(screen.getByLabelText('New Password')).toBeInTheDocument());

    const newPassword = 'newSecurePassword1!';
    await userEvent.type(screen.getByLabelText('New Password'), newPassword);
    await userEvent.type(screen.getByLabelText('Confirm New Password'), newPassword);
    await userEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password/confirm', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(screen.getByText(/Your password has been reset successfully. Redirecting to login.../i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    }, { timeout: 3500 });
  });
});