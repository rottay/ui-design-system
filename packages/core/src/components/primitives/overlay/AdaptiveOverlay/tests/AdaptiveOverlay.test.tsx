/**
 * AdaptiveOverlay Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// ---------------------------------------------------------------------------
// Mock: useResponsive
// ---------------------------------------------------------------------------

const mockResponsive = {
  deviceClass: 'desktop' as 'phone' | 'tablet' | 'desktop',
  activeBreakpoint: 'lg' as const,
  isPhone: false,
  isTablet: false,
  isDesktop: true,
  pointer: 'fine' as const,
  orientation: 'landscape' as const,
  prefersReducedMotion: false,
  isPhoneOrTablet: false,
  isTabletOrDesktop: true,
  isTouchDevice: false,
};

vi.mock('../../../../../runtime/responsive', () => ({
  useResponsive: () => mockResponsive,
}));

// ---------------------------------------------------------------------------
// Mock: Modal
// ---------------------------------------------------------------------------

vi.mock('../../Modal', () => {
  const MockModalBody = ({ children, className, style }: any) => (
    <div data-testid="modal-body" className={className} style={style}>{children}</div>
  );
  MockModalBody.displayName = 'ModalBody';

  const MockModal = ({
    open,
    onClose,
    children,
    title,
    footer,
    engine,
    className,
    style,
    id,
    'aria-label': ariaLabel,
    'data-testid': testId,
  }: any) => {
    if (!open) return null;
    return (
      <div
        id={id}
        data-testid={testId ?? 'adaptive-overlay'}
        data-mode="modal"
        data-engine={engine}
        className={className}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div data-testid="modal-backdrop" onClick={onClose} />
        {title && <div data-testid="modal-title">{title}</div>}
        <div data-testid="modal-content">{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    );
  };
  MockModal.displayName = 'Modal';
  MockModal.Body = MockModalBody;
  MockModal.Header = ({ children }: any) => <div>{children}</div>;
  MockModal.Footer = ({ children }: any) => <div>{children}</div>;
  MockModal.CloseButton = () => <button>X</button>;

  return { Modal: MockModal };
});

// ---------------------------------------------------------------------------
// Mock: Drawer
// ---------------------------------------------------------------------------

vi.mock('../../../feedback/Drawer', () => {
  const MockDrawer = ({
    open,
    onClose,
    children,
    title,
    footer,
    placement,
    width,
    engine,
    className,
    style,
    id,
    'aria-label': ariaLabel,
    'data-testid': testId,
  }: any) => {
    if (!open) return null;
    return (
      <div
        data-testid={testId ?? 'adaptive-overlay'}
        data-mode="drawer"
        data-placement={placement}
        data-width={width}
        data-engine={engine}
        className={className}
        style={style}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div data-testid="drawer-backdrop" onClick={onClose} />
        {title && <div data-testid="drawer-title">{title}</div>}
        <div data-testid="drawer-content">{children}</div>
        {footer && <div data-testid="drawer-footer">{footer}</div>}
      </div>
    );
  };
  MockDrawer.displayName = 'Drawer';
  MockDrawer.Header = ({ children }: any) => <div>{children}</div>;
  MockDrawer.Body = ({ children }: any) => <div>{children}</div>;
  MockDrawer.Footer = ({ children }: any) => <div>{children}</div>;

  return { Drawer: MockDrawer };
});

// ---------------------------------------------------------------------------
// Mock: Sheet
// ---------------------------------------------------------------------------

vi.mock('../../Sheet', () => {
  const MockSheet = ({
    open,
    onOpenChange,
    children,
    title,
    side,
    showHandle,
    showOverlay,
    footer,
    engine,
    id,
    'data-testid': testId,
    'aria-label': ariaLabel,
    surfaceClassName,
    surfaceStyle,
    bodyClassName,
    bodyStyle,
    footerClassName,
    footerStyle,
  }: any) => {
    if (!open) return null;
    return (
      <div
        id={id}
        data-testid={testId ?? 'adaptive-overlay'}
        data-mode="sheet"
        data-side={side}
        data-engine={engine}
        className={surfaceClassName}
        style={surfaceStyle}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {showOverlay !== false && (
          <div
            data-testid="sheet-overlay"
            onClick={() => onOpenChange(false)}
          />
        )}
        {showHandle && <div data-testid="sheet-handle" />}
        {title && <div data-testid="sheet-title">{title}</div>}
        <div data-testid="sheet-content" className={bodyClassName} style={bodyStyle}>
          {children}
        </div>
        {footer != null && (
          <div data-testid="sheet-footer" className={footerClassName} style={footerStyle}>
            {footer}
          </div>
        )}
      </div>
    );
  };
  MockSheet.displayName = 'Sheet';

  return { Sheet: MockSheet };
});

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

import { AdaptiveOverlay } from '../';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setDeviceClass(deviceClass: 'phone' | 'tablet' | 'desktop') {
  mockResponsive.deviceClass = deviceClass;
  mockResponsive.isPhone = deviceClass === 'phone';
  mockResponsive.isTablet = deviceClass === 'tablet';
  mockResponsive.isDesktop = deviceClass === 'desktop';
  mockResponsive.isPhoneOrTablet = deviceClass === 'phone' || deviceClass === 'tablet';
  mockResponsive.isTabletOrDesktop = deviceClass === 'tablet' || deviceClass === 'desktop';
  mockResponsive.isTouchDevice = deviceClass === 'phone';
  mockResponsive.pointer = deviceClass === 'phone' ? 'coarse' : 'fine';
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AdaptiveOverlay', () => {
  beforeEach(() => {
    setDeviceClass('desktop');
  });

  // -----------------------------------------------------------------------
  // Visibility
  // -----------------------------------------------------------------------

  it('does not render when closed', () => {
    render(
      <AdaptiveOverlay open={false} onClose={() => {}}>
        Content
      </AdaptiveOverlay>
    );
    expect(screen.queryByTestId('adaptive-overlay')).not.toBeInTheDocument();
  });

  it('renders when open', () => {
    render(
      <AdaptiveOverlay open={true} onClose={() => {}}>
        Content
      </AdaptiveOverlay>
    );
    expect(screen.getByTestId('adaptive-overlay')).toBeInTheDocument();
  });

  // -----------------------------------------------------------------------
  // Auto mode: device class detection
  // -----------------------------------------------------------------------

  describe('auto mode (default)', () => {
    it('renders as modal on desktop', () => {
      setDeviceClass('desktop');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}}>
          Desktop content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-mode', 'modal');
    });

    it('renders as drawer on tablet', () => {
      setDeviceClass('tablet');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}}>
          Tablet content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-mode', 'drawer');
    });

    it('renders as sheet on phone', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}}>
          Phone content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-mode', 'sheet');
    });
  });

  // -----------------------------------------------------------------------
  // Forced mode
  // -----------------------------------------------------------------------

  describe('forced mode', () => {
    it('renders as modal when mode="modal" regardless of device', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} mode="modal">
          Forced modal
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-mode', 'modal');
    });

    it('renders as drawer when mode="drawer" regardless of device', () => {
      setDeviceClass('desktop');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} mode="drawer">
          Forced drawer
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-mode', 'drawer');
    });

    it('renders as sheet when mode="sheet" regardless of device', () => {
      setDeviceClass('desktop');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} mode="sheet">
          Forced sheet
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-mode', 'sheet');
    });
  });

  // -----------------------------------------------------------------------
  // Close interactions
  // -----------------------------------------------------------------------

  describe('close behavior', () => {
    it('calls onClose when modal backdrop is clicked', () => {
      setDeviceClass('desktop');
      const onClose = vi.fn();
      render(
        <AdaptiveOverlay open={true} onClose={onClose}>
          Content
        </AdaptiveOverlay>
      );
      fireEvent.click(screen.getByTestId('modal-backdrop'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when drawer backdrop is clicked', () => {
      setDeviceClass('tablet');
      const onClose = vi.fn();
      render(
        <AdaptiveOverlay open={true} onClose={onClose}>
          Content
        </AdaptiveOverlay>
      );
      fireEvent.click(screen.getByTestId('drawer-backdrop'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when sheet overlay is clicked', () => {
      setDeviceClass('phone');
      const onClose = vi.fn();
      render(
        <AdaptiveOverlay open={true} onClose={onClose}>
          Content
        </AdaptiveOverlay>
      );
      fireEvent.click(screen.getByTestId('sheet-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('supports the controlled onOpenChange API without a legacy onClose handler', () => {
      setDeviceClass('phone');
      const onOpenChange = vi.fn();
      render(
        <AdaptiveOverlay open onOpenChange={onOpenChange}>
          Content
        </AdaptiveOverlay>
      );

      fireEvent.click(screen.getByTestId('sheet-overlay'));
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('notifies each close API exactly once when both are provided', () => {
      setDeviceClass('phone');
      const onClose = vi.fn();
      const onOpenChange = vi.fn();
      render(
        <AdaptiveOverlay open onClose={onClose} onOpenChange={onOpenChange}>
          Content
        </AdaptiveOverlay>
      );

      fireEvent.click(screen.getByTestId('sheet-overlay'));
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledTimes(1);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  // -----------------------------------------------------------------------
  // Title / Footer
  // -----------------------------------------------------------------------

  describe('title and footer', () => {
    it('renders title in modal mode', () => {
      setDeviceClass('desktop');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} title="My Title">
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('modal-title')).toHaveTextContent('My Title');
    });

    it('renders title in drawer mode', () => {
      setDeviceClass('tablet');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} title="Drawer Title">
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('drawer-title')).toHaveTextContent('Drawer Title');
    });

    it('renders title in sheet mode', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} title="Sheet Title">
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('sheet-title')).toHaveTextContent('Sheet Title');
    });

    it('accepts rich title content', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay
          open
          onOpenChange={() => {}}
          title={<span data-testid="rich-title">Filter candidates</span>}
        >
          Content
        </AdaptiveOverlay>
      );

      expect(screen.getByTestId('rich-title')).toHaveTextContent('Filter candidates');
    });

    it('renders footer in modal mode', () => {
      setDeviceClass('desktop');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} footer={<button>Save</button>}>
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('renders footer in drawer mode', () => {
      setDeviceClass('tablet');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} footer={<button>Save</button>}>
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('drawer-footer')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('keeps the sheet footer outside its body hook', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay open onOpenChange={() => {}} footer={<button>Apply</button>}>
          Content
        </AdaptiveOverlay>
      );

      expect(screen.getByTestId('sheet-content')).not.toContainElement(
        screen.getByTestId('sheet-footer')
      );
    });
  });

  // -----------------------------------------------------------------------
  // Drawer: placement and width
  // -----------------------------------------------------------------------

  describe('drawer layout', () => {
    it('uses right placement for tablet', () => {
      setDeviceClass('tablet');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}}>
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-placement', 'right');
    });

    it('passes width to drawer', () => {
      setDeviceClass('tablet');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}} width={600}>
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-width', '600');
    });
  });

  describe('modal layout', () => {
    it('normalizes numeric width on desktop and lets explicit surface styles override it', () => {
      setDeviceClass('desktop');
      const { rerender } = render(
        <AdaptiveOverlay open onOpenChange={() => {}} width={640}>
          Content
        </AdaptiveOverlay>
      );

      expect(screen.getByTestId('adaptive-overlay')).toHaveStyle({ width: '640px' });

      rerender(
        <AdaptiveOverlay
          open
          onOpenChange={() => {}}
          width={640}
          surfaceStyle={{ width: '42rem' }}
        >
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveStyle({ width: '42rem' });
    });

    it('does not pin a forced phone modal to the desktop width', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay open onOpenChange={() => {}} mode="modal" width={640}>
          Content
        </AdaptiveOverlay>
      );

      expect(screen.getByTestId('adaptive-overlay').style.width).toBe('');
    });
  });

  // -----------------------------------------------------------------------
  // Sheet: bottom side and handle
  // -----------------------------------------------------------------------

  describe('sheet layout', () => {
    it('uses bottom side for phone', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}}>
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('adaptive-overlay')).toHaveAttribute('data-side', 'bottom');
    });

    it('shows drag handle on phone', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay open={true} onClose={() => {}}>
          Content
        </AdaptiveOverlay>
      );
      expect(screen.getByTestId('sheet-handle')).toBeInTheDocument();
    });

    it('forwards engine, dialog identity, accessible name, and anatomy hooks', () => {
      setDeviceClass('phone');
      render(
        <AdaptiveOverlay
          engine="rustic"
          open
          onOpenChange={() => {}}
          id="advanced-filters"
          data-testid="advanced-filter-sheet"
          aria-label="Advanced filters"
          surfaceClassName="surface-hook"
          bodyClassName="body-hook"
          footerClassName="footer-hook"
          footer={<button>Done</button>}
        >
          Content
        </AdaptiveOverlay>
      );

      const dialog = screen.getByTestId('advanced-filter-sheet');
      expect(dialog).toHaveAttribute('id', 'advanced-filters');
      expect(dialog).toHaveAccessibleName('Advanced filters');
      expect(dialog).toHaveAttribute('data-engine', 'rustic');
      expect(dialog).toHaveClass('surface-hook');
      expect(screen.getByTestId('sheet-content')).toHaveClass('body-hook');
      expect(screen.getByTestId('sheet-footer')).toHaveClass(
        'rottay-adaptive-overlay-footer',
        'footer-hook'
      );
    });
  });

  // -----------------------------------------------------------------------
  // Accessibility
  // -----------------------------------------------------------------------

  describe('accessibility', () => {
    it('has dialog role in all modes', () => {
      for (const device of ['desktop', 'tablet', 'phone'] as const) {
        setDeviceClass(device);
        const { unmount } = render(
          <AdaptiveOverlay open={true} onClose={() => {}}>
            Content
          </AdaptiveOverlay>
        );
        expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
        unmount();
      }
    });
  });
});
