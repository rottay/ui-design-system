/**
 * The saved-views family in a real browser: each decision its channels consume moves
 * the family's own paint with a negative control, and axe holds beyond the pinned debt.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import type { SavedView } from '../contracts';
import ModernSavedViewsBar from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

const views: SavedView[] = [
  { id: 'all', name: 'All items', isDefault: true, config: { layout: 'table' } },
  { id: 'active', name: 'Active only', config: { filters: { status: 'active' } } },
];

const markup = renderToStaticMarkup(
  <EngineProvider defaultEngine="modern">
    <ModernSavedViewsBar
      views={views}
      activeViewId="all"
      onViewSelect={noop}
      onViewSave={noop}
      onViewDelete={noop}
      onViewRename={noop}
      onViewCreate={noop}
    />
  </EngineProvider>,
);

const ACTIVE = "[data-testid='view-tab-all']";
const MENU = `${ACTIVE} [data-part='menu-trigger']`;

describeCausality({
  family: 'saved-views',
  markup,
  targets: [
    { id: 'activeFill', selector: ACTIVE, property: 'background-color' },
    { id: 'pillPad', selector: ACTIVE, property: 'padding-top' },
    { id: 'pillSize', selector: ACTIVE, property: 'font-size' },
    { id: 'menuCorner', selector: MENU, property: 'border-top-left-radius' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['activeFill'], holds: 'pillPad', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['pillPad'], holds: 'activeFill', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['menuCorner'], holds: 'pillPad', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['pillSize'], holds: 'activeFill', in: VERTICALS },
  },
});

// Measured contrast debt pinned by node identity; the fix is ink derivation, never an axe exclusion.
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      'div[data-testid="view-tab-active"] > .ds-saved-views__pill-select.ds-button--sm[data-part="pill-select"] > span[data-part="content"][data-state="visible"] > span[data-part="label"]',
    ],
  },
};

describe('saved-views accessibility', () => {
  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
