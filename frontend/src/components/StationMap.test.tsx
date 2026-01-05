import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test/test-utils";
import StationMap from "./StationMap";
import { mockStations } from "../test/mock-data";

// Mock Leaflet
vi.mock("leaflet", () => ({
  default: {
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
    })),
    tileLayer: vi.fn(() => ({
      addTo: vi.fn(),
    })),
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      bindPopup: vi.fn(),
    })),
    latLngBounds: vi.fn(),
  },
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ position, children }: { position: [number, number]; children: React.ReactNode }) => (
    <div data-testid={`marker-${position[0]}-${position[1]}`}>{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div data-testid="popup">{children}</div>,
}));

describe("StationMap Component", () => {
  const mockOnStationClick = vi.fn();

  it("renders map container", () => {
    render(
      <StationMap
        stations={mockStations}
        onStationClick={mockOnStationClick}
      />
    );

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });

  it("renders tile layer", () => {
    render(
      <StationMap
        stations={mockStations}
        onStationClick={mockOnStationClick}
      />
    );

    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
  });

  it("renders markers for each station", () => {
    render(
      <StationMap
        stations={mockStations}
        onStationClick={mockOnStationClick}
      />
    );

    mockStations.forEach((station) => {
      expect(
        screen.getByTestId(`marker-${station.latitude}-${station.longitude}`)
      ).toBeInTheDocument();
    });
  });

  it("displays station information in popup", () => {
    render(
      <StationMap
        stations={mockStations}
        onStationClick={mockOnStationClick}
      />
    );

    mockStations.forEach((station) => {
      expect(screen.getByText(station.name)).toBeInTheDocument();
    });
  });

  it("handles empty stations array gracefully", () => {
    render(
      <StationMap
        stations={[]}
        onStationClick={mockOnStationClick}
      />
    );

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });
});
