/** The KPI value carries no unit it was not given: `suffix` belongs to the value,
 *  so deriving it from `change` made a count of 18 tickets read "18 %". */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { CommandCenterSurface } from '../index';
import { DashboardSurface } from '../../../data/dashboard';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function statCardFor(container: HTMLElement, label: string): HTMLElement {
  const title = screen.getByText(label);
  const card = title.closest('[data-part="card"]');
  if (!(card instanceof HTMLElement)) {
    throw new Error(`no stat card found for label ${label}`);
  }
  return card;
}

describe('CommandCenterSurface KPI units', () => {
  it('keeps a count value bare while the trend keeps its own percent', async () => {
    const { container } = renderSurface(
      <CommandCenterSurface
        title="Operations Hub"
        stats={[
          { key: 'open-tickets', label: 'Open tickets', value: 18, change: { value: 4, direction: 'down' } },
        ]}
      />,
      { engine: 'modern' },
    );

    await screen.findByText('Open tickets');
    const card = statCardFor(container, 'Open tickets');

    const value = card.querySelector('[data-part="value"]');
    expect(value).not.toBeNull();
    expect(value?.textContent?.trim()).toBe('18');
    // The regression: a suffix element must not be synthesized from the trend.
    expect(value?.querySelector('[data-part="suffix"]')).toBeNull();
    expect(card.querySelector('[data-part="suffix"]')).toBeNull();

    // The delta still carries its own unit, so no information was lost.
    const trend = card.querySelector('[data-part="trend"]');
    expect(trend).not.toBeNull();
    expect(trend?.textContent).toContain('4%');
    expect(trend?.getAttribute('data-change')).toBe('decrease');
  });

  it('keeps a percentage KPI unit explicit instead of silently dropping it', async () => {
    // StatItem exposes no `suffix`, so the contract convention is to carry the
    // unit in the label; a unit-bearing string value would be parsed away.
    const { container } = renderSurface(
      <CommandCenterSurface
        title="Operations Hub"
        stats={[
          { key: 'sla', label: 'SLA compliance (%)', value: 98, change: { value: 1.1, direction: 'up' } },
        ]}
      />,
      { engine: 'modern' },
    );

    await screen.findByText('SLA compliance (%)');
    const card = statCardFor(container, 'SLA compliance (%)');

    expect(card.textContent).toContain('(%)');
    const value = card.querySelector('[data-part="value"]');
    expect(value?.textContent?.trim()).toBe('98');
    expect(card.querySelector('[data-part="suffix"]')).toBeNull();

    const trend = card.querySelector('[data-part="trend"]');
    expect(trend?.textContent).toContain('1.1%');
    expect(trend?.getAttribute('data-change')).toBe('increase');
  });

  // Without this the null assertions above could pass on a wrong selector.
  it('renders the suffix hook when a surface genuinely supplies a unit', async () => {
    const { container } = renderSurface(
      <DashboardSurface
        config={{
          visual: {},
          presentation: { chrome: { title: 'Operations dashboard' } },
          behavior: {
            stats: [{ key: 'tth', label: 'Avg. time to hire', value: 21, suffix: ' days' }],
          },
        }}
      />,
      { engine: 'modern' },
    );

    await screen.findByText('Avg. time to hire');
    const card = statCardFor(container, 'Avg. time to hire');
    const suffix = card.querySelector('[data-part="suffix"]');
    expect(suffix).not.toBeNull();
    expect(suffix?.textContent).toContain('days');
    // The suffix renders INSIDE the value node, which is why the assertions
    // above can read a bare number as proof that no unit was synthesized.
    const value = card.querySelector('[data-part="value"]');
    expect(value?.textContent?.trim()).toBe('21 days');
    expect(value?.textContent?.replace(suffix?.textContent ?? '', '').trim()).toBe('21');
  });

  it('does not attach a unit to a KPI that has no trend at all', async () => {
    const { container } = renderSurface(
      <CommandCenterSurface
        title="Operations Hub"
        stats={[{ key: 'projects', label: 'Active projects', value: 7 }]}
      />,
      { engine: 'modern' },
    );

    await screen.findByText('Active projects');
    const card = statCardFor(container, 'Active projects');

    expect(card.querySelector('[data-part="value"]')?.textContent?.trim()).toBe('7');
    expect(card.querySelector('[data-part="suffix"]')).toBeNull();
    expect(card.querySelector('[data-part="trend"]')).toBeNull();
  });
});
