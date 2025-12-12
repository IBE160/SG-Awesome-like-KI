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
    process.env.CLAUDE_MODEL_NAME = 'claude-3-opus-20240229'; // Ensure Claude model name is set for tests
    // Default successful mocks for Claude
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockImplementation((params) => {
        const prompt = params.messages[0].content;
        if (prompt.includes('summary')) {
          return Promise.resolve({ content: [{ type: 'text', text: 'This is a summary.' }] });
        } else if (prompt.includes('quiz')) {
          return Promise.resolve({ content: [{ type: 'text', text: JSON.stringify({
            title: 'Mock Quiz',
            questions: [{ id: '1', question: 'Q1', options: ['A'], correctAnswer: 'A' }],
          }) }] });
        }
        return Promise.reject(new Error('Unexpected Claude API call'));
      });
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
              single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Some long text that is definitely more than one hundred characters long. This should allow the test to pass without triggering the short text error.' } }),
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
        messages: [{ role: 'user', content: 'Please provide a concise summary of the following text: Some long text that is definitely more than one hundred characters long. This should allow the test to pass without triggering the short text error.' }],
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
          single: jest.fn().mockResolvedValue({ data: { extracted_text: 'This is a much longer text that should easily exceed the 100 character limit for summarization. This will ensure that the short text error is not triggered and the Claude API error is properly tested.' } }),
        }),
      }),
    });
    const anthropicError = new Error('Claude summarization failed.') as any;
    anthropicError.status = 500;
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockRejectedValue(anthropicError);

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Claude API internal error: Claude summarization failed.'); // Changed to .text()
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
              single: jest.fn().mockResolvedValue({ data: { extracted_text: 'This is a much longer text that should easily exceed the 100 character limit for summarization. This will ensure that the short text error is not triggered and the Supabase insert failure is properly tested.' } }),
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

  it('should return 400 if document.extracted_text is null for summary type', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { extracted_text: null }, error: null }),
        }),
      }),
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'summary', documentId: '123' }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Document has no text content to summarize');
  });

  it('should return 400 if document.extracted_text is an empty string for quiz type', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { extracted_text: '' }, error: null }),
        }),
      }),
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'quiz', documentId: '123', options: { quizLength: 'short' } }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Document has no text content to summarize');
  });

  it('should return 400 if document.extracted_text is a very short string for quiz type', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { extracted_text: 'too short' }, error: null }),
        }),
      }),
    });

    const req = {
      json: jest.fn().mockResolvedValue({ type: 'quiz', documentId: '123', options: { quizLength: 'short' } }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Document content is too short for meaningful quiz generation.');
  });

  it('should adjust to "short" quiz when requesting "long" with very short content (< 500 chars)', async () => {
    const shortText = 'This is a short text for a quiz. It has less than 100 characters.'; // Should now trigger textLength < 100
    const mockQuiz = [{ question: 'Q1', options: ['A'], answer: 'A', explanation: 'Exp' }];
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: shortText } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [{ quiz: mockQuiz, message: "The document content is too short to generate a long quiz. Generating a short quiz instead." }], error: null }),
            }),
          };
        }
        return {};
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(mockQuiz) }] });

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'long' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Document content is too short for meaningful quiz generation.');
  });

  it('should adjust to "medium" quiz when requesting "long" with medium content (500-1500 chars)', async () => {
    const mediumText = 'This is a medium length text. It is long enough to be between 500 and 1500 characters. '.repeat(10); // ~700 chars
    const mockQuiz = [{ question: 'Q1', options: ['A'], answer: 'A', explanation: 'Exp' }];
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: mediumText } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [{ quiz: mockQuiz, message: "The document content is not sufficient for a long quiz. Generating a medium quiz instead." }], error: null }),
            }),
          };
        }
        return {};
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(mockQuiz) }] });

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'long' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([{ quiz: mockQuiz, message: "The document content is not sufficient for a long quiz. Generating a medium quiz instead." }]);
    expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: expect.stringContaining('Generate a medium multiple-choice quiz (6-8 questions) from the following text.') }],
      })
    );
  });

  it('should adjust to "short" quiz when requesting "medium" with very short content (< 500 chars)', async () => {
    const shortText = 'This is another short text for a quiz. Less than 100 characters.'; // Should now trigger textLength < 100
    const mockQuiz = [{ question: 'Q1', options: ['A'], answer: 'A', explanation: 'Exp' }];
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: shortText } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [{ quiz: mockQuiz, message: "The document content is too short to generate a medium quiz. Generating a short quiz instead." }], error: null }),
            }),
          };
        }
        return {};
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(mockQuiz) }] });

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'medium' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Document content is too short for meaningful quiz generation.');
  });

  it('should generate "short" quiz as requested with sufficient content', async () => {
    const longText = 'This is a very long text that can support any quiz length. '.repeat(100); // > 1500 chars
    const mockQuiz = [{ question: 'Q1', options: ['A'], answer: 'A', explanation: 'Exp' }];
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: longText } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [{ quiz: mockQuiz, message: null }], error: null }),
            }),
          };
        }
        return {};
      }),
    });
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
    const body = await response.json();
    expect(body).toEqual([{ quiz: mockQuiz, message: null }]);
    expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: expect.stringContaining('Generate a short multiple-choice quiz (3-5 questions) from the following text.') }],
      })
    );
  });

  it('should generate "medium" quiz as requested with sufficient content', async () => {
    const longText = 'This is a very long text that can support any quiz length. '.repeat(100); // > 1500 chars
    const mockQuiz = [{ question: 'Q1', options: ['A'], answer: 'A', explanation: 'Exp' }];
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: longText } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [{ quiz: mockQuiz, message: null }], error: null }),
            }),
          };
        }
        return {};
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(mockQuiz) }] });

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'medium' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([{ quiz: mockQuiz, message: null }]);
    expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: expect.stringContaining('Generate a medium multiple-choice quiz (6-8 questions) from the following text.') }],
      })
    );
  });


  it('should generate "medium" quiz as requested with sufficient content', async () => {
    const longText = 'This is a very long text that can support any quiz length. '.repeat(100); // > 1500 chars
    const mockQuiz = [{ question: 'Q1', options: ['A'], answer: 'A', explanation: 'Exp' }];
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: longText, class_section_id: 'class-1' } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [{ quiz: mockQuiz, message: null }], error: null }),
            }),
          };
        }
        return {};
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(mockQuiz) }] });

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'medium' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([{ quiz: mockQuiz, message: null }]);
    expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: expect.stringContaining('Generate a medium multiple-choice quiz (6-8 questions) from the following text.') }],
      })
    );
  });

  it('should generate "long" quiz as requested with sufficient content', async () => {
    const longText = 'This is a very long text that can support any quiz length. '.repeat(100); // > 1500 chars
    const mockQuiz = [{ question: 'Q1', options: ['A'], answer: 'A', explanation: 'Exp' }];
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'study_materials') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({ data: { extracted_text: longText, class_section_id: 'class-1' } }),
            }),
          };
        }
        if (table === 'generated_content') {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({ data: [{ quiz: mockQuiz, message: null }], error: null }),
            }),
          };
        }
        return {};
      }),
    });
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockResolvedValueOnce({ content: [{ type: 'text', text: JSON.stringify(mockQuiz) }] });

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'long' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([{ quiz: mockQuiz, message: null }]);
    expect(mockAnthropic.prototype.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: expect.stringContaining('Generate a long multiple-choice quiz (9-12 questions) from the following text.') }],
      })
    );
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
              single: jest.fn().mockResolvedValue({ data: { extracted_text: 'This is a very long text that can support any quiz length. It is definitely more than one hundred characters long.', class_section_id: 'class-1' } }),
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
    const anthropicError = new Error('Claude quiz generation failed.') as any;
    anthropicError.status = 500;
    (mockAnthropic.prototype.messages.create as jest.Mock)
      .mockRejectedValue(anthropicError);

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

  it('should handle Claude API 401 Unauthorized error correctly', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Some text for quiz', class_section_id: 'class-1' } }),
        }),
      }),
    });

    const anthropicError = new Error('Invalid API Key') as any;
    anthropicError.status = 401;
    (mockAnthropic.prototype.messages.create as jest.Mock).mockRejectedValue(anthropicError);

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'short' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Authentication/Authorization error with Claude API. Please check your API key.');
  });

  it('should handle Claude API 429 Rate Limit Exceeded error correctly', async () => {
    mockSupabase.mockReturnValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'user-1' } } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { extracted_text: 'Some text for quiz', class_section_id: 'class-1' } }),
        }),
      }),
    });

    const anthropicError = new Error('Rate limit exceeded') as any;
    anthropicError.status = 429;
    (mockAnthropic.prototype.messages.create as jest.Mock).mockRejectedValue(anthropicError);

    const req = {
      json: jest.fn().mockResolvedValue({
        type: 'quiz',
        documentId: '123',
        options: { quizLength: 'short' },
      }),
    } as any;

    const response = await POST(req);
    expect(response.status).toBe(429);
    expect(await response.text()).toBe('Claude API rate limit exceeded. Please try again shortly.');
  });
});