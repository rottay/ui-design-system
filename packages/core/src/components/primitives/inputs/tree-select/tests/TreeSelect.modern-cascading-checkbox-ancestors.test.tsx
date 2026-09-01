import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { TreeSelect as ModernTreeSelect } from '../engines/modern';

const treeData = [
  {
    value: 'engineering',
    title: 'Engineering',
    children: [
      { value: 'frontend', title: 'Frontend' },
      { value: 'backend', title: 'Backend' },
    ],
  },
];

/** Cascading mode must rederive ancestor state after each child toggle. */
describe('TreeSelect modern cascading checkbox ancestor recheck', () => {
  it('checks the parent once every child is individually checked', () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <ModernTreeSelect
        treeData={treeData}
        treeCheckable
        multiple
        treeDefaultExpandAll
        open
        onChange={onChange}
      />,
      'modern'
    );

    fireEvent.click(screen.getByText('Frontend'));
    fireEvent.click(screen.getByText('Backend'));

    const parentRow = container.querySelector('[data-key="engineering"]');
    expect(parentRow).toHaveAttribute('data-selected', 'true');
    expect(parentRow).toHaveAttribute('aria-checked', 'true');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining(['engineering', 'frontend', 'backend']),
      ['Backend'],
      expect.objectContaining({ triggerValue: 'backend' })
    );
  });

  it('drops the auto-checked parent back to indeterminate when a child is unchecked again', () => {
    const { container } = renderWithEngine(
      <ModernTreeSelect
        treeData={treeData}
        treeCheckable
        multiple
        treeDefaultExpandAll
        open
      />,
      'modern'
    );

    fireEvent.click(screen.getByText('Frontend'));
    fireEvent.click(screen.getByText('Backend'));
    const parentRow = container.querySelector('[data-key="engineering"]');
    expect(parentRow).toHaveAttribute('data-selected', 'true');

    fireEvent.click(screen.getByText('Frontend'));

    expect(parentRow).not.toHaveAttribute('data-selected');
    expect(parentRow).toHaveAttribute('aria-checked', 'mixed');
    expect(container.querySelector('[data-key="backend"]')).toHaveAttribute('data-selected', 'true');
  });

  it('still cascades a parent click down to every descendant (unaffected by the ancestor fix)', () => {
    const onChange = vi.fn();
    const { container } = renderWithEngine(
      <ModernTreeSelect
        treeData={treeData}
        treeCheckable
        multiple
        treeDefaultExpandAll
        open
        onChange={onChange}
      />,
      'modern'
    );

    fireEvent.click(screen.getByText('Engineering'));

    expect(onChange).toHaveBeenCalledWith(
      expect.arrayContaining(['engineering', 'frontend', 'backend']),
      ['Engineering'],
      expect.objectContaining({ triggerValue: 'engineering' })
    );
    expect(container.querySelector('[data-key="frontend"]')).toHaveAttribute('data-selected', 'true');
    expect(container.querySelector('[data-key="backend"]')).toHaveAttribute('data-selected', 'true');
  });

  it('leaves strict mode alone: checking every child never touches the parent', () => {
    const { container } = renderWithEngine(
      <ModernTreeSelect
        treeData={treeData}
        treeCheckable
        treeCheckStrictly
        multiple
        treeDefaultExpandAll
        open
      />,
      'modern'
    );

    fireEvent.click(screen.getByText('Frontend'));
    fireEvent.click(screen.getByText('Backend'));

    const parentRow = container.querySelector('[data-key="engineering"]');
    expect(parentRow).not.toHaveAttribute('data-selected');
    expect(parentRow).toHaveAttribute('aria-checked', 'false');
  });
});
