import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { POST } from '../../app/api/auth/login/route';
import { cookies } from 'next/headers';

// Mock Supabase and Next.js cookies
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}));
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn(),
  },
}));

describe('Login API Endpoint', () => {
  const mockSignInWithPassword = jest.fn();
  const mockCookies = jest.fn();
  const mockNextResponseRedirect = NextResponse.redirect as jest.Mock;

  beforeEach(() => {
    (createRouteHandlerClient as jest.Mock).mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    });
    (cookies as jest.Mock).mockReturnValue({
      get: mockCookies,
    });
    mockSignInWithPassword.mockReset();
    mockCookies.mockReset();
    mockNextResponseRedirect.mockReset();
  });

  it('should redirect to home page on successful login', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: formData,
    });
    (request as any).formData = async () => formData;

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith('http://localhost', { status: 301 });
  });

  it('should redirect to login page with error message for invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid login credentials' } });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: formData,
    });
    (request as any).formData = async () => formData;

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'wrongpassword' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith('http://localhost/login?message=Invalid credentials', { status: 301 });
  });

  it('should redirect to login page with error message for locked account', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Account temporarily locked' } });

    const formData = new FormData();
    formData.append('email', 'locked@example.com');
    formData.append('password', 'password');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: formData,
    });
    (request as any).formData = async () => formData;

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'locked@example.com', password: 'password' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith('http://localhost/login?message=Account temporarily locked.', { status: 301 });
  });

  it('should redirect to login page with generic error for other authentication errors', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'Some other error' } });

    const formData = new FormData();
    formData.append('email', 'error@example.com');
    formData.append('password', 'password');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: formData,
    });
    (request as any).formData = async () => formData;

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'error@example.com', password: 'password' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith('http://localhost/login?message=Could not authenticate user', { status: 301 });
  });
});
