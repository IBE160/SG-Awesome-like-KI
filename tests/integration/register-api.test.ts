import { POST } from '../../src/app/api/auth/register/route';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server'; // Added NextRequest

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
    },
  })),
}));

// Mock NextResponse for JSON responses
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, init })),
  },
}));

const mockCreateClient = createClient as jest.Mock;
const mockSignUp = jest.fn();
const mockNextResponseJson = NextResponse.json as jest.Mock;

describe('Register API Endpoint', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    // Store original environment variables
    originalEnv = process.env;
    // Set mock environment variables for Supabase
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test_anon_key',
    };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Reset mocks before each test
    mockCreateClient.mockClear();
    mockSignUp.mockClear();
    mockNextResponseJson.mockClear();

    // Configure the mock Supabase client's signUp method
    mockCreateClient.mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    });
  });

  const createMockRequest = (formData: FormData): NextRequest => {
  return {
    json: async () => formData,
    url: 'http://localhost/api/auth/register', // Corrected URL
    // Add required NextRequest properties
    cookies: {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
      getAll: jest.fn(),
    } as any, // Cast to any to avoid deep type issues with cookies
    nextUrl: new URL('http://localhost/api/auth/register'),
    page: {}, // Placeholder
    ua: 'mock-ua', // User Agent
  } as unknown as NextRequest;
};

  it('should register a user successfully', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: 'some-uuid' } },
      error: null,
    });

    const mockRequest = {
      json: async () => ({ email: 'test@example.com', password: 'Password1!' }),
    } as NextRequest;

    const response = await POST(mockRequest);

    expect(mockCreateClient).toHaveBeenCalledWith('http://localhost:54321', 'test_anon_key');
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password1!',
    });
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { message: 'Registration successful! Please check your email for a confirmation link.', user: 'some-uuid' },
      { status: 200 }
    );
    expect(response.status).toBe(200);
  });

  it('should return 400 if email or password is missing', async () => {
    const mockRequest = {
      json: async () => ({ email: 'test@example.com' }), // Missing password
    } as NextRequest;

    const response = await POST(mockRequest);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: 'Email and password are required.' },
      { status: 400 }
    );
    expect(response.status).toBe(400);
  });

  it('should return 409 if email is already in use', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered', status: 409 },
    });

    const mockRequest = {
      json: async () => ({ email: 'existing@example.com', password: 'Password1!' }),
    } as NextRequest;

    const response = await POST(mockRequest);

    expect(mockSignUp).toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: 'Email already in use. Please try to log in or reset your password.' },
      { status: 409 }
    );
    expect(response.status).toBe(409);
  });

  it('should return 500 for other Supabase errors', async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'Network error', status: 500 },
    });

    const mockRequest = {
      json: async () => ({ email: 'test@example.com', password: 'Password1!' }),
    } as NextRequest;

    const response = await POST(mockRequest);

    expect(mockSignUp).toHaveBeenCalled();
    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: 'Network error' },
      { status: 500 }
    );
    expect(response.status).toBe(500);
  });

  it('should return 500 if Supabase environment variables are not set', async () => {
    // Temporarily unset environment variables for this test
    const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const mockRequest = {
      json: async () => ({ email: 'test@example.com', password: 'Password1!' }),
    } as NextRequest;

    const response = await POST(mockRequest);

    expect(mockNextResponseJson).toHaveBeenCalledWith(
      { error: 'Supabase URL or Anon Key is not configured.' },
      { status: 500 }
    );
    expect(response.status).toBe(500);

    // Restore environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
  });
});