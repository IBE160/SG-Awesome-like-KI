import { POST } from '../route';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Mock the dependencies
jest.mock('@/lib/supabase/server');
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({ body, init })),
  },
}));


const createMockSupabaseClient = (mocks: any) => ({
  auth: {
    getSession: jest.fn().mockResolvedValue(mocks.session || { data: { session: { user: { id: 'user-123' } } } }),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue(mocks.document || { data: { storage_path: 'path/to/doc.txt' } }),
  insert: jest.fn().mockReturnThis(),
  storage: {
    from: jest.fn(() => ({
          download: jest.fn().mockResolvedValue(mocks.storage || {
              data: new Blob(['This is sufficient text for a summary. This text is now long enough to pass the minimum length check for summary generation in the API route. It should be at least 100 characters long.'], { type: 'text/plain' }),
              error: null
          }),    })),
  },
});


describe('POST /api/generate (Summary)', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a generated summary successfully', async () => {
    mockSupabase = createMockSupabaseClient({
        document: { data: { storage_path: 'path/to/doc.txt' }, error: null },
        storage: { data: new Blob(['Sufficient content for summary generation.'], { type: 'text/plain' }) },
        session: { data: { session: { user: { id: 'user-123' } } }, error: null },
    });
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    
    // Mock the insert result
    const mockInsertResult = { data: { id: 'gen-1', content: { summary: 'This is a mock summary...' } }, error: null };
    mockSupabase.single.mockResolvedValueOnce({ data: { storage_path: 'path/to/doc.txt' }, error: null }); // For document fetch
    mockSupabase.single.mockResolvedValueOnce(mockInsertResult); // For insert result

    const request = {
      json: jest.fn().mockResolvedValue({ documentId: 'doc-1', type: 'summary' }),
    } as unknown as Request;

    await POST(request);

    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining(mockInsertResult.data), { status: 200 });
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({ content_type: 'summary' }));
  });

  it('should return 400 for invalid generation type', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({ documentId: 'doc-1', type: 'quiz' }),
    } as unknown as Request;
  
      await POST(request);
  
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Invalid generation type' }, { status: 400 });
  });

  it('should return 400 if documentId is missing', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({ type: 'summary' }),
    } as unknown as Request;
  
      await POST(request);
  
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'documentId is required' }, { status: 400 });
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase = createMockSupabaseClient({
        session: { data: { session: null }, error: new Error("Auth error") }
    });
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = {
      json: jest.fn().mockResolvedValue({ documentId: 'doc-1', type: 'summary' }),
    } as unknown as Request;
  
      await POST(request);
  
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Not authenticated' }, { status: 401 });
  });
  
  it('should return 404 if document is not found', async () => {
    mockSupabase = createMockSupabaseClient({
        document: { data: null, error: new Error("Not found") }
    });
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = {
      json: jest.fn().mockResolvedValue({ documentId: 'doc-nonexistent', type: 'summary' }),
    } as unknown as Request;
  
      await POST(request);
  
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Document not found or access denied.' }, { status: 404 });
  });

  it('should return 400 for insufficient text content', async () => {
    mockSupabase = createMockSupabaseClient({
        storage: { data: new Blob(['short'], { type: 'text/plain' }) }
    });
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);

    const request = {
      json: jest.fn().mockResolvedValue({ documentId: 'doc-1', type: 'summary' }),
    } as unknown as Request;
  
      await POST(request);
  
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Insufficient text for summary.' }, { status: 400 });
  });

});