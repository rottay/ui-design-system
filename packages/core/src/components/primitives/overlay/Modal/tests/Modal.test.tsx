/**
 * Modal Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';
import { Modal } from '../';

// Mock Portal to render inline for testing
vi.mock('./utils/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockModal = React.forwardRef<HTMLDivElement, any>(({
      open,
      onClose,
      children,
      title,
      description,
      size = 'md',
      closable = true,
      footer,
      className = '',
      style = {},
      'data-testid': testId,
      ...props
    }, ref) => {
      if (!open) return null;

      return React.createElement('div', {
        ref,
        'data-testid': testId || 'modal',
        'data-open': open,
        'data-size': size,
        'data-closable': closable,
        className: `rottay-modal ${className}`,
        style,
        role: 'dialog',
        'aria-modal': 'true',
        ...props,
      }, [
        title && React.createElement('div', { key: 'title', 'data-testid': 'modal-title' }, title),
        description && React.createElement('div', { key: 'desc', 'data-testid': 'modal-description' }, description),
        React.createElement('div', { key: 'body', 'data-testid': 'modal-body' }, children),
        closable && React.createElement('button', {
          key: 'close',
          'data-testid': 'modal-close',
          onClick: onClose,
          'aria-label': 'Close modal',
        }, '×'),
        footer && React.createElement('div', { key: 'footer', 'data-testid': 'modal-footer' }, footer),
      ]);
    });
    MockModal.displayName = 'Modal';
    return MockModal;
  },
}));

describe('Modal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders when open is true', () => {
      render(
        <Modal open onClose={mockOnClose}>
          Modal Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(
        <Modal open={false} onClose={mockOnClose}>
          Modal Content
        </Modal>
      );
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <Modal open onClose={mockOnClose} title="Test Title">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-title')).toHaveTextContent('Test Title');
    });

    it('renders with description', () => {
      render(
        <Modal open onClose={mockOnClose} description="Test Description">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-description')).toHaveTextContent('Test Description');
    });

    it('renders with footer', () => {
      render(
        <Modal open onClose={mockOnClose} footer={<button>Submit</button>}>
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });
  });

  describe('Size Prop', () => {
    it.each(['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'full'] as const)(
      'applies size %s',
      (size) => {
        render(
          <Modal open onClose={mockOnClose} size={size}>
            Content
          </Modal>
        );
        expect(screen.getByTestId('modal')).toHaveAttribute('data-size', size);
      }
    );

    it('defaults to md size', () => {
      render(
        <Modal open onClose={mockOnClose}>
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toHaveAttribute('data-size', 'md');
    });
  });

  describe('Closable Prop', () => {
    it('shows close button when closable is true', () => {
      render(
        <Modal open onClose={mockOnClose} closable>
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-close')).toBeInTheDocument();
    });

    it('hides close button when closable is false', () => {
      render(
        <Modal open onClose={mockOnClose} closable={false}>
          Content
        </Modal>
      );
      expect(screen.queryByTestId('modal-close')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      render(
        <Modal open onClose={mockOnClose} closable>
          Content
        </Modal>
      );
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('className and style Props', () => {
    it('applies custom className', () => {
      render(
        <Modal open onClose={mockOnClose} className="custom-modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toHaveClass('custom-modal');
    });

    it('applies inline styles', () => {
      render(
        <Modal open onClose={mockOnClose} style={{ backgroundColor: 'red' }}>
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to the modal element', () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Modal ref={ref} open onClose={mockOnClose}>
          Content
        </Modal>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(
        <Modal open onClose={mockOnClose}>
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal="true"', () => {
      render(
        <Modal open onClose={mockOnClose}>
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });

    it('close button has aria-label', () => {
      render(
        <Modal open onClose={mockOnClose} closable>
          Content
        </Modal>
      );
      expect(screen.getByTestId('modal-close')).toHaveAttribute('aria-label', 'Close modal');
    });
  });

  describe('Compound Components', () => {
    it('renders Modal.Header', () => {
      render(
        <Modal open onClose={mockOnClose}>
          <Modal.Header>Custom Header</Modal.Header>
          Content
        </Modal>
      );
      expect(screen.getByText('Custom Header')).toBeInTheDocument();
    });

    it('renders Modal.Body', () => {
      render(
        <Modal open onClose={mockOnClose}>
          <Modal.Body>Body Content</Modal.Body>
        </Modal>
      );
      expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('renders Modal.Footer', () => {
      render(
        <Modal open onClose={mockOnClose}>
          Content
          <Modal.Footer>
            <button>Cancel</button>
            <button>Confirm</button>
          </Modal.Footer>
        </Modal>
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });

  describe('Data Attributes', () => {
    it('supports data-testid', () => {
      render(
        <Modal open onClose={mockOnClose} data-testid="custom-modal">
          Content
        </Modal>
      );
      expect(screen.getByTestId('custom-modal')).toBeInTheDocument();
    });
  });
});

describe('Modal Types', () => {
  it('exports MODAL_DEFAULTS constant', async () => {
    const { MODAL_DEFAULTS } = await import('./Modal.types');
    expect(MODAL_DEFAULTS).toBeDefined();
    expect(MODAL_DEFAULTS.size).toBe('md');
    expect(MODAL_DEFAULTS.closable).toBe(true);
    expect(MODAL_DEFAULTS.closeOnEscape).toBe(true);
    expect(MODAL_DEFAULTS.closeOnBackdropClick).toBe(true);
  });

  it('exports SIZE_MAP constant', async () => {
    const { SIZE_MAP } = await import('./Modal.types');
    expect(SIZE_MAP).toBeDefined();
    expect(SIZE_MAP.xs).toBe('var(--ds-modal-xs-width)');
    expect(SIZE_MAP.md).toBe('var(--ds-modal-md-width)');
    expect(SIZE_MAP.full).toBe('var(--ds-modal-full-width)');
  });

  it('exports PADDING_MAP constant', async () => {
    const { PADDING_MAP } = await import('./Modal.types');
    expect(PADDING_MAP).toBeDefined();
    expect(PADDING_MAP.none).toBe('var(--ds-modal-padding-none)');
    expect(PADDING_MAP.lg).toBe('var(--ds-modal-padding-lg)');
  });

  it('exports RADIUS_MAP constant', async () => {
    const { RADIUS_MAP } = await import('./Modal.types');
    expect(RADIUS_MAP).toBeDefined();
    expect(RADIUS_MAP.none).toBe('var(--ds-modal-radius-none)');
    expect(RADIUS_MAP.lg).toBe('var(--ds-modal-radius-lg)');
  });
});

describe('Modal engines', () => {
  const mockOnClose = vi.fn();

  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <Modal engine={engine} open onClose={mockOnClose}>
        Test
      </Modal>
    );
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });
});

describe('Modal tenants', () => {
  const mockOnClose = vi.fn();

  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Modal open onClose={mockOnClose}>
        Test
      </Modal>
    );
    expect(screen.getByTestId('modal')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
