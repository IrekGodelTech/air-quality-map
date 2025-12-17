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
      />
    );

    expect(screen.getByText(/name/i)).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(screen.getByText(/coordinates/i)).toBeInTheDocument();
    expect(screen.getByText(/endpoint/i)).toBeInTheDocument();
  });

  it("renders stations data in table rows", () => {
    render(
      <StationTable
        stations={mockStations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
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
      />
    );

    const links = screen.getAllByRole("link", { name: /link/i });
    expect(links.length).toBe(mockStations.length);
    expect(links[0]).toHaveAttribute("href", mockStations[0].measurementEndpoint);
  });

  it("renders empty state when no stations provided", () => {
    render(
      <StationTable
        stations={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
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
      />
    );

    const rows = screen.getAllByRole("row");
    // header + stations
    expect(rows.length).toBe(mockStations.length + 1);
  });
});
