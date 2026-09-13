/**
 * The mentions family in a real browser: every decision its paint consumes moves
 * the textarea with a negative control, and direction, language, loading and
 * accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnatomySkeleton } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernMentions from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const OPTIONS = [{ value: 'ada', label: 'Ada' }, { value: 'grace', label: 'Grace' }];

const markup = renderToStaticMarkup(
  <div>
    <div id="rest"><ModernMentions options={OPTIONS} defaultValue="Ping @ada" aria-label="Note" /></div>
    <div id="error"><ModernMentions options={OPTIONS} status="error" aria-label="Reply" /></div>
  </div>,
);

const REST = "#rest [data-part='textarea']";

describeCausality({
  family: 'mentions',
  markup,
  targets: [
    { id: 'focusRing', selector: REST, property: 'box-shadow', attributes: { 'data-state': 'focused' } },
    { id: 'errorBorder', selector: "#error [data-part='textarea']", property: 'border-top-color' },
    { id: 'disabledOpacity', selector: REST, property: 'opacity', attributes: { 'data-disabled': 'true' } },
    { id: 'radius', selector: REST, property: 'border-top-left-radius' },
    { id: 'fontSize', selector: REST, property: 'font-size' },
    { id: 'padding', selector: REST, property: 'padding-top' },
    { id: 'edge', selector: REST, property: 'border-top-width' },
    { id: 'duration', selector: REST, property: 'transition-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { error: '#B00020' }, moves: ['errorBorder'], holds: 'radius', in: VERTICALS },
    'states.emphasis': { value: 'strong', moves: ['disabledOpacity'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['fontSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'fontSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['padding'], holds: 'radius', in: ['evnto'] },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('mentions direction, language and accessibility in a real browser', () => {
  it('writes the textarea in the direction of its context', async () => {
    const field = renderToStaticMarkup(<ModernMentions options={OPTIONS} defaultValue="@ada" aria-label="Note" />);
    const result = await measureArms({
      vertical: 'bithire',
      markup: field,
      arms: { base: {} },
      targets: [
        { id: 'ltr', selector: "[data-part='textarea']", property: 'direction', dir: 'ltr' },
        { id: 'rtl', selector: "[data-part='textarea']", property: 'direction', dir: 'rtl' },
        { id: 'rtlAlign', selector: "[data-part='textarea']", property: 'text-align', dir: 'rtl' },
      ],
    });
    expect(result.base!.ltr).toBe('ltr');
    expect(result.base!.rtl).toBe('rtl');
    expect(result.base!.rtlAlign).toMatch(/start|right/);
  }, 60_000);

  it('paints hover from the interaction kernel state and yields to focus', async () => {
    const field = renderToStaticMarkup(<ModernMentions options={OPTIONS} aria-label="Note" />);
    const result = await measureArms({
      vertical: 'bithire',
      markup: field,
      arms: { base: {} },
      targets: [
        { id: 'rest', selector: "[data-part='textarea']", property: 'border-top-color' },
        { id: 'hovered', selector: "[data-part='textarea']", property: 'border-top-color', attributes: { 'data-state': 'hovered' } },
        { id: 'hoveredFocused', selector: "[data-part='textarea']", property: 'border-top-color', attributes: { 'data-state': 'hovered focused' } },
      ],
    });
    const r = result.base!;
    expect(r.hovered).not.toBe(r.rest);
    expect(r.hoveredFocused).not.toBe(r.hovered);
  }, 60_000);

  it('names its field from the active catalog', () => {
    const spanish = renderToStaticMarkup(
      <I18nProvider locale="es" fallbackLocale="en">
        <EngineProvider defaultEngine="modern">
          <ModernMentions options={OPTIONS} />
        </EngineProvider>
      </I18nProvider>,
    );
    expect(spanish).toContain('aria-label="Menciones"');
  });

  it('builds its loading state from its own anatomy', () => {
    const loading = renderToStaticMarkup(
      <AnatomySkeleton>
        <ModernMentions options={OPTIONS} defaultValue="Ping @ada" aria-label="Note" />
      </AnatomySkeleton>,
    );
    expect(loading).toContain('data-part="textarea"');
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = renderToStaticMarkup(
      <EngineProvider defaultEngine="modern">
        <div>
          <ModernMentions options={OPTIONS} placeholder="Type @ to mention" />
          <ModernMentions options={OPTIONS} defaultValue="Ping @ada" aria-label="Reply" status="warning" />
          <ModernMentions options={OPTIONS} defaultValue="x" aria-label="Error note" status="error" />
          <ModernMentions options={OPTIONS} defaultValue="Locked" aria-label="Locked note" disabled />
        </div>
      </EngineProvider>,
    );
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
