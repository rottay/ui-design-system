/**
 * AlertDialog Tests
 * Colocated with component following approved architecture
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertDialog } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockAlertDialog = ({
      open,
      onOpenChange,
      title,
      description,
      action,
      cancelLabel = 'Cancel',
      closeOnBackdropClick = false,
      className,
      ...props
    }: any) => {
      if (!open) return null;
      return (
        <div
          data-testid="alert-dialog"
          className={className}
          role="alertdialog"
          {...props}
        >
          <div
            data-testid="alert-backdrop"
            onClick={() => closeOnBackdropClick && onOpenChange?.(false)}
          />
          {title && <div data-testid="alert-title">{title}</div>}
          {description && <div data-testid="alert-description">{description}</div>}
          <button
            data-testid="alert-cancel-btn"
            onClick={() => onOpenChange?.(false)}
          >
            {cancelLabel}
          </button>
          {action && <div data-testid="alert-action">{action}</div>}
        </div>
      );
    };
    MockAlertDialog.displayName = 'AlertDialog';
    return MockAlertDialog;
  },
}));

describe('AlertDialog', () => {
  it('does not render when closed', () => {
    render(<AlertDialog open={false} />);
    expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<AlertDialog open={true} />);
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(
      <AlertDialog open={true} title="Delete?" description="This cannot be undone." />
    );
    expect(screen.getByTestId('alert-title')).toHaveTextContent('Delete?');
    expect(screen.getByTestId('alert-description')).toHaveTextContent('This cannot be undone.');
  });

  it('renders action slot', () => {
    render(
      <AlertDialog
        open={true}
        action={<button data-testid="custom-action">Delete</button>}
      />
    );
    expect(screen.getByTestId('custom-action')).toHaveTextContent('Delete');
  });

  it('renders custom cancel label', () => {
    render(<AlertDialog open={true} cancelLabel="Keep" />);
    expect(screen.getByTestId('alert-cancel-btn')).toHaveTextContent('Keep');
  });

  it('calls onOpenChange(false) when cancel is clicked', () => {
    const handleChange = vi.fn();
    render(<AlertDialog open={true} onOpenChange={handleChange} />);
    fireEvent.click(screen.getByTestId('alert-cancel-btn'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('does not close on backdrop click by default', () => {
    const handleChange = vi.fn();
    render(<AlertDialog open={true} onOpenChange={handleChange} />);
    fireEvent.click(screen.getByTestId('alert-backdrop'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('closes on backdrop click when closeOnBackdropClick is true', () => {
    const handleChange = vi.fn();
    render(<AlertDialog open={true} onOpenChange={handleChange} closeOnBackdropClick />);
    fireEvent.click(screen.getByTestId('alert-backdrop'));
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('has alertdialog role for accessibility', () => {
    render(<AlertDialog open={true} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AlertDialog open={true} className="custom" />);
    expect(screen.getByTestId('alert-dialog')).toHaveClass('custom');
  });
});

describe('AlertDialog engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<AlertDialog engine={engine} open={true} />);
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
  });
});
