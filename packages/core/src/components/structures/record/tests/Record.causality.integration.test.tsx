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
 * The record family's quiet inks (data labels at the muted rung, the meta
 * pair, the summary helper) fail 4.5:1 against their recessed grounds on
 * bithire/evnto light. The pairings are the family's resting paint — this cut
 * moved none of them — so the debt is pinned, not smuggled: a contrast repair
 * is an ink/ground ladder decision, not a cut side effect.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': {
    'color-contrast': [
      '.rottay-stack.rottay-stack--modern[data-part="summary-item"]:nth-child(2) > .font-bold[data-part="summary-item-label"][data-size="xs"]',
      'div[data-mono="false"] > .rottay-stack.rottay-stack--modern[data-part="root"] > .font-bold[data-part="field-label"][data-size="xs"]',
      'div[data-part="field"][data-span="1"][data-empty="false"]:nth-child(2) > .rottay-stack.rottay-stack--modern[data-part="root"] > .font-bold[data-part="field-label"][data-size="xs"]',
      'div[data-variant="default"] > .rottay-box.rottay-box--modern[data-part="summary-grid"] > .rottay-stack.rottay-stack--modern[data-part="summary-item"] > .font-bold[data-part="summary-item-label"][data-size="xs"]',
      'div[data-variant="metrics"] > .rottay-box.rottay-box--modern[data-part="summary-grid"] > .rottay-stack.rottay-stack--modern[data-part="summary-item"]:nth-child(1) > .font-bold[data-part="summary-item-label"][data-size="xs"]',
      'span[data-part="action-bar-meta-label"]',
      'span[data-part="action-bar-meta-text"]',
      'span[data-part="summary-item-helper"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '.rottay-stack.rottay-stack--modern[data-part="summary-item"]:nth-child(2) > .font-bold[data-part="summary-item-label"][data-size="xs"]',
      'div[data-mono="false"] > .rottay-stack.rottay-stack--modern[data-part="root"] > .font-bold[data-part="field-label"][data-size="xs"]',
      'div[data-part="field"][data-span="1"][data-empty="false"]:nth-child(2) > .rottay-stack.rottay-stack--modern[data-part="root"] > .font-bold[data-part="field-label"][data-size="xs"]',
      'div[data-variant="default"] > .rottay-box.rottay-box--modern[data-part="summary-grid"] > .rottay-stack.rottay-stack--modern[data-part="summary-item"] > .font-bold[data-part="summary-item-label"][data-size="xs"]',
      'div[data-variant="metrics"] > .rottay-box.rottay-box--modern[data-part="summary-grid"] > .rottay-stack.rottay-stack--modern[data-part="summary-item"]:nth-child(1) > .font-bold[data-part="summary-item-label"][data-size="xs"]',
      'span[data-part="action-bar-meta-label"]',
      'span[data-part="action-bar-meta-text"]',
      'span[data-part="summary-item-helper"]',
    ],
  },
};

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
