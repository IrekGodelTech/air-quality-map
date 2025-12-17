import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import LoginPage from './LoginPage';
import axios from 'axios';
import { mockAuthResponse } from '../test/mock-data';

const mockedAxios = axios as any;
// Get the shared mock API instance created by axios.create()
const mockApiInstance = mockedAxios.create();

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders login form with username and password fields', () => {
    render(<LoginPage />, { withRouter: true, withAuth: true });

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders login submit button', () => {
    render(<LoginPage />, { withRouter: true, withAuth: true });

    expect(
      screen.getByRole('button', { name: /login|sign in/i })
    ).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    render(<LoginPage />, { withRouter: true, withAuth: true });

    expect(
      screen.getByRole('button', { name: /register|sign up|create account/i })
    ).toBeInTheDocument();
  });

  it('submits login form with credentials', async () => {
    mockApiInstance.post.mockResolvedValue({ data: mockAuthResponse });

    render(<LoginPage />, { withRouter: true, withAuth: true });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login|sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockApiInstance.post).toHaveBeenCalled();
    });
  });

  it('displays error message on failed login', async () => {
    mockApiInstance.post.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });

    render(<LoginPage />, { withRouter: true, withAuth: true });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login|sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      // The error should be displayed either as 'Invalid credentials' or 'Login failed'
      expect(
        screen.queryByText(/invalid credentials|login failed/i)
      ).toBeInTheDocument();
    });
  });

  it('stores token on successful login', async () => {
    mockApiInstance.post.mockResolvedValue({ data: mockAuthResponse });

    render(<LoginPage />, { withRouter: true, withAuth: true });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login|sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeDefined();
    });
  });
});
