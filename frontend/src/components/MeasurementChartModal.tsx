import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Measurement } from '../types';
import { formatDateTime } from '../utils/dateUtils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MeasurementChartModalProps {
  measurements: Measurement[];
  dataType: 'pm25' | 'pm10' | 'temperature';
  stationName: string;
  onClose: () => void;
}

const MeasurementChartModal: React.FC<MeasurementChartModalProps> = ({
  measurements,
  dataType,
  stationName,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const sortedMeasurements = [...measurements]
    .filter((m) => {
      const value = m[dataType];
      return value !== undefined && value !== null;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const labels = sortedMeasurements.map((m) => formatDateTime(m.createdAt));
  const dataValues = sortedMeasurements.map((m) => m[dataType] as number);

  const getChartConfig = () => {
    switch (dataType) {
      case 'pm25':
        return {
          label: 'PM2.5 (µg/m³)',
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          title: 'PM2.5 Levels Over Time',
        };
      case 'pm10':
        return {
          label: 'PM10 (µg/m³)',
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          title: 'PM10 Levels Over Time',
        };
      case 'temperature':
        return {
          label: 'Temperature (°C)',
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          title: 'Temperature Over Time',
        };
      default:
        return {
          label: 'Value',
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          title: 'Measurements Over Time',
        };
    }
  };

  const config = getChartConfig();

  const data = {
    labels,
    datasets: [
      {
        label: config.label,
        data: dataValues,
        borderColor: config.borderColor,
        backgroundColor: config.backgroundColor,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${stationName} - ${config.title}`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: dataType !== 'temperature',
        title: {
          display: true,
          text: config.label,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
      }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '1000px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{config.title}</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-color)',
            }}
            aria-label="Close chart"
          >
            ✕
          </button>
        </div>

        {sortedMeasurements.length === 0 ? (
          <p style={{ color: 'var(--text-color-secondary)' }}>
            No {config.label} data available for this station.
          </p>
        ) : (
          <div style={{ height: '500px', width: '100%' }}>
            <Line data={data} options={options} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MeasurementChartModal;
