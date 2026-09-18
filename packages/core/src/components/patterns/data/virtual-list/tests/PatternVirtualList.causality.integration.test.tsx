/**
 * The virtual-list family in a real browser (WO-FAM-08 B7).
 *
 * The family has NO deriver: every name its skin reads already has a producer,
 * so `readWithoutProducer` is 0 and there is nothing for a `chrome/virtual-list`
 * to emit. What this suite therefore proves is the other half of §1.6: the
 * decisions that reach the family's own paint through the cascade roots, one
 * probe per decision with a negative control, plus the three runtime-measured
 * channels that carry the windowing geometry -- each read back BOTH at its
 * resting declaration (the producer is real, not a fallback) and at a stamped
 * instance value (the stamp outranks it).
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { PatternVirtualList } from '../presentation/list';
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
  label: string;
}

const ROWS: Row[] = Array.from({ length: 40 }, (_, index) => ({
  id: `row-${index}`,
  label: `Message ${index}`,
}));

const TENANT: TenantConfig = {
  slug: 'virtual-list-causality',
  name: 'Virtual list causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Virtual list causality' },
};

/**
 * The family's own server markup, kept whole as the list-toolbar precedent
 * keeps it. `height` is optional so the suite can measure the list that states
 * no viewport bound (the skin's list) against the list that states one.
 */
async function serverMarkup(
  height?: number | string,
  renderItem: (row: Row) => React.ReactNode = (row) => <span>{row.label}</span>,
): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <PatternVirtualList<Row>
        items={ROWS}
        estimateSize={40}
        getItemKey={(row) => row.id}
        renderItem={(row) => renderItem(row)}
        aria-label="Messages"
        hasMore
        onEndReached={() => {}}
        {...(height === undefined ? {} : { height })}
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

const list = await serverMarkup();
const markup = `<div id="list" style="inline-size:40rem;block-size:20rem">${list}</div>`;
/** The same list, stating its own viewport bound: the per-instance stamp. */
const stampedMarkup = `<div id="stamped" style="inline-size:40rem">${await serverMarkup(192)}</div>`;
/**
 * The same list, rendered by a caller whose own content stamps `data-part`
 * names this family also uses. `item` is stamped by tree-view, timeline,
 * step-wizard and charts/bullet, and `sentinel` by live-feed, so a bare
 * descendant selector in this skin would reach INSIDE the `renderItem` slot.
 */
const nestedMarkup = `<div id="nested" style="inline-size:40rem;block-size:20rem">`
  + `${await serverMarkup(undefined, (row) => (
      <span data-part="item">
        <i data-part="sentinel">{row.label}</i>
      </span>
    ))}</div>`;

const ROOT = "#list [data-part='root']";
const SPACER = "#list [data-part='spacer']";
const ITEM = "#list [data-part='item']";
const SENTINEL = "#list [data-part='sentinel']";

