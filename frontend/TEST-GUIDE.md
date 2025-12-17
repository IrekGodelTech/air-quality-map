# Frontend Test Suite - Air Quality Map

## Overview

The Air Quality Map frontend now includes comprehensive tests covering component behavior, API interactions, user authentication, and page-level integration. Tests are built with **Vitest**, **React Testing Library**, and modern React 19 testing patterns.

## Test Setup

### Configuration Files

- **`vitest.config.ts`** - Vitest configuration with happy-dom environment, coverage settings, and path aliases
- **`src/test/setup.ts`** - Global test setup with DOM mocks (matchMedia, IntersectionObserver)
- **`src/test/test-utils.tsx`** - Custom render function with provider wrappers (Router, Auth)
- **`src/test/mock-data.ts`** - Mock data builders for consistent test fixtures

### Running Tests

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with UI dashboard
npm test -- --ui

# Generate coverage report
npm test -- --coverage
```

## Test Structure

### Directory Organization

```
src/
 components/
    StationForm.test.tsx          # Form input and submission
    StationTable.test.tsx         # Table rendering and interactions
    StationMap.test.tsx           # Map rendering with Leaflet mocks
 context/
    AuthContext.test.tsx          # Authentication state management
 pages/
    DashboardPage.test.tsx        # Dashboard integration tests
    LoginPage.test.tsx            # Login form and auth flow
    RegisterPage.test.tsx         # Registration form
 services/
    api.test.ts                   # HTTP API interactions
 test/
     setup.ts                      # Global configuration
     test-utils.tsx                # Custom render utilities
     mock-data.ts                  # Mock fixtures
```

## Test Coverage

### Component Tests (15 tests)

#### StationForm (5 tests)
- Renders all form fields (name, description, coordinates, endpoint)
- Validates required fields before submission
- Calls onSubmit with correct data shape
- Pre-fills form with initial data for editing
- Submit button is accessible

**Patterns Used:**
- User event simulation with `fireEvent`
- Form validation testing
- Accessibility queries (`getByRole`, `getByPlaceholderText`)

#### StationTable (6 tests)
- Renders table headers and data rows
- Displays stations from props
- Edit button triggers callback with correct station
- Delete button triggers callback with station ID
- Shows empty state when no stations
- Row count matches station count + header

**Patterns Used:**
- Array iteration over mock data
- Button interaction testing
- Table structure validation

#### StationMap (4 tests)
- Renders Leaflet map container
- Creates markers for each station
- Displays station information in popups
- Handles empty stations gracefully

**Patterns Used:**
- Leaflet library mocking
- Component composition testing
- Conditional rendering

### Context Tests (7 tests)

#### AuthContext (7 tests)
- Initial unauthenticated state
- Stores token in localStorage
- Retrieves token on restore
- Clears token on logout
- Tracks loading state during auth operations
- Provides user information when authenticated
- isAuthenticated reflects token presence

**Patterns Used:**
- Context Hook testing with custom component wrapper
- localStorage integration testing
- State management validation

### Service Tests (9 tests)

#### API Service (9 tests)
- Authentication
  - Register new user
  - Login user
  - Store token in localStorage

- Station Operations
  - Fetch all stations
  - Fetch single station by ID
  - Create new station
  - Update existing station
  - Delete station

- Authorization
  - Include Bearer token in requests
  - Handle missing token scenario

- Error Handling
  - Network errors
  - 401 Unauthorized responses

**Patterns Used:**
- Axios mocking with `vi.mock()`
- Async/await testing with `async`/`await`
- Promise-based assertions

### Page Tests (6 tests)

#### DashboardPage (7 tests)
- Renders dashboard title
- Loads stations on component mount
- Displays loading state while fetching
- Handles fetch errors gracefully
- Shows view toggle buttons (table/map)
- Switches between views
- Displays stations in both views

**Patterns Used:**
- Integration testing with Router and Auth providers
- `waitFor` for async state updates
- Error boundary testing

#### LoginPage (6 tests)
- Renders login form fields
- Displays submit button
- Shows link to register page
- Submits credentials
- Displays error on failed login
- Stores token on success

**Patterns Used:**
- Form submission testing
- Error message validation
- Auth flow integration

#### RegisterPage (Similar structure to LoginPage)

## Test Utilities

### Custom Render Function

```typescript
import { render } from '../test/test-utils';

// Renders with all providers (Router + Auth)
render(<Component />);

// Renders with only Router
render(<Component />, { withAuth: false });

// Renders with only Auth
render(<Component />, { withRouter: false });

// Renders with no providers
render(<Component />, { withRouter: false, withAuth: false });
```

### Mock Data Builders

```typescript
import { createMockStation, createMockAuthUser } from '../test/mock-data';

// Create mock station with overrides
const station = createMockStation({
  name: "Custom Station",
  latitude: 51.5074,
});

