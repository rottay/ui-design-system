/**
 * The cockpit-header family in a real browser: every keypath its chrome deriver
 * declares in `consumes` is exercised against the family's OWN computed paint with
 * a negative control, the channels the deriver produces are proven to resolve
 * rather than to fall back to a literal nobody writes, the back control is proven
 * to be painted by the Button's own state rather than by this header, and axe holds
 * beyond the pinned debt.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import ModernCockpitHeader from '../engines/modern';
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
  slug: 'cockpit-header-causality',
  name: 'Cockpit header causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Cockpit header causality' },
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
        <ModernCockpitHeader
          title="Event #1234"
          subtitle="Summer music festival"
          eyebrow="Workspace"
          icon={<span>I</span>}
          breadcrumbs={[{ label: 'Events', href: '/events' }, { label: 'Event #1234' }]}
          status={[{ label: 'Active', variant: 'success' }]}
          actions={<button type="button">Save</button>}
          onBack={noop}
          sticky
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

const ROOT = "#page #primary [data-part='root']";
const TILE = "#page #primary [data-part='header-icon']";
const TITLE = "#page #primary [data-part='title']";
const TRAIL = "#page #primary [data-part='breadcrumb']";
const BACK = "#page #primary [data-part='back'] .ds-button";

describeCausality({
  family: 'cockpit-header',
  markup,
  targets: [
    // The identity tile's ink is the seeded primary, read through the workspace hook.
    { id: 'tileInk', selector: TILE, property: 'color' },
    // The card ground, produced by the family channel. It INTENTIONALLY defers
    // to the shared card-header ground, which the foundation defaults to
    // `transparent` on `:root` in every vertical — so palette seeds do not move
    // it (measured below), and an authored `--ds-card-header-bg` wins verbatim.
    { id: 'cardGround', selector: ROOT, property: 'background-image' },
    // The page title, on the type ramp.
    { id: 'titleFont', selector: TITLE, property: 'font-size' },
    // The card gutter rides the rhythm and density planes.
    { id: 'cardPad', selector: ROOT, property: 'padding-top' },
    // The tile's corner rides the edge dial.
    { id: 'tileRadius', selector: TILE, property: 'border-top-left-radius' },
    // The trail's gutter is a stated number on no plane at all, so it is the
    // control every arm below holds.
    { id: 'trailPad', selector: TRAIL, property: 'padding-top' },
  ],
  decisions: {
    // `consumes: palette.*` — the identity tile's ink is the painted palette
    // arm. The card ground is NOT claimed here: it defers to the shared
    // card-header ground (foundation default `transparent` on `:root`, shipped
    // in all three verticals), so seeds cannot move it; the deferral itself is
    // measured in the causality surface below.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['tileInk'],
      holds: 'trailPad',
      in: VERTICALS,
    },
    // `consumes: typography.scale`
    'typography.scale': {
      value: 1.08,
      moves: ['titleFont'],
      holds: 'trailPad',
      in: VERTICALS,
    },
    // `consumes: density`
    'density.mode': {
      value: 'spacious',
      moves: ['cardPad'],
      holds: 'trailPad',
      in: VERTICALS,
    },
    // `consumes: spacing.rhythm`
    'spacing.rhythm': {
      value: 'airy',
      moves: ['cardPad'],
      holds: 'trailPad',
      in: VERTICALS,
    },
    // `consumes: surfaces.radiusScale` — 1.2, the rottay envelope maximum
    // (0.8..1.2), matching the fleet-wide probe convention; 1.25 is refused at
    // admission and never reaches the instrument.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['tileRadius'],
      holds: 'trailPad',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('cockpit-header causality surface', () => {
  it('serves the anatomy every probe reads, and no skeleton of its own', () => {
    for (const part of [
      'root',
      'breadcrumb',
      'crumb-list',
      'crumb-item',
      'separator',
      'crumb',
      'main-row',
      'lead',
      'back',
      'header-icon',
      'titles',
      'eyebrow',
      'title-row',
      'title',
      'status-list',
      'status',
      'subtitle',
      'actions',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The hand-written loading blocks are gone, stamp and channel together.
    expect(rendered).not.toContain('data-part="skeleton');
    expect(rendered).not.toContain('--ds-cockpit-header-skeleton-radius');
  });

  /**
   * The channels this cut PRODUCED rather than left to a fallback nobody writes.
   * The reading is the resolved value, so an unproduced name would arrive empty.
   */
  it('resolves every channel the family deriver produces', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'ground', selector: ROOT, property: '--ds-cockpit-header-bg' },
        { id: 'iconSize', selector: ROOT, property: '--ds-cockpit-header-icon-size' },
        { id: 'stickyZ', selector: ROOT, property: '--ds-cockpit-header-sticky-z' },
        { id: 'backdrop', selector: ROOT, property: '--ds-cockpit-header-actions-backdrop' },
        // The tile's measured size is the produced channel, not the old fallback.
        { id: 'tileWidth', selector: TILE, property: 'width' },
      ],
    });
    const r = readings.base!;
    for (const id of ['ground', 'iconSize', 'stickyZ', 'backdrop']) {
      expect({ id, empty: r[id]!.trim() === '' }, id).toEqual({ id, empty: false });
    }
    expect(r.tileWidth).toBe('40px');
  }, 120_000);

  /**
   * The card ground's deferral is a claim, so it is measured rather than
   * assumed: the produced channel resolves to the shared card-header ground
   * (the foundation ships `transparent` on `:root` in every vertical), and a
   * seeded palette leaves the ground untouched — the painted palette causality
   * of this family lives on the identity tile, not the ground. A family-local
   * seeded gradient was measured dead and removed; an authored
   * `--ds-card-header-bg` still wins verbatim through the chain.
   */
  it('grounds the card on the shared card-header ground, which defers palette by design', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
      targets: [
        { id: 'produced', selector: ROOT, property: '--ds-cockpit-header-bg' },
        { id: 'ground', selector: ROOT, property: 'background-image' },
      ],
    });
    const r = readings.base!;
    expect(r.produced!.trim()).not.toBe('');
    expect(r.ground).toBe('none');
    expect(readings.seeded!.ground).toBe('none');
  }, 120_000);

  /**
   * The card lifts from the kernel's token, not only from `:hover`. Stamping the
   * token alone has to move the card, or the kernel is not what decides.
   */
  it('lifts the card from the kernel state token as well as the platform pseudo', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'resting', selector: ROOT, property: 'background-position-x' },
        {
          id: 'hovered',
          selector: ROOT,
          property: 'background-position-x',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'pressed',
          selector: ROOT,
          property: 'background-position-x',
          attributes: { 'data-state': 'pressed' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.hovered).not.toBe(r.resting);
    expect(r.pressed).not.toBe(r.resting);
  }, 120_000);

  /**
   * The back control: this header states the ghost channels and the BUTTON paints
   * itself from its own state. Stamping the Button's token has to move it, which is
   * only true if the paint travels through the channel rather than through a rule
   * of this family's that reaches into the control.
   */
  it('paints the back control through the Button channels, from the Button state', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'channel', selector: BACK, property: '--ds-button-ghost-bg-hover' },
        { id: 'resting', selector: BACK, property: 'background-color' },
        {
          id: 'hovered',
          selector: BACK,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'pressed',
          selector: BACK,
          property: 'background-color',
          attributes: { 'data-state': 'pressed' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.channel!.trim()).not.toBe('');
    expect(r.hovered).not.toBe(r.resting);
    expect(r.pressed).not.toBe(r.resting);
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
