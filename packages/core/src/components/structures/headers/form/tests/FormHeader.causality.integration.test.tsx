/**
 * The form-header family in a real browser: every keypath its chrome deriver
 * declares in `consumes` is exercised against the family's OWN computed paint with
 * a negative control, the header-tone contract is proven to be what decides the
 * badge (rather than an inline style the component computed), and axe holds beyond
 * the pinned debt.
 *
 * Two headers are mounted, one per tone, because that is the thing this cut
 * changed: the tone used to be three inline custom properties the component wrote,
 * and it is now a `data-variant` stamp the skin keys on. A reading that differs
 * between the two mounts, from one stylesheet and no inline paint, is that claim.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { FormHeader } from '../index';
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

const Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} viewBox="0 0 24 24" />;

const TENANT: TenantConfig = {
  slug: 'form-header-causality',
  name: 'Form header causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Form header causality' },
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
        <FormHeader
          icon={Icon}
          title="Create entity"
          subtitle="The record this form makes"
          eyebrow="New"
          backHref="/entities"
          colorVariant="primary"
          breadcrumb={[{ label: 'Entities', href: '/entities' }]}
          actions={[{ label: 'Create', kind: 'create', onClick: noop }]}
          contextRail={<span>Context</span>}
        >
          <span>Body</span>
        </FormHeader>
      </div>
      <div id="secondary">
        <FormHeader
          icon={Icon}
          title="Create entity"
          backHref="/entities"
          colorVariant="secondary"
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

const PRIMARY = "#page #primary [data-part='root']";
const BADGE = "#page #primary [data-part='icon-badge']";
const NEUTRAL_BADGE = "#page #secondary [data-part='icon-badge']";
const TITLE = "#page #primary [data-part='title']";
const HERO = "#page #primary [data-part='hero-panel']";
const BACK = "#page #primary [data-part='back-button']";
const HERO_ROW = "#page #primary [data-part='hero-row']";

describeCausality({
  family: 'form-header',
  markup,
  targets: [
    // The badge tone, which the header-tone contract now decides from the stamp.
    { id: 'badgeGround', selector: BADGE, property: 'background-color' },
    { id: 'badgeInk', selector: BADGE, property: 'color' },
    // The h1 on the governed page-title role, through the family's own channel.
    { id: 'titleFont', selector: TITLE, property: 'font-size' },
    // The hero gutter rides the rhythm/density planes.
    { id: 'heroPad', selector: HERO, property: 'padding-top' },
    // The back chip's ring, resolved through the header contract's channel.
    { id: 'backRing', selector: BACK, property: '--ds-header-back-focus-ring' },
    // The badge's corner is a stated number on no plane at all, so it is the
    // control every arm below holds.
    { id: 'badgeRadius', selector: BADGE, property: 'border-top-left-radius' },
  ],
  decisions: {
    // `consumes: palette.*` -- the badge tone mixes the seeded primary.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['badgeGround', 'badgeInk'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // `consumes: typography.scale` + `typography.roles` -- the h1 is the family's
    // own display text on the page-title role.
    'typography.scale': {
      value: 1.08,
      moves: ['titleFont'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // `consumes: density` -- the hero gutter rides the tenant density plane.
    'density.mode': {
      value: 'spacious',
      moves: ['heroPad'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // `consumes: spacing.rhythm` -- the same gutter, on the rhythm plane.
    'spacing.rhythm': {
      value: 'airy',
      moves: ['heroPad'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
    // The header CONTRACT's own keypath (`chrome/header` consumes
    // `surfaces.focusStyle` / `states.*`): the back chip's ring is produced once
    // for both header families and resolves from the governed focus decision.
    'states.focus-style': {
      value: 'glow',
      moves: ['backRing'],
      holds: 'badgeRadius',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('form-header causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'root',
      'top-bar',
      'back-button',
      'back-icon',
      'back-label',
      'breadcrumb-divider',
      'hero-panel',
      'hero-row',
      'hero-cluster',
      'icon-badge',
      'icon-badge-glyph',
      'eyebrow',
      'title',
      'subtitle',
      'actions',
      'action-icon',
      'context-card',
      'context-rail',
      'context-card-children',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The tone is a stamp now, and the component writes no tone style at all.
    expect(rendered).toContain('data-variant="primary"');
    expect(rendered).toContain('data-variant="secondary"');
    expect(rendered).not.toContain('--ds-header-icon-tone-bg');
    // The retired rail flag has no consumer left.
    expect(rendered).not.toContain('data-has-rail');
  });

  /**
   * The header contract, measured: one stylesheet, no inline paint, and the two
   * mounts differ only by the stamp the resolver produced. A tone that were still
   * computed in TypeScript would read identically here, because neither mount
   * carries a style attribute on its badge.
   */
  it('lets the stamped tone, and nothing inline, decide the badge paint', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'primaryGround', selector: BADGE, property: 'background-color' },
        { id: 'neutralGround', selector: NEUTRAL_BADGE, property: 'background-color' },
        { id: 'primaryBorder', selector: BADGE, property: 'border-top-color' },
        { id: 'neutralBorder', selector: NEUTRAL_BADGE, property: 'border-top-color' },
        { id: 'toneChannel', selector: BADGE, property: '--ds-header-icon-tone-bg' },
      ],
    });
    const r = readings.base!;
    expect(r.primaryGround).not.toBe(r.neutralGround);
    expect(r.primaryBorder).not.toBe(r.neutralBorder);
    // The local channel resolves from the contract's channel rather than from a
    // fallback nobody writes.
    expect(r.toneChannel!.trim()).not.toBe('');
  }, 120_000);

  /**
   * Hover is decided by the kernel and read off `data-state`, with the platform
   * pseudo as the fallback arm of the same rule. Stamping the token alone has to
   * move the chip, or the kernel is not what decides.
   */
  it('lifts the back chip from the kernel state token, not only from :hover', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
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
    expect(r.hovered).not.toBe(r.resting);
    expect(r.pressed).not.toBe(r.resting);
  }, 120_000);

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
        { id: 'rootMargin', selector: PRIMARY, property: '--ds-form-header-root-margin' },
        { id: 'backdrop', selector: PRIMARY, property: '--ds-form-header-context-backdrop' },
        { id: 'titleSize', selector: PRIMARY, property: '--ds-form-header-title-font-size' },
        { id: 'titleCompact', selector: PRIMARY, property: '--ds-form-header-title-font-size-compact' },
        { id: 'heroCompact', selector: PRIMARY, property: '--ds-form-header-hero-padding-compact' },
        { id: 'rowGapChannel', selector: PRIMARY, property: '--ds-form-header-hero-row-gap' },
        { id: 'rowGap', selector: HERO_ROW, property: 'row-gap' },
      ],
    });
    const r = readings.base!;
    for (const id of [
      'rootMargin',
      'backdrop',
      'titleSize',
      'titleCompact',
      'heroCompact',
      'rowGapChannel',
    ]) {
      expect({ id, value: r[id]!.trim() === '' }, id).toEqual({ id, value: false });
    }
    // The row gap the Flex prop used to carry, unchanged, now on a named channel.
    expect(r.rowGap).toBe('20px');
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
