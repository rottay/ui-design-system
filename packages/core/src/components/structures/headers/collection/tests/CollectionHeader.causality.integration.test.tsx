/**
 * The collection-header family in a real browser: every decision its chrome
 * deriver declares in `consumes` moves the family's OWN computed paint through
 * a decision-driven SHARED ROOT in the skin's fallback chain — the deriver is
 * NOT registered yet (the DT adds it at integration), so these probes read the
 * fallback arms (`var(--ds-collection-header-x, var(--ds-spacing-3))`) and prove
 * a tenant decision reaches the family even while the family channel is still
 * a fallback. A literal negative control holds every arm, the kernel state
 * tokens are proven to be what decides the chrome lift (rather than the
 * platform pseudo alone), and axe holds beyond the pinned debt.
 *
 * The channels this cut produced rather than left to a fallback nobody writes
 * are asserted in the deriver's contract test (single-fallback parity), not
 * here: a productive compile cannot emit them until the registration line
 * lands, so a browser reading would assert an empty string the artifact does
 * not yet carry.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { CollectionHeader } from '../index';
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
  slug: 'collection-header-causality',
  name: 'Collection header causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Collection header causality' },
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
        <CollectionHeader
          eyebrow="Workspace"
          title="Candidates"
          subtitle="All active candidates"
          layoutVariant="editorial-tech"
          compact={false}
          metaItems={[
            { key: 'a', label: '12 active', tone: 'primary' },
            { key: 'b', label: 'Neutral', tone: 'neutral' },
          ]}
          shortcuts={[{ key: 's', label: 'Command K' }]}
          quickActions={[
            { key: 'q1', label: 'Invite', onClick: noop, variant: 'primary' },
            { key: 'q2', label: 'Export', onClick: noop, variant: 'secondary' },
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

const ROOT = "#page #primary .ds-collection-header[data-part='root']";
const PILL = "#page #primary [data-part='quick-actions']";
const TITLE = "#page #primary [data-part='title']";
const SUBTITLE = "#page #primary [data-part='subtitle']";
const META = "#page #primary [data-part='meta-item']";

describeCausality({
  family: 'collection-header',
  markup,
  targets: [
    // The root card's radius, shadow and posture padding: every one resolves
    // through a family channel whose fallback is a governed shared root.
    { id: 'rootRadius', selector: ROOT, property: 'border-top-left-radius' },
    { id: 'rootShadow', selector: ROOT, property: 'box-shadow' },
    { id: 'rootPadStart', selector: ROOT, property: 'padding-top' },
    // The hero type ladder.
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
    { id: 'subtitleSize', selector: SUBTITLE, property: 'font-size' },
    // The primary tone frame: mixed from the brand toward transparency at a
    // fixed strength, so the brand seed reaches the chip's keyline through
    // the shared role.
    { id: 'metaKeyline', selector: META, property: 'border-top-color' },
    // LITERAL NEGATIVE CONTROL: the editorial variant's quiet ink (0.92) is a
    // literal with no shared root behind it — no catalog decision may move it.
    // (Letter-spacing in `em` was rejected as the control: it resolves against
    // the moved font-size, so the type arm moved it — measured, not assumed.)
    { id: 'literalControl', selector: SUBTITLE, property: 'opacity' },
  ],
  decisions: {
    // `consumes: palette.*` — the primary seed re-derives the brand role, and
    // the tone keyline resolves through it.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['metaKeyline'],
      holds: 'literalControl',
      in: VERTICALS,
    },
    // `consumes: typography.scale` — the subtitle's supporting rung (and the
    // hero's fluid step) move with the type scale.
    'typography.scale': {
      value: 1.08,
      moves: ['subtitleSize', 'titleSize'],
      holds: 'literalControl',
      in: VERTICALS,
    },
    // `consumes: spacing.rhythm` — the root's posture padding resolves through
    // the spacing ramp roots multiplied by the bounded rhythm scale.
    'spacing.rhythm': {
      value: 'airy',
      moves: ['rootPadStart'],
      holds: 'literalControl',
      in: VERTICALS,
    },
    // `consumes: shape.*` — the card corner resolves through the radius ramp.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['rootRadius'],
      holds: 'literalControl',
      in: VERTICALS,
    },
    // `consumes: surfaces.elevation-posture` — the resting depth resolves
    // through the governed elevation ramp.
    'surfaces.elevation-posture': {
      value: 'elevated',
      moves: ['rootShadow'],
      holds: 'literalControl',
      in: VERTICALS,
    },
    // NOT an arm, and the reason is stated rather than assumed: the meta
    // chip's primary keyline mixes the brand role at a FIXED 22% toward
    // transparency, so the `palette.neutral-temperature`,
    // `palette.contrast-posture` and `palette.dark-mode` arms leave it
    // untouched — only the brand seed itself reaches it. The family owns
    // `--ds-collection-header-display-color` over that role, so a tenant has
    // a name to reach beyond the seed.
  },
});

describe('collection-header causality surface', () => {
  it('serves the anatomy every probe reads, with no geometry of its own', () => {
    for (const part of [
      'root',
      'identity',
      'title',
      'eyebrow',
      'subtitle',
      'subtitle-row',
      'meta-item',
      'secondary-rail',
      'quick-actions',
      'shortcut-pill',
      'shortcuts-label',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The drain's contract: no inline declaration sets a real property — the
    // only inline values in the subtree are the composed primitives' own
    // `--ds-*` channels (flex gaps, button recipe/transform channels).
    for (const match of rendered.matchAll(/style="([^"]*)"/g)) {
      for (const declaration of (match[1] ?? '').split(';')) {
        const property = declaration.split(':')[0]?.trim() ?? '';
        if (!property) continue;
        expect(property.startsWith('--ds-'), `inline property ${property}`).toBe(true);
      }
    }
  });

  /**
   * Hover and press on the two chrome surfaces are decided by the kernel and
   * read off `data-state`, with the platform pseudo as the fallback arm of the
   * same rule. Stamping the token alone has to move the surface, or the
   * kernel is not what decides.
   */
  it('lifts the card and the cluster from the kernel state tokens, not only from the pseudo', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restingCard', selector: ROOT, property: 'box-shadow' },
        {
          id: 'hoveredCard',
          selector: ROOT,
          property: 'box-shadow',
          attributes: { 'data-state': 'hovered' },
        },
        { id: 'restingPill', selector: PILL, property: 'transform' },
        {
          id: 'pressedPill',
          selector: PILL,
          property: 'transform',
          attributes: { 'data-state': 'pressed' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.hoveredCard).not.toBe(r.restingCard);
    expect(r.pressedPill).not.toBe(r.restingPill);
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

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};
