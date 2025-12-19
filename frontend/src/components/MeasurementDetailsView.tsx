import React from 'react';
import type { Station, Measurement } from '../types';

interface MeasurementDetailsViewProps {
  station: Station;
  measurements: Measurement[];
  onClose: () => void;
}

const MeasurementDetailsView: React.FC<MeasurementDetailsViewProps> = ({
  station,
  measurements,
  onClose,
}) => {
  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-color)',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{station.name} - Measurements</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-color)',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ marginBottom: '20px', color: 'var(--text-color-secondary)' }}>
          Location: {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
        </p>

        {sortedMeasurements.length === 0 ? (
          <p style={{ color: 'var(--text-color-secondary)' }}>No measurements available for this station.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0', color: 'var(--text-color)' }}>
                <th style={{ padding: '10px', textAlign: 'left', border: '1px solid var(--border-color)' }}>Date & Time</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid var(--border-color)' }}>PM2.5</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid var(--border-color)' }}>PM10</th>
                <th style={{ padding: '10px', textAlign: 'right', border: '1px solid var(--border-color)' }}>Temperature</th>
              </tr>
            </thead>
            <tbody>
              {sortedMeasurements.map((measurement) => (
                <tr key={measurement.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>
                    {new Date(measurement.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', border: '1px solid var(--border-color)' }}>
                    {measurement.pm25 !== undefined ? `${measurement.pm25.toFixed(2)} µg/m³` : '-'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', border: '1px solid var(--border-color)' }}>
                    {measurement.pm10 !== undefined ? `${measurement.pm10.toFixed(2)} µg/m³` : '-'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', border: '1px solid var(--border-color)' }}>
                    {measurement.temperature !== undefined ? `${measurement.temperature.toFixed(1)}°C` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MeasurementDetailsView;