import { POST } from './route';
import { createClient } from '@/lib/supabase/server';
import { generateQuizWithGemini } from '@/lib/gemini';
import { NextResponse } from 'next/server';

// Mock the uuid module
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}));

// Mock the supabase client and gemini functions
// Define mocks explicitly for better access for assertions
const mockInsertSelect = jest.fn(() => Promise.resolve({ data: [{ id: 'generated-content-id' }], error: null }));
const mockInsert = jest.fn(() => ({
  select: mockInsertSelect,
}));

const mockSelectEqEqSingle = jest.fn(() => Promise.resolve({ data: { extracted_text: 'This is a much longer sample text for quiz generation. It needs to be at least 100 characters long to pass the length check in the API route. This ensures that the quiz generation logic is properly tested without prematurely failing due to short content.', class_section_id: 'test-class-id' }, error: null }));
const mockSelectEqEq = jest.fn(() => ({
  single: mockSelectEqEqSingle,
}));
const mockSelectEq = jest.fn(() => ({
  eq: mockSelectEqEq,
}));
const mockSelect = jest.fn(() => ({
  eq: mockSelectEq,
}));


const mockFrom = jest.fn((tableName) => {
  if (tableName === 'study_materials') {
    return {
      select: mockSelect,
    };
  }
  if (tableName === 'generated_content') {
    return {
      insert: mockInsert,
    };
  }
  return {}; // Fallback for any unmocked tables
});

const mockGetSession = jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } } }));


jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: mockGetSession,
    },
    from: mockFrom,
  })),
}));

jest.mock('@/lib/gemini', () => ({
  generateSummaryWithGemini: jest.fn(),
  generateQuizWithGemini: jest.fn(),
  handleGeminiError: jest.fn((error, type, requestId) => {
    console.error(`Mocked handleGeminiError for ${type} (Request ID: ${requestId}):`, error);
    return new NextResponse(JSON.stringify({ error: 'Gemini API error' }), { status: 500 });
  }),
}));

// Mock next/server for NextResponse usage
jest.mock('next/server', () => {
  // Mock the NextResponse class itself
  class MockNextResponse extends Response {
    constructor(body: BodyInit | null | undefined, init?: ResponseInit) {
      super(body, init);
      // Custom properties can be added if needed, but 'super' handles most.
    }

    static json = jest.fn((data, init) => {
      const response = new MockNextResponse(JSON.stringify(data), {
        status: init?.status,
        headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      });
      // Override json method to return the data directly for test assertions
      response.json = () => Promise.resolve(data);
      return response;
    });
  }

  return {
    __esModule: true,
    NextResponse: MockNextResponse,
  };
});


