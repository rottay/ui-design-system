/**
 * The widget-board family in a real browser (WO-FAM-08 B8).
 *
 * `derivation/chrome/widget-board` declares exactly one decision in `consumes`
 * -- `density` -- because only three of the eight names this skin read without a
 * producer are the family's own: the catalog geometry. The other five are pinned
 * by category in the roster row: `--ds-widget-board-layout-x` / `-layout-y` are
 * the spatial-continuity kernel's FLIP delta, written by the runtime and
 * registered through `@property`, and `--ds-workspace-card-icon-*` is a
 * cross-family vocabulary four other skins read.
 *
 * What this suite proves is §1.6 for this family: one probe per decision that
 * reaches the family's own computed paint, each with a negative control; the
 * three derived channels read back at the value the deriver rests them at; the
 * placement channels the cut introduced read back stamped and unstamped; the
 * paired state arms answering the kernel token rather than only the platform
 * pseudo-class; the RTL mirror of the board's directional chrome; and one axe
 * assertion with node-identified debt.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernWidgetBoard from '../engines/modern';
import type { WidgetBoardItem, WidgetBoardLabels } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const LABELS: WidgetBoardLabels = {
  heading: 'Operations board',
  context: 'Workspace',
  customize: 'Customize',
  done: 'Done',
  addWidget: 'Add widget',
  reset: 'Reset',
  move: 'Move',
  remove: 'Remove',
  resize: 'Resize',
  readHint: 'Arrange your widgets',
  editHint: 'Drag to reorder',
  emptyCatalog: 'Every widget is on the board',
};

const ITEMS: WidgetBoardItem[] = [
  {
    id: 'pipeline',
    title: 'Pipeline',
    accessibleTitle: 'Pipeline',
    size: 'lg',
    order: 0,
    visible: true,
    header: { icon: <span>P</span>, eyebrow: 'Live', supporting: 'Last hour' },
    content: <span>Pipeline body</span>,
  },
  {
    id: 'throughput',
    title: 'Throughput',
    accessibleTitle: 'Throughput',
    size: 'md',
    order: 1,
    visible: true,
    header: { icon: <span>T</span> },
    content: <span>Throughput body</span>,
  },
];

const TENANT: TenantConfig = {
  slug: 'widget-board-causality',
  name: 'Widget board causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Widget board causality' },
};

interface MarkupRequest {
  readonly items?: WidgetBoardItem[];
  readonly loading?: boolean;
  readonly narrow?: boolean;
}

/** The family's own server markup, kept whole as the list-toolbar precedent keeps it. */
async function serverMarkup(request: MarkupRequest = {}): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <ModernWidgetBoard
        labels={LABELS}
        items={request.items ?? ITEMS}
        editable
        loading={request.loading ?? false}
        narrow={request.narrow ?? false}
        emptyState={<span>No widgets yet</span>}
      />
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

const board = await serverMarkup();
const empty = await serverMarkup({ items: [] });
const loading = await serverMarkup({ items: [], loading: true });
const narrow = await serverMarkup({ narrow: true });
const markup = `<div id="board" style="inline-size:64rem">${board}</div>`
  + `<div id="empty" style="inline-size:64rem">${empty}</div>`;

const ROOT = "#board .ds-pattern-widget-board[data-part='root']";
const TOOLBAR = "#board [data-part='toolbar']";
const TITLE = "#board [data-part='toolbar-title']";
const CELL = "#board [data-part='card-shell']";
const ITEM_ICON = "#board [data-part='item-icon']";
const GRID = "#board [data-part='grid']";
const EMPTY_STATE = "#empty [data-part='empty-state']";

