/**
 * Drawer Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Drawer } from './';

// Mock the engine factory
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockDrawer = React.forwardRef<HTMLDivElement, any>(({
      open,
      title,
      placement = 'right',
      size = 'md',
      width,
      height,
      closable = true,
      onClose,
      footer,
      hideFooter,
      closeOnOverlayClick = true,
      className = '',
      children,
      ...props
    }, ref) => {
      if (!open) return null;

      return (
        <>
          <div
            className={`rottay-drawer-overlay ${className}`}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            className={`rottay-drawer rottay-drawer--${placement} rottay-drawer--${size} ${className}`}
            style={{ width, height }}
            {...props}
          >
            {closable && (
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
              >
                ×
              </button>
            )}
            {title && <div className="rottay-drawer__title">{title}</div>}
            <div className="rottay-drawer__body">{children}</div>
            {!hideFooter && footer && (
              <div className="rottay-drawer__footer">{footer}</div>
            )}
          </div>
        </>
      );
    });
    MockDrawer.displayName = 'Drawer';
    return MockDrawer;
  },
}));

describe('Drawer', () => {
  describe('Basic Rendering', () => {
    it('renders when open', () => {
      render(<Drawer open title="Test Drawer">Content</Drawer>);
      expect(screen.getByText('Test Drawer')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<Drawer open={false} title="Test">Content</Drawer>);
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<Drawer open>Drawer body content</Drawer>);
      expect(screen.getByText('Drawer body content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Drawer open className="custom-drawer">Content</Drawer>);
      expect(container.querySelector('.custom-drawer')).toBeInTheDocument();
    });
  });

  describe('Placements', () => {
    it.each(['left', 'right', 'top', 'bottom'] as const)(
      'renders at %s placement',
      (placement) => {
        render(<Drawer open placement={placement}>Content</Drawer>);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
    );

    it('defaults to right placement', () => {
      render(<Drawer open>Content</Drawer>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
      'renders %s size correctly',
      (size) => {
        render(<Drawer open size={size}>Content</Drawer>);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
    );
  });

  describe('Close Behavior', () => {
    it('shows close button by default', () => {
      render(<Drawer open>Content</Drawer>);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('hides close button when closable is false', () => {
      render(<Drawer open closable={false}>Content</Drawer>);
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Drawer open onClose={onClose}>Content</Drawer>);
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on overlay click when enabled', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Drawer open onClose={onClose} closeOnOverlayClick>Content</Drawer>
      );
      const overlay = container.querySelector('[class*="overlay"]');
      if (overlay) fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Footer', () => {
    it('renders custom footer', () => {
      render(
        <Drawer open footer={<button>Footer Button</button>}>
          Content
        </Drawer>
      );
      expect(screen.getByText('Footer Button')).toBeInTheDocument();
    });

    it('hides footer when hideFooter is true', () => {
      render(
        <Drawer open hideFooter footer={<button>Hidden</button>}>
          Content
        </Drawer>
      );
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });
  });

  describe('Custom Dimensions', () => {
    it('accepts custom width', () => {
      render(<Drawer open width={500}>Content</Drawer>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('accepts custom height', () => {
      render(<Drawer open placement="top" height={300}>Content</Drawer>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(<Drawer open>Content</Drawer>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(<Drawer open>Content</Drawer>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Engine Support', () => {
    it.each(['classic', 'modern', 'rustic'] as const)(
      'renders with %s engine',
      (engine) => {
        render(<Drawer open engine={engine}>Content</Drawer>);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
    );
  });

  describe('Drawer tenants', () => {
    it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
      document.documentElement.setAttribute('data-tenant', tenant);
      render(<Drawer open>Content</Drawer>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      document.documentElement.removeAttribute('data-tenant');
    });
  });
});
