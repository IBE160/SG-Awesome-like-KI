import { GET, POST } from '@/app/api/classes/route';
import { PUT, DELETE } from '@/app/api/classes/[id]/route';
import { NextRequest } from 'next/server';


// Mock Next.js cookies (already done globally in jest.setup.ts, but good to be explicit if needed)
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('/api/classes', () => {
  let mockBuilderMethods: any;

  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDeleteFn: jest.Mock;
  let mockEq: jest.Mock;
  let mockNot: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    mockSupabaseClient._reset(); // Reset global Supabase mock state

    mockSelect = jest.fn();
    mockInsert = jest.fn();
    mockUpdate = jest.fn();
    mockDeleteFn = jest.fn();
    mockEq = jest.fn();
    mockNot = jest.fn();
    mockSingle = jest.fn();

    const mockDeleteResult = {
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
    };
    mockDeleteFn.mockReturnValue(mockDeleteResult);

    mockBuilderMethods = {
      select: mockSelect.mockReturnThis(),
      insert: mockInsert.mockReturnThis(),
      update: mockUpdate.mockReturnThis(),
      delete: mockDeleteFn,
      eq: mockEq.mockReturnThis(),
      not: mockNot.mockReturnThis(),
      single: mockSingle,
    };

    // Re-mock from() to return our specific builder methods for each test
    mockSupabaseClient.from.mockImplementation((tableName: string) => {
      // Reset internal query state for each 'from' call
      Object.keys(mockBuilderMethods).forEach(key => {
        if (typeof mockBuilderMethods[key].mockClear === 'function') {
          mockBuilderMethods[key].mockClear();
        }
      });
      return mockBuilderMethods;
    });
  });

  // Helper to create a mock Request object
  const createMockRequest = (method: string, url: string, body?: any): NextRequest => {
    return {
      json: async () => body,
      // @ts-ignore
      headers: new Headers(),
      method: method,
      url: url,
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        has: jest.fn(),
        getAll: jest.fn(),
      } as any, // Cast to any to avoid deep type issues with cookies
      nextUrl: new URL(url),
      page: {}, // Placeholder
      ua: 'mock-ua', // User Agent
    } as unknown as NextRequest;
  };

  // Test GET /api/classes
  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      // No need to explicitly mock getUser or set mockAuthUser, as it's cleared in beforeEach
      // and getSession will return null without mockAuthUser being set.
      const request = createMockRequest('GET', 'http://localhost/api/classes');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return classes for an authenticated user', async () => {
      const user = { id: 'user-1', email: 'test@example.com' };
      mockSupabaseClient.auth._setMockUser(user); // Set global mock user
      const classes = [{ id: 'class-1', name: 'Math', user_id: 'user-1' }];
      
      mockSelect.mockReturnThis(); // Mock select
      mockEq.mockReturnThis();     // Mock eq
      mockBuilderMethods.then = (resolve: any) => Promise.resolve(resolve({ data: classes, error: null })); // For the array of classes

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
        const user = { id: 'user-1', email: 'test@example.com' };
        mockSupabaseClient.auth._setMockUser(user); // Set global mock user
        const newClass = { id: 'class-2', name: 'History', user_id: 'user-1' };
        
        mockEq.mockReturnThis(); // Mock eq for uniqueness check
        mockSingle.mockResolvedValueOnce({ data: null, error: null }); // Uniqueness check returns no existing class
        mockInsert.mockReturnThis(); // Mock insert
        mockSelect.mockReturnThis(); // Mock select after insert
        mockSingle.mockResolvedValueOnce({ data: newClass, error: null }); // Insert returns the new class

        const request = createMockRequest('POST', 'http://localhost/api/classes', { name: 'History' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.class).toEqual(newClass);
    });

    it('should return 409 if class name already exists', async () => {
        const user = { id: 'user-1', email: 'test@example.com' };
        mockSupabaseClient.auth._setMockUser(user); // Set global mock user
        
        mockEq.mockReturnThis(); // Mock eq for uniqueness check
        mockSingle.mockResolvedValueOnce({ data: { id: 'class-1', name: 'Math', user_id: 'user-1' }, error: null }); // Uniqueness check finds existing class

        const request = createMockRequest('POST', 'http://localhost/api/classes', { name: 'Math' });
        const response = await POST(request);
        
        expect(response.status).toBe(409);
    });
  });
});

