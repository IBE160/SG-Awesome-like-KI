import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfilePage from '@/app/profile/page'
import '@testing-library/jest-dom'

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

  it('shows loading state initially', () => {
    render(<ProfilePage />)
    expect(screen.getByText('Loading profile...')).toBeInTheDocument()
  })

  it('fetches and displays profile information', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'Test User' }),
    })
    render(<ProfilePage />)
    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toHaveValue('Test User')
    })
  })

  it('updates profile and shows success message', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'Test User' }),
    })
    render(<ProfilePage />)

    await waitFor(() => {
        expect(screen.getByLabelText('Name')).toHaveValue('Test User')
    });

    (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ name: 'New Name' }),
    })

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Name' } })
    fireEvent.click(screen.getByRole('button', { name: 'Update Profile' }))

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument()
      expect(screen.getByLabelText('Name')).toHaveValue('New Name')
    })
  })
})
