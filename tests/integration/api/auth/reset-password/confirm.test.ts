import { POST } from '../../../../../app/api/auth/reset-password/confirm/route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Mock the Supabase client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    auth: {
      updateUser: jest.fn(),
    },
  })),
}));

// Mock next/headers for cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockUpdateUser = (createRouteHandlerClient as jest.Mock).mockReturnValue({
  auth: {
    updateUser: jest.fn(),
  },
}).auth.updateUser;

describe('POST /api/auth/reset-password/confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with a success message for a valid password', async () => {
    mockUpdateUser.mockResolvedValueOnce({ data: { user: { id: '123' } }, error: null });

    const request = new Request('http://localhost/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid-token', password: 'ValidPassword1!' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Password updated successfully.');
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'ValidPassword1!' });
  });

  it('should return 400 for a password that does not meet strength requirements', async () => {
    const request = new Request('http://localhost/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid-token', password: 'short' }), // Invalid password
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toContain('Password does not meet strength requirements');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });

  it('should return 400 if Supabase returns an error', async () => {
    mockUpdateUser.mockResolvedValueOnce({ data: null, error: { message: 'Failed to update password' } });

    const request = new Request('http://localhost/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid-token', password: 'ValidPassword1!' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Failed to update password');
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'ValidPassword1!' });
  });

  it('should return 500 for unexpected errors', async () => {
    mockUpdateUser.mockImplementationOnce(() => {
      throw new Error('Database connection error');
    });

    const request = new Request('http://localhost/api/auth/reset-password/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid-token', password: 'ValidPassword1!' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('An unexpected error occurred.');
  });
});
