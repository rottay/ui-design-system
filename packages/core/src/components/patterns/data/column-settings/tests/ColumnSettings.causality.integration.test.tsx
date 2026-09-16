/**
 * The column-settings family in a real browser: each decision its channels consume moves
 * the family's own paint with a negative control, and axe holds beyond the pinned debt.
 */
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import ModernColumnSettingsDropdown from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

async function panelMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <EngineProvider defaultEngine="modern">
      <ModernColumnSettingsDropdown
        allColumns={[
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' },
          { key: 'owner', header: 'Owner' },
        ]}
        visibleColumns={['name', 'status']}
        lockedColumns={[]}
        columnOrder={['name', 'status', 'owner']}
        pinnedColumns={{ left: [], right: [] }}
        onToggleVisibility={noop}
        onReorder={noop}
        onTogglePin={noop}
        onReset={noop}
      />
    </EngineProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const markup = await panelMarkup();

const ROOT = ".ds-column-settings[data-part='root']";
const ROW = `${ROOT} [data-part='row']`;
const TITLE = `${ROOT} [data-part='title']`;

describeCausality({
  family: 'column-settings',
  markup,
  targets: [
    { id: 'rowGap', selector: ROW, property: 'column-gap' },
    { id: 'rowCorner', selector: ROW, property: 'border-top-left-radius' },
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
  ],
  decisions: {
    'density.mode': { value: 'spacious', moves: ['rowGap'], holds: 'rowCorner', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['rowCorner'], holds: 'rowGap', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'rowCorner', in: VERTICALS },
  },
});

// Measured contrast debt pinned by node identity; the fix is ink derivation, never an axe exclusion.
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#input-_R_3_',
      'span[data-part="counter"]',
      'span[data-part="title"]',
      'span[title="Name"]',
      'span[title="Owner"]',
      'span[title="Status"]',
    ],
  },
  'bithire light': { 'color-contrast': ['span[data-part="counter"]', 'span[title="Owner"]'] },
  'evnto light': { 'color-contrast': ['span[data-part="counter"]', 'span[title="Owner"]'] },
  'rottay dark': { 'color-contrast': ['#input-_R_3_'] },
};

describe('column-settings accessibility', () => {
  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
