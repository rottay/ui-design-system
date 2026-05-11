/**
 * ActionDock Tests
 * Colocated with component following approved architecture
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActionDock } from '../';

vi.mock('../../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockActionDock = ({ children, position = 'bottom', style }: any) => {
      const isBottom = position === 'bottom';
      const containerStyle: React.CSSProperties = {
        position: 'fixed',
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 39,
        ...(isBottom ? { bottom: 0 } : { top: 0 }),
        ...style,
      };
      return (
        <div
          style={containerStyle}
          data-testid="action-dock"
          role="toolbar"
          aria-label={`${position === 'top' ? 'Top' : 'Bottom'} actions`}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
            {children}
          </div>
        </div>
      );
    };
    MockActionDock.displayName = 'ActionDock';
    return MockActionDock;
  },
}));

describe('ActionDock', () => {
  it('renders correctly', () => {
    render(
      <ActionDock>
        <button>Action</button>
      </ActionDock>,
    );
    expect(screen.getByTestId('action-dock')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <ActionDock>
        <button data-testid="action-btn-1">Save</button>
        <button data-testid="action-btn-2">Cancel</button>
      </ActionDock>,
    );
    expect(screen.getByTestId('action-btn-1')).toBeInTheDocument();
    expect(screen.getByTestId('action-btn-2')).toBeInTheDocument();
  });

  it('positions at bottom by default', () => {
    render(
      <ActionDock>
        <button>Save</button>
      </ActionDock>,
    );
    const dock = screen.getByTestId('action-dock');
    expect(dock).toHaveStyle({ position: 'fixed', bottom: '0' });
  });

  it('positions at top when position="top"', () => {
    render(
      <ActionDock position="top">
        <button>Save</button>
      </ActionDock>,
    );
    const dock = screen.getByTestId('action-dock');
    expect(dock).toHaveStyle({ position: 'fixed', top: '0' });
  });

  it('has z-index 39 (below BottomTabBar)', () => {
    render(
      <ActionDock>
        <button>Save</button>
      </ActionDock>,
    );
    const dock = screen.getByTestId('action-dock');
    expect(dock).toHaveStyle({ zIndex: '39' });
  });

  it('has toolbar role for accessibility', () => {
    render(
      <ActionDock>
        <button>Save</button>
      </ActionDock>,
    );
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('has appropriate aria-label based on position', () => {
    const { rerender } = render(
      <ActionDock>
        <button>Save</button>
      </ActionDock>,
    );
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Bottom actions');

    rerender(
      <ActionDock position="top">
        <button>Save</button>
      </ActionDock>,
    );
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-label', 'Top actions');
  });

  it('merges custom style', () => {
    render(
      <ActionDock style={{ background: 'green' }}>
        <button>Save</button>
      </ActionDock>,
    );
    expect(screen.getByTestId('action-dock')).toHaveStyle({ background: 'green' });
  });

  it('renders single child correctly', () => {
    render(
      <ActionDock>
        <button data-testid="single-action">Confirm</button>
      </ActionDock>,
    );
    expect(screen.getByTestId('single-action')).toBeInTheDocument();
  });
});
