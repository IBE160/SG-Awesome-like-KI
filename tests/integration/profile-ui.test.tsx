import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock fetch
global.fetch = jest.fn()

describe('ProfilePage', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('fetches and displays profile information', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        }),
    })

    await act(async () => {
      render(<ProfilePage />)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toHaveValue('Test User')
    })
  })

  it('updates profile and shows success message', async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            message: 'Profile updated successfully!',
            user: {
              email: 'test@example.com',
              user_metadata: { full_name: 'New Name' },
            },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            email: 'test@example.com',
            user_metadata: { full_name: 'New Name' },
          }),
      })

    await act(async () => {
      render(<ProfilePage />)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Full Name')).toHaveValue('Test User')
    })

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'New Name' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Update Profile' }))
    })

    await waitFor(() => {
      expect(
        screen.getByText('Profile updated successfully!')
      ).toBeInTheDocument()
      expect(screen.getByLabelText('Full Name')).toHaveValue('New Name')
    })
  })
})

