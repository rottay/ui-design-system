/**
 * The filter-panel family in a real browser: each decision its channels consume moves
 * the family's own paint with a negative control, and axe holds beyond the pinned debt.
 */
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import type { FilterDef } from '../contracts';
import ModernFilterPanel from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const FILTERS: FilterDef[] = [
  { key: 'query', label: 'Query', type: 'text', placeholder: 'Search' },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'live', label: 'Live' },
    ],
  },
  { key: 'capacity', label: 'Capacity', type: 'number-range' },
];

async function panelMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <EngineProvider defaultEngine="modern">
      <ModernFilterPanel filters={FILTERS} values={{}} onChange={() => {}} />
    </EngineProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const markup = await panelMarkup();

const ROOT = '.ds-pattern-filter-panel';
const FIELDS = `${ROOT} [data-part='fields']`;
const LABEL = `${ROOT} [data-part='field-label']`;

describeCausality({
  family: 'filter-panel',
  markup,
  targets: [
    { id: 'fieldsGap', selector: FIELDS, property: 'row-gap' },
    { id: 'labelSize', selector: LABEL, property: 'font-size' },
    { id: 'labelInk', selector: LABEL, property: 'color' },
  ],
  decisions: {
    'density.mode': { value: 'spacious', moves: ['fieldsGap'], holds: 'labelInk', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['labelSize'], holds: 'labelInk', in: VERTICALS },
  },
});

// Measured contrast debt pinned by node identity; the fix is ink derivation, never an axe exclusion.
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#input-_R_9d_',
      'div[data-part="field-row"]:nth-child(1) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(2) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(3) > span[data-part="field-label"]',
      'input[placeholder="Max"]',
      'input[placeholder="Min"]',
      'span[data-part="placeholder"]',
      'span[data-part="range-separator"]',
    ],
  },
  'bithire light': {
    'color-contrast': [
      'div[data-part="field-row"]:nth-child(1) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(2) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(3) > span[data-part="field-label"]',
      'span[data-part="placeholder"]',
      'span[data-part="range-separator"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'div[data-part="field-row"]:nth-child(1) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(2) > span[data-part="field-label"]',
      'div[data-part="field-row"]:nth-child(3) > span[data-part="field-label"]',
      'span[data-part="placeholder"]',
      'span[data-part="range-separator"]',
    ],
  },
  'rottay dark': { 'color-contrast': ['#input-_R_9d_', 'input[placeholder="Max"]', 'input[placeholder="Min"]'] },
};

describe('filter-panel accessibility', () => {
  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
