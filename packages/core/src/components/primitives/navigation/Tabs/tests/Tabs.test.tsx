/**
 * Tabs Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from '../';

// Mock the engine factory
vi.mock('../../../../../system/engines/factory', () => ({
  createEngineComponent: () => {
    const MockTabs = ({
      items,
      activeKey,
      defaultActiveKey,
      type,
      size,
      centered,
      onChange,
      className,
      style,
    }: any) => {
      const active = activeKey || defaultActiveKey || items?.[0]?.key;
      return (
        <div
          data-testid="tabs"
          data-active-key={active}
          data-type={type}
          data-size={size}
          data-centered={centered}
          className={className}
          style={style}
        >
          <div data-testid="tabs-nav" role="tablist">
            {items?.map((item: any) => (
              <button
                key={item.key}
                data-testid={`tab-${item.key}`}
                role="tab"
                aria-selected={active === item.key}
                disabled={item.disabled}
                onClick={() => !item.disabled && onChange?.(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
          <div data-testid="tabs-content">
            {items?.find((item: any) => item.key === active)?.children}
          </div>
        </div>
      );
    };
    MockTabs.displayName = 'Tabs';
    return MockTabs;
  },
}));

const defaultItems = [
  { key: '1', label: 'Tab 1', children: 'Content 1' },
  { key: '2', label: 'Tab 2', children: 'Content 2' },
  { key: '3', label: 'Tab 3', children: 'Content 3' },
];

describe('Tabs', () => {
  it('renders correctly', () => {
    render(<Tabs items={defaultItems} />);
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tabs-nav')).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<Tabs items={defaultItems} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  describe('activeKey prop', () => {
    it('shows first tab by default', () => {
      render(<Tabs items={defaultItems} />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-active-key', '1');
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('respects defaultActiveKey', () => {
      render(<Tabs items={defaultItems} defaultActiveKey="2" />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-active-key', '2');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('respects activeKey (controlled)', () => {
      render(<Tabs items={defaultItems} activeKey="3" />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-active-key', '3');
      expect(screen.getByText('Content 3')).toBeInTheDocument();
    });
  });

  describe('type prop', () => {
    it.each(['line', 'card', 'pills'] as const)('renders type %s', (type) => {
      render(<Tabs items={defaultItems} type={type} />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-type', type);
    });
  });

  describe('size prop', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
      render(<Tabs items={defaultItems} size={size} />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-size', size);
    });
  });

  describe('centered prop', () => {
    it('renders centered tabs', () => {
      render(<Tabs items={defaultItems} centered />);
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-centered', 'true');
    });
  });

  describe('onChange callback', () => {
    it('calls onChange when tab is clicked', () => {
      const onChange = vi.fn();
      render(<Tabs items={defaultItems} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tab-2'));
      expect(onChange).toHaveBeenCalledWith('2');
    });

    it('does not call onChange for disabled tabs', () => {
      const onChange = vi.fn();
      const items = [
        { key: '1', label: 'Tab 1', children: 'Content 1' },
        { key: '2', label: 'Tab 2', children: 'Content 2', disabled: true },
      ];
      render(<Tabs items={items} onChange={onChange} />);

      fireEvent.click(screen.getByTestId('tab-2'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('disabled tabs', () => {
    it('renders disabled tab', () => {
      const items = [
        { key: '1', label: 'Tab 1', children: 'Content 1' },
        { key: '2', label: 'Tab 2', children: 'Content 2', disabled: true },
      ];
      render(<Tabs items={items} />);

      expect(screen.getByTestId('tab-2')).toBeDisabled();
    });
  });

  describe('tabs with icons', () => {
    it('renders tabs with icons', () => {
      const items = [
        { key: '1', label: 'Home', icon: <span data-testid="icon-home">🏠</span>, children: 'Home content' },
        { key: '2', label: 'Settings', icon: <span data-testid="icon-settings">⚙️</span>, children: 'Settings content' },
      ];
      render(<Tabs items={items} />);

      expect(screen.getByTestId('icon-home')).toBeInTheDocument();
      expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
    });
  });

  it('applies custom className', () => {
    render(<Tabs items={defaultItems} className="custom-tabs" />);
    expect(screen.getByTestId('tabs')).toHaveClass('custom-tabs');
  });

  it('applies custom style', () => {
    render(<Tabs items={defaultItems} style={{ marginTop: 20 }} />);
    expect(screen.getByTestId('tabs')).toHaveStyle({ marginTop: '20px' });
  });
});

describe('Tabs engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Tabs engine={engine} items={[{ key: '1', label: 'Test', children: 'Content' }]} />);
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
  });
});

describe('Tabs tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Tabs items={[{ key: '1', label: 'Test', children: 'Content' }]} />);
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
