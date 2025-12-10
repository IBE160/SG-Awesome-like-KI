import { POST } from '@/app/api/generate/route';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import Anthropic from '@anthropic-ai/sdk'; // Import Anthropic

jest.mock('@/lib/supabase/server');
jest.mock('next/headers');
jest.mock('@anthropic-ai/sdk'); // Mock the Anthropic SDK

const mockSupabase = createClient as jest.Mock;
const mockCookies = cookies as jest.Mock;
const mockAnthropic = Anthropic as jest.Mocked<typeof Anthropic>;

// Mock the messages.create method
mockAnthropic.prototype.messages = {
  create: jest.fn(),
} as any;


describe('POST /api/generate', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockCookies.mockReturnValue({ get: jest.fn() });
    process.env.ANTHROPIC_API_KEY = 'test-api-key'; // Ensure API key is set for tests
    // Default successful mocks for Claude
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ text: 'This is a summary.' }] }) // For summary
      .mockResolvedValueOnce({ content: [{ text: JSON.stringify({
        title: 'Mock Quiz',
        questions: [{ id: '1', question: 'Q1', options: ['A'], correctAnswer: 'A' }],
      }) }] }); // For quiz
  });

  afterEach(() => {
    delete process.env.ANTHROPIC_API_KEY; // Clean up
  });

  it('should return 401 if user is not authenticated', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized'); // Changed to .text()
  });

  it('should return 404 if document is not found', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }), // Added error message to match route.ts
        }),
      }),
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Document not found or access denied'); // Changed to .text()
  });

  it('should return 200 and data on success', async () => {
    const mockSummary = { summary: 'This is a summary.' };
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Some text' } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [mockSummary], error: null }),
            }),
          };
        };
        return {};
      }),
    });

    // Mock for summary generation
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'This is a summary.' }] });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json(); // This expects JSON
    expect(body).toEqual([mockSummary]);
    expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: 'Please provide a concise summary of the following text: Some text' }],
      })
    );
  });

  it('should return 500 if Claude API throws an error during summary generation', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Short text' } }),
        }),
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockRejectedValue(new Error('Claude summarization failed.'));

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('AI summary generation failed: Claude summarization failed.'); // Changed to .text()
  });

  it('should return 500 if Supabase insert for generated content fails', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Some text' } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Insert Error' } }),
            }),
          };
        }
        return {};
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: 'This is a summary.' }] });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error'); // Changed to .text()
  });

  it('should return 500 for a generic unexpected error', async () => {
    // Simulate an error in the initial document retrieval
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockImplementation(() => { // Mock 'from' to throw an error
        throw new Error('Unexpected DB connection error');
      }),
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error'); // Changed to .text()
  });

  it('should return 400 if type is neither summary nor quiz', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn(() => ({})), // Mock 'from' to return an empty object, preventing TypeError
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'invalid', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid type'); // Changed to .text()
  });

  it('should return 200 and quiz data on successful quiz generation', async () => {
    const mockQuiz = {
      title: 'Test Quiz',
      questions: [
        { id: '1', question: 'Test Q', options: ['A', 'B'], correctAnswer: 'A' },
      ],
    };
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Some text for quiz' } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [mockQuiz], error: null }),
            }),
          };
        }
        return {};
      }),
    });
    // Mock for quiz generation
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(mockQuiz) }] });

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'short' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json(); // This expects JSON
    expect(body).toEqual([mockQuiz]);
    expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-3-opus-20240229',
        messages: [{ role: 'user', content: expect.stringContaining('Generate a short multiple-choice quiz (3-5 questions) from the following text.') }],
      })
    );
  });

  it('should return 400 if quizLength is missing for quiz type', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => { // Added mock for 'from'
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Some text' }, error: null }),
            }),
          };
        }
        return {}; // Default return for other tables
      }),
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'quiz', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid or missing quizLength option'); // Changed to .text()
  });

  it('should return 500 if Claude API throws an error during quiz generation', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Short text for quiz' } }),
        }),
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockRejectedValue(new Error('Claude quiz generation failed.'));

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'short' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('AI quiz generation failed: Claude quiz generation failed.'); // Changed to .text()
  });
});