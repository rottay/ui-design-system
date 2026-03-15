import React from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TreeSelect as ModernTreeSelect } from './engines/modern';
import { TreeSelect as RusticTreeSelect } from './engines/rustic';
import { renderWithEngine } from '../../../../../testing/helpers/engine-test-utils';

const mappedTreeData = [
  {
    id: 'engineering',
    label: 'Engineering',
    nodes: [
      { id: 'frontend', label: 'Frontend' },
      { id: 'platform', label: 'Platform' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
  },
];

const strictTreeData = [
  { value: 'lazy', title: 'Lazy parent', isLeaf: false },
  {
    value: 'group',
    title: 'Group',
    children: [{ value: 'child', title: 'Child' }],
  },
];

describe.each([
  ['modern', ModernTreeSelect],
  ['rustic', RusticTreeSelect],
] as const)('TreeSelect advanced %s engine coverage', (engine, TreeSelectComponent) => {
  it('covers fieldNames mapping, expand callbacks, mapped selection output, and empty-state overrides', async () => {
    const onChange = vi.fn();
    const onTreeExpand = vi.fn();
    const { rerender } = renderWithEngine(
      <TreeSelectComponent
        treeData={mappedTreeData}
        fieldNames={{ title: 'label', value: 'id', children: 'nodes' }}
        open
        treeLine
        onTreeExpand={onTreeExpand}
        onChange={onChange}
      />,
      engine
    );

    expect(screen.queryByText('Frontend')).not.toBeInTheDocument();

    const expandButton = screen
      .getAllByRole('button')
      .find((button) => ['▶', 'Expand'].includes(button.textContent ?? '') || button.getAttribute('aria-label') === 'Expand');

    if (!expandButton) {
      throw new Error('Expected tree expand button');
    }

    fireEvent.click(expandButton);

    await waitFor(() => {
      expect(onTreeExpand).toHaveBeenCalledWith(expect.arrayContaining(['engineering']));
      expect(screen.getByText('Frontend')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Frontend'));

    expect(onChange).toHaveBeenCalledWith(
      'frontend',
      ['Frontend'],
      expect.objectContaining({ triggerValue: 'frontend' })
    );

    rerender(
      <TreeSelectComponent
        treeData={[]}
        open
        notFoundContent="Nothing mapped"
      />
    );

    expect(screen.getByText('Nothing mapped')).toBeInTheDocument();
  });

  it('covers lazy loading, strict multi-check selection, clear, and outside-close flows', async () => {
    const onChange = vi.fn();
    const onTreeExpand = vi.fn();
    const onDropdownVisibleChange = vi.fn();
    let resolveLoad: (() => void) | undefined;
    const loadData = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        })
    );

    renderWithEngine(
      <TreeSelectComponent
        treeData={strictTreeData}
        multiple
        treeCheckable
        treeCheckStrictly
        treeDefaultExpandAll
        allowClear
        loadData={loadData}
        onChange={onChange}
        onTreeExpand={onTreeExpand}
        onDropdownVisibleChange={onDropdownVisibleChange}
        placeholder="Pick nodes"
      />,
      engine
    );

    fireEvent.click(screen.getByText('Pick nodes'));
    expect(onDropdownVisibleChange).toHaveBeenCalledWith(true);

    const lazyToggle = screen
      .getAllByRole('button')
      .find((button) => ['▶', '▼'].includes(button.textContent ?? ''));

    if (!lazyToggle) {
      throw new Error('Expected lazy tree toggle button');
    }

    fireEvent.click(lazyToggle);

    await waitFor(() => {
      expect(loadData).toHaveBeenCalledWith(
        expect.objectContaining({ value: 'lazy', title: 'Lazy parent' })
      );
      expect(onTreeExpand).toHaveBeenCalled();
    });

    await act(async () => {
      resolveLoad?.();
    });

    fireEvent.click(screen.getByText('Group'));
    expect(onChange).toHaveBeenLastCalledWith(
      ['group'],
      ['Group'],
      expect.objectContaining({ triggerValue: 'group' })
    );

    fireEvent.click(screen.getByText('Child'));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(['group', 'child']),
      ['Child'],
      expect.objectContaining({ triggerValue: 'child' })
    );

    const clearButton = screen
      .getAllByRole('button')
      .find((button) => button.textContent?.includes('✕'));

    if (!clearButton) {
      throw new Error('Expected clear button after selecting values');
    }

    fireEvent.click(clearButton);
    expect(onChange).toHaveBeenLastCalledWith(
      [],
      [],
      expect.objectContaining({ triggerValue: '' })
    );

    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(onDropdownVisibleChange).toHaveBeenLastCalledWith(false);
    });
  });
});
