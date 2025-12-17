import axios from 'axios';
import type { LoginData, RegisterData, AuthResponse, Station } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

// Stations API
export const stationsApi = {
  getAll: async (): Promise<Station[]> => {
    const response = await api.get<Station[]>('/stations');
    return response.data;
  },
  
  getById: async (id: number): Promise<Station> => {
    const response = await api.get<Station>(`/stations/${id}`);
    return response.data;
  },
  
  create: async (station: Station): Promise<Station> => {
    const response = await api.post<Station>('/stations', station);
    return response.data;
  },
  
  update: async (id: number, station: Station): Promise<void> => {
    await api.put(`/stations/${id}`, station);
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/stations/${id}`);
  },
};

export default api;
