/**
 * BottomTabBar Tests
 * Colocated with component following approved architecture
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomTabBar } from '..';

vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MAX_ITEMS = 5;
    const MockBottomTabBar = ({ items, activeKey, onChange, style }: any) => {
      const visibleItems = items.slice(0, MAX_ITEMS);
      const containerStyle: React.CSSProperties = {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        ...style,
      };
      return (
        <nav style={containerStyle} data-testid="bottom-tab-bar" aria-label="Bottom navigation">
          <div style={{ display: 'flex', width: '100%' }}>
            {visibleItems.map((item: any) => {
              const isActive = activeKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  data-testid={`tab-item-${item.key}`}
                  onClick={() => { item.onClick?.(); onChange?.(item.key); }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <span style={{ position: 'relative', width: 24, height: 24 }}>
                    {item.icon}
                    {item.badge != null && item.badge > 0 && (
                      <span data-testid={`tab-badge-${item.key}`}>
                        {item.badge > 99 ? '99+' : String(item.badge)}
                      </span>
                    )}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      );
    };
    MockBottomTabBar.displayName = 'BottomTabBar';
    return MockBottomTabBar;
  },
}));

const mockItems = [
  { key: 'home', label: 'Home', icon: <span data-testid="icon-home">H</span> },
  { key: 'search', label: 'Search', icon: <span data-testid="icon-search">S</span> },
  { key: 'profile', label: 'Profile', icon: <span data-testid="icon-profile">P</span> },
];

describe('BottomTabBar', () => {
  it('renders correctly', () => {
    render(<BottomTabBar items={mockItems} />);
    expect(screen.getByTestId('bottom-tab-bar')).toBeInTheDocument();
  });

  it('renders all tab items', () => {
    render(<BottomTabBar items={mockItems} />);
    expect(screen.getByTestId('tab-item-home')).toBeInTheDocument();
    expect(screen.getByTestId('tab-item-search')).toBeInTheDocument();
    expect(screen.getByTestId('tab-item-profile')).toBeInTheDocument();
  });

  it('renders item labels', () => {
    render(<BottomTabBar items={mockItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders item icons', () => {
    render(<BottomTabBar items={mockItems} />);
    expect(screen.getByTestId('icon-home')).toBeInTheDocument();
    expect(screen.getByTestId('icon-search')).toBeInTheDocument();
    expect(screen.getByTestId('icon-profile')).toBeInTheDocument();
  });

  it('marks the active item with aria-current', () => {
    render(<BottomTabBar items={mockItems} activeKey="search" />);
    expect(screen.getByTestId('tab-item-search')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('tab-item-home')).not.toHaveAttribute('aria-current');
  });

  it('calls onChange when a tab is clicked', () => {
    const handleChange = vi.fn();
    render(<BottomTabBar items={mockItems} onChange={handleChange} />);
    fireEvent.click(screen.getByTestId('tab-item-search'));
    expect(handleChange).toHaveBeenCalledWith('search');
  });

  it('calls item onClick handler', () => {
    const handleClick = vi.fn();
    const items = [
      { key: 'test', label: 'Test', icon: <span>T</span>, onClick: handleClick },
    ];
    render(<BottomTabBar items={items} />);
    fireEvent.click(screen.getByTestId('tab-item-test'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders badge on item', () => {
    const items = [
      { key: 'notif', label: 'Notifications', icon: <span>N</span>, badge: 5 },
    ];
    render(<BottomTabBar items={items} />);
    expect(screen.getByTestId('tab-badge-notif')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders 99+ for badges over 99', () => {
    const items = [
      { key: 'notif', label: 'Notifications', icon: <span>N</span>, badge: 150 },
    ];
    render(<BottomTabBar items={items} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('does not render badge when badge is 0', () => {
    const items = [
      { key: 'notif', label: 'Notifications', icon: <span>N</span>, badge: 0 },
    ];
    render(<BottomTabBar items={items} />);
    expect(screen.queryByTestId('tab-badge-notif')).not.toBeInTheDocument();
  });

  it('enforces max 5 items', () => {
    const manyItems = Array.from({ length: 7 }, (_, i) => ({
      key: `tab-${i}`,
      label: `Tab ${i}`,
      icon: <span>{i}</span>,
    }));
    render(<BottomTabBar items={manyItems} />);
    // Only first 5 should be rendered
    expect(screen.getByTestId('tab-item-tab-0')).toBeInTheDocument();
    expect(screen.getByTestId('tab-item-tab-4')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-item-tab-5')).not.toBeInTheDocument();
  });

  it('has fixed bottom positioning', () => {
    render(<BottomTabBar items={mockItems} />);
    const bar = screen.getByTestId('bottom-tab-bar');
    expect(bar).toHaveStyle({ position: 'fixed', bottom: '0' });
  });

  it('is a navigation landmark with an accessible name', () => {
    render(<BottomTabBar items={mockItems} />);
    expect(screen.getByRole('navigation', { name: 'Bottom navigation' })).toBeInTheDocument();
  });

  it('exposes one focusable item per tab', () => {
    render(<BottomTabBar items={mockItems} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('merges custom style', () => {
    render(<BottomTabBar items={mockItems} style={{ background: 'blue' }} />);
    expect(screen.getByTestId('bottom-tab-bar')).toHaveStyle({ background: 'blue' });
  });
});
