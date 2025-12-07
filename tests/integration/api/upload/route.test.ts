// tests/integration/api/upload/route.test.ts
import { POST } from '@/app/api/upload/route';
// Removed: import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Readable } from 'stream';
import { createClient } from '@/lib/supabase/server'; // Import the actual function to mock

// Mock Supabase and Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock the uuid library
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

// Refactor mockSupabase to be globally accessible for jest.mock
const mockUpload = jest.fn();
const mockRemove = jest.fn();
const mockStorageFrom = jest.fn((bucketName: string) => ({
  upload: mockUpload,
  remove: mockRemove,
}));

const mockSingle = jest.fn();
const mockSelect = jest.fn(() => ({
  single: mockSingle,
}));
const mockInsert = jest.fn(() => ({
  select: mockSelect,
}));
const mockUpdate = jest.fn(); // This will be the final call in the update chain
const mockEq = jest.fn(() => ({ // The eq method returns an object that has the update method
  update: mockUpdate,
}));

const mockFrom = jest.fn((tableName: string) => ({
  insert: mockInsert,
  update: jest.fn(() => ({ // The update method returns an object that has the eq method
    eq: mockEq,
  })),
}));

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  storage: {
    from: mockStorageFrom,
  },
  from: mockFrom,
};

// Removed: jest.mock('@supabase/auth-helpers-nextjs', ...)

