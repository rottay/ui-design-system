/**
 * The guided-draft-form family in a real browser: the shared planes reach the
 * paint the surface owns, the family channel holds its resting value under
 * every arm, and axe holds on the Modern x bithire matrix.
 *
 * The family's chrome deriver is NOT registered yet (DT serializes
 * registration after this lot), so the productive door does not emit
 * `--ds-guided-draft-form-*`: the probes below read only planes that already
 * reach without it, and the family channel is asserted at its resting value
 * through the root's runtime stamp and the deriver directly. The
 * family-channel causality probe lands with DT registration.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { GuidedDraftFormSurface } from '../index';
import { deriveGuidedDraftFormChannels } from '@/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation/chrome/guided-draft-form';
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
  slug: 'guided-draft-form-causality',
  name: 'Guided draft form causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Guided draft form causality' },
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
      <div id="page">
        <GuidedDraftFormSurface
          title="Create event"
          subtitle="Drafts save as you type"
          sections={[
            {
              key: 'info',
              title: 'Basic info',
              description: 'What is this event called',
              isComplete: true,
              render: () => <div>Info fields</div>,
            },
            {
              key: 'schedule',
              title: 'Schedule',
              hasErrors: true,
              render: () => <div>Schedule fields</div>,
            },
          ]}
          draftStatus="saved"
          lastSavedAt="12:30"
          validationIssues={[
            { field: 'Name', message: 'Required', severity: 'error', sectionKey: 'schedule' },
            { field: 'Date', message: 'In the past', severity: 'warning', sectionKey: 'schedule' },
          ]}
          secondaryActions={[{ key: 'save-draft', label: 'Save draft', onClick: () => undefined }]}
          submitLabel="Create"
          onSubmit={() => undefined}
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
const markup = `<div id="host" style="inline-size:64rem">${rendered}</div>`;

const TITLE = "#host [data-part='title']";
const NAV_LABEL = "#host [data-part='section-nav-label']";
const BADGE = "#host [data-part='draft-status']";
const CARD = '#host .ds-guided-draft-form__section-card';
const PANEL = "#host [data-part='submit-bar-panel']";
const ISSUE_DOT = "#host [data-part='validation-issue-dot']";
const ROOT = "#host [data-part='root']";

describeCausality({
  family: 'guided-draft-form',
  markup,
  targets: [
    // The page title's ink and size: the typography plane bends the tier rung.
    { id: 'titleInk', selector: TITLE, property: 'color' },
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
    // The nav eyebrow's weight is the family's own channel: not on any shared
    // plane, so every arm below holds it.
    { id: 'navWeight', selector: NAV_LABEL, property: 'font-weight' },
    // The submit bar's seam and optical padding, the recessed badge ground
    // and the ruled card frame: the surfaces the doctrine names.
    { id: 'submitBarBorder', selector: PANEL, property: 'border-top-color' },
    { id: 'submitBarPad', selector: PANEL, property: 'padding-top' },
    { id: 'badgeGround', selector: BADGE, property: 'background-color' },
    { id: 'cardBorder', selector: CARD, property: 'border-top-color' },
    // The severity dot reads the error status tint, off all four planes.
    { id: 'severityDot', selector: ISSUE_DOT, property: 'background-color' },
    // The family channel the root stamps: a runtime value, held under every arm.
    { id: 'headingChannel', selector: ROOT, property: '--ds-guided-draft-form-heading-font-weight' },
  ],
  decisions: {
    // MEASURED, not assumed: a canvas-only seed lands on `--ds-surface-canvas`,
    // which no family rule reads; the semantic inks the family paints are
    // per-role seeds, and the dark-mode grounds are mode overlays. The arm
    // stays to pin that the plane ARRIVES and the family paint holds.
    'palette.seeds': {
      value: { background: '#20303F' },
      moves: [],
      holds: 'titleInk',
      in: VERTICALS,
    },
    // MEASURED, not assumed: the neutral ramp is produced and the temperature
    // bends it, but every colour this family paints reads a semantic channel,
    // not the ramp — so nothing the family owns moves. The arm pins the hold.
    'palette.neutral-temperature': {
      value: 'warm',
      moves: [],
      holds: 'submitBarBorder',
      in: VERTICALS,
    },
    // `consumes: typography.scale` — the title tier rides the type plane, and
    // the rem-based optical padding follows the root font size.
    'typography.scale': {
      value: 1.08,
      moves: ['titleSize', 'submitBarPad'],
      holds: 'headingChannel',
      in: VERTICALS,
    },
    // `consumes: density` — the submit bar's optical padding rides the
    // spacing plane; the type tier does not.
    'density.mode': {
      value: 'spacious',
      moves: ['submitBarPad'],
      holds: 'titleSize',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 *
 * The findings are serious `color-contrast` rows on paint this cut did NOT
 * touch: the muted ink rung (subtitle, progress, nav eyebrow, draft badge
 * label) against the shipped grounds, and the active pill's primary ink on
 * its tinted ground in dark mode. Reported, not smuggled: fixing them is a
 * palette-lane call, not this cut's.
 */
