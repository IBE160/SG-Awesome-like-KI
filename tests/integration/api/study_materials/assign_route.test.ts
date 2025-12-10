// tests/integration/api/study_materials/assign_route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { PUT } from '../../../../src/app/api/study-materials/[id]/assign/route';
import { v4 as uuidv4 } from 'uuid';
import { mockSupabaseClient } from '../../../../jest.setup';

// Mock Next.js headers (should be covered by jest.setup.ts)
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

describe('PUT /api/study-materials/[id]/assign', () => {
  const MOCK_USER_ID = uuidv4();
  const MOCK_STUDY_MATERIAL_ID = uuidv4();
  const MOCK_CLASS_ID = uuidv4();
  const MOCK_SECTION_ID = uuidv4();

  // Mocks for study_materials table interactions
  let mockStudyMaterialsSelect: jest.Mock;
  let mockStudyMaterialsEq: jest.Mock;
  let mockStudyMaterialsSingle: jest.Mock;
  let mockStudyMaterialsUpdate: jest.Mock;
  let mockStudyMaterialsUpdateEq: jest.Mock;
  let mockStudyMaterialsUpdateSelect: jest.Mock;
  let mockStudyMaterialsUpdateSingle: jest.Mock;

  // Mocks for classes table interactions
  let mockClassesSelect: jest.Mock;
  let mockClassesEq: jest.Mock;
  let mockClassesSingle: jest.Mock;

  // Mocks for class_sections table interactions
  let mockClassSectionsSelect: jest.Mock;
  let mockClassSectionsEq: jest.Mock;
  let mockClassSectionsSingle: jest.Mock;

  beforeEach(() => {
    globalThis.mockSupabaseClient._reset();
    jest.clearAllMocks();

    // Initialize mocks for study_materials
    mockStudyMaterialsSelect = jest.fn();
    mockStudyMaterialsEq = jest.fn();
    mockStudyMaterialsSingle = jest.fn();
    mockStudyMaterialsUpdate = jest.fn();
    mockStudyMaterialsUpdateEq = jest.fn();
    mockStudyMaterialsUpdateSelect = jest.fn();
    mockStudyMaterialsUpdateSingle = jest.fn();

    // Initialize mocks for classes
    mockClassesSelect = jest.fn();
    mockClassesEq = jest.fn();
    mockClassesSingle = jest.fn();

    // Initialize mocks for class_sections
    mockClassSectionsSelect = jest.fn();
    mockClassSectionsEq = jest.fn();
    mockClassSectionsSingle = jest.fn();

    globalThis.mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: MOCK_USER_ID } }, error: null });

    globalThis.mockSupabaseClient.from.mockImplementation((tableName: string) => {
      if (tableName === 'study_materials') {
        return {
          select: mockStudyMaterialsSelect.mockReturnThis(),
          eq: mockStudyMaterialsEq.mockReturnThis(),
          single: mockStudyMaterialsSingle,
          update: mockStudyMaterialsUpdate.mockReturnThis(),
        };
      } else if (tableName === 'classes') {
        return {
          select: mockClassesSelect.mockReturnThis(),
          eq: mockClassesEq.mockReturnThis(),
          single: mockClassesSingle,
        };
      } else if (tableName === 'class_sections') {
        return {
          select: mockClassSectionsSelect.mockReturnThis(),
          eq: mockClassSectionsEq.mockReturnThis(),
          single: mockClassSectionsSingle,
        };
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

    // For update calls: supabase.from('study_materials').update(...).eq(...).select().single()
    mockStudyMaterialsUpdate.mockImplementation(() => ({
        eq: mockStudyMaterialsUpdateEq.mockReturnThis(),
    }));
    mockStudyMaterialsUpdateEq.mockImplementation(() => ({
        select: mockStudyMaterialsUpdateSelect.mockReturnThis(),
    }));
    mockStudyMaterialsUpdateSelect.mockImplementation(() => ({
        single: mockStudyMaterialsUpdateSingle,
    }));
  });

  it('should return 401 if user is not authenticated', async () => {
    globalThis.mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = { json: jest.fn() } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 400 if class_id is invalid', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: 123 })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid class_id.');
  });

  it('should return 400 if class_section_id is invalid', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_section_id: 123 })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid class_section_id.');
  });

  it('should return 400 if section_id is provided without class_id', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_section_id: MOCK_SECTION_ID })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Cannot assign to a section without a class.');
  });

  it('should return 404 if study material is not found or unauthorized', async () => {
    mockStudyMaterialsSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Study material not found or unauthorized.');
  });

  it('should return 404 if target class is not found or unauthorized', async () => {
    mockStudyMaterialsSingle.mockResolvedValueOnce({ data: { id: MOCK_STUDY_MATERIAL_ID, user_id: MOCK_USER_ID }, error: null });
    mockClassesSingle.mockResolvedValueOnce({ data: null, error: { message: 'Class not found' } });

    const req = { json: jest.fn(() => Promise.resolve({ class_id: uuidv4() })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Target class not found or unauthorized.');
  });

  it('should return 404 if target section is not found or unauthorized', async () => {
    mockStudyMaterialsSingle.mockResolvedValueOnce({ data: { id: MOCK_STUDY_MATERIAL_ID, user_id: MOCK_USER_ID }, error: null });
    mockClassesSingle.mockResolvedValueOnce({ data: { id: MOCK_CLASS_ID, user_id: MOCK_USER_ID }, error: null });
    mockClassSectionsSingle.mockResolvedValueOnce({ data: null, error: { message: 'Section not found' } });

    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID, class_section_id: uuidv4() })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Target section not found or unauthorized.');
  });

  it('should successfully assign content to a class and section', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterial).toEqual({ id: MOCK_STUDY_MATERIAL_ID, class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
    expect(globalThis.mockSupabaseClient.from('study_materials').update).toHaveBeenCalledWith({ class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
  });

  it('should successfully assign content to a class only', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: MOCK_CLASS_ID, class_section_id: null })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterial).toEqual({ id: MOCK_STUDY_MATERIAL_ID, class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
    expect(globalThis.mockSupabaseClient.from('study_materials').update).toHaveBeenCalledWith({ class_id: MOCK_CLASS_ID, class_section_id: null });
  });

  it('should successfully unassign content', async () => {
    const req = { json: jest.fn(() => Promise.resolve({ class_id: null, class_section_id: null })) } as unknown as NextRequest;
    const response = await PUT(req, { params: Promise.resolve({ id: MOCK_STUDY_MATERIAL_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterial).toEqual({ id: MOCK_STUDY_MATERIAL_ID, class_id: MOCK_CLASS_ID, class_section_id: MOCK_SECTION_ID });
    expect(globalThis.mockSupabaseClient.from('study_materials').update).toHaveBeenCalledWith({ class_id: null, class_section_id: null });
  });
});
