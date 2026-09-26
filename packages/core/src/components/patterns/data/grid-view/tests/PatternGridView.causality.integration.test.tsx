/**
 * The grid-view family in a real browser (WO-FAM-08 B7).
 *
 * The family has NO deriver of its own: the eleven names its skin reads without
 * a producer are the ten `--ds-collection-card-*` premium sockets and
 * `--ds-listing-grid-bottom-bleed` (the gap left with the track model, WO-FAM-12).
 * The `--ds-collection-card-*` ten are a CROSS-FAMILY vocabulary declared in
 * `presentation/components/patterns/index.css` and read by three skins, so a
 * `chrome/grid-view` that emitted them would make one family the producer of a
 * namespace it does not own; `--ds-listing-grid-bottom-bleed` is a listing-grid
 * name, not a grid-view one. They are pinned by category in the roster row
 * instead. What this suite proves is the other half of §1.6: the decisions that
 * reach the family's own paint through the cascade roots, one probe per
 * decision with a negative control, plus the auto-fit card recipe the root now
 * lays out with (WO-FAM-12): the row always filled, one column in the compact
 * container posture, and a caller's gap outranking the Grid's rung.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import {
  postureAttribute,
  resolveContainerPosture,
} from '@/foundation/contracts/kernel/adaptation/foundation';
import { DEFAULT_RESPONSIVE_POSTURE } from '@/foundation/tokens/ts/presentation/responsive-postures';
import { PatternGridView } from '../presentation/grid';
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
}

const ROWS: Row[] = [
  { id: 'a', name: 'Row A' },
  { id: 'b', name: 'Row B' },
  { id: 'c', name: 'Row C' },
];

const TENANT: TenantConfig = {
  slug: 'grid-view-causality',
  name: 'Grid view causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Grid view causality' },
};

interface MarkupRequest {
  readonly data?: readonly Row[];
  readonly gap?: number | string;
  readonly loading?: boolean;
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
      <PatternGridView<Row>
        data={[...(request.data ?? ROWS)]}
        rowKey="id"
        selectable
        selectedKeys={['a']}
        loading={request.loading ?? false}
        renderCard={(row) => <span>{row.name}</span>}
        {...(request.gap === undefined ? {} : { gap: request.gap })}
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

const grid = await serverMarkup();
const empty = await serverMarkup({ data: [] });
const loading = await serverMarkup({ loading: true });
const markup = `<div id="grid" style="inline-size:64rem">${grid}</div>`
  + `<div id="empty" style="inline-size:64rem">${empty}</div>`;
/** The same grid, stating its own gap: the per-instance stamp. */
const stampedMarkup = `<div id="stamped" style="inline-size:64rem">${await serverMarkup({ gap: 48 })}</div>`;

/* The family root is addressed through its OWN class: `Box` stamps
   `data-part='root'` too, so a bare `#grid [data-part='root']` would match the
   composed Stack's Box first and measure the wrong element. */
const ROOT = "#grid .ds-pattern-grid-view[data-part='root']";
const SHELL = "#grid [data-part='card-shell']";
const OVERLAY = "#grid [data-part='checkbox-overlay']";
const CHECKBOX = '#grid .ds-grid-view__checkbox-control';
const EMPTY_ROOT = "#empty .ds-pattern-grid-view[data-part='root']";
const EMPTY_TEXT = "#empty [data-part='empty-state']";

