/** @fileoverview DashboardSurface tests -- KPI grid, section cards, and actions. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DashboardSurface } from '.';
import type { DashboardSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';
import { mockMatchMedia } from '../../../_internal/testing/helpers/match-media';

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
  it('renders page chrome, stats, sections and header actions', async () => {
    const onHeaderAction = vi.fn();

    renderSurface(<DashboardSurface config={buildDashboardConfig(onHeaderAction)} />);

    expect(await screen.findByText('Operations dashboard')).toBeInTheDocument();
    expect(await screen.findByText('Header summary')).toBeInTheDocument();
    expect(await screen.findByText('Open items')).toBeInTheDocument();
    expect(await screen.findByText('Section content')).toBeInTheDocument();
    expect(await screen.findByText('Attendees')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /refresh/i }));
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

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
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
