/**
 * The edit-fields family in a real browser: the decision planes its skin
 * honestly answers to move its own paint against a negative control, the
 * variant arms and the runtime channels the cut introduced resolve computed,
 * and axe holds on the editor surface.
 *
 * This family has no chrome deriver — its channels are skin-authored — so
 * every probe below reaches an already-registered plane (`--ds-color-*`,
 * the density dial, the type scale, the neutral temperature) or reads the
 * skin's own authored declarations; nothing waits on a registration step.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import {
  InlineEditField,
  InlineEditGrid,
  InlineEditor,
  MoreFieldsToggle,
} from '../index';
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

const TENANT: TenantConfig = {
  slug: 'edit-fields-causality',
  name: 'Edit fields causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Edit fields causality' },
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
        <InlineEditor title="Edit member" eyebrow="Directory" description="Contact routing.">
          <InlineEditGrid kind="primary">
            <InlineEditField label="Full name" htmlFor="f-name" fieldNumber="01" span={2}>
              <input id="f-name" />
            </InlineEditField>
            <InlineEditField label="Notes" htmlFor="f-notes" span="full" controlWidth="compact">
              <textarea id="f-notes" />
            </InlineEditField>
          </InlineEditGrid>
          <MoreFieldsToggle expanded sticky stickyOffset={96} controls="advanced-region" onToggle={noop} />
          <InlineEditGrid kind="advanced" id="advanced-region" expanded>
            <InlineEditField label="Referral source" htmlFor="f-referral" requirement="optional">
              <input id="f-referral" />
            </InlineEditField>
          </InlineEditGrid>
        </InlineEditor>
      </div>
      <div id="resting">
        <MoreFieldsToggle expanded={false} onToggle={noop} />
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

const LABEL = "#page #primary [data-part='field-label']";
const GRID = "#page #primary [data-part='grid'][data-kind='primary']";
const CELL = "#page #primary [data-part='grid'][data-kind='primary'] > [data-part='field']";
const FULL_FIELD = "#page #primary [data-part='field'][data-span='full']";
const TOGGLE = "#page #primary [data-part='toggle']";
const RESTING_TOGGLE = "#page #resting [data-part='toggle']";

describeCausality({
  family: 'edit-fields',
  markup,
  targets: [
    // The armed sticky dock reads `--ds-surface-canvas`, which IS the seeded
    // background, so seeding the canvas moves the dock's ground — measured
    // at all three verticals. The ink ramps (text-*, border-secondary) are
    // fixed and honestly do not move.
    { id: 'dockGround', selector: TOGGLE, property: 'background-color' },
    // The label rung rides the type plane.
    { id: 'labelSize', selector: LABEL, property: 'font-size' },
    // The shared read↔edit cell rhythm rides the density dial.
    { id: 'cellPad', selector: CELL, property: 'padding-top' },
    // The grid gap is this file's own authored default on no plane, so it is
    // the control every arm below holds.
    { id: 'gridGap', selector: GRID, property: '--ds-edit-fields-grid-gap' },
  ],
  decisions: {
    'palette.seeds': {
      value: { background: '#20303F' },
      moves: ['dockGround'],
      holds: 'gridGap',
      in: VERTICALS,
    },
    'typography.scale': {
      value: 1.08,
      moves: ['labelSize'],
      holds: 'gridGap',
      in: VERTICALS,
    },
    'density.mode': {
      value: 'spacious',
      moves: ['cellPad'],
      holds: 'gridGap',
      in: VERTICALS,
    },
  },
});

// palette.neutral-temperature is measured N/A for this family: the only
// temperature-moved channel in the corpus is the neutral hairline ramp
// (`--ds-color-hairline`), which this skin never reads (its seams ride
// `--ds-color-border-secondary`, a fixed ramp), and every probed family
// reading is byte-identical under `warm` at all three verticals. The
// measurement is pinned below rather than restated as an arm.

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired
 * node, a new node and a same-count swap all go red and must be re-adjudicated.
 * The muted-on-flat contrast pairs below are the family's resting chrome ink
 * (text-secondary labels, text-muted numerals/eyebrows) at bithire and evnto
 * light — measured by this suite for the first time; this cut moved none of
 * the pairs (it moved WHERE the width/span/dock paint lives, never the ink).
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': {
    'color-contrast': [
      'label[for="f-name"]',
      'label[for="f-notes"]',
      'label[for="f-referral"]',
      'span[data-part="editor-description"]',
      'span[data-part="editor-eyebrow"]',
      'span[data-part="field-number"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'label[for="f-name"]',
      'label[for="f-notes"]',
      'label[for="f-referral"]',
      'span[data-part="editor-description"]',
      'span[data-part="editor-eyebrow"]',
      'span[data-part="field-number"]',
    ],
  },
};

describe('edit-fields causality surface', () => {
  it('serves the anatomy every probe reads, stamped by the variants not inline paint', () => {
    for (const part of [
      'editor',
      'grid',
      'field',
      'field-label',
      'control',
      'toggle',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The cut's DOM contract: variants are stamped, channels carry the
    // runtime geometry, and no inline paint survives.
    expect(rendered).toContain('data-span="full"');
    expect(rendered).toContain('data-width="compact"');
    expect(rendered).toContain('--ds-edit-fields-toggle-position:sticky');
    expect(rendered).toContain('--ds-edit-fields-toggle-sticky-offset:96px');
    // No inline paint survives: no grid-column shorthand, and none of the
    // retired dock keys (position/top/z-index) as a STYLE KEY — a leading
    // key or a `;`-separated key, never inside a longer channel name.
    expect(rendered).not.toContain('grid-column:');
    expect(rendered).not.toMatch(/style="(?:[^"]*;)?\s*(position|top|z-index):/);
  });

  it('pins the measured N/A of palette.neutral-temperature: no family paint moves under warm', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, warm: { 'palette.neutral-temperature': 'warm' } },
      targets: [
        { id: 'seamInk', selector: GRID, property: 'border-top-color' },
        { id: 'labelInk', selector: LABEL, property: 'color' },
        { id: 'cellWashGround', selector: CELL, property: 'background-color' },
        { id: 'gridGap', selector: GRID, property: '--ds-edit-fields-grid-gap' },
        // The corpus control: the hairline ramp DOES move, proving the arm
        // reached and the family's hold is the skin's honest answer.
        { id: 'hairline', selector: '#page', property: '--ds-color-hairline' },
      ],
    });
    const base = readings.base!;
    const warm = readings.warm!;
    expect(warm.seamInk).toBe(base.seamInk);
    expect(warm.labelInk).toBe(base.labelInk);
    expect(warm.cellWashGround).toBe(base.cellWashGround);
    expect(warm.gridGap).toBe(base.gridGap);
    expect(warm.hairline).not.toBe(base.hairline);
  }, 120_000);

  it('resolves the variant arms and the sticky channels computed', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        // The armed dock reads the engine's per-instance channels.
        { id: 'togglePosition', selector: TOGGLE, property: 'position' },
        { id: 'toggleOffset', selector: TOGGLE, property: '--ds-edit-fields-toggle-sticky-offset' },
        { id: 'toggleInset', selector: TOGGLE, property: 'inset-block-start' },
        // The unarmed toggle takes no position at all.
        { id: 'restingPosition', selector: RESTING_TOGGLE, property: 'position' },
        // The span arm the skin owns.
        { id: 'fullSpan', selector: FULL_FIELD, property: 'grid-column' },
        // The authored grid defaults are declarations, not fallbacks.
        { id: 'gridGap', selector: GRID, property: '--ds-edit-fields-grid-gap' },
        { id: 'gridColumns', selector: GRID, property: '--ds-edit-fields-grid-columns' },
      ],
    });
    const r = readings.base!;
    expect(r.togglePosition!.trim()).toBe('sticky');
    expect(r.toggleOffset!.trim()).toBe('96px');
    expect(r.toggleInset!.trim()).toBe('96px');
    expect(r.restingPosition!.trim()).toBe('static');
    expect(r.fullSpan!.trim()).toBe('1 / -1');
    expect(r.gridGap!.trim()).toBe('14px');
    expect(r.gridColumns!.trim()).toBe('repeat(3, minmax(0, 1fr))');
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
