import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { FieldFiltersPanel } from '..';
import type { FieldFilterDefinition, FieldFilterPreset } from '..';
import { renderWithEngine } from '@tests/support/engine';
import {
  readSkinRules,
  unreachableSelectors,
  waitForComposedContent,
  type SkinRule,
} from '@tests/support/skin-reachability';

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

/**
 * Readiness is gated on the CONTROL LANDINGS, never on the panel's own title.
 * Every control is a separately-imported engine primitive behind its own
 * `<Suspense fallback={null}>`, so the panel's Box/Flex/Text tree — title
 * included — renders while the Selects and the Input are still absent. A
 * title gate samples that state and reads three control rules as dead; it is
 * load-dependent, which is why it survived in isolation and failed in the
 * suite. See the composition law in the skin-reachability helper.
 */
async function renderPanel() {
  const result = renderWithEngine(
    <FieldFiltersPanel
      filters={FILTERS}
      presets={PRESETS}
      values={{ status: 'active', joinedAt: '', owner: '' }}
      onChange={() => undefined}
    />,
    'modern'
  );
  await waitForComposedContent(
    waitFor,
    result.container,
    '.ds-field-filters-panel__control',
    FILTERS.length
  );
  return result;
}

describe('FieldFiltersPanel skin reachability', () => {
  it('matches every authored selector against the rendered panel', async () => {
    const { container } = await renderPanel();

    const rules = readSkinRules('field-filters-panel');
    expect(rules.length, 'skin parsed to nothing — the read is broken').toBeGreaterThan(20);

    expect(unreachableSelectors({ rules, scopes: [container] })).toEqual([]);
  });

  it('reports the spaced root form as unreachable (positive control)', async () => {
    const { container } = await renderPanel();

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
    const { container } = await renderPanel();

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

  it('fails closed when a composed primitive never mounts (gate control)', async () => {
    const { container } = await renderPanel();

    // A readiness gate that cannot fail is the same defect as a census that
    // finds nothing and passes: it would let a control-less panel be measured
    // as if it were complete, and every control rule would read dead.
    await expect(
      waitForComposedContent(
        waitFor,
        container,
        '.ds-field-filters-panel__control',
        FILTERS.length + 1
      )
    ).rejects.toThrow(/composed primitive not mounted/);
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
