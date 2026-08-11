import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { FieldFiltersPanel } from '..';
import type { FieldFilterDefinition, FieldFilterPreset } from '..';
import { renderWithEngine } from '../../../../../tooling/testing/helpers/engine';
import {
  readSkinRules,
  unreachableSelectors,
  type SkinRule,
} from '../../../../../tooling/testing/helpers/skin-reachability';

/**
 * Every authored selector must match a node the panel renders.
 *
 * Seven rules failed this for their whole life: they were written
 * `.ds-field-filters-panel [data-part='root'] …` with a SPACE, which asks for a
 * second root-parted element nested inside the family, and nothing renders one.
 * Four of the declarations they carried (both `display: block` reads, the
 * description offset, the control-slot floor) were live inline styles before the
 * geometry drain, so the drain deleted painted layout without touching a value.
 */

const FILTERS: FieldFilterDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All statuses',
    options: [{ value: 'active', label: 'Active' }],
  },
  { key: 'joinedAt', label: 'Joined', type: 'date-range', placeholder: 'Any time' },
  { key: 'owner', label: 'Owner', type: 'multi-select', placeholder: 'Search owner' },
];

const PRESETS: FieldFilterPreset[] = [
  { key: 'active', label: 'Active only', values: { status: 'active' } },
];

function renderPanel() {
  return renderWithEngine(
    <FieldFiltersPanel
      filters={FILTERS}
      presets={PRESETS}
      values={{ status: 'active', joinedAt: '', owner: '' }}
      onChange={() => undefined}
    />,
    'modern'
  );
}

describe('FieldFiltersPanel skin reachability', () => {
  it('matches every authored selector against the rendered panel', async () => {
    const { container } = renderPanel();
    expect(await screen.findByText('Advanced filters')).toBeTruthy();

    const rules = readSkinRules('field-filters-panel');
    expect(rules.length, 'skin parsed to nothing — the read is broken').toBeGreaterThan(20);

    expect(unreachableSelectors({ rules, scopes: [container] })).toEqual([]);
  });

  it('reports the spaced root form as unreachable (positive control)', async () => {
    const { container } = renderPanel();
    expect(await screen.findByText('Advanced filters')).toBeTruthy();

    // The exact shape this file was repaired from. A harness that cannot see it
    // would have reported the seven dead rules as healthy.
    const planted: SkinRule[] = [
      {
        selector:
          ".ds-structure.ds-field-filters-panel [data-part='root'] [data-part='control-slot']",
        conditions: '',
        decls: { 'margin-block-start': 'auto' },
      },
    ];

    expect(unreachableSelectors({ rules: planted, scopes: [container] })).toEqual([
      planted[0].selector,
    ]);
  });

  it('keeps the repaired layout reads on the elements that lost them', async () => {
    const { container } = renderPanel();
    expect(await screen.findByText('Advanced filters')).toBeTruthy();

    // The composed label and description are inline spans; without a block read
    // they set on one line. The control slot is what lands every card's control
    // on a common floor inside the auto-fit grid.
    for (const selector of [
      ".ds-structure.ds-field-filters-panel[data-part='root'] [data-part='filter-card-label'][data-size]",
      ".ds-structure.ds-field-filters-panel[data-part='root'] [data-part='filter-card-description'][data-size]",
      ".ds-structure.ds-field-filters-panel[data-part='root'] [data-part='control-slot']",
    ]) {
      expect(
        container.querySelectorAll(selector).length,
        `${selector} matches nothing`
      ).toBeGreaterThan(0);
    }
  });

  it('states no size or weight on a composed Text part', () => {
    // modern paints both inline from the type-role channels, so a literal here
    // could only lose — and reviving one would replace a tenant channel.
    const offenders = readSkinRules('field-filters-panel')
      .filter((rule) => /\[data-size\]/.test(rule.selector))
      .filter((rule) => 'font-size' in rule.decls || 'font-weight' in rule.decls)
      .map((rule) => rule.selector);

    expect(offenders).toEqual([]);
  });
});
