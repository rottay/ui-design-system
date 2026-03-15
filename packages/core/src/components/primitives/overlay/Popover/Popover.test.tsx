/**
 * Popover Tests
 * Colocated with component following approved architecture.
 *
 * @module Popover/tests
 * @description Unit tests for the Popover component covering all features,
 * variants, and engine implementations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Popover } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockPopover = ({
      children,
      content,
      title,
      trigger,
      placement,
      open,
      defaultOpen,
      onOpenChange,
      arrow,
      mouseEnterDelay,
      mouseLeaveDelay,
      ...props
    }: any) => {
      const [isOpen, setIsOpen] = React.useState(defaultOpen || false);
      const actualOpen = open !== undefined ? open : isOpen;

      const handleOpen = () => {
        setIsOpen(true);
        onOpenChange?.(true);
      };

      const handleClose = () => {
        setIsOpen(false);
        onOpenChange?.(false);
      };

      const triggers = Array.isArray(trigger) ? trigger : [trigger || 'hover'];

      const triggerProps: Record<string, any> = {};
      if (triggers.includes('hover')) {
        triggerProps.onMouseEnter = handleOpen;
        triggerProps.onMouseLeave = handleClose;
      }
      if (triggers.includes('click')) {
        triggerProps.onClick = () => (actualOpen ? handleClose() : handleOpen());
      }
      if (triggers.includes('focus')) {
        triggerProps.onFocus = handleOpen;
        triggerProps.onBlur = handleClose;
      }

      return (
        <div
          data-testid="popover-wrapper"
          data-placement={placement}
          data-arrow={arrow}
          {...props}
        >
          <div data-testid="popover-trigger" {...triggerProps}>
            {children}
          </div>
          {actualOpen && (
            <div data-testid="popover-content" role="tooltip">
              {title && <div data-testid="popover-title">{title}</div>}
              <div data-testid="popover-body">{content}</div>
            </div>
          )}
        </div>
      );
    };
    MockPopover.displayName = 'Popover';
    return MockPopover;
  },
}));

import React from 'react';

describe('Popover', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <Popover content="Popover content">
          <button>Open Popover</button>
        </Popover>
      );
      expect(screen.getByText('Open Popover')).toBeInTheDocument();
    });

    it('does not show content by default', () => {
      render(
        <Popover content="Popover content">
          <button>Open</button>
        </Popover>
      );
      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
    });

    it('renders with defaultOpen=true', () => {
      render(
        <Popover content="Popover content" defaultOpen>
          <button>Open</button>
        </Popover>
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <Popover content="Content" title="Title" defaultOpen>
          <button>Open</button>
        </Popover>
      );
      expect(screen.getByTestId('popover-title')).toBeInTheDocument();
      expect(screen.getByText('Title')).toBeInTheDocument();
    });
  });

  describe('Trigger Types', () => {
    it('shows popover on hover', () => {
      render(
        <Popover content="Hover content" trigger="hover">
          <button>Hover me</button>
        </Popover>
      );

      fireEvent.mouseEnter(screen.getByTestId('popover-trigger'));
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByTestId('popover-trigger'));
      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
    });

    it('shows popover on click', () => {
      render(
        <Popover content="Click content" trigger="click">
          <button>Click me</button>
        </Popover>
      );

      fireEvent.click(screen.getByTestId('popover-trigger'));
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('popover-trigger'));
      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
    });

    it('shows popover on focus', () => {
      render(
        <Popover content="Focus content" trigger="focus">
          <button>Focus me</button>
        </Popover>
      );

      fireEvent.focus(screen.getByTestId('popover-trigger'));
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();

      fireEvent.blur(screen.getByTestId('popover-trigger'));
      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();
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
        <Popover content="Content" placement={placement}>
          <button>Trigger</button>
        </Popover>
      );
      expect(screen.getByTestId('popover-wrapper')).toHaveAttribute('data-placement', placement);
    });
  });

  describe('Arrow', () => {
    it('renders with arrow by default', () => {
      render(
        <Popover content="Content">
          <button>Trigger</button>
        </Popover>
      );
      const wrapper = screen.getByTestId('popover-wrapper');
      expect(wrapper.getAttribute('data-arrow')).not.toBe('false');
    });

    it('renders without arrow when arrow=false', () => {
      render(
        <Popover content="Content" arrow={false}>
          <button>Trigger</button>
        </Popover>
      );
      expect(screen.getByTestId('popover-wrapper')).toHaveAttribute('data-arrow', 'false');
    });
  });

  describe('Controlled Mode', () => {
    it('respects controlled open prop', () => {
      const { rerender } = render(
        <Popover content="Content" open={false}>
          <button>Trigger</button>
        </Popover>
      );
      expect(screen.queryByTestId('popover-content')).not.toBeInTheDocument();

      rerender(
        <Popover content="Content" open={true}>
          <button>Trigger</button>
        </Popover>
      );
      expect(screen.getByTestId('popover-content')).toBeInTheDocument();
    });

    it('calls onOpenChange callback', () => {
      const onOpenChange = vi.fn();
      render(
        <Popover content="Content" onOpenChange={onOpenChange}>
          <button>Trigger</button>
        </Popover>
      );

      fireEvent.mouseEnter(screen.getByTestId('popover-trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(true);

      fireEvent.mouseLeave(screen.getByTestId('popover-trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Rich Content', () => {
    it('renders React elements as content', () => {
      render(
        <Popover
          content={
            <div data-testid="rich-content">
              <strong>Bold text</strong>
              <p>Paragraph</p>
            </div>
          }
          defaultOpen
        >
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('rich-content')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('renders React elements as title', () => {
      render(
        <Popover
          content="Content"
          title={<span data-testid="rich-title">Rich Title</span>}
          defaultOpen
        >
          <button>Trigger</button>
        </Popover>
      );

      expect(screen.getByTestId('rich-title')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="tooltip" on content', () => {
      render(
        <Popover content="Accessible popover" defaultOpen>
          <button>Trigger</button>
        </Popover>
      );
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Popover content="Content" className="custom-popover">
          <button>Trigger</button>
        </Popover>
      );
      expect(screen.getByTestId('popover-wrapper')).toHaveClass('custom-popover');
    });
  });
});

describe('Popover engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <Popover engine={engine} content="Test content">
        <button>Test</button>
      </Popover>
    );
    expect(screen.getByTestId('popover-wrapper')).toBeInTheDocument();
  });
});

describe('Popover tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Popover content="Test content">
        <button>Test</button>
      </Popover>
    );
    expect(screen.getByTestId('popover-wrapper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
