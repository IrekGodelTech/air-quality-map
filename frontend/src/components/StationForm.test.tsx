import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../test-utils";
import StationForm from "./StationForm";

describe("StationForm Component", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renders the form with all input fields", () => {
    render(<StationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByPlaceholderText(/station name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/longitude/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/measurement endpoint/i)
    ).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<StationForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /submit|save|add/i });
    expect(submitButton).toBeInTheDocument();
  });

  it("calls onSubmit with form data when submitted", async () => {
    render(<StationForm onSubmit={mockOnSubmit} />);

    const nameInput = screen.getByPlaceholderText(/station name/i);
    const descInput = screen.getByPlaceholderText(/description/i);
    const latInput = screen.getByPlaceholderText(/latitude/i);
    const longInput = screen.getByPlaceholderText(/longitude/i);
    const endpointInput = screen.getByPlaceholderText(/measurement endpoint/i);

    fireEvent.change(nameInput, { target: { value: "Test Station" } });
    fireEvent.change(descInput, {
      target: { value: "Test Description" },
    });
    fireEvent.change(latInput, { target: { value: "40.7128" } });
    fireEvent.change(longInput, { target: { value: "-74.006" } });
    fireEvent.change(endpointInput, {
      target: { value: "https://api.example.com" },
    });

    const submitButton = screen.getByRole("button", { name: /submit|save|add/i });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Station",
        description: "Test Description",
        latitude: 40.7128,
        longitude: -74.006,
        measurementEndpoint: "https://api.example.com",
      })
    );
  });

  it("displays validation error when required fields are empty", async () => {
    render(<StationForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /submit|save|add/i });
    fireEvent.click(submitButton);

    // Should not call onSubmit if validation fails
    expect(mockOnSubmit).not.toHaveBeenCalled();
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

    render(<StationForm onSubmit={mockOnSubmit} initialData={initialData} />);

    expect(screen.getByDisplayValue("Existing Station")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("40.7128")).toBeInTheDocument();
  });
});
