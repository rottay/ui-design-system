/**
 * The panel names its three Flex rows (`header`, `title-group`, `presets-row`)
 * so its own skin can address them, and the Modern Flex skin must still lay
 * those rows out. Measured in Chromium under both reading directions, with an
 * unnamed Flex carrying the same props as the default control.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { FieldFiltersPanel, type FieldFilterDefinition, type FieldFilterPreset } from '..';
import ModernFlex from '@/components/primitives/layout/flex/engines/modern';
import { renderWithEngine } from '@tests/support/engine';
import { measureArms } from '@tests/support/family-causality';
import { waitForComposedContent } from '@tests/support/skin-reachability';

const FILTERS: FieldFilterDefinition[] = [
  { key: 'stage', label: 'Stage', type: 'select', options: [{ value: 'open', label: 'Open' }] },
];

const PRESETS: FieldFilterPreset[] = [
  { key: 'open', label: 'Open only', values: { stage: 'open' } },
  { key: 'all', label: 'Everything', values: { stage: '' } },
];

let panel = '';

const control = renderToStaticMarkup(
  <ModernFlex align="center" gap={10} wrap="wrap">
    <span>One</span>
    <span>Two</span>
  </ModernFlex>,
);

const markup = () => `<div id="panel" style="inline-size: 48rem">${panel}</div><div id="control">${control}</div>`;

const ROWS = {
  header: { selector: "#panel [data-component='flex'][data-part='header']", justify: 'space-between', gap: '12px' },
  titleGroup: { selector: "#panel [data-component='flex'][data-part='title-group']", justify: 'flex-start', gap: '8px' },
  presetsRow: { selector: "#panel [data-component='flex'][data-part='presets-row']", justify: 'flex-start', gap: '10px' },
  control: { selector: "#control > [data-component='flex']", justify: 'flex-start', gap: '10px' },
} as const;

const PROPERTIES = ['display', 'flex-wrap', 'justify-content', 'align-items', 'column-gap'] as const;

describe('FieldFiltersPanel Flex rows keep their part and their layout', () => {
  beforeAll(async () => {
    const { container, unmount } = renderWithEngine(
      <FieldFiltersPanel filters={FILTERS} presets={PRESETS} values={{ stage: '' }} onChange={() => undefined} />,
      'modern',
    );
    await waitForComposedContent(waitFor, container, '.ds-field-filters-panel__control', FILTERS.length);
    panel = container.innerHTML;
    unmount();
  });

  it('renders every named row and a default-part control', () => {
    for (const part of ['header', 'title-group', 'presets-row']) {
      expect(panel).toContain(`data-part="${part}"`);
    }
    expect(control).toContain('data-part="root"');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    it(`lays out each row in ${dir}`, async () => {
      const result = await measureArms({
        vertical: 'bithire',
        markup: markup(),
        arms: { base: {} },
        targets: [
          ...Object.entries(ROWS).flatMap(([row, { selector }]) =>
            PROPERTIES.map((property) => ({ id: `${row}:${property}`, selector, property, dir })),
          ),
          { id: 'firstPresetLeft', selector: "#panel [data-part='presets-pill']", property: '@rect.left', dir },
          { id: 'firstPresetRight', selector: "#panel [data-part='presets-pill']", property: '@rect.right', dir },
          { id: 'rowLeft', selector: ROWS.presetsRow.selector, property: '@rect.left', dir },
          { id: 'rowRight', selector: ROWS.presetsRow.selector, property: '@rect.right', dir },
        ],
      });
      const r = result.base!;

      for (const [row, expected] of Object.entries(ROWS)) {
        expect(r[`${row}:display`], row).toBe('flex');
        expect(r[`${row}:flex-wrap`], row).toBe('wrap');
        expect(r[`${row}:align-items`], row).toBe('center');
        expect(r[`${row}:justify-content`], row).toBe(expected.justify);
        expect(r[`${row}:column-gap`], row).toBe(expected.gap);
      }

      // The row starts at the inline start of the reading direction.
      if (dir === 'ltr') {
        expect(Number(r.firstPresetLeft)).toBe(Number(r.rowLeft));
      } else {
        expect(Number(r.firstPresetRight)).toBe(Number(r.rowRight));
      }
    }, 60_000);
  }
});
