/**
 * Menu Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Menu } from '../';

// Mock the engine factory
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockMenu = ({
      items,
      mode,
      selectedKeys,
      defaultSelectedKeys,
      openKeys,
      defaultOpenKeys,
      multiple,
      selectable,
      inlineCollapsed,
      theme,
      onClick,
      onSelect,
      onOpenChange,
      className,
      style,
    }: any) => {
      const selected = selectedKeys || defaultSelectedKeys || [];

      return (
        <nav
          data-testid="menu"
          data-mode={mode}
          data-selected={selected.join(',')}
          data-multiple={multiple}
          data-selectable={selectable}
          data-inline-collapsed={inlineCollapsed}
          data-theme={theme}
          className={className}
          style={style}
          role="menu"
        >
          {items?.map((item: any) => (
            <div
              key={item.key}
              data-testid={`menu-item-${item.key}`}
              role="menuitem"
              data-disabled={item.disabled}
              data-danger={item.danger}
              onClick={(e) => {
                if (!item.disabled) {
                  onClick?.({ key: item.key, keyPath: [item.key], domEvent: e });
                  if (selectable !== false) {
                    onSelect?.({ key: item.key, selectedKeys: [item.key], keyPath: [item.key] });
                  }
                }
              }}
            >
              {item.icon}
              {item.label}
              {item.children && (
                <div data-testid={`submenu-${item.key}`}>
                  {item.children.map((child: any) => (
                    <div key={child.key} data-testid={`menu-item-${child.key}`}>
                      {child.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      );
    };
    MockMenu.displayName = 'Menu';
    return MockMenu;
  },
}));

const defaultItems = [
  { key: '1', label: 'Option 1' },
  { key: '2', label: 'Option 2' },
  { key: '3', label: 'Option 3' },
];

describe('Menu', () => {
  it('renders correctly', () => {
    render(<Menu items={defaultItems} />);
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });

  it('renders all menu items', () => {
    render(<Menu items={defaultItems} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  describe('mode prop', () => {
    it.each(['vertical', 'horizontal', 'inline'] as const)('renders mode %s', (mode) => {
      render(<Menu items={defaultItems} mode={mode} />);
      expect(screen.getByTestId('menu')).toHaveAttribute('data-mode', mode);
    });
  });

  describe('selectedKeys prop', () => {
    it('renders with selected item', () => {
      render(<Menu items={defaultItems} selectedKeys={['2']} />);
      expect(screen.getByTestId('menu')).toHaveAttribute('data-selected', '2');
    });

    it('renders with multiple selected items', () => {
      render(<Menu items={defaultItems} selectedKeys={['1', '3']} multiple />);
      expect(screen.getByTestId('menu')).toHaveAttribute('data-selected', '1,3');
    });
  });

  describe('theme prop', () => {
    it.each(['light', 'dark'] as const)('renders theme %s', (theme) => {
      render(<Menu items={defaultItems} theme={theme} />);
      expect(screen.getByTestId('menu')).toHaveAttribute('data-theme', theme);
    });
  });

  describe('disabled items', () => {
    it('renders disabled item', () => {
      const items = [
        { key: '1', label: 'Enabled' },
        { key: '2', label: 'Disabled', disabled: true },
      ];
      render(<Menu items={items} />);
      expect(screen.getByTestId('menu-item-2')).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('danger items', () => {
    it('renders danger item', () => {
      const items = [
        { key: '1', label: 'Normal' },
        { key: '2', label: 'Delete', danger: true },
      ];
      render(<Menu items={items} />);
      expect(screen.getByTestId('menu-item-2')).toHaveAttribute('data-danger', 'true');
    });
  });

  describe('items with icons', () => {
    it('renders icons', () => {
      const items = [
        { key: '1', label: 'Home', icon: <span data-testid="icon-home">🏠</span> },
      ];
      render(<Menu items={items} />);
      expect(screen.getByTestId('icon-home')).toBeInTheDocument();
    });
  });

  describe('onClick callback', () => {
    it('calls onClick when item is clicked', () => {
      const onClick = vi.fn();
      render(<Menu items={defaultItems} onClick={onClick} />);

      fireEvent.click(screen.getByTestId('menu-item-1'));
      expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: '1' }));
    });

    it('does not call onClick for disabled items', () => {
      const onClick = vi.fn();
      const items = [{ key: '1', label: 'Disabled', disabled: true }];
      render(<Menu items={items} onClick={onClick} />);

      fireEvent.click(screen.getByTestId('menu-item-1'));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('onSelect callback', () => {
    it('calls onSelect when item is clicked', () => {
      const onSelect = vi.fn();
      render(<Menu items={defaultItems} onSelect={onSelect} />);

      fireEvent.click(screen.getByTestId('menu-item-1'));
      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: '1' }));
    });
  });

  describe('nested items', () => {
    it('renders submenu items', () => {
      const items = [
        {
          key: 'sub',
          label: 'Submenu',
          children: [
            { key: 'sub-1', label: 'Sub Item 1' },
            { key: 'sub-2', label: 'Sub Item 2' },
          ],
        },
      ];
      render(<Menu items={items} />);
      expect(screen.getByText('Submenu')).toBeInTheDocument();
      expect(screen.getByText('Sub Item 1')).toBeInTheDocument();
    });
  });

  describe('inlineCollapsed prop', () => {
    it('renders collapsed menu', () => {
      render(<Menu items={defaultItems} mode="inline" inlineCollapsed />);
      expect(screen.getByTestId('menu')).toHaveAttribute('data-inline-collapsed', 'true');
    });
  });

  it('applies custom className', () => {
    render(<Menu items={defaultItems} className="custom-menu" />);
    expect(screen.getByTestId('menu')).toHaveClass('custom-menu');
  });

  it('applies custom style', () => {
    render(<Menu items={defaultItems} style={{ width: 256 }} />);
    expect(screen.getByTestId('menu')).toHaveStyle({ width: '256px' });
  });

  it('has proper accessibility attributes', () => {
    render(<Menu items={defaultItems} />);
    expect(screen.getByTestId('menu')).toHaveAttribute('role', 'menu');
  });
});

describe('Menu engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Menu engine={engine} items={[{ key: '1', label: 'Test' }]} />);
    expect(screen.getByTestId('menu')).toBeInTheDocument();
  });
});

describe('Menu tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Menu items={[{ key: '1', label: 'Test' }]} />);
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
