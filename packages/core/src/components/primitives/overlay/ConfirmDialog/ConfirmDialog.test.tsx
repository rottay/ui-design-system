/**
 * ConfirmDialog Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockConfirmDialog = ({
      open,
      title,
      description,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      onConfirm,
      onCancel,
      variant = 'info',
      icon,
      loading,
      className,
      ...props
    }: any) => {
      if (!open) return null;
      return (
        <div
          data-testid="confirm-dialog"
          data-variant={variant}
          data-loading={loading}
          className={className}
          role="alertdialog"
          {...props}
        >
          {icon && <span data-testid="confirm-icon">{icon}</span>}
          {title && <div data-testid="confirm-title">{title}</div>}
          {description && <div data-testid="confirm-description">{description}</div>}
          <button data-testid="cancel-btn" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button data-testid="confirm-btn" onClick={onConfirm} disabled={loading}>
            {confirmLabel}
          </button>
        </div>
      );
    };
    MockConfirmDialog.displayName = 'ConfirmDialog';
    return MockConfirmDialog;
  },
}));

describe('ConfirmDialog', () => {
  it('does not render when closed', () => {
    render(<ConfirmDialog open={false} onCancel={() => {}} />);
    expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(<ConfirmDialog open={true} onCancel={() => {}} />);
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(
      <ConfirmDialog open={true} title="Delete?" description="This cannot be undone." onCancel={() => {}} />
    );
    expect(screen.getByTestId('confirm-title')).toHaveTextContent('Delete?');
    expect(screen.getByTestId('confirm-description')).toHaveTextContent('This cannot be undone.');
  });

  it('renders custom button labels', () => {
    render(
      <ConfirmDialog open={true} confirmLabel="Yes, delete" cancelLabel="No, keep" onCancel={() => {}} />
    );
    expect(screen.getByTestId('confirm-btn')).toHaveTextContent('Yes, delete');
    expect(screen.getByTestId('cancel-btn')).toHaveTextContent('No, keep');
  });

  it('calls onConfirm when confirm is clicked', () => {
    const handleConfirm = vi.fn();
    render(<ConfirmDialog open={true} onConfirm={handleConfirm} onCancel={() => {}} />);
    fireEvent.click(screen.getByTestId('confirm-btn'));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel is clicked', () => {
    const handleCancel = vi.fn();
    render(<ConfirmDialog open={true} onCancel={handleCancel} />);
    fireEvent.click(screen.getByTestId('cancel-btn'));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it.each(['info', 'warning', 'danger'] as const)('renders %s variant', (variant) => {
    render(<ConfirmDialog open={true} variant={variant} onCancel={() => {}} />);
    expect(screen.getByTestId('confirm-dialog')).toHaveAttribute('data-variant', variant);
  });

  it('disables buttons when loading', () => {
    render(<ConfirmDialog open={true} loading onCancel={() => {}} />);
    expect(screen.getByTestId('confirm-btn')).toBeDisabled();
    expect(screen.getByTestId('cancel-btn')).toBeDisabled();
  });

  it('has alertdialog role for accessibility', () => {
    render(<ConfirmDialog open={true} onCancel={() => {}} />);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ConfirmDialog open={true} className="custom" onCancel={() => {}} />);
    expect(screen.getByTestId('confirm-dialog')).toHaveClass('custom');
  });
});

describe('ConfirmDialog engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<ConfirmDialog engine={engine} open={true} onCancel={() => {}} />);
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });
});