describeCausality({
  family: 'widget-board',
  markup,
  targets: [
    // The card's corner tint is the family's own seeded signal, and the item
    // icon well inks from the primary seed through the `--ds-workspace-card-*`
    // fallback nobody writes.
    { id: 'cellTint', selector: CELL, property: 'background-image' },
    { id: 'iconInk', selector: ITEM_ICON, property: 'color' },
    // The card and the empty frame close on two rungs of the radius ramp.
    { id: 'cellCorner', selector: CELL, property: 'border-top-left-radius' },
    { id: 'emptyCorner', selector: EMPTY_STATE, property: 'border-top-left-radius' },
    // The toolbar floor is the family's only density-blind geometry made
    // density-aware by the Modern skin.
    { id: 'toolbarFloor', selector: TOOLBAR, property: 'min-height' },
    // The catalog geometry the deriver produces, read as the channel itself:
    // the catalog Sheet is portalled and is not in the server markup.
    { id: 'catalogGap', selector: ROOT, property: '--ds-widget-board-catalog-search-margin-block-end' },
    // The board seams are rhythm, not density.
    { id: 'gridGap', selector: GRID, property: 'column-gap' },
    // The board heading is the family's own text.
    { id: 'titleType', selector: TITLE, property: 'font-size' },
  ],
  decisions: {
    // The tint and the icon well are the family's only seeded ink; the corner
    // is the control that proves the seed moved paint and not geometry.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['cellTint', 'iconInk'],
      holds: 'cellCorner',
      in: VERTICALS,
    },
    // Both corners ride the same radius ramp on two different rungs.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['cellCorner', 'emptyCorner'],
      holds: 'titleType',
      in: VERTICALS,
    },
    // `density` is the ONE decision the deriver declares: the catalog search
    // room rides `--ds-spacing-3`, and the Modern toolbar floor rides the
    // density plane directly.
    'density.mode': {
      value: 'spacious',
      moves: ['toolbarFloor', 'catalogGap'],
      holds: 'cellCorner',
      in: VERTICALS,
    },
    // The seams between widgets are rhythm, a different axis from density.
    'spacing.rhythm': {
      value: 'airy',
      moves: ['gridGap'],
      holds: 'cellCorner',
      in: VERTICALS,
    },
    'typography.scale': {
      value: 1.08,
      moves: ['titleType'],
      holds: 'cellCorner',
      in: VERTICALS,
    },
  },
});

const TOOLBAR_COPY = (host: string, leaf: string) =>
  `#${host} > section > .ds-widget-board__toolbar[data-part="toolbar"]`
  + ' > .ds-widget-board__toolbar-heading[data-part="toolbar-heading"]'
  + ` > .ds-widget-board__toolbar-copy[data-part="toolbar-copy"] > ${leaf}`;

const CONTEXT = '.ds-widget-board__toolbar-context[data-part="toolbar-context"]';
const HINT = '.rottay-typography.rottay-typography--modern.font-normal';
const HEADING = 'h2';

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 *
 * Every finding is `color-contrast` on the board's OWN toolbar copy -- the
 * eyebrow (`--ds-color-text-muted`) and the mode hint (the composed Text at
 * `color="muted"`). It is a palette reading, not a skin one: the nodes take
 * their ink from the neutral ramp and their ground from the canvas, and neither
 * is a `--ds-widget-board-*` channel this cut owns. Repairing it means moving
 * the vertical's muted ink or giving the toolbar copy a tone of its own, both
 * of which are decisions outside this lot. Registered, never excluded: the
 * rottay scopes are clean and have no entry, so they must stay clean.
 *
 * `bithire dark` had six rows -- the same four plus both headings, which fail
 * only when a dark ink sits on a light ground -- and they DRAINED: that scope's
 * dark block now re-derives its own canvas ground instead of inheriting the
 * light body's. Dropped by identity, not waived, and a relapse reddens here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': {
    'color-contrast': [
      TOOLBAR_COPY('board', CONTEXT),
      TOOLBAR_COPY('board', HINT),
      TOOLBAR_COPY('empty', CONTEXT),
      TOOLBAR_COPY('empty', HINT),
    ].sort(),
  },
  'evnto light': {
    'color-contrast': [
      TOOLBAR_COPY('board', CONTEXT),
      TOOLBAR_COPY('board', HINT),
      TOOLBAR_COPY('empty', CONTEXT),
      TOOLBAR_COPY('empty', HINT),
    ].sort(),
  },
};

describe('widget-board causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(board).toContain('data-part="root"');
    expect(board).toContain('data-part="toolbar"');
    expect(board).toContain('data-part="card-shell"');
    expect(board).toContain('data-part="card-content"');
    expect(board).toContain('data-part="item-icon"');
    expect(empty).toContain('data-part="empty-state"');
    // Every stateful part is decided by the kernel and serializes NOTHING at
    // rest, so `[data-state]` never matches a resting part and each paired arm
    // falls through to the platform pseudo-class it names.
    for (const part of ['root', 'toolbar', 'card-shell', 'item-header']) {
      expect(board).not.toContain(`data-part="${part}" data-state`);
    }
    // Nothing visual travels inline any more: the three drained paint sites
    // would show here as `grid-column`, `grid-row` or `height`.
    expect(board).not.toContain('grid-column:');
    expect(board).not.toContain('grid-row:');
    expect(board).not.toContain('height:');
  });

  it('derives the loading state from the family anatomy', () => {
    expect(loading).toContain('ds-skeleton-anatomy');
    expect(loading).toContain('data-part="source"');
    // The source the renderer measures is the board's own grid and cards.
    expect(loading).toContain('data-part="grid"');
    expect(loading).toContain('data-part="card-shell"');
    expect(loading).toContain('data-part="item-title"');
    // And no hand-made skeleton survives beside it.
    expect(loading).not.toContain('skeleton-cell');
    expect(loading).not.toContain('ds-widget-board__skeleton');
    expect(loading).not.toContain('data-skeleton="true"');
  });

  /**
   * The three catalog channels resolve to the deriver's own emission rather
   * than to a `var()` fallback nobody writes -- which is what "has a producer"
   * means for this ratchet.
   */
  it('resolves every derived catalog channel from the deriver', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'minHeight', selector: ROOT, property: '--ds-widget-board-catalog-no-results-min-height' },
        { id: 'searchGap', selector: ROOT, property: '--ds-widget-board-catalog-search-margin-block-end' },
        { id: 'searchWidth', selector: ROOT, property: '--ds-widget-board-catalog-search-max-width' },
      ],
    });
    const base = readings.base!;
    expect(base.minHeight.trim()).toBe('96px');
    expect(base.searchWidth.trim()).toBe('680px');
    // The search room is the density-scaled ramp, not a literal.
    expect(base.searchGap.trim()).not.toBe('');
    expect(base.searchGap).not.toContain('var(');
  }, 120_000);

  /**
   * The placement channels the cut introduced, read back twice: the solver's
   * own stamp on a placed card, and the resting declaration a card the solver
   * did not place falls back to.
   */
  it('places a card through its channels and leaves an unplaced card to the skin', async () => {
    expect(board).toContain('data-placed="true"');
    expect(board).toContain('--ds-widget-board-cell-column');
    // A narrow board is the solver-free stack: it stamps no placement channel.
    expect(narrow).toContain('data-placed="false"');
    expect(narrow).not.toContain('--ds-widget-board-cell-column:');

    const readings = await measureArms({
      vertical: 'rottay',
      markup: `${markup}<div id="narrow" style="inline-size:22rem">${narrow}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'placedColumn', selector: CELL, property: 'grid-column-start' },
        { id: 'restingColumn', selector: ROOT, property: '--ds-widget-board-cell-column' },
        { id: 'narrowColumn', selector: "#narrow [data-part='card-shell']", property: 'grid-column-start' },
      ],
    });
    const base = readings.base!;
    // The solver's line reaches the paint.
    expect(base.placedColumn).toBe('1');
    // The resting declaration is a real producer on the root.
    expect(base.restingColumn.trim()).toBe('auto');
    // The unplaced stack keeps the full-width span the skin gives it.
    expect(base.narrowColumn).toBe('1');
  }, 120_000);

  /**
   * F-37 made executable: the kernel token alone -- with no platform pointer or
   * focus state -- moves the same paint the bare pseudo-class used to own.
   */
  it('answers the kernel state token on every part whose arm was a bare pseudo-class', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'cellResting', selector: CELL, property: 'border-top-color' },
        {
          id: 'cellPressed',
          selector: CELL,
          property: 'border-top-color',
          attributes: { 'data-state': 'pressed' },
        },
        { id: 'toolbarResting', selector: TOOLBAR, property: 'border-top-color' },
        {
          id: 'toolbarPressed',
          selector: TOOLBAR,
          property: 'border-top-color',
          attributes: { 'data-state': 'pressed' },
        },
      ],
    });
    const base = readings.base!;
    expect(base.cellPressed).not.toBe(base.cellResting);
    expect(base.toolbarPressed).not.toBe(base.toolbarResting);
  }, 120_000);

  /**
   * The board's own directional chrome mirrors: the Modern card tint originates
   * from the inline-end corner, so its gradient reads from the other side under
   * RTL while the corner geometry is unchanged.
   */
  it('mirrors the card tint origin under RTL', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'ltrLeft', selector: CELL, property: '@rect.left' },
        { id: 'rtlRight', selector: CELL, property: '@rect.right', dir: 'rtl' },
        { id: 'ltrOrigin', selector: CELL, property: '--_ds-widget-board-tint-origin' },
        { id: 'rtlOrigin', selector: CELL, property: '--_ds-widget-board-tint-origin', dir: 'rtl' },
      ],
    });
    const base = readings.base!;
    expect(base.ltrOrigin.trim()).toBe('100% 0%');
    expect(base.rtlOrigin.trim()).toBe('0% 0%');
    expect(Number(base.ltrLeft)).toBeGreaterThanOrEqual(0);
    expect(Number(base.rtlRight)).toBeGreaterThan(0);
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
