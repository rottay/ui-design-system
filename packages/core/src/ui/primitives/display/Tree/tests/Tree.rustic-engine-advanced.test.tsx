import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { createEvent, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import RusticTree from '../engines/rustic';

const TREE_DATA = [
  {
    key: 'root',
    title: 'Root',
    icon: <span>R</span>,
    children: [
      { key: 'child-1', title: 'Child 1', icon: <span>C1</span> },
      { key: 'child-2', title: 'Child 2', disabled: true },
    ],
  },
];

describe('Tree rustic advanced engine coverage', () => {
  it('covers expand/select/check/keyboard/hover branches in the rustic engine', async () => {
    const handleExpand = vi.fn();
    const handleSelect = vi.fn();
    const handleCheck = vi.fn();

    const { container } = render(
      <RusticTree
        treeData={TREE_DATA}
        checkable
        showLine
        showIcon
        defaultExpandAll
        onExpand={handleExpand}
        onSelect={handleSelect}
        onCheck={handleCheck}
      />
    );

    const rootItem = screen.getAllByRole('treeitem')[0];
    fireEvent.mouseEnter(rootItem);
    fireEvent.mouseLeave(rootItem);
    fireEvent.click(rootItem);
    expect(handleSelect).toHaveBeenCalled();

    fireEvent.keyDown(rootItem, { key: 'Enter' });

    const expandButton = screen.getAllByLabelText('Collapse')[0];
    fireEvent.click(expandButton);
    expect(handleExpand).toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText('Select Root'));
    expect(handleCheck).toHaveBeenCalled();

    expect(handleSelect.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('covers controlled key objects, disabled nodes, and keyboard toggling on the switcher', () => {
    const handleExpand = vi.fn();
    const handleSelect = vi.fn();
    const handleCheck = vi.fn();

    render(
      <RusticTree
        treeData={TREE_DATA}
        checkable
        expandedKeys={['root']}
        selectedKeys={['root']}
        checkedKeys={{ checked: ['root'], halfChecked: [] }}
        onExpand={handleExpand}
        onSelect={handleSelect}
        onCheck={handleCheck}
      />
    );

    const rootItem = screen.getAllByRole('treeitem')[0];
    expect(rootItem).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(rootItem);

    fireEvent.keyDown(rootItem, { key: 'ArrowLeft' });
    expect(handleExpand).toHaveBeenCalled();

    const selectCallsBeforeDisabledClick = handleSelect.mock.calls.length;
    fireEvent.click(screen.getByText('Child 2'));
    expect(handleSelect).toHaveBeenCalledTimes(selectCallsBeforeDisabledClick);

    fireEvent.click(screen.getByLabelText('Select Root'));
    expect(handleCheck).toHaveBeenCalled();
  });

  it('covers async loading, strict keyboard checking, drag-drop positions, and selectable=false guards', async () => {
    const loadData = vi.fn(async () => undefined);
    const handleExpand = vi.fn();
    const handleCheck = vi.fn();
    const handleSelect = vi.fn();
    const handleDragStart = vi.fn();
    const handleDrop = vi.fn();

    render(
      <RusticTree
        treeData={[
          {
            key: 'root',
            title: 'Root',
            children: [
              { key: 'child', title: 'Child' },
              { key: 'locked', title: 'Locked', selectable: false },
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

    fireEvent.click(screen.getByText('Locked'));
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
      throw new Error('Expected rustic tree items for drag and drop');
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

  it('covers search filtering, auto-expansion, and highlighted rustic text rendering', async () => {
    render(
      <RusticTree
        treeData={[
          {
            key: 'group',
            title: 'Group',
            children: [
              { key: 'match', title: 'Matched Item' },
              { key: 'other', title: 'Other Item' },
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
    expect(screen.getByText('Match')).toHaveClass('rottay-tree-highlight');
  });
});
