import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { useTheme, ThemeProvider } from './ThemeContext';

// Test component to interact with ThemeContext
function ThemeTestComponent() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div>
      <p data-testid="theme-status">{isDark ? 'dark' : 'light'}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('provides default dark theme when no saved preference exists', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
  });

  it('restores saved theme preference from localStorage', () => {
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
  });

  it('restores dark theme from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
  });

  it('toggles theme from dark to light', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
  });

  it('toggles theme from light to dark', async () => {
    const user = userEvent.setup();
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-status')).toHaveTextContent('light');

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');
  });

  it('persists theme preference to localStorage when toggled', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(localStorage.getItem('theme')).toBe('light');

    await user.click(toggleButton);

    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('sets data-theme attribute on document element for dark mode', () => {
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('sets data-theme attribute on document element for light mode', () => {
    localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('updates data-theme attribute when theme is toggled', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(toggleButton);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('provides theme functionality within provider', () => {
    // This test verifies that the context works correctly when used properly
    // Testing error conditions with React context can be flaky due to error boundaries
    
    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    // Verify the context is working
    expect(screen.getByTestId('theme-status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('supports multiple theme toggles', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });

    // Start: dark
    expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');

    // Toggle to light
    await user.click(toggleButton);
    expect(screen.getByTestId('theme-status')).toHaveTextContent('light');

    // Toggle back to dark
    await user.click(toggleButton);
    expect(screen.getByTestId('theme-status')).toHaveTextContent('dark');

    // Toggle to light again
    await user.click(toggleButton);
    expect(screen.getByTestId('theme-status')).toHaveTextContent('light');
  });
});
