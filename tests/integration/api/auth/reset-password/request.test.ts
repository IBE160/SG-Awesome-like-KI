import { POST } from '../../../../../app/api/auth/reset-password/request/route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  })),
}));

// Mock next/headers for cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockResetPasswordForEmail = (createRouteHandlerClient as jest.Mock).mockReturnValue({
  auth: {
    resetPasswordForEmail: jest.fn(),
  },
}).auth.resetPasswordForEmail;

describe('POST /api/auth/reset-password/request', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with a success message for a valid email', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });

    const request = new Request('http://localhost/api/auth/reset-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('If an account with that email exists, you will receive a password reset link.');
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login/reset-password`,
    });
  });

  it('should return 200 with a generic message even if Supabase returns an error', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'User not found' } });

    const request = new Request('http://localhost/api/auth/reset-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('If an account with that email exists, you will receive a password reset link.');
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('nonexistent@example.com', {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/login/reset-password`,
    });
  });

  it('should return 500 for unexpected errors', async () => {
    mockResetPasswordForEmail.mockImplementationOnce(() => {
      throw new Error('Network error');
    });

    const request = new Request('http://localhost/api/auth/reset-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('An unexpected error occurred.');
  });
});
