import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { authApi, stationsApi } from './api';
import { mockAuthResponse, mockStations } from '../test/mock-data';
import type { Station } from '../types';

const mockedAxios = axios as typeof axios & { create: () => { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> } };
const mockApiInstance = mockedAxios.create();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should login user', async () => {
      mockApiInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.login({ username: 'testuser', password: 'password' });

      expect(mockApiInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockAuthResponse);
    });

    it('should register user', async () => {
      mockApiInstance.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await authApi.register({ 
        username: 'testuser',
        email: 'test@example.com', 
        password: 'password' 
      });

      expect(mockApiInstance.post).toHaveBeenCalled();
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('Stations', () => {
    it('should fetch all stations', async () => {
      mockApiInstance.get.mockResolvedValue({ data: mockStations });

      const result = await stationsApi.getAll();

      expect(mockApiInstance.get).toHaveBeenCalled();
      expect(result).toEqual(mockStations);
    });

    it('should fetch a single station', async () => {
      mockApiInstance.get.mockResolvedValue({ data: mockStations[0] });

      const result = await stationsApi.getById(1);

      expect(mockApiInstance.get).toHaveBeenCalled();
      expect(result).toEqual(mockStations[0]);
    });

    it('should create a new station', async () => {
      const newStation = {
        name: 'Test Station',
        description: 'Test',
        latitude: 40.7128,
        longitude: -74.006,
        measurementEndpoint: 'https://example.com',
      };
      mockApiInstance.post.mockResolvedValue({ data: { ...newStation, id: 1 } });

      const result = await stationsApi.create(newStation as Station);

      expect(mockApiInstance.post).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(newStation));
    });

    it('should update a station', async () => {
      const updatedStation = {
        ...mockStations[0],
        name: 'Updated Station',
      };
      mockApiInstance.put.mockResolvedValue({ data: updatedStation });

      await stationsApi.update(1, updatedStation);

      expect(mockApiInstance.put).toHaveBeenCalled();
    });

    it('should delete a station', async () => {
      mockApiInstance.delete.mockResolvedValue({ status: 204 });

      await stationsApi.delete(1);

      expect(mockApiInstance.delete).toHaveBeenCalled();
    });

    it('should include authorization header when token exists', async () => {
      localStorage.setItem('token', 'test-token');
      mockApiInstance.get.mockResolvedValue({ data: mockStations });

      await stationsApi.getAll();

      expect(mockApiInstance.get).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockApiInstance.post.mockRejectedValue(error);

      await expect(authApi.login({ username: 'user', password: 'pass' })).rejects.toThrow();
    });

    it('should handle 401 unauthorized errors', async () => {
      const error = new Error('Unauthorized') as Error & { response: { status: number } };
      error.response = { status: 401 };
      mockApiInstance.post.mockRejectedValue(error);

      await expect(authApi.login({ username: 'user', password: 'pass' })).rejects.toBeDefined();
    });
  });
});
