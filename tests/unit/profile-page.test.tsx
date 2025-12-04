// tests/unit/profile-page.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../../src/app/profile/page';

let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  fetchSpy = jest.spyOn(global, 'fetch');
  fetchSpy.mockClear(); // Clear any previous mock implementations
});

afterEach(() => {
  fetchSpy.mockRestore(); // Restore original fetch after each test
});

describe('ProfilePage', () => {
  const mockProfile = {
    id: 'user-id-123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
    },
  };

  const setupFetchMock = (mocks: Array<{ ok: boolean; json: () => Promise<any> }>) => {
    fetchSpy.mockImplementation((url: string, options?: RequestInit) => {
      const mockResponse = mocks.shift();
      if (!mockResponse) {
        console.error('Fetch called more times than mocked in test. URL:', url, 'Options:', options);
        return Promise.resolve({ ok: false, json: () => Promise.resolve({ message: 'Unexpected fetch call' }) });
      }
      return Promise.resolve(mockResponse);
    });
  };

  it('renders loading state initially', () => {
    // Simulate initial loading without immediately resolving fetch
    setupFetchMock([{ ok: true, json: () => new Promise(() => {}) }]); // Mock a pending fetch

    render(<ProfilePage />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders profile data after successful fetch', async () => {
    setupFetchMock([
      { ok: true, json: () => Promise.resolve(mockProfile) },
    ]);

    render(<ProfilePage />);

    await waitFor(() => {
      const emailLabel = screen.getByText('Email:', { selector: 'strong' });
      expect(emailLabel.parentElement).toHaveTextContent(`Email: ${mockProfile.email}`);
    });
    expect(screen.getByDisplayValue(mockProfile.user_metadata.full_name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Profile' })).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    setupFetchMock([
      { ok: false, json: () => Promise.resolve({ message: 'Network error occurred during fetch' }) },
    ]);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Error: Network error occurred during fetch')).toBeInTheDocument();
    });
  });

  it('updates profile successfully', async () => {
    setupFetchMock([
      { ok: true, json: () => Promise.resolve(mockProfile) }, // Initial fetch
      { ok: true, json: () => Promise.resolve({ message: 'Profile updated successfully!' }) }, // Update call
      { ok: true, json: () => Promise.resolve({ ...mockProfile, user_metadata: { full_name: 'New Name' } }) }, // Refetch after update
    ]);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProfile.user_metadata.full_name)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const fullNameInput = screen.getByLabelText('Full Name');
    const updateButton = screen.getByRole('button', { name: 'Update Profile' });

    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'New Name');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });

    // Verify that the fetch call for updating was made correctly
    expect(fetchSpy).toHaveBeenCalledWith('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: 'New Name' }),
    });

    // Optionally, verify that profile data is refreshed (depends on mock refetch)
    await waitFor(() => {
      expect(screen.getByDisplayValue('New Name')).toBeInTheDocument();
    });
  });

  it('displays error message on update failure', async () => {
    setupFetchMock([
      { ok: true, json: () => Promise.resolve(mockProfile) }, // Initial fetch
      { ok: false, json: () => Promise.resolve({ message: 'Failed to update profile' }) }, // Update call
    ]);

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProfile.user_metadata.full_name)).toBeInTheDocument();
    });

    const user = userEvent.setup();
    const fullNameInput = screen.getByLabelText('Full Name');
    const updateButton = screen.getByRole('button', { name: 'Update Profile' });

    await user.clear(fullNameInput);
    await user.type(fullNameInput, 'Invalid Name');
    await user.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to update profile')).toBeInTheDocument();
    });
  });
});
