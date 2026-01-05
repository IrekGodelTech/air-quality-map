import React, { useState, useEffect } from 'react';
import type { Station, Measurement } from '../types';
import { measurementsApi } from '../services/api';

interface StationTableProps {
  stations: Station[];
  onEdit: (station: Station) => void;
  onDelete: (id: number) => void;
  onViewMeasurements: (station: Station, measurements: Measurement[]) => void;
  isAuthenticated: boolean;
}

const StationTable: React.FC<StationTableProps> = ({ 
  stations, 
  onEdit, 
  onDelete, 
  onViewMeasurements,
  isAuthenticated 
}) => {
  const [loadingStationId, setLoadingStationId] = useState<number | null>(null);
  const [stationMeasurements, setStationMeasurements] = useState<Record<number, Measurement[]>>({});
  const [loadingLastMeasurements, setLoadingLastMeasurements] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMeasurements = async () => {
      try {
        if (!mounted) return;
        setLoadingLastMeasurements(true);
        const measurements: Record<number, Measurement[]> = {};
        
        for (const station of stations) {
          try {
            const stationMeas = await measurementsApi.getByStationId(station.id);
            if (mounted) {
              measurements[station.id] = stationMeas;
            }
          } catch (err) {
            console.error(`Failed to load measurements for station ${station.id}:`, err);
          }
        }
        
        if (mounted) {
          setStationMeasurements(measurements);
        }
      } finally {
        if (mounted) {
          setLoadingLastMeasurements(false);
        }
      }
    };

    if (stations.length > 0) {
      loadMeasurements();
    } else {
      setStationMeasurements({});
      setLoadingLastMeasurements(false);
    }

    return () => {
      mounted = false;
    };
  }, [stations]);

  const handleViewMore = async (station: Station) => {
    setLoadingStationId(station.id);
    try {
      const measurements = stationMeasurements[station.id] || await measurementsApi.getByStationId(station.id);
      onViewMeasurements(station, measurements);
    } catch (err) {
      console.error('Failed to load measurements:', err);
    } finally {
      setLoadingStationId(null);
    }
  };

  const getLastMeasurement = (station: Station): Measurement | undefined => {
    const measurements = stationMeasurements[station.id];
    if (!measurements || measurements.length === 0) {
      return undefined;
    }
    // Return the first one (assuming API returns sorted by newest first)
    return measurements[0];
  };

  const formatMeasurement = (measurement: Measurement | undefined) => {
    if (!measurement) {
      return 'No data';
    }
    return `PM2.5: ${measurement.pm25} µg/m³, PM10: ${measurement.pm10} µg/m³${measurement.temperature !== undefined ? `, Temp: ${measurement.temperature.toFixed(1)}°C` : ''}`;
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f0f0f0' }}>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Description</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Coordinates</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Last Measurement</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Measurements</th>
          {isAuthenticated && <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {stations.map((station) => (
          <tr key={station.id}>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{station.name}</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{station.description}</td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
            </td>
            <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '0.85em' }}>
              {loadingLastMeasurements ? 'Loading...' : formatMeasurement(getLastMeasurement(station))}
            </td>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              <button
                onClick={() => handleViewMore(station)}
                disabled={loadingStationId === station.id}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loadingStationId === station.id ? 'not-allowed' : 'pointer',
                  opacity: loadingStationId === station.id ? 0.6 : 1
                }}
              >
                {loadingStationId === station.id ? 'Loading...' : 'View More'}
              </button>
            </td>
            {isAuthenticated && (
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button 
                  onClick={() => onEdit(station)}
                  style={{ marginRight: '5px', padding: '5px 10px' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => station.id && onDelete(station.id)}
                  style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white' }}
                >
                  Delete
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StationTable;
