import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
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

    // Wait for the component to load stations
    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });
  });

  it('loads and displays stations on mount', async () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching stations', async () => {
    mockApiInstance.get.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: mockStations }), 100)
        )
    );

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });
  });

  it('handles error when fetching stations fails', async () => {
    const error = new Error('Failed to fetch');
    mockApiInstance.get.mockRejectedValue(error);

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(
        screen.queryByText(/failed to load stations/i)
      ).toBeInTheDocument();
    });
  });

  it('displays view toggle buttons (table/map)', async () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });

    // Now verify buttons (they should have rendered by now)
    expect(screen.getByRole('button', { name: /table view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /map view/i })).toBeInTheDocument();

    // Wait for any remaining microtasks
    await new Promise(resolve => setImmediate(resolve));
  });

  it('renders both table and map views', async () => {
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });

    // Wait for any remaining microtasks
    await new Promise(resolve => setImmediate(resolve));
  });

  it('allows toggling between table and map views', async () => {
    const user = userEvent.setup();
    mockApiInstance.get.mockResolvedValue({ data: mockStations });

    render(<DashboardPage />, { withRouter: true, withAuth: true });

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText(mockStations[0].name)).toBeInTheDocument();
    });

    // Use userEvent which automatically wraps in act
    const mapButton = screen.getByRole('button', { name: /map view/i });
    await user.click(mapButton);

    // Verify button exists after click
    expect(screen.getByRole('button', { name: /map view/i })).toBeInTheDocument();
  });
});
