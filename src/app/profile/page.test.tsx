import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfileClientPage from './ProfileClientPage'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock fetch
global.fetch = jest.fn()

const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  full_name: 'Test User',
}

describe('Profile Page', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
  })

  it('should display user profile information when authenticated', async () => {
    render(<ProfileClientPage initialProfile={mockProfile} />)

    await waitFor(() => {
      expect(screen.getByText(mockProfile.email)).toBeInTheDocument()
      expect(
        screen.getByDisplayValue(mockProfile.full_name)
      ).toBeInTheDocument()
    })
  })

  it('should update user name successfully', async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Profile updated successfully!' }),
      })
    render(<ProfileClientPage initialProfile={mockProfile} />)

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(mockProfile.full_name)
      ).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue(mockProfile.full_name)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Updated Name')

    const updateButton = screen.getByRole('button', { name: /Update Profile/i })
    await userEvent.click(updateButton)

    await waitFor(() => {
      expect(
        screen.getByText('Profile updated successfully!')
      ).toBeInTheDocument()
    })
  })

  it('should display an error message on update failure', async () => {
    const errorMessage = 'Network error'
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      })

    render(<ProfileClientPage initialProfile={mockProfile} />)

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(mockProfile.full_name)
      ).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue(mockProfile.full_name)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'New Name')

    const updateButton = screen.getByRole('button', { name: /Update Profile/i })
    await userEvent.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    })
  })
})

