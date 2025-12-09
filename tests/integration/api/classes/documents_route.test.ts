// tests/integration/api/classes/documents_route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/classes/[id]/documents/route';
import { v4 as uuidv4 } from 'uuid';
import { mockSupabaseClient } from '../../../../jest.setup';

// Mock Next.js headers (should be covered by jest.setup.ts, but keeping if still needed)
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

describe('GET /api/classes/[id]/documents', () => {
  const MOCK_USER_ID = uuidv4();
  const MOCK_CLASS_ID = uuidv4();
  const MOCK_STUDY_MATERIAL_ID_1 = uuidv4();
  const MOCK_STUDY_MATERIAL_ID_2 = uuidv4();
  const MOCK_GENERATED_CONTENT_ID_1 = uuidv4();

  const MOCK_STUDY_MATERIALS_DATA = [
    {
      id: MOCK_STUDY_MATERIAL_ID_1,
      original_name: 'Doc 1',
      file_type: 'pdf',
      file_size: 1024,
      created_at: new Date().toISOString(),
      extracted_text: 'Extracted text for doc 1',
      generated_content: [{ id: MOCK_GENERATED_CONTENT_ID_1, type: 'summary', content: { text: 'Summary 1' } }],
    },
    {
      id: MOCK_STUDY_MATERIAL_ID_2,
      original_name: 'Doc 2',
      file_type: 'txt',
      file_size: 2048,
      created_at: new Date().toISOString(),
      extracted_text: null,
      generated_content: [],
    },
  ];

  let mockClassesSelect: jest.Mock;
  let mockClassesEq: jest.Mock;
  let mockClassesSingle: jest.Mock;

  let mockStudyMaterialsSelect: jest.Mock;
  let mockStudyMaterialsEq: jest.Mock;
  
  beforeEach(() => {
    globalThis.mockSupabaseClient._reset();
    jest.clearAllMocks();

    // Initialize distinct mocks for 'classes' table
    mockClassesSelect = jest.fn();
    mockClassesEq = jest.fn();
    mockClassesSingle = jest.fn();

    // Initialize distinct mocks for 'study_materials' table
    mockStudyMaterialsSelect = jest.fn();
    mockStudyMaterialsEq = jest.fn();

    globalThis.mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: MOCK_USER_ID } }, error: null });

    globalThis.mockSupabaseClient.from.mockImplementation((tableName: string) => {
      // Clear mocks for every test
      mockClassesSelect.mockClear();
      mockClassesEq.mockClear();
      mockClassesSingle.mockClear();
      mockStudyMaterialsSelect.mockClear();
      mockStudyMaterialsEq.mockClear();

      if (tableName === 'classes') {
        const chainable = {
          select: mockClassesSelect.mockReturnThis(),
          eq: mockClassesEq.mockReturnThis(),
          single: mockClassesSingle,
        };
        return chainable;
      } else if (tableName === 'study_materials') {
        const chainable = {
          select: mockStudyMaterialsSelect.mockReturnThis(),
          eq: mockStudyMaterialsEq.mockReturnThis(),
        };
        return chainable;
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        in: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      };
    });

    // Default mock responses for successful scenario
    mockClassesSingle.mockResolvedValue({ data: { id: MOCK_CLASS_ID, user_id: MOCK_USER_ID }, error: null });
    
    // For the study_materials query, it will be called like .select().eq(class_id).eq(user_id)
    // The last .eq() needs to resolve the data.
    mockStudyMaterialsEq.mockResolvedValue({ data: MOCK_STUDY_MATERIALS_DATA, error: null });
  });

  it('should return 401 if user is not authenticated', async () => {
    globalThis.mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_CLASS_ID }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 404 if class is not found or unauthorized', async () => {
    mockClassesSingle.mockResolvedValueOnce({ data: null, error: { message: 'Class not found' } });

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: uuidv4() }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Class not found or unauthorized');
  });

  it('should return study materials and generated content for a class', async () => {
    // Mock for classes table query
    mockClassesSingle.mockResolvedValueOnce({ data: { id: MOCK_CLASS_ID, user_id: MOCK_USER_ID }, error: null });

    // Mock for study_materials table query: select().eq('class_id', id).eq('user_id', userId)
    mockStudyMaterialsEq.mockReturnThis(); // First eq call (class_id) returns chainable
    mockStudyMaterialsEq.mockResolvedValueOnce({ data: MOCK_STUDY_MATERIALS_DATA, error: null }); // Second eq call (user_id) resolves data

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_CLASS_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterials).toEqual(MOCK_STUDY_MATERIALS_DATA); // Expect the full mocked data
    
    // Assert that the correct Supabase methods were called
    expect(globalThis.mockSupabaseClient.from).toHaveBeenCalledWith('classes');
    expect(mockClassesSelect).toHaveBeenCalledWith('*');
    expect(mockClassesEq).toHaveBeenCalledWith('id', MOCK_CLASS_ID);
    expect(mockClassesEq).toHaveBeenCalledWith('user_id', MOCK_USER_ID);
    expect(mockClassesSingle).toHaveBeenCalledTimes(1);

    expect(globalThis.mockSupabaseClient.from).toHaveBeenCalledWith('study_materials');
    expect(mockStudyMaterialsSelect).toHaveBeenCalledWith('*, generated_content(*)');
    expect(mockStudyMaterialsEq).toHaveBeenCalledWith('class_id', MOCK_CLASS_ID);
    expect(mockStudyMaterialsEq).toHaveBeenCalledWith('user_id', MOCK_USER_ID);
  });

  it('should return empty array if no study materials are found for the class', async () => {
    mockClassesSingle.mockResolvedValueOnce({ data: { id: MOCK_CLASS_ID, user_id: MOCK_USER_ID }, error: null }); // Class is found
    mockStudyMaterialsEq.mockResolvedValueOnce({ data: [], error: null }); // No study materials found for this class

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_CLASS_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterials).toHaveLength(0);

    // Assert that the correct Supabase methods were called
    expect(globalThis.mockSupabaseClient.from).toHaveBeenCalledWith('classes');
    expect(mockClassesSelect).toHaveBeenCalledWith('*');
    expect(mockClassesEq).toHaveBeenCalledWith('id', MOCK_CLASS_ID);
    expect(mockClassesEq).toHaveBeenCalledWith('user_id', MOCK_USER_ID);
    expect(mockClassesSingle).toHaveBeenCalledTimes(1);

    expect(globalThis.mockSupabaseClient.from).toHaveBeenCalledWith('study_materials');
    expect(mockStudyMaterialsSelect).toHaveBeenCalledWith('*, generated_content(*)');
    expect(mockStudyMaterialsEq).toHaveBeenCalledWith('class_id', MOCK_CLASS_ID);
    expect(mockStudyMaterialsEq).toHaveBeenCalledWith('user_id', MOCK_USER_ID);
  });
});
