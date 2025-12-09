// tests/integration/api/generate-api.test.ts
import { POST } from '@/app/api/generate/route';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { mockSupabaseClient } from '../../../jest.setup';

// Mock Next.js cookies (already done globally in jest.setup.ts, but good to be explicit if needed)
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

const mockUser = {
  id: 'user-uuid-123',
  email: 'test@example.com',
};

const mockV4 = uuidv4 as jest.Mock;

describe('POST /api/generate', () => {
  let mockRequest: Partial<NextRequest>;

  let mockStudyMaterialsSelect: jest.Mock;
  let mockStudyMaterialsEq: jest.Mock;
  let mockStudyMaterialsSingle: jest.Mock;

  let mockGeneratedContentInsert: jest.Mock;
  let mockGeneratedContentSelect: jest.Mock;
  let mockGeneratedContentSingle: jest.Mock;
  
  let mockDownload: jest.Mock;

  beforeEach(() => {
    globalThis.mockSupabaseClient._reset(); // Reset global Supabase mock state
    jest.clearAllMocks(); // Clear local Jest mocks

    mockStudyMaterialsSelect = jest.fn();
    mockStudyMaterialsEq = jest.fn();
    mockStudyMaterialsSingle = jest.fn();

    mockGeneratedContentInsert = jest.fn();
    mockGeneratedContentSelect = jest.fn();
    mockGeneratedContentSingle = jest.fn();

    mockDownload = jest.fn();

    (globalThis as any).mockSupabaseClient.from.mockImplementation((tableName: string) => {
      if (tableName === 'study_materials') {
        return {
          select: mockStudyMaterialsSelect.mockReturnThis(),
          eq: mockStudyMaterialsEq.mockReturnThis(),
          single: mockStudyMaterialsSingle,
          then: jest.fn(), // If .then is ever called directly on the builder
        };
      } else if (tableName === 'generated_content') {
        return {
          insert: mockGeneratedContentInsert.mockReturnThis(),
          select: mockGeneratedContentSelect.mockReturnThis(),
          single: mockGeneratedContentSingle,
          then: jest.fn(), // If .then is ever called directly on the builder
        };
      }
      // Fallback for any other table interactions not explicitly mocked
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        then: jest.fn(),
      };
    });

    (globalThis as any).mockSupabaseClient.storage.from.mockImplementation((bucketName: string) => {
        return {
            download: mockDownload,
        };
    });

    mockV4.mockReturnValue('mock-uuid');
  });

      it('should return 401 if user is unauthorized', async () => {
        mockRequest = {
          json: () => Promise.resolve({ documentId: '123', type: 'summary' }),
        };
  
        const response = await POST(mockRequest as NextRequest);
        const body = await response.json();
  
        expect(response.status).toBe(401);
        expect(body.error).toBe('Not authenticated');
      });
      it('should return 400 if study_material_id or type is missing', async () => {
        globalThis.mockSupabaseClient.auth._setMockUser(mockUser); // Ensure user is authenticated for validation logic
        mockRequest = { json: () => Promise.resolve({ type: 'summary' }) };
        let response = await POST(mockRequest as NextRequest);
        let body = await response.json();
        expect(response.status).toBe(400);
        expect(body.error).toBe('documentId is required'); // Updated expected error message
  
        mockRequest = { json: () => Promise.resolve({ documentId: '123' }) }; // documentId provided, but type might be missing depending on the test's next step
        response = await POST(mockRequest as NextRequest);
        body = await response.json();
        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid generation type'); // Updated expected error message for missing type if documentId is present
      });
      it('should return 400 for invalid generation type', async () => {
        globalThis.mockSupabaseClient.auth._setMockUser(mockUser);
        mockRequest = {
          json: () => Promise.resolve({ documentId: '123', type: 'invalid' }),
        };
  
        const response = await POST(mockRequest as NextRequest);
        const body = await response.json();
  
        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid generation type');
      });
      it('should return 404 if study material is not found or unauthorized', async () => {
        globalThis.mockSupabaseClient.auth._setMockUser(mockUser);
        mockStudyMaterialsSingle.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } }); // For study_materials select
  
        mockRequest = {
          json: () => Promise.resolve({ documentId: 'non-existent-id', type: 'summary' }),
        };
  
        const response = await POST(mockRequest as NextRequest);
        const body = await response.json();
  
        expect(response.status).toBe(404);
        expect(body.error).toBe('Document not found or access denied.');
      });
            it('should successfully generate and store a summary', async () => {
                    globalThis.mockSupabaseClient.auth._setMockUser(mockUser);
                    const mockStudyMaterial = {
                      id: 'sm-123',
                      user_id: mockUser.id,
                      original_name: 'Test Document',
                    };
                    mockStudyMaterialsSelect.mockReturnThis();
                    mockStudyMaterialsEq.mockReturnThis();
                    mockStudyMaterialsEq.mockReturnThis();
                    mockStudyMaterialsSingle.mockResolvedValueOnce({ data: mockStudyMaterial, error: null });
      
              // Mock the download of the document content
              mockDownload.mockResolvedValueOnce({
                data: {
                  text: jest.fn().mockResolvedValue('This is long enough text for a summary. This is long enough text for a summary. This is long enough text for a summary. This is long enough text for a summary.'),
                } as unknown as Blob,
                error: null
              });
        
              const mockGeneratedContent = {
                id: 'gc-123',
                study_material_id: 'sm-123',
                user_id: mockUser.id,
                content_type: 'summary', // Changed from type to content_type
                          content: {
                            summary: `This is a mock summary for document ID: sm-123. The document content has 163 characters.`, // Corrected character count
                          },                model_used: 'mock-model-v1', // Added expected field
              };
        
              mockGeneratedContentInsert.mockReturnThis();
              mockGeneratedContentSelect.mockReturnThis();
              mockGeneratedContentSingle.mockResolvedValueOnce({ data: mockGeneratedContent, error: null });
        
              mockRequest = {
                json: () => Promise.resolve({ documentId: 'sm-123', type: 'summary', options: { length: 'short' } }),
              };
        
              const response = await POST(mockRequest as NextRequest);
              const body = await response.json();
        
              expect(response.status).toBe(200);
              expect(body).toEqual(mockGeneratedContent); // API returns generatedContent directly
              expect(globalThis.mockSupabaseClient.from).toHaveBeenCalledWith('study_materials');
              expect(mockStudyMaterialsEq).toHaveBeenCalledWith('id', 'sm-123');
              expect(mockStudyMaterialsEq).toHaveBeenCalledWith('user_id', mockUser.id);
              expect(globalThis.mockSupabaseClient.from).toHaveBeenCalledWith('generated_content');
              expect(mockGeneratedContentInsert).toHaveBeenCalledWith({
                study_material_id: 'sm-123',
                user_id: mockUser.id,
                content_type: 'summary', // Changed from type to content_type
                content: {
                  summary: `This is a mock summary for document ID: sm-123. The document content has 159 characters.`,
                },
                model_used: 'mock-model-v1',
              });
            });      it('should return 400 for unsupported generation type (quiz)', async () => {
        globalThis.mockSupabaseClient.auth._setMockUser(mockUser);
        mockRequest = {
          json: () => Promise.resolve({ documentId: 'sm-456', type: 'quiz', options: { difficulty: 'medium' } }),
        };
  
        const response = await POST(mockRequest as NextRequest);
        const body = await response.json();
  
        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid generation type');
      });
      it('should return 500 if storing generated content fails', async () => {
        globalThis.mockSupabaseClient.auth._setMockUser(mockUser);
        const mockStudyMaterial = {
          id: 'sm-fail',
          user_id: mockUser.id,
          original_name: 'Fail Document',
        };
        mockStudyMaterialsSelect.mockReturnThis();
        mockStudyMaterialsEq.mockReturnThis();
        mockStudyMaterialsEq.mockReturnThis();
        mockStudyMaterialsSingle.mockResolvedValueOnce({ data: mockStudyMaterial, error: null });
  
        // Mock the download of the document content
        mockDownload.mockResolvedValueOnce({
          data: {
            text: jest.fn().mockResolvedValue('This is long enough text for a summary. This is long enough text for a summary. This is long enough text for a summary. This is long enough text for a summary.'),
          } as unknown as Blob,
          error: null
        });
  
        mockGeneratedContentInsert.mockReturnThis();
        mockGeneratedContentSelect.mockReturnThis();
        mockGeneratedContentSingle.mockResolvedValueOnce({ data: null, error: { message: 'DB Insert Error' } }); // For insert failing
  
        mockRequest = {
          json: () => Promise.resolve({ documentId: 'sm-fail', type: 'summary' }),
        };
  
        const response = await POST(mockRequest as NextRequest);
        const body = await response.json();
  
        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to save summary.');
      });});
