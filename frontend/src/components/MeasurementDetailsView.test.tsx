import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeasurementDetailsView from './MeasurementDetailsView';
import type { Station, Measurement } from '../types';

// Mock the MeasurementChartModal component
vi.mock('./MeasurementChartModal', () => ({
  default: ({ dataType, stationName, onClose }: { dataType: string; stationName: string; onClose: () => void }) => (
    <div data-testid="chart-modal">
      <p>Chart for {dataType}</p>
      <p>Station: {stationName}</p>
      <button onClick={onClose}>Close Chart</button>
    </div>
  ),
}));

// Mock formatDateTime utility
vi.mock('../utils/dateUtils', () => ({
  formatDateTime: (date: string) => `Formatted: ${date}`,
}));

describe('MeasurementDetailsView', () => {
  const mockStation: Station = {
    id: 1,
    name: 'Test Station',
    description: 'Test Description',
    latitude: 40.7128,
    longitude: -74.006,
    measurementEndpoint: 'https://api.example.com',
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockMeasurements: Measurement[] = [
    {
      id: 1,
      stationId: 1,
      pm25: 15.5,
      pm10: 25.3,
      temperature: 22.5,
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 2,
      stationId: 1,
      pm25: 18.2,
      pm10: 28.1,
      temperature: 23.1,
      createdAt: '2024-01-01T11:00:00Z',
    },
    {
      id: 3,
      stationId: 1,
      pm25: 12.8,
      pm10: 22.5,
      temperature: 21.8,
      createdAt: '2024-01-01T10:00:00Z',
    },
  ];

  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  it('renders modal with station name', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/test station - measurements/i)).toBeInTheDocument();
  });

  it('displays station coordinates', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/40.7128, -74.0060/i)).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /✕/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: /✕/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    
    const { container } = render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const backdrop = container.firstChild as HTMLElement;
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking modal content', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const modalContent = screen.getByText(/test station - measurements/i);
    await user.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays all three chart buttons', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByRole('button', { name: /view pm2.5 chart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view pm10 chart/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view temperature chart/i })).toBeInTheDocument();
  });

  it('renders measurements table with headers', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    // Look for table headers specifically
    const table = screen.getByRole('table');
    const headers = table.querySelectorAll('thead th');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    
    expect(headerTexts).toContain('Date & Time');
    expect(headerTexts).toContain('PM2.5');
    expect(headerTexts).toContain('PM10');
    expect(headerTexts).toContain('Temperature');
  });

  it('displays measurements sorted by newest first', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const rows = screen.getAllByRole('row');
    // First data row should be the newest measurement (id: 1)
    expect(rows[1]).toHaveTextContent('15.50 µg/m³');
  });

  it('formats PM2.5 values correctly', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('15.50 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('18.20 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('12.80 µg/m³')).toBeInTheDocument();
  });

  it('formats PM10 values correctly', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('25.30 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('28.10 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('22.50 µg/m³')).toBeInTheDocument();
  });

  it('formats temperature values correctly', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('22.5°C')).toBeInTheDocument();
    expect(screen.getByText('23.1°C')).toBeInTheDocument();
    expect(screen.getByText('21.8°C')).toBeInTheDocument();
  });

  it('displays dash for missing PM2.5 values', () => {
    const measurementsWithMissing: Measurement[] = [
      {
        id: 1,
        stationId: 1,
        pm25: undefined as unknown as number,
        pm10: 25.3,
        temperature: 22.5,
        createdAt: '2024-01-01T12:00:00Z',
      },
    ];

    const { container } = render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={measurementsWithMissing}
        onClose={mockOnClose}
      />
    );

    // Find the PM2.5 cell (second column in the data row)
    const rows = container.querySelectorAll('tbody tr');
    const pm25Cell = rows[0].querySelectorAll('td')[1];
    expect(pm25Cell).toHaveTextContent('-');
  });

  it('shows message when no measurements are available', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={[]}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/no measurements available for this station/i)).toBeInTheDocument();
  });

  it('does not show table when no measurements', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={[]}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('does not show chart buttons when no measurements', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={[]}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByRole('button', { name: /view pm2.5 chart/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /view pm10 chart/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /view temperature chart/i })).not.toBeInTheDocument();
  });

  it('opens PM2.5 chart modal when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const pm25Button = screen.getByRole('button', { name: /view pm2.5 chart/i });
    await user.click(pm25Button);

    expect(screen.getByTestId('chart-modal')).toBeInTheDocument();
    expect(screen.getByText('Chart for pm25')).toBeInTheDocument();
  });

  it('opens PM10 chart modal when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const pm10Button = screen.getByRole('button', { name: /view pm10 chart/i });
    await user.click(pm10Button);

    expect(screen.getByTestId('chart-modal')).toBeInTheDocument();
    expect(screen.getByText('Chart for pm10')).toBeInTheDocument();
  });

  it('opens temperature chart modal when button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const tempButton = screen.getByRole('button', { name: /view temperature chart/i });
    await user.click(tempButton);

    expect(screen.getByTestId('chart-modal')).toBeInTheDocument();
    expect(screen.getByText('Chart for temperature')).toBeInTheDocument();
  });

  it('closes chart modal when close is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    // Open chart
    const pm25Button = screen.getByRole('button', { name: /view pm2.5 chart/i });
    await user.click(pm25Button);

    expect(screen.getByTestId('chart-modal')).toBeInTheDocument();

    // Close chart
    const closeChartButton = screen.getByRole('button', { name: /close chart/i });
    await user.click(closeChartButton);

    expect(screen.queryByTestId('chart-modal')).not.toBeInTheDocument();
  });

  it('uses formatDateTime for displaying timestamps', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Formatted: 2024-01-01T12:00:00Z/i)).toBeInTheDocument();
  });

  it('handles measurements with all data types', () => {
    render(
      <MeasurementDetailsView
        station={mockStation}
        measurements={mockMeasurements}
        onClose={mockOnClose}
      />
    );

    const rows = screen.getAllByRole('row');
    // Should have header + 3 data rows
    expect(rows).toHaveLength(4);
  });
});
