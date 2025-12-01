import { render, screen, fireEvent } from '@testing-library/react';
import RegisterPage from 'app/register/page';
import '@testing-library/jest-dom';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('RegisterPage - Client-side Validation', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should show an error for invalid password format', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short' } }); // Invalid password
    fireEvent.click(registerButton);

    const errorMessage = await screen.findByText(/Password must contain at least 5 letters, 1 number, and 1 special symbol./i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled(); // Ensure API is not called on client-side validation failure
  });

  it('should show an error if email is missing', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: '' } }); // Missing email
    fireEvent.change(passwordInput, { target: { value: 'ValidP@ss1' } });
    fireEvent.click(registerButton);

    const errorMessage = await screen.findByText(/Email and password are required./i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled(); // Ensure API is not called on client-side validation failure
  });

  it('should show an error if password is missing', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '' } }); // Missing password
    fireEvent.click(registerButton);

    const errorMessage = await screen.findByText(/Email and password are required./i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled(); // Ensure API is not called on client-side validation failure
  });

  it('should call the API and show success message for a valid registration', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Registration successful!' }),
    } as Response);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidP@ss1' } }); // Valid password
    fireEvent.click(registerButton);

    // Ensure fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'ValidP@ss1' }),
      })
    );

    // Wait for the success message to appear
    const successMessage = await screen.findByText(/Registration successful!/i);
    expect(successMessage).toBeInTheDocument();
  });

  it('should show an error message if API call fails', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Email already in use.' }),
    } as Response);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'ValidP@ss1' } });
    fireEvent.click(registerButton);

    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/Email already in use./i);
    expect(errorMessage).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should allow registration with a valid password containing 5 letters not in a row', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Registration successful!' }),
    } as Response);

    render(<RegisterPage />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'test2@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'V1a2l3i4d!P' } }); // 5 letters, 4 numbers, 1 symbol
    
    fireEvent.click(registerButton);

    // Ensure fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test2@example.com', password: 'V1a2l3i4d!P' }),
      })
    );

    // Wait for the success message to appear
    const successMessage = await screen.findByText(/Registration successful!/i);
    expect(successMessage).toBeInTheDocument();
  });
});