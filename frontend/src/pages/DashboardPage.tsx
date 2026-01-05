import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import type { Station, Measurement } from '../types';
import { stationsApi } from '../services/api';
import StationTable from '../components/StationTable';
import StationMap from '../components/StationMap';
import StationForm from '../components/StationForm';
import MeasurementDetailsView from '../components/MeasurementDetailsView';
import { ErrorBoundary } from '../components/ErrorBoundary';

const DashboardPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [view, setView] = useState<'table' | 'map'>('table');
  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [error, setError] = useState('');
  const [selectedStationForMeasurements, setSelectedStationForMeasurements] = useState<Station | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const loadStations = useCallback(async () => {
    try {
      const data = await stationsApi.getAll();
      setStations(data);
    } catch {
      setError('Failed to load stations');
    }
  }, []);

  useEffect(() => {
    // Load stations on mount - this is intentional data fetching in an effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStations();
  }, [loadStations]);

  const handleSaveStation = async (station: Station) => {
    try {
      if (station.id) {
        await stationsApi.update(station.id, station);
      } else {
        await stationsApi.create(station);
      }
      await loadStations();
      setShowForm(false);
      setEditingStation(null);
      setError('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save station');
    }
  };

  const handleDeleteStation = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this station?')) {
      return;
    }

    try {
      await stationsApi.delete(id);
      await loadStations();
      setError('');
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete station');
    }
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setShowForm(true);
  };

  const handleViewMeasurements = (station: Station, meas: Measurement[]) => {
    setSelectedStationForMeasurements(station);
    setMeasurements(meas);
  };

  const handleCloseMeasurements = () => {
    setSelectedStationForMeasurements(null);
    setMeasurements([]);
  };

  const handleAddNewStation = () => {
    setEditingStation(null);
    setShowForm(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
        <h1>Air Quality Stations</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              padding: '8px 12px',
              backgroundColor: isDark ? '#ffc107' : '#1a1a1a',
              color: isDark ? '#000' : '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: '15px' }}>Welcome, {user?.username}!</span>
              <button onClick={handleLogout} style={{ padding: '8px 15px' }}>Logout</button>
            </>
          ) : (
            <button onClick={() => navigate('/login')} style={{ padding: '8px 15px' }}>Login</button>
          )}
        </div>
      </header>

      <main style={{ flex: 1, padding: '20px', maxWidth: '100%' }}>
        {error && (
          <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
          onClick={() => setView('table')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'table' ? '#007bff' : '#6c757d',
            color: 'white'
          }}
        >
          Table View
        </button>
        <button 
          onClick={() => setView('map')}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: view === 'map' ? '#007bff' : '#6c757d',
            color: 'white'
          }}
        >
          Map View
        </button>
        {isAuthenticated && (
          <button 
            onClick={handleAddNewStation}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745',
              color: 'white',
              marginLeft: 'auto'
            }}
          >
            + Add Station
          </button>
        )}
      </div>

        {showForm && (
          <StationForm
            station={editingStation}
            onSave={handleSaveStation}
            onCancel={() => {
              setShowForm(false);
              setEditingStation(null);
            }}
          />
        )}

        {view === 'table' ? (
          <div style={{ overflowX: 'auto' }}>
            <StationTable
              stations={stations}
              onEdit={handleEditStation}
              onDelete={handleDeleteStation}
              onViewMeasurements={handleViewMeasurements}
              isAuthenticated={isAuthenticated}
            />
          </div>
        ) : (
          <div style={{ borderRadius: '4px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <StationMap stations={stations} />
          </div>
        )}

        {selectedStationForMeasurements && (
          <MeasurementDetailsView
            station={selectedStationForMeasurements}
            measurements={measurements}
            onClose={handleCloseMeasurements}
          />
        )}
      </main>
    </div>
    </ErrorBoundary>
  );
};

export default DashboardPage;
