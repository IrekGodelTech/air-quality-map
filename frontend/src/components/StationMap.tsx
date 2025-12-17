import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Station } from '../types';
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

const StationMap: React.FC<StationMapProps> = ({ stations }) => {
  const center: [number, number] = stations.length > 0 
    ? [stations[0].latitude, stations[0].longitude]
    : [51.505, -0.09]; // Default to London

  return (
    <MapContainer 
      center={center} 
      zoom={6} 
      style={{ height: '500px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stations.map((station) => (
        <Marker 
          key={station.id} 
          position={[station.latitude, station.longitude]}
        >
          <Popup>
            <div>
              <h3>{station.name}</h3>
              <p>{station.description}</p>
              <a href={station.measurementEndpoint} target="_blank" rel="noopener noreferrer">
                View Measurements
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default StationMap;
