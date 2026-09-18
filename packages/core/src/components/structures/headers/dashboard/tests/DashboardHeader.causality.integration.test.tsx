/**
 * The dashboard-header family in a real browser: every keypath its chrome
 * deriver declares in `consumes` moves the family's OWN computed paint against
 * a literal negative control, the metrics readout's ring is proven to be the
 * shared kernel's decision (read off `data-state`, not the platform pseudo
 * alone), and axe holds on the pinned debt.
 *
 * The deriver is deliberately NOT registered yet — the DT adds the line at
 * integration — so every probe here resolves through the skin's stated
 * fallbacks and the decision-driven SHARED ROOTS they quote. That is the
 * honest claim of an unregistered cut: a tenant decision moves the family's
 * paint through the cascade roots the family already read, and the produced
 * channels (asserted in the deriver's unit suite at exactly these fallbacks)
 * change WHO can reach the value, not what it rests at.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import DashboardHeader from '../runtime/rendering';
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
  slug: 'dashboard-header-causality',
  name: 'Dashboard header causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Dashboard header causality' },
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
        <DashboardHeader
          title="Overview"
          subtitle="Live operational metrics"
          icon={<svg width={20} height={20} />}
          status={{ state: 'live' }}
          metrics={[
            { key: 'm1', label: 'Users', value: 128, icon: <svg width={14} height={14} />, change: { value: '4%', direction: 'up' } },
            { key: 'm2', label: 'Errors', value: 3, change: { value: '2%', direction: 'down' } },
            { key: 'm3', label: 'Latency', value: '120ms', change: { value: '0%', direction: 'flat' } },
          ]}
          actions={[{ key: 'a1', label: 'Refresh', icon: <svg width={14} height={14} />, onClick: noop }]}
          searchSlot={<input aria-label="Search" />}
          timeRangeSlot={<button type="button">7d</button>}
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
const TITLE = "#page #primary [data-part='title']";
const ICON = "#page #primary [data-part='icon']";
const READOUT = "#page #primary [data-part='metrics-row']";

describeCausality({
  family: 'dashboard-header',
  markup,
  targets: [
    // The identity tile's ink is the seeded primary; the readout ring falls
    // back to the same seed when the theme states no focus colour.
    { id: 'iconInk', selector: ICON, property: 'color' },
    {
      id: 'ringOutline',
      selector: READOUT,
      property: 'outline-color',
      attributes: { 'data-state': 'focus-visible' },
    },
    {
      id: 'ringWidth',
      selector: READOUT,
      property: 'outline-width',
      attributes: { 'data-state': 'focus-visible' },
    },
    // The operational marker and the up-trend change read the status ramp.
    { id: 'statusInk', selector: "#page #primary [data-part='status-dot']", property: 'color' },
    {
      id: 'upInk',
      selector: "#page #primary [data-part='metric-chip-change'][data-direction='up']",
      property: 'color',
    },
    // The display type rides the page-title role on the type plane.
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
    // The room axis is the spacing ramp on the density dial.
    { id: 'rootPad', selector: ROOT, property: 'padding-top' },
    // The identity/actions gutter is the same ramp on the rhythm plane.
    {
      id: 'rowGap',
      selector: "#page #primary [data-part='header-row']",
      property: 'row-gap',
    },
    // The root's corner rides the xl radius rung.
    { id: 'rootRadius', selector: ROOT, property: 'border-top-left-radius' },
    // The card shadow rides the governed elevation ramp.
    { id: 'rootShadow', selector: ROOT, property: 'box-shadow' },
    // The live pulse's duration rides the attention step of the motion dial.
    {
      id: 'glyphDuration',
      selector: "#page #primary [data-part='status-dot-glyph']",
      property: 'animation-duration',
    },
    // The hairline's weight is a stated literal on no plane at all, so it is
    // the control every arm below holds.
    { id: 'ruleWidth', selector: ROOT, property: '--ds-dashboard-header-rule' },
  ],
  decisions: {
    // `consumes: palette.*` — the seeded primary reaches the identity ink and,
    // through the fallback arm, the readout's ring.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['iconInk', 'ringOutline'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: palette.*` — the status ramp carries the operational marker
    // and the up-trend change; the seeded primary leaves both untouched.
    'palette.status-seeds': {
      value: { success: '#0B6E4F' },
      moves: ['statusInk', 'upInk'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: typography.roles / typography.scale` — the page-title role.
    'typography.scale': {
      value: 1.08,
      moves: ['titleSize'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: spacing.rhythm / density` — the fluid room clamp on the
    // density dial.
    'density.mode': {
      value: 'spacious',
      moves: ['rootPad'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: spacing.rhythm` — the header-row gutter on the rhythm plane.
    'spacing.rhythm': {
      value: 'airy',
      moves: ['rowGap'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: shape.*` — the xl radius rung under the root corner channel.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['rootRadius'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: surfaces.elevation-posture` — the card shadow on the ramp.
    'surfaces.elevation-posture': {
      value: 'flat',
      moves: ['rootShadow'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: surfaces.focusStyle / states.*` — the readout's keyboard ring,
    // whose weight the focus style decides.
    'states.focus-style': {
      value: 'glow',
      moves: ['ringWidth'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
    // `consumes: motion.*` — the live pulse's duration on the motion dial.
    'motion.dial': {
      value: { durationScale: 1.35 },
      moves: ['glyphDuration'],
      holds: 'ruleWidth',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node, a
 * new node and a same-count swap all go red and must be re-adjudicated.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('dashboard-header causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    for (const part of [
      'root',
      'header-row',
      'identity',
      'icon',
      'title',
      'status-dot',
      'actions',
      'metrics-row',
      'metric-chip',
      'metric-chip-value',
    ]) {
      expect(rendered, part).toContain(`data-part="${part}"`);
    }
    // The operational state rides the domain stamp, never the kernel vocabulary
    // on the family's own parts (the composed Button stamps its own anatomy).
    expect(rendered).toContain('data-status="live"');
    expect(rendered).not.toMatch(/data-part="status-dot[^"]*"[^>]*\bdata-state/);
  });

  /**
   * The readout's ring is decided by the kernel and read off `data-state`,
   * with the platform pseudo as the fallback arm of the same rule. Stamping
   * the token alone has to move the ring, or the kernel is not what decides.
   */
  it('lifts the readout ring from the kernel state token, not only from the pseudo', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restingOutline', selector: READOUT, property: 'outline-color' },
        {
          id: 'kernelOutline',
          selector: READOUT,
          property: 'outline-color',
          attributes: { 'data-state': 'focus-visible' },
        },
        { id: 'restingWidth', selector: READOUT, property: 'outline-width' },
        {
          id: 'kernelWidth',
          selector: READOUT,
          property: 'outline-width',
          attributes: { 'data-state': 'focus-visible' },
        },
      ],
    });
    const r = readings.base!;
    expect(r.kernelOutline).not.toBe(r.restingOutline);
    expect(r.kernelWidth).not.toBe(r.restingWidth);
  }, 120_000);

  it('maps the inter-cell rule to the physical end edge in rtl', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        {
          id: 'ltrStart',
          selector: "#page #primary [data-part='metric-chip']:nth-child(2)",
          property: 'border-left-width',
          dir: 'ltr',
        },
        {
          id: 'ltrEnd',
          selector: "#page #primary [data-part='metric-chip']:nth-child(2)",
          property: 'border-right-width',
          dir: 'ltr',
        },
        {
          id: 'rtlStart',
          selector: "#page #primary [data-part='metric-chip']:nth-child(2)",
          property: 'border-left-width',
          dir: 'rtl',
        },
        {
          id: 'rtlEnd',
          selector: "#page #primary [data-part='metric-chip']:nth-child(2)",
          property: 'border-right-width',
          dir: 'rtl',
        },
      ],
    });
    const r = readings.base!;
    // The rule between cells is logical (border-inline-start): it lands on the
    // left edge in ltr and on the right edge in rtl.
    expect(r.ltrStart).toBe('1px');
    expect(r.ltrEnd).toBe('0px');
    expect(r.rtlStart).toBe('0px');
    expect(r.rtlEnd).toBe('1px');
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