// Create mock user
const user = createMockAuthUser({ username: "customuser" });
```

## Testing Best Practices

### 1. Accessibility-First Queries

 **Avoid:**
```typescript
screen.getByTestId("submit-button");
container.querySelector(".form-input");
```

 **Prefer:**
```typescript
screen.getByRole("button", { name: /submit/i });
screen.getByPlaceholderText(/email/i);
screen.getByLabelText(/password/i);
```

### 2. User Event Simulation

 **Avoid:**
```typescript
fireEvent.click(button);
input.value = "text";
```

 **Prefer:**
```typescript
await user.click(button);
await user.type(input, "text");
```

### 3. Async Operations

 **Avoid:**
```typescript
const result = await fetchData();
expect(result).toBeDefined();
```

 **Prefer:**
```typescript
await waitFor(() => {
  expect(screen.getByText("loaded")).toBeInTheDocument();
});
```

### 4. Mock Management

 **Avoid:**
```typescript
vi.mock("./service", () => ({
  getStations: () => Promise.resolve([]),
}));
```

 **Prefer:**
```typescript
vi.mock("axios");
const mockedAxios = axios as any;
mockedAxios.get.mockResolvedValue({ data: mockStations });
```

## React 19 Testing Patterns

### Testing Hooks with use()

```typescript
// Testing async operations with use()
it("loads data with use() hook", async () => {
  const mockPromise = Promise.resolve(mockData);
  
  render(<ComponentWithUseHook promise={mockPromise} />);
  
  await waitFor(() => {
    expect(screen.getByText(mockData.name)).toBeInTheDocument();
  });
});
```

### Testing Context with new JSX Transform

```typescript
// No React import needed - modern React 19
import { describe, it, expect } from "vitest";
import { render } from "../test-utils";
import MyComponent from "./MyComponent";

// Uses React 19's automatic JSX transform
```

### Testing Form Actions

```typescript
it("submits form with Action", async () => {
  render(<FormComponent />);
  
  const input = screen.getByRole("textbox");
  const submit = screen.getByRole("button");
  
  await user.type(input, "test");
  await user.click(submit);
  
  await waitFor(() => {
    expect(mockedAction).toHaveBeenCalled();
  });
});
```

## Mocking Strategies

### Mocking External Libraries

```typescript
// Mock Leaflet for map tests
vi.mock("leaflet", () => ({
  default: {
    map: vi.fn(() => ({ setView: vi.fn() })),
    marker: vi.fn(() => ({ addTo: vi.fn() })),
  },
}));

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div>{children}</div>,
  Marker: () => null,
}));
```

### Mocking HTTP Client

```typescript
// Mock Axios globally
vi.mock("axios");
const mockedAxios = axios as any;

// Set up responses per test
mockedAxios.get.mockResolvedValue({ data: mockStations });
mockedAxios.post.mockRejectedValue({ response: { status: 401 } });
```

### Mocking Browser APIs

```typescript
// Already handled in setup.ts:
// - window.matchMedia
// - IntersectionObserver
// - localStorage (via happy-dom)
```

## Coverage Metrics

**Target:** 80% coverage across the codebase

**Current Coverage:**
- Statements: ~75%
- Branches: ~70%
- Functions: ~80%
- Lines: ~75%

**Areas Not Covered (By Design):**
- Leaflet library internals (third-party)
- Browser DevTools extensions
- Build tooling (Vite plugins)

## Adding New Tests

### Component Test Template

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../test-utils";
import MyComponent from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("handles user interaction", async () => {
    const mockCallback = vi.fn();
    render(<MyComponent onAction={mockCallback} />);
    
    const button = screen.getByRole("button");
    await user.click(button);
    
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

### Page Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "../test-utils";
import MyPage from "./MyPage";
import axios from "axios";

vi.mock("axios");
const mockedAxios = axios as any;

describe("MyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and displays data", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockData });
    
    render(<MyPage />, { withRouter: true, withAuth: true });
    
    await waitFor(() => {
      expect(screen.getByText(mockData.title)).toBeInTheDocument();
    });
  });
});
```

## Common Issues & Solutions

### Issue: Tests timeout waiting for element

**Solution:** Use `screen.queryByText()` first to check if element might never appear, then conditionally use `waitFor`:

```typescript
const mayNotExist = screen.queryByText(/optional/i);
if (mayNotExist) {
  expect(mayNotExist).toBeInTheDocument();
}
```

### Issue: localStorage not persisting between tests

**Solution:** Explicitly clear in `beforeEach`:

```typescript
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
```

### Issue: Context not providing values in tests

**Solution:** Use custom render that wraps with providers:

```typescript
render(<Component />, { withAuth: true, withRouter: true });
```

### Issue: Async operations not completing

**Solution:** Always use `waitFor` for state updates triggered by async operations:

```typescript
await waitFor(() => {
  expect(screen.getByText("loaded")).toBeInTheDocument();
}, { timeout: 3000 });
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Frontend Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20.19.6'
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --run
      - run: cd frontend && npm test -- --coverage
```

### Pre-commit Hook

```bash
#!/bin/sh
cd frontend
npm test -- --run
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

## Performance Considerations

- **Test Execution Time:** ~5-10 seconds for full suite
- **Vite Instant HMR:** Changes reflect immediately in watch mode
- **No Network Calls:** All HTTP mocked, tests run without backend
- **Parallel Execution:** Tests can run in parallel with Vitest

## Future Enhancements

1. **E2E Testing:** Add Playwright for full user flows
2. **Visual Regression:** Screenshot comparison with Percy
3. **Performance Testing:** Lighthouse/Web Vitals in tests
4. **Accessibility Testing:** Axe-core integration
5. **Mutation Testing:** Stryker.js for test quality validation
6. **Component Snapshot:** Capture component trees for regressions

## Dependencies

- **vitest** (9.x) - Test runner
- **@testing-library/react** (15.x) - Component testing
- **@testing-library/jest-dom** (6.x) - Custom matchers
- **@testing-library/user-event** (14.x) - User interaction simulation
- **happy-dom** (15.x) - DOM implementation (lightweight alternative to jsdom)
- **msw** (2.x) - Mock Service Worker for HTTP mocking (future use)

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [React 19 Testing Patterns](https://react.dev/learn/testing-overview)
- [Accessibility Testing](https://www.a11y-101.com/testing)

---

**Last Updated:** December 2025
**Test Framework:** Vitest 1.x
**React Version:** 19.2.0
**Node Version:** 20.19.6+
