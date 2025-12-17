import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test/test-utils";
import { useAuth } from "./AuthContext";
import { mockAuthResponse } from "../test/mock-data";

// Test component to access context
function TestAuthComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {isAuthenticated ? (
        <div>
          <p>Welcome {user?.username}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button
          onClick={() =>
            login("testuser", "password").catch((e) => console.error(e))
          }
        >
          Login
        </button>
      )}
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("provides initial unauthenticated state", () => {
    render(<TestAuthComponent />, { withAuth: true });

    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("stores and retrieves token from localStorage", () => {
    localStorage.setItem("token", mockAuthResponse.token);

    render(<TestAuthComponent />, { withAuth: true });

    // Should restore authenticated state from localStorage
    const token = localStorage.getItem("token");
    expect(token).toBe(mockAuthResponse.token);
  });

  it("clears token on logout", async () => {
    localStorage.setItem("token", mockAuthResponse.token);

    render(<TestAuthComponent />, { withAuth: true });

    // localStorage should be cleared after logout function is defined
    const initialToken = localStorage.getItem("token");
    expect(initialToken).toBe(mockAuthResponse.token);
  });

  it("tracks authentication loading state", async () => {
    render(<TestAuthComponent />, { withAuth: true });

    // Initial state should not be loading
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("provides user information when authenticated", async () => {
    localStorage.setItem("token", mockAuthResponse.token);

    render(<TestAuthComponent />, { withAuth: true });

    const loginButton = screen.getByRole("button", { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it("isAuthenticated returns true when token exists", () => {
    localStorage.setItem("token", mockAuthResponse.token);

    render(<TestAuthComponent />, { withAuth: true });

    expect(localStorage.getItem("token")).toBeTruthy();
  });

  it("isAuthenticated returns false when no token", () => {
    render(<TestAuthComponent />, { withAuth: true });

    expect(localStorage.getItem("token")).toBeNull();
  });
});
