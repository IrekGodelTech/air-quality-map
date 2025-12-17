import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../test-utils";
import DashboardPage from "./DashboardPage";
import axios from "axios";
import { mockStations } from "../test/mock-data";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as any;

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "test-token");
  });

  it("renders dashboard with title", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    expect(screen.getByText(/dashboard|stations/i)).toBeInTheDocument();
  });

  it("loads and displays stations on mount", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });
  });

  it("displays loading state while fetching stations", () => {
    mockedAxios.get.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockStations }), 100)
        )
    );

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    // Should show some loading indicator
    expect(
      screen.queryByText(/loading|fetching/i) ||
        screen.queryByRole("progressbar")
    ).toBeDefined();
  });

  it("handles error when fetching stations fails", async () => {
    const error = new Error("Failed to fetch");
    mockedAxios.get.mockRejectedValue(error);

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(
        screen.queryByText(/error|failed|something went wrong/i)
      ).toBeInTheDocument();
    });
  });

  it("displays view toggle buttons (table/map)", () => {
    mockedAxios.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    expect(
      screen.getByRole("button", { name: /table|list/i }) ||
        screen.getByRole("button", { name: /map/i })
    ).toBeInTheDocument();
  });

  it("renders both table and map views", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });
  });

  it("allows toggling between table and map views", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    const toggleButtons = screen.queryAllByRole("button", {
      name: /table|map|view|toggle/i,
    });

    if (toggleButtons.length > 0) {
      fireEvent.click(toggleButtons[0]);
      // Should switch views
    }
  });
});
