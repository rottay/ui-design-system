/** @fileoverview The dashboard skin's section-hook rules select the nodes the Modern surface stamps. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import dashboardSkinCss from '@/foundation/tokens/css/presentation/components/skin/dashboard/index.css?raw';

import { DashboardSurface } from '..';
import type { DashboardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

const config: DashboardSurfaceConfig = {
  visual: {},
  presentation: {
    chrome: { title: 'Operations dashboard' },
    sections: [
      {
        key: 'primary',
        title: 'Open items',
        description: 'Tasks that still need attention',
        content: <div>Section content</div>,
      },
    ],
  },
  behavior: { stats: [] },
};

function selectorsDeclaring(declaration: string): string[] {
  const css = dashboardSkinCss.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors: string[] = [];
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (match[2].replace(/\s+/g, ' ').includes(declaration)) {
      selectors.push(match[1].replace(/\s+/g, ' ').trim());
    }
  }
  return selectors;
}

describe('DashboardSurface skin anatomy (Modern)', () => {
  it('paints the section description with the muted channel', async () => {
    renderSurface(<DashboardSurface config={config} />, { engine: 'modern' });
    const description = await screen.findByText('Tasks that still need attention');
    const node = description.closest('.ds-dashboard__muted-text');
    expect(node).not.toBeNull();
    expect(node).toHaveAttribute('data-part', 'section-description');

    const selectors = selectorsDeclaring('var( --ds-dashboard-section-description-color');
    expect(selectors).toHaveLength(1);
    expect(node!.matches(selectors[0])).toBe(true);
  });

  it('keys every section-title weight rule on the stamped title', async () => {
    const { container } = renderSurface(<DashboardSurface config={config} />, {
      engine: 'modern',
    });
    const title = (await screen.findByText('Open items')).closest('.ds-dashboard__section-title');
    expect(title).not.toBeNull();
    expect(title).toHaveAttribute('data-part', 'section-title');

    const selectors = selectorsDeclaring('font-weight:');
    expect(selectors).toHaveLength(3);
    const surface = container.querySelector('.ds-surface.ds-dashboard')!;
    for (const [variant, selector] of selectors.entries()) {
      if (variant > 0) {
        surface.setAttribute('data-heading-weight', variant === 1 ? 'lighter' : 'heavier');
      }
      expect(title!.matches(selector), selector).toBe(true);
    }
  });
});
