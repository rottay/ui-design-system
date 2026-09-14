/**
 * The alert family (Callout folded in) in a real browser: every decision its
 * paint consumes moves the surface with a negative control; the dismiss stays
 * at the inline end under RTL, and language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import ModernAlert from '../engines/modern';
import ModernCallout from '../../../display/callout/engines/modern';
import type { AlertProps } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

function alertMarkup(props: Partial<AlertProps> = {}, dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir}>
      <ModernAlert type="warning" message="Review pending" description="Two approvals are outstanding." closable {...props} />
    </div>,
  );
}

const markup = [
  `<div id="alert">${alertMarkup()}</div>`,
  `<div id="success">${alertMarkup({ type: 'success', message: 'Published', closable: false })}</div>`,
  `<div id="callout">${renderToStaticMarkup(
    <ModernCallout tone="info" title="Decision ready" action={<button type="button">Review</button>}>
      Evidence is complete.
    </ModernCallout>,
  )}</div>`,
].join('');

const ROOT = "#alert [data-part='root']";
const CLOSE = "#alert [data-part='close-button']";

describeCausality({
  family: 'alert',
  markup,
  targets: [
    { id: 'warningEdge', selector: ROOT, property: 'border-top-color' },
    { id: 'successInk', selector: "#success [data-part='icon']", property: 'color' },
    { id: 'shadow', selector: ROOT, property: 'box-shadow' },
    { id: 'radius', selector: ROOT, property: 'border-top-left-radius' },
    { id: 'edge', selector: ROOT, property: 'border-top-width' },
    { id: 'padding', selector: ROOT, property: 'padding-top' },
    { id: 'titleSize', selector: "#alert [data-part='title']", property: 'font-size' },
    { id: 'focusRing', selector: CLOSE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'duration', selector: CLOSE, property: 'transition-duration' },
  ],
  decisions: {
    'palette.status-seeds': { value: { warning: '#B7791F', success: '#2E7D5B' }, moves: ['warningEdge', 'successInk'], holds: 'radius', in: VERTICALS },
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['focusRing'], holds: 'warningEdge', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['padding'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('alert direction, callout fold, language, loading and accessibility', () => {
  it('keeps the dismiss at the inline end in both directions', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="ltr">${alertMarkup()}</div><div id="rtl">${alertMarkup({}, 'rtl')}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrClose', selector: "#ltr [data-part='close-button']", property: '@rect.left' },
        { id: 'ltrTitle', selector: "#ltr [data-part='title']", property: '@rect.left' },
        { id: 'rtlClose', selector: "#rtl [data-part='close-button']", property: '@rect.left' },
        { id: 'rtlTitle', selector: "#rtl [data-part='title']", property: '@rect.left' },
      ],
    });
    const r = result.base!;
    expect(Number(r.ltrClose)).toBeGreaterThan(Number(r.ltrTitle));
    expect(Number(r.rtlClose)).toBeLessThan(Number(r.rtlTitle));
  }, 60_000);

  it('paints a callout as the same surface as an alert of its tone', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup: `<div id="a">${alertMarkup({ type: 'info', closable: false })}</div><div id="c">${renderToStaticMarkup(
        <ModernCallout tone="info" title="Review pending">Two approvals are outstanding.</ModernCallout>,
      )}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'alertBg', selector: "#a [data-part='root']", property: 'background-color' },
        { id: 'calloutBg', selector: "#c [data-part='root']", property: 'background-color' },
        { id: 'alertTitle', selector: "#a [data-part='title']", property: 'font-size' },
        { id: 'calloutTitle', selector: "#c [data-part='title']", property: 'font-size' },
      ],
    });
    const r = result.base!;
    expect(r.calloutBg).toBe(r.alertBg);
    expect(r.calloutTitle).toBe(r.alertTitle);
  }, 60_000);

  it('names its dismiss from the active catalog and describes it with the message', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <ModernAlert type="error" message="Pago rechazado" closable />
      </I18nProvider>,
    );
    const close = screen.getByRole('button', { name: 'Cerrar' });
    expect(document.getElementById(close.getAttribute('aria-describedby')!)).toHaveTextContent('Pago rechazado');
  });

  it('builds its loading state from its own anatomy', () => {
    const { container } = render(<ModernAlert type="info" message="Synced" description="All good" closable />);
    const bones = readAnatomyBones(container.querySelector<HTMLElement>('.ds-alert')!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['icon:round', 'title:line', 'description:line', 'close-button:round']),
    );
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
