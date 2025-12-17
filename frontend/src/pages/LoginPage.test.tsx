import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test-utils";
import LoginPage from "./LoginPage";
import axios from "axios";
import { mockAuthResponse } from "../test/mock-data";

vi.mock("axios");
const mockedAxios = axios as any;

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders login form with username and password fields", () => {
    render(<LoginPage />, { withRouter: true, withAuth: false });

    expect(screen.getByPlaceholderText(/username|email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it("renders login submit button", () => {
    render(<LoginPage />, { withRouter: true, withAuth: false });

    expect(
      screen.getByRole("button", { name: /login|sign in/i })
    ).toBeInTheDocument();
  });

  it("renders link to register page", () => {
    render(<LoginPage />, { withRouter: true, withAuth: false });

    expect(
      screen.getByText(/register|sign up|create account/i)
    ).toBeInTheDocument();
  });

  it("submits login form with credentials", async () => {
    mockedAxios.post.mockResolvedValue({ data: mockAuthResponse });

    render(<LoginPage />, { withRouter: true, withAuth: false });

    const usernameInput = screen.getByPlaceholderText(/username|email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login|sign in/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  it("displays error message on failed login", async () => {
    mockedAxios.post.mockRejectedValue({
      response: { data: { message: "Invalid credentials" } },
    });

    render(<LoginPage />, { withRouter: true, withAuth: false });

    const usernameInput = screen.getByPlaceholderText(/username|email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login|sign in/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "wrong" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/error|invalid|failed/i)).toBeInTheDocument();
    });
  });

  it("stores token on successful login", async () => {
    mockedAxios.post.mockResolvedValue({ data: mockAuthResponse });

    render(<LoginPage />, { withRouter: true, withAuth: false });

    const usernameInput = screen.getByPlaceholderText(/username|email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole("button", { name: /login|sign in/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeDefined();
    });
  });
});
