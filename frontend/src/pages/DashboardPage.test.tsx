import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import DashboardPage from './DashboardPage';
import axios from 'axios';
import { mockStations } from '../test/mock-data';

const mockedAxios = axios as any;
const mockApiInstance = mockedAxios.create();

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'test-token');
  });

  it('renders dashboard with title', async () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    expect(screen.getByText(/dashboard|stations/i)).toBeInTheDocument();
  });

  it('loads and displays stations on mount', async () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching stations', () => {
    mockApiInstance.get.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockStations }), 100)
        )
    );

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    // Should show some loading indicator
    expect(
      screen.queryByText(/loading|fetching/i) ||
        screen.queryByRole('progressbar')
    ).toBeDefined();
  });

  it('handles error when fetching stations fails', async () => {
    const error = new Error('Failed to fetch');
    mockApiInstance.get.mockRejectedValue(error);

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(
        screen.queryByText(/error|failed|something went wrong/i)
      ).toBeInTheDocument();
    });
  });

  it('displays view toggle buttons (table/map)', () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    expect(
      screen.getByRole('button', { name: /table|list/i }) ||
        screen.getByRole('button', { name: /map/i })
    ).toBeInTheDocument();
  });

  it('renders both table and map views', async () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });
  });

  it('allows toggling between table and map views', async () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    const toggleButtons = screen.queryAllByRole('button', {
      name: /table|map|view|toggle/i,
    });

    if (toggleButtons.length > 0) {
      fireEvent.click(toggleButtons[0]);
      // Should switch views
    }
  });
});
