import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from '@/app/profile/page'
import '@testing-library/jest-dom'
import { act } from 'react-dom/test-utils'; // Import act

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ data: { user: { id: '123', email: 'test@example.com' } }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: '123', full_name: 'Test User' }, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: { id: '123', full_name: 'New Name' }, error: null })),
        })),
      })),
    })),
  })),
}));

// Mock fetch
global.fetch = jest.fn()

describe('ProfilePage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    jest.clearAllMocks(); // Clear mocks for Supabase client as well
  });

  it('shows loading state initially', async () => {
    // Mock the Supabase getUser to be pending for loading state
    require('@/lib/supabase/client').createClient().auth.getUser.mockReturnValueOnce(new Promise(() => {}));
    act(() => {
      render(<ProfilePage />);
    });
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('fetches and displays profile information', async () => {
    act(() => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    });
  });

  it('updates profile and shows success message', async () => {
    act(() => {
        render(<ProfilePage />);
    });

    await waitFor(() => {
        expect(screen.getByLabelText('Full Name')).toHaveValue('Test User');
    });

    act(() => {
        fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'New Name' } });
        fireEvent.click(screen.getByRole('button', { name: 'Update Profile' }));
    });

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toHaveValue('New Name');
    });
  });
});
