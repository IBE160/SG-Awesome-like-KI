// tests/integration/api/assign-unorganized-content-api.test.ts
import { POST } from '@/app/api/unorganized-content/[content_id]/assign/route';
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

describe('POST /api/unorganized-content/[content_id]/assign', () => {
  let mockRequest: Partial<NextRequest>;
  let mockContext: any;
  let mockSupabase: any;
  let mockAuth: any;
  let mockFrom: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuth = {
      getUser: jest.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
    };

    mockFrom = {
      select: jest.fn(() => mockFrom),
      eq: jest.fn(() => mockFrom),
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })), // Default for select.single()
      update: jest.fn(() => mockFrom),
    };

    mockSupabase = {
      auth: mockAuth,
      from: jest.fn(() => mockFrom),
    };

    mockCreateServerClient.mockReturnValue(mockSupabase);
    mockCookies.mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    });

    mockRequest = {
      json: () => Promise.resolve({ class_id: 'class-uuid-1', class_section_id: 'section-uuid-1' }),
    };
    mockContext = {
      params: Promise.resolve({ content_id: 'gc-uuid-1' }),
    };
  });

  it('should return 401 if user is unauthorized', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 400 if class_id and class_section_id are missing for assignment', async () => {
    mockRequest = { json: () => Promise.resolve({}) }; // No class_id or class_section_id

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing class_id or class_section_id for assignment.');
  });

  it('should return 404 if generated content is not found or unauthorized', async () => {
    mockFrom.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }); // For generated_content select

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Generated content not found or unauthorized.');
  });

  it('should return 404 if assigned class is not found or unauthorized', async () => {
    mockFrom.single // For generated_content select
      .mockResolvedValueOnce({ data: { id: 'gc-uuid-1', user_id: mockUser.id }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'Class not found' } }); // For classes select

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Class not found or unauthorized.');
  });

  it('should return 404 if assigned section is not found or unauthorized', async () => {
    mockFrom.single // For generated_content select
      .mockResolvedValueOnce({ data: { id: 'gc-uuid-1', user_id: mockUser.id }, error: null })
      .mockResolvedValueOnce({ data: { id: 'class-uuid-1', user_id: mockUser.id }, error: null }) // For classes select
      .mockResolvedValueOnce({ data: null, error: { message: 'Section not found' } }); // For class_sections select

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Section not found or unauthorized.');
  });

  it('should successfully assign generated content to a class', async () => {
    mockFrom.single // For generated_content select
      .mockResolvedValueOnce({ data: { id: 'gc-uuid-1', user_id: mockUser.id }, error: null })
      .mockResolvedValueOnce({ data: { id: 'class-uuid-1', user_id: mockUser.id }, error: null }); // For classes select

    const mockUpdatedContent = {
      id: 'gc-uuid-1',
      class_id: 'class-uuid-1',
      class_section_id: null,
      user_id: mockUser.id,
    };
    mockFrom.single.mockResolvedValueOnce({ data: mockUpdatedContent, error: null }); // For update.single()

    mockRequest = { json: () => Promise.resolve({ class_id: 'class-uuid-1' }) };
    mockContext = { params: Promise.resolve({ content_id: 'gc-uuid-1' }) };

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.updatedContent).toEqual(mockUpdatedContent);
    expect(mockSupabase.from).toHaveBeenCalledWith('generated_content');
    expect(mockFrom.update).toHaveBeenCalledWith({
      class_id: 'class-uuid-1',
      class_section_id: null,
    });
    expect(mockFrom.eq).toHaveBeenCalledWith('id', 'gc-uuid-1');
    expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  it('should successfully assign generated content to a class and section', async () => {
    mockFrom.single // For generated_content select
      .mockResolvedValueOnce({ data: { id: 'gc-uuid-1', user_id: mockUser.id }, error: null })
      .mockResolvedValueOnce({ data: { id: 'class-uuid-1', user_id: mockUser.id }, error: null }) // For classes select
      .mockResolvedValueOnce({ data: { id: 'section-uuid-1', user_id: mockUser.id }, error: null }); // For class_sections select

    const mockUpdatedContent = {
      id: 'gc-uuid-1',
      class_id: 'class-uuid-1',
      class_section_id: 'section-uuid-1',
      user_id: mockUser.id,
    };
    mockFrom.single.mockResolvedValueOnce({ data: mockUpdatedContent, error: null }); // For update.single()

    mockRequest = { json: () => Promise.resolve({ class_id: 'class-uuid-1', class_section_id: 'section-uuid-1' }) };
    mockContext = { params: Promise.resolve({ content_id: 'gc-uuid-1' }) };

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.updatedContent).toEqual(mockUpdatedContent);
    expect(mockFrom.update).toHaveBeenCalledWith({
      class_id: 'class-uuid-1',
      class_section_id: 'section-uuid-1',
    });
  });

  it('should return 500 if updating generated content fails', async () => {
    mockFrom.single // For generated_content select
      .mockResolvedValueOnce({ data: { id: 'gc-uuid-1', user_id: mockUser.id }, error: null })
      .mockResolvedValueOnce({ data: { id: 'class-uuid-1', user_id: mockUser.id }, error: null }); // For classes select

    mockFrom.single.mockResolvedValueOnce({ data: null, error: { message: 'DB Update Error' } }); // For update.single()

    mockRequest = { json: () => Promise.resolve({ class_id: 'class-uuid-1' }) };
    mockContext = { params: Promise.resolve({ content_id: 'gc-uuid-1' }) };

    const response = await POST(mockRequest as NextRequest, mockContext);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to assign generated content.');
  });
});
