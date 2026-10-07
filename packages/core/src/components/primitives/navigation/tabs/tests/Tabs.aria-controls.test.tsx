import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { describe, expect, it } from 'vitest';

import ModernTabs from '../engines/modern';
import type { TabItem } from '../contracts';

const WITH_PANELS: TabItem[] = [
  { key: 'overview', label: 'Overview', children: 'Overview body' },
  { key: 'billing', label: 'Billing', children: 'Billing body' },
  { key: 'history', label: 'History', children: 'History body' },
];
const PANEL_LESS: TabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'mine', label: 'Mine' },
];
const MIXED: TabItem[] = [
  { key: 'all', label: 'All' },
  { key: 'detail', label: 'Detail', children: 'Detail body' },
];

const tabs = () => screen.getAllByRole('tab');
const tab = (name: string) => screen.getByRole('tab', { name });
const controlling = () => tabs().filter((element) => element.hasAttribute('aria-controls'));

/** Every aria-controls resolves to a rendered tabpanel (the detail-panel integrity rule, mirrored). */
function expectIntegrity() {
  for (const element of tabs()) {
    const target = element.getAttribute('aria-controls');
    if (target === null) continue;
    const panel = document.getElementById(target);
    expect(panel, `${element.textContent} controls #${target}`).not.toBeNull();
    expect(panel).toHaveAttribute('role', 'tabpanel');
  }
}

async function validAttrValueViolations(container: HTMLElement): Promise<string[]> {
  const results = await axe.run(container, { runOnly: { type: 'rule', values: ['aria-valid-attr-value'] } });
  return results.violations.map((violation) => violation.id);
}

describe('Modern Tabs points aria-controls only at the rendered panel', () => {
  it('keeps every aria-controls resolvable to a tabpanel', () => {
    render(<ModernTabs items={WITH_PANELS} />);
    expectIntegrity();
  });

  it('puts aria-controls on the selected tab only, equal to the panel id, and the panel names that tab', async () => {
    const { container } = render(<ModernTabs items={WITH_PANELS} />);
    const panel = screen.getByRole('tabpanel');
    expect(controlling()).toEqual([tab('Overview')]);
    expect(tab('Overview')).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab('Overview').id);
    expect(await validAttrValueViolations(container)).toEqual([]);
  });

  it('moves the reference with the selection', () => {
    render(<ModernTabs items={WITH_PANELS} />);
    act(() => fireEvent.click(tab('Billing')));
    expect(controlling()).toEqual([tab('Billing')]);
    expect(tab('Overview')).not.toHaveAttribute('aria-controls');
    expect(tab('Billing')).toHaveAttribute('aria-controls', screen.getByRole('tabpanel').id);
    expectIntegrity();
  });

  it('gives a focused but unselected tab no reference in manual activation', () => {
    render(<ModernTabs items={WITH_PANELS} activationMode="manual" />);
    act(() => tab('Overview').focus());
    act(() => fireEvent.keyDown(tab('Overview'), { key: 'ArrowRight' }));
    expect(tab('Billing')).toHaveFocus();
    expect(tab('Billing')).toHaveAttribute('aria-selected', 'false');
    expect(tab('Billing')).not.toHaveAttribute('aria-controls');
    expect(controlling()).toEqual([tab('Overview')]);
    expectIntegrity();
  });

  it('renders a panel-less strip with no tabpanel and no aria-controls', async () => {
    const { container } = render(<ModernTabs items={PANEL_LESS} aria-label="Saved views" />);
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(controlling()).toEqual([]);
    expect(tab('All')).toHaveAttribute('aria-selected', 'true');
    expect(await validAttrValueViolations(container)).toEqual([]);
  });

  it('follows the same predicate per selection in a mixed array', () => {
    render(<ModernTabs items={MIXED} />);
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(controlling()).toEqual([]);

    act(() => fireEvent.click(tab('Detail')));
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Detail body');
    expect(controlling()).toEqual([tab('Detail')]);
    expectIntegrity();

    act(() => fireEvent.click(tab('All')));
    expect(screen.queryByRole('tabpanel')).toBeNull();
    expect(controlling()).toEqual([]);
  });

  it('still renders an empty panel for children: null, and the selected tab references it', () => {
    render(<ModernTabs items={[{ key: 'empty', label: 'Empty', children: null }, { key: 'other', label: 'Other' }]} />);
    const panel = screen.getByRole('tabpanel');
    expect(panel).toBeEmptyDOMElement();
    expect(tab('Empty')).toHaveAttribute('aria-controls', panel.id);
    expect(tab('Other')).not.toHaveAttribute('aria-controls');
  });
});
