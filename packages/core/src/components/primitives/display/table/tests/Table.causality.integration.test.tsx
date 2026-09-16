/**
 * The table family in a real browser: the decisions its derived channels
 * consume move a destination's computed style with a negative control, and no
 * gated vertical mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernTable from '../engines/modern';
import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { ColumnType } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

interface Row {
  id: string;
  name: string;
  score: number;
}

const COLUMNS: ColumnType<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  { key: 'score', title: 'Score', dataIndex: 'score', align: 'right', fieldType: 'number' },
];

const DATA: Row[] = [
  { id: 'a', name: 'Alpha', score: 1 },
  { id: 'b', name: 'Beta', score: 2 },
];

const TENANT: TenantConfig = {
  slug: 'causality',
  name: 'Causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: ['testing'],
  branding: { companyName: 'Causality' },
};

const table = renderToStaticMarkup(
  <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" skipCssLoading>
  <div style={{ inlineSize: '48rem' }}>
    <ModernTable
      columns={COLUMNS}
      dataSource={DATA}
      rowKey="id"
      title={() => 'Quarterly results'}
      pagination={{ current: 1, pageSize: 1, total: 2 }}
    />
  </div>
  </DesignSystemProvider>,
);

const markup = `<div id="table">${table}</div>`;

const TITLE = "#table [data-part='title']";
const PAGE_BUTTON = "#table [data-part='pagination-button']";
const PAGINATION = "#table [data-part='pagination']";

describeCausality({
  family: 'table',
  markup,
  targets: [
    { id: 'titleWeight', selector: TITLE, property: 'font-weight' },
    { id: 'titleGap', selector: TITLE, property: 'margin-bottom' },
    { id: 'pageSize', selector: PAGE_BUTTON, property: 'font-size' },
    { id: 'pageGap', selector: PAGINATION, property: 'margin-top' },
    { id: 'tableFont', selector: "#table [data-part='table']", property: 'font-size' },
  ],
  decisions: {
    // `--ds-table-pagination-font-size` derives from the supporting type role,
    // so the type scale moves it while the spacing ramp holds.
    // `tableFont` moving is the single-font-authority proof: a literal fallback
    // embedded in the skin would hold it still.
    'typography.scale': { value: 1.08, moves: ['pageSize', 'tableFont'], holds: 'titleWeight', in: VERTICALS },
    // `--ds-table-title-margin-block-end` and `--ds-table-pagination-margin-block-start`
    // derive from the spacing ramp, which carries the density scale.
    'density.mode': { value: 'spacious', moves: ['titleGap', 'pageGap'], holds: 'pageSize', in: VERTICALS },
  },
});

/**
 * Measured debt, pinned by node IDENTITY, not by count: a repaired node, a new
 * node and a same-count swap all go red. The page counter fails in EVERY gated
 * scope, so its ink is a systemic defect, not a dark-mode one; the title and
 * the header titles fail only in the dark scopes. The fix is a mode-aware ink
 * derivation, never an axe exclusion. Registered, never hidden.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      'div[data-part="title"]',
      'span[data-part="pagination-range"]',
      'th:nth-child(1) > div[data-part="header-content"] > span[data-part="header-title"]',
      'th:nth-child(2) > div[data-part="header-content"] > span[data-part="header-title"]',
    ],
  },
  'bithire light': { 'color-contrast': ['span[data-part="pagination-range"]'] },
  'evnto light': { 'color-contrast': ['span[data-part="pagination-range"]'] },
  'rottay dark': {
    'color-contrast': [
      'div[data-part="title"]',
      'span[data-part="pagination-range"]',
    ],
  },
};

describe('table derived channels and accessibility', () => {
  it('derives the title weight and the numeric postures from the family deriver', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'titleWeight', selector: TITLE, property: 'font-weight' },
        { id: 'semibold', selector: TITLE, property: '--ds-font-weight-semibold' },
        { id: 'cellNumeric', selector: "#table [data-part='cell'][data-field-type='number']", property: 'font-variant-numeric' },
        { id: 'pageNumeric', selector: "#table [data-part='pagination-range']", property: 'font-variant-numeric' },
      ],
    });
    const r = result.base!;
    // The deriver relates the title weight to the foundation role, not a literal.
    expect(r.titleWeight).toBe(r.semibold.trim());
    // Figures align in a column on both the cell and the page counter.
    expect(r.cellNumeric).toBe('tabular-nums');
    expect(r.pageNumeric).toBe('tabular-nums');
  }, 60_000);

  it('paints the geometry the skin owns, measured rather than read off the stylesheet', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'cellPadTop', selector: "#table [data-part='cell']", property: 'padding-top' },
        { id: 'cellPadLeft', selector: "#table [data-part='cell']", property: 'padding-left' },
        { id: 'numericAlign', selector: "#table [data-part='cell'][data-align='right']", property: 'text-align' },
        { id: 'sortRing', selector: "#table [data-sortable='true']", property: 'outline-style', attributes: { 'data-state': 'focused focus-visible' } },
        { id: 'loadingOpacity', selector: "#table [data-part='scroll-container']", property: 'opacity', attributes: { 'data-loading': 'true' } },
        { id: 'pageHeight', selector: PAGE_BUTTON, property: 'height' },
      ],
    });
    const r = result.base!;
    // The sticky header is NOT measured here: this markup mounts no sticky
    // table, so that claim stays with its text pin until a sticky arm exists.
    // Size-keyed padding resolves, rather than the rule merely existing in text.
    expect(Number.parseFloat(r.cellPadTop)).toBeGreaterThan(0);
    expect(Number.parseFloat(r.cellPadLeft)).toBeGreaterThan(Number.parseFloat(r.cellPadTop));
    expect(r.numericAlign).toBe('right');
    expect(r.sortRing).not.toBe('none');
    expect(Number(r.loadingOpacity)).toBeLessThan(1);
    expect(Number.parseFloat(r.pageHeight)).toBeGreaterThan(0);
  }, 60_000);

  it('carries no serious axe finding beyond the pinned contrast debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    // The whole map at once: a repaired scope is a change too, and must be
    // re-adjudicated rather than silently absorbed.
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
