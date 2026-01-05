import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Station, Measurement } from '../types';
import { measurementsApi } from '../services/api';
import { formatDateTime } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
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
  const { isDark } = useTheme();
  const [stationsWithMeasurements, setStationsWithMeasurements] = useState<StationWithLastMeasurement[]>(stations);

  useEffect(() => {
    const loadMeasurements = async () => {
      const stationsData = await Promise.all(
        stations.map(async (station) => {
          try {
            const measurements = await measurementsApi.getByStationId(station.id);
            const lastMeasurement = measurements.length > 0 ? measurements[0] : undefined;
            return { ...station, lastMeasurement };
          } catch {
            return station;
          }
        })
      );
      setStationsWithMeasurements(stationsData);
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
      return <div style={{ color: isDark ? 'rgba(255, 255, 255, 0.87)' : '#213547' }}>No measurements available</div>;
    }
    
    const textColor = isDark ? 'rgba(255, 255, 255, 0.87)' : '#213547';
    
    return (
      <table style={{ borderCollapse: 'collapse', fontSize: '0.85em', width: '100%', color: textColor }}>
        <tbody>
          <tr>
            <td style={{ border: 'none', padding: '2px 8px 2px 0', textAlign: 'left', color: textColor }}>PM2.5</td>
            <td style={{ border: 'none', padding: '2px 0', textAlign: 'right', color: textColor }}>{measurement.pm25} µg/m³</td>
          </tr>
          <tr>
            <td style={{ border: 'none', padding: '2px 8px 2px 0', textAlign: 'left', color: textColor }}>PM10</td>
            <td style={{ border: 'none', padding: '2px 0', textAlign: 'right', color: textColor }}>{measurement.pm10} µg/m³</td>
          </tr>
          {measurement.temperature !== undefined && (
            <tr>
              <td style={{ border: 'none', padding: '2px 8px 2px 0', textAlign: 'left', color: textColor }}>Temperature</td>
              <td style={{ border: 'none', padding: '2px 0', textAlign: 'right', color: textColor }}>{measurement.temperature.toFixed(1)}°C</td>
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
      {isDark ? (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
      ) : (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
      )}
      {stationsWithMeasurements.map((station) => {
        const textColor = isDark ? 'rgba(255, 255, 255, 0.87)' : '#213547';
        const secondaryColor = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666';
        const bgColor = isDark ? '#242424' : '#ffffff';
        
        return (
          <Marker 
            key={station.id} 
            position={[station.latitude, station.longitude]}
          >
            <Popup>
              <div style={{ color: textColor, backgroundColor: bgColor, padding: '4px' }}>
                <h3 style={{ color: textColor, margin: '0 0 8px 0' }}>{station.name}</h3>
                <p style={{ color: textColor, margin: '0 0 8px 0' }}>{station.description}</p>
                <p style={{ marginTop: '10px', fontSize: '0.9em', fontWeight: 'bold', color: textColor }}>
                  Last Measurement:
                </p>
                <div style={{ margin: '5px 0' }}>
                  {formatMeasurement(station.lastMeasurement)}
                </div>
                {station.lastMeasurement?.createdAt && (
                  <p style={{ margin: '5px 0', fontSize: '0.8em', color: secondaryColor }}>
                    {formatDateTime(station.lastMeasurement.createdAt)}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default StationMap;
