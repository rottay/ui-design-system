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
 * The muted-on-tinted contrast pairs below are the family's resting paint
 * (text-muted/tertiary on the tinted card grounds) at bithire and evnto
 * light — measured by this suite for the first time; this cut moved none of
 * the pairs (the drained inline painted the title's SIZE, not its ink).
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': {
    'color-contrast': [
      'button[aria-controls="_R_6_-identity-content"] > .rottay-flex[data-part="section-lead"][data-align="start"] > .rottay-box.rottay-box--modern[data-part="section-index"]',
      'button[aria-controls="_R_a_-review-content"] > .rottay-flex[data-part="section-lead"][data-align="start"] > .rottay-box.rottay-box--modern[data-part="section-index"]',
      'div[data-part="facts-card-item"][data-justify="between"][data-align="start"]:nth-child(1) > .rottay-stack[data-part="facts-card-item-copy"][data-spacing="xs"] > .font-bold[data-part="facts-card-item-label"][data-size="xs"]',
      'div[data-part="facts-card-item"][data-justify="between"][data-align="start"]:nth-child(2) > .rottay-stack[data-part="facts-card-item-copy"][data-spacing="xs"] > .font-bold[data-part="facts-card-item-label"][data-size="xs"]',
      'span[data-part="facts-card-description"]',
      'span[data-part="facts-card-eyebrow"]',
      'span[data-part="facts-card-item-helper"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'button[aria-controls="_R_6_-identity-content"] > .rottay-flex[data-part="section-lead"][data-align="start"] > .rottay-box.rottay-box--modern[data-part="section-index"]',
      'button[aria-controls="_R_a_-review-content"] > .rottay-flex[data-part="section-lead"][data-align="start"] > .rottay-box.rottay-box--modern[data-part="section-index"]',
      'div[data-part="facts-card-item"][data-justify="between"][data-align="start"]:nth-child(1) > .rottay-stack[data-part="facts-card-item-copy"][data-spacing="xs"] > .font-bold[data-part="facts-card-item-label"][data-size="xs"]',
      'div[data-part="facts-card-item"][data-justify="between"][data-align="start"]:nth-child(2) > .rottay-stack[data-part="facts-card-item-copy"][data-spacing="xs"] > .font-bold[data-part="facts-card-item-label"][data-size="xs"]',
      'span[data-part="facts-card-description"]',
      'span[data-part="facts-card-eyebrow"]',
      'span[data-part="facts-card-item-helper"]',
    ],
  },
};

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
    expect(deriveFormSectionsChannels()).toEqual({
      '--ds-form-sections-facts-title-font-size': '17px',
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
