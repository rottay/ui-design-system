/**
 * The mobile-header family in a real browser: every keypath its chrome deriver
 * declares in `consumes` moves the family's OWN computed paint against a negative
 * control, the kernel state tokens are proven to be what decides the back chip's
 * hover / press / ring (rather than the platform pseudo alone), and axe holds
 * beyond the pinned debt.
 *
 * The three channels this cut produced -- the focus ring, the glass opt-in and the
 * stacking rung -- were read by the skin and written by nobody before it, so a
 * reading that arrives non-empty is the claim.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { MobileHeader } from '../index';
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
  slug: 'mobile-header-causality',
  name: 'Mobile header causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Mobile header causality' },
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
        <MobileHeader title="Order details" onBack={noop} rightActions={<span>Edit</span>} sticky>
          <span>Subtitle</span>
        </MobileHeader>
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
const TRIGGER = "#page #primary [data-part='trigger']";
const LABEL = "#page #primary [data-part='label']";
const BODY = "#page #primary [data-part='body']";

describeCausality({
  family: 'mobile-header',
  markup,
  targets: [
    // The bar's own ground, on the family's channel.
    { id: 'barGround', selector: ROOT, property: 'background-color' },
    // The title's optical size, over the lg rung on the type plane.
    { id: 'titleSize', selector: LABEL, property: 'font-size' },
    // The back chip's corner and its ring.
    { id: 'triggerRadius', selector: TRIGGER, property: 'border-top-left-radius' },
    { id: 'triggerRing', selector: TRIGGER, property: '--ds-mobile-header-focus-ring' },
    // The 56px bar row is density-neutral by decision, so it is the control every
    // arm below holds: a mobile bar that moved with the density dial would stop
    // being the platform-height bar its consumers position against.
    { id: 'barRow', selector: ROOT, property: '--ds-mobile-header-bar-block-size' },
  ],
  decisions: {
    // `consumes: palette.*` -- the bar's own ground.
    'palette.seeds': {
      value: { background: '#20303F' },
      moves: ['barGround'],
      holds: 'barRow',
      in: VERTICALS,
    },
    // NOT an arm, and the reason is measured rather than assumed: the hairline
    // resolves `--ds-color-border`, which rottay's baseline states verbatim
    // (#1C1C20) and which NO catalog decision moves -- seeds, neutral-temperature,
    // contrast-posture, dark-mode, border-style and elevation-posture were all read
    // against it and all seven arms came back byte-identical. This family now owns
    // `--ds-mobile-header-hairline-color` over that role, so a tenant has a name to
    // reach; making the shared role itself reachable is the palette lane's, routed.
    // `consumes: typography.scale` -- the 17px optical title over the lg rung.
    'typography.scale': {
      value: 1.08,
      moves: ['titleSize'],
      holds: 'barRow',
      in: VERTICALS,
    },
    // `consumes: shape.*` -- the back chip's corner over the md radius rung.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['triggerRadius'],
      holds: 'barRow',
      in: VERTICALS,
    },
    // `consumes: surfaces.focusStyle` / `states.*` -- the chip's keyboard ring.
    'states.focus-style': {
      value: 'glow',
      moves: ['triggerRing'],
      holds: 'barRow',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('mobile-header causality surface', () => {
  it('serves the anatomy every probe reads, and no geometry of its own', () => {
    for (const part of ['sticky-sentinel', 'root', 'bar', 'left', 'trigger', 'center', 'label', 'right', 'body']) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The retired inline `position: sticky` was the runtime's last stamped geometry.
    expect(rendered).not.toContain('position:sticky');
    expect(rendered).toContain('data-sticky="true"');
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
        { id: 'barRow', selector: ROOT, property: '--ds-mobile-header-bar-block-size' },
        { id: 'barGutter', selector: ROOT, property: '--ds-mobile-header-bar-padding-inline' },
        { id: 'centerGutter', selector: ROOT, property: '--ds-mobile-header-center-padding-inline' },
        { id: 'hairlineColor', selector: ROOT, property: '--ds-mobile-header-hairline-color' },
        { id: 'stickyBg', selector: ROOT, property: '--ds-mobile-header-sticky-bg' },
        { id: 'stickyBackdrop', selector: ROOT, property: '--ds-mobile-header-sticky-backdrop' },
        { id: 'stickyZ', selector: ROOT, property: '--ds-mobile-header-sticky-z' },
        { id: 'stuckShadow', selector: ROOT, property: '--ds-mobile-header-stuck-shadow' },
        { id: 'titleSize', selector: ROOT, property: '--ds-mobile-header-title-font-size' },
        { id: 'titleLeading', selector: ROOT, property: '--ds-mobile-header-title-line-height' },
        { id: 'titleTracking', selector: ROOT, property: '--ds-mobile-header-title-tracking' },
        { id: 'triggerRadius', selector: ROOT, property: '--ds-mobile-header-trigger-radius' },
        { id: 'triggerTint', selector: ROOT, property: '--ds-mobile-header-trigger-tint' },
        { id: 'pressScale', selector: ROOT, property: '--ds-mobile-header-trigger-press-scale' },
        { id: 'focusRing', selector: ROOT, property: '--ds-mobile-header-focus-ring' },
        // The two names this cut lifted out of the family-private namespace.
        { id: 'retiredBarRow', selector: ROOT, property: '--_ds-mobile-header-bar-block-size' },
        { id: 'retiredSafeArea', selector: ROOT, property: '--_ds-mobile-header-safe-area' },
        // The safe-area channel is read for its EFFECT rather than its text: a
        // custom property whose value is an `env()` chain reads back empty from
        // `getPropertyValue` in Chromium even while it substitutes correctly, so
        // the padding it feeds is the honest measurement.
        { id: 'inset', selector: ROOT, property: 'padding-top' },
        { id: 'rootHeight', selector: ROOT, property: '@rect.height' },
      ],
    });
    const r = readings.base!;
    for (const [id, value] of Object.entries(r)) {
      if (id.startsWith('retired') || id === 'inset' || id === 'rootHeight') continue;
      expect({ id, empty: value.trim() === '' }, id).toEqual({ id, empty: false });
    }
    expect(r.retiredBarRow!.trim()).toBe('');
    expect(r.retiredSafeArea!.trim()).toBe('');
    // Glass stays opt-in: a default-ON backdrop blur taxes every scroll frame.
    expect(r.stickyBackdrop!.trim()).toBe('none');
    expect(r.barRow!.trim()).toBe('56px');
    // Off-device the inset is zero, so the root box is the bar row exactly -- which
    // is the whole claim of the box model: the notch is ADDED to the root rather
    // than taken out of the row.
    expect(r.inset).toBe('0px');
    expect(Number.parseFloat(r.rootHeight!)).toBe(56);
  }, 120_000);

  /**
   * Hover, press and the ring are decided by the kernel and read off `data-state`,
   * with the platform pseudo as the fallback arm of the same rule. Stamping the
   * token alone has to move the chip, or the kernel is not what decides.
   */
  it('lifts the back chip from the kernel state tokens, not only from the pseudo', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'resting', selector: TRIGGER, property: 'background-color' },
        {
          id: 'hovered',
          selector: TRIGGER,
          property: 'background-color',
          attributes: { 'data-state': 'hovered' },
        },
        { id: 'restingTransform', selector: TRIGGER, property: 'transform' },
        {
          id: 'pressedTransform',
          selector: TRIGGER,
          property: 'transform',
          attributes: { 'data-state': 'pressed' },
        },
        { id: 'restingShadow', selector: TRIGGER, property: 'box-shadow' },
        {
          id: 'ringShadow',
          selector: TRIGGER,
          property: 'box-shadow',
          attributes: { 'data-state': 'focus-visible' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.hovered).not.toBe(r.resting);
    expect(r.pressedTransform).not.toBe(r.restingTransform);
    expect(r.ringShadow).not.toBe(r.restingShadow);
  }, 120_000);

  it('gives the slot below the bar the bar’s own gutter', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'bodyGutter', selector: BODY, property: 'padding-left' },
        { id: 'barGutter', selector: "#page #primary [data-part='bar']", property: 'padding-left' },
      ],
    });
    const r = readings.base!;
    // The slot used to sit flush against the root edge while the bar was inset.
    expect(r.bodyGutter).toBe(r.barGutter);
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
