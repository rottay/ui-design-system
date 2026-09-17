/**
 * The tooltip family in a real browser: every decision its paint consumes moves
 * the bubble with a negative control; a recipe and a tone swap its material, its
 * copy follows the reading direction, and loading and accessibility hold.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernTooltip from '../engines/modern';
import type { TooltipProps } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

/**
 * The engine stamps `dir` on the bubble from the anchor's context, and that
 * stamp is the bubble's only direction authority once it is portalled out of
 * the anchor's tree. A snapshot therefore has to be rendered in the direction
 * it will be measured in: a scene that inherited its direction from the probe
 * host would be measuring the host, not the contract.
 */
function bubbleMarkup(props: Partial<TooltipProps> = {}, direction: 'ltr' | 'rtl' = 'ltr'): string {
  const host = document.createElement('div');
  host.setAttribute('dir', direction);
  document.body.append(host);
  const view = render(
    <ModernTooltip visible content="Copied to clipboard" shortcut="mod+c" {...props}>
      <button type="button">Copy</button>
    </ModernTooltip>,
    { container: host },
  );
  const html = document.querySelector("[data-part='bubble']")!.outerHTML;
  view.unmount();
  host.remove();
  return html;
}

const markup = bubbleMarkup();

const BUBBLE = "[data-part='bubble']";

describeCausality({
  family: 'tooltip',
  markup,
  targets: [
    { id: 'radius', selector: BUBBLE, property: 'border-top-left-radius' },
    { id: 'edge', selector: BUBBLE, property: 'border-top-width' },
    { id: 'type', selector: BUBBLE, property: 'font-size' },
    { id: 'shadow', selector: BUBBLE, property: 'box-shadow' },
    { id: 'duration', selector: BUBBLE, property: 'transition-duration' },
  ],
  decisions: {
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'type', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['evnto'] },
    'typography.scale': { value: 1.08, moves: ['type'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('tooltip recipe, tone, direction, loading and accessibility', () => {
  it('moves a primary-tone bubble with the palette seeds and holds a default bubble', async () => {
    const tones = `<div id="primary">${bubbleMarkup({ color: 'primary' })}</div><div id="default">${markup}</div>`;
    const readings = await measureArms({
      vertical: 'evnto',
      markup: tones,
      arms: { base: {}, seeded: { 'palette.seeds': { primary: '#2F6B9A' } } },
      targets: [
        { id: 'primaryFill', selector: `#primary ${BUBBLE}`, property: 'background-color' },
        { id: 'defaultFill', selector: `#default ${BUBBLE}`, property: 'background-color' },
      ],
    });
    expect(readings.seeded!.primaryFill).not.toBe(readings.base!.primaryFill);
    expect(readings.seeded!.defaultFill).toBe(readings.base!.defaultFill);
  }, 60_000);

  it('swaps the material with the recipe the bubble stamps', async () => {
    const readings = await measureArms({
      vertical: 'bithire',
      markup: `<div id="bordered">${markup}</div><div id="inverse">${bubbleMarkup({ recipe: 'inverse' })}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'borderedInk', selector: `#bordered ${BUBBLE}`, property: 'color' },
        { id: 'inverseInk', selector: `#inverse ${BUBBLE}`, property: 'color' },
      ],
    });
    expect(readings.base!.inverseInk).not.toBe(readings.base!.borderedInk);
  }, 60_000);

  it('lays the shortcut keys at the inline end in both directions', async () => {
    // Two scenes, each stamped by the engine in its own direction, measured in
    // a host of that same direction: the bubble's `dir` is what resolves the
    // inline axis, so the RTL arm must carry the stamp instead of inheriting it.
    const scenes = `<div id="ltr">${markup}</div><div id="rtl">${bubbleMarkup({}, 'rtl')}</div>`;
    const readings = await measureArms({
      vertical: 'rottay',
      markup: scenes,
      arms: { base: {} },
      targets: [
        { id: 'ltrDirection', selector: `#ltr ${BUBBLE}`, property: 'direction', dir: 'ltr' },
        { id: 'ltrContent', selector: "#ltr [data-part='content']", property: '@rect.left', dir: 'ltr' },
        { id: 'ltrKeys', selector: "#ltr [data-part='shortcut-chips']", property: '@rect.left', dir: 'ltr' },
        { id: 'rtlDirection', selector: `#rtl ${BUBBLE}`, property: 'direction', dir: 'rtl' },
        { id: 'rtlContent', selector: "#rtl [data-part='content']", property: '@rect.left', dir: 'rtl' },
        { id: 'rtlKeys', selector: "#rtl [data-part='shortcut-chips']", property: '@rect.left', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    // The scenes are only different if the stamp reached paint.
    expect(r.ltrDirection).toBe('ltr');
    expect(r.rtlDirection).toBe('rtl');
    expect(Number(r.ltrKeys)).toBeGreaterThan(Number(r.ltrContent));
    expect(Number(r.rtlKeys)).toBeLessThan(Number(r.rtlContent));
  }, 60_000);

  it('describes its trigger with the bubble text', () => {
    render(
      <ModernTooltip visible content="Copied to clipboard">
        <button type="button">Copy</button>
      </ModernTooltip>,
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveAccessibleDescription('Copied to clipboard');
  });

  it('builds its loading state from its own anatomy', () => {
    render(
      <ModernTooltip visible content="Copied to clipboard" shortcut="mod+c">
        <button type="button">Copy</button>
      </ModernTooltip>,
    );
    const bones = readAnatomyBones(document.querySelector<HTMLElement>("[data-part='bubble']")!.parentElement!);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(expect.arrayContaining(['bubble:frame']));
    expect(bones.some((bone) => bone.part === 'shortcut-key')).toBe(false);
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = `<button type="button" aria-describedby="${markup.match(/id="([^"]+)"/)?.[1]}">Copy</button>${markup}${bubbleMarkup({ recipe: 'rich', color: 'primary' })}`;
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
