export interface User {
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface Station {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  measurementEndpoint: string;
  createdAt: string;
}

export interface Measurement {
  id: number;
  createdAt: string;
  pm25: number;
  pm10: number;
  temperature?: number | undefined;
  stationId: number;
}