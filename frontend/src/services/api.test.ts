import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import * as api from "./api";
import { mockAuthResponse, mockStations } from "../test/mock-data";

// Mock axios
vi.mock("axios");
const mockedAxios = axios as any;

describe("API Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("Authentication", () => {
    it("should register a new user", async () => {
      mockedAxios.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await api.register("testuser", "test@example.com", "password");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({
          username: "testuser",
          email: "test@example.com",
          password: "password",
        })
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it("should login user", async () => {
      mockedAxios.post.mockResolvedValue({ data: mockAuthResponse });

      const result = await api.login("testuser", "password");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({
          username: "testuser",
          password: "password",
        })
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it("should store token in localStorage on login", async () => {
      mockedAxios.post.mockResolvedValue({ data: mockAuthResponse });

      await api.login("testuser", "password");

      expect(localStorage.getItem("token")).toBe(mockAuthResponse.token);
    });
  });

  describe("Stations", () => {
    it("should fetch all stations", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockStations });

      const result = await api.getStations();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/stations")
      );
      expect(result).toEqual(mockStations);
    });

    it("should fetch a single station", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockStations[0] });

      const result = await api.getStation(1);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/stations/1")
      );
      expect(result).toEqual(mockStations[0]);
    });

    it("should create a new station", async () => {
      const newStation = {
        name: "Test Station",
        description: "Test",
        latitude: 40.7128,
        longitude: -74.006,
        measurementEndpoint: "https://example.com",
      };
      mockedAxios.post.mockResolvedValue({ data: { ...newStation, id: 1 } });

      const result = await api.createStation(newStation);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/stations"),
        newStation,
        expect.any(Object)
      );
      expect(result).toEqual(expect.objectContaining(newStation));
    });

    it("should update a station", async () => {
      const updatedStation = {
        ...mockStations[0],
        name: "Updated Station",
      };
      mockedAxios.put.mockResolvedValue({ data: updatedStation });

      await api.updateStation(1, updatedStation);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining("/stations/1"),
        updatedStation,
        expect.any(Object)
      );
    });

    it("should delete a station", async () => {
      mockedAxios.delete.mockResolvedValue({ status: 204 });

      await api.deleteStation(1);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        expect.stringContaining("/stations/1"),
        expect.any(Object)
      );
    });

    it("should include authorization header when token exists", async () => {
      localStorage.setItem("token", mockAuthResponse.token);
      mockedAxios.get.mockResolvedValue({ data: mockStations });

      await api.getStations();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAuthResponse.token}`,
          }),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockedAxios.post.mockRejectedValue(error);

      await expect(api.login("user", "pass")).rejects.toThrow();
    });

    it("should handle 401 unauthorized errors", async () => {
      const error = {
        response: { status: 401 },
      };
      mockedAxios.post.mockRejectedValue(error);

      await expect(api.login("user", "pass")).rejects.toBeDefined();
    });
  });
});
