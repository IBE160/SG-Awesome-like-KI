// tests/unit/ClassManagementUI.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ClassManagementUI } from '@/components/ClassManagementUI';

// Mock global fetch
global.fetch = jest.fn();

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('ClassManagementUI', () => {
  const mockFetch = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and fetches classes on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    expect(screen.getByText('Loading classes...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Manage Classes')).toBeInTheDocument();
      expect(screen.getByText('Existing Class')).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/classes');
  });

  it('allows creating a new class', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    await waitFor(() => expect(screen.getByText('Manage Classes')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('New class name'), { target: { value: 'New Class' } });
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ class: { id: '2', name: 'New Class', user_id: 'user-1' } }),
    });

    fireEvent.click(screen.getByText('Create Class'));

    await waitFor(() => {
      expect(screen.getByText('New Class')).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/classes', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'New Class' }),
    }));
    expect(screen.getByPlaceholderText('New class name')).toHaveValue('');
  });

  it('displays an error if class creation fails due to existing name', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    await waitFor(() => expect(screen.getByText('Manage Classes')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('New class name'), { target: { value: 'Existing Class' } });
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'A class with this name already exists. Please choose a different name.' }),
      status: 409,
    });

    fireEvent.click(screen.getByText('Create Class'));

    await waitFor(() => {
      expect(screen.getByText('A class with this name already exists. Please choose a different name.')).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/classes', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Existing Class' }),
    }));
  });

  it('allows renaming a class', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    await waitFor(() => expect(screen.getByText('Existing Class')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));

    const renameInput = screen.getByDisplayValue('Existing Class');
    fireEvent.change(renameInput, { target: { value: 'Updated Class' } });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ class: { id: '1', name: 'Updated Class', user_id: 'user-1' } }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Updated Class')).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/classes/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Class' }),
    }));
  });

  it('displays an error if class renaming fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    await waitFor(() => expect(screen.getByText('Existing Class')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));

    const renameInput = screen.getByDisplayValue('Existing Class');
    fireEvent.change(renameInput, { target: { value: 'Invalid Name!' } });

    // Client-side validation will now trigger. Server API call should not be made.
    // The error message from client-side is "Class name must be alphanumeric."
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Class name must be alphanumeric.')).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalledWith('/api/classes/1', expect.anything()); // API call should not be made
  });

  it('allows deleting a class with confirmation', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    await waitFor(() => expect(screen.getByText('Existing Class')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete the class "Existing Class"? All associated content will be deleted.')).toBeInTheDocument();

    mockFetch.mockResolvedValueOnce({ ok: true, status: 204 });

    // Use within to get the delete button inside the dialog
    const dialog = screen.getByRole('dialog', { name: 'Confirm Deletion' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(screen.queryByText('Existing Class')).not.toBeInTheDocument();
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/classes/1', { method: 'DELETE' });
  });

  it('validates new class name for alphanumeric characters on client-side', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    await waitFor(() => expect(screen.getByText('Manage Classes')).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText('New class name'), { target: { value: 'Invalid Name!' } });
    fireEvent.click(screen.getByText('Create Class'));

    await waitFor(() => {
      expect(screen.getByText('Class name must be alphanumeric.')).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalledWith('/api/classes', expect.anything()); // API call should not be made
  });

  it('validates renamed class name for alphanumeric characters on client-side', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ classes: [{ id: '1', name: 'Existing Class', user_id: 'user-1' }] }),
    });
    render(<ClassManagementUI />);
    await waitFor(() => expect(screen.getByText('Existing Class')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    const renameInput = screen.getByDisplayValue('Existing Class');
    fireEvent.change(renameInput, { target: { value: 'Name With #!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Class name must be alphanumeric.')).toBeInTheDocument();
    });
    expect(mockFetch).not.toHaveBeenCalledWith('/api/classes/1', expect.anything()); // API call should not be made
  });

});