/**
 * The data-table family in a real browser: every decision the family deriver
 * declares in `consumes` is exercised against the family's OWN computed paint
 * with a negative control, the consumes that reach nothing are pinned as such
 * rather than probed with a borrowed reading, and axe holds beyond the pinned
 * debt.
 */
import React, { Suspense } from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import type { ColumnDef } from '@/foundation/contracts/runtime/components/patterns/core';
import type { DocumentViewportHint } from '@/infrastructure/runtime/foundation/root-attributes/ssr';
import { PatternDataTable } from '..';
import type { DataTablePatternProps } from '../contracts';
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
  status: string;
  owner: string;
  score: number;
}

const COLUMNS: ColumnDef<Row>[] = [
  { key: 'name', header: 'Role', accessorKey: 'name', sortable: true },
  { key: 'status', header: 'Status', accessorKey: 'status', sortable: true },
  { key: 'owner', header: 'Owner', accessorKey: 'owner' },
  { key: 'score', header: 'Score', accessorKey: 'score', align: 'right' },
];

const DATA: Row[] = [
  { id: 'a', name: 'Staff engineer', status: 'Screening', owner: 'Ada', score: 1 },
  { id: 'b', name: 'Product designer', status: 'Offer', owner: 'Grace', score: 2 },
];

const ADAPT: DataTablePatternProps<Row>['adapt'] = {
  phone: { columns: { keep: ['name', 'status'] }, presentation: 'cards' },
};

const noop = () => {};

function tenant(locale: 'en' | 'es'): TenantConfig {
  return {
    slug: 'data-table-causality',
    name: 'Data table causality',
    theme: 'base',
    locale,
    fallbackLocale: locale,
    plan: 'enterprise',
    features: ['testing'],
    branding: { companyName: 'Data table causality' },
  };
}

/**
 * The family's server markup, kept whole as the list-toolbar precedent keeps
 * it. The phone posture renders the custom mobile-card projection, which is the
 * only data-table surface that paints a focus channel.
 *
 * The desktop prelude defers four boundaries (`B:0`..`B:3`) whose content React
 * emits into `<div hidden id="S:n">` completion containers: the page-14 and
 * page-1235 pagination buttons, the next-page nav button and the bulk-action
 * button. Nothing removes them, but `[hidden]` keeps them out of the audited
 * DOM, so the axe arm below never reaches those four nested Button instances.
 * Every probed reading is a data-table part, not a nested primitive.
 */
async function serverMarkup(
  viewport: DocumentViewportHint,
  locale: 'en' | 'es' = 'en',
  density?: DataTablePatternProps<Row>['density'],
  overrides?: Partial<DataTablePatternProps<Row>>,
): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={tenant(locale)}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport={viewport}
    >
      <Suspense fallback={<div>Loading</div>}>
        <PatternDataTable<Row>
          engine="modern"
          columns={COLUMNS}
          data={DATA}
          rowKey="id"
          adapt={ADAPT}
          toolbar={<span>Toolbar</span>}
          selectable
          selectedKeys={['a']}
          onSelectionChange={noop}
          sorting={{ key: 'name', direction: 'asc' }}
          onSortChange={noop}
          actions={(row) => <span>Open {row.name}</span>}
          bulkActions={[{ key: 'archive', label: 'Archive', onExecute: noop }]}
          pagination={{ current: 13, pageSize: 1000, total: 1234567, onChange: noop }}
          messages={{ tableLabel: 'Roles' }}
          mobileCard={viewport === 'phone' ? (row) => <span>{row.name}</span> : undefined}
          density={density}
          {...overrides}
        />
      </Suspense>
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((resolve, reject) => {
    prelude
      .pipe(
        new Writable({
          write(chunk, _encoding, done) {
            html += chunk.toString();
            done();
          },
        }),
      )
      .on('finish', () => resolve())
      .on('error', reject);
  });
  return html;
}

const grid = await serverMarkup('desktop');
const cards = await serverMarkup('phone');
const spanishGrid = await serverMarkup('desktop', 'es');

const markup = `<div id="grid">${grid}</div><div id="cards" style="inline-size:24rem">${cards}</div>`;

/**
 * The same table twice, once per density posture. It is a SEPARATE markup
 * string: adding a third table to `markup` would shift every axe `:nth-child`
 * path the debt map pins.
 */
const compactGrid = await serverMarkup('desktop', 'en', 'compact');
const densityPair = `<div id="comfortable">${grid}</div><div id="compact">${compactGrid}</div>`;

/**
 * The grouped posture, also a separate markup string. The three readers of the
 * section-title role weight are the empty/error state title, the group header
 * cell and the editorial leading cell; the group header is the one a populated,
 * default-recipe table renders, so it is where the weight posture is measured.
 */
const groupedGrid = await serverMarkup('desktop', 'en', undefined, { groupBy: 'status' });
const groupedMarkup = `<div id="grouped">${groupedGrid}</div>`;

const CELL = "#grid [data-part='data-cell']";
const HEAD = "#grid [data-part='header-cell']";
const SORT_ICON = "#grid [data-part='sort-icon']";
const SELECTION_CELL = "#grid [data-part='selection-cell']";
const TOOLBAR = "#grid [data-part='toolbar']";
const BULK_BAR = "#grid [data-part='bulk-bar']";
const PAGE_BAR = "#grid [data-part='pagination-bar']";
const RANGE = "#grid [data-part='pagination-range']";
const HEAD_CONTENT = "#grid [data-part='header-content']";
const CUSTOM_CARD = "#cards [data-part='mobile-card-custom'][data-selected='true']";

describeCausality({
  family: 'data-table',
  markup,
  targets: [
    { id: 'cellFont', selector: CELL, property: 'font-size' },
    { id: 'headFont', selector: HEAD, property: 'font-size' },
    { id: 'bulkCountFont', selector: "#grid [data-part='bulk-bar-count']", property: 'font-size' },
    { id: 'sortInk', selector: SORT_ICON, property: 'color' },
    { id: 'rowSelectedBg', selector: "#grid [data-part='body-row'][data-selected='true']", property: 'background-color' },
    { id: 'bulkBg', selector: BULK_BAR, property: 'background-color' },
    { id: 'headFocusRing', selector: `${HEAD}[data-sortable='true']`, property: 'box-shadow', attributes: { 'data-state': 'focus-visible' } },
    { id: 'cardSelectedInk', selector: CUSTOM_CARD, property: 'outline-color' },
    { id: 'bulkCorner', selector: BULK_BAR, property: 'border-end-start-radius' },
    { id: 'pageBarCorner', selector: PAGE_BAR, property: 'border-end-start-radius' },
    { id: 'cardCorner', selector: CUSTOM_CARD, property: 'border-top-left-radius' },
    { id: 'bulkShadow', selector: BULK_BAR, property: 'box-shadow' },
    { id: 'cardSelectedRing', selector: CUSTOM_CARD, property: 'outline-width' },
    { id: 'toolbarGap', selector: TOOLBAR, property: 'row-gap' },
    { id: 'headContentGap', selector: HEAD_CONTENT, property: 'column-gap' },
    { id: 'pageBarPad', selector: PAGE_BAR, property: 'padding-top' },
    { id: 'bulkBarPad', selector: BULK_BAR, property: 'padding-top' },
    { id: 'sortControlSize', selector: SORT_ICON, property: 'width' },
  ],
  decisions: {
    // `consumes: palette.*` -- the sort ink, the selected row and bulk-bar
    // grounds, the sortable header's focus shadow and the selected mobile
    // card's ring all resolve from the seeded ramp.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['sortInk', 'rowSelectedBg', 'bulkBg', 'headFocusRing', 'cardSelectedInk'],
      holds: 'bulkCorner',
      in: VERTICALS,
    },
    // `consumes: typography.roles` -- the cell, header and chrome type steps
    // all resolve through the role ramp the type scale moves. The WEIGHT half
    // of the same keypath reaches nothing; see the inert inventory below.
    'typography.scale': {
      value: 1.08,
      moves: ['cellFont', 'headFont', 'bulkCountFont'],
      holds: 'bulkCorner',
      in: VERTICALS,
    },
    // `consumes: surfaces.radiusScale` -- the card's closing corners on both
    // chrome bars, and the selected mobile card's own corner.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['bulkCorner', 'pageBarCorner', 'cardCorner'],
      holds: 'sortInk',
      in: VERTICALS,
    },
    // `consumes: surfaces.elevation` -- the bulk bar is the family's only
    // elevated chrome, and it reads the ramp directly.
    'surfaces.elevation-posture': {
      value: 'elevated',
      moves: ['bulkShadow'],
      holds: 'bulkCorner',
      in: VERTICALS,
    },
    // `consumes: states.focus` -- the selected mobile card's ring width is the
    // family's single reader of a focus-signature channel.
    'states.focus-style': {
      value: 'glow',
      moves: ['cardSelectedRing'],
      holds: 'bulkCorner',
      in: VERTICALS,
    },
    // `consumes: density` -- the toolbar rhythm rides the density-scaled
    // spacing ramp through the posture the root stamps.
    'density.mode': {
      value: 'spacious',
      moves: ['toolbarGap'],
      holds: 'bulkCorner',
      in: VERTICALS,
    },
    // `consumes: spacing.rhythm` -- every gap and layout padding the family
    // owns: the toolbar and header-content gaps, and the two chrome bars'
    // padding. The cell paddings are deliberately NOT on this axis: a cell's
    // block padding sets row height together with the Table primitive's own
    // `--ds-table-padding-*`, which rhythm must not move, so scaling only the
    // family's half would misalign the row.
    'spacing.rhythm': {
      value: 'airy',
      moves: ['toolbarGap', 'headContentGap', 'pageBarPad', 'bulkBarPad'],
      holds: 'bulkCorner',
      in: VERTICALS,
    },
    // `consumes: surfaces.controlHeight` -- the family's control box ramp,
    // derived as rem x density x control-height once (kit row 14). The sort
    // affordance is the box a populated table renders; the drag grip and the
    // expand button read the same ramp.
    'shape.control-height': {
      value: 'tall',
      moves: ['sortControlSize'],
      holds: 'bulkCorner',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count, exactly as the
 * family-causality harness defines it: a repaired node, a new node and a
 * same-count swap all go red and must be re-adjudicated.
 *
 * `aria-conditional-attr` fails in EVERY gated scope, so the select-all
 * checkbox's `aria-checked="mixed"` on a native input is a systemic defect of
 * the header selection cell, not a mode-specific one. The contrast failures
 * belong to the phone chrome -- the bulk count and the range on the light
 * scopes, the toolbar slot and the custom card slot on bithire dark -- where
 * the family states no ground of its own beneath caller content. Registered,
 * never excluded.
 *
 * Scope limit, stated rather than implied: the four Buttons React defers into
 * `[hidden]` completion containers (see `serverMarkup`) sit outside every
 * scope's audited DOM, so this map is evidence for the family's own chrome and
 * for the three phone-posture Buttons only.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'aria-conditional-attr': ['#checkbox-modern-_R_2pe_'],
    'color-contrast': [
      '.rottay-box.rottay-box--modern[data-part="mobile-card-custom"]:nth-child(1) > span',
      '.rottay-box.rottay-box--modern[data-part="mobile-card-custom"]:nth-child(2) > span',
      'div[data-part="mobile-toolbar"] > span',
    ],
  },
  'bithire light': {
    'aria-conditional-attr': ['#checkbox-modern-_R_2pe_'],
    'color-contrast': [
      'span[data-part="mobile-bulk-count"]',
      'span[data-part="mobile-pagination-range"]',
    ],
  },
  'evnto light': {
    'aria-conditional-attr': ['#checkbox-modern-_R_2pe_'],
    'color-contrast': [
      'span[data-part="mobile-bulk-count"]',
      'span[data-part="mobile-pagination-range"]',
    ],
  },
  'rottay dark': {
    'aria-conditional-attr': ['#checkbox-modern-_R_2pe_'],
  },
};

describe('data-table causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(grid).toContain('data-part="root"');
    expect(grid).toContain('data-part="toolbar"');
    expect(grid).toContain('data-part="header-cell"');
    expect(grid).toContain('data-part="data-cell"');
    expect(grid).toContain('data-part="bulk-bar"');
    expect(grid).toContain('data-part="pagination-bar"');
    expect(cards).toContain('data-part="mobile-card-custom"');
    expect(cards).toContain('data-selected="true"');
  });

  /**
   * The weight half of `typography.roles`, routed.
   *
   * The three readers of the section-title role weight are the state title,
   * the group header cell and the editorial leading cell; all three used to
   * name `--ds-typography-section-title-weight`, which nothing writes, so the
   * posture moved the type system and left this family at a literal 600. They
   * now read the family's own channel over the produced role weight, which is
   * why a posture arrives here at all -- and why a vertical that rests at 700
   * (bithire) draws these three parts at 700 instead of 600.
   */
  it('moves the group header weight with the role-weight posture', async () => {
    expect(groupedGrid).toContain('data-part="group-header-cell"');
    const GROUP_CELL = "#grouped [data-part='group-header-cell']";
    const readings = await measureArms({
      vertical: 'rottay',
      markup: groupedMarkup,
      arms: {
        base: {},
        strong: { 'typography.role-weights': 'strong' },
        light: { 'typography.role-weights': 'light' },
      },
      targets: [
        { id: 'groupWeight', selector: GROUP_CELL, property: 'font-weight' },
        {
          id: 'familyChannel',
          selector: GROUP_CELL,
          property: '--ds-data-table-group-header-font-weight',
        },
        {
          id: 'roleChannel',
          selector: "#grouped [data-part='root']",
          property: '--ds-type-section-title-font-weight',
        },
        {
          id: 'bulkCorner',
          selector: "#grouped [data-part='bulk-bar']",
          property: 'border-end-start-radius',
        },
      ],
    });
    const weight = (value: string): number => Number.parseFloat(value.trim());
    const base = readings.base!;
    // The family channel is produced and carries the role weight, not a
    // literal of its own, so the paint and the decision are the same number.
    expect(weight(base.familyChannel)).toBe(weight(base.groupWeight));
    expect(weight(base.roleChannel)).toBe(weight(base.groupWeight));
    // Both ends of the closed domain, so the reading cannot be a coincidence.
    expect(weight(readings.strong!.groupWeight)).toBeGreaterThan(weight(base.groupWeight));
    expect(weight(readings.light!.groupWeight)).toBeLessThan(weight(base.groupWeight));
    for (const arm of ['strong', 'light'] as const) {
      const moved = readings[arm]!;
      expect(weight(moved.groupWeight), `${arm}: the header follows the posture`).toBe(
        weight(moved.roleChannel),
      );
      // Negative control: a corner is not a weight.
      expect(moved.bulkCorner, `${arm}: control bulkCorner`).toBe(base.bulkCorner);
    }
  }, 180_000);

  it('mirrors the row anatomy and its logical offsets under dir=rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'selectionLtr', selector: SELECTION_CELL, property: '@rect.left' },
        { id: 'rowLeft', selector: "#grid [data-part='body-row']", property: '@rect.left' },
        { id: 'rowRight', selector: "#grid [data-part='body-row']", property: '@rect.right' },
        { id: 'selectionRtl', selector: SELECTION_CELL, property: '@rect.left', dir: 'rtl' },
        { id: 'sortStartLtr', selector: SORT_ICON, property: 'margin-left' },
        { id: 'sortEndLtr', selector: SORT_ICON, property: 'margin-right' },
        { id: 'sortStartRtl', selector: SORT_ICON, property: 'margin-right', dir: 'rtl' },
        { id: 'sortEndRtl', selector: SORT_ICON, property: 'margin-left', dir: 'rtl' },
        { id: 'cellAlignLtr', selector: `${CELL}[data-align='right']`, property: 'text-align' },
        { id: 'cellAlignRtl', selector: `${CELL}[data-align='right']`, property: 'text-align', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    const mid = (Number(r.rowLeft) + Number(r.rowRight)) / 2;
    // The leading selection cell sits on the reading-start edge in both directions.
    expect(Number(r.selectionLtr)).toBeLessThan(mid);
    expect(Number(r.selectionRtl)).toBeGreaterThan(mid);
    // The sort affordance is offset from the label on the logical start side.
    expect(Number.parseFloat(r.sortStartLtr)).toBeGreaterThan(0);
    expect(Number.parseFloat(r.sortEndLtr)).toBe(0);
    expect(r.sortStartRtl).toBe(r.sortStartLtr);
    expect(Number.parseFloat(r.sortEndRtl)).toBe(0);
    // `right` alignment is authored logically, so a numeric column follows the flow.
    expect(r.cellAlignLtr).toBe('end');
    expect(r.cellAlignRtl).toBe('end');
  }, 120_000);

  it('groups the pagination figures in the active catalog and keeps them column-aligned', async () => {
    // The family formats numbers: the range is the only figure it composes itself.
    expect(grid).toContain('12,001');
    expect(grid).toContain('1,234,567');
    expect(spanishGrid).toContain('12.001');
    expect(spanishGrid).toContain('1.234.567');
    expect(spanishGrid).not.toContain('1,234,567');
    const readings = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rangeNumeric', selector: RANGE, property: 'font-variant-numeric' },
        { id: 'cellNumeric', selector: `${CELL}[data-align='right']`, property: 'font-variant-numeric' },
      ],
    });
    // Grouped figures only read as a column when the family pins tabular figures.
    expect(readings.base!.rangeNumeric).toBe('tabular-nums');
    expect(readings.base!.cellNumeric).toBe('tabular-nums');
  }, 120_000);

  /**
   * F-22, density half: the posture must reach the family's own geometry, not
   * only the attribute the root stamps. The unit suite pins `data-density`;
   * this reads the channel that attribute resolves BACK OFF A CELL in a real
   * browser, where the cascade law that makes the projection work (a custom
   * property is resolved on the element that declares it, so the boundary
   * redeclares the ramp) is actually in force.
   */
  it('changes the density scale a cell computes when the posture is compact', async () => {
    const CELL_IN = (host: string) => `#${host} [data-part='data-cell']`;
    const readings = await measureArms({
      vertical: 'rottay',
      markup: densityPair,
      arms: { base: {} },
      targets: [
        { id: 'comfortableScale', selector: CELL_IN('comfortable'), property: '--ds-density-effective-scale' },
        { id: 'compactScale', selector: CELL_IN('compact'), property: '--ds-density-effective-scale' },
        { id: 'comfortableRhythm', selector: CELL_IN('comfortable'), property: 'padding-top' },
        { id: 'compactRhythm', selector: CELL_IN('compact'), property: 'padding-top' },
        { id: 'comfortableGap', selector: "#comfortable [data-part='toolbar']", property: 'row-gap' },
        { id: 'compactGap', selector: "#compact [data-part='toolbar']", property: 'row-gap' },
        { id: 'comfortableRow', selector: "#comfortable [data-part='body-row']", property: '@rect.height' },
        { id: 'compactRow', selector: "#compact [data-part='body-row']", property: '@rect.height' },
      ],
    });
    const r = readings.base!;
    // `--ds-density-effective-scale` is not a registered property, so a cell
    // computes it as the substituted token stream: the posture is visible in
    // the factor the boundary substituted into it.
    const factor = (value: string): string =>
      value.replace(/\s+/g, ' ').replace(/^clamp\( 0\.5, calc\( .* \* (\S+) \), 3 \)$/, '$1');
    expect(factor(r.comfortableScale)).toBe('1');
    // 0.85 is DENSITY_MODE_FACTORS.compact, projected by the base density CSS.
    expect(factor(r.compactScale)).toBe('0.85');
    expect(r.compactScale).not.toBe(r.comfortableScale);
    // The channel is not decoration: the cell's own geometry follows it.
    expect(Number.parseFloat(r.compactRhythm)).toBeLessThan(
      Number.parseFloat(r.comfortableRhythm),
    );
    expect(Number(r.compactRow)).toBeLessThan(Number(r.comfortableRow));
    // PINNED, measured: the toolbar rhythm does NOT follow the instance
    // posture. It follows the tenant-level `density.mode` decision (the arm
    // above moves it), so the prop reaches the cells and not the chrome gap.
    expect(r.compactGap).toBe(r.comfortableGap);
  }, 120_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
