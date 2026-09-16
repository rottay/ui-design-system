/**
 * The list-toolbar family in a real browser: each decision its channels consume moves
 * the family's own paint with a negative control, and axe holds beyond the pinned debt.
 */
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernListToolbar from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

const TENANT: TenantConfig = {
  slug: 'list-toolbar-causality',
  name: 'List toolbar causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'List toolbar causality' },
};

async function desktopMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernListToolbar
        title="Candidates"
        totalCount={42}
        search=""
        onSearchChange={noop}
        filterPills={[
          {
            key: 'status',
            label: 'Status',
            value: 'active',
            options: [
              { label: 'All', value: 'all' },
              { label: 'Active', value: 'active' },
            ],
          },
        ]}
        activeFilters={{ status: 'active' }}
        activeFilterCount={1}
        onFilterChange={noop}
        onClearFilters={noop}
        viewMode="list"
        onViewModeChange={noop}
        density="comfortable"
        onDensityChange={noop}
        primaryAction={{ label: 'Add candidate', onClick: noop }}
      />
    </DesignSystemProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const markup = await desktopMarkup();

const SHELL = ".ds-pattern-list-toolbar[data-part='root']";
const ROW = '.ds-list-toolbar__main-row';
const TRIGGER = '.ds-list-toolbar__filter-trigger';
const TITLE = '.ds-list-toolbar__title';

describeCausality({
  family: 'list-toolbar',
  markup,
  targets: [
    { id: 'triggerInk', selector: TRIGGER, property: 'color' },
    { id: 'rowPad', selector: ROW, property: 'padding-left' },
    { id: 'shellCorner', selector: SHELL, property: 'border-top-left-radius' },
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['triggerInk'], holds: 'rowPad', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['rowPad'], holds: 'triggerInk', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['shellCorner'], holds: 'rowPad', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'shellCorner', in: VERTICALS },
  },
});

const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('list-toolbar accessibility', () => {
  it('renders the desktop row the probes read', () => {
    expect(markup).toContain('data-container-layout="full"');
    expect(markup).toContain('data-part="main-row"');
  });

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
