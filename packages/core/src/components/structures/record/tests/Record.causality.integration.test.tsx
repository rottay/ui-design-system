/**
 * The record family in a real browser: the decisions its chrome declares in
 * `consumes` move its own paint against a negative control, and axe holds on
 * the composed page.
 *
 * The family deriver is NOT registered in the lowering pipeline yet (the DT
 * integrates `derivation/index.ts` after this lot), so every target below
 * resolves through an ALREADY-registered plane: the metrics heading rung
 * reads through the skin's `--ds-font-size-lg` fallback chain (the type
 * plane), labels ride the xs rung, grounds and borders ride the palette
 * planes, and the field padding rides the density composite. The probe of
 * `--ds-record-heading-font-size` itself through the compile lands with the
 * DT registration; this suite pins the channel's resting value from the
 * deriver directly instead.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { RecordField } from '../field';
import { RecordFieldGrid } from '../field-grid';
import { RecordSummaryStrip } from '../summary-strip';
import { RecordActionBar } from '../action-bar';
import { RecordPanel } from '../panel';
import { recordChromeDeriver } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/record';
import { buildLoweringContext } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/pipeline';
import { firstPartyFixture } from '@tests/support/theme-lowering';
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
  slug: 'record-causality',
  name: 'Record causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Record causality' },
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
      <RecordSummaryStrip
        variant="default"
        items={[{ label: 'Status', value: 'Active', helper: 'Since yesterday' }]}
      />
      <RecordSummaryStrip
        variant="metrics"
        items={[{ label: 'Revenue', value: '$1.2M' }, { label: 'Count', value: '42', mono: true }]}
      />
      <RecordFieldGrid>
        <RecordField label="Name" value="Ada Lovelace" />
        <RecordField label="Reference" value="REC-1" mono copyValue="REC-1" href="/refs/rec-1" />
      </RecordFieldGrid>
      <RecordPanel>
        <span>Panel body</span>
      </RecordPanel>
      <RecordActionBar meta="3 unsaved changes" actions={<span>Save</span>} />
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

const PAGE = '#page';
const METRICS_STRIP = `${PAGE} [data-part='summary-strip'][data-variant='metrics']`;
const METRICS_VALUE = `${METRICS_STRIP} [data-part='summary-item-value']`;
const LABEL = `${PAGE} [data-part='summary-item-label']`;
const LEDGER = `${PAGE} [data-part='field-grid'][data-structure='record']`;
const FIELD = `${LEDGER} > [data-part='field']`;
const RAIL = `${PAGE} [data-part='action-bar'][data-structure='record']`;
const LINK_ICON = `${PAGE} [data-part='field-link-icon']`;

describeCausality({
  family: 'record',
  markup,
  targets: [
    // The metrics strip's ground: an ink/canvas mix whose canvas leg the
    // background seed moves on every vertical (measured).
    { id: 'metricsGround', selector: METRICS_STRIP, property: 'background-color' },
    // The metrics strip's heading rung: the family channel's fallback chain
    // (`--ds-font-size-lg`) rides the type plane.
    { id: 'headingSize', selector: METRICS_VALUE, property: 'font-size' },
    // The mono data label rung rides the type plane.
    { id: 'labelSize', selector: LABEL, property: 'font-size' },
    // The docked rail's canvas ground: the seed's own surface.
    { id: 'railGround', selector: RAIL, property: 'background-color' },
    // The cell padding rides the density composite.
    { id: 'fieldPad', selector: FIELD, property: 'padding-top' },
    // The rail rule's width rests at 1px on every vertical: the negative
    // control every arm below holds.
    { id: 'ruleWidth', selector: RAIL, property: 'border-top-width' },
    // The link arrow's 13px frame is a literal on no plane: the second
    // control every arm holds.
    { id: 'iconFrame', selector: LINK_ICON, property: 'inline-size' },
  ],
  decisions: {
    // `consumes: palette.*` is carried by the shared color planes here: the
    // seed's canvas moves the metrics ground's canvas leg and the rail's
    // own surface. Measured: the family's ramps (strip/cell/panel grounds,
    // border inks, text inks) are fixed on every vertical, so the neutral
    // temperature moves nothing in this family — that arm is honestly
    // absent, not pinned to a hold.
    'palette.seeds': {
      value: { background: '#20303F' },
      moves: ['metricsGround', 'railGround'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: typography.scale` -- the heading rung (via the fallback
    // chain until the family channel is registered) and the label rung.
    'typography.scale': {
      value: 1.08,
      moves: ['headingSize', 'labelSize'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: density` -- the family's deliberate px geometry rides the
    // density composite.
    'density.mode': {
      value: 'spacious',
      moves: ['fieldPad'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 *
 * The map is EMPTY, and it emptied by repair. The family's quiet inks -- the
 * summary-item labels and helper on the strip's well, the ledger's field
 * labels, the docked rail's meta pair -- read three page roles graded for a
 * light canvas (`text-muted`, `text-secondary`, `text-tertiary`) and measured
 * 2.42:1 to 2.94:1 against their own grounds on `bithire light` and
 * `evnto light`: eight rows per scope.
 *
 * The three roles were not a hierarchy this family could keep. They span 0.5
 * of a contrast point in light, and they do not hold their RANK across modes.
 * `text-secondary` is lighter than `text-muted` in BOTH modes, which makes it
 * the QUIETER of the two on a light ground (helper 2.43:1 vs label 2.74:1) and
 * the LOUDER on a dark one (12.0:1 vs 7.0:1); `text-tertiary` and `text-muted`
 * are the same colour in dark. So the
 * family now states ONE quiet rung, graded twice because it sits on two
 * grounds -- `--ds-record-quiet-ink` against the strip's recessed well and
 * `--ds-record-canvas-quiet-ink` against the canvas the ledger and the rail
 * rest on. Each is a weighted mix of the reading ink INTO its own ground, so
 * the sign follows the mode by construction instead of being a literal graded
 * for one of them.
 *
 * Measured after: 6.90:1 to 7.23:1 on both light scopes (floor 4.5), with the
 * summary and field VALUES untouched at 16.7:1 and 17.9:1 -- the quiet rung is
 * still unmistakably subordinate, which is the hierarchy that was deliberate.
 * The dark scopes move too, and that is declared: the labels rise (6.2:1 to
 * 7.5-9.4:1) and the strip helper falls from 12.0:1 to 8.8:1 as it joins the
 * rung it belongs to. Nothing is excluded and no threshold moved: with no entry
 * every scope must measure clean, and a relapse reddens here.
 *
 * NAMED RESIDUE, measured and NOT repaired: the `editorial` and `governance`
 * strip variants keep their own authored label tints (`text-secondary` and a
 * 26/74 primary-muted mix) over gradient wells. Neither variant is mounted by
 * this suite, so no pin would hold a change to them -- a repair without an
 * alarm is how debt comes back. They are the next record lot's arm.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('record causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'summary-strip',
      'summary-item-label',
      'summary-item-value',
      'field-grid',
      'field',
      'field-label',
      'field-value',
      'field-link-body',
      'field-link-icon',
      'panel',
      'action-bar',
      'action-bar-meta',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The span prop lands as a stamp, not inline paint.
    expect(rendered).toContain('data-span="1"');
  }, 120_000);

  it('states the family channel at the resting value the skin reads it with', () => {
    // Direct deriver reading: the family channel is not registered in the
    // pipeline yet, so the compile cannot emit it — the DT registration
    // carries the productive-door probe.
    for (const vertical of ['rottay', 'bithire', 'evnto'] as const) {
      const channels = recordChromeDeriver.derive(
        buildLoweringContext({ theme: firstPartyFixture(vertical) }),
        {},
      );
      expect(channels['--ds-record-heading-font-size']).toBe('var(--ds-font-size-lg)');
    }
  });

  it('resolves the heading rung through the already-registered type plane', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, scaled: { 'typography.scale': 1.08 } },
      targets: [{ id: 'headingSize', selector: METRICS_VALUE, property: 'font-size' }],
    });
    const base = parseFloat(readings.base!.headingSize!);
    const scaled = parseFloat(readings.scaled!.headingSize!);
    expect(base).toBeGreaterThan(0);
    expect(scaled).toBeGreaterThan(base);
  }, 120_000);

  it('holds both no-plane controls under every consumed decision', async () => {
    // The rail rule's width (1px on every vertical) and the link arrow's
    // 13px frame are literals on no plane: no consumed decision may move
    // them. (The arm-level `holds` takes one id, so the second control is
    // pinned here for all arms at once.)
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: {
        base: {},
        seeds: { 'palette.seeds': { background: '#20303F' } },
        scaled: { 'typography.scale': 1.08 },
        spacious: { 'density.mode': 'spacious' },
      },
      targets: [
        { id: 'ruleWidth', selector: RAIL, property: 'border-top-width' },
        { id: 'iconFrame', selector: LINK_ICON, property: 'inline-size' },
      ],
    });
    for (const arm of ['seeds', 'scaled', 'spacious'] as const) {
      expect(readings[arm]!.ruleWidth).toBe(readings.base!.ruleWidth);
      expect(readings[arm]!.iconFrame).toBe(readings.base!.iconFrame);
    }
    expect(readings.base!.ruleWidth!.trim()).toBe('1px');
    expect(readings.base!.iconFrame!.trim()).toBe('13px');
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
