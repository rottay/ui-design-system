/**
 * The popover family in a real browser: every decision its paint consumes moves
 * the surface with a negative control; the surface composes the elevation-surface
 * wash over its own fill, a recipe swaps the material, the copy mirrors under
 * RTL, and loading and accessibility hold.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import { Popover } from '../engines/modern';
import type { PopoverProps } from '../contracts';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

/**
 * The surface in its portal scope wrapper, as the browser receives it.
 *
 * The engine stamps `dir` on the surface from the anchor's context, and that
 * stamp is the surface's only direction authority: the in-tree branch renders
 * it under a trigger that declares none. A snapshot therefore has to be
 * rendered in the direction it will be measured in, instead of being rewritten
 * afterwards or inheriting one from the probe host.
 */
function popoverMarkup(
  props: Partial<PopoverProps> = {},
  direction: 'ltr' | 'rtl' = 'ltr',
): string {
  const host = document.createElement('div');
  host.setAttribute('dir', direction);
  document.body.append(host);
  const view = render(
    <Popover open title="Owner" content="Assigned to the platform team." {...props}>
      <button type="button">Details</button>
    </Popover>,
    { container: host },
  );
  const surface = document.querySelector("[data-part='surface']")!;
  const html = (surface.closest("[data-portal-scope='true']") ?? surface.parentElement!).outerHTML;
  view.unmount();
  host.remove();
  return html;
}

const markup = popoverMarkup();

const SURFACE = "[data-part='surface']";

describeCausality({
  family: 'popover',
  markup,
  targets: [
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'edge', selector: SURFACE, property: 'border-top-width' },
    { id: 'padding', selector: "[data-part='body']", property: 'padding-top' },
    { id: 'titleSize', selector: "[data-part='title']", property: 'font-size' },
    { id: 'duration', selector: SURFACE, property: 'animation-duration' },
  ],
  decisions: {
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'titleSize', in: ['evnto'] },
    'density.mode': { value: 'compact', moves: ['padding'], holds: 'radius', in: ['evnto'] },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('popover recipe, direction, loading and accessibility', () => {
  // The wash is a separate background layer from the fill, so a skin that drops
  // it still paints a plausible surface; the reference node declares only the wash.
  it('composes the elevation-surface wash above its own fill', async () => {
    const reference =
      '<div id="wash" style="background-image: linear-gradient(var(--ds-elevation-surface-3), var(--ds-elevation-surface-3));"></div>';
    const result = await measureArms({
      vertical: 'rottay',
      markup: `${reference}<div id="popover">${markup}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'wash', selector: '#wash', property: 'background-image' },
        { id: 'lift', selector: `#popover ${SURFACE}`, property: '--ds-elevation-surface-3' },
        { id: 'surfaceImage', selector: `#popover ${SURFACE}`, property: 'background-image' },
        { id: 'surfaceFill', selector: `#popover ${SURFACE}`, property: 'background-color' },
      ],
    });
    const r = result.base!;
    expect(r.lift.trim()).not.toBe('');
    expect(r.wash).toMatch(/^linear-gradient\(/);
    expect(r.surfaceImage.slice(0, r.wash.length)).toBe(r.wash);
    expect(r.surfaceFill).not.toBe('rgba(0, 0, 0, 0)');
  }, 60_000);

  it('swaps the material with the recipe the surface stamps', async () => {
    const result = await measureArms({
      vertical: 'evnto',
      markup: `<div id="bordered">${markup}</div><div id="inverse">${popoverMarkup({ recipe: 'inverse' })}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'borderedInk', selector: `#bordered ${SURFACE}`, property: 'color' },
        { id: 'inverseInk', selector: `#inverse ${SURFACE}`, property: 'color' },
      ],
    });
    expect(result.base!.inverseInk).not.toBe(result.base!.borderedInk);
  }, 60_000);

  it('starts its copy at the inline start in both directions', async () => {
    // Two scenes, each stamped by the engine in its own direction: the `dir`
    // the surface carries is what resolves its inline axis, so the RTL arm
    // must be rendered with that stamp rather than inherit one.
    const rtl = popoverMarkup({}, 'rtl');
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="ltr">${markup}</div><div id="rtl">${rtl}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrAlign', selector: `#ltr ${SURFACE}`, property: 'text-align' },
        { id: 'ltrDirection', selector: `#ltr ${SURFACE}`, property: 'direction' },
        { id: 'rtlAlign', selector: `#rtl ${SURFACE}`, property: 'text-align' },
        { id: 'rtlDirection', selector: `#rtl ${SURFACE}`, property: 'direction' },
      ],
    });
    const r = result.base!;
    expect(r.ltrAlign).toBe('start');
    expect(r.ltrDirection).toBe('ltr');
    expect(r.rtlAlign).toBe('start');
    expect(r.rtlDirection).toBe('rtl');
  }, 60_000);

  it('describes its trigger and names its surface from the title', () => {
    render(
      <Popover open title="Owner" content="Assigned to the platform team.">
        <button type="button">Details</button>
      </Popover>,
    );
    const trigger = screen.getByRole('button', { name: 'Details' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const surface = screen.getByRole('dialog', { name: 'Owner' });
    expect(trigger.getAttribute('aria-controls')).toBe(surface.id);
  });

  it('builds its loading state from its own anatomy', () => {
    render(
      <Popover open title="Owner" content="Assigned to the platform team.">
        <button type="button">Details</button>
      </Popover>,
    );
    const scope = document.querySelector<HTMLElement>("[data-part='surface']")!.parentElement!;
    const bones = readAnatomyBones(scope);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['surface:frame', 'title:line']),
    );
    expect(bones.some((bone) => bone.part === 'arrow')).toBe(false);
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    const gallery = [markup, popoverMarkup({ recipe: 'rich' })].join('');
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup: gallery }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
