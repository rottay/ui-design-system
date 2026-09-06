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

/**
 * The Modern panel is PORTALED (WO-CAN-05) into `#rottay-portal-root`, so the
 * tree rows are siblings of the render container, not descendants. Resolve the
 * panel from the trigger's `aria-controls` -- the one remaining link between
 * field and panel -- and prove it came through the overlay kernel, so a row
 * found "somewhere in the document" can never stand in for a row this field
 * actually owns.
 */
const ownedPanel = (container: HTMLElement): HTMLElement => {
  const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
  const panelId = trigger.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  const panel = document.getElementById(panelId as string) as HTMLElement;
  expect(panel).not.toBeNull();
  expect(container.contains(panel)).toBe(false);
  expect(panel.closest('#rottay-portal-root')).not.toBeNull();
  expect(panel.getAttribute('data-overlay-layer')).toMatch(/^ds-overlay-/);
  return panel;
};

/** A tree row, resolved inside the field's OWN portaled panel. */
const row = (container: HTMLElement, key: string): HTMLElement =>
  ownedPanel(container).querySelector(`[data-key="${key}"]`) as HTMLElement;

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

    const parentRow = row(container, 'engineering');
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
    const parentRow = row(container, 'engineering');
    expect(parentRow).toHaveAttribute('data-selected', 'true');

    fireEvent.click(screen.getByText('Frontend'));

    // Same element, re-rendered in place across the portal boundary.
    expect(parentRow).not.toHaveAttribute('data-selected');
    expect(parentRow).toHaveAttribute('aria-checked', 'mixed');
    expect(row(container, 'backend')).toHaveAttribute('data-selected', 'true');
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
    expect(row(container, 'frontend')).toHaveAttribute('data-selected', 'true');
    expect(row(container, 'backend')).toHaveAttribute('data-selected', 'true');
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

    const parentRow = row(container, 'engineering');
    expect(parentRow).not.toHaveAttribute('data-selected');
    expect(parentRow).toHaveAttribute('aria-checked', 'false');
  });
});
