/**
 * The tag-input family in a real browser: every decision its paint consumes moves
 * the container with a negative control, and direction, language and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernTagInput from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  type AxeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};
const modern = (node: React.ReactNode) => renderToStaticMarkup(<EngineProvider defaultEngine="modern">{node}</EngineProvider>);
const markup = modern(
  <div>
    <div id="rest"><ModernTagInput value={['design']} onChange={noop} aria-label="Skills" /></div>
    <div id="error"><ModernTagInput value={['design']} error onChange={noop} aria-label="Topics" /></div>
  </div>,
);

const ROOT = "#rest [data-part='root']";

describeCausality({
  family: 'tag-input',
  markup,
  targets: [
    { id: 'errorBorder', selector: "#error [data-part='root']", property: 'border-top-color' },
    { id: 'radius', selector: ROOT, property: 'border-top-left-radius' },
    { id: 'inset', selector: ROOT, property: 'padding-left' },
    { id: 'height', selector: ROOT, property: '@rect.height' },
    { id: 'fontSize', selector: "#rest [data-part='input']", property: 'font-size' },
    { id: 'edge', selector: ROOT, property: 'border-top-width' },
    { id: 'duration', selector: ROOT, property: 'transition-duration' },
  ],
  decisions: {
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'inset', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    // bithire's preset decides `density.mode: compact`, so the retired arm restated
    // the vertical's own stop and moved nothing. `spacious` is stated by no preset.
    'density.mode': { value: 'spacious', moves: ['inset'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15): under the
 * neutral compile a governed chrome pair can reach a scope with no producer --
 * the menu ink IS the sidebar ink, and the tenant's light ground cascades into
 * the dark block -- so axe reports `color-contrast` in the scopes pinned below.
 * Nothing is lowered: every other serious rule must still be empty, and the
 * contrast debt is pinned by the IDENTITY of every failing node, so this row
 * reddens when the debt spreads, when a node is repaired, and when one node is
 * fixed while another starts failing in its place -- the substitution a count
 * could not see (EVI-02, 2026-09-15).
 *
 * `bithire dark` had 6 rows and they DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the chip and placeholder inks are read against the ground they were
 * designed for.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const CONTRAST_DEBT: Readonly<Record<string, AxeDebt>> = {
  'rottay dark': {
    'color-contrast': [
      '#taginput-modern-_R_1_',
      '#taginput-modern-_R_2_',
      'div[data-error="false"] > .rottay-tag-shell.rottay-tag-shell--modern[data-part="tag-chip"]:nth-child(1) > span[title="one"][data-part="content"]',
      'div[data-error="true"] > .rottay-tag-shell.rottay-tag-shell--modern[data-part="tag-chip"] > span[title="one"][data-part="content"]',
      'span[title="two"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '#taginput-modern-_R_2_-error',
    ],
  },
};

describe('tag-input geometry, direction, language and accessibility in a real browser', () => {
  it('flows chips from the inline start in both directions', async () => {
    const field = modern(<ModernTagInput value={['one', 'two']} onChange={noop} aria-label="Tags" />);
    const result = await measureArms({
      vertical: 'bithire',
      markup: field,
      arms: { base: {} },
      targets: [
        { id: 'ltrChip', selector: "[data-part='tag-chip']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrInput', selector: "[data-part='input']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlChip', selector: "[data-part='tag-chip']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlInput', selector: "[data-part='input']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrChip)).toBeLessThan(Number(r.ltrInput));
    expect(Number(r.rtlChip)).toBeGreaterThan(Number(r.rtlInput));
  }, 60_000);

  it('prompts from the active catalog', () => {
    const spanish = modern(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernTagInput value={[]} onChange={noop} />
      </I18nProvider>,
    );
    expect(spanish).toContain('placeholder="Escribe y presiona Enter"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = modern(
      <AnatomySkeleton>
        <ModernTagInput value={['one']} onChange={noop} aria-label="Tags" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('data-part="tag-chip"');
  });

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = modern(
      <div>
        <ModernTagInput value={['one', 'two']} onChange={noop} aria-label="Skills" />
        <ModernTagInput value={['one']} error errorMessage="Tag is not allowed" onChange={noop} aria-label="Topics" />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(CONTRAST_DEBT[key] ?? {});
    }
  }, 180_000);
});
