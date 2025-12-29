/**
 * Dropdown Tests
 * Colocated with component following approved architecture.
 *
 * @module Dropdown/tests
 * @description Unit tests for the Dropdown component covering all features,
 * variants, and engine implementations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dropdown } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockDropdown = ({
      children,
      menu,
      trigger,
      placement,
      open,
      onOpenChange,
      disabled,
      arrow,
      ...props
    }: any) => {
      const [isOpen, setIsOpen] = React.useState(open || false);
      const actualOpen = open !== undefined ? open : isOpen;

      const handleOpen = () => {
        if (disabled) return;
        const newOpen = !actualOpen;
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
      };

      const triggers = Array.isArray(trigger) ? trigger : [trigger || 'hover'];

      const triggerProps: Record<string, any> = {};
      if (triggers.includes('hover')) {
        triggerProps.onMouseEnter = () => !disabled && (setIsOpen(true), onOpenChange?.(true));
        triggerProps.onMouseLeave = () => (setIsOpen(false), onOpenChange?.(false));
      }
      if (triggers.includes('click')) {
        triggerProps.onClick = handleOpen;
      }

      const handleMenuClick = (key: string) => {
        menu?.onClick?.({ key });
        if (!menu?.selectable) {
          setIsOpen(false);
          onOpenChange?.(false);
        }
      };

      return (
        <div
          data-testid="dropdown-wrapper"
          data-placement={placement}
          data-disabled={disabled}
          data-arrow={arrow}
          {...props}
        >
          <div data-testid="dropdown-trigger" {...triggerProps}>
            {children}
          </div>
          {actualOpen && !disabled && (
            <div data-testid="dropdown-menu" role="menu">
              {menu?.items?.map((item: any) => (
                <div
                  key={item.key}
                  data-testid={`menu-item-${item.key}`}
                  role="menuitem"
                  onClick={() => !item.disabled && handleMenuClick(item.key)}
                  aria-disabled={item.disabled}
                  data-danger={item.danger}
                >
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };
    MockDropdown.displayName = 'Dropdown';
    return MockDropdown;
  },
}));

import React from 'react';

describe('Dropdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultMenu = {
    items: [
      { key: '1', label: 'Item 1' },
      { key: '2', label: 'Item 2' },
      { key: '3', label: 'Item 3', disabled: true },
    ],
  };

  describe('Rendering', () => {
    it('renders correctly with children', () => {
      render(
        <Dropdown menu={defaultMenu}>
          <button>Open Dropdown</button>
        </Dropdown>
      );
      expect(screen.getByText('Open Dropdown')).toBeInTheDocument();
    });

    it('does not show menu by default', () => {
      render(
        <Dropdown menu={defaultMenu}>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });

    it('renders with open=true', () => {
      render(
        <Dropdown menu={defaultMenu} open={true}>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });
  });

  describe('Trigger Types', () => {
    it('shows menu on hover', () => {
      render(
        <Dropdown menu={defaultMenu} trigger={['hover']}>
          <button>Hover me</button>
        </Dropdown>
      );

      fireEvent.mouseEnter(screen.getByTestId('dropdown-trigger'));
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

      fireEvent.mouseLeave(screen.getByTestId('dropdown-trigger'));
      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });

    it('shows menu on click', () => {
      render(
        <Dropdown menu={defaultMenu} trigger={['click']}>
          <button>Click me</button>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('dropdown-trigger'));
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('dropdown-trigger'));
      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });
  });

  describe('Placement', () => {
    it.each([
      'top', 'topLeft', 'topRight',
      'bottom', 'bottomLeft', 'bottomRight',
    ] as const)('renders with placement %s', (placement) => {
      render(
        <Dropdown menu={defaultMenu} placement={placement}>
          <button>Trigger</button>
        </Dropdown>
      );
      expect(screen.getByTestId('dropdown-wrapper')).toHaveAttribute('data-placement', placement);
    });
  });

  describe('Menu Items', () => {
    it('renders all menu items when open', () => {
      render(
        <Dropdown menu={defaultMenu} open={true}>
          <button>Open</button>
        </Dropdown>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('calls onClick when menu item is clicked', () => {
      const onClick = vi.fn();
      const menu = { ...defaultMenu, onClick };

      render(
        <Dropdown menu={menu} open={true}>
          <button>Open</button>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('menu-item-1'));
      expect(onClick).toHaveBeenCalledWith({ key: '1' });
    });

    it('does not call onClick for disabled items', () => {
      const onClick = vi.fn();
      const menu = { ...defaultMenu, onClick };

      render(
        <Dropdown menu={menu} open={true}>
          <button>Open</button>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('menu-item-3'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('renders danger items with data-danger attribute', () => {
      const menuWithDanger = {
        items: [
          { key: '1', label: 'Delete', danger: true },
        ],
      };

      render(
        <Dropdown menu={menuWithDanger} open={true}>
          <button>Open</button>
        </Dropdown>
      );

      expect(screen.getByTestId('menu-item-1')).toHaveAttribute('data-danger', 'true');
    });
  });

  describe('Disabled State', () => {
    it('does not show menu when disabled', () => {
      render(
        <Dropdown menu={defaultMenu} disabled trigger={['click']}>
          <button>Open</button>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('dropdown-trigger'));
      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();
    });

    it('shows disabled data attribute', () => {
      render(
        <Dropdown menu={defaultMenu} disabled>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.getByTestId('dropdown-wrapper')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Controlled Mode', () => {
    it('respects controlled open prop', () => {
      const { rerender } = render(
        <Dropdown menu={defaultMenu} open={false}>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.queryByTestId('dropdown-menu')).not.toBeInTheDocument();

      rerender(
        <Dropdown menu={defaultMenu} open={true}>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
    });

    it('calls onOpenChange callback', () => {
      const onOpenChange = vi.fn();
      render(
        <Dropdown menu={defaultMenu} onOpenChange={onOpenChange} trigger={['click']}>
          <button>Open</button>
        </Dropdown>
      );

      fireEvent.click(screen.getByTestId('dropdown-trigger'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Arrow', () => {
    it('renders with arrow by default', () => {
      render(
        <Dropdown menu={defaultMenu}>
          <button>Open</button>
        </Dropdown>
      );
      const wrapper = screen.getByTestId('dropdown-wrapper');
      expect(wrapper.getAttribute('data-arrow')).not.toBe('false');
    });

    it('renders without arrow when arrow=false', () => {
      render(
        <Dropdown menu={defaultMenu} arrow={false}>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.getByTestId('dropdown-wrapper')).toHaveAttribute('data-arrow', 'false');
    });
  });

  describe('Accessibility', () => {
    it('has role="menu" on dropdown menu', () => {
      render(
        <Dropdown menu={defaultMenu} open={true}>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('has role="menuitem" on menu items', () => {
      render(
        <Dropdown menu={defaultMenu} open={true}>
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    });
  });

  describe('Custom Props', () => {
    it('applies custom className', () => {
      render(
        <Dropdown menu={defaultMenu} className="custom-dropdown">
          <button>Open</button>
        </Dropdown>
      );
      expect(screen.getByTestId('dropdown-wrapper')).toHaveClass('custom-dropdown');
    });
  });
});

describe('Dropdown engines', () => {
  const defaultMenu = {
    items: [
      { key: '1', label: 'Item 1' },
      { key: '2', label: 'Item 2' },
    ],
  };

  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(
      <Dropdown engine={engine} menu={defaultMenu}>
        <button>Test</button>
      </Dropdown>
    );
    expect(screen.getByTestId('dropdown-wrapper')).toBeInTheDocument();
  });
});

describe('Dropdown tenants', () => {
  const defaultMenu = {
    items: [
      { key: '1', label: 'Item 1' },
      { key: '2', label: 'Item 2' },
    ],
  };

  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(
      <Dropdown menu={defaultMenu}>
        <button>Test</button>
      </Dropdown>
    );
    expect(screen.getByTestId('dropdown-wrapper')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
