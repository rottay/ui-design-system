import React from 'react';
import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTree from '../engines/modern';

const TREE_DATA = [
  {
    key: 1,
    title: 'Root',
    icon: <span data-testid="root-icon">R</span>,
    children: [
      { key: 'child-1', title: 'Child 1', icon: <span data-testid="child-icon">C1</span> },
      { key: 'child-2', title: 'Child 2', disabled: true },
    ],
  },
  {
    key: 'leaf',
    title: 'Leaf',
    isLeaf: true,
  },
];

describe('Tree modern engine advanced coverage', () => {
  it('covers defaultExpandAll, controlled checked keys, icon rendering, selection, and disabled guards', () => {
    const handleExpand = vi.fn();
    const handleSelect = vi.fn();
    const handleCheck = vi.fn();

    render(
      <ModernTree
        treeData={TREE_DATA}
        checkable
        showLine
        showIcon
        defaultExpandAll
        checkedKeys={{ checked: [1], halfChecked: [] }}
        onExpand={handleExpand}
        onSelect={handleSelect}
        onCheck={handleCheck}
      />
    );

    expect(screen.getAllByRole('treeitem')).toHaveLength(4);
    expect(screen.getByTestId('root-icon')).toBeInTheDocument();
    expect(screen.getByTestId('child-icon')).toBeInTheDocument();
    expect(screen.getByRole('group')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Root'));
    expect(handleSelect).toHaveBeenCalledWith(
      expect.arrayContaining([1]),
      expect.objectContaining({ selected: true })
    );

    fireEvent.click(screen.getByLabelText('Select Root'));
    expect(handleCheck).toHaveBeenCalledWith(
      expect.objectContaining({ checked: expect.any(Array), halfChecked: expect.any(Array) }),
      expect.objectContaining({ checked: false })
    );

    const selectCallsBeforeDisabledClick = handleSelect.mock.calls.length;
    fireEvent.click(screen.getByText('Child 2'));
    expect(handleSelect).toHaveBeenCalledTimes(selectCallsBeforeDisabledClick);

    fireEvent.click(screen.getAllByLabelText('Collapse')[0]);
    expect(handleExpand).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ expanded: false })
    );
  });

  it('covers controlled selected/expanded state, unchecked toggles, and nodes without icons or children', () => {
    const handleExpand = vi.fn();
    const handleSelect = vi.fn();
    const handleCheck = vi.fn();

    render(
      <ModernTree
        treeData={TREE_DATA}
        checkable
        showLine={false}
        showIcon={false}
        expandedKeys={[1]}
        selectedKeys={['child-1']}
        checkedKeys={['child-1']}
        onExpand={handleExpand}
        onSelect={handleSelect}
        onCheck={handleCheck}
      />
    );

    const selectedChild = screen.getByText('Child 1').closest('[role="treeitem"]');
    expect(selectedChild).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByText('Child 1'));
    expect(handleSelect).toHaveBeenCalledWith(
      [],
      expect.objectContaining({ selected: false })
    );

    fireEvent.click(screen.getByLabelText('Select Child 1'));
    expect(handleCheck).toHaveBeenCalledWith(
      expect.objectContaining({ checked: expect.any(Array), halfChecked: expect.any(Array) }),
      expect.objectContaining({ checked: false })
    );

    fireEvent.click(screen.getByLabelText('Collapse'));
    expect(handleExpand).toHaveBeenCalled();
    expect(screen.getByText('Leaf')).toBeInTheDocument();
  });

  it('covers async loading, strict checking, keyboard selection, and drag-drop positions', async () => {
    const loadData = vi.fn(async () => undefined);
    const handleExpand = vi.fn();
    const handleCheck = vi.fn();
    const handleSelect = vi.fn();
    const handleDragStart = vi.fn();
    const handleDrop = vi.fn();

    render(
      <ModernTree
        treeData={[
          {
            key: 'root',
            title: 'Root',
            children: [
              { key: 'child', title: 'Child' },
              { key: 'no-select', title: 'No Select', selectable: false },
            ],
          },
          { key: 'lazy', title: 'Lazy', isLeaf: false },
        ]}
        checkable
        draggable
        defaultExpandedKeys={['root']}
        treeCheckStrictly
        loadData={loadData}
        onExpand={handleExpand}
        onCheck={handleCheck}
        onSelect={handleSelect}
        onDragStart={handleDragStart}
        onDrop={handleDrop}
      />
    );

    const tree = screen.getByRole('tree');
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    fireEvent.keyDown(tree, { key: 'Enter' });
    fireEvent.keyDown(tree, { key: ' ' });

    expect(handleSelect).toHaveBeenCalledWith(
      ['root'],
      expect.objectContaining({ selected: true })
    );
    expect(handleCheck).toHaveBeenCalledWith(
      expect.arrayContaining(['root']),
      expect.objectContaining({ checked: true })
    );

    fireEvent.click(screen.getByText('No Select'));
    expect(handleSelect).toHaveBeenCalledTimes(1);

    const lazyItem = screen.getByText('Lazy').closest('[role="treeitem"]');
    if (!lazyItem) {
      throw new Error('Expected lazy tree item');
    }

    fireEvent.click(within(lazyItem).getByLabelText('Expand'));
    await waitFor(() => {
      expect(loadData).toHaveBeenCalledWith(expect.objectContaining({ key: 'lazy' }));
    });
    expect(handleExpand).toHaveBeenCalledWith(
      expect.arrayContaining(['root', 'lazy']),
      expect.objectContaining({ expanded: true })
    );

    const rootItem = screen.getByText('Root').closest('[role="treeitem"]');
    const childItem = screen.getByText('Child').closest('[role="treeitem"]');
    if (!rootItem || !childItem) {
      throw new Error('Expected tree items for drag and drop');
    }

    const dragData = { effectAllowed: '', setData: vi.fn() };
    const rect = () => ({
      top: 0,
      left: 0,
      width: 100,
      height: 100,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    Object.defineProperty(childItem, 'getBoundingClientRect', {
      value: rect,
      configurable: true,
    });

    const dragOverAt = (clientY: number) => {
      const event = createEvent.dragOver(childItem);
      Object.defineProperty(event, 'clientY', { value: clientY });
      fireEvent(childItem, event);
    };

    fireEvent.dragStart(rootItem, { dataTransfer: dragData });
    expect(handleDragStart).toHaveBeenCalledWith(
      expect.objectContaining({ node: expect.objectContaining({ key: 'root' }) })
    );

    dragOverAt(10);
    fireEvent.drop(childItem);

    fireEvent.dragStart(rootItem, { dataTransfer: dragData });
    dragOverAt(50);
    fireEvent.drop(childItem);

    fireEvent.dragStart(rootItem, { dataTransfer: dragData });
    dragOverAt(90);
    fireEvent.drop(childItem);

    expect(handleDrop).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ dropPosition: -1 })
    );
    expect(handleDrop).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ dropPosition: 0 })
    );
    expect(handleDrop).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ dropPosition: 1 })
    );
  });

  it('covers search filtering, auto-expansion of matches, and search highlighting', async () => {
    render(
      <ModernTree
        treeData={[
          {
            key: 'group',
            title: 'Group',
            children: [
              { key: 'match-leaf', title: 'Matched Item' },
              { key: 'other-leaf', title: 'Other Item' },
            ],
          },
          { key: 'outside', title: 'Outside Item' },
        ]}
        filterTreeNode={(searchValue, node) =>
          String(node.title ?? '').toLowerCase().includes(searchValue.toLowerCase())
        }
        searchValue="match"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tree')).toHaveTextContent('Matched Item');
    });

    expect(screen.getByRole('tree')).toHaveTextContent('Group');
    expect(screen.getByRole('tree')).not.toHaveTextContent('Other Item');
    expect(screen.getByRole('tree')).not.toHaveTextContent('Outside Item');
    const highlight = screen.getByText('Match');
    expect(highlight).toHaveClass('rottay-tree-search-highlight');
    expect(highlight).toHaveStyle({
      background: 'color-mix(in srgb, var(--ds-color-warning) 30%, transparent)',
      color: 'var(--ds-color-text-primary)',
    });
  });
});
