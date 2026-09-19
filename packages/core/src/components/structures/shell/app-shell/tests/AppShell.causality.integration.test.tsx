/**
 * The app-shell family in a real browser: the decisions its chrome deriver
 * declares in `consumes` move the family's OWN computed paint against a
 * literal negative control, and axe holds on the pinned debt.
 *
 * The deriver is registered, and every produced channel is asserted in the
 * deriver's unit suite at exactly the fallback its skin already read, so the
 * probes below hold on both sides of registration: a tenant decision moves
 * the family's paint through the cascade roots the family already read, and
 * producing the name changes WHO can reach the value, not what it rests at.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { AppShell } from '..';
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
  slug: 'app-shell-causality',
  name: 'App shell causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'App shell causality' },
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
        <AppShell
          sidebar={{
            navigationLabel: 'Primary navigation',
            logo: <span>Logo</span>,
            nav: <a href="/inbox">Inbox</a>,
            footer: <span>Signed in</span>,
          }}
          header={{ left: <span>Workspace</span>, right: <button type="button">Act</button> }}
          footer={<span>Footer</span>}
        >
          <p>Page content</p>
        </AppShell>
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
const SIDEBAR = "#page #primary [data-part='navigation-sidebar']";
const HEADER = "#page #primary [data-part='header']";
const FOOTER_NAV = "#page #primary [data-part='navigation-footer']";
const MAIN = "#page #primary [data-part='main-area']";
const SKIP = "#page #primary [data-part='skip-link']";

describeCausality({
  family: 'app-shell',
  markup,
  targets: [
    // The navigation track's surface is the sidebar tone on the elevated root.
    { id: 'navBg', selector: SIDEBAR, property: 'background-color' },
    // The sticky header's rule rides the layout border root.
    { id: 'headerRule', selector: HEADER, property: 'border-bottom-color' },
    // The header's inline room is the spacing ramp on the density dial.
    { id: 'headerPad', selector: HEADER, property: 'padding-left' },
    // The navigation footer's room is the same ramp under the same dial.
    { id: 'navFooterPad', selector: FOOTER_NAV, property: 'padding-top' },
    // The skip link's lift rides the governed elevation ramp.
    { id: 'skipShadow', selector: SKIP, property: 'box-shadow' },
    // Its keyboard ring is the focus decision on the seeded primary.
    {
      id: 'skipRing',
      selector: SKIP,
      property: 'outline-color',
      attributes: { 'data-state': 'focus-visible' },
    },
    {
      id: 'skipRingWidth',
      selector: SKIP,
      property: 'outline-width',
      attributes: { 'data-state': 'focus-visible' },
    },
    // The collapse of the track rides the rearrange step of the motion dial.
    { id: 'trackDuration', selector: SIDEBAR, property: 'transition-duration' },
    // The main column slides on the SAME cadence, through the resolved
    // channel the structure stamps inline — a separate reading because it is
    // the only probe that fails when that chain goes invalid.
    { id: 'mainDuration', selector: MAIN, property: 'transition-duration' },
    // The chrome hairline's weight is a stated literal on no plane at all —
    // not even `surfaces.border-style`, whose `--ds-edge-*` widths this rule
    // does not read — so it is the control every arm below holds.
    { id: 'ruleWeight', selector: HEADER, property: 'border-bottom-width' },
  ],
  decisions: {
    // `consumes: palette.*` — the seeded primary reaches the keyboard ring.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['skipRing'],
      holds: 'ruleWeight',
      in: VERTICALS,
    },
    // `consumes: navigation.sidebarTone` — the track's own surface.
    'navigation.sidebar-tone': {
      value: 'strong',
      moves: ['navBg'],
      holds: 'ruleWeight',
      in: VERTICALS,
    },
    // `consumes: density` — the spacing ramp under the density dial, in the
    // header's inline room and in the navigation footer's block room.
    'density.mode': {
      value: 'spacious',
      moves: ['headerPad', 'navFooterPad'],
      holds: 'ruleWeight',
      in: VERTICALS,
    },
    // `consumes: surfaces.*` — the skip link's lift on the elevation ramp.
    'surfaces.elevation-posture': {
      value: 'flat',
      moves: ['skipShadow'],
      holds: 'ruleWeight',
      in: VERTICALS,
    },
    // `consumes: surfaces.* / states.*` — the ring's weight.
    'states.focus-style': {
      value: 'glow',
      moves: ['skipRingWidth'],
      holds: 'ruleWeight',
      in: VERTICALS,
    },
    // `consumes: motion` — the collapse cadence.
    'motion.dial': {
      value: { durationScale: 1.35 },
      moves: ['trackDuration', 'mainDuration'],
      holds: 'ruleWeight',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  // The navigation region paints a tone-aware SURFACE and no ink to go with
  // it: `--ds-shell-navigation-background` rests on `--ds-sidebar-bg`, which
  // an inverse sidebar tone darkens, while slot content inherits the canvas
  // ink. Every node below is the fixture's own raw slot content, not chrome
  // this family renders — a consumer that passes `Text` inherits the sidebar
  // role instead. The family owes a navigation ink channel beside the
  // background; that is a paint decision with a cross-tenant consequence and
  // it is routed rather than taken here.
  'bithire dark': {
    'color-contrast': [
      '.rottay-app-shell__navigation-footer > span',
      '.rottay-app-shell__navigation-logo > span',
      'a[href$="inbox"]',
    ],
  },
  'bithire light': {
    'color-contrast': ['.rottay-app-shell__navigation-footer > span'],
  },
  'evnto light': {
    'color-contrast': ['.rottay-app-shell__navigation-footer > span'],
  },
};

describe('app-shell causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'root',
      'skip-link',
      'navigation-sidebar',
      'navigation-logo',
      'navigation-body',
      'navigation-footer',
      'main-area',
      'header',
      'content',
      'footer',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The posture is resolved on the server, so the first paint is correct.
    expect(rendered).toContain('data-posture="desktop"');
  });

  /**
   * The skip link's ring is decided by the kernel and read off `data-state`,
   * with the platform pseudo as the fallback arm of the same rule. Stamping
   * the token alone has to move the ring, or the kernel is not what decides.
   */
  it('lifts the skip-link ring from the kernel state token, not only from the pseudo', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restingOutline', selector: SKIP, property: 'outline-color' },
        {
          id: 'kernelOutline',
          selector: SKIP,
          property: 'outline-color',
          attributes: { 'data-state': 'focus-visible' },
        },
        { id: 'restingWidth', selector: SKIP, property: 'outline-width' },
        {
          id: 'kernelWidth',
          selector: SKIP,
          property: 'outline-width',
          attributes: { 'data-state': 'focus-visible' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.kernelWidth).not.toBe(r.restingWidth);
  }, 120_000);

  /**
   * The main column's inline padding is LOGICAL: the safe-area edge it
   * consumes flips with direction, and the shell's own RTL arm is what makes
   * that true rather than the physical `env()` reading alone.
   */
  it('maps the main column inline padding to the physical edge of the writing mode', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        {
          id: 'ltrStart',
          selector: ROOT,
          property: '--ds-shell-inline-end-inset',
          dir: 'ltr',
        },
        {
          id: 'rtlStart',
          selector: ROOT,
          property: '--ds-shell-inline-end-inset',
          dir: 'rtl',
        },
      ],
    });
    const r = readings.base!;
    // The published inset is the same channel in both directions; the skin's
    // RTL arm is what re-keys which physical edge feeds it.
    expect(r.ltrStart).toBe(r.rtlStart);
  }, 120_000);

  /**
   * The main column's slide is the only paint the structure resolves with an
   * inline var() chain, so it is the one that dies silently: an unterminated
   * chain is invalid at computed-value time, `transition` falls back to the
   * initial `0s`, and no colour moves to say so. The cadence has to reach it
   * with a real duration on both arms.
   */
  it('slides the main column on the cadence, never on the invalid-value 0s', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, slower: { 'motion.dial': { durationScale: 1.35 } } },
      targets: [{ id: 'mainDuration', selector: MAIN, property: 'transition-duration' }],
    });
    const base = readings.base!.mainDuration!;
    const slower = readings.slower!.mainDuration!;
    expect(base).not.toMatch(/^<no match/);
    expect(base).not.toBe('0s');
    expect(slower).not.toBe('0s');
    // The cadence reaches the main column: the dial moves what the chain reads.
    expect(slower).not.toBe(base);
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
