import { POST } from '@/src/app/api/auth/reset-password/request/route';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Mock the Supabase client
jest.mock('@supabase/ssr', () => ({
  createRouteHandlerClient: jest.fn(),
}));

// Mock next/headers for cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockResetPasswordForEmail = jest.fn();
(createRouteHandlerClient as jest.Mock).mockReturnValue({
  auth: {
    resetPasswordForEmail: mockResetPasswordForEmail,
  },
});

const createMockRequest = (formData: FormData) => {
  return {
    formData: async () => formData,
    url: 'http://localhost/api/auth/reset-password/request',
  } as unknown as Request;
};

describe('POST /api/auth/reset-password/request', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with a success message for a valid email', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: null });

    const formData = new FormData();
    formData.append('email', 'test@example.com');

    const request = createMockRequest(formData);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Check your email for a password reset link, including your spam folder.');
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
      redirectTo: 'http://localhost/login/reset-password',
    });
  });

  it('should return 400 if Supabase returns an error', async () => {
    mockResetPasswordForEmail.mockResolvedValueOnce({ error: { message: 'User not found' } });

    const formData = new FormData();
    formData.append('email', 'nonexistent@example.com');

    const request = createMockRequest(formData);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('User not found');
  });
});
