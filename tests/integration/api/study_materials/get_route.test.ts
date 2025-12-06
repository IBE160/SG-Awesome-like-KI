// tests/integration/api/study_materials/get_route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../../../../src/app/api/study-materials/route';
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

describe('GET /api/study-materials', () => {
  const MOCK_USER_ID = uuidv4();
  const MOCK_STUDY_MATERIAL_ID_1 = uuidv4();
  const MOCK_STUDY_MATERIAL_ID_2 = uuidv4();
  const MOCK_CLASS_ID = uuidv4();
  const MOCK_SECTION_ID = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase.mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn((query) => ({
              eq: jest.fn((column, value) => {
                if (column === 'user_id' && value === MOCK_USER_ID) {
                  return Promise.resolve({
                    data: [
                      {
                        id: MOCK_STUDY_MATERIAL_ID_1,
                        original_name: 'Doc 1',
                        class_id: MOCK_CLASS_ID,
                        class_section_id: MOCK_SECTION_ID,
                      },
                      {
                        id: MOCK_STUDY_MATERIAL_ID_2,
                        original_name: 'Doc 2',
                        class_id: null,
                        class_section_id: null,
                      },
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
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return all study materials for the authenticated user', async () => {
    const req = {} as NextRequest;
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterials).toHaveLength(2);
    expect(json.studyMaterials[0].id).toBe(MOCK_STUDY_MATERIAL_ID_1);
    expect(json.studyMaterials[0].original_name).toBe('Doc 1');
    expect(json.studyMaterials[0].class_id).toBe(MOCK_CLASS_ID);
    expect(json.studyMaterials[0].class_section_id).toBe(MOCK_SECTION_ID);
    expect(json.studyMaterials[1].id).toBe(MOCK_STUDY_MATERIAL_ID_2);
  });

  it('should return empty array if no study materials are found for the user', async () => {
    mockSupabase.mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
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
    const response = await GET(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterials).toHaveLength(0);
  });
});
