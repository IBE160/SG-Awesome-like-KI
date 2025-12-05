// tests/integration/api/upload/route.test.ts
import { POST } from '@/app/api/upload/route';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Readable } from 'stream';

// Mock Supabase and Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}));

// Mock the uuid library
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('POST /api/upload', () => {
  let mockSupabase: any;
  let mockCookies: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      storage: {
        from: jest.fn().mockReturnThis(), // allows chaining .from().upload()
        upload: jest.fn(),
        remove: jest.fn(),
      },
      from: jest.fn().mockReturnThis(), // allows chaining .from().insert()
      insert: jest.fn(() => ({ // insert returns an object that has select()
        select: jest.fn(() => ({ // select() returns an object that has single()
          single: jest.fn(),
        })),
      })),
      single: jest.fn(),
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
    mockCookies = (cookies as jest.Mock).mockReturnValue({}); // default empty cookies
  });

  // Helper to create a mock Request object
  const createMockRequest = (file: File | null, classId?: string, classSectionId?: string): Request => {
    const formData = new FormData();
    if (file) {
      // Add a mock arrayBuffer method to the File object
      Object.defineProperty(file, 'arrayBuffer', {
        value: () => Promise.resolve(new ArrayBuffer(file.size)), // Mock the ArrayBuffer content based on file.size
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

  it('should return 400 for file exceeding size limit', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
    const largeFile = new File([new ArrayBuffer(10 * 1024 * 1024 + 1)], 'large.txt', { type: 'text/plain' }); // > 10MB

    const request = createMockRequest(largeFile);
    const response = await POST(request);

    expect(response.status).toBe(400);
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
    mockSupabase.storage.upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
    mockSupabase.insert.mockResolvedValueOnce({ data: [{ id: mockMaterialId }], error: null });
    mockSupabase.single.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });

    const request = createMockRequest(mockFile, 'class-abc', 'section-xyz');
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: 'File uploaded successfully',
      studyMaterialId: mockMaterialId,
    });

    expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
    expect(mockSupabase.storage.upload).toHaveBeenCalledWith(
      mockStoragePath,
      Buffer.from(fileContent),
      { contentType: 'text/plain', upsert: false }
    );

    expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: userId,
      file_name: 'document.txt',
      original_name: 'document.txt',
      storage_path: mockStoragePath,
      file_type: 'text/plain',
      file_size: fileContent.length,
      class_id: 'class-abc',
      class_section_id: 'section-xyz',
      extracted_text: fileContent,
    });
    expect(mockSupabase.single).toHaveBeenCalled();
  });

  it('should successfully upload a .pdf file and store metadata (without extracted_text)', async () => {
    const userId = 'user-1';
    const pdfBuffer = Buffer.from(new ArrayBuffer(100)); // Mock PDF content
    const mockFile = new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' });
    const mockStoragePath = `study_materials/${userId}/mock-uuid.pdf`;
    const mockMaterialId = 'material-456';

    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
    mockSupabase.storage.upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
    mockSupabase.insert.mockResolvedValueOnce({ data: [{ id: mockMaterialId }], error: null });
    mockSupabase.single.mockResolvedValueOnce({ data: { id: mockMaterialId }, error: null });

    const request = createMockRequest(mockFile);
    const response = await POST(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: 'File uploaded successfully',
      studyMaterialId: mockMaterialId,
    });

    expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
    expect(mockSupabase.storage.upload).toHaveBeenCalledWith(
      mockStoragePath,
      pdfBuffer,
      { contentType: 'application/pdf', upsert: false }
    );

    expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      user_id: userId,
      file_name: 'document.pdf',
      original_name: 'document.pdf',
      storage_path: mockStoragePath,
      file_type: 'application/pdf',
      file_size: pdfBuffer.length,
      class_id: null,
      class_section_id: null,
      extracted_text: null, // PDF should not have extracted_text at this stage
    });
    expect(mockSupabase.single).toHaveBeenCalled();
  });

  it('should return 500 if Supabase storage upload fails', async () => {
    const userId = 'user-1';
    const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });

    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
    mockSupabase.storage.upload.mockResolvedValueOnce({ data: null, error: { message: 'Upload failed' } });

    const request = createMockRequest(mockFile);
    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to upload file to storage.' });
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
    expect(mockSupabase.storage.upload).toHaveBeenCalled();
    expect(mockSupabase.from).not.toHaveBeenCalled(); // No insert if upload fails
  });

  it('should return 500 if Supabase database insert fails and attempt to remove file', async () => {
    const userId = 'user-1';
    const mockFile = new File(['test'], 'document.txt', { type: 'text/plain' });
    const mockStoragePath = `study_materials/${userId}/mock-uuid.txt`;

    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: { id: userId } }, error: null });
    mockSupabase.storage.upload.mockResolvedValueOnce({ data: { path: mockStoragePath }, error: null });
    mockSupabase.insert.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } });
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert failed' } }); // Mock single() call too

    const request = createMockRequest(mockFile);
    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: 'Failed to record file metadata.' });
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('study_materials');
    expect(mockSupabase.storage.upload).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('study_materials');
    expect(mockSupabase.insert).toHaveBeenCalled();
    expect(mockSupabase.storage.remove).toHaveBeenCalledWith([mockStoragePath]); // Verify cleanup
  });
});