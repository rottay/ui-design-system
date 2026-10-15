/** @fileoverview DashboardSurface tests -- KPI grid, section cards, and actions. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardSurface } from '..';
import type { DashboardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '@tests/support/browser/match-media';

function buildDashboardConfig(onHeaderAction = vi.fn()): DashboardSurfaceConfig {
  return {
    visual: {
      statsColumns: 2,
      sectionsColumns: 12,
    },
    presentation: {
      chrome: {
        title: 'Operations dashboard',
        subtitle: 'Live venue status',
      },
      headerContent: <div>Header summary</div>,
      sections: [
        {
          key: 'primary',
          title: 'Open items',
          description: 'Tasks that still need attention',
          span: 8,
          content: <div>Section content</div>,
        },
      ],
    },
    behavior: {
      stats: [
        { key: 'attendees', label: 'Attendees', value: 1240 },
        { key: 'staff', label: 'Staff', value: 36 },
      ],
      headerActions: [
        {
          id: 'refresh',
          label: 'Refresh',
          onClick: onHeaderAction,
          variant: 'primary',
        },
      ],
    },
  };
}

describe('DashboardSurface', () => {
  it('applies hidden anatomy to the loading mirror on the resolved phone paint', async () => {
    const { container } = renderSurface(
      <DashboardSurface config={buildDashboardConfig()} loading postures={{ phone: {
        regions: { header: 'hide', stats: 'hide', sections: 'hide' },
      } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByText('Operations dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Header summary')).toBeNull();
    expect(container.querySelector('[data-part="dashboard-skeleton-block"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="stats"], [data-surface-region="sections"]')).toBeNull();
  });

  it('renders an empty dashboard primary operation once after moving it out of chrome', async () => {
    const callback = vi.fn();
    const config = buildDashboardConfig(callback);
    config.presentation.sections = [];
    config.behavior.stats = [];
    renderSurface(<DashboardSurface config={config} postures={{ phone: { primaryAction: 'bottom-bar' } }} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const action = await screen.findByRole('button', { name: 'Refresh' });
    expect(screen.getAllByRole('button', { name: 'Refresh' })).toHaveLength(1);
    expect(action.closest('[data-mode="sticky"]')).not.toBeNull();
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('renders page chrome, stats, sections and header actions', async () => {
    const onHeaderAction = vi.fn();

    renderSurface(<DashboardSurface config={buildDashboardConfig(onHeaderAction)} />);

    expect(await screen.findByText('Operations dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Header summary')).toBeInTheDocument();
    expect(await screen.findByText('Open items')).toBeInTheDocument();
    expect(await screen.findByText('Section content')).toBeInTheDocument();
    expect(await screen.findByText('Attendees')).toBeInTheDocument();

    const refreshButton = screen.getByText('Refresh').closest('button');
    if (!refreshButton) throw new Error('Refresh button not found');
    fireEvent.click(refreshButton);
    expect(onHeaderAction).toHaveBeenCalledTimes(1);
  });

  it('renders the standardized surface error state and retry action', async () => {
    const onRetry = vi.fn();

    renderSurface(
      <DashboardSurface
        config={buildDashboardConfig()}
        error={new Error('Unable to load live metrics')}
        onRetry={onRetry}
      />
    );

    expect(await screen.findByText('Unable to load live metrics')).toBeInTheDocument();

    const retryButton = screen.getByText('Try again').closest('button');
    if (!retryButton) throw new Error('Try again button not found');
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('prioritizes and hides sections on mobile when configured', async () => {
    mockMatchMedia(390);

    renderSurface(
      <DashboardSurface
        config={{
          visual: {
            statsColumns: 4,
            mobileStatsLimit: 2,
            stackSectionsOnMobile: true,
          },
          presentation: {
            chrome: {
              title: 'Operations dashboard',
            },
            sections: [
              {
                key: 'secondary',
                title: 'Secondary section',
                content: <div>Secondary content</div>,
                mobilePriority: 2,
              },
              {
                key: 'primary',
                title: 'Primary section',
                content: <div>Primary content</div>,
                mobilePriority: 1,
              },
              {
                key: 'hidden',
                title: 'Hidden section',
                content: <div>Hidden content</div>,
                hideOnMobile: true,
              },
            ],
          },
          behavior: {
            stats: [
              { key: 'one', label: 'One', value: 1 },
              { key: 'two', label: 'Two', value: 2 },
              { key: 'three', label: 'Three', value: 3 },
            ],
          },
        }}
      />
    );

    expect(await screen.findByText('Primary section')).toBeInTheDocument();
    expect(screen.getByText('Secondary section')).toBeInTheDocument();
    expect(screen.queryByText('Hidden section')).not.toBeInTheDocument();
    expect(screen.queryByText('Three')).not.toBeInTheDocument();
  });
});

// F-1 RTL (owner ruling 2026-10-14): the engine default stays the physical `left`, so reading-order text passes
// align="start". jsdom loads no skin stylesheet, so the pair reads the stamped logical value and its utility
// class under each direction; that `text-align: start` lands on the right edge under dir=rtl is CSS's own rule.
function expectLogicalStart(container: ParentNode, hooks: readonly string[], dir: 'ltr' | 'rtl'): void {
  for (const hook of hooks) {
    const nodes = container.querySelectorAll(`.${hook}`);
    expect(nodes.length, hook).toBeGreaterThan(0);
    for (const node of nodes) {
      expect(node.getAttribute('data-align'), hook).toBe('start');
      expect(node.classList.contains('text-start'), hook).toBe(true);
      // the regression: the physical default pins the text to the left edge in RTL
      expect(node.classList.contains('text-left'), hook).toBe(false);
      expect(node.closest('[dir]')?.getAttribute('dir'), hook).toBe(dir);
    }
  }
}

describe('F-1 RTL semantic alignment', () => {
  it.each(['ltr', 'rtl'] as const)('stamps the logical start on the section title and description under dir=%s', async (dir) => {
    mockMatchMedia(1280);
    const { container } = renderSurface(
      <div dir={dir}>
        <DashboardSurface config={buildDashboardConfig()} />
      </div>,
      { engine: 'modern' },
    );
    await screen.findByText('Tasks that still need attention');
    expectLogicalStart(container, ['ds-dashboard__section-title', 'ds-dashboard__section-description'], dir);
  });
});
