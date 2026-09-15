/**
 * The notifier family in a real browser: every decision its paint consumes
 * moves the surface of each role with a negative control; its controls stay at
 * the inline end under RTL, and language, loading and accessibility hold.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { NotifierItem } from '..';
import type { NotifierItemProps } from '../contracts';
import { MessageItem } from '../../message/engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const BASE: NotifierItemProps = {
  role: 'toast',
  tone: 'neutral',
  title: 'Draft saved',
  description: 'Your changes are stored.',
  closeLabel: 'Close',
  duration: 5000,
  action: { label: 'Undo', onClick: () => {} },
};

function surface(props: Partial<NotifierItemProps>, dir: 'ltr' | 'rtl' = 'ltr'): string {
  return renderToStaticMarkup(
    <div dir={dir} style={{ inlineSize: '28rem' }}>
      <NotifierItem {...BASE} {...props} />
    </div>,
  );
}

const markup = [
  `<div id="toast">${surface({})}</div>`,
  `<div id="notification">${surface({ role: 'notification', tone: 'success', action: undefined, actions: <button type="button">View</button> })}</div>`,
  `<div id="message">${surface({ role: 'message', tone: 'error', title: 'Upload failed', description: undefined, action: undefined })}</div>`,
].join('');

const TOAST = "#toast [data-part='root']";
const CLOSE = "#toast [data-part='close-button']";

describeCausality({
  family: 'notifier',
  markup,
  targets: [
    { id: 'edgeInk', selector: TOAST, property: 'border-top-color' },
    { id: 'shadow', selector: TOAST, property: 'box-shadow' },
    { id: 'radius', selector: TOAST, property: 'border-top-left-radius' },
    { id: 'edge', selector: TOAST, property: 'border-top-width' },
    { id: 'padding', selector: "#toast [data-part='layout']", property: 'padding-top' },
    { id: 'titleSize', selector: "#toast [data-part='title']", property: 'font-size' },
    { id: 'messageSize', selector: "#message [data-part='title']", property: 'font-size' },
    { id: 'successWell', selector: "#notification [data-part='icon']", property: 'color' },
    { id: 'focusRing', selector: CLOSE, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
    { id: 'duration', selector: CLOSE, property: 'transition-duration' },
  ],
  decisions: {
    // `focusRing` left this arm in D6-2c-ii-RED: `--ds-focus-ring-color` is the
    // foundation light fallback on a light-default vertical. Pinned two-sided in
    // Modal.causality ("focus ring reach under the neutral compile"); WO-DER-06.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['edgeInk'], holds: 'radius', in: VERTICALS },
    'palette.status-seeds': { value: { success: '#2E7D5B' }, moves: ['successWell'], holds: 'edgeInk', in: VERTICALS },
    'states.focus-style': { value: 'glow', moves: ['focusRing'], holds: 'radius', in: VERTICALS },
    'typography.scale': { value: 1.08, moves: ['titleSize', 'messageSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['padding'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('notifier roles, direction, language, loading and accessibility', () => {
  it('lays each role out on its own grammar', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'toastAlign', selector: "#toast [data-part='layout']", property: 'align-items' },
        { id: 'messageAlign', selector: "#message [data-part='layout']", property: 'align-items' },
        { id: 'actionsRule', selector: "#notification [data-part='actions']", property: 'border-top-width' },
        { id: 'urgentWeight', selector: "#message [data-part='title']", property: 'font-weight' },
        { id: 'toastWeight', selector: "#toast [data-part='title']", property: 'font-weight' },
      ],
    });
    const r = result.base!;
    expect(r.toastAlign).toBe('start');
    expect(r.messageAlign).toBe('center');
    expect(r.actionsRule).not.toBe('0px');
    expect(Number(r.urgentWeight)).toBeGreaterThanOrEqual(Number(r.toastWeight));
  }, 60_000);

  it('keeps its controls at the inline end in both directions', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="ltr">${surface({})}</div><div id="rtl">${surface({}, 'rtl')}</div>`,
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

  it('names its dismiss control from the active catalog', () => {
    render(
      <I18nProvider locale="es" fallbackLocale="en">
        <MessageItem id="m1" type="info" content="Sincronizado" duration={0} closable />
      </I18nProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Sincronizado');
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('builds its loading state from its own anatomy', () => {
    const { container } = render(<NotifierItem {...BASE} />);
    const bones = readAnatomyBones(container.querySelector<HTMLElement>('.ds-notifier')!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['icon:round', 'title:line', 'description:line', 'action:block', 'close-button:round']),
    );
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
