// tests/integration/api/upload/route.test.ts
import { POST } from '@/app/api/upload/route';
import { cookies } from 'next/headers';
import { mockSupabaseClient } from '../../../../jest.setup';







describe('POST /api/upload', () => {
  // Helper to create a mock Request object
  const createMockRequest = (file: File | null, fileContent: string | Buffer | undefined = undefined, classId?: string, classSectionId?: string): Request => {
    const formData = new FormData();
    if (file) {
      // Create a Blob from the file content
      const blob = new Blob(
        [fileContent instanceof Buffer ? fileContent : String(fileContent)],
        { type: file.type }
      );
      // Create a File object from the Blob
      const mockFile = new File([blob], file.name, { type: file.type });
      formData.append('file', mockFile);
    }
    if (classId) {
      formData.append('class_id', classId);
    }
    if (classSectionId) {
      formData.append('class_section_id', classSectionId);
    }

    return {
      formData: async () => formData,
      // @ts-ignore
      headers: new Headers(),
      method: 'POST',
      url: 'http://localhost/api/upload',
    };
  };

 beforeEach(() => {    jest.clearAllMocks();
    mockSupabaseClient._reset(); // Reset the global mock client

    // Default authenticated user
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null });

    // Mock storage operations
    mockSupabaseClient.storage.from.mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: { path: 'mock-path/file.txt' }, error: null }),
      remove: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    // Mock database operations
    mockSupabaseClient.from.mockReturnValue({
      insert: jest.fn().mockImplementation((payload) => ({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 'mock-material-id', ...payload }, error: null }),
          then: jest.fn((resolve) => resolve({ data: [{ id: 'mock-material-id', ...payload }], error: null }))
        }),
      })),
      update: jest.fn().mockImplementation((payload) => ({
        eq: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue({ data: [{ id: 'mock-material-id', ...payload }], error: null }),
        }),
      })),
    });

    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn((name: string) => undefined),
      set: jest.fn(),
      delete: jest.fn(),
    });

      });
  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations after each test
  });

  describe('General Upload Scenarios', () => {
    it('should return 401 if user is not authenticated', async () => {
      // Explicitly mock unauthenticated user for this test
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const request = createMockRequest(new File(['test'], 'test.txt', { type: 'text/plain' }));
      const response = await POST(request);

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
      expect(mockSupabaseClient.storage.from).not.toHaveBeenCalled();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return 400 if no file is uploaded', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });

      const request = createMockRequest(null); // No file
      const response = await POST(request);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'No file uploaded' });
      expect(mockSupabaseClient.storage.from).not.toHaveBeenCalled();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return 400 for unsupported file type', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      const unsupportedFile = new File(['image'], 'image.png', { type: 'image/png' });

      const request = createMockRequest(unsupportedFile);
      const response = await POST(request);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'This file type is not supported.' });
      expect(mockSupabaseClient.storage.from).not.toHaveBeenCalled();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return 413 for file exceeding size limit', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024 + 1)], 'large.txt', { type: 'text/plain' }); // > 10MB

      const request = createMockRequest(largeFile);
      const response = await POST(request);

      expect(response.status).toBe(413);
      await expect(response.json()).resolves.toEqual({ error: 'File size exceeds 10MB limit.' });
      expect(mockSupabaseClient.storage.from).not.toHaveBeenCalled();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should successfully upload a .txt file and store metadata', async () => {
      const userId = 'user-1';
      const fileContent = 'hello world';
      const mockFile = new File([fileContent], 'document.txt', { type: 'text/plain' });
      // Call uuidv4 once for this test to get the current UUID
      const currentUuid = require('uuid').v4().split('-').pop(); // Get just the counter part
      const mockStoragePath = `study_materials/${userId}/mock-uuid-${currentUuid}.txt`;
      const mockMaterialId = 'mock-material-id'; // This still comes from mockSupabaseClient's default

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });

      const request = createMockRequest(mockFile, fileContent, 'class-abc', 'section-xyz');
      const response = await POST(request);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        message: 'File uploaded successfully',
        studyMaterialId: mockMaterialId,
      });

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('study-materials');
      expect(mockSupabaseClient.storage.from('study-materials').upload).toHaveBeenCalledWith(
        mockStoragePath,
        expect.any(Blob),
        { cacheControl: '3600', upsert: false }
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabaseClient.from('study_materials').insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          file_name: 'document.txt',
          original_name: 'document.txt',
          storage_path: mockStoragePath,
          file_type: 'txt',
          file_size: fileContent.length,
          class_id: 'class-abc',
          class_section_id: 'section-xyz',
        })
      );
      expect(mockSupabaseClient.from('study_materials').insert().select().single).toHaveBeenCalled();
      expect(mockSupabaseClient.from('study_materials').update().eq().update).toHaveBeenCalledWith({ extracted_text: fileContent });
      expect(mockSupabaseClient.from('study_materials').update().eq).toHaveBeenCalledWith('id', mockMaterialId);
    });

    it('should successfully upload a .pdf file and store metadata', async () => {
      const userId = 'user-1';
      const pdfContent = 'Mock PDF Content';
      const pdfBuffer = Buffer.from(pdfContent);
      const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
      // Call uuidv4 once for this test to get the current UUID
      const currentUuid = require('uuid').v4().split('-').pop(); // Get just the counter part
      const mockStoragePath = `study_materials/${userId}/mock-uuid-${currentUuid}.pdf`;
      const mockMaterialId = 'mock-material-id'; // This still comes from mockSupabaseClient's default

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });

      const request = createMockRequest(mockFile, pdfContent);
      const response = await POST(request);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        message: 'File uploaded successfully',
        studyMaterialId: mockMaterialId,
      });

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('study-materials');
      expect(mockSupabaseClient.storage.from('study-materials').upload).toHaveBeenCalledWith(
        mockStoragePath,
        expect.any(Blob),
        { cacheControl: '3600', upsert: false }
      );

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabaseClient.from('study_materials').insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          file_name: 'document.pdf',
          original_name: 'document.pdf',
          storage_path: mockStoragePath,
          file_type: 'pdf',
          file_size: pdfBuffer.length,
          class_id: null,
          class_section_id: null,
        })
      );
      expect(mockSupabaseClient.from('study_materials').insert().select().single).toHaveBeenCalled();


    });

    it('should return 500 if Supabase storage upload fails', async () => {
      const userId = 'user-1';
      const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });

      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockSupabaseClient.storage.from('study_materials').upload.mockResolvedValueOnce({ data: null, error: { message: 'Upload failed' } });

      const request = createMockRequest(mockFile, 'test');
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Upload failed' });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('study-materials');
      expect(mockSupabaseClient.storage.from('study-materials').upload).toHaveBeenCalled();
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should return 500 if Supabase database insert fails and attempt to remove file', async () => {
      const userId = 'user-1';
      const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });
      // Call uuidv4 once for this test to get the current UUID
      const currentUuid = require('uuid').v4().split('-').pop(); // Get just the counter part
      const mockStoragePath = `study_materials/${userId}/mock-uuid-${currentUuid}.txt`;
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockSupabaseClient.from('study_materials').insert.mockImplementationOnce(() => ({
        select: () => ({
          single: jest.fn().mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } }),
          then: jest.fn((resolve) => resolve({ data: [], error: { message: 'Insert failed' } }))
        })
      }));

      const request = createMockRequest(mockFile);
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Failed to save metadata' });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('study-materials');
      expect(mockSupabaseClient.storage.from('study-materials').upload).toHaveBeenCalled();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabaseClient.from('study_materials').insert).toHaveBeenCalled();
      expect(mockSupabaseClient.storage.from('study-materials').remove).toHaveBeenCalledWith([mockStoragePath]); // Verify cleanup
    });
  });

  describe('PDF Processing via Vercel Function (Error Handling)', () => {
    // Note: mockSupabaseClient is already defined globally and reset in beforeEach
    // The previous error was a re-declaration, now fixed by removing the local `let mockSupabaseClient: any;`








  });
});
