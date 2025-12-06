import { POST } from '@/src/app/api/auth/reset-password/confirm/route';
import { createRouteHandlerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Mock the Supabase client
jest.mock('@supabase/ssr', () => ({
  createRouteHandlerClient: jest.fn(),
}));

// Mock next/headers for cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockUpdateUser = jest.fn();
const mockGetSession = jest.fn();

(createRouteHandlerClient as jest.Mock).mockReturnValue({
  auth: {
    updateUser: mockUpdateUser,
    getSession: mockGetSession,
  },
});

const createMockRequest = (formData: FormData) => {
  return {
    formData: async () => formData,
    url: 'http://localhost/api/auth/reset-password/confirm',
  } as unknown as Request;
};

describe('POST /api/auth/reset-password/confirm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with a success message for a valid password', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: '123' } } } });
    mockUpdateUser.mockResolvedValueOnce({ error: null });

    const formData = new FormData();
    formData.append('password', 'ValidPassword1!');

    const request = createMockRequest(formData);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Your password has been reset successfully.');
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'ValidPassword1!' });
  });

  it('should return 401 if there is no session', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    const formData = new FormData();
    formData.append('password', 'ValidPassword1!');

    const request = createMockRequest(formData);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });


  it('should return 400 if Supabase returns an error', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: { user: { id: '123' } } } });
    mockUpdateUser.mockResolvedValueOnce({ error: { message: 'Failed to update password' } });

    const formData = new FormData();
    formData.append('password', 'ValidPassword1!');

    const request = createMockRequest(formData);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Failed to update password');
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'ValidPassword1!' });
  });
});
