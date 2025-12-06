// tests/integration/api/class_sections/route.test.ts
import { GET as getSections, POST as postSection } from '../../../../src/app/api/classes/[id]/sections/route';
import { PUT as putSection, DELETE as deleteSection } from '../../../../src/app/api/sections/[id]/route';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Mock Supabase and Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      status: init?.status || 200,
      json: async () => body,
    })),
    // Add other static methods of NextResponse if used in the tests
  },
  NextRequest: jest.fn(),
}));


describe('/api/classes/[id]/sections', () => {
  let mockSupabase: any;
  let mockCookies: any;
  let mockBuilderMethods: any;

  let mockSelect: jest.Mock;
  let mockInsert: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDeleteFn: jest.Mock;
  let mockEq: jest.Mock;
  let mockNot: jest.Mock;
  let mockSingle: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

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

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn(() => mockBuilderMethods),
    };

    (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
    mockCookies = (cookies as jest.Mock).mockReturnValue({});
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

  // Test GET /api/classes/[id]/sections
  describe('GET /api/classes/[id]/sections', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const request = createMockRequest('GET', 'http://localhost/api/classes/class-1/sections');
      const response = await getSections(request, { params: Promise.resolve({ id: 'class-1' }) });

      expect(response.status).toBe(401);
    });

    it('should return sections for a given class and authenticated user', async () => {
      const user = { id: 'user-1' };
      const classId = 'class-1';
      const sections = [{ id: 'section-1', name: 'Section 1', class_id: classId }];
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
      mockBuilderMethods.eq.mockResolvedValueOnce({ data: sections, error: null });
      
      const request = createMockRequest('GET', `http://localhost/api/classes/${classId}/sections`);
      const response = await getSections(request, { params: Promise.resolve({ id: classId }) });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.sections).toEqual(sections);
    });
  });

  // Test POST /api/classes/[id]/sections
  describe('POST /api/classes/[id]/sections', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

      const request = createMockRequest('POST', 'http://localhost/api/classes/class-1/sections', { name: 'New Section' });
      const response = await postSection(request, { params: Promise.resolve({ id: 'class-1' }) });

      expect(response.status).toBe(401);
    });

    it('should create a new section for a given class', async () => {
        const user = { id: 'user-1' };
        const classId = 'class-1';
        const newSection = { id: 'section-2', name: 'New Section', class_id: classId };
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
        // Mock for class ownership check
        mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: classId, user_id: user.id }, error: null });
        // Mock for uniqueness check
        mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
        // Mock for insert
        mockBuilderMethods.single.mockResolvedValueOnce({ data: newSection, error: null });

        const request = createMockRequest('POST', `http://localhost/api/classes/${classId}/sections`, { name: 'New Section' });
        const response = await postSection(request, { params: Promise.resolve({ id: classId }) });
        const body = await response.json();

        expect(response.status).toBe(201);
        expect(body.section).toEqual(newSection);
    });

    it('should return 409 if section name already exists in class', async () => {
        const user = { id: 'user-1' };
        const classId = 'class-1';
        mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
        // Mock for class ownership check
        mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: classId, user_id: user.id }, error: null });
        // Mock for uniqueness check
        mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'section-1' }, error: null });

        const request = createMockRequest('POST', `http://localhost/api/classes/${classId}/sections`, { name: 'Existing Section' });
        const response = await postSection(request, { params: Promise.resolve({ id: classId }) });
        
        expect(response.status).toBe(409);
    });
  });
});

