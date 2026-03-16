/**
 * ContextMenu Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContextMenu } from './';

vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockContextMenu = ({
      items,
      onSelect,
      trigger,
      disabled,
      ...props
    }: any) => {
      const [isOpen, setIsOpen] = React.useState(false);

      const handleContextMenu = (e: React.MouseEvent) => {
        if (disabled) return;
        e.preventDefault();
        setIsOpen(true);
      };

      return (
        <div
          data-testid="contextmenu"
          data-disabled={disabled}
          {...props}
        >
          <div data-testid="contextmenu-trigger" onContextMenu={handleContextMenu}>
            {trigger}
          </div>
          {isOpen && (
            <div data-testid="contextmenu-menu" role="menu">
              {items?.map((item: any) => (
                item.type === 'divider' ? (
                  <div key={item.key} role="separator" />
                ) : (
                  <div
                    key={item.key}
                    data-testid={`menu-item-${item.key}`}
                    role="menuitem"
                    onClick={() => !item.disabled && onSelect?.(item.key)}
                    aria-disabled={item.disabled}
                    data-danger={item.danger}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      );
    };
    MockContextMenu.displayName = 'ContextMenu';
    return MockContextMenu;
  },
}));

import React from 'react';

describe('ContextMenu', () => {
  const defaultItems = [
    { key: '1', label: 'Item 1' },
    { key: '2', label: 'Item 2' },
    { key: '3', label: 'Item 3', disabled: true },
  ];

  it('renders the trigger element', () => {
    render(
      <ContextMenu items={defaultItems} trigger={<span>Right-click me</span>} />
    );
    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('does not show menu by default', () => {
    render(
      <ContextMenu items={defaultItems} trigger={<span>Trigger</span>} />
    );
    expect(screen.queryByTestId('contextmenu-menu')).not.toBeInTheDocument();
  });

  it('shows menu on context menu event', () => {
    render(
      <ContextMenu items={defaultItems} trigger={<span>Trigger</span>} />
    );
    fireEvent.contextMenu(screen.getByTestId('contextmenu-trigger'));
    expect(screen.getByTestId('contextmenu-menu')).toBeInTheDocument();
  });

  it('does not open when disabled', () => {
    render(
      <ContextMenu items={defaultItems} trigger={<span>Trigger</span>} disabled />
    );
    fireEvent.contextMenu(screen.getByTestId('contextmenu-trigger'));
    expect(screen.queryByTestId('contextmenu-menu')).not.toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu items={defaultItems} trigger={<span>Trigger</span>} onSelect={onSelect} />
    );
    fireEvent.contextMenu(screen.getByTestId('contextmenu-trigger'));
    fireEvent.click(screen.getByTestId('menu-item-1'));
    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('does not call onSelect for disabled items', () => {
    const onSelect = vi.fn();
    render(
      <ContextMenu items={defaultItems} trigger={<span>Trigger</span>} onSelect={onSelect} />
    );
    fireEvent.contextMenu(screen.getByTestId('contextmenu-trigger'));
    fireEvent.click(screen.getByTestId('menu-item-3'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('ContextMenu engines', () => {
  const items = [{ key: '1', label: 'Item' }];

  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(
      <ContextMenu engine={engine} items={items} trigger={<span>Trigger</span>} />
    );
    expect(screen.getByTestId('contextmenu')).toBeInTheDocument();
  });
});
