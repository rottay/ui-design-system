import React from 'react';
import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { StableEngineName } from '@tests/support/engine';
import { STABLE_ENGINES } from '@tests/support/engine';
import type { TreeViewProps } from '../contracts';
import ClassicTreeView from '../engines/classic';
import ModernTreeView from '../engines/modern';
import RusticTreeView from '../engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<TreeViewProps>> = {
  classic: ClassicTreeView,
  modern: ModernTreeView,
  rustic: RusticTreeView,
};

const treeData = [
  {
    key: 'parent',
    label: 'Parent',
    icon: <span>P</span>,
    children: [
      { key: 'child-1', label: 'Child One' },
      { key: 'child-2', label: 'Child Two', disabled: true },
    ],
  },
  {
    key: 'standalone',
    label: 'Standalone',
  },
];

function createProps(overrides: Partial<TreeViewProps> = {}): TreeViewProps {
  return {
    data: treeData,
    searchable: true,
    searchPlaceholder: 'Search nodes',
    checkable: true,
    draggable: true,
    renderNode: (node, depth) => <span>{`${node.label} (${depth})`}</span>,
    onSelect: vi.fn(),
    onExpand: vi.fn(),
    onCheck: vi.fn(),
    onDrop: vi.fn(),
    ...overrides,
  };
}

describe('PatternTreeView advanced engine coverage', () => {
  it.each(STABLE_ENGINES)('covers loading states through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];

    render(<Component {...createProps()} loading />);

    expect(screen.queryByText(/Parent/)).not.toBeInTheDocument();
  });

  it.each(STABLE_ENGINES)('covers expand callbacks through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const onExpand = vi.fn();

    const { container } = render(<Component {...createProps({ onExpand })} />);

    if (engine === 'classic') {
      const expandTrigger = container.querySelector('.ant-tree-switcher');
      expect(expandTrigger).not.toBeNull();
      fireEvent.click(expandTrigger as Element);
    } else {
      fireEvent.click(screen.getAllByRole('button')[0]);
    }

    expect(onExpand).toHaveBeenCalled();
  });

  it.each(STABLE_ENGINES)('covers search, select, check and render-node branches through the %s engine', (engine) => {
    const Component = COMPONENTS[engine];
    const onSelect = vi.fn();
    const onCheck = vi.fn();

    render(
      <Component
        {...createProps({
          onSelect,
          onCheck,
          multiple: true,
          expandedKeys: ['parent'],
        })}
      />
    );

    const search = screen.getByPlaceholderText('Search nodes');
    expect(screen.getByText('Child One (1)')).toBeInTheDocument();

    fireEvent.change(search, { target: { value: 'Child' } });
    expect(screen.getByDisplayValue('Child')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Child One (1)'));
    expect(onSelect).toHaveBeenCalled();

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onCheck).toHaveBeenCalled();

    // Disabled children should remain visible after filtering but not become interactive.
    expect(screen.getByText('Child Two (1)')).toBeInTheDocument();
  });

  it('reshapes the primitive drop info into {dragKey, dropKey, position} through the modern engine', () => {
    const onDrop = vi.fn();

    render(<ModernTreeView {...createProps({ onDrop, expandedKeys: ['parent'] })} />);

    const source = screen.getByText('Parent (0)').closest('[role="treeitem"]') as HTMLElement;
    const target = screen.getByText('Standalone (0)').closest('[role="treeitem"]') as HTMLElement;
    Object.defineProperty(target, 'getBoundingClientRect', {
      value: () => ({
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        bottom: 100,
        right: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
      configurable: true,
    });

    const zones: Array<[number, 'before' | 'inside' | 'after']> = [
      [10, 'before'],
      [50, 'inside'],
      [90, 'after'],
    ];

    zones.forEach(([clientY, position], index) => {
      fireEvent.dragStart(source, { dataTransfer: { effectAllowed: '', setData: vi.fn() } });
      const dragOver = createEvent.dragOver(target);
      Object.defineProperty(dragOver, 'clientY', { value: clientY });
      Object.defineProperty(dragOver, 'dataTransfer', { value: { dropEffect: '' } });
      fireEvent(target, dragOver);
      fireEvent.drop(target);

      expect(onDrop).toHaveBeenNthCalledWith(index + 1, {
        dragKey: 'parent',
        dropKey: 'standalone',
        position,
      });
    });
  });
});