describe('API Generate Route - Quiz Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-gemini-key';
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should generate a quiz with motivational feedback and explanations', async () => {
    const mockQuizResponse = {
      motivational_feedback: 'Great job!',
      quiz: [
        {
          question: 'What is 1+1?',
          options: ['1', '2', '3'],
          answer: '2',
          explanation: '1+1 equals 2.',
        },
      ],
      message: null, // Add this line
    };

    (generateQuizWithGemini as jest.Mock).mockResolvedValueOnce(
      '```json\n' + JSON.stringify(mockQuizResponse) + '\n```'
    );

    const mockRequest = {
      json: () => Promise.resolve({
        type: 'quiz',
        studyMaterialId: 'test-document-id',
        options: { quizLength: 'short' },
      }),
      url: 'http://localhost/api/generate',
      method: 'POST',
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseJson = await response.json();

    expect(response.status).toBe(200);
    expect(responseJson.content).toEqual(mockQuizResponse);
    expect(responseJson.message).toBeNull();
    expect(generateQuizWithGemini).toHaveBeenCalledTimes(1);
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'test-user-id',
        study_material_id: 'test-document-id',
        type: 'quiz',
        content: mockQuizResponse,
      }),
    ]);
  });

  it('should handle missing explanations in quiz questions', async () => {
    const mockQuizResponse = {
      motivational_feedback: 'Keep learning!',
      quiz: [
        {
          question: 'What is A?',
          options: ['A', 'B', 'C'],
          answer: 'A',
          explanation: '', // Missing explanation
        },
        {
          question: 'What is B?',
          options: ['A', 'B', 'C'],
          answer: 'B',
          // No explanation field
        },
      ],
    };

    (generateQuizWithGemini as jest.Mock).mockResolvedValueOnce(
      '```json\n' + JSON.stringify(mockQuizResponse) + '\n```'
    );

    const mockRequest = {
      json: () => Promise.resolve({
        type: 'quiz',
        studyMaterialId: 'test-document-id',
        options: { quizLength: 'short' },
      }),
      url: 'http://localhost/api/generate',
      method: 'POST',
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseJson = await response.json();

    expect(response.status).toBe(200);
    expect(responseJson.content.motivational_feedback).toEqual('Keep learning!');
    expect(responseJson.content.quiz[0].explanation).toEqual('Explanation not available.');
    expect(responseJson.content.quiz[1].explanation).toEqual('Explanation not available.');
  });

  it('should return 400 if quizLength option is invalid', async () => {
    const mockRequest = {
      json: () => Promise.resolve({
        type: 'quiz',
        studyMaterialId: 'test-document-id',
        options: { quizLength: 'invalid' },
      }),
      url: 'http://localhost/api/generate',
      method: 'POST',
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    expect(await response.text()).toEqual('Invalid or missing quizLength option');
  });

  it('should return 400 if document content is too short for quiz generation', async () => {
    // Mock Supabase to return a document with very short text
    (createClient as jest.Mock).mockReturnValueOnce({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } } })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { extracted_text: 'short', class_section_id: 'test-class-id' }, error: null })), // Very short text
            })),
          })),
        })),
        insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [{ id: 'generated-content-id' }], error: null })),
      })),
      })),
    });

    const mockRequest = {
      json: () => Promise.resolve({
        type: 'quiz',
        studyMaterialId: 'test-document-id',
        options: { quizLength: 'short' },
      }),
      url: 'http://localhost/api/generate',
      method: 'POST',
    } as unknown as Request;

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Document content is too short for meaningful quiz generation.' });
  });

  it('should adjust quiz length if document content is insufficient', async () => {
    // Mock Supabase to return a document with text content sufficient for medium but not long quiz
    (createClient as jest.Mock).mockReturnValueOnce({
      auth: {
        getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } } })),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: { extracted_text: 'a'.repeat(1000), class_section_id: 'test-class-id' }, error: null })), // Medium length text
            })),
          })),
        })),
        insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: [{ id: 'generated-content-id' }], error: null })),
      })),
      })),
    });

    const mockQuizResponse = {
      motivational_feedback: 'Adjusted length!',
      quiz: [
        {
          question: 'Medium quiz Q1',
          options: ['1', '2'],
          answer: '1',
          explanation: 'Explanation for Q1',
        },
      ],
    };

    (generateQuizWithGemini as jest.Mock).mockResolvedValueOnce(
      '```json\n' + JSON.stringify(mockQuizResponse) + '\n```'
    );

    const mockRequest = {
      json: () => Promise.resolve({
        type: 'quiz',
        studyMaterialId: 'test-document-id',
        options: { quizLength: 'long' }, // Requesting long quiz
      }),
      url: 'http://localhost/api/generate',
      method: 'POST',
    } as unknown as Request;

    const response = await POST(mockRequest);
    const responseJson = await response.json();

    expect(response.status).toBe(200);
    expect(responseJson.message).toContain('The document content is not sufficient for a long quiz. Generating a medium quiz instead.');
    // Verify that generateQuizWithGemini was called with a prompt for a medium quiz (or that the mock was handled as such)
    expect(generateQuizWithGemini).toHaveBeenCalledWith(
      expect.stringContaining('Generate a medium (6-8 questions)'), // The prompt should reflect the adjusted length
      expect.any(String)
    );
  });
});
