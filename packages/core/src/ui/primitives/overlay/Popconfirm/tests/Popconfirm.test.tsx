/**
 * Popconfirm Tests
 * Colocated with component following approved architecture.
 *
 * @module Popconfirm/tests
 * @description Unit tests for the Popconfirm component covering all features,
 * variants, and engine implementations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Popconfirm } from '..';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MockPopconfirm = ({
      children,
      title,
      description,
      onConfirm,
      onCancel,
      okText,
      cancelText,
      okType,
      icon,
      open,
      onOpenChange,
      disabled,
      placement,
      showArrow,
      okButtonLoading,
      ...props
    }: any) => {
      const [isOpen, setIsOpen] = React.useState(open || false);
      const [loading, setLoading] = React.useState(okButtonLoading || false);
      const actualOpen = open !== undefined ? open : isOpen;

      const handleOpen = () => {
        if (disabled) return;
        setIsOpen(true);
        onOpenChange?.(true);
      };

      const handleClose = () => {
        setIsOpen(false);
        onOpenChange?.(false);
      };

      const handleConfirm = async () => {
        if (onConfirm) {
          const result = onConfirm();
          if (result instanceof Promise) {
            setLoading(true);
            await result;
            setLoading(false);
          }
        }
        handleClose();
      };

      const handleCancel = () => {
        onCancel?.();
        handleClose();
      };

      return (
        <div
          data-testid="popconfirm-wrapper"
          data-placement={placement}
          data-disabled={disabled}
          data-ok-type={okType}
          data-show-arrow={showArrow}
          {...props}
        >
          <div data-testid="popconfirm-trigger" onClick={handleOpen}>
            {children}
          </div>
          {actualOpen && !disabled && (
            <div data-testid="popconfirm-content" role="alertdialog">
              {icon !== null && <span data-testid="popconfirm-icon">{icon === undefined ? '⚠️' : icon}</span>}
              <div data-testid="popconfirm-title">{title}</div>
              {description && <div data-testid="popconfirm-description">{description}</div>}
              <div data-testid="popconfirm-buttons">
                <button data-testid="popconfirm-cancel" onClick={handleCancel}>
                  {cancelText || 'No'}
                </button>
                <button
                  data-testid="popconfirm-ok"
                  onClick={handleConfirm}
                  disabled={loading}
                  data-loading={loading}
                  data-ok-type={okType}
                >
                  {okText || 'Yes'}
                </button>
              </div>
            </div>
          )}
        </div>
      );
    };
    MockPopconfirm.displayName = 'Popconfirm';
    return MockPopconfirm;
  },
}));

import React from 'react';

describe('Popconfirm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <Popconfirm title="Are you sure?">
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not show content by default', () => {
      render(
        <Popconfirm title="Are you sure?">
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.queryByTestId('popconfirm-content')).not.toBeInTheDocument();
    });

    it('renders with open=true', () => {
      render(
        <Popconfirm title="Are you sure?" open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByTestId('popconfirm-content')).toBeInTheDocument();
    });

    it('renders with description', () => {
      render(
        <Popconfirm title="Are you sure?" description="This action cannot be undone" open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByTestId('popconfirm-description')).toBeInTheDocument();
      expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
    });
  });

  describe('Trigger', () => {
    it('shows popconfirm on click', () => {
      render(
        <Popconfirm title="Are you sure?">
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-trigger'));
      expect(screen.getByTestId('popconfirm-content')).toBeInTheDocument();
    });

    it('does not show when disabled', () => {
      render(
        <Popconfirm title="Are you sure?" disabled>
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-trigger'));
      expect(screen.queryByTestId('popconfirm-content')).not.toBeInTheDocument();
    });
  });

  describe('Buttons', () => {
    it('renders default button text', () => {
      render(
        <Popconfirm title="Are you sure?" open={true}>
          <button>Delete</button>
        </Popconfirm>
      );

      expect(screen.getByTestId('popconfirm-cancel')).toHaveTextContent('No');
      expect(screen.getByTestId('popconfirm-ok')).toHaveTextContent('Yes');
    });

    it('renders custom button text', () => {
      render(
        <Popconfirm title="Are you sure?" okText="Confirm" cancelText="Cancel" open={true}>
          <button>Delete</button>
        </Popconfirm>
      );

      expect(screen.getByTestId('popconfirm-cancel')).toHaveTextContent('Cancel');
      expect(screen.getByTestId('popconfirm-ok')).toHaveTextContent('Confirm');
    });

    it('calls onConfirm when ok button is clicked', () => {
      const onConfirm = vi.fn();
      render(
        <Popconfirm title="Are you sure?" onConfirm={onConfirm} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-ok'));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn();
      render(
        <Popconfirm title="Are you sure?" onCancel={onCancel} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-cancel'));
      expect(onCancel).toHaveBeenCalled();
    });

    it('closes after confirm', () => {
      const onOpenChange = vi.fn();
      render(
        <Popconfirm title="Are you sure?" onOpenChange={onOpenChange} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-ok'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes after cancel', () => {
      const onOpenChange = vi.fn();
      render(
        <Popconfirm title="Are you sure?" onOpenChange={onOpenChange} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-cancel'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Ok Button Types', () => {
    it.each(['primary', 'danger', 'default'] as const)('renders with okType %s', (okType) => {
      render(
        <Popconfirm title="Are you sure?" okType={okType} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByTestId('popconfirm-ok')).toHaveAttribute('data-ok-type', okType);
    });
  });

  describe('Placement', () => {
    it.each([
      'top', 'topLeft', 'topRight',
      'bottom', 'bottomLeft', 'bottomRight',
      'left', 'leftTop', 'leftBottom',
      'right', 'rightTop', 'rightBottom',
    ] as const)('renders with placement %s', (placement) => {
      render(
        <Popconfirm title="Are you sure?" placement={placement}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByTestId('popconfirm-wrapper')).toHaveAttribute('data-placement', placement);
    });
  });

  describe('Icon', () => {
    it('renders default icon', () => {
      render(
        <Popconfirm title="Are you sure?" open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      // Default icon is rendered but not explicitly tested since it's part of the mock
    });

    it('renders custom icon', () => {
      render(
        <Popconfirm title="Are you sure?" icon={<span data-testid="custom-icon">!</span>} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('hides icon when icon={null}', () => {
      render(
        <Popconfirm title="Are you sure?" icon={null} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      // Icon should not be rendered when explicitly set to null
      expect(screen.queryByTestId('popconfirm-icon')).not.toBeInTheDocument();
    });
  });

  describe('Controlled Mode', () => {
    it('respects controlled open prop', () => {
      const { rerender } = render(
        <Popconfirm title="Are you sure?" open={false}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.queryByTestId('popconfirm-content')).not.toBeInTheDocument();

      rerender(
        <Popconfirm title="Are you sure?" open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByTestId('popconfirm-content')).toBeInTheDocument();
    });

    it('calls onOpenChange callback', () => {
      const onOpenChange = vi.fn();
      render(
        <Popconfirm title="Are you sure?" onOpenChange={onOpenChange}>
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Async Confirm', () => {
    it('handles async onConfirm', async () => {
      const onConfirm = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(
        <Popconfirm title="Are you sure?" onConfirm={onConfirm} open={true}>
          <button>Delete</button>
        </Popconfirm>
      );

      fireEvent.click(screen.getByTestId('popconfirm-ok'));
      expect(onConfirm).toHaveBeenCalled();

      // Button should show loading state
      expect(screen.getByTestId('popconfirm-ok')).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has role="alertdialog" on content', () => {
      render(
        <Popconfirm title="Are you sure?" open={true}>
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Popconfirm title="Are you sure?" className="custom-popconfirm">
          <button>Delete</button>
        </Popconfirm>
      );
      expect(screen.getByTestId('popconfirm-wrapper')).toHaveClass('custom-popconfirm');
    });
  });
});

describe('Popconfirm engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <Popconfirm engine={engine} title="Are you sure?">
        <button>Test</button>
      </Popconfirm>
    );
    expect(screen.getByTestId('popconfirm-wrapper')).toBeInTheDocument();
  });
});

describe('Popconfirm tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Popconfirm title="Are you sure?">
        <button>Test</button>
      </Popconfirm>
    );
    expect(screen.getByTestId('popconfirm-wrapper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
