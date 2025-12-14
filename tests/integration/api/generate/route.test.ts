// tests/integration/api/generate/route.test.ts
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/generate/route';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

import * as claudeLib from '@/lib/claude'; // Updated import

// Mock Supabase client
const mockGeneratedContentInsert = jest.fn(() => ({
  select: jest.fn(() => Promise.resolve({ data: [{ id: randomUUID(), content: { summary: MOCK_SUMMARY_CONTENT } }], error: null })),
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn((tableName) => {
      if (tableName === 'generated_content') {
        return {
          insert: mockGeneratedContentInsert,
          select: jest.fn(() => Promise.resolve({ data: [], error: null })), // Add select for consistency
        };
      }
      return {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(),
        })),
      };
    }),
  })),
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  })),
}));

// Mock Claude utility functions
jest.mock('@/lib/claude', () => ({
  generateSummaryWithClaude: jest.fn(),
  generateQuizWithClaude: jest.fn(),
  handleClaudeError: jest.fn((error) => { throw error; }), // Re-throw errors for testing
}));

const MOCK_USER_ID = randomUUID();
const MOCK_DOCUMENT_ID = randomUUID();
const MOCK_CLASS_SECTION_ID = randomUUID();
const MOCK_EXTRACTED_TEXT = 'This is a mock extracted text for study material summarization. It is intentionally made longer than 100 characters to ensure that the summary generation logic proceeds without triggering the "content too short" error path. This longer text allows for a proper test of successful summary creation.';
const MOCK_SUMMARY_CONTENT = 'This is the generated summary.';

const mockSupabase = createClient as jest.Mock;
const mockGenerateSummaryWithClaude = claudeLib.generateSummaryWithClaude as jest.Mock; // Updated to claudeLib


describe('POST /api/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'mock-anthropic-api-key'; // Mock the API key

    mockSupabase.mockImplementation(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: MOCK_USER_ID } } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn((column, value) => {
                if (column === 'id' && value === MOCK_DOCUMENT_ID) {
                  return {
                    eq: jest.fn((userColumn, userId) => ({
                      single: jest.fn(() => {
                        if (userColumn === 'user_id' && userId === MOCK_USER_ID) {
                          return Promise.resolve({ data: { id: MOCK_DOCUMENT_ID, extracted_text: MOCK_EXTRACTED_TEXT, class_section_id: MOCK_CLASS_SECTION_ID }, error: null });
                        }
                        return Promise.resolve({ data: null, error: { message: 'Unauthorized' } });
                      }),
                    })),
                  };
                }
                return { single: jest.fn(() => Promise.resolve({ data: null, error: null })) };
              }),
            })),
          };
        } else if (tableName === 'generated_content') {
          return {
            insert: mockGeneratedContentInsert,
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
          };
        }
        return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
      }),
    }));

    mockGeneratedContentInsert.mockClear(); // Clear calls for the persistent mock
    mockGenerateSummaryWithClaude.mockResolvedValue(MOCK_SUMMARY_CONTENT);
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      },
      from: jest.fn(),
    }));

    const reqBody = { type: 'summary', documentId: MOCK_DOCUMENT_ID };
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost/api/generate',
      json: jest.fn(() => Promise.resolve(reqBody)),
    };
    const req = mockRequest as unknown as NextRequest;
    
    const response = await POST(req);
    const text = await response.text();

    expect(response.status).toBe(401);
    expect(text).toBe('Unauthorized');
  });

  it('should return 400 if documentId is missing from request body', async () => {
    const reqBody = { type: 'summary' }; // Missing documentId
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost/api/generate',
      json: jest.fn(() => Promise.resolve(reqBody)),
    };
    const req = mockRequest as unknown as NextRequest;
    
    const response = await POST(req);
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toBe('Document ID is required');
  });

  it('should return 404 if study material is not found or unauthorized', async () => {
    mockSupabase.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: MOCK_USER_ID } } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Not found' } })),
                })),
              })),
            })),
          };
        } else if (tableName === 'generated_content') {
            return {
              insert: jest.fn(() => ({
                select: jest.fn(() => Promise.resolve({ data: [{ id: randomUUID(), content: { summary: MOCK_SUMMARY_CONTENT } }], error: null })),
              })),
            };
          }
        return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
      }),
    }));

    const reqBody = { type: 'summary', documentId: MOCK_DOCUMENT_ID };
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost/api/generate',
      json: jest.fn(() => Promise.resolve(reqBody)),
    };
    const req = mockRequest as unknown as NextRequest;
    
    const response = await POST(req);
    const text = await response.text();

    expect(response.status).toBe(404);
    expect(text).toBe('Document not found or access denied');
  });

  it('should successfully generate a summary and return it', async () => {
    const reqBody = { type: 'summary', documentId: MOCK_DOCUMENT_ID };
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost/api/generate',
      json: jest.fn(() => Promise.resolve(reqBody)),
    };
    const req = mockRequest as unknown as NextRequest;

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ content: { summary: MOCK_SUMMARY_CONTENT } });
    expect(mockGenerateSummaryWithClaude).toHaveBeenCalledWith(
      expect.stringContaining(MOCK_EXTRACTED_TEXT),
      expect.any(String)
    );
    expect(mockGeneratedContentInsert).toHaveBeenCalledWith([
      {
        user_id: MOCK_USER_ID,
        study_material_id: MOCK_DOCUMENT_ID,
        class_section_id: MOCK_CLASS_SECTION_ID,
        type: 'summary',
        content: { summary: MOCK_SUMMARY_CONTENT },
      },
    ]);
  });
  
  it('should return 400 if document content is too short for summarization', async () => {
    mockSupabase.mockImplementationOnce(() => ({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: MOCK_USER_ID } } }, error: null })),
      },
      from: jest.fn((tableName) => {
        if (tableName === 'study_materials') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn(() => ({
                  single: jest.fn(() => Promise.resolve({ data: { id: MOCK_DOCUMENT_ID, extracted_text: 'short text', class_section_id: MOCK_CLASS_SECTION_ID }, error: null })),
                })),
              })),
            })),
          };
        }
        return { select: jest.fn(() => Promise.resolve({ data: [], error: null })) };
      }),
    }));

    const reqBody = { type: 'summary', documentId: MOCK_DOCUMENT_ID };
    const mockRequest = {
      method: 'POST',
      url: 'http://localhost/api/generate',
      json: jest.fn(() => Promise.resolve(reqBody)),
    };
    const req = mockRequest as unknown as NextRequest;
    
    const response = await POST(req);
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toBe('Document content is too short for meaningful summarization.');
  });
});