// tests/integration/api/generate-api.test.ts
import { POST } from '@/app/api/generate/route';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Mock Supabase client and Next.js utilities
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const mockUser = {
  id: 'user-uuid-123',
  email: 'test@example.com',
};

const mockCreateServerClient = createServerClient as jest.Mock;
const mockCookies = cookies as jest.Mock;
const mockV4 = uuidv4 as jest.Mock;

describe('POST /api/generate', () => {
  let mockRequest: Partial<NextRequest>;
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
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })), // Default to no error
      insert: jest.fn(() => mockFrom),
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

    mockV4.mockReturnValue('mock-uuid');
  });

  it('should return 401 if user is unauthorized', async () => {
    mockAuth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    mockRequest = {
      json: () => Promise.resolve({ study_material_id: '123', type: 'summary' }),
    };

    const response = await POST(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Unauthorized');
  });

  it('should return 400 if study_material_id or type is missing', async () => {
    mockRequest = { json: () => Promise.resolve({ type: 'summary' }) };
    let response = await POST(mockRequest as NextRequest);
    let body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing study_material_id or type');

    mockRequest = { json: () => Promise.resolve({ study_material_id: '123' }) };
    response = await POST(mockRequest as NextRequest);
    body = await response.json();
    expect(response.status).toBe(400);
    expect(body.error).toBe('Missing study_material_id or type');
  });

  it('should return 400 for invalid generation type', async () => {
    mockRequest = {
      json: () => Promise.resolve({ study_material_id: '123', type: 'invalid' }),
    };

    const response = await POST(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Invalid generation type. Must be "summary" or "quiz".');
  });

  it('should return 404 if study material is not found or unauthorized', async () => {
    mockFrom.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }); // For study_materials select

    mockRequest = {
      json: () => Promise.resolve({ study_material_id: 'non-existent-id', type: 'summary' }),
    };

    const response = await POST(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Study material not found or unauthorized.');
  });

  it('should successfully generate and store a summary', async () => {
    const mockStudyMaterial = {
      id: 'sm-123',
      user_id: mockUser.id,
      original_name: 'Test Document',
    };
    mockFrom.single.mockResolvedValueOnce({ data: mockStudyMaterial, error: null }); // For study_materials select

    const mockGeneratedContent = {
      id: 'gc-123',
      study_material_id: 'sm-123',
      user_id: mockUser.id,
      type: 'summary',
      content: {
        title: 'Summary of Test Document',
        text: expect.stringContaining('simulated summary'),
      },
      class_id: null,
      class_section_id: null,
    };
    mockFrom.single.mockResolvedValueOnce({ data: mockGeneratedContent, error: null }); // For insert

    mockRequest = {
      json: () => Promise.resolve({ study_material_id: 'sm-123', type: 'summary', options: { length: 'short' } }),
    };

    const response = await POST(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.generatedContent).toEqual(mockGeneratedContent);
    expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
    expect(mockFrom.eq).toHaveBeenCalledWith('id', 'sm-123');
    expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    expect(mockSupabase.from).toHaveBeenCalledWith('generated_content');
    expect(mockFrom.insert).toHaveBeenCalledWith({
      study_material_id: 'sm-123',
      user_id: mockUser.id,
      type: 'summary',
      content: {
        title: 'Summary of Test Document',
        text: expect.stringContaining('simulated summary for document ID sm-123. Options: {"length":"short"}'),
      },
      class_id: null,
      class_section_id: null,
    });
  });

  it('should successfully generate and store a quiz', async () => {
    const mockStudyMaterial = {
      id: 'sm-456',
      user_id: mockUser.id,
      original_name: 'Quiz Document',
    };
    mockFrom.single.mockResolvedValueOnce({ data: mockStudyMaterial, error: null }); // For study_materials select

    const mockGeneratedContent = {
      id: 'gc-456',
      study_material_id: 'sm-456',
      user_id: mockUser.id,
      type: 'quiz',
      content: {
        title: 'Quiz for Quiz Document',
        questions: expect.any(Array),
        options: { difficulty: 'medium' },
      },
      class_id: null,
      class_section_id: null,
    };
    mockFrom.single.mockResolvedValueOnce({ data: mockGeneratedContent, error: null }); // For insert

    mockRequest = {
      json: () => Promise.resolve({ study_material_id: 'sm-456', type: 'quiz', options: { difficulty: 'medium' } }),
    };

    const response = await POST(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.generatedContent).toEqual(mockGeneratedContent);
    expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
    expect(mockFrom.eq).toHaveBeenCalledWith('id', 'sm-456');
    expect(mockFrom.eq).toHaveBeenCalledWith('user_id', mockUser.id);
    expect(mockSupabase.from).toHaveBeenCalledWith('generated_content');
    expect(mockFrom.insert).toHaveBeenCalledWith({
      study_material_id: 'sm-456',
      user_id: mockUser.id,
      type: 'quiz',
      content: {
        title: 'Quiz for Quiz Document',
        questions: expect.any(Array),
        options: { difficulty: 'medium' },
      },
      class_id: null,
      class_section_id: null,
    });
  });

  it('should return 500 if storing generated content fails', async () => {
    const mockStudyMaterial = {
      id: 'sm-fail',
      user_id: mockUser.id,
      original_name: 'Fail Document',
    };
    mockFrom.single.mockResolvedValueOnce({ data: mockStudyMaterial, error: null }); // For study_materials select
    mockFrom.single.mockResolvedValueOnce({ data: null, error: { message: 'DB Insert Error' } }); // For insert

    mockRequest = {
      json: () => Promise.resolve({ study_material_id: 'sm-fail', type: 'summary' }),
    };

    const response = await POST(mockRequest as NextRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Failed to store generated content.');
  });
});