describe('/api/classes/[id]', () => {
    let mockBuilderMethods: any;
  
    let mockSelect: jest.Mock;
    let mockInsert: jest.Mock;
    let mockUpdate: jest.Mock;
    let mockDeleteFn: jest.Mock;
    let mockEq: jest.Mock;
    let mockNot: jest.Mock;
    let mockSingle: jest.Mock;
  
      beforeEach(() => {
        mockSupabaseClient._reset(); // Reset global Supabase mock state    
        mockSelect = jest.fn();
        mockInsert = jest.fn();
        mockUpdate = jest.fn();
        mockDeleteFn = jest.fn();
        mockEq = jest.fn();
        mockNot = jest.fn();
        mockSingle = jest.fn();
    
        const mockDeleteResult = {
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
        };
        mockDeleteFn.mockReturnValue(mockDeleteResult);
    
        mockBuilderMethods = {
          select: mockSelect.mockReturnThis(),
          insert: mockInsert.mockReturnThis(),
          update: mockUpdate.mockReturnThis(),
          delete: mockDeleteFn,
          eq: mockEq.mockReturnThis(),
          not: mockNot.mockReturnThis(),
          single: mockSingle,
        };
    
        // Re-mock from() to return our specific builder methods for each test
        mockSupabaseClient.from.mockImplementation((tableName: string) => {
          // Reset internal query state for each 'from' call
          Object.keys(mockBuilderMethods).forEach(key => {
            if (typeof mockBuilderMethods[key].mockClear === 'function') {
              mockBuilderMethods[key].mockClear();
            }
          });
          return mockBuilderMethods;
        });
      });

    // Helper to create a mock Request object
    const createMockRequest = (method: string, url: string, body?: any): NextRequest => {
        return {
          json: async () => body,
          // @ts-ignore
          headers: new Headers(),
          method: method,
          url: url,
          cookies: {
            get: jest.fn(),
            set: jest.fn(),
            delete: jest.fn(),
            has: jest.fn(),
            getAll: jest.fn(),
          } as any, // Cast to any to avoid deep type issues with cookies
          nextUrl: new URL(url),
          page: {}, // Placeholder
          ua: 'mock-ua', // User Agent
        } as unknown as NextRequest;
      };

    // Test PUT /api/classes/[id]
    describe('PUT', () => {
        it('should update a class name', async () => {
            const user = { id: 'user-1', email: 'test@example.com' };
            mockSupabaseClient.auth._setMockUser(user); // Set global mock user
            const updatedClass = { id: 'class-1', name: 'Advanced Math', user_id: 'user-1' };
            
            // Mock the update operation
            mockUpdate.mockReturnThis(); // update({ name: newName })
            mockEq.mockReturnThis();     // eq('id', classId)
            mockEq.mockReturnThis();     // eq('user_id', userId)
            mockSelect.mockReturnThis(); // select() after update
            mockSingle.mockResolvedValueOnce({ data: updatedClass, error: null }); // This should be the only single call.

            const request = createMockRequest('PUT', 'http://localhost/api/classes/class-1', { name: 'Advanced Math' });

            const response = await PUT(request, { params: { id: 'class-1' } }); // Use direct object for params
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.class).toEqual(updatedClass);
        });
    });

    // Test DELETE /api/classes/[id]
    describe('DELETE', () => {
        it('should delete a class', async () => {
            const user = { id: 'user-1', email: 'test@example.com' };
            mockSupabaseClient.auth._setMockUser(user); // Set global mock user
            
            // Mock to find the class to be deleted
            mockSelect.mockReturnThis(); // select()
            mockEq.mockReturnThis();     // eq('id', classId)
            mockEq.mockReturnThis();     // eq('user_id', userId)
            mockSingle.mockResolvedValueOnce({ data: { id: 'class-1', name: 'Math', user_id: 'user-1' }, error: null });

            // Mock the delete operation
            mockDeleteFn.mockReturnThis(); // delete()
            mockEq.mockReturnThis();       // eq('id', classId)
            mockEq.mockReturnThis();       // eq('user_id', userId)
            mockSingle.mockResolvedValueOnce({ data: null, error: null }); // Delete usually returns null data

            const request = createMockRequest('DELETE', 'http://localhost/api/classes/class-1');

            const response = await DELETE(request, { params: { id: 'class-1' } }); // Use direct object for params

            expect(response.status).toBe(204);
        });
    });
});