import React from 'react';
import type { Station } from '../types';

interface StationTableProps {
  stations: Station[];
  onEdit: (station: Station) => void;
  onDelete: (id: number) => void;
  isAuthenticated: boolean;
}

const StationTable: React.FC<StationTableProps> = ({ stations, onEdit, onDelete, isAuthenticated }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f0f0f0' }}>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Description</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Coordinates</th>
          <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Endpoint</th>
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
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              <a href={station.measurementEndpoint} target="_blank" rel="noopener noreferrer">
                Link
              </a>
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
