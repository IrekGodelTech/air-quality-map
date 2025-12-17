import { vi } from 'vitest';

const mockInterceptors = {
  request: { use: vi.fn(), eject: vi.fn() },
  response: { use: vi.fn(), eject: vi.fn() },
};

// Create a shared mock API instance that all tests can configure
const mockApiInstance = {
  interceptors: mockInterceptors,
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
};

const mockCreate = vi.fn(() => mockApiInstance);

export default {
  create: mockCreate,
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
  interceptors: mockInterceptors,
};

export { mockCreate, mockApiInstance };
