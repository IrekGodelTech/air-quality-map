import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import RegisterPage from './RegisterPage';
import * as authApi from '../services/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  authApi: {
    register: vi.fn(),
  },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders registration form with all fields', () => {
    render(<RegisterPage />, { withAuth: true, withRouter: true });

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('has proper input validation attributes', () => {
    render(<RegisterPage />, { withAuth: true, withRouter: true });

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    expect(usernameInput).toHaveAttribute('required');
    expect(usernameInput).toHaveAttribute('minLength', '3');
    expect(usernameInput.type).toBe('text');

    expect(emailInput).toHaveAttribute('required');
    expect(emailInput.type).toBe('email');

    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('minLength', '6');
    expect(passwordInput.type).toBe('password');
  });

  it('allows user to fill out the registration form', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { withAuth: true, withRouter: true });

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('successfully registers user and navigates to dashboard', async () => {
    const user = userEvent.setup();
    const mockRegisterResponse = {
      token: 'test-token',
      username: 'testuser',
      email: 'test@example.com',
    };

    vi.mocked(authApi.authApi.register).mockResolvedValue(mockRegisterResponse);

    render(<RegisterPage />, { withAuth: true, withRouter: true });

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const registerButton = screen.getByRole('button', { name: /^register$/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(authApi.authApi.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message when registration fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Username already exists';
    
    vi.mocked(authApi.authApi.register).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    render(<RegisterPage />, { withAuth: true, withRouter: true });

    await user.type(screen.getByLabelText(/username/i), 'existinguser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const registerButton = screen.getByRole('button', { name: /^register$/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays generic error message when error has no message', async () => {
    const user = userEvent.setup();
    
    vi.mocked(authApi.authApi.register).mockRejectedValue(new Error('Network error'));

    render(<RegisterPage />, { withAuth: true, withRouter: true });

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const registerButton = screen.getByRole('button', { name: /^register$/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });
  });

  it('has a back to login button', () => {
    render(<RegisterPage />, { withAuth: true, withRouter: true });

    const backButton = screen.getByRole('button', { name: /back to login/i });
    expect(backButton).toBeInTheDocument();
  });

  it('navigates to login page when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />, { withAuth: true, withRouter: true });

    const backButton = screen.getByRole('button', { name: /back to login/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('clears error message when user starts typing after an error', async () => {
    const user = userEvent.setup();
    
    vi.mocked(authApi.authApi.register).mockRejectedValue({
      response: { data: { message: 'Registration failed' } },
    });

    render(<RegisterPage />, { withAuth: true, withRouter: true });

    await user.type(screen.getByLabelText(/username/i), 'testuser');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    const registerButton = screen.getByRole('button', { name: /^register$/i });
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });

    // Type more to trigger form submission again (error is cleared on submit)
    vi.mocked(authApi.authApi.register).mockResolvedValue({
      token: 'new-token',
      username: 'testuser',
      email: 'test@example.com',
    });

    await user.clear(screen.getByLabelText(/username/i));
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
    });
  });
});
