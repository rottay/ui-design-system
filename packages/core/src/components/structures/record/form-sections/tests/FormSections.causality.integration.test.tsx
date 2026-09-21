/**
 * The form-sections family in a real browser: the decision planes its skin
 * honestly answers to move its own paint against a negative control, and
 * axe holds on the section and the facts card.
 *
 * The family's deriver is not registered in the derivation index yet, so the
 * productive door does not emit `--ds-form-sections-facts-title-font-size`:
 * the probes below reach only planes that were already registered
 * (`--ds-color-*`, the density dial, the type scale, the neutral
 * temperature). The family-channel probe — the facts-title channel resolving
 * from a compile — lands with the registration step; the resting value is
 * asserted against the deriver directly instead, and the fallback render is
 * probed computed.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { FormFactsCard, FormSections } from '../index';
import { deriveFormSectionsChannels } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/form-sections';
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
  slug: 'form-sections-causality',
  name: 'Form sections causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Form sections causality' },
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
      <div id="card">
        <FormSections
          collapsible
          defaultActiveKeys={['identity']}
          sections={[
            {
              key: 'identity',
              title: 'Identity',
              description: 'Who this member is.',
              required: true,
              children: <span>Identity body</span>,
            },
          ]}
        />
      </div>
      <div id="editorial">
        <FormSections
          collapsible
          defaultActiveKeys={['review']}
          tone="editorial"
          sections={[
            {
              key: 'review',
              title: 'Review',
              children: <span>Review body</span>,
            },
          ]}
        />
      </div>
      <div id="facts">
        <FormFactsCard
          title="Ledger"
          eyebrow="Summary"
          description="The resolved record."
          items={[
            { label: 'Name', value: 'Ada Lovelace', helper: 'Legal name' },
            { label: 'Balance', value: '1.280,00 €', mono: true },
          ]}
        />
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

const CARD_SECTION = "#page #card [data-part='section']";
const HEADER = "#page #card [data-part='section-header']";
const INDEX = "#page #card [data-part='section-index']";
const EDITORIAL_SECTION = "#page #editorial [data-part='section']";
const FACTS_TITLE = "#page #facts [data-part='facts-card-title']";

describeCausality({
  family: 'form-sections',
  markup,
  targets: [
    // The editorial tone's open surface mixes the card toward the seeded
    // canvas (`color-mix(card 94%, bg-primary)`), so seeding the background
    // moves it — measured at all three verticals. The default tone quotes
    // fixed ramps (bg-secondary, text-*) and honestly does not move.
    { id: 'editorialSurface', selector: EDITORIAL_SECTION, property: 'background-color' },
    // The mono numeral well rides the type plane.
    { id: 'indexSize', selector: INDEX, property: 'font-size' },
    // The header's deliberate px rhythm rides the density dial.
    { id: 'headerPad', selector: HEADER, property: 'padding-top' },
    // The grid wallpaper size is an authored per-tone literal on no plane,
    // so it is the control every arm below holds.
    { id: 'gridSize', selector: CARD_SECTION, property: '--ds-form-sections-grid-size' },
  ],
  decisions: {
    'palette.seeds': {
      value: { background: '#20303F' },
      moves: ['editorialSurface'],
      holds: 'gridSize',
      in: VERTICALS,
    },
    'typography.scale': {
      value: 1.08,
      moves: ['indexSize'],
      holds: 'gridSize',
      in: VERTICALS,
    },
    'density.mode': {
      value: 'spacious',
      moves: ['headerPad'],
      holds: 'gridSize',
      in: VERTICALS,
    },
  },
});

// palette.neutral-temperature is measured N/A for this family: the only
// temperature-moved channel in the corpus is the neutral hairline ramp
// (`--ds-color-hairline`), which this skin never reads, and every probed
// family reading is byte-identical under `warm` at all three verticals. The
// measurement is pinned below rather than restated as an arm.

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired
 * node, a new node and a same-count swap all go red and must be re-adjudicated.
 * DRAINED 2026-09-21 (DT): the muted-on-tinted pairs formerly pinned here
 * (text-muted/tertiary on the tinted card grounds at bithire and evnto
 * light) measure clean after f73348ed5's supporting-ink regrade lifted the
 * rungs over the floor on every light scope — the same drain class as
 * 31c6bc9d1 (typography) and 54737cb6e (checkbox/radio). The map is empty;
 * the fail-closed shape is untouched and reddens on any new measured debt.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('form-sections causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'section',
      'section-header',
      'section-title',
      'section-description',
      'section-index',
      'section-content',
      'facts-card',
      'facts-card-title',
      'facts-card-item',
      'facts-card-item-value',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The hand-made skeleton stamps are gone from the contract.
    expect(rendered).not.toContain('facts-card-item-skeleton-label');
    expect(rendered).not.toContain('facts-card-item-skeleton-value');
    // The disclosure is the only control and carries the expanded wiring.
    expect(rendered).toContain('data-part="section-disclosure"');
  });

  it('pins the measured N/A of palette.neutral-temperature: no family paint moves under warm', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, warm: { 'palette.neutral-temperature': 'warm' } },
      targets: [
        { id: 'editorialSurface', selector: EDITORIAL_SECTION, property: 'background-color' },
        { id: 'headerBg', selector: HEADER, property: 'background-color' },
        { id: 'titleInk', selector: "#page #card [data-part='section-title']", property: 'color' },
        { id: 'gridSize', selector: CARD_SECTION, property: '--ds-form-sections-grid-size' },
        // The corpus control: the hairline ramp DOES move, proving the arm
        // reached and the family's hold is the skin's honest answer.
        { id: 'hairline', selector: '#page', property: '--ds-color-hairline' },
      ],
    });
    const base = readings.base!;
    const warm = readings.warm!;
    expect(warm.editorialSurface).toBe(base.editorialSurface);
    expect(warm.headerBg).toBe(base.headerBg);
    expect(warm.titleInk).toBe(base.titleInk);
    expect(warm.gridSize).toBe(base.gridSize);
    expect(warm.hairline).not.toBe(base.hairline);
  }, 120_000);

  it('resolves the facts-title paint at the resting value and keeps the retired private name dead', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        // The deriver is registered: the productive door emits the channel,
        // so it resolves at the produced value — the same 17px the skin
        // states as its fallback (parity is the deriver suite's contract).
        { id: 'factsTitleSize', selector: FACTS_TITLE, property: 'font-size' },
        { id: 'factsTitleChannel', selector: FACTS_TITLE, property: '--ds-form-sections-facts-title-font-size' },
        { id: 'retiredPrivate', selector: FACTS_TITLE, property: '--_ds-form-sections-facts-title-size' },
        // The per-tone names are the skin's own authored declarations: they
        // resolve without any registered producer.
        { id: 'toneSurface', selector: CARD_SECTION, property: '--ds-form-sections-surface' },
      ],
    });
    const r = readings.base!;
    expect(r.factsTitleSize!.trim()).toBe('17px');
    expect(r.factsTitleChannel!.trim()).toBe('17px');
    expect(r.retiredPrivate!.trim()).toBe('');
    expect(r.toneSurface!.trim()).not.toBe('');
  }, 120_000);

  it('states the family channel at the single resting value the deriver produces', () => {
    // The per-tone tone set is produced at the DEFAULT tone's resting value,
    // quoted byte-identically to the chained fallback the skin states at each
    // read site; the [data-tone] arms redeclare every one of them on the
    // section element, so the four-tone product contract is untouched. Only
    // the value STRINGS chained to produced roots — no resolved pixel moved.
    expect(deriveFormSectionsChannels()).toEqual({
      '--ds-form-sections-accent':
        'color-mix(in srgb, var(--ds-color-text-secondary) 14%, transparent)',
      '--ds-form-sections-accent-secondary':
        'color-mix(in srgb, var(--ds-color-text-primary) 7%, transparent)',
      '--ds-form-sections-active-border': 'var(--ds-color-border)',
      '--ds-form-sections-badge-bg': 'var(--ds-color-bg-secondary)',
      '--ds-form-sections-badge-border': 'var(--ds-color-border-secondary)',
      '--ds-form-sections-border': 'var(--ds-color-border-secondary)',
      '--ds-form-sections-divider':
        'color-mix(in srgb, var(--ds-color-border-secondary) 78%, transparent)',
      '--ds-form-sections-facts-title-font-size': '17px',
      '--ds-form-sections-grid-color':
        'color-mix(in srgb, var(--ds-color-text-muted) 22%, transparent)',
      '--ds-form-sections-muted-surface':
        'color-mix(in srgb, var(--ds-surface-card, var(--ds-color-bg-elevated)) 92%, var(--ds-color-bg-secondary) 8%)',
      '--ds-form-sections-shadow':
        'var(--ds-material-raised-shadow-selected, 0 14px 34px color-mix(in srgb, var(--ds-color-text-primary) 10%, transparent))',
      '--ds-form-sections-surface':
        'var(--ds-surface-card, var(--ds-color-bg-elevated))',
    });
  });

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
