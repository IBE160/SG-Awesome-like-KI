import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Profile from './page'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock fetch
global.fetch = jest.fn()

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
}

describe('Profile Page', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
  })

  it('should display user profile information when authenticated', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUser),
    })

    render(<Profile />)

    await waitFor(() => {
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
      expect(
        screen.getByDisplayValue(mockUser.user_metadata.full_name)
      ).toBeInTheDocument()
    })
  })

  it('should update user name successfully', async () => {
    ;(fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Profile updated successfully!' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockUser,
            user_metadata: { full_name: 'Updated Name' },
          }),
      })

    render(<Profile />)

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(mockUser.user_metadata.full_name)
      ).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue(mockUser.user_metadata.full_name)
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
        ok: true,
        json: () => Promise.resolve(mockUser),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage }),
      })

    render(<Profile />)

    await waitFor(() => {
      expect(
        screen.getByDisplayValue(mockUser.user_metadata.full_name)
      ).toBeInTheDocument()
    })

    const nameInput = screen.getByDisplayValue(mockUser.user_metadata.full_name)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'New Name')

    const updateButton = screen.getByRole('button', { name: /Update Profile/i })
    await userEvent.click(updateButton)

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument()
    })
  })
})

