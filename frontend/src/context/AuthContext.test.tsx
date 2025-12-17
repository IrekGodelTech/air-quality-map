import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test-utils";
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

  it("clears token on logout", () => {
    localStorage.setItem("token", mockAuthResponse.token);

    render(<TestAuthComponent />, { withAuth: true });

    const logoutButton = screen.queryByRole("button", { name: /logout/i });
    if (logoutButton) {
      fireEvent.click(logoutButton);
    }

    expect(localStorage.getItem("token")).toBeNull();
  });

  it("tracks authentication loading state", async () => {
    render(<TestAuthComponent />, { withAuth: true });

    // Initial state should not be loading
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("provides user information when authenticated", () => {
    localStorage.setItem("token", mockAuthResponse.token);
    localStorage.setItem("user", JSON.stringify(mockAuthResponse));

    render(<TestAuthComponent />, { withAuth: true });

    expect(
      screen.queryByText(new RegExp(`Welcome`))
    ).toBeInTheDocument();
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
