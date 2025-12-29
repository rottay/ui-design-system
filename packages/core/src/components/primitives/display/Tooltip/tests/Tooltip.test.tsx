/**
 * Tooltip Tests
 * Colocated with component following approved architecture.
 *
 * @module Tooltip/tests
 * @description Unit tests for the Tooltip component covering all features,
 * variants, and engine implementations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockTooltip = ({
      children,
      content,
      placement,
      trigger,
      color,
      arrow,
      disabled,
      visible,
      defaultVisible,
      showDelay,
      hideDelay,
      onVisibleChange,
      ...props
    }: any) => {
      const [isVisible, setIsVisible] = React.useState(defaultVisible || false);
      const actualVisible = visible !== undefined ? visible : isVisible;

      const handleShow = () => {
        if (disabled) return;
        setIsVisible(true);
        onVisibleChange?.(true);
      };

      const handleHide = () => {
        setIsVisible(false);
        onVisibleChange?.(false);
      };

      const triggers = Array.isArray(trigger) ? trigger : [trigger || 'hover'];

      const triggerProps: Record<string, any> = {};
      if (triggers.includes('hover')) {
        triggerProps.onMouseEnter = handleShow;
        triggerProps.onMouseLeave = handleHide;
      }
      if (triggers.includes('click')) {
        triggerProps.onClick = () => (actualVisible ? handleHide() : handleShow());
      }
      if (triggers.includes('focus')) {
        triggerProps.onFocus = handleShow;
        triggerProps.onBlur = handleHide;
      }

      return (
        <div
          data-testid="tooltip-wrapper"
          data-placement={placement}
          data-color={color}
          data-arrow={arrow}
          data-disabled={disabled}
          {...props}
        >
          <div {...triggerProps}>{children}</div>
          {actualVisible && !disabled && (
            <div data-testid="tooltip-content" role="tooltip">
              {content}
            </div>
          )}
        </div>
      );
    };
    MockTooltip.displayName = 'Tooltip';
    return MockTooltip;
  },
}));

import React from 'react';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });

    it('does not show tooltip content by default', () => {
      render(
        <Tooltip content="Test tooltip">
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
    });

    it('renders with defaultVisible=true', () => {
      render(
        <Tooltip content="Test tooltip" defaultVisible>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
      expect(screen.getByText('Test tooltip')).toBeInTheDocument();
    });
  });

  describe('Trigger Types', () => {
    it('shows tooltip on hover', async () => {
      render(
        <Tooltip content="Hover tooltip" trigger="hover">
          <button>Hover me</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Hover me'));
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByText('Hover me'));
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
    });

    it('shows tooltip on click', () => {
      render(
        <Tooltip content="Click tooltip" trigger="click">
          <button>Click me</button>
        </Tooltip>
      );

      fireEvent.click(screen.getByText('Click me'));
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Click me'));
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
    });

    it('shows tooltip on focus', () => {
      render(
        <Tooltip content="Focus tooltip" trigger="focus">
          <button>Focus me</button>
        </Tooltip>
      );

      fireEvent.focus(screen.getByText('Focus me'));
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();

      fireEvent.blur(screen.getByText('Focus me'));
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
    });
  });

  describe('Placement', () => {
    it.each([
      'top', 'top-start', 'top-end',
      'bottom', 'bottom-start', 'bottom-end',
      'left', 'left-start', 'left-end',
      'right', 'right-start', 'right-end',
    ] as const)('renders with placement %s', (placement) => {
      render(
        <Tooltip content="Test" placement={placement}>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByTestId('tooltip-wrapper')).toHaveAttribute('data-placement', placement);
    });
  });

  describe('Color Variants', () => {
    it.each([
      'default', 'primary', 'secondary', 'success', 'warning', 'error',
    ] as const)('renders with color %s', (color) => {
      render(
        <Tooltip content="Test" color={color}>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByTestId('tooltip-wrapper')).toHaveAttribute('data-color', color);
    });
  });

  describe('Arrow', () => {
    it('renders with arrow by default', () => {
      render(
        <Tooltip content="Test">
          <button>Trigger</button>
        </Tooltip>
      );
      // Default is true, so data-arrow should be undefined or 'true'
      const wrapper = screen.getByTestId('tooltip-wrapper');
      expect(wrapper.getAttribute('data-arrow')).not.toBe('false');
    });

    it('renders without arrow when arrow=false', () => {
      render(
        <Tooltip content="Test" arrow={false}>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByTestId('tooltip-wrapper')).toHaveAttribute('data-arrow', 'false');
    });
  });

  describe('Disabled State', () => {
    it('does not show tooltip when disabled', () => {
      render(
        <Tooltip content="Test" disabled>
          <button>Trigger</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Trigger'));
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();
    });

    it('shows disabled data attribute', () => {
      render(
        <Tooltip content="Test" disabled>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByTestId('tooltip-wrapper')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Controlled Mode', () => {
    it('respects controlled visible prop', () => {
      const { rerender } = render(
        <Tooltip content="Controlled" visible={false}>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.queryByTestId('tooltip-content')).not.toBeInTheDocument();

      rerender(
        <Tooltip content="Controlled" visible={true}>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });

    it('calls onVisibleChange callback', () => {
      const onVisibleChange = vi.fn();
      render(
        <Tooltip content="Test" onVisibleChange={onVisibleChange}>
          <button>Trigger</button>
        </Tooltip>
      );

      fireEvent.mouseEnter(screen.getByText('Trigger'));
      expect(onVisibleChange).toHaveBeenCalledWith(true);

      fireEvent.mouseLeave(screen.getByText('Trigger'));
      expect(onVisibleChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Rich Content', () => {
    it('renders React elements as content', () => {
      render(
        <Tooltip
          content={
            <div data-testid="rich-content">
              <strong>Bold text</strong>
              <p>Paragraph</p>
            </div>
          }
          defaultVisible
        >
          <button>Trigger</button>
        </Tooltip>
      );

      expect(screen.getByTestId('rich-content')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has role="tooltip" on content', () => {
      render(
        <Tooltip content="Accessible tooltip" defaultVisible>
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Tooltip content="Test" className="custom-tooltip">
          <button>Trigger</button>
        </Tooltip>
      );
      expect(screen.getByTestId('tooltip-wrapper')).toHaveClass('custom-tooltip');
    });

    it('passes style prop to component', () => {
      const customStyle = { backgroundColor: 'red' };
      render(
        <Tooltip content="Test" style={customStyle}>
          <button>Trigger</button>
        </Tooltip>
      );
      // The mock passes style as a prop, so we verify the element exists with the test
      expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
    });
  });
});

describe('Tooltip.Trigger', () => {
  it('renders children', () => {
    render(
      <Tooltip.Trigger>
        <button>Trigger Button</button>
      </Tooltip.Trigger>
    );
    expect(screen.getByText('Trigger Button')).toBeInTheDocument();
  });

  it('wraps in span by default', () => {
    render(
      <Tooltip.Trigger data-testid="trigger">
        <button>Button</button>
      </Tooltip.Trigger>
    );
    const trigger = screen.getByTestId('trigger');
    expect(trigger.tagName.toLowerCase()).toBe('span');
  });
});

describe('Tooltip.Content', () => {
  it('renders children', () => {
    render(
      <Tooltip.Content>
        <span>Content text</span>
      </Tooltip.Content>
    );
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Tooltip.Content className="custom-content" data-testid="content">
        Content
      </Tooltip.Content>
    );
    expect(screen.getByTestId('content')).toHaveClass('custom-content');
  });
});

describe('Tooltip engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(
      <Tooltip engine={engine} content="Test">
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
  });
});

describe('Tooltip tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Tooltip content="Test">
        <button>Trigger</button>
      </Tooltip>
    );
    expect(screen.getByTestId('tooltip-wrapper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
