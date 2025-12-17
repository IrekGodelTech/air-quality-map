export const mockUser = {
  username: "testuser",
  email: "test@example.com",
};

export const mockAuthResponse = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6InRlc3R1c2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  username: "testuser",
  email: "test@example.com",
};

export const mockStations = [
  {
    id: 1,
    name: "Central Station",
    description: "Downtown air quality monitoring station",
    latitude: 40.7128,
    longitude: -74.006,
    measurementEndpoint: "https://api.example.com/measurements/1",
    createdAt: "2024-12-17T10:00:00Z",
  },
  {
    id: 2,
    name: "North Station",
    description: "Northern area air quality monitoring",
    latitude: 40.8448,
    longitude: -73.8648,
    measurementEndpoint: "https://api.example.com/measurements/2",
    createdAt: "2024-12-17T11:00:00Z",
  },
];

export const mockStation = mockStations[0];

export const createMockStation = (overrides = {}) => ({
  ...mockStation,
  ...overrides,
});

export const createMockAuthUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
});
