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
    'density.mode': { value: 'compact', moves: ['inset'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

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

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = modern(
      <div>
        <ModernTagInput value={['one', 'two']} onChange={noop} aria-label="Skills" />
        <ModernTagInput value={['one']} error errorMessage="Tag is not allowed" onChange={noop} aria-label="Topics" />
      </div>,
    );
    for (const scope of AXE_SCOPES) {
      expect(seriousFindings(await auditAxe({ ...scope, markup: gallery })), `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
