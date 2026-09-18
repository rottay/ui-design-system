/**
 * The detail-header family in a real browser: the decisions its chrome deriver
 * declares in `consumes` move the family's OWN computed paint through the
 * shared roots the SKIN's fallback chains state — while the deriver itself is
 * still unregistered, which is exactly the point: a probe that only passed
 * after registration would prove nothing about the resting render. The kernel
 * state tokens are proven to be what decides the tab's hover / press / ring,
 * and axe holds beyond the pinned debt.
 *
 * Adapted for an UNREGISTERED deriver (WO-FAM-10 sub-lot D2): the reference
 * suites resolve every produced channel against the compiled artifact, which
 * cannot pass until the DT registers the deriver. This suite probes through
 * the skin's own fallback chains instead and asserts nothing about artifact
 * emission.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { DetailHeader } from '../index';
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
  slug: 'detail-header-causality',
  name: 'Detail header causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Detail header causality' },
};

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 16 16" {...props}><rect width="16" height="16" /></svg>;

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
        <DetailHeader
          title="Acme Corp"
          subtitle="The acme corporation"
          avatar="/acme.png"
          status={{ label: 'Active', variant: 'success' }}
          backHref="/customers"
          backLabel="Back"
          breadcrumb={[{ label: 'Customers', href: '/customers' }, { label: 'Acme Corp' }]}
          actions={[{ label: 'Edit', onClick: noop }]}
          tabs={[
            { id: 'overview', label: 'Overview', count: 3 },
            { id: 'activity', label: 'Activity' },
          ]}
          activeTab="overview"
          onTabChange={noop}
          metadata={[{ label: 'ID', value: '12345', mono: true }]}
          eyebrow="Customer"
        >
          <span>extra</span>
        </DetailHeader>
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
const TITLE = "#page #primary [data-part='title']";
const AVATAR = "#page #primary [data-part='avatar']";
const CHIP = "#page #primary [data-part='back-button']";
const TAB = "#page #primary [data-part='tab']";
const TAB_INACTIVE = "#page #primary [data-part='tab'][data-active='false']";
const SPINE = "#page #primary [data-part='hero-spine']";

describeCausality({
  family: 'detail-header',
  markup,
  targets: [
    // The hero's display type, over the page-title role rung the skin's
    // fallback chain states (`--ds-detail-header-title-size` resting on
    // `--ds-type-page-title-font-size`).
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
    // The frame's corner, over the xl rung of the shape ramp.
    { id: 'heroRadius', selector: ROOT, property: 'border-top-left-radius' },
    // The tab's keyboard ring, stamped by the kernel token the paired rule
    // reads, resting on the shared focus-style root. Its inner layer rides
    // the canvas, so the background seed moves it too -- measured, not
    // assumed (see the palette.seeds arm below).
    {
      id: 'tabRing',
      selector: TAB,
      property: 'box-shadow',
      attributes: { 'data-state': 'focus-visible' },
    },
    // The negative control: the back chip's padding is a literal family
    // fallback no catalog decision reaches (the type scale bends the spacing
    // ramp -- it moves the hero gutter -- but never this resting value).
    { id: 'backPadding', selector: CHIP, property: 'padding-top' },
  ],
  decisions: {
    // `consumes: palette.*` — measured against the family's own paint: the
    // spine and the tab-count well are mixed from `--ds-color-primary`, and
    // the background-seed arm does NOT move primary in any of the three
    // first-party verticals, so an arm naming them would claim causality the
    // tree refutes. What the seed does move is the ring's canvas layer (its
    // first shadow layer derives from the mode's own ground).
    'palette.seeds': {
      value: { background: '#20303F' },
      moves: ['tabRing'],
      holds: 'backPadding',
      in: VERTICALS,
    },
    // `consumes: typography.scale` — the page-title role rung.
    'typography.scale': {
      value: 1.08,
      moves: ['titleSize'],
      holds: 'backPadding',
      in: VERTICALS,
    },
    // `consumes: shape.*` — the xl radius rung under the family channel.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['heroRadius'],
      holds: 'backPadding',
      in: VERTICALS,
    },
    // `consumes: states.*` — the shared focus-style root under the tab ring
    // channel. The back chip's ring is the platform's own authority and has
    // no kernel twin to stamp, so it is not probed.
    'states.focus-style': {
      value: 'glow',
      moves: ['tabRing'],
      holds: 'backPadding',
      in: VERTICALS,
    },
  },
});

describe('detail-header causality surface', () => {
  it('serves the anatomy every probe reads, and no geometry of its own', () => {
    for (const part of [
      'root', 'top-bar', 'back-button', 'breadcrumb-trail', 'actions',
      'hero-panel', 'hero-spine', 'hero-cluster', 'hero-copy',
      'metadata-card', 'tab-strip', 'tab-list', 'tab', 'tab-rail',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The retired inline flex shares were the runtime's last stamped geometry.
    expect(rendered).not.toContain('min-width');
    expect(rendered).not.toContain('flex:');
  });

  /**
   * Hover, press and the ring are decided by the kernel and read off
   * `data-state`, with the platform pseudo as the fallback arm of the same
   * rule. Stamping the token alone has to move the tab, or the kernel is not
   * what decides.
   */
  it('lifts the tab from the kernel state tokens, not only from the pseudo', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'resting', selector: TAB_INACTIVE, property: 'background-color' },
        {
          id: 'hovered',
          selector: TAB_INACTIVE,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'pressed',
          selector: TAB_INACTIVE,
          property: 'background-color',
          attributes: { 'data-state': 'pressed' },
        },
        { id: 'restingShadow', selector: TAB, property: 'box-shadow' },
        {
          id: 'ringShadow',
          selector: TAB,
          property: 'box-shadow',
          attributes: { 'data-state': 'focus-visible' },
        },
        // The hover and press washes are the INACTIVE tab's treatment; the
        // active tab must not move under the same tokens.
        {
          id: 'activeHovered',
          selector: TAB,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'activePressed',
          selector: TAB,
          property: 'background-color',
          attributes: { 'data-state': 'pressed' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.hovered).not.toBe(r.resting);
    expect(r.pressed).not.toBe(r.resting);
    expect(r.ringShadow).not.toBe(r.restingShadow);
    expect(r.activeHovered).toBe(r.resting);
    expect(r.activePressed).toBe(r.resting);
  }, 120_000);

  it('holds the back chip padding and the avatar rung against the seed arm', async () => {
    // The controls above are asserted per arm in describeCausality; this case
    // pins them against the seed arm too, where the measured paint move (the
    // ring's canvas layer) is largest.
    const readings = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {}, seeds: { 'palette.seeds': { background: '#20303F' } } },
      targets: [
        { id: 'backPadding', selector: CHIP, property: 'padding-top' },
        { id: 'avatarSize', selector: AVATAR, property: 'width' },
        {
          id: 'tabRing',
          selector: TAB,
          property: 'box-shadow',
          attributes: { 'data-state': 'focus-visible' },
        },
        // The family's own primary-mixed paint stays put under a background
        // seed: primary is not the background seed.
        { id: 'spinePaint', selector: SPINE, property: 'background-color' },
      ],
    });
    expect(readings.seeds!.tabRing).not.toBe(readings.base!.tabRing);
    expect(readings.seeds!.backPadding).toBe(readings.base!.backPadding);
    expect(readings.seeds!.avatarSize).toBe(readings.base!.avatarSize);
    expect(readings.seeds!.spinePaint).toBe(readings.base!.spinePaint);
  }, 120_000);

  /**
   * Measured debt, pinned by node IDENTITY rather than by count: a repaired
   * node, a new node and a same-count swap all go red and must be
   * re-adjudicated.
   */
  const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