/**
 * The section description joined this map when the sections left their Card:
 * the card ground was hiding the node from axe rather than making it legible.
 * Its ink is the family's one supporting role, and in bithire and evnto EVERY
 * supporting role (`secondary`/`tertiary`/`muted`/`subtle`) resolved into the
 * #96..#a0 grey band -- 2.49:1 on #fafafa, 2.6:1 on #ffffff -- so no ink this
 * surface could choose cleared 4.5:1. The five siblings already pinned here
 * failed on the same single token. The two section STATUS chips were repaired
 * rather than pinned: off the card ground their tinted copy failed too, so the
 * semantic icon keeps the non-colour cue and the label takes the reading ink.
 *
 * DRAINED 2026-09-21 by the supporting-ink floor (Fable-verified): the three
 * supporting rungs were re-graded at their producer (the default theme's light
 * :root) with tint unchanged, so the description and its five siblings measure
 * clean by identity (2.49-2.6:1 -> 6.5-6.8:1) and left this map. What survives
 * is exactly `draft-status-label`: its chip ground is `--ds-color-bg-tertiary`
 * `#e5e5e5`, where even the re-graded muted reads 4.20:1 -- the ground-side
 * exit (`#e5e5e5` -> `#ededed`) is routed as its own bounded packet, and the
 * active pill's primary ink on its tinted ground in dark mode stays pinned on
 * its own cause.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      'button[data-active="true"] > span[data-state="visible"][data-part="content"] > span[data-part="label"] > .rottay-flex[data-part="section-nav-item-row"][data-align="center"] > .rottay-flex[data-part="section-nav-item-main"][data-align="center"] > span[data-part="section-nav-item-label"][data-color="inherit"][data-size="sm"]',
      'span[data-part="draft-status-label"]',
    ],
  },
  'bithire light': {
    'color-contrast': [
      'span[data-part="draft-status-label"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      'span[data-part="draft-status-label"]',
    ],
  },
  'rottay dark': {
    'color-contrast': [
      'button[data-active="true"] > span[data-state="visible"][data-part="content"] > span[data-part="label"] > .rottay-flex[data-part="section-nav-item-row"][data-align="center"] > .rottay-flex[data-part="section-nav-item-main"][data-align="center"] > span[data-part="section-nav-item-label"][data-color="inherit"][data-size="sm"]',
    ],
  },
};

describe('guided-draft-form causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'root',
      'title',
      'subtitle',
      'title-bar',
      'content',
      'content-body',
      'section-card-title',
      'draft-status',
      'validation-summary-title',
      'validation-issue-dot',
      'submit-bar-panel',
      'submit-bar-actions',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The loading anatomy parts retired with the hand-made skeleton.
    expect(rendered).not.toContain('loading-skeleton');
  });

  it('stamps the heading-weight channel at the resting value the deriver states', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'channel', selector: ROOT, property: '--ds-guided-draft-form-heading-font-weight' },
        { id: 'navWeight', selector: NAV_LABEL, property: 'font-weight' },
        { id: 'severityInk', selector: ISSUE_DOT, property: 'background-color' },
      ],
    });
    // The family deriver is not registered yet, so nothing in the compile
    // states the name; the root's runtime stamp carries the resting value and
    // the skin's fallback chain resolves the nav label to the same rung.
    expect(readings.base!.channel).toBe('600');
    expect(readings.base!.navWeight).toBe('600');
    // The severity arm resolves its status tint (error) at rest.
    expect(readings.base!.severityInk!.trim()).not.toBe('');
    // ...and that fallback chain is exactly what the deriver states at rest.
    expect(
      deriveGuidedDraftFormChannels()['--ds-guided-draft-form-heading-font-weight'],
    ).toBe('var(--ds-font-weight-semibold, 600)');
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