// Mock the shared Supabase client creator
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
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

  describe('General Upload Scenarios', () => {
    // let mockSupabase: any; // No longer needed here, now global
    let mockCookies: any;

    beforeEach(() => {
      jest.clearAllMocks();

      // Ensure mockSupabase is reset for each test
      mockSupabase.auth.getUser.mockClear();
      mockSupabase.storage.from().upload.mockClear();
      mockSupabase.storage.from().remove.mockClear();
      mockSupabase.from().insert.mockClear();
      mockSupabase.from().update.mockClear();
      mockSupabase.from().eq.mockClear();
      mockSupabase.from.mockClear();


      (createClient as jest.Mock).mockResolvedValue(mockSupabase); // Mock the shared createClient
      mockCookies = (cookies as jest.Mock).mockReturnValue({}); // default empty cookies
    });

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
      mockSupabase.storage.from().upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });
      mockSupabase.from().eq.mockReturnThis(); // Mock eq before update
      mockSupabase.from().update.mockResolvedValueOnce({ data: null, error: null }); // Mock update

      const request = createMockRequest(mockFile, fileContent, 'class-abc', 'section-xyz');
      const response = await POST(request);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        message: 'File uploaded and processed successfully!',
        studyMaterialId: mockMaterialId,
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.storage.from().upload).toHaveBeenCalledWith(
        mockStoragePath,
        expect.any(Blob), // File object passed directly
        { cacheControl: '3600', upsert: false }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          file_name: 'document.txt',
          original_name: 'document.txt',
          storage_path: mockStoragePath,
          file_type: 'txt',
          file_size: fileContent.length,
          class_id: 'class-abc',
          class_section_id: 'section-xyz',
          // extracted_text is not inserted directly, but updated later
        })
      );
      expect(mockSupabase.from().insert().select().single).toHaveBeenCalled();

      // Expect the update to extracted_text to be called for TXT files
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ extracted_text: fileContent });
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', mockMaterialId);
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
      mockSupabase.storage.from().upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });
      mockSupabase.from().eq.mockReturnThis(); // Mock eq before update
      mockSupabase.from().update.mockResolvedValueOnce({ data: null, error: null }); // Mock update for extracted_text

      // Mock the fetch call for the Vercel function
      jest.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ studyMaterialId: mockMaterialId, extractedText: mockExtractedText }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      // Add a mock for req.nextUrl.origin
      const mockRequest = createMockRequest(mockFile, pdfContent);
      // @ts-ignore
      mockRequest.nextUrl = new URL('http://localhost');


      const response = await POST(mockRequest);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        message: 'File uploaded and processed successfully!',
        studyMaterialId: mockMaterialId,
      });

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.storage.from().upload).toHaveBeenCalledWith(
        mockStoragePath,
        expect.any(Blob), // File object passed directly
        { cacheControl: '3600', upsert: false }
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          file_name: 'document.pdf',
          original_name: 'document.pdf',
          storage_path: mockStoragePath,
          file_type: 'pdf',
          file_size: pdfBuffer.length,
          class_id: null,
          class_section_id: null,
          // extracted_text is null initially, updated later
        })
      );
      expect(mockSupabase.from().insert().select().single).toHaveBeenCalled();

      // Assert the fetch call to the Vercel function
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost/api/pdf-parser',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studyMaterialId: mockMaterialId, storagePath: mockStoragePath }),
        })
      );

      // Assert the update to extracted_text for PDF files
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ extracted_text: mockExtractedText });
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', mockMaterialId);

      // Restore original fetch after the test
      (global.fetch as jest.Mock).mockRestore();
    });

    it('should return 500 if Supabase storage upload fails', async () => {
      const userId = 'user-1';
      const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockSupabase.storage.from().upload.mockResolvedValueOnce({ data: null, error: { message: 'Upload failed' } });

      const request = createMockRequest(mockFile, 'test'); // fileContent is still 'test' for mock purposes
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Failed to upload file to storage.' });
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.storage.from().upload).toHaveBeenCalled();
      expect(mockSupabase.from).not.toHaveBeenCalled(); // No insert if upload fails
    });

    it('should return 500 if Supabase database insert fails and attempt to remove file', async () => {
      const userId = 'user-1';
      const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.txt`;

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockSupabase.storage.from().upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });

      const request = createMockRequest(mockFile);
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Failed to save file metadata.' });
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.storage.from().upload).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.from().insert).toHaveBeenCalled();
      expect(mockSupabase.storage.from().remove).toHaveBeenCalledWith([mockStoragePath]); // Verify cleanup
    });
  });

  describe('PDF Processing via Vercel Function', () => {
    let mockFetch: jest.SpyInstance;
    let mockSupabase: any;
    let mockCookies: any;

    beforeEach(() => {
      jest.clearAllMocks();

      const mockUpload = jest.fn();
      const mockRemove = jest.fn();
      const mockStorageFrom = jest.fn((bucketName: string) => ({
        upload: mockUpload,
        remove: mockRemove,
      }));

      const mockSingle = jest.fn();
      const mockSelect = jest.fn(() => ({
        single: mockSingle,
      }));
      const mockInsert = jest.fn(() => ({
        select: mockSelect,
      }));
      const mockUpdate = jest.fn();
      const mockEq = jest.fn(() => ({
        update: mockUpdate,
      }));
      const mockFrom = jest.fn((tableName: string) => ({
        insert: mockInsert,
        update: jest.fn(() => ({ // Mock update and chainable methods
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        })),
      }));

      mockSupabase = {
        auth: {
          getUser: jest.fn(),
        },
        storage: {
          from: mockStorageFrom,
        },
        from: mockFrom,
      };

      (createClient as jest.Mock).mockResolvedValue(mockSupabase);
      mockCookies = (cookies as jest.Mock).mockReturnValue({}); // default empty cookies

      // Mock global.fetch
      mockFetch = jest.spyOn(global, 'fetch');
    });

    afterEach(() => {
      mockFetch.mockRestore(); // Restore original fetch after each test
    });

    it('should successfully process a PDF via Vercel Function and update extracted_text', async () => {
      const userId = 'user-1';
      const pdfBuffer = Buffer.from('Mock PDF Content');
      const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.pdf`;
      const mockMaterialId = 'material-pdf-123';
      const mockExtractedText = 'Extracted text from mock PDF.';

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockSupabase.storage.from().upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });
      mockSupabase.from().eq.mockReturnThis(); // Mock eq before update


      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ studyMaterialId: mockMaterialId, extractedText: mockExtractedText }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const request = createMockRequest(mockFile, pdfBuffer);
      const response = await POST(request);

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        message: 'File uploaded successfully',
        studyMaterialId: mockMaterialId,
        extractedText: mockExtractedText,
      });

      expect(mockSupabase.storage.from().upload).toHaveBeenCalled();
      expect(mockSupabase.from().insert).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/process-pdf'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ studyMaterialId: mockMaterialId, storagePath: mockStoragePath }),
        })
      );
      expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({ extracted_text: mockExtractedText });
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', mockMaterialId);
    });

    it('should return an error if Vercel Function for PDF processing fails', async () => {
      const userId = 'user-1';
      const pdfBuffer = Buffer.from('Mock PDF Content');
      const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.pdf`;
      const mockMaterialId = 'material-pdf-456';
      const errorMessage = 'This file is password-protected or corrupted and cannot be processed.';

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockSupabase.storage.from().upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });
      // Mock for cleanup operations
      mockSupabase.from().update().eq.mockResolvedValueOnce({ data: null, error: null });

      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ error: errorMessage }), {
          status: 422, // Expect 422 for unprocessable entity
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const request = createMockRequest(mockFile, pdfBuffer);
      const response = await POST(request);

      expect(response.status).toBe(422); // Check for 422 status
      await expect(response.json()).resolves.toEqual({ error: errorMessage });

      // Expect the study_materials table to be updated with the error
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        extracted_text: expect.stringContaining(`Error processing PDF: ${errorMessage}`),
      });
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', mockMaterialId);

      // Should NOT attempt to remove file from storage or delete DB entry on processing error
      expect(mockSupabase.storage.from().remove).not.toHaveBeenCalled();
      expect(mockSupabase.from().delete).not.toHaveBeenCalled();
    });

    it('should return an error if Vercel Function call fails', async () => {
      const userId = 'user-1';
      const pdfBuffer = Buffer.from('Mock PDF Content');
      const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
      const mockStoragePath = `study_materials/${userId}/mock-uuid.pdf`;
      const mockMaterialId = 'material-pdf-789';

      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
      mockSupabase.storage.from().upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
      mockSupabase.from().insert().select().single.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });
      // Mock for cleanup operations
      mockSupabase.from().update().eq.mockResolvedValueOnce({ data: null, error: null });

      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch')); // Simulate network error or service unavailability

      const request = createMockRequest(mockFile, pdfBuffer);
      const response = await POST(request);

      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toEqual({ error: 'Failed to process PDF.' });

      // Expect the study_materials table to be updated with the error
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        extracted_text: expect.stringContaining('Error processing PDF: Failed to fetch'),
      });
      expect(mockSupabase.from().update().eq).toHaveBeenCalledWith('id', mockMaterialId);

      // Should NOT attempt to remove file from storage or delete DB entry on processing error
      expect(mockSupabase.storage.from().remove).not.toHaveBeenCalled();
      expect(mockSupabase.from().delete).not.toHaveBeenCalled();
    });
  });