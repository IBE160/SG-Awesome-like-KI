// tests/integration/api/sections/documents_route.test.ts
import { NextRequest, NextResponse } from 'next/server';
import { GET } from '@/app/api/sections/[id]/documents/route';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { mockSupabaseClient } from '../../../../jest.setup';



// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));



describe('GET /api/sections/[id]/documents', () => {
  const MOCK_USER_ID = uuidv4();
  const MOCK_CLASS_ID = uuidv4();
  const MOCK_SECTION_ID = uuidv4();
  const MOCK_STUDY_MATERIAL_ID_1 = uuidv4();
  const MOCK_STUDY_MATERIAL_ID_2 = uuidv4();
  const MOCK_GENERATED_CONTENT_ID_1 = uuidv4();

  let mockClassSectionsSingle: jest.Mock;
  let mockStudyMaterialsEq: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClassSectionsSingle = jest.fn();
    mockStudyMaterialsEq = jest.fn();
    globalThis.mockSupabaseClient._reset(); // Ensure a clean state for the global mock

    globalThis.mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: MOCK_USER_ID } }, error: null });

    // Mock for class_sections table
    mockClassSectionsSingle.mockResolvedValue({
      data: {
        id: MOCK_SECTION_ID,
        class_id: MOCK_CLASS_ID,
        classes: [{ user_id: MOCK_USER_ID }]
      },
      error: null
    });

    // Mock for study_materials table
    mockStudyMaterialsEq.mockResolvedValue({
      data: [
        {
          id: MOCK_STUDY_MATERIAL_ID_1,
          original_name: 'Sec Doc 1',
          file_type: 'pdf',
          file_size: 1024,
          created_at: new Date().toISOString(),
          extracted_text: 'Extracted text for sec doc 1',
          generated_content: [{ id: MOCK_GENERATED_CONTENT_ID_1, type: 'summary', content: { text: 'Sec Summary 1' } }],
        },
        {
          id: MOCK_STUDY_MATERIAL_ID_2,
          original_name: 'Sec Doc 2',
          file_type: 'txt',
          file_size: 2048,
          created_at: new Date().toISOString(),
          extracted_text: null,
          generated_content: [],
        },
      ],
      error: null,
    });
  });

  it('should return 401 if user is not authenticated', async () => {
    globalThis.mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_SECTION_ID }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('should return 404 if section is not found or unauthorized', async () => {
    mockClassSectionsSingle.mockResolvedValueOnce({ data: null, error: { message: 'Section not found' } });

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: uuidv4() }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Target section not found or unauthorized.');
  });

  it('should return study materials and generated content for a section', async () => {
    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_SECTION_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterials).toHaveLength(2);
    expect(json.studyMaterials[0].id).toBe(MOCK_STUDY_MATERIAL_ID_1);
    expect(json.studyMaterials[0].generated_content).toHaveLength(1);
    expect(json.studyMaterials[0].generated_content[0].id).toBe(MOCK_GENERATED_CONTENT_ID_1);
  });

  it('should return empty array if no study materials are found for the section', async () => {
    mockClassSectionsSingle.mockResolvedValueOnce({
      data: {
        id: MOCK_SECTION_ID,
        class_id: MOCK_CLASS_ID,
        classes: [{ user_id: MOCK_USER_ID }]
      },
      error: null
    });
    mockStudyMaterialsEq.mockResolvedValueOnce({ data: [], error: null });

    const req = {} as NextRequest;
    const response = await GET(req, { params: Promise.resolve({ id: MOCK_SECTION_ID }) });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.studyMaterials).toHaveLength(0);
  });
});