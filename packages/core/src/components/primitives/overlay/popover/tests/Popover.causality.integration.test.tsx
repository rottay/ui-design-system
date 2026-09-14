/**
 * The popover family in a real browser: every decision its paint consumes moves
 * the surface with a negative control; a recipe swaps the material, the copy
 * mirrors under RTL, and loading and accessibility hold.
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

/** The surface in its portal scope wrapper, as the browser receives it. */
function popoverMarkup(props: Partial<PopoverProps> = {}): string {
  const view = render(
    <Popover open title="Owner" content="Assigned to the platform team." {...props}>
      <button type="button">Details</button>
    </Popover>,
  );
  const surface = document.querySelector("[data-part='surface']")!;
  const html = (surface.closest("[data-portal-scope='true']") ?? surface.parentElement!).outerHTML;
  view.unmount();
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
    const rtl = popoverMarkup().replace('dir="ltr"', 'dir="rtl"');
    const result = await measureArms({
      vertical: 'rottay',
      markup: `<div id="ltr">${markup}</div><div id="rtl">${rtl}</div>`,
      arms: { base: {} },
      targets: [
        { id: 'ltrAlign', selector: `#ltr ${SURFACE}`, property: 'text-align' },
        { id: 'ltrDirection', selector: `#ltr ${SURFACE}`, property: 'direction' },
        { id: 'rtlDirection', selector: `#rtl ${SURFACE}`, property: 'direction' },
      ],
    });
    const r = result.base!;
    expect(r.ltrAlign).toBe('start');
    expect(r.ltrDirection).toBe('ltr');
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
