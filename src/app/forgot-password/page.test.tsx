import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPasswordPage from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

global.fetch = jest.fn();

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders the forgot password form', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByRole('heading', { name: /Forgot Password/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Login/i })).toBeInTheDocument();
  });

  it('updates email input value', () => {
    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('displays error if email is empty on submission', async () => {
    render(<ForgotPasswordPage />);
    fireEvent.submit(screen.getByTestId('forgot-password-form'));
    await waitFor(() => {
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('calls the API on successful submission', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Check your email for a password reset link, including your spam folder.' }),
    });

    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password/request', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(screen.getByText(/Check your email for a password reset link, including your spam folder./i)).toBeInTheDocument();
    });
  });

  it('displays error message from the API on failed submission', async () => {
    const errorMessage = 'User not found.';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: errorMessage }),
    });

    render(<ForgotPasswordPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Send Reset Link/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('has a link to the login page', () => {
    render(<ForgotPasswordPage />);
    const link = screen.getByRole('link', { name: /Back to Login/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});