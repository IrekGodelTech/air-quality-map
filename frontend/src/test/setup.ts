import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock Leaflet
vi.mock("leaflet", () => {
  const L = {
    icon: vi.fn((options) => ({
      iconUrl: options.iconUrl,
      shadowUrl: options.shadowUrl,
      iconSize: options.iconSize,
      shadowSize: options.shadowSize,
      iconAnchor: options.iconAnchor,
      shadowAnchor: options.shadowAnchor,
      popupAnchor: options.popupAnchor,
    })),
    Icon: {
      Default: {
        prototype: {
          options: {},
          _getIconUrl: vi.fn(),
        },
        mergeOptions: vi.fn(),
      },
    },
    map: vi.fn(() => ({
      setView: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
    })),
    popup: vi.fn(() => ({
      setLatLng: vi.fn(),
      openOn: vi.fn(),
    })),
    latLng: vi.fn((lat, lng) => ({ lat, lng })),
    latLngBounds: vi.fn(() => ({
      extend: vi.fn(),
      pad: vi.fn(),
    })),
  };

  return { default: L };
});
