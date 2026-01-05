import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MeasurementChartModal from './MeasurementChartModal';
import type { Measurement } from '../types';

// Mock Chart.js and react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
}));

describe('MeasurementChartModal', () => {
  const mockMeasurements: Measurement[] = [
    {
      id: 1,
      stationId: 1,
      pm25: 15.5,
      pm10: 25.3,
      temperature: 22.5,
      createdAt: '2024-01-01T10:00:00Z',
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
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnClose = vi.fn();
  });

  it('renders PM2.5 chart modal correctly', () => {
    render(
      <MeasurementChartModal
        measurements={mockMeasurements}
        dataType="pm25"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/PM2.5 Levels Over Time/i)).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders PM10 chart modal correctly', () => {
    render(
      <MeasurementChartModal
        measurements={mockMeasurements}
        dataType="pm10"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/PM10 Levels Over Time/i)).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('renders temperature chart modal correctly', () => {
    render(
      <MeasurementChartModal
        measurements={mockMeasurements}
        dataType="temperature"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Temperature Over Time/i)).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('shows message when no data is available', () => {
    render(
      <MeasurementChartModal
        measurements={[]}
        dataType="pm25"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/No PM2.5 \(µg\/m³\) data available/i)).toBeInTheDocument();
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementChartModal
        measurements={mockMeasurements}
        dataType="pm25"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    // Use aria-label to find the X button
    const closeButton = screen.getByRole('button', { name: /close chart/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    
    const { container } = render(
      <MeasurementChartModal
        measurements={mockMeasurements}
        dataType="pm25"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    const backdrop = container.firstChild as HTMLElement;
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close when clicking inside the modal', async () => {
    const user = userEvent.setup();
    
    render(
      <MeasurementChartModal
        measurements={mockMeasurements}
        dataType="pm25"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    // Click on the chart itself
    const chart = screen.getByTestId('line-chart');
    await user.click(chart);

    // onClose should not be called when clicking inside modal content
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('handles measurements with missing values', () => {
    const incompleteMeasurements: Measurement[] = [
      {
        id: 1,
        stationId: 1,
        pm25: 15.5,
        pm10: undefined,
        temperature: 22.5,
        createdAt: '2024-01-01T10:00:00Z',
      },
      {
        id: 2,
        stationId: 1,
        pm25: undefined,
        pm10: 28.1,
        temperature: undefined,
        createdAt: '2024-01-01T11:00:00Z',
      },
    ];

    render(
      <MeasurementChartModal
        measurements={incompleteMeasurements}
        dataType="pm25"
        stationName="Test Station"
        onClose={mockOnClose}
      />
    );

    // Should still render chart with available data
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
