/**
 * The status-filter-pills family in a real browser.
 *
 * This family owns NO chrome deriver: every `--ds-filter-pill-*` name its skin
 * reads already has a producer, and the rest of its vocabulary is the cascade
 * roots -- so a deriver here would be a second owner of another family's
 * channels. The decisions below are probed against the family's OWN computed
 * paint through those channels, each with a negative control, and the F-37
 * pairing is measured on the kernel token rather than asserted from the CSS
 * text.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { StatusFilterPills } from '../index';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

const OPTIONS = [
  { value: 'open', label: 'Open', count: 12 },
  { value: 'review', label: 'In review', count: 4 },
  { value: 'closed', label: 'Closed', count: 128 },
];

const TENANT: TenantConfig = {
  slug: 'status-filter-pills-causality',
  name: 'Status filter pills causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Status filter pills causality' },
};

/** The family's own server markup, kept whole as the list-toolbar precedent keeps it. */
async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <StatusFilterPills options={OPTIONS} value="open" onChange={noop} showCounts />
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

const pills = await serverMarkup();
/**
 * The keyboard arm, stamped rather than simulated: the ring rule is
 * `:is([data-state~='focus-visible'], :focus-visible)` and a static probe can
 * only enter it through the kernel token. The component's own stamp is drilled
 * in `StatusFilterPills.caller-handler-composition`; this twin is what lets the
 * ring's PAINT be read at all.
 */
const focusedPills = pills
  .replace(/id="[^"]*"/gu, '')
  .replace(/data-part="pill"/gu, 'data-part="pill" data-state="focus-visible"');
const markup =
  `<div id="pills" style="inline-size:64rem">${pills}</div>`
  + `<div id="focused-pills" style="inline-size:64rem">${focusedPills}</div>`;

const PILL = "#pills [data-part='pill']";
const SELECTED = "#pills [data-part='pill'][data-selected='true']";
const UNSELECTED = "#pills [data-part='pill'][data-selected='false']";
const LABEL = "#pills [data-part='pill-label']";
const BADGE = "#pills [data-part='count-badge']";
const FOCUSED = "#focused-pills [data-part='pill'][data-state~='focus-visible']";

describeCausality({
  family: 'status-filter-pills',
  markup,
  targets: [
    { id: 'selectedInk', selector: SELECTED, property: 'color' },
    { id: 'selectedBorder', selector: SELECTED, property: 'border-top-color' },
    { id: 'labelFont', selector: LABEL, property: 'font-size' },
    { id: 'pillGap', selector: PILL, property: 'column-gap' },
    // The pill's keyboard ring, as the channel and as the paint it lands.
    { id: 'ringChannel', selector: PILL, property: '--ds-filter-pill-focus-ring' },
    { id: 'ringPaint', selector: FOCUSED, property: 'box-shadow' },
    // The count badge's measure is a stated number, so it is the control every
    // arm holds.
    { id: 'badgeBlock', selector: BADGE, property: 'block-size' },
  ],
  decisions: {
    // The selected pill reads the brand twice -- ink and keyline -- because
    // selection must never be hue alone.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['selectedInk', 'selectedBorder'],
      holds: 'badgeBlock',
      in: VERTICALS,
    },
    // The pill's own label rides the type ramp.
    'typography.scale': {
      value: 1.08,
      moves: ['labelFont'],
      holds: 'badgeBlock',
      in: VERTICALS,
    },
    // The gap between glyph, label and count rides the density-scaled spacing
    // ramp.
    'density.mode': {
      value: 'spacious',
      moves: ['pillGap'],
      holds: 'badgeBlock',
      in: VERTICALS,
    },
    // The pill ring reads the tenant's focus decision, so a glow reaches the
    // pill's own keyboard affordance instead of its retired 3px literal.
    'states.focus-style': {
      value: 'glow',
      moves: ['ringChannel', 'ringPaint'],
      holds: 'badgeBlock',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired
 * node, a new node and a same-count swap all go red and must be
 * re-adjudicated. Registered, never excluded; a scope with no entry is a
 * scope that must stay clean.
 *
 * Every finding was the family's OWN pill label under bithire dark: the quiet
 * `--ds-filter-pill-color` on the transparent pill for the two unselected
 * pills, and the brand ink of the selected one. All three DRAINED: a
 * transparent pill shows the canvas, and that scope's dark block now re-derives
 * its own ground instead of inheriting the light body's, so the pill tones are
 * read against the ground they were designed for. Dropped by identity, not
 * waived: with no entry the scope must measure clean, and a relapse reddens
 * here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('status-filter-pills causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of ['root', 'pill', 'pill-label', 'count-badge', 'count-badge-text']) {
      expect(pills, part).toContain(`data-part="${part}"`);
    }
    // The pill is a stateful part decided by the kernel: at rest it carries NO
    // `data-state`, so `[data-state]` never matches a resting pill and the
    // skin's paired arms fall through to the platform pseudo-class.
    expect(pills).not.toContain('data-state');
  });

  /**
   * F-37 measured rather than asserted: the kernel token alone moves the
   * hover wash on an unselected pill, and the selected pill -- excluded by the
   * arm's own `:not([data-selected='true'])` -- does not move with it.
   */
  it('lets the kernel state alone drive the hover wash', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'resting', selector: UNSELECTED, property: 'background-color' },
        {
          id: 'hovered',
          selector: UNSELECTED,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'pressed',
          selector: UNSELECTED,
          property: 'background-color',
          attributes: { 'data-state': 'pressed' },
        },
        {
          id: 'focusRing',
          selector: UNSELECTED,
          property: 'box-shadow',
          attributes: { 'data-state': 'focus-visible' },
        },
        { id: 'selectedResting', selector: SELECTED, property: 'background-color' },
        {
          id: 'selectedHovered',
          selector: SELECTED,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.hovered).not.toBe(r.resting);
    expect(r.pressed).not.toBe(r.resting);
    expect(r.focusRing).not.toBe('none');
    // The selected pill is outside the wash by contract, so the same token
    // leaves it alone: the pairing did not widen what the arm matches.
    expect(r.selectedHovered).toBe(r.selectedResting);
  }, 120_000);

  /**
   * The row is a reading order, so its first pill travels to the other edge
   * under `dir=rtl`.
   */
  it('reads the row from the other edge under dir=rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'firstLeftLtr', selector: PILL, property: '@rect.left' },
        { id: 'firstLeftRtl', selector: PILL, property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    expect(Number(r.firstLeftRtl)).toBeGreaterThan(Number(r.firstLeftLtr));
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
