import { POST } from '@/app/api/auth/login/route';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock next/server
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn(),
  },
}));

const createMockRequest = (formData: FormData) => {
  return {
    formData: async () => formData,
    url: 'http://localhost:3000/api/auth/login',
  } as unknown as Request;
};

describe('Login API Endpoint', () => {
  const mockSignInWithPassword = jest.fn();
  const mockRedirect = NextResponse.redirect as jest.Mock;

  beforeEach(() => {
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    });
    mockSignInWithPassword.mockClear();
    mockRedirect.mockClear();
  });

  it('should redirect to home page on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password');
    const request = createMockRequest(formData);

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000', {
      status: 301,
    });
  });

  it('should redirect to login page with error message for invalid credentials', async () => {
    const errorMessage = 'Invalid login credentials';
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: errorMessage } });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');
    const request = createMockRequest(formData);

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      `http://localhost:3000/login?error=${errorMessage}`,
      { status: 301 }
    );
  });

  it('should redirect to login page with error message for locked account', async () => {
    const errorMessage = 'Account temporarily locked';
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: errorMessage } });

    const formData = new FormData();
    formData.append('email', 'locked@example.com');
    formData.append('password', 'password');
    const request = createMockRequest(formData);

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'locked@example.com',
      password: 'password',
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      `http://localhost:3000/login?error=${errorMessage}`,
      { status: 301 }
    );
  });

  it('should redirect to login page with generic error for other authentication errors', async () => {
    const errorMessage = 'Some other error';
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: errorMessage } });

    const formData = new FormData();
    formData.append('email', 'error@example.com');
    formData.append('password', 'password');
    const request = createMockRequest(formData);

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'error@example.com',
      password: 'password',
    });
    expect(mockRedirect).toHaveBeenCalledWith(
      `http://localhost:3000/login?error=${errorMessage}`,
      { status: 301 }
    );
  });
});
