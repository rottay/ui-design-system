/**
 * C2 convergence evidence: DashboardSurface routes section spans through the
 * SAME shared solver as WidgetBoard when `visual.adaptivePacking` opts in —
 * authored 5+5 stops stranding columns, DOM order is untouched, and the
 * default path stays byte-identical.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardSurface } from '..';
import type { DashboardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '@tests/support/browser/match-media';

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

  it('keeps packed spans attached to special section keys and preserves child identity after reordering', async () => {
    mockMatchMedia(1280);
    const sections: NonNullable<DashboardSurfaceConfig['presentation']['sections']> = [
      { key: '__proto__', span: 2, chrome: 'plain', content: <input aria-label="Proto draft" defaultValue="Proto" /> },
      { key: 'constructor', span: 3, chrome: 'plain', content: <input aria-label="Constructor draft" defaultValue="Constructor" /> },
      { key: '2', span: 4, chrome: 'plain', content: <input aria-label="Numeric draft" defaultValue="Numeric" /> },
    ];
    const dashboard: DashboardSurfaceConfig = {
      visual: { sectionsColumns: 12, adaptivePacking: false },
      presentation: { chrome: { title: 'Keyed board' }, sections },
      behavior: {},
    };
    const { container, rerender } = renderSurface(<DashboardSurface config={dashboard} />, { engine: 'modern' });
    const proto = await screen.findByRole('textbox', { name: 'Proto draft' });
    const constructor = screen.getByRole('textbox', { name: 'Constructor draft' });
    const numeric = screen.getByRole('textbox', { name: 'Numeric draft' });
    expect(proto.closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 2' });
    expect(constructor.closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 3' });
    expect(numeric.closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 4' });
    fireEvent.change(proto, { target: { value: 'Unsaved draft' } });
    rerender(<DashboardSurface config={{ ...dashboard, presentation: { ...dashboard.presentation, sections: [...sections].reverse() } }} />);
    expect(Array.from(container.querySelectorAll('input')).map((node) => node.getAttribute('aria-label')))
      .toEqual(['Numeric draft', 'Constructor draft', 'Proto draft']);
    expect(screen.getByRole('textbox', { name: 'Proto draft' })).toBe(proto);
    expect(proto).toHaveValue('Unsaved draft');
    expect(proto.closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 2' });
    expect(constructor.closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 3' });
    expect(numeric.closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 4' });
  });

  it('gives mobile stacking priority over packed and authored spans while retaining visible order', async () => {
    mockMatchMedia(390);
    const dashboard: DashboardSurfaceConfig = {
      visual: { adaptivePacking: true, stackSectionsOnMobile: true },
      presentation: {
        chrome: { title: 'Stacked board' },
        sections: [
          { key: 'later', content: <div>Later panel</div>, span: 8, mobileSpan: 3, mobilePriority: 2 },
          { key: 'first', content: <div>First panel</div>, span: 4, mobileSpan: 2, mobilePriority: 1 },
          { key: 'hidden', content: <div>Hidden panel</div>, span: 5, hideOnMobile: true },
        ],
      },
      behavior: {},
    };
    const { container } = renderSurface(<DashboardSurface config={dashboard} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const first = await screen.findByText('First panel');
    const later = screen.getByText('Later panel');
    expect(screen.queryByText('Hidden panel')).toBeNull();
    expect(first.closest<HTMLElement>('.rottay-grid-item')?.style.gridColumn).toBe('');
    expect(later.closest<HTMLElement>('.rottay-grid-item')?.style.gridColumn).toBe('');
    expect(Array.from(container.querySelectorAll('.rottay-grid-item')).map((node) => node.textContent))
      .toEqual(['First panel', 'Later panel']);
  });

  it('uses pinned mobile packing spans when mobile stacking is disabled', async () => {
    mockMatchMedia(390);
    const dashboard: DashboardSurfaceConfig = {
      visual: { adaptivePacking: false, stackSectionsOnMobile: false, mobileSectionsColumns: 6 },
      presentation: {
        chrome: { title: 'Unstacked board' },
        sections: [
          { key: 'wide', content: <div>Wide panel</div>, span: 8, mobileSpan: 2 },
          { key: 'narrow', content: <div>Narrow panel</div>, span: 4, mobileSpan: 3 },
        ],
      },
      behavior: {},
    };
    renderSurface(<DashboardSurface config={dashboard} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    expect((await screen.findByText('Wide panel')).closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 2' });
    expect(screen.getByText('Narrow panel').closest('.rottay-grid-item')).toHaveStyle({ gridColumn: 'span 3' });
  });

  it.each([false, true])('retains authored span branches for CSS-owned responsive columns on phone=%s', async (phone) => {
    mockMatchMedia(phone ? 390 : 1280);
    const dashboard: DashboardSurfaceConfig = {
      visual: {
        adaptivePacking: false, stackSectionsOnMobile: false,
        sectionsColumns: { xs: 12 }, mobileSectionsColumns: { xs: 6 },
      },
      presentation: {
        chrome: { title: 'Responsive board' },
        sections: [{ key: 'authored', content: <div>Authored panel</div>, span: 4, mobileSpan: 2 }],
      },
      behavior: {},
    };
    renderSurface(<DashboardSurface config={dashboard} />, {
      engine: 'modern', responsiveContext: phone ? RESOLVED_PHONE_TEST_CONTEXT : undefined,
    });
    expect((await screen.findByText('Authored panel')).closest('.rottay-grid-item'))
      .toHaveStyle({ gridColumn: phone ? 'span 2' : 'span 4' });
  });
});