describeCausality({
  family: 'virtual-list',
  markup,
  targets: [
    // The scrollport is a real tab stop (scrollable-region law), so the focus
    // signature is the family's own seeded paint.
    { id: 'focusInk', selector: ROOT, property: 'outline-color', attributes: { 'data-state': 'focus-visible' } },
    { id: 'focusRing', selector: ROOT, property: 'outline-width', attributes: { 'data-state': 'focus-visible' } },
    { id: 'focusCorner', selector: ROOT, property: 'border-top-left-radius', attributes: { 'data-state': 'focus-visible' } },
    // The reserved scrollbar gutter is NEUTRAL ink, measured as the control the
    // seed must not reach: it reads `--ds-color-border-secondary`, which is the
    // neutral ramp and not the seeded one.
    { id: 'scrollbarInk', selector: ROOT, property: 'scrollbar-color' },
    // Geometry that no decision may move: the window must keep working.
    { id: 'itemPosition', selector: ITEM, property: 'position' },
  ],
  decisions: {
    // The focus ring is the family's only seeded ink; the scrollbar gutter is
    // the neutral it must leave alone.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['focusInk'],
      holds: 'scrollbarInk',
      in: VERTICALS,
    },
    // The focus signature is the width of the region's own ring.
    'states.focus-style': {
      value: 'glow',
      moves: ['focusRing'],
      holds: 'itemPosition',
      in: VERTICALS,
    },
    // The ring closes on the small rung of the radius ramp.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['focusCorner'],
      holds: 'focusInk',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 *
 * The one failing scope was contrast on the CALLER's rows -- the `renderItem`
 * slot, five `<span>`s of plain text the family neither grounds nor inks. The
 * family paints no ground beneath a caller slot, so it was the consumer's ink
 * against the surface the consumer mounted it on, and the surface moved: that
 * scope's dark block now re-derives its own canvas ground instead of inheriting
 * the light body's, so all five rows DRAINED. Dropped by identity, not waived;
 * a scope with no entry is a scope that must stay clean, so a relapse reddens
 * here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('virtual-list causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(list).toContain('data-part="root"');
    expect(list).toContain('data-part="spacer"');
    expect(list).toContain('data-part="item"');
    expect(list).toContain('data-part="sentinel"');
    // The scrollport is a stateful part decided by the kernel: at rest it
    // carries NO `data-state`, so `[data-state]` never matches a resting
    // region and the skin's paired arm falls through to `:focus-visible`.
    expect(list).not.toContain('data-part="root" data-state');
    // A list that states no height stamps NO viewport channel: an
    // unconditional stamp would shadow the skin's resting declaration on every
    // render and take the bound away from the theme.
    expect(list).not.toContain('--ds-virtual-list-block-size');
    expect(stampedMarkup).toContain('--ds-virtual-list-block-size:192px');
    // The two measured channels are always stamped, because they ARE the
    // measurement: a windowed list with no total and no row offsets is not a
    // windowed list.
    expect(list).toContain('--ds-virtual-list-spacer-block-size:1600px');
    expect(list).toContain('--ds-virtual-list-item-inset-block-start:0px');
    // And nothing else travels inline. The 16 paint sites this cut drained
    // would all have shown up here.
    expect(list).not.toContain('overflow-y:');
    expect(list).not.toContain('position:absolute');
  });

  /**
   * Every channel the windowing runtime measures, read back twice: once where
   * the skin's own declaration is the producer (so the read resolves to a value
   * a theme can move, not to a `var()` fallback nobody writes), and once where
   * the instance stamp outranks it.
   */
  it('resolves each measured channel from a real producer, and lets the stamp outrank it', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: `${markup}${stampedMarkup}`,
      arms: { base: {} },
      targets: [
        // Resting: declared by the skin on the root, inherited by the rows.
        { id: 'restingBound', selector: ROOT, property: '--ds-virtual-list-block-size' },
        { id: 'restingOffset', selector: ROOT, property: '--ds-virtual-list-item-inset-block-start' },
        // Applied: the properties the skin paints from those channels.
        { id: 'spacerHeight', selector: SPACER, property: 'block-size' },
        { id: 'firstOffset', selector: ITEM, property: 'inset-block-start' },
        { id: 'sentinelEnd', selector: SENTINEL, property: 'inset-block-end' },
        { id: 'scrollport', selector: ROOT, property: 'overflow-y' },
        // The stamped instance.
        { id: 'stampedBound', selector: "#stamped [data-part='root']", property: 'block-size' },
      ],
    });
    const r = readings.base!;
    // The producer is a declaration, not a fallback: the read resolves.
    expect(r.restingBound.trim()).toBe('100%');
    expect(r.restingOffset.trim()).toBe('0');
    // The runtime's measurement reaches the paint: 40 rows x 40px estimate.
    expect(r.spacerHeight).toBe('1600px');
    expect(r.firstOffset).toBe('0px');
    // The constants the TSX used to stamp inline are the skin's now, and they
    // still hold: the region scrolls and the sentinel sits at the far end.
    expect(r.scrollport).toBe('auto');
    expect(r.sentinelEnd).toBe('0px');
    // The caller's bound wins over the resting declaration.
    expect(r.stampedBound).toBe('192px');
  }, 120_000);

  /**
   * The window is anchored on the INLINE axis logically, so a row spans the
   * scrollport in both reading directions instead of hanging off one edge --
   * which is what the physical `left: 0; right: 0` pair used to promise and
   * what the logical `inset-inline: 0` now proves.
   */
  it('spans a windowed row across the scrollport in both reading directions', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rootLeftLtr', selector: ROOT, property: '@rect.left' },
        { id: 'itemLeftLtr', selector: ITEM, property: '@rect.left' },
        { id: 'itemWidthLtr', selector: ITEM, property: '@rect.width' },
        { id: 'rootLeftRtl', selector: ROOT, property: '@rect.left', dir: 'rtl' },
        { id: 'itemLeftRtl', selector: ITEM, property: '@rect.left', dir: 'rtl' },
        { id: 'itemWidthRtl', selector: ITEM, property: '@rect.width', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    expect(Number(r.itemWidthLtr)).toBeGreaterThan(0);
    expect(r.itemLeftLtr).toBe(r.rootLeftLtr);
    expect(r.itemLeftRtl).toBe(r.rootLeftRtl);
    // Same span on both sides: the row is not mirrored off the scrollport.
    expect(r.itemWidthRtl).toBe(r.itemWidthLtr);
  }, 120_000);

  /**
   * The family paints its OWN anatomy only. The three structural rules walk the
   * DOM's child chain (root > spacer > item|sentinel), so a caller's nested
   * `data-part='item'` or `data-part='sentinel'` keeps its own position instead
   * of being ripped out of flow by this family's windowing geometry.
   */
  it('leaves a caller renderItem part alone: only its own rows are positioned', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: nestedMarkup,
      arms: { base: {} },
      targets: [
        {
          id: 'ownRow',
          selector: "#nested [data-part='root'] > [data-part='spacer'] > [data-part='item']",
          property: 'position',
        },
        {
          id: 'nestedItem',
          selector: "#nested [data-part='item'] [data-part='item']",
          property: 'position',
        },
        {
          id: 'nestedSentinel',
          selector: "#nested [data-part='item'] [data-part='sentinel']",
          property: 'position',
        },
        {
          id: 'nestedSentinelHeight',
          selector: "#nested [data-part='item'] [data-part='sentinel']",
          property: '@rect.height',
        },
      ],
    });
    const r = readings.base!;
    // The family's own row is still windowed.
    expect(r.ownRow).toBe('absolute');
    // The caller's content is untouched: still in flow, still its own size.
    expect(r.nestedItem).toBe('static');
    expect(r.nestedSentinel).toBe('static');
    // Not collapsed to the 1px hairline the family's sentinel rule paints.
    expect(Number(r.nestedSentinelHeight)).toBeGreaterThan(1);
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
