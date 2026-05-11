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
  const MockModalBody = ({ children }: any) => (
    <div data-testid="modal-body">{children}</div>
  );
  MockModalBody.displayName = 'ModalBody';

  const MockModal = ({
    open,
    onClose,
    children,
    title,
    footer,
    'data-testid': testId,
  }: any) => {
    if (!open) return null;
    return (
      <div data-testid={testId ?? 'adaptive-overlay'} data-mode="modal" role="dialog" aria-modal="true">
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
    'data-testid': testId,
  }: any) => {
    if (!open) return null;
    return (
      <div
        data-testid={testId ?? 'adaptive-overlay'}
        data-mode="drawer"
        data-placement={placement}
        data-width={width}
        role="dialog"
        aria-modal="true"
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
  }: any) => {
    if (!open) return null;
    return (
      <div
        data-testid="adaptive-overlay"
        data-mode="sheet"
        data-side={side}
        role="dialog"
        aria-modal="true"
      >
        {showOverlay !== false && (
          <div
            data-testid="sheet-overlay"
            onClick={() => onOpenChange(false)}
          />
        )}
        {showHandle && <div data-testid="sheet-handle" />}
        {title && <div data-testid="sheet-title">{title}</div>}
        <div data-testid="sheet-content">{children}</div>
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
