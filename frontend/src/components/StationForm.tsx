import React, { useState, useEffect } from 'react';
import type { Station } from '../types';

interface StationFormProps {
  station?: Station | null;
  onSave: (station: Station) => void;
  onCancel: () => void;
}

const StationForm: React.FC<StationFormProps> = ({ station, onSave, onCancel }) => {
  const getInitialFormData = () => station || {
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    measurementEndpoint: '',
  };

  const [formData, setFormData] = useState<Station>(getInitialFormData);

  // Update form when station prop changes (e.g., switching from add to edit)
  useEffect(() => {
    setFormData(getInitialFormData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station?.id]); // Only trigger when switching between stations, not on every prop change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px', border: '1px solid #ddd', marginBottom: '20px' }}>
      <h3>{station ? 'Edit Station' : 'Add New Station'}</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="latitude" style={{ display: 'block', marginBottom: '5px' }}>Latitude *</label>
        <input
          id="latitude"
          name="latitude"
          type="number"
          step="any"
          value={formData.latitude}
          onChange={handleChange}
          required
          min={-90}
          max={90}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="longitude" style={{ display: 'block', marginBottom: '5px' }}>Longitude *</label>
        <input
          id="longitude"
          name="longitude"
          type="number"
          step="any"
          value={formData.longitude}
          onChange={handleChange}
          required
          min={-180}
          max={180}
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="measurementEndpoint" style={{ display: 'block', marginBottom: '5px' }}>
          Measurement Endpoint URL *
        </label>
        <input
          id="measurementEndpoint"
          name="measurementEndpoint"
          type="url"
          value={formData.measurementEndpoint}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>

      <div>
        <button type="submit" style={{ padding: '10px 20px', marginRight: '10px' }}>
          Save
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StationForm;
