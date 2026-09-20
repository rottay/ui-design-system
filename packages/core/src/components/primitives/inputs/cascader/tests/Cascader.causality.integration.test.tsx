/**
 * The cascader family in a real browser: every decision its paint consumes moves
 * the trigger with a negative control; the column keyboard follows the reading
 * direction; language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernCascader from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  type AxeDebt,
  measureArms,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

const OPTIONS = [
  { value: 'pt', label: 'Portugal', children: [{ value: 'lis', label: 'Lisbon' }, { value: 'opo', label: 'Porto' }] },
  { value: 'es', label: 'Spain', children: [{ value: 'mad', label: 'Madrid' }] },
];

const markup = renderToStaticMarkup(
  <div>
    <div id="rest"><ModernCascader options={OPTIONS} defaultValue={['pt', 'lis']} allowClear /></div>
    <div id="error"><ModernCascader options={OPTIONS} status="error" /></div>
  </div>,
);

const REST = "#rest [data-part='trigger']";
const FOCUS = { 'data-state': 'focused focus-visible' };

describeCausality({
  family: 'cascader',
  markup,
  targets: [
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: FOCUS },
    { id: 'errorBorder', selector: "#error [data-part='trigger']", property: 'border-top-color' },
    { id: 'disabledOpacity', selector: REST, property: 'opacity', attributes: { 'data-disabled': 'true' } },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'height', selector: REST, property: '@rect.height' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    // `subtle`, not `strong`: bithire's preset already decides strong, so that arm
    // restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'states.emphasis': { value: 'subtle', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'shape.control-height': { value: 'tall', moves: ['height'], holds: 'radius', in: VERTICALS },
    // `spacious`, not `compact`: bithire's preset already decides compact, so that
    // arm restated the baseline and moved nothing (D6-2c-ii-RED, 2026-09-15).
    'density.mode': { value: 'spacious', moves: ['height'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

/**
 * WO-DER-06 derivation-lane registry (D6-2c-ii-RED, 2026-09-15). The neutral
 * compile leaves this family's ink and its ground on opposite sides of the
 * ramp, so axe reports serious `color-contrast`. Measured at the pre-lot tree:
 * ZERO findings on all four scopes, so every entry below is lot-caused, not
 * inherited. Pinned by finding id and the IDENTITY of every failing node:
 * another kind of violation, one more node, one node repaired, a same-count
 * swap, or a finding in a scope pinned clean turns this row red. It clears when
 * the derivation lane gives the family a legible pair (EVI-02, 2026-09-15).
 *
 * `bithire dark` DRAINED: that scope's dark block now re-derives its own canvas
 * ground instead of inheriting the light body's, so the placeholder tone is
 * legible there. Dropped by identity, not waived -- with no entry the scope
 * must measure clean, and a relapse reddens here.
 *
 * `rottay dark` DRAINED for a different reason, and not by this family: the
 * trigger grounds on `--ds-cascader-bg: var(--ds-input-bg, ...)`, and the Input
 * base used to state `--ds-input-bg: var(--ds-color-white)` mode-lessly, so the
 * trigger painted white under the dark mode's quiet ink. That base now states
 * the mode-aware role, the trigger grounds at `#0F0F12`, and all four
 * placeholders measure clean. The light scopes keep the same four.
 */
const AXE_CONTRAST_GAP: Readonly<Record<string, AxeDebt>> = {
  'bithire light': {
    'color-contrast': [
      '.ds-cascader.ds-cascader--modern[data-part="root"]:nth-child(1) > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
      '.ds-cascader.ds-cascader--modern[data-part="root"]:nth-child(2) > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
      'div[data-loading="true"] > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
      'div[data-status="error"] > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
    ],
  },
  'evnto light': {
    'color-contrast': [
      '.ds-cascader.ds-cascader--modern[data-part="root"]:nth-child(1) > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
      '.ds-cascader.ds-cascader--modern[data-part="root"]:nth-child(2) > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
      'div[data-loading="true"] > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
      'div[data-status="error"] > div[data-part="trigger"][role="combobox"][aria-haspopup="listbox"] > span[data-part="placeholder"]',
    ],
  },
};

describe('cascader direction, language and accessibility', () => {
  const openFirstColumn = async () => {
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    return waitFor(() => screen.getByRole('option', { name: /Portugal/ }));
  };

  it('drills forward with ArrowRight in LTR and ArrowLeft in RTL', async () => {
    const ltr = render(<ModernCascader options={OPTIONS} />);
    (await openFirstColumn()).focus();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowRight' });
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Lisbon'));
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Portugal'));
    ltr.unmount();

    // Direction arrives through the i18n authority these families now read.
    // The manual `dir` stamp on the portalled dropdown existed only to feed the
    // DOM probe across the portal boundary; the locale crosses it by context.
    render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernCascader options={OPTIONS} />
      </I18nProvider>,
    );
    const portugal = await openFirstColumn();
    portugal.focus();
    fireEvent.keyDown(portugal, { key: 'ArrowRight' });
    expect(screen.queryByRole('option', { name: /Lisbon/ })).toBeNull();
    fireEvent.keyDown(portugal, { key: 'ArrowLeft' });
    await waitFor(() => expect(document.activeElement).toHaveTextContent('Lisbon'));
  });

  it('walks a column and type-aheads through the listbox kernel', async () => {
    render(<ModernCascader options={OPTIONS} />);
    const portugal = await openFirstColumn();
    portugal.focus();
    fireEvent.keyDown(portugal, { key: 'End' });
    expect(document.activeElement).toHaveTextContent('Spain');
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'p' });
    expect(document.activeElement).toHaveTextContent('Portugal');
  });

  it('names its placeholder and clear action from the active catalog', async () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernCascader options={OPTIONS} defaultValue={['pt', 'lis']} allowClear />
      </I18nProvider>,
    );
    expect(await screen.findByRole('button', { name: 'Limpiar' })).toBeInTheDocument();
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernCascader options={OPTIONS} />
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Seleccionar"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernCascader options={OPTIONS} />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="trigger"');
    expect(loading).toContain('data-part="placeholder"');
  });

  // WO-DER-06 N1 (closed 2026-09-15): the foundation derives the ring from the
  // primary seed in both scopes, so a seed reaches the ring on every vertical.
  it('the seed reaches the focus ring on every vertical', async () => {
    for (const vertical of VERTICALS) {
      const seeded = await measureArms({
        vertical,
        markup,
        arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
        targets: [
          { id: 'ringColor', selector: REST, property: '--ds-focus-ring-color' },
          { id: 'primary', selector: REST, property: '--ds-color-primary' },
        ],
      });
      expect(seeded.seeded!.ringColor.trim(), `${vertical}: the seed reaches the ring`).not.toBe(seeded.base!.ringColor.trim());
      expect(seeded.seeded!.primary.trim(), `${vertical}: the seed reaches the palette`).not.toBe(seeded.base!.primary.trim());
    }
  }, 180_000);

  it('audits clean in every gated vertical mode, apart from the pinned contrast debt', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernCascader options={OPTIONS} />
          <ModernCascader options={OPTIONS} defaultValue={['pt', 'lis']} allowClear />
          <ModernCascader options={OPTIONS} status="error" />
          <ModernCascader options={OPTIONS} disabled defaultValue={['es', 'mad']} />
          <ModernCascader options={OPTIONS} loading />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      const key = `${scope.vertical} ${scope.theme}`;
      expect(axeDebt(findings), key).toEqual(AXE_CONTRAST_GAP[key] ?? {});
    }
  }, 180_000);
});