describeCausality({
  family: 'grid-view',
  markup,
  targets: [
    // The selection ring is the family's own seeded signal.
    { id: 'selectedRing', selector: SHELL, property: 'box-shadow' },
    // The empty frame is the family's own ground and border.
    { id: 'emptyGround', selector: EMPTY_ROOT, property: 'background-color' },
    { id: 'emptyInk', selector: EMPTY_TEXT, property: 'color' },
    // The shell closes on the large rung of the radius ramp.
    { id: 'shellCorner', selector: SHELL, property: 'border-top-left-radius' },
    { id: 'emptyCorner', selector: EMPTY_ROOT, property: 'border-top-left-radius' },
    // The checkbox landing hook is the family's only elevated part.
    { id: 'checkboxShadow', selector: CHECKBOX, property: 'box-shadow' },
    // The empty frame's rhythm, and the grid's own gap on the channel the skin
    // rests at the density-scaled listing ramp.
    { id: 'emptyPad', selector: EMPTY_ROOT, property: 'padding-top' },
    { id: 'gridGap', selector: ROOT, property: 'column-gap' },
    { id: 'emptyType', selector: EMPTY_TEXT, property: 'font-size' },
  ],
  decisions: {
    // The selection ring is the family's ONLY seeded ink. Its two neighbours
    // are pinned here as an executable inventory rather than borrowed as
    // evidence: the empty frame's ground is the neutral card surface
    // (--ds-listing-grid-empty-bg -> --ds-collection-card-bg) and its message is
    // the neutral muted ink (--ds-color-text-muted); measured, neither moves
    // with the seed, and the ground is the control that proves it.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['selectedRing'],
      holds: 'emptyGround',
      in: VERTICALS,
    },
    // Both corners ride the same radius ramp on two different rungs.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['shellCorner', 'emptyCorner'],
      holds: 'emptyInk',
      in: VERTICALS,
    },
    // The checkbox landing hook reads the elevation ramp directly.
    'surfaces.elevation-posture': {
      value: 'elevated',
      moves: ['checkboxShadow'],
      holds: 'shellCorner',
      in: VERTICALS,
    },
    // The empty frame's rhythm and the grid's own gap ride the density-scaled
    // spacing ramp; the gap only reaches the theme BECAUSE the cut stopped the
    // prop default from stamping it inline on every render.
    'density.mode': {
      value: 'spacious',
      moves: ['emptyPad', 'gridGap'],
      holds: 'shellCorner',
      in: VERTICALS,
    },
    // The empty message is the family's own text; its colour is not.
    'typography.scale': {
      value: 1.08,
      moves: ['emptyType'],
      holds: 'emptyInk',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 *
 * Every finding is contrast on content the family does NOT own: the caller's
 * `renderCard` slot (`span`), which the grid neither grounds nor inks.
 * Registered, never excluded; a scope with no entry is a scope that must stay
 * clean.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('grid-view causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(grid).toContain('data-part="root"');
    expect(grid).toContain('data-part="card-shell"');
    expect(grid).toContain('data-part="checkbox-overlay"');
    expect(empty).toContain('data-part="empty-state"');
    // The shell is a stateful part decided by the kernel: at rest it carries
    // NO `data-state`, so `[data-state]` never matches a resting shell and the
    // skin's paired hover arm falls through to the platform pseudo-class.
    expect(grid).not.toContain('data-part="card-shell" data-state');
    // The root is the Grid primitive in its auto-fit mode, and no family
    // channel or literal track model survives: the recipe is the Grid skin's.
    expect(grid).toContain('data-component="grid"');
    expect(grid).toContain('data-auto-fit="true"');
    for (const dead of ['--ds-grid-view-columns', '--ds-grid-view-gap', 'auto-fill', '280px', 'minmax']) {
      expect(grid).not.toContain(dead);
    }
    // A stated number is the Grid's exact inline gap.
    expect(stampedMarkup).toContain('gap:48px');
    // Nothing else travels inline.
    expect(grid).not.toContain('display:grid');
    expect(grid).not.toContain('grid-template-columns');
  });

  /**
   * The loading state is the grid's OWN anatomy under the shared renderer, not
   * a hand-built stand-in: the renderer's host wraps the family root, so the
   * bones are measured against the real grid.
   */
  it('derives the loading state from the family anatomy', () => {
    expect(loading).toContain('ds-skeleton-anatomy');
    expect(loading).toContain('data-part="source"');
    // The root the renderer measures is the family's own root, with the same
    // parts the loaded grid stamps.
    expect(loading).toContain('ds-pattern-grid-view');
    expect(loading).toContain('data-loading="true"');
    expect(loading).toContain('data-part="card-shell"');
    expect(loading).toContain('data-part="card-content"');
    // And no hand-made skeleton survives beside it.
    expect(loading).not.toContain('skeleton-card');
    expect(loading).not.toContain('ds-grid-view__skeleton');
  });

  /**
   * The auto-fit recipe resolves from the card footprint channels: the root is
   * a real grid whose tracks fill the 64rem host, the theme's gap moves with
   * density, a caller's number outranks it, and the empty branch is no grid.
   */
  it('resolves the recipe from the footprint channels, and lets a stated gap outrank the rung', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: `${markup}${stampedMarkup}`,
      arms: { base: {}, spacious: { 'density.mode': 'spacious' } },
      targets: [
        { id: 'footprint', selector: ROOT, property: '--ds-card-min-inline-size' },
        { id: 'themedGap', selector: ROOT, property: 'column-gap' },
        { id: 'tracks', selector: ROOT, property: 'grid-template-columns' },
        { id: 'stampedGap', selector: "#stamped .ds-pattern-grid-view[data-part='root']", property: 'column-gap' },
        // The empty branch is deliberately NOT a grid: one centered message.
        { id: 'emptyDisplay', selector: EMPTY_ROOT, property: 'display' },
      ],
    });
    const base = readings.base!;
    const spacious = readings.spacious!;
    // The footprint is the derived card channel, not a literal of this family.
    expect(base.footprint).toContain('16rem');
    // And it reaches the paint: the 64rem host resolves to real tracks.
    expect(base.tracks.split(' ').filter((track) => track !== '0px').length).toBeGreaterThan(1);
    // The theme's grid moves with density; the caller's number wins in both.
    expect(spacious.themedGap).not.toBe(base.themedGap);
    expect(base.stampedGap).toBe('48px');
    expect(spacious.stampedGap).toBe('48px');
    expect(base.emptyDisplay).not.toBe('grid');
  }, 120_000);

  /**
   * The recipe's three promises, in every vertical and both directions: the row
   * fills its container with no orphan gap, the compact posture the runtime
   * measures takes one column, and the retired literal never paints again.
   */
  it('fills the row, takes one column in the compact posture, in every vertical and direction', async () => {
    const compact = postureAttribute({
      viewport: 'phone',
      container: resolveContainerPosture(600, DEFAULT_RESPONSIVE_POSTURE),
    });
    expect(compact).toBe('phone compact');
    const card = (host: string, index: number) =>
      `${host} .ds-pattern-grid-view[data-part='root'] > [data-part='card-shell']:nth-child(${index})`;
    const hosts = `<div id="wide" style="inline-size:90rem">${grid}</div><div id="narrow" style="inline-size:600px">${grid}</div>`;
    for (const vertical of VERTICALS) {
      for (const dir of ['ltr', 'rtl'] as const) {
        const readings = await measureArms({
          vertical,
          markup: hosts,
          arms: { base: {} },
          targets: [
            { id: 'wideLeft', selector: "#wide .ds-pattern-grid-view[data-part='root']", property: '@rect.left', dir },
            { id: 'wideRight', selector: "#wide .ds-pattern-grid-view[data-part='root']", property: '@rect.right', dir },
            ...[1, 2, 3].flatMap((index) => [
              { id: `w${index}l`, selector: card('#wide', index), property: '@rect.left', dir },
              { id: `w${index}r`, selector: card('#wide', index), property: '@rect.right', dir },
              { id: `w${index}t`, selector: card('#wide', index), property: '@rect.top', dir },
              {
                id: `n${index}t`,
                selector: card('#narrow', index),
                property: '@rect.top',
                dir,
                attributes: { 'data-posture': compact },
                attributesOn: "#narrow .ds-pattern-grid-view[data-part='root']",
              },
            ]),
          ],
        });
        const r = readings.base!;
        const n = (id: string) => Number(r[id]);
        const where = `${vertical} ${dir}`;
        // One row of three, the outer cards on the grid's own edges (padding 1px).
        expect({ where, oneRow: n('w1t') === n('w2t') && n('w2t') === n('w3t') }).toEqual({ where, oneRow: true });
        const edges = [n('w1l'), n('w1r'), n('w3l'), n('w3r')];
        expect({ where, filled: Math.abs(Math.min(...edges) - n('wideLeft')) <= 2 && Math.abs(Math.max(...edges) - n('wideRight')) <= 2 }).toEqual({ where, filled: true });
        // The measured compact posture stacks the three cards.
        expect({ where, stacked: n('n1t') < n('n2t') && n('n2t') < n('n3t') }).toEqual({ where, stacked: true });
      }
    }
  }, 240_000);

  /**
   * The checkbox overlay anchors on the INLINE axis, so it lands in the
   * inline-start corner of the shell in both reading directions -- which is
   * what the logical insets promise and what a physical `left` would break.
   */
  it('lands the selection overlay on the inline-start corner in both directions', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'shellLeftLtr', selector: SHELL, property: '@rect.left' },
        { id: 'overlayLeftLtr', selector: OVERLAY, property: '@rect.left' },
        { id: 'shellRightRtl', selector: SHELL, property: '@rect.right', dir: 'rtl' },
        { id: 'overlayRightRtl', selector: OVERLAY, property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    // LTR: the overlay sits just inside the shell's left edge.
    expect(Number(r.overlayLeftLtr) - Number(r.shellLeftLtr)).toBeGreaterThan(0);
    expect(Number(r.overlayLeftLtr) - Number(r.shellLeftLtr)).toBeLessThan(24);
    // RTL: it mirrors to just inside the shell's right edge.
    expect(Number(r.shellRightRtl) - Number(r.overlayRightRtl)).toBeGreaterThan(0);
    expect(Number(r.shellRightRtl) - Number(r.overlayRightRtl)).toBeLessThan(24);
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
