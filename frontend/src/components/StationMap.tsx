import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Station, Measurement } from '../types';
import { measurementsApi } from '../services/api';
import { formatDateTime } from '../utils/dateUtils';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface StationMapProps {
  stations: Station[];
}

interface StationWithLastMeasurement extends Station {
  lastMeasurement?: Measurement;
}

const StationMap: React.FC<StationMapProps> = ({ stations }) => {
  const [stationsWithMeasurements, setStationsWithMeasurements] = useState<StationWithLastMeasurement[]>(stations);
  const [loadingMeasurements, setLoadingMeasurements] = useState(true);

  useEffect(() => {
    const loadMeasurements = async () => {
      try {
        setLoadingMeasurements(true);
        const stationsData = await Promise.all(
          stations.map(async (station) => {
            try {
              const measurements = await measurementsApi.getByStationId(station.id);
              const lastMeasurement = measurements.length > 0 ? measurements[0] : undefined;
              return { ...station, lastMeasurement };
            } catch (err) {
              return station;
            }
          })
        );
        setStationsWithMeasurements(stationsData);
      } finally {
        setLoadingMeasurements(false);
      }
    };

    if (stations.length > 0) {
      loadMeasurements();
    }
  }, [stations]);

  const center: [number, number] = stationsWithMeasurements.length > 0 
    ? [stationsWithMeasurements[0].latitude, stationsWithMeasurements[0].longitude]
    : [51.505, -0.09]; // Default to London

  const formatMeasurement = (measurement: Measurement | undefined) => {
    if (!measurement || measurement.pm25 === undefined || measurement.pm10 === undefined) {
      return <div>No measurements available</div>;
    }
    
    return (
      <table style={{ borderCollapse: 'collapse', fontSize: '0.85em', width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ border: 'none', padding: '2px 8px 2px 0', textAlign: 'left' }}>PM2.5</td>
            <td style={{ border: 'none', padding: '2px 0', textAlign: 'right' }}>{measurement.pm25} µg/m³</td>
          </tr>
          <tr>
            <td style={{ border: 'none', padding: '2px 8px 2px 0', textAlign: 'left' }}>PM10</td>
            <td style={{ border: 'none', padding: '2px 0', textAlign: 'right' }}>{measurement.pm10} µg/m³</td>
          </tr>
          {measurement.temperature !== undefined && (
            <tr>
              <td style={{ border: 'none', padding: '2px 8px 2px 0', textAlign: 'left' }}>Temperature</td>
              <td style={{ border: 'none', padding: '2px 0', textAlign: 'right' }}>{measurement.temperature.toFixed(1)}°C</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      style={{ height: '600px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stationsWithMeasurements.map((station) => (
        <Marker 
          key={station.id} 
          position={[station.latitude, station.longitude]}
        >
          <Popup>
            <div>
              <h3>{station.name}</h3>
              <p>{station.description}</p>
              <p style={{ marginTop: '10px', fontSize: '0.9em', fontWeight: 'bold' }}>
                Last Measurement:
              </p>
              <div style={{ margin: '5px 0' }}>
                {formatMeasurement(station.lastMeasurement)}
              </div>
              {station.lastMeasurement?.createdAt && (
                <p style={{ margin: '5px 0', fontSize: '0.8em', color: '#666' }}>
                  {formatDateTime(station.lastMeasurement.createdAt)}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default StationMap;
