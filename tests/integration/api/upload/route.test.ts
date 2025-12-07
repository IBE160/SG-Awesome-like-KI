// tests/integration/api/upload/route.test.ts
import { POST } from '@/app/api/upload/route';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server'; // Import the actual function to mock

// Mock Supabase and Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock the uuid library
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

// Global mock Supabase client and its chainable methods
const mockUpload = jest.fn();
const mockRemove = jest.fn();
const mockStorageFrom = jest.fn((bucketName: string) => ({
  upload: mockUpload,
  remove: mockRemove,
}));

// Mock for select.single() call
const mockSingle = jest.fn();

// Mock for .select() method, which can be followed by .single() or awaited directly
const mockSelect = jest.fn(() => ({
  single: mockSingle,
  then: jest.fn((resolve) => resolve({ data: [], error: null })) // Default to empty array for .select().then()
}));

// Mock for .insert() method, which returns something with a .select() method
const mockInsert = jest.fn(() => ({
  select: mockSelect,
}));

// Mock for update.eq.update
const mockChainedUpdate = jest.fn();
const mockEq = jest.fn(() => ({
  update: mockChainedUpdate,
}));
const mockUpdate = jest.fn(() => ({
  eq: mockEq,
}));


// Combined mock Supabase instance
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  storage: {
    from: mockStorageFrom,
  },
  from: jest.fn((tableName: string) => ({
    insert: mockInsert,
    update: mockUpdate,
  })),
};

