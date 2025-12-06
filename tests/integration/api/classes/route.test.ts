// tests/integration/api/classes/route.test.ts
import { GET, POST } from '@/app/api/classes/route';
import { PUT, DELETE } from '@/app/api/classes/[id]/route';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Mock Supabase and Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createRouteHandlerClient: jest.fn(),
}));

describe('/api/classes', () => {
  let mockSupabase: any;
  let mockCookies: any;
  let mockBuilderMethods: any; // Declared here

  beforeEach(() => {
    jest.clearAllMocks();

    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockEq = jest.fn();
    const mockNot = jest.fn();
    const mockSingle = jest.fn();

    mockBuilderMethods = { // Assign here
      select: mockSelect.mockReturnThis(),
      insert: mockInsert.mockReturnThis(),
      update: mockUpdate.mockReturnThis(),
      delete: mockDelete.mockReturnThis(),
      eq: mockEq.mockReturnThis(),
      not: mockNot.mockReturnThis(),
      single: mockSingle,
    };

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => mockBuilderMethods),
    };

    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
    mockCookies = (cookies as jest.Mock).mockReturnValue({});
  });

  // Helper to create a mock Request object
  const createMockRequest = (method: string, url: string, body?: any): Request => {
    return {
      json: async () => body,
      // @ts-ignore
      headers: new Headers(),
      method: method,
      url: url,
    };
  };

  // Test GET /api/classes
  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const request = createMockRequest('GET', 'http://localhost/api/classes');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return classes for an authenticated user', async () => {
      const user = { id: 'user-1' };
      const classes = [{ id: 'class-1', name: 'Math' }];
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
      mockBuilderMethods.eq.mockResolvedValueOnce({ data: classes, error: null }); // Mock the final value of the chain
      
      const request = createMockRequest('GET', 'http://localhost/api/classes');
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.classes).toEqual(classes);
    });
  });

  // Test POST /api/classes
  describe('POST', () => {
    it('should create a new class', async () => {
        const user = { id: 'user-1' };
        const newClass = { id: 'class-2', name: 'History' };
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
        // Mock for uniqueness check
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        // Mock for insert
        mockBuilderMethods.single.mockResolvedValueOnce({ data: newClass, error: null });

        const request = createMockRequest('POST', 'http://localhost/api/classes', { name: 'History' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.class).toEqual(newClass);
    });

    it('should return 409 if class name already exists', async () => {
        const user = { id: 'user-1' };
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
        // Mock for uniqueness check
        mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'class-1' }, error: null });

        const request = createMockRequest('POST', 'http://localhost/api/classes', { name: 'Math' });
        const response = await POST(request);
        
        expect(response.status).toBe(409);
    });
  });
});

describe('/api/classes/[id]', () => {
    let mockSupabase: any;
    let mockCookies: any;
    let mockBuilderMethods: any; // Declared here
  
    beforeEach(() => {
        jest.clearAllMocks();
    
        const mockSelect = jest.fn();
        const mockInsert = jest.fn();
        const mockUpdate = jest.fn();
        const mockDelete = jest.fn();
        const mockEq = jest.fn();
        const mockNot = jest.fn();
        const mockSingle = jest.fn();
    
        mockBuilderMethods = { // Assign here
          select: mockSelect.mockReturnThis(),
          insert: mockInsert.mockReturnThis(),
          update: mockUpdate.mockReturnThis(),
          delete: mockDelete.mockReturnThis(),
          eq: mockEq.mockReturnThis(),
          not: mockNot.mockReturnThis(),
          single: mockSingle,
        };
    
        mockSupabase = {
          auth: {
            getUser: jest.fn(),
          },
          from: jest.fn(() => mockBuilderMethods),
        };
    
        (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
        mockCookies = (cookies as jest.Mock).mockReturnValue({});
      });

    // Helper to create a mock Request object
    const createMockRequest = (method: string, url: string, body?: any): Request => {
        return {
          json: async () => body,
          // @ts-ignore
          headers: new Headers(),
          method: method,
          url: url,
        };
      };

    // Test PUT /api/classes/[id]
    describe('PUT', () => {
        it('should update a class name', async () => {
            const user = { id: 'user-1' };
            const updatedClass = { id: 'class-1', name: 'Advanced Math' };
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
            // Mock for uniqueness check
            mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
            // Mock for update
            mockBuilderMethods.single.mockResolvedValueOnce({ data: updatedClass, error: null });

            const request = createMockRequest('PUT', 'http://localhost/api/classes/class-1', { name: 'Advanced Math' });

            const response = await PUT(request, { params: { id: 'class-1' } });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.class).toEqual(updatedClass);
        });
    });

    // Test DELETE /api/classes/[id]
    describe('DELETE', () => {
        it('should delete a class', async () => {
            const user = { id: 'user-1' };
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
            // Mock for delete
            mockBuilderMethods.eq.mockResolvedValueOnce({ error: null });

            const request = createMockRequest('DELETE', 'http://localhost/api/classes/class-1');

            const response = await DELETE(request, { params: { id: 'class-1' } });

            expect(response.status).toBe(204);
        });
    });
});