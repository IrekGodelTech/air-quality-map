import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../test/test-utils";
import StationForm from "./StationForm";

describe("StationForm Component", () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  it("renders the form with all input fields", () => {
    render(<StationForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/measurement endpoint/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<StationForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const submitButton = screen.getByRole("button", { name: /save/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("calls onSave with form data when submitted", async () => {
    render(<StationForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const descInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
    const latInput = screen.getByLabelText(/latitude/i) as HTMLInputElement;
    const longInput = screen.getByLabelText(/longitude/i) as HTMLInputElement;
    const endpointInput = screen.getByLabelText(/measurement endpoint/i) as HTMLInputElement;

    fireEvent.change(nameInput, { target: { value: "Test Station" } });
    fireEvent.change(descInput, {
      target: { value: "Test Description" },
    });
    fireEvent.change(latInput, { target: { value: "40.7128" } });
    fireEvent.change(longInput, { target: { value: "-74.006" } });
    fireEvent.change(endpointInput, {
      target: { value: "https://api.example.com" },
    });

    const submitButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(submitButton);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Station",
        description: "Test Description",
        latitude: 40.7128,
        longitude: -74.006,
        measurementEndpoint: "https://api.example.com",
      })
    );
  });

  it("renders cancel button", () => {
    render(<StationForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    expect(cancelButton).toBeInTheDocument();
  });

  it("pre-fills form with initial data when provided", () => {
    const initialData = {
      id: 1,
      name: "Existing Station",
      description: "Existing Description",
      latitude: 40.7128,
      longitude: -74.006,
      measurementEndpoint: "https://existing.example.com",
      createdAt: "2024-12-17T10:00:00Z",
    };

    render(
      <StationForm station={initialData} onSave={mockOnSave} onCancel={mockOnCancel} />
    );

    expect(screen.getByDisplayValue("Existing Station")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("40.7128")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(<StationForm onSave={mockOnSave} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
