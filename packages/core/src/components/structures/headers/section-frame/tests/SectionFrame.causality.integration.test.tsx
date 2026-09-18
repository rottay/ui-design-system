/**
 * The section-frame family in a real browser: the channels its chrome deriver
 * produces resolve, the decisions it declares in `consumes` move its own paint
 * against a negative control, and axe holds on the numbered frame.
 *
 * The family read every channel through a producer before this cut, so what is
 * measured here is REACH rather than repair: each named channel resolves to the
 * same resting value the skin used to state inline, and a tenant decision that
 * moves the shared role moves the section with it.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { SectionFrame } from '../index';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const TENANT: TenantConfig = {
  slug: 'section-frame-causality',
  name: 'Section frame causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Section frame causality' },
};

async function serverMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <div id="primary">
        <SectionFrame index={1} title="Framing" meta="Numbered boundary">
          <span>Body</span>
        </SectionFrame>
      </div>
      <div id="untitled">
        <SectionFrame index={2} />
      </div>
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

const rendered = await serverMarkup();
const markup = `<div id="page" style="inline-size:64rem">${rendered}</div>`;

const ROOT = "#page #primary [data-part='root']";
const LABEL = "#page #primary [data-part='label-row']";
const INDEX = "#page #primary [data-part='index']";
const META = "#page #primary [data-part='meta']";

describeCausality({
  family: 'section-frame',
  markup,
  targets: [
    // The framing rule's ink, on the family's own channel over the hairline role.
    { id: 'ruleInk', selector: ROOT, property: 'border-top-color' },
    // The mono label rung: its size is the family's channel over the xs role.
    { id: 'labelSize', selector: LABEL, property: 'font-size' },
    // The section's own rhythm.
    { id: 'framePad', selector: ROOT, property: 'padding-top' },
    // The two inks the frame paints: decoration and announced text.
    { id: 'ordinalInk', selector: INDEX, property: 'color' },
    { id: 'metaInk', selector: META, property: 'color' },
    // The rule's width is a stated number on no plane at all, so it is the control
    // every arm below holds.
    { id: 'ruleWidth', selector: ROOT, property: '--ds-section-frame-rule-width' },
  ],
  decisions: {
    // `consumes: palette.*` -- both quiet inks are mixed from the mode's ink toward
    // the canvas this decision states, so seeding the canvas moves them.
    'palette.seeds': {
      value: { background: '#20303F' },
      moves: ['ordinalInk', 'metaInk'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // The framing rule is the neutral ramp's hairline, which the temperature moves
    // and the background seed does not (measured: the seed leaves it byte-identical).
    'palette.neutral-temperature': {
      value: 'warm',
      moves: ['ruleInk'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: typography.scale` -- the mono rung rides the type plane.
    'typography.scale': {
      value: 1.08,
      moves: ['labelSize'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: density` -- the section's own gutter.
    'density.mode': {
      value: 'spacious',
      moves: ['framePad'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('section-frame causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of ['root', 'label-row', 'index', 'index-label', 'dash', 'title', 'meta', 'body']) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The skin selects the anatomy now; the per-element BEM names are gone.
    expect(rendered).not.toContain('rt-section-frame__');
  });

  it('resolves every channel the family deriver produces', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'paddingBlock', selector: ROOT, property: '--ds-section-frame-padding-block' },
        { id: 'ruleWidth', selector: ROOT, property: '--ds-section-frame-rule-width' },
        { id: 'ruleColor', selector: ROOT, property: '--ds-section-frame-rule-color' },
        { id: 'labelColumnGap', selector: ROOT, property: '--ds-section-frame-label-column-gap' },
        { id: 'labelRowGap', selector: ROOT, property: '--ds-section-frame-label-row-gap' },
        { id: 'labelMargin', selector: ROOT, property: '--ds-section-frame-label-margin-block-end' },
        { id: 'labelMeasure', selector: ROOT, property: '--ds-section-frame-label-measure' },
        { id: 'labelFontSize', selector: ROOT, property: '--ds-section-frame-label-font-size' },
        { id: 'labelFontWeight', selector: ROOT, property: '--ds-section-frame-label-font-weight' },
        { id: 'labelTracking', selector: ROOT, property: '--ds-section-frame-label-tracking' },
        { id: 'ordinalInk', selector: ROOT, property: '--ds-section-frame-ordinal-ink' },
        { id: 'metaInk', selector: ROOT, property: '--ds-section-frame-meta-ink' },
        // The private name this cut retired: outside every producer census and
        // outside the tenant's reach at once.
        { id: 'retiredPrivate', selector: ROOT, property: '--_ds-section-frame-label-tracking' },
      ],
    });
    const r = readings.base!;
    for (const id of [
      'paddingBlock',
      'ruleWidth',
      'ruleColor',
      'labelColumnGap',
      'labelRowGap',
      'labelMargin',
      'labelMeasure',
      'labelFontSize',
      'labelFontWeight',
      'labelTracking',
      'ordinalInk',
      'metaInk',
    ]) {
      expect({ id, empty: r[id]!.trim() === '' }, id).toEqual({ id, empty: false });
    }
    expect(r.retiredPrivate!.trim()).toBe('');
    // The tracking the private name used to carry, unchanged, on a reachable name.
    expect(r.labelTracking!.trim()).toBe('0.12em');
  }, 120_000);

  it('announces the untitled section through its ordinal alone', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'untitledOrdinal', selector: "#page #untitled [data-part='index-label']", property: 'position' },
      ],
    });
    // The visually-hidden carrier is in the accessibility tree, not on screen.
    expect(readings.base!.untitledOrdinal).toBe('absolute');
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
