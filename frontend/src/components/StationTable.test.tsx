import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test-utils";
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
    expect(screen.getByText(/location|coordinates|latitude/i)).toBeInTheDocument();
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

  it("calls onEdit when edit button is clicked", () => {
    render(
      <StationTable
        stations={mockStations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButtons = screen.getAllByRole("button", { name: /edit/i });
    editButtons[0].click();

    expect(mockOnEdit).toHaveBeenCalledWith(mockStations[0]);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <StationTable
        stations={mockStations}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: /delete|remove/i });
    deleteButtons[0].click();

    expect(mockOnDelete).toHaveBeenCalledWith(mockStations[0].id);
  });

  it("renders empty state when no stations provided", () => {
    render(
      <StationTable
        stations={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(
      screen.getByText(/no stations|empty/i)
    ).toBeInTheDocument();
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
    // +1 for header row
    expect(rows).toHaveLength(mockStations.length + 1);
  });
});
