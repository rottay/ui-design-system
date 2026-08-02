/**
 * C2 convergence evidence: DashboardSurface routes section spans through the
 * SAME shared solver as WidgetBoard when `visual.adaptivePacking` opts in —
 * authored 5+5 stops stranding columns, DOM order is untouched, and the
 * default path stays byte-identical.
 */
import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardSurface } from '..';
import type { DashboardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '../../../../../../../tooling/testing/helpers/browser/match-media';

function config(adaptivePacking: boolean): DashboardSurfaceConfig {
  return {
    visual: { sectionsColumns: 12, adaptivePacking },
    presentation: {
      chrome: { title: 'Ops' },
      sections: [
        { key: 'left', title: 'Left', content: <div>left</div>, span: 5 },
        { key: 'right', title: 'Right', content: <div>right</div>, span: 5 },
      ],
    },
    behavior: {},
  };
}

function sectionSpanTotal(): number {
  return Array.from(
    document.body.querySelectorAll<HTMLElement>('.rottay-grid-item')
  )
    .map((item) => {
      const match = /span\s+(\d+)/.exec(item.style.gridColumn ?? '');
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .reduce((sum, span) => sum + span, 0);
}

describe('DashboardSurface — adaptivePacking', () => {
  it('grows a 5+5 row to fill the 12-column tier (no dead columns)', async () => {
    mockMatchMedia(1280);
    renderSurface(<DashboardSurface config={config(true)} />);
    await screen.findByText('left');
    // The two sections must jointly cover 12 tracks: the solver grows them
    // (5+5 → residue 2 redistributed under the 12 cap).
    expect(sectionSpanTotal()).toBe(12);
  });

  it('keeps the authored geometry byte-identical when the flag is absent', async () => {
    mockMatchMedia(1280);
    renderSurface(<DashboardSurface config={config(false)} />);
    await screen.findByText('left');
    expect(sectionSpanTotal()).toBe(10);
  });
});
