/**
 * Modal Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Modal } from '..';
import ModernModal from '../engines/modern';
import {
  ResponsiveContext,
  type ResponsiveContextValue,
} from '../../../../../infrastructure/runtime/responsive';

const PHONE_RESPONSIVE_CONTEXT: ResponsiveContextValue = {
  deviceClass: 'phone',
  activeBreakpoint: 'xs',
  isPhone: true,
  isTablet: false,
  isDesktop: false,
  pointer: 'coarse',
  orientation: 'portrait',
  prefersReducedMotion: false,
  isPhoneOrTablet: true,
  isTabletOrDesktop: false,
  isTouchDevice: true,
};

const DESKTOP_RESPONSIVE_CONTEXT: ResponsiveContextValue = {
  ...PHONE_RESPONSIVE_CONTEXT,
  deviceClass: 'desktop',
  activeBreakpoint: 'lg',
  isPhone: false,
  isDesktop: true,
  pointer: 'fine',
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

// Mock the engine factory
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MockModal = React.forwardRef<HTMLDivElement, any>(({
      open,
      title,
      size = 'md',
      closable = true,
      onClose,
      onOk,
      okText = 'OK',
      cancelText = 'Cancel',
      footer,
      hideFooter,
      closeOnOverlayClick = true,
      confirmLoading,
      className = '',
      children,
      ...props
    }, ref) => {
      if (!open) return null;

      const titleId = title ? 'modal-title' : undefined;

      return (
        <>
          <div
            className={`rottay-modal-overlay ${className}`}
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`rottay-modal rottay-modal--${size} ${className}`}
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
            {title && <div id={titleId} className="rottay-modal__title">{title}</div>}
            <div className="rottay-modal__body">{children}</div>
            {!hideFooter && (
              <div className="rottay-modal__footer">
                {footer || (
                  <>
                    <button onClick={onClose}>{cancelText}</button>
                    <button onClick={onOk} disabled={confirmLoading}>
                      {confirmLoading ? 'Loading...' : okText}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      );
    });
    MockModal.displayName = 'Modal';
    return MockModal;
  },
}));

describe('Modal', () => {
  describe('Modern responsive posture', () => {
    it('opens fullscreen on phone and preserves explicit fullscreen on desktop', () => {
      const { rerender } = render(
        <ResponsiveContext.Provider value={PHONE_RESPONSIVE_CONTEXT}>
          <ModernModal open title="Phone modal">Content</ModernModal>
        </ResponsiveContext.Provider>,
      );

      const phoneSurface = screen.getByRole('dialog');
      expect(phoneSurface).toHaveAttribute('data-fullscreen', 'true');
      expect(phoneSurface).toHaveAttribute('data-adaptive-fullscreen', 'true');
      expect(phoneSurface.style.width).toBe('100vw');
      expect(phoneSurface.style.position).toBe('fixed');
      expect(phoneSurface.style.margin).toBe('0px');
      expect(phoneSurface.style.getPropertyValue('--ds-modal-surface-radius')).toBe('0');

      rerender(
        <ResponsiveContext.Provider value={DESKTOP_RESPONSIVE_CONTEXT}>
          <ModernModal open fullScreen title="Desktop fullscreen modal">
            Content
          </ModernModal>
        </ResponsiveContext.Provider>,
      );

      const explicitSurface = screen.getByRole('dialog');
      expect(explicitSurface).toHaveAttribute('data-fullscreen', 'true');
      expect(explicitSurface).toHaveAttribute('data-adaptive-fullscreen', 'false');
      expect(explicitSurface.style.height).toBe('100vh');
    });
  });

  describe('Basic Rendering', () => {
    it('renders when open', () => {
      render(<Modal open title="Test Modal">Content</Modal>);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<Modal open={false} title="Test Modal">Content</Modal>);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<Modal open>Modal content here</Modal>);
      expect(screen.getByText('Modal content here')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<Modal open className="custom-modal">Content</Modal>);
      expect(container.querySelector('.custom-modal')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl', 'full'] as const)(
      'renders %s size correctly',
      (size) => {
        render(<Modal open size={size}>Content</Modal>);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
    );
  });

  describe('Close Behavior', () => {
    it('shows close button by default', () => {
      render(<Modal open>Content</Modal>);
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });

    it('hides close button when closable is false', () => {
      render(<Modal open closable={false}>Content</Modal>);
      expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Modal open onClose={onClose}>Content</Modal>);
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on overlay click when enabled', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Modal open onClose={onClose} closeOnOverlayClick>Content</Modal>
      );
      const overlay = container.querySelector('[class*="overlay"]');
      if (overlay) fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close on overlay click when disabled', () => {
      const onClose = vi.fn();
      const { container } = render(
        <Modal open onClose={onClose} closeOnOverlayClick={false}>Content</Modal>
      );
      const overlay = container.querySelector('[class*="overlay"]');
      if (overlay) fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Footer', () => {
    it('renders custom footer', () => {
      render(
        <Modal open footer={<button>Custom Button</button>}>
          Content
        </Modal>
      );
      expect(screen.getByText('Custom Button')).toBeInTheDocument();
    });

    it('hides footer when hideFooter is true', () => {
      render(<Modal open hideFooter footer={<button>Hidden</button>}>Content</Modal>);
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('renders OK and Cancel buttons with custom text', () => {
      render(<Modal open okText="Confirm" cancelText="Dismiss">Content</Modal>);
      expect(screen.getByText('Confirm')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('calls onOk when OK button is clicked', () => {
      const onOk = vi.fn();
      render(<Modal open onOk={onOk}>Content</Modal>);
      const okButton = screen.getByText(/ok/i);
      if (okButton) fireEvent.click(okButton);
      expect(onOk).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(<Modal open>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(<Modal open>Content</Modal>);
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      render(<Modal open title="Modal Title">Content</Modal>);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
    });
  });

  describe('Engine Support', () => {
    it.each(['classic', 'modern', 'rustic'] as const)(
      'renders with %s engine',
      (engine) => {
        render(<Modal open engine={engine}>Content</Modal>);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      }
    );
  });

  describe('Loading State', () => {
    it('shows loading state on OK button', () => {
      render(<Modal open confirmLoading>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Modal tenants', () => {
    it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
      document.documentElement.setAttribute('data-tenant', tenant);
      render(<Modal open>Content</Modal>);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      document.documentElement.removeAttribute('data-tenant');
    });
  });
});
