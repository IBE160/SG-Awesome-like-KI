import { createRouteHandlerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { cookies } from 'next/headers';

// Mock Supabase and Next.js cookies
jest.mock('@supabase/ssr', () => ({
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

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith('http://localhost/', { status: 301 });
  });

  it('should redirect to login page with error message for invalid credentials', async () => {
    const errorMessage = 'Invalid login credentials';
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: errorMessage } });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'wrongpassword');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: formData,
    });

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@example.com', password: 'wrongpassword' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith(`http://localhost/login?error=${encodeURIComponent(errorMessage)}`, { status: 301 });
  });

  it('should redirect to login page with error message for locked account', async () => {
    const errorMessage = 'Account temporarily locked';
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: errorMessage } });

    const formData = new FormData();
    formData.append('email', 'locked@example.com');
    formData.append('password', 'password');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: formData,
    });

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'locked@example.com', password: 'password' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith(`http://localhost/login?error=${encodeURIComponent(errorMessage)}`, { status: 301 });
  });

  it('should redirect to login page with generic error for other authentication errors', async () => {
    const errorMessage = 'Some other error';
    mockSignInWithPassword.mockResolvedValueOnce({ error: { message: errorMessage } });

    const formData = new FormData();
    formData.append('email', 'error@example.com');
    formData.append('password', 'password');

    const request = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: formData,
    });

    await POST(request);

    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'error@example.com', password: 'password' });
    expect(mockNextResponseRedirect).toHaveBeenCalledWith(`http://localhost/login?error=${encodeURIComponent(errorMessage)}`, { status: 301 });
  });
});
