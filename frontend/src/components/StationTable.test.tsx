import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test/test-utils";
import StationTable from "./StationTable";
import { mockStations } from "../test/mock-data";

describe("StationTable Component", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it("renders table with column headers", () => {
    render(
      <StationTable
        stations={mockStations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewMeasurements={vi.fn()}
        isAuthenticated={false}
      />
    );

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/coordinates/i)).toBeInTheDocument();
    expect(screen.getByText(/last measurement/i)).toBeInTheDocument();
    expect(screen.getByText(/measurements/i)).toBeInTheDocument();
  });

  it("renders stations data in table rows", () => {
    render(
      <StationTable
        stations={mockStations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewMeasurements={vi.fn()}
        isAuthenticated={false}
      />
    );

    mockStations.forEach((station) => {
      expect(screen.getByText(station.name)).toBeInTheDocument();
      expect(screen.getByText(station.description)).toBeInTheDocument();
    });
  });

  it("renders links to measurement endpoints", () => {
    render(
      <StationTable
        stations={mockStations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewMeasurements={vi.fn()}
        isAuthenticated={false}
      />
    );

    const buttons = screen.getAllByRole("button", { name: /view more/i });
    expect(buttons.length).toBe(mockStations.length);
  });

  it("renders empty state when no stations provided", () => {
    render(
      <StationTable
        stations={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewMeasurements={vi.fn()}
        isAuthenticated={false}
      />
    );

    const rows = screen.queryAllByRole("row");
    // Only header row should be present
    expect(rows.length).toBe(1);
  });

  it("displays correct number of rows for stations", () => {
    render(
      <StationTable
        stations={mockStations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onViewMeasurements={vi.fn()}
        isAuthenticated={false}
      />
    );

    const rows = screen.getAllByRole("row");
    // header + stations
    expect(rows.length).toBe(mockStations.length + 1);
  });
});
