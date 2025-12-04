import { GET, PUT } from '@/app/api/profile/route'
import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest } from 'next/server'

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}))

const mockGetUser = jest.fn()
const mockFrom = jest.fn()
const mockSelect = jest.fn()
const mockEq = jest.fn()
const mockSingle = jest.fn()
const mockInsert = jest.fn()
const mockUpdate = jest.fn()

const supabaseMock = {
  auth: {
    getUser: mockGetUser,
  },
  from: mockFrom,
}

// Chain mock methods
mockFrom.mockReturnValue({ select: mockSelect })
mockSelect.mockReturnValue({ eq: mockEq })
mockEq.mockReturnValue({ single: mockSingle, update: mockUpdate, select: mockSelect })
mockUpdate.mockReturnValue({ eq: mockEq })
mockSingle.mockReturnValue({ data: { id: '123', full_name: 'Test User' }, error: null })
mockInsert.mockReturnValue({ select: mockSelect })


describe('/api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createRouteHandlerClient as jest.Mock).mockReturnValue(supabaseMock)
  })

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const response = await GET()
      expect(response.status).toBe(401)
    })

    it('should return profile if user is authenticated and profile exists', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } })
      const response = await GET()
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.profile.full_name).toBe('Test User')
    })

    it('should create and return profile if it does not exist', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } } })
        mockSingle.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } }) // First call fails
        mockSingle.mockResolvedValueOnce({ data: { id: '123', name: 'test@example.com' }, error: null }) // Second call succeeds
        const response = await GET()
        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.profile.full_name).toBe('test@example.com')
        expect(mockInsert).toHaveBeenCalledWith({ id: '123', full_name: 'test@example.com' })
    })
  })

  describe('PUT', () => {
    it('should return 401 if user is not authenticated', async () => {
        mockGetUser.mockResolvedValue({ data: { user: null } })
        const request = new NextRequest('http://localhost/api/profile', {
            method: 'PUT',
            body: JSON.stringify({ name: 'New Name' }),
        })
        const response = await PUT(request)
        expect(response.status).toBe(401)
    })

    it('should update and return profile if user is authenticated', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } })
        mockSingle.mockResolvedValue({ data: { id: '123', full_name: 'New Name' }, error: null })
        const request = new NextRequest('http://localhost/api/profile', {
            method: 'PUT',
            body: JSON.stringify({ full_name: 'New Name' }),
        })
        const response = await PUT(request)
        expect(response.status).toBe(200)
        const body = await response.json()
        expect(body.profile.full_name).toBe('New Name')
        expect(mockUpdate).toHaveBeenCalledWith({ full_name: 'New Name' })
    })
  })
})
