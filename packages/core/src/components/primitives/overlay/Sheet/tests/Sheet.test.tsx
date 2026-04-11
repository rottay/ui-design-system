/**
 * Sheet Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sheet } from '../';

vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSheet = ({
      open,
      onOpenChange,
      children,
      title,
      side,
      showHandle,
      showOverlay,
      closeOnEscape,
      closeOnOverlayClick,
      ...props
    }: any) => {
      if (!open) return null;
      return (
        <div
          data-testid="sheet"
          data-side={side}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {showOverlay !== false && (
            <div
              data-testid="sheet-overlay"
              onClick={closeOnOverlayClick !== false ? () => onOpenChange(false) : undefined}
            />
          )}
          <div data-testid="sheet-panel">
            {showHandle !== false && side !== 'left' && side !== 'right' && (
              <div data-testid="sheet-handle" />
            )}
            {title && <div data-testid="sheet-title">{title}</div>}
            <button data-testid="sheet-close" onClick={() => onOpenChange(false)}>
              Close
            </button>
            <div data-testid="sheet-content">{children}</div>
          </div>
        </div>
      );
    };
    MockSheet.displayName = 'Sheet';
    return MockSheet;
  },
}));

import React from 'react';

describe('Sheet', () => {
  it('does not render when closed', () => {
    render(
      <Sheet open={false} onOpenChange={() => {}}>
        Content
      </Sheet>
    );
    expect(screen.queryByTestId('sheet')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        Content
      </Sheet>
    );
    expect(screen.getByTestId('sheet')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Sheet open={true} onOpenChange={() => {}} title="Sheet Title">
        Content
      </Sheet>
    );
    expect(screen.getByTestId('sheet-title')).toHaveTextContent('Sheet Title');
  });

  it('calls onOpenChange when close button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        Content
      </Sheet>
    );
    fireEvent.click(screen.getByTestId('sheet-close'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when overlay is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open={true} onOpenChange={onOpenChange}>
        Content
      </Sheet>
    );
    fireEvent.click(screen.getByTestId('sheet-overlay'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows handle for bottom sheet', () => {
    render(
      <Sheet open={true} onOpenChange={() => {}} side="bottom">
        Content
      </Sheet>
    );
    expect(screen.getByTestId('sheet-handle')).toBeInTheDocument();
  });

  it.each(['bottom', 'left', 'right'] as const)('renders with side %s', (side) => {
    render(
      <Sheet open={true} onOpenChange={() => {}} side={side}>
        Content
      </Sheet>
    );
    expect(screen.getByTestId('sheet')).toHaveAttribute('data-side', side);
  });

  it('has dialog role and aria-modal', () => {
    render(
      <Sheet open={true} onOpenChange={() => {}}>
        Content
      </Sheet>
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('Sheet engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <Sheet engine={engine} open={true} onOpenChange={() => {}}>
        Content
      </Sheet>
    );
    expect(screen.getByTestId('sheet')).toBeInTheDocument();
  });
});
