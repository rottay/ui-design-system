import React from 'react';
import { describe, expect, it } from 'vitest';
import { within } from '@testing-library/react';

import { TreeSelect as ModernTreeSelect } from '../engines/modern';
import { TreeSelect as ClassicTreeSelect } from '../engines/classic';
import { TreeSelect as RusticTreeSelect } from '../engines/rustic';
import { renderWithEngine } from '@tests/support/engine';

const treeData = [
  {
    value: 'eng',
    title: 'Engineering',
    children: [{ value: 'fe', title: 'Frontend', isLeaf: true }],
  },
];

const PLACEHOLDER = 'Select department';

/**
 * The Modern panel is PORTALED (WO-CAN-05): it renders through the overlay
 * kernel into `#rottay-portal-root`, so the tree it contains is a SIBLING of
 * the render container, never a descendant. This resolves it the only honest
 * way -- from the trigger's `aria-controls`, which is now the sole link
 * between field and panel -- and proves it is this field's panel and came
 * through the kernel before any name is read out of it.
 */
const ownedPanel = (container: HTMLElement): HTMLElement => {
  const trigger = within(container).getByRole('combobox');
  const panelId = trigger.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  const panel = document.getElementById(panelId as string);
  expect(panel).not.toBeNull();
  expect(container.contains(panel)).toBe(false);
  expect((panel as HTMLElement).closest('#rottay-portal-root')).not.toBeNull();
  expect((panel as HTMLElement).getAttribute('data-part')).toBe('dropdown');
  expect((panel as HTMLElement).getAttribute('data-overlay-layer')).toMatch(/^ds-overlay-/);
  expect((panel as HTMLElement).getAttribute('data-overlay-kind')).toBe('dropdown');
  return panel as HTMLElement;
};

/** Every naming-bearing node, so an ignored prop cannot hide anywhere. */
const namingSurface = (root: HTMLElement): string[] =>
  Array.from(root.querySelectorAll('[aria-label], [aria-labelledby]')).map((node) =>
    [
      node.getAttribute('role'),
      node.getAttribute('aria-label'),
      node.getAttribute('aria-labelledby'),
    ].join('|')
  );

describe('TreeSelect modern naming', () => {
  it('names the trigger from aria-labelledby and suppresses the synthesized aria-label', () => {
    const { container } = renderWithEngine(
      <>
        <span id="ext-org">Org</span>
        <ModernTreeSelect treeData={treeData} placeholder={PLACEHOLDER} aria-labelledby="ext-org" />
      </>,
      'modern'
    );

    const trigger = within(container).getByRole('combobox', { name: 'Org' });
    expect(trigger.hasAttribute('aria-label')).toBe(false);
  });

  it('names the trigger from aria-label', () => {
    const { container } = renderWithEngine(
      <ModernTreeSelect treeData={treeData} placeholder={PLACEHOLDER} aria-label="Pick org" />,
      'modern'
    );

    expect(within(container).getByRole('combobox', { name: 'Pick org' })).toBeDefined();
  });

  it('falls back to the placeholder when no naming prop is supplied', () => {
    const { container } = renderWithEngine(
      <ModernTreeSelect treeData={treeData} placeholder={PLACEHOLDER} />,
      'modern'
    );

    expect(within(container).getByRole('combobox', { name: PLACEHOLDER })).toBeDefined();
  });

  it('keeps the placeholder fallback when only id is supplied', () => {
    const { container } = renderWithEngine(
      <ModernTreeSelect treeData={treeData} placeholder={PLACEHOLDER} id="ts1" />,
      'modern'
    );

    const trigger = within(container).getByRole('combobox', { name: PLACEHOLDER });
    expect(trigger.getAttribute('id')).toBe('ts1');
  });

  it('mirrors the external name on the open popup', () => {
    const { container } = renderWithEngine(
      <>
        <span id="ext-org">Org</span>
        <ModernTreeSelect
          treeData={treeData}
          placeholder={PLACEHOLDER}
          aria-labelledby="ext-org"
          open
        />
      </>,
      'modern'
    );

    // The external name still reaches the tree after the panel left the field
    // subtree: the mirror travels WITH the panel, it is not inherited by DOM
    // ancestry.
    expect(within(ownedPanel(container)).getByRole('tree', { name: 'Org' })).toBeDefined();
  });

  it('mirrors the placeholder fallback on the open popup', () => {
    const { container } = renderWithEngine(
      <ModernTreeSelect treeData={treeData} placeholder={PLACEHOLDER} open />,
      'modern'
    );

    expect(
      within(ownedPanel(container)).getByRole('tree', { name: PLACEHOLDER }),
    ).toBeDefined();
  });
});

describe('TreeSelect naming props are inert in classic and rustic', () => {
  it('leaves classic naming unchanged', () => {
    const base = renderWithEngine(
      <ClassicTreeSelect treeData={treeData} placeholder={PLACEHOLDER} />,
      'classic'
    );
    const before = namingSurface(base.container);

    const widened = renderWithEngine(
      <ClassicTreeSelect
        treeData={treeData}
        placeholder={PLACEHOLDER}
        id="ts1"
        aria-label="Pick org"
        aria-labelledby="ext-org"
      />,
      'classic'
    );

    expect(namingSurface(widened.container)).toEqual(before);
    expect(widened.container.querySelector('#ts1')).toBeNull();
    expect(widened.container.querySelector('[aria-labelledby="ext-org"]')).toBeNull();
  });

  it('leaves rustic naming unchanged', () => {
    const base = renderWithEngine(
      <RusticTreeSelect treeData={treeData} placeholder={PLACEHOLDER} />,
      'rustic'
    );
    const before = namingSurface(base.container);

    const widened = renderWithEngine(
      <RusticTreeSelect
        treeData={treeData}
        placeholder={PLACEHOLDER}
        id="ts1"
        aria-label="Pick org"
        aria-labelledby="ext-org"
      />,
      'rustic'
    );

    expect(namingSurface(widened.container)).toEqual(before);
    expect(widened.container.querySelector('#ts1')).toBeNull();
    expect(widened.container.querySelector('[aria-labelledby="ext-org"]')).toBeNull();
  });
});
