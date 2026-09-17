/**
 * The active-filters-bar family in a real browser: every keypath the family
 * deriver declares in `consumes` is exercised against the family's OWN
 * computed paint with a negative control, the reading direction is measured on
 * the eyebrow leader that actually mirrors, and axe holds beyond the pinned
 * debt.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { ActiveFiltersBar } from '../index';
import type { ActiveFilter } from '../contracts';
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

const FILTERS: ActiveFilter[] = [
  { key: 'status', label: 'Status', value: 'Open' },
  { key: 'owner', label: 'Owner', value: 'Ada Lovelace', state: 'draft' },
  { key: 'due', label: 'Due', value: 'Not a date', state: 'invalid' },
  { key: 'team', label: 'Team', value: 'Platform' },
];

const TENANT: TenantConfig = {
  slug: 'active-filters-bar-causality',
  name: 'Active filters bar causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Active filters bar causality' },
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
      <ActiveFiltersBar
        activeFilters={FILTERS}
        onRemoveFilter={noop}
        onClearAll={noop}
        onAddFilter={noop}
        maxVisible={3}
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

const rail = await serverMarkup();
const markup = `<div id="rail" style="inline-size:64rem">${rail}</div>`;

const ROOT = "#rail [data-part='root']";
const PILL = "#rail [data-part='pill']";
const CHIP = "#rail [data-part='chip']";
const LABEL = "#rail [data-part='chip-label']";
const VALUE = "#rail [data-part='chip-value']";
const INVALID = "#rail [data-part='chip'][data-filter-state='invalid'] [data-part='chip-value']";

describeCausality({
  family: 'active-filters-bar',
  markup,
  targets: [
    // The rail's ground is the family's own channel, resting on the collection
    // band; the invalid value's ink is the status ramp reached a second way.
    { id: 'railGround', selector: ROOT, property: 'background-image' },
    { id: 'invalidInk', selector: INVALID, property: 'color' },
    { id: 'labelFont', selector: LABEL, property: 'font-size' },
    { id: 'valueFont', selector: VALUE, property: 'font-size' },
    { id: 'chipTarget', selector: CHIP, property: 'min-block-size' },
    { id: 'enterDuration', selector: ROOT, property: 'animation-duration' },
    // The eyebrow's own measure is a stated number on a family channel, so it
    // is the control every other arm holds.
    { id: 'countBlock', selector: PILL, property: 'min-block-size' },
  ],
  decisions: {
    // `consumes: palette.*` -- the lifecycle ink resolves from the seeded
    // STATUS ramp; the rail ground is the family's own channel resting on the
    // collection band, which the neutral seeds of these three verticals do not
    // move, so it is measured below as a produced channel rather than faked
    // into this arm.
    'palette.status-seeds': {
      value: { error: '#8A2F2F' },
      moves: ['invalidInk'],
      holds: 'countBlock',
      in: VERTICALS,
    },
    // `consumes: typography.roles` -- the chip label and the chip value are
    // the family's own text, on two different steps.
    'typography.scale': {
      value: 1.08,
      moves: ['labelFont', 'valueFont'],
      holds: 'countBlock',
      in: VERTICALS,
    },
    // `consumes: density` -- a dismissible object's hit target rides the
    // tenant density plane.
    'density.mode': {
      value: 'spacious',
      moves: ['chipTarget'],
      holds: 'countBlock',
      in: VERTICALS,
    },
    // `consumes: motion.*` -- the rail's entrance is timed by the motion dial.
    'motion.dial': {
      value: { durationScale: 1.3 },
      moves: ['enterDuration'],
      holds: 'countBlock',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired
 * node, a new node and a same-count swap all go red and must be
 * re-adjudicated. Registered, never excluded; a scope with no entry is a
 * scope that must stay clean.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('active-filters-bar causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(rail).toContain('data-part="root"');
    expect(rail).toContain('data-part="rail"');
    expect(rail).toContain('data-part="chips"');
    expect(rail).toContain('data-part="pill"');
    expect(rail).toContain('data-part="chip"');
    expect(rail).toContain('data-part="chip-label"');
    expect(rail).toContain('data-part="chip-value"');
    expect(rail).toContain('data-part="more-toggle"');
    // The lifecycle glyph is the family's OWN node in the primitive's icon
    // slot, so the family stamps the part its skin paints.
    expect(rail).toContain('data-filter-state="invalid"');
    expect(rail).toContain('data-part="icon"');
  });

  /**
   * The invalid lifecycle reads by FORM as well as by hue: the value carries a
   * wavy underline and the glyph carries the same ink, so a scope that forces
   * colours away still says "needs repair".
   */
  it('expresses the invalid lifecycle as form, not hue alone', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'invalidLine', selector: INVALID, property: 'text-decoration-style' },
        {
          id: 'draftLine',
          selector: "#rail [data-part='chip'][data-filter-state='draft'] [data-part='chip-value']",
          property: 'text-decoration-style',
        },
        { id: 'appliedLine', selector: VALUE, property: 'text-decoration-line' },
      ],
    });
    const r = readings.base!;
    expect(r.invalidLine).toBe('wavy');
    expect(r.draftLine).toBe('dashed');
    expect(r.appliedLine).toBe('none');
  }, 120_000);

  /**
   * The executable inventory of what palette does NOT move here. The rail's
   * ground is a produced channel resting on the collection band, and the
   * neutral seeds of these three verticals leave that band where it is -- so
   * the reading is pinned as held rather than borrowed into the palette arm
   * above, and the channel is proven to have a producer rather than resolving
   * to a fallback nobody writes.
   */
  it('rests the rail ground on a produced channel the neutral seeds do not move', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
      targets: [
        { id: 'groundChannel', selector: ROOT, property: '--ds-active-filters-bar-background' },
        { id: 'ruleChannel', selector: ROOT, property: '--ds-active-filters-bar-border' },
        { id: 'ground', selector: ROOT, property: 'background-image' },
      ],
    });
    const r = readings.base!;
    expect(r.groundChannel!.trim()).not.toBe('');
    expect(r.ruleChannel!.trim()).not.toBe('');
    expect(readings.seeded!.ground).toBe(r.ground);
  }, 120_000);

  /**
   * The eyebrow closes with a hairline LEADER on its end edge, so the leader
   * changes sides under `dir=rtl`. This is the reading the logical
   * `border-inline-end` exists for, measured rather than asserted from the CSS
   * text.
   */
  it('moves the eyebrow leader to the other edge under dir=rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rightLtr', selector: PILL, property: 'border-right-width' },
        { id: 'leftLtr', selector: PILL, property: 'border-left-width' },
        { id: 'rightRtl', selector: PILL, property: 'border-right-width', dir: 'rtl' },
        { id: 'leftRtl', selector: PILL, property: 'border-left-width', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    expect(r.rightLtr).not.toBe('0px');
    expect(r.leftLtr).toBe('0px');
    expect(r.leftRtl).not.toBe('0px');
    expect(r.rightRtl).toBe('0px');
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
