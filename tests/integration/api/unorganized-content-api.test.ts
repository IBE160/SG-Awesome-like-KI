// tests/integration/api/unorganized-content-api.test.ts
import { GET } from '@/app/api/unorganized-content/route';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Mock Supabase client and Next.js utilities
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

const mockUser = {
  id: 'user-uuid-123',
  email: 'test@example.com',
};

const mockCreateServerClient = createServerClient as jest.Mock;
const mockCookies = cookies as jest.Mock;

describe('GET /api/unorganized-content', () => {
  let mockRequest: Partial<NextRequest>;
  let mockAuth: any;
  let mockFrom: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuth = {
      getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    };

    mockFrom = {
      select: jest.fn(() => mockFrom),
      is: jest.fn(() => mockFrom),
      eq: jest.fn(() => mockFrom),
    };

    // Directly mock globalThis.mockSupabaseClient.auth and .from
    globalThis.mockSupabaseClient.auth = mockAuth;
    globalThis.mockSupabaseClient.from.mockImplementation(() => mockFrom);
    mockCookies.mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    });

    mockRequest = {};
  });

  it('should return 401 if user is unauthorized', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await GET(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('should successfully retrieve unorganized content', async () => {
    const mockUnorganizedContent = [
      {
        id: 'gc-1',
        type: 'summary',
        content: { text: 'Summary of doc 1' },
        study_material_id: 'sm-1',
        study_materials: { original_name: 'Doc 1' },
      },
      {
        id: 'gc-2',
        type: 'quiz',
        content: { questions: [] },
        study_material_id: 'sm-2',
        study_materials: { original_name: 'Doc 2' },
      },
    ];
    mockFrom.eq.mockResolvedValueOnce({ data: mockUnorganizedContent, error: null }); // For select after eq()

    const response = await GET(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.unorganizedContent).toEqual(mockUnorganizedContent);
    expect(globalThis.mockSupabaseClient.from).toHaveBeenCalledWith('generated_content');
    expect(mockFrom.is).toHaveBeenCalledWith('class_id', null);
    expect(mockFrom.is).toHaveBeenCalledWith('class_section_id', null);
    expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  it('should return 500 if fetching unorganized content fails', async () => {
    mockFrom.eq.mockResolvedValueOnce({ data: null, error: { message: 'DB Fetch Error' } }); // For select after eq()

    const response = await GET(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to retrieve unorganized content.');
  });
});
