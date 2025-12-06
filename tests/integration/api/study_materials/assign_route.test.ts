// tests/integration/api/study_materials/assign_route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { PUT } from '../../../../src/app/api/study-materials/[id]/assign/route';
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
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
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

describe('PUT /api/study-materials/[id]/assign', () => {
  const MOCK_USER_ID = uuidv4();
  const MOCK_STUDY_MATERIAL_ID = uuidv4();
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
            update: jest.fn(() => ({
              eq: jest.fn((column, value) => {
                if (column === 'id' && value === MOCK_STUDY_MATERIAL_ID) {
                  return {
                    select: jest.fn(() => ({
                      single: jest.fn(() => Promise.resolve({ data: { id: MOCK_STUDY_MATERIAL_ID, class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID }, error: null })),
                    })),
                  };
                }
                return { select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: null, error: null })) })) };
              }),
            })),
          };
        } else if (tableName === 'classes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((column, value) => {
                if (column === 'id' && value === MOCK_CLASS_ID) {
                  return {
                    eq: jest.fn((userColumn, userId) => ({
                      single: jest.fn(() => {
                        if (userColumn === 'user_id' && userId === MOCK_USER_ID) {
                          return Promise.resolve({ data: { id: MOCK_CLASS_ID, user_id: MOCK_USER_ID }, error: null });
                        }
                        return Promise.resolve({ data: null, error: { message: 'Unauthorized class' } });
                      }),
                    })),
                  };
                }
                return { single: jest.fn(() => Promise.resolve({ data: null, error: null })) };
              }),
            })),
          };
        } else if (tableName === 'class_sections') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((column, value) => {
                if (column === 'id' && value === MOCK_SECTION_ID) {
                  return {
                    eq: jest.fn((classColumn, classId) => ({
                      single: jest.fn(() => {
                        if (classColumn === 'class_id' && classId === MOCK_CLASS_ID) {
                          return Promise.resolve({ data: { id: MOCK_SECTION_ID, class_id: MOCK_CLASS_ID }, error: null });
                        }
                        return Promise.resolve({ data: null, error: { message: 'Section not in class' } });
                      }),
                    })),
                  };
                }
                return { single: jest.fn(() => Promise.resolve({ data: null, error: null })) };
              }),
            })),
          };
        }
        return { select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: null, error: null })) })) };
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

    const req = { json: jest.fn() } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 400 if class_id is invalid', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: 123 })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid class_id.');
  });

  it('should return 400 if class_section_id is invalid', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_section_id: 123 })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid class_section_id.');
  });

  it('should return 400 if section_id is provided without class_id', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_section_id: MOCK_SECTION_ID })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Cannot assign to a section without a class.');
  });

  it('should return 404 if study material is not found or unauthorized', async () => {
    mockSupabase.mockImplementationOnce(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
            })),
          })),
        })),
      })),
    }));

    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Study material not found or unauthorized.');
  });

  it('should return 404 if target class is not found or unauthorized', async () => {
    mockSupabase.mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((column, value) => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: { id: MOCK_STUDY_MATERIAL_ID, user_id: MOCK_USER_ID }, error: null })),
                })),
              })),
            })),
          };
        } else if (tableName === 'classes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Class not found' } })),
                })),
              })),
            })),
          };
        }
        return { select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: null, error: null })) })) };
      }),
    }));

    const req = { json: jest.fn(() => Promise.resolve({ class_id: uuidv4() })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Target class not found or unauthorized.');
  });

  it('should return 404 if target section is not found or unauthorized', async () => {
    mockSupabase.mockImplementation(() => ({
      auth: {
        getUser: jest.fn(() => Promise.resolve({ data: { user: { id: MOCK_USER_ID } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((column, value) => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: { id: MOCK_STUDY_MATERIAL_ID, user_id: MOCK_USER_ID }, error: null })),
                })),
              })),
            })),
          };
        } else if (tableName === 'classes') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: { id: MOCK_CLASS_ID, user_id: MOCK_USER_ID }, error: null })),
                })),
              })),
            })),
          };
        } else if (tableName === 'class_sections') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Section not found' } })),
                })),
              })),
            })),
          };
        }
        return { select: jest.fn(() => ({ single: jest.fn(() => Promise.resolve({ data: null, error: null })) })) };
      }),
    }));

    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID, class_section_id: uuidv4() })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Target section not found or unauthorized.');
  });

  it('should successfully assign content to a class and section', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterial).toEqual({ id: MOCK_STUDY_MATERIAL_ID, class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
    expect(mockSupabase().from('study_materials').update).toHaveBeenCalledWith({ class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
  });

  it('should successfully assign content to a class only', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID, class_section_id: null })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterial).toEqual({ id: MOCK_STUDY_MATERIAL_ID, class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
    expect(mockSupabase().from('study_materials').update).toHaveBeenCalledWith({ class_id: MOCK_CLASS_ID, class_section_id: null });
  });

  it('should successfully unassign content', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: null, class_section_id: null })) } as unknown as NextRequest;
    const response = await PUT(req, { params: { id: MOCK_STUDY_MATERIAL_ID } });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterial).toEqual({ id: MOCK_STUDY_MATERIAL_ID, class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
    expect(mockSupabase().from('study_materials').update).toHaveBeenCalledWith({ class_id: null, class_section_id: null });
  });
});
