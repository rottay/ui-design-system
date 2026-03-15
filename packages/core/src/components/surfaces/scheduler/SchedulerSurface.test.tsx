import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchedulerSurface } from '.';
import type { SchedulerSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';

function buildConfig(overrides?: Partial<SchedulerSurfaceConfig>): SchedulerSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Schedule',
      },
    },
    behavior: {
      events: [
        {
          id: 'evt-1',
          title: 'Launch planning',
          start: new Date('2026-03-13T10:00:00Z'),
          end: new Date('2026-03-13T11:00:00Z'),
        },
      ],
      onViewChange: vi.fn(),
    },
    permissions: undefined,
    ...overrides,
  };
}

describe('SchedulerSurface', () => {
  it('uses the product profile scheduler default when the surface does not set one', async () => {
    const config = buildConfig();

    renderSurface(<SchedulerSurface config={config} />, {
      productProfile: 'events.organizer',
    });

    expect(await screen.findByRole('combobox')).toHaveValue('week');
  });

  it('lets explicit surface state override the profile default', async () => {
    const config = buildConfig({
      behavior: {
        events: [
          {
            id: 'evt-1',
            title: 'Launch planning',
            start: new Date('2026-03-13T10:00:00Z'),
            end: new Date('2026-03-13T11:00:00Z'),
          },
        ],
        activeView: 'day',
        onViewChange: vi.fn(),
      },
    });

    renderSurface(<SchedulerSurface config={config} />, {
      productProfile: 'events.organizer',
    });

    expect(await screen.findByRole('combobox')).toHaveValue('day');
  });
});