// Mock the local createClient function to return our mockSupabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('POST /api/upload', () => {
  // Helper to create a mock Request object
  const createMockRequest = (file: File | null, fileContent: string | Buffer | undefined = undefined, classId?: string, classSectionId?: string): Request => {
    const formData = new FormData();
    if (file) {
      // Add a mock arrayBuffer method to the File object
      Object.defineProperty(file, 'arrayBuffer', {
        value: () => Promise.resolve(
          fileContent instanceof Buffer
            ? fileContent.buffer
            : new TextEncoder().encode(fileContent as string).buffer
        ),
        writable: true,
        configurable: true,
      });
      formData.append('file', file);
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

  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mock function calls and their return values

    // Reset all mock implementations to their default behavior or re-mock them
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    mockUpload.mockResolvedValue({ data: { path: 'mock-path/file.txt' }, error: null });
    mockRemove.mockResolvedValue({ data: [], error: null });
    mockSingle.mockResolvedValue({ data: { id: 'mock-material-id' }, error: null }); // Default for select().single()
    mockInsert.mockImplementation(() => ({
      select: () => ({
        single: mockSingle,
        then: jest.fn((resolve) => resolve({ data: [], error: null }))
      })
    }));
    mockChainedUpdate.mockResolvedValue({ data: null, error: null }); // Default for .update().eq().update()

    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn((name: string) => undefined),
      set: jest.fn(),
      delete: jest.fn(),
    });

    // Mock global.fetch by default to avoid network errors unless explicitly tested
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Success' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore original implementations after each test
  });

  describe('General Upload Scenarios', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const request = createMockRequest(new File(['test'], 'test.txt', { type: 'text/plain' }));
      const response = await POST(request);

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' });
      expect(mockSupabase.storage.from).not.toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return 400 if no file is uploaded', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });

      const request = createMockRequest(null); // No file
      const response = await POST(request);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'No file uploaded' });
      expect(mockSupabase.storage.from).not.toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return 400 for unsupported file type', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      const unsupportedFile = new File(['image'], 'image.png', { type: 'image/png' });

      const request = createMockRequest(unsupportedFile);
      const response = await POST(request);

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'This file type is not supported. Please try another file.' });
      expect(mockSupabase.storage.from).not.toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return 413 for file exceeding size limit', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
      const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024 + 1)], 'large.txt', { type: 'text/plain' }); // > 10MB

      const request = createMockRequest(largeFile);
      const response = await POST(request);

      expect(response.status).toBe(413);
      await expect(response.json()).resolves.toEqual({ error: 'File size exceeds 10MB limit.' });
      expect(mockSupabase.storage.from).not.toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should successfully upload a .txt file and store metadata', async () => {
      const userId = 'user-1';
      const fileContent = 'hello world';
      const mockFile = new File([fileContent], 'document.txt', { type: 'text/plain' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.txt`;
      const mockMaterialId = 'material-123';

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockUpload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSingle.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });

      const request = createMockRequest(mockFile, fileContent, 'class-abc', 'section-xyz');
      const response = await POST(request);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        message: 'File uploaded and processed successfully!',
        studyMaterialId: mockMaterialId,
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockUpload).toHaveBeenCalledWith(
        mockStoragePath,
        expect.any(Blob),
        { cacheControl: '3600', upsert: false }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
      expect(mockInsert).toHaveBeenCalledWith(
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
      expect(mockSingle).toHaveBeenCalled();
      expect(mockChainedUpdate).toHaveBeenCalledWith({ extracted_text: fileContent });
      expect(mockEq).toHaveBeenCalledWith('id', mockMaterialId);
    });

    it('should successfully upload a .pdf file, call Vercel Function, and update extracted_text', async () => {
      const userId = 'user-1';
      const pdfContent = 'Mock PDF Content';
      const pdfBuffer = Buffer.from(pdfContent);
      const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.pdf`;
      const mockMaterialId = 'material-456';
      const mockExtractedText = 'Extracted text from PDF';

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockUpload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSingle.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });

      jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ studyMaterialId: mockMaterialId, extractedText: mockExtractedText }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const request = createMockRequest(mockFile, pdfContent);
      const response = await POST(request);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        message: 'File uploaded and processed successfully!',
        studyMaterialId: mockMaterialId,
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockUpload).toHaveBeenCalledWith(
        mockStoragePath,
        expect.any(Blob),
        { cacheControl: '3600', upsert: false }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
      expect(mockInsert).toHaveBeenCalledWith(
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
      expect(mockSingle).toHaveBeenCalled();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/pdf-parser',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ studyMaterialId: mockMaterialId, storagePath: mockStoragePath }),
        })
      );

      expect(mockChainedUpdate).toHaveBeenCalledWith({ extracted_text: mockExtractedText });
      expect(mockEq).toHaveBeenCalledWith('id', mockMaterialId);
    });

    it('should return 500 if Supabase storage upload fails', async () => {
      const userId = 'user-1';
      const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockUpload.mockResolvedValueOnce({ data: null, error: { message: 'Upload failed' } });

      const request = createMockRequest(mockFile, 'test');
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Failed to upload file to storage.' });
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockUpload).toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should return 500 if Supabase database insert fails and attempt to remove file', async () => {
      const userId = 'user-1';
      const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.txt`;

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockUpload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } }); // Simulate insert failure

      const request = createMockRequest(mockFile);
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Failed to save file metadata.' });
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockUpload).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
      expect(mockInsert).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalledWith([mockStoragePath]); // Verify cleanup
    });
  });

  describe('PDF Processing via Vercel Function (Error Handling)', () => {
    // Note: mockSupabase is already defined globally and reset in beforeEach
    // The previous error was a re-declaration, now fixed by removing the local `let mockSupabase: any;`

    beforeEach(() => {
      jest.clearAllMocks(); // Clears all mock function calls and their return values

      // Reset all mock implementations to their default behavior or re-mock them
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockUpload.mockResolvedValue({ data: { path: 'mock-path/file.txt' }, error: null });
      mockRemove.mockResolvedValue({ data: [], error: null });
      mockSingle.mockResolvedValue({ data: { id: 'mock-material-id' }, error: null }); // Default for select().single()
      mockInsert.mockImplementation(() => ({
        select: () => ({
          single: mockSingle,
          then: jest.fn((resolve) => resolve({ data: [], error: null }))
        })
      }));
      mockChainedUpdate.mockResolvedValue({ data: null, error: null }); // Default for .update().eq().update()

      (cookies as jest.Mock).mockReturnValue({
        get: jest.fn((name: string) => undefined),
        set: jest.fn(),
        delete: jest.fn(),
      });

      // Mock global.fetch by default to avoid network errors unless explicitly tested
      jest.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ message: 'Success' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    afterEach(() => {
      jest.restoreAllMocks(); // Restore original implementations after each test
    });

    it('should return an error if Vercel Function for PDF processing fails', async () => {
      const userId = 'user-1';
      const pdfBuffer = Buffer.from('Mock PDF Content');
      const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.pdf`;
      const mockMaterialId = 'material-pdf-456';
      const errorMessage = 'This file is password-protected or corrupted and cannot be processed.';

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockUpload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSingle.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });

      jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ error: errorMessage }), {
          status: 422, // Expect 422 for unprocessable entity
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const request = createMockRequest(mockFile, pdfBuffer);
      const response = await POST(request);

      expect(response.status).toBe(422);
      await expect(response.json()).resolves.toEqual({ error: errorMessage });

      expect(mockChainedUpdate).toHaveBeenCalledWith({
        extracted_text: expect.stringContaining(`Error processing PDF: ${errorMessage}`),
      });
      expect(mockEq).toHaveBeenCalledWith('id', mockMaterialId);

      expect(mockRemove).not.toHaveBeenCalled();
      expect(mockSupabase.from().update().eq().delete).not.toHaveBeenCalled();
    });

    it('should return an error if Vercel Function call fails', async () => {
      const userId = 'user-1';
      const pdfBuffer = Buffer.from('Mock PDF Content');
      const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.pdf`;
      const mockMaterialId = 'material-pdf-789';

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockUpload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSingle.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });

      jest.spyOn(global, 'fetch').mockRejectedValueOnce(new TypeError('Failed to fetch')); // Simulate network error

      const request = createMockRequest(mockFile, pdfBuffer);
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Failed to process PDF.' });

      expect(mockChainedUpdate).toHaveBeenCalledWith({
        extracted_text: expect.stringContaining('Error processing PDF: Failed to fetch'),
      });
      expect(mockEq).toHaveBeenCalledWith('id', mockMaterialId);

      expect(mockRemove).not.toHaveBeenCalled();
      expect(mockSupabase.from().update().eq().delete).not.toHaveBeenCalled();
    });
  });
});
