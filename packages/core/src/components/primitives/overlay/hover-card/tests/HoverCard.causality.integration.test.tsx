/**
 * The hover-card family in a real browser: every decision its paint consumes
 * moves the card with a negative control; its placement mirrors along the
 * inline axis under RTL, and loading and accessibility hold.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { readAnatomyBones } from '@/components/primitives/feedback/skeleton/runtime/anatomy-renderer';
import ModernHoverCard from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  describeCausality,
  seriousFindings,
} from '@tests/support/family-causality';

function cardMarkup(dir: 'ltr' | 'rtl' = 'ltr'): { html: string; placement: string } {
  const view = render(
    <div dir={dir}>
      <ModernHoverCard
        open
        side="bottom"
        align="start"
        content={<p>Ada Lovelace, platform owner</p>}
        trigger={<a href="#ada">@ada</a>}
      />
    </div>,
  );
  const trigger = view.container.querySelector<HTMLElement>("[data-part='trigger']")!;
  const placement = trigger.querySelector("[data-part='surface']")!.getAttribute('data-placement')!;
  const html = trigger.outerHTML;
  view.unmount();
  return { html, placement };
}

const { html: markup } = cardMarkup();

const SURFACE = "[data-part='surface']";

describeCausality({
  family: 'hover-card',
  markup,
  targets: [
    { id: 'edgeInk', selector: SURFACE, property: 'border-top-color' },
    { id: 'shadow', selector: SURFACE, property: 'box-shadow' },
    { id: 'radius', selector: SURFACE, property: 'border-top-left-radius' },
    { id: 'edge', selector: SURFACE, property: 'border-top-width' },
    { id: 'padding', selector: SURFACE, property: 'padding-top' },
    { id: 'duration', selector: SURFACE, property: 'animation-duration' },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['edgeInk'], holds: 'radius', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['radius'], holds: 'padding', in: VERTICALS },
    'density.mode': { value: 'compact', moves: ['padding'], holds: 'radius', in: VERTICALS },
    'surfaces.border-style': { value: 'none', moves: ['edge'], holds: 'radius', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['shadow'], holds: 'radius', in: ['evnto'] },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'radius', in: ['evnto'] },
  },
});

describe('hover-card direction, loading and accessibility', () => {
  it('mirrors an inline-start alignment under RTL', () => {
    expect(cardMarkup('ltr').placement).toBe('bottom-start');
    expect(cardMarkup('rtl').placement).toBe('bottom-end');
  });

  it('describes its trigger with the card it controls', () => {
    render(
      <ModernHoverCard open content={<p>Ada Lovelace, platform owner</p>} trigger={<a href="#ada">@ada</a>} />,
    );
    const trigger = screen.getByRole('link', { name: '@ada' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(trigger.getAttribute('aria-controls')!)).toHaveTextContent('Ada Lovelace');
  });

  it('builds its loading state from its own anatomy', () => {
    const { container } = render(
      <ModernHoverCard open content={<p>Ada Lovelace, platform owner</p>} trigger={<a href="#ada">@ada</a>} />,
    );
    const bones = readAnatomyBones(container);
    expect(bones.map((bone) => `${bone.part}:${bone.role}`)).toEqual(
      expect.arrayContaining(['trigger:block']),
    );
  });

  it('has no serious or critical axe violation in any gated vertical mode', async () => {
    for (const scope of AXE_SCOPES) {
      const findings = seriousFindings(await auditAxe({ ...scope, markup }));
      expect(findings, `${scope.vertical} ${scope.theme}`).toEqual([]);
    }
  }, 180_000);
});
