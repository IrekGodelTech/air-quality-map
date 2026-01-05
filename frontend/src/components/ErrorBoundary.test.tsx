import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div>Normal content</div>;
}

// Component with custom error
function ThrowCustomError({ error }: { error?: Error }) {
  if (error) {
    throw error;
  }
  return <div>Normal content</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we expect errors
  const originalError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays error message when error is caught', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays error stack trace in details element', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const details = document.querySelector('details');
    expect(details).toBeInTheDocument();
  });

  it('logs error to console when caught', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('handles different error messages', () => {
    const customError = new Error('Custom error message');
    
    render(
      <ErrorBoundary>
        <ThrowCustomError error={customError} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('can handle multiple children', () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('isolates errors to the boundary scope', () => {
    render(
      <div>
        <div>Outside boundary</div>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
        <div>Also outside boundary</div>
      </div>
    );

    // Content outside boundary should still render
    expect(screen.getByText('Outside boundary')).toBeInTheDocument();
    expect(screen.getByText('Also outside boundary')).toBeInTheDocument();
    
    // Error message should be shown
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('does not show error UI before error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('applies error styling', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByText(/something went wrong/i).parentElement;
    expect(errorContainer).toHaveStyle({
      backgroundColor: '#f8d7da',
      color: '#721c24',
    });
  });

  it('renders error stack details with proper styling', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const details = document.querySelector('details');
    expect(details).toBeInTheDocument();
    expect(details).toHaveStyle({
      marginTop: '10px',
      whiteSpace: 'pre-wrap',
    });
  });

  it('handles errors from nested components', () => {
    function NestedComponent() {
      return (
        <div>
          <ThrowError shouldThrow={true} />
        </div>
      );
    }

    render(
      <ErrorBoundary>
        <div>
          <NestedComponent />
        </div>
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('can handle errors with missing stack traces', () => {
    const errorWithoutStack = new Error('Error without stack');
    errorWithoutStack.stack = undefined;

    render(
      <ErrorBoundary>
        <ThrowCustomError error={errorWithoutStack} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error without stack')).toBeInTheDocument();
  });
});