describe('/api/sections/[id]', () => {
    let mockSupabase: any;
    let mockCookies: any;
    let mockBuilderMethods: any;
  
    let mockSelect: jest.Mock;
    let mockInsert: jest.Mock;
    let mockUpdate: jest.Mock;
    let mockDeleteFn: jest.Mock;
    let mockEq: jest.Mock;
    let mockNot: jest.Mock;
    let mockSingle: jest.Mock;
  
    beforeEach(() => {
        jest.clearAllMocks();
    
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
    
        mockSupabase = {
          auth: {
            getUser: jest.fn(),
          },
          from: jest.fn(() => mockBuilderMethods),
        };
    
        (createServerClient as jest.Mock).mockReturnValue(mockSupabase);
        mockCookies = (cookies as jest.Mock).mockReturnValue({});
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

    // Test PUT /api/sections/[id]
    describe('PUT /api/sections/[id]', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

            const request = createMockRequest('PUT', 'http://localhost/api/sections/section-1', { name: 'Updated Section' });
            const response = await putSection(request, { params: Promise.resolve({ id: 'section-1' }) });

            expect(response.status).toBe(401);
        });

        it('should update a section name', async () => {
            const user = { id: 'user-1' };
            const sectionId = 'section-1';
            const updatedSection = { id: sectionId, name: 'Updated Section', class_id: 'class-1' };
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
            // Mock for section ownership check
            mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: sectionId, class_id: 'class-1', classes: { user_id: user.id } }, error: null });
            // Mock for uniqueness check
            mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });
            // Mock for update
            mockBuilderMethods.single.mockResolvedValueOnce({ data: updatedSection, error: null });

            const request = createMockRequest('PUT', `http://localhost/api/sections/${sectionId}`, { name: 'Updated Section' });
            const response = await putSection(request, { params: Promise.resolve({ id: sectionId }) });
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.section).toEqual(updatedSection);
        });

        it('should return 404 if section not found or not owned by user', async () => {
            const user = { id: 'user-1' };
            const sectionId = 'section-1';
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
            // Mock for section ownership check (not found)
            mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });

            const request = createMockRequest('PUT', `http://localhost/api/sections/${sectionId}`, { name: 'Updated Section' });
            const response = await putSection(request, { params: Promise.resolve({ id: sectionId }) });

            expect(response.status).toBe(404);
        });

        it('should return 409 if section name already exists in class', async () => {
            const user = { id: 'user-1' };
            const sectionId = 'section-1';
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
            // Mock for section ownership check
            mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: sectionId, class_id: 'class-1', classes: { user_id: user.id } }, error: null });
            // Mock for uniqueness check (exists)
            mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: 'another-section' }, error: null });

            const request = createMockRequest('PUT', `http://localhost/api/sections/${sectionId}`, { name: 'Existing Section' });
            const response = await putSection(request, { params: Promise.resolve({ id: sectionId }) });

            expect(response.status).toBe(409);
        });
    });

    // Test DELETE /api/sections/[id]
    describe('DELETE /api/sections/[id]', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });

            const request = createMockRequest('DELETE', 'http://localhost/api/sections/section-1');
            const response = await deleteSection(request, { params: Promise.resolve({ id: 'section-1' }) });

            expect(response.status).toBe(401);
        });

        it('should delete a section', async () => {
            const user = { id: 'user-1' };
            const sectionId = 'section-1';
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
            // Mock for section ownership check
            mockBuilderMethods.single.mockResolvedValueOnce({ data: { id: sectionId, class_id: 'class-1', classes: { user_id: user.id } }, error: null });
            // Mock for delete
            mockBuilderMethods.delete().eq.mockResolvedValueOnce({ error: null });

            const request = createMockRequest('DELETE', `http://localhost/api/sections/${sectionId}`);
            const response = await deleteSection(request, { params: Promise.resolve({ id: sectionId }) });

            expect(response.status).toBe(204);
        });

        it('should return 404 if section not found or not owned by user', async () => {
            const user = { id: 'user-1' };
            const sectionId = 'section-1';
            mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user }, error: null });
            // Mock for section ownership check (not found)
            mockBuilderMethods.single.mockResolvedValueOnce({ data: null, error: null });

            const request = createMockRequest('DELETE', `http://localhost/api/sections/${sectionId}`);
            const response = await deleteSection(request, { params: Promise.resolve({ id: sectionId }) });

            expect(response.status).toBe(404);
        });
    });
});
