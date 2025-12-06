// tests/integration/api/documents/generated_content_route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/documents/[id]/generated-content/route';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          in: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

const mockSupabase = createServerClient as jest.Mock;

describe('GET /api/documents/[id]/generated-content', () => {
  const MOCK_USER_ID = uuidv4();
  const MOCK_STUDY_MATERIAL_ID = uuidv4();
  const MOCK_GENERATED_CONTENT_ID_1 = uuidv4();
  const MOCK_GENERATED_CONTENT_ID_2 = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase.mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((column, value) => {
                if (column === 'id' && value === MOCK_STUDY_MATERIAL_ID) {
                  return {
                    eq: jest.fn((userColumn, userId) => ({
                      single: jest.fn(() => {
                        if (userColumn === 'user_id' && userId === MOCK_USER_ID) {
                          return Promise.resolve({ data: { id: MOCK_STUDY_MATERIAL_ID, user_id: MOCK_USER_ID }, error: null });
                        }
                        return Promise.resolve({ data: null, error: { message: 'Unauthorized' } });
                      }),
                    })),
                  };
                }
                return { single: jest.fn(() => Promise.resolve({ data: null, error: null })) };
              }),
            })),
          };
        } else if (tableName === 'generated_content') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((column, value) => {
                if (column === 'study_material_id' && value === MOCK_STUDY_MATERIAL_ID) {
                  return Promise.resolve({
                    data: [
                      { id: MOCK_GENERATED_CONTENT_ID_1, type: 'summary', content: { text: 'Summary 1' } },
                      { id: MOCK_GENERATED_CONTENT_ID_2, type: 'quiz', content: { questions: [] } },
                    ],
                    error: null,
                  });
                }
                return Promise.resolve({ data: [], error: null });
              }),
            })),
          };
        }
        return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
      }),
    }));
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase.mockImplementationOnce(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
      from: jest.fn(),
    }));

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 404 if study material is not found or unauthorized', async () => {
    mockSupabase.mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
                })),
              })),
            })),
          };
        }
        return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
      }),
    }));

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Study material not found or unauthorized.');
  });

  it('should return generated content for a study material', async () => {
    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.generatedContent).toHaveLength(2);
    expect(json.generatedContent[0].id).toBe(MOCK_GENERATED_CONTENT_ID_1);
    expect(json.generatedContent[1].id).toBe(MOCK_GENERATED_CONTENT_ID_2);
  });

  it('should return empty array if no generated content is found for the study material', async () => {
    mockSupabase.mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: { id: MOCK_STUDY_MATERIAL_ID, user_id: MOCK_USER_ID }, error: null })),
                })),
              })),
            })),
          };
        } else if (tableName === 'generated_content') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          };
        }
        return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
      }),
    }));

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.generatedContent).toHaveLength(0);
  });
});
