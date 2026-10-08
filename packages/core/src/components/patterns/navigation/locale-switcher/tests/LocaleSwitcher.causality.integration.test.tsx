/**
 * The locale switcher in a real browser: Select's overlay keeps the panel inside the viewport from
 * the inline-end edge in both directions, a tenant decision reaches the switcher's own content
 * through the portal, and the open switcher audits clean.
 */
import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { AXE_SCOPES, auditAxe, axeDebt, seriousFindings } from '@tests/support/family-causality';
import { bundleRealMount, measureRealMount, type RealMountScene } from '@tests/support/family-causality/real-mount';
import ModernLocaleSwitcher from '../engines/modern';

const PANEL = '.ds-select-shell__dropdown';
const TRIGGER = '[data-testid="locale-switcher-trigger"]';

let bundle = '';
beforeAll(async () => {
  bundle = await bundleRealMount({
    module: 'src/components/patterns/navigation/locale-switcher/engines/modern',
    props: '{ locale: "en", onChange: () => {} }',
  });
}, 120_000);
afterEach(() => cleanup());

const atInlineEnd = (id: string, dir: 'ltr' | 'rtl'): RealMountScene => ({
  id,
  markup: `<div dir="${dir}" style="display: flex; justify-content: flex-end"><div data-real-mount></div></div>`,
  ready: TRIGGER,
  targets: [
    { id: 'viewport', selector: 'html', property: '@rect.width' },
    { id: 'left', selector: PANEL, property: '@rect.left' },
    { id: 'width', selector: PANEL, property: '@rect.width' },
    { id: 'triggerLeft', selector: TRIGGER, property: '@rect.left' },
    { id: 'expanded', selector: TRIGGER, property: '@attr.aria-expanded' },
  ],
  steps: [{ id: 'open', selector: TRIGGER, input: { kind: 'click' } }],
});

describe('locale switcher placement at the inline-end edge', () => {
  it('keeps the open panel inside the viewport in ltr and rtl', async () => {
    const readings = await measureRealMount({
      vertical: 'bithire',
      bundle,
      scenes: [atInlineEnd('ltr', 'ltr'), atInlineEnd('rtl', 'rtl')],
    });
    for (const scene of ['ltr', 'rtl']) {
      const open = readings[`${scene}>open`]!;
      expect(open.expanded, scene).toBe('true');
      const viewport = parseFloat(open.viewport!);
      const left = parseFloat(open.left!);
      const width = parseFloat(open.width!);
      expect(Number.isFinite(left) && Number.isFinite(width), `${scene} ${JSON.stringify(open)}`).toBe(true);
      expect(left, `${scene} inline-start gutter`).toBeGreaterThanOrEqual(0);
      expect(viewport - (left + width), `${scene} inline-end gutter`).toBeGreaterThanOrEqual(0);
    }
    // Each trigger sits at its inline-end edge, and the panel opens beside it rather than at the far side.
    const ltr = readings['ltr>open']!;
    const rtl = readings['rtl>open']!;
    expect(parseFloat(ltr.triggerLeft!)).toBeGreaterThan(parseFloat(ltr.viewport!) / 2);
    expect(parseFloat(ltr.left!)).toBeGreaterThan(parseFloat(ltr.viewport!) / 2);
    expect(parseFloat(rtl.triggerLeft!)).toBeLessThan(parseFloat(rtl.viewport!) / 2);
    expect(parseFloat(rtl.left!)).toBeLessThan(parseFloat(rtl.viewport!) / 2);
  }, 120_000);
});

describe('the switcher is a compact control in any host', () => {
  const host = (id: string, style: string): RealMountScene => ({
    id,
    // The slot steps out of layout so the switcher root is the host's own child.
    markup: `<div style="inline-size: 600px; ${style}"><div data-real-mount style="display: contents"></div></div>`,
    ready: TRIGGER,
    targets: [
      { id: 'trigger', selector: TRIGGER, property: '@rect.width' },
      { id: 'root', selector: '.ds-pattern-locale-switcher', property: '@rect.width' },
    ],
  });

  it('keeps the closed trigger content-sized when the host stretches its children', async () => {
    const readings = await measureRealMount({
      vertical: 'bithire',
      bundle,
      scenes: [
        host('block', 'display: block'),
        host('column', 'display: flex; flex-direction: column; align-items: stretch'),
        host('grid', 'display: grid'),
      ],
    });
    const block = Number(readings.block!.trigger);
    expect(block).toBeGreaterThan(0);
    expect(block).toBeLessThan(300);
    for (const scene of ['column', 'grid']) {
      expect(Number(readings[scene]!.trigger), scene).toBe(block);
      expect(Number(readings[scene]!.root), scene).toBe(block);
    }
  }, 120_000);
});

describe('a tenant decision reaches the switcher content through the portal (T-17)', () => {
  const scene: RealMountScene = {
    id: 'open',
    markup: '<div data-real-mount></div>',
    ready: TRIGGER,
    targets: [
      { id: 'stamp', selector: `${PANEL} [data-part='option'] [data-pattern='locale-switcher']`, property: '@attr.data-part' },
      { id: 'flag', selector: `${PANEL} [data-part='option'] [data-part='flag']`, property: 'font-size' },
      { id: 'name', selector: `${PANEL} [data-part='option'] [data-part='autoglottonym']`, property: 'font-size' },
      { id: 'valueName', selector: `${TRIGGER} [data-part='autoglottonym']`, property: 'font-size' },
      { id: 'triggerRadius', selector: TRIGGER, property: 'border-top-left-radius' },
      { id: 'rowRadius', selector: `${PANEL} [data-part='option']`, property: 'border-top-left-radius' },
    ],
    steps: [{ id: 'panel', selector: TRIGGER, input: { kind: 'click' } }],
  };

  it('moves the flag and autoglottonym font-size under typography.scale and holds radius', async () => {
    for (const vertical of ['rottay', 'bithire', 'evnto'] as const) {
      const base = (await measureRealMount({ vertical, bundle, scenes: [scene] }))['open>panel']!;
      const scaled = (await measureRealMount({ vertical, bundle, decisions: { 'typography.scale': 1.08 }, scenes: [scene] }))['open>panel']!;
      expect(base.stamp, vertical).toBe('locale-content');
      expect(scaled.flag, `${vertical} flag`).not.toBe(base.flag);
      expect(scaled.name, `${vertical} autoglottonym`).not.toBe(base.name);
      expect(scaled.valueName, `${vertical} trigger autoglottonym`).not.toBe(base.valueName);
      expect(scaled.triggerRadius, `${vertical} trigger radius`).toBe(base.triggerRadius);
      expect(scaled.rowRadius, `${vertical} row radius`).toBe(base.rowRadius);
    }
  }, 240_000);
});

describe('the open switcher audits clean', () => {
  it('has no serious finding in any gated scope', async () => {
    const view = render(<ModernLocaleSwitcher locale="ar" onChange={() => {}} />);
    const trigger = view.getByRole('combobox');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    const portal = document.querySelector(PANEL)!.closest('body > *')!;
    const markup = `${view.container.innerHTML}${portal.outerHTML}`;
    expect(markup).toContain('aria-label="Languages"');
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(axeDebt(findings), `${scope.vertical} ${scope.theme}`).toEqual({});
    }
  }, 180_000);
});
