/** @fileoverview SchedulerSurface tests -- calendar rendering and toolbar actions. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SchedulerSurface } from '..';
import type { SchedulerSurfaceConfig } from '../../../../../foundation/contracts';
import {
  renderSurface,
  RESOLVED_PHONE_TEST_CONTEXT,
} from '../../../../../foundation/common/test-utils';

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
    access: undefined,
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

  it('renders an actionable agenda and removes the timeline rail on phone', async () => {
    const onEventClick = vi.fn();
    const config = buildConfig({
      visual: {
        mobileView: 'list',
        hideTimelineOnMobile: true,
      },
      presentation: {
        chrome: { title: 'Schedule' },
        sidebar: <div>Timeline rail</div>,
      },
      behavior: {
        ...buildConfig().behavior,
        onEventClick,
      },
    });

    renderSurface(<SchedulerSurface config={config} />, {
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });

    const eventLabel = await screen.findByText('Launch planning', undefined, { timeout: 15000 });
    const event = eventLabel.closest('[data-part="agenda-event"]');
    if (!(event instanceof HTMLElement)) throw new Error('Agenda event not found');
    fireEvent.click(event);
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'evt-1' }));
    expect(screen.queryByText('Timeline rail')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(document.querySelector('.ds-scheduler')).toHaveAttribute('data-mobile-view', 'list');
    expect(document.querySelector('.ds-scheduler')).toHaveAttribute(
      'data-mobile-timeline',
      'hidden'
    );
  });

  it('keeps invalid events visible without crashing and formats valid times deterministically', async () => {
    const validStart = new Date('2026-03-13T10:00:00Z');
    const config = buildConfig({
      visual: { mobileView: 'list' },
      presentation: {
        chrome: { title: 'Schedule' },
        timeZone: 'UTC',
      },
      behavior: {
        events: [
          { id: 'invalid', title: 'Broken timestamp', start: 'not-a-date' },
          { id: 'valid', title: 'Valid timestamp', start: validStart },
        ],
      },
    });

    renderSurface(<SchedulerSurface config={config} />, {
      responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });

    expect(await screen.findByText('Broken timestamp')).toBeInTheDocument();
    expect(screen.getByText('Time unavailable')).toBeInTheDocument();
    expect(screen.getByText('Events with an invalid start time: 1')).toBeInTheDocument();
    expect(
      screen.getByText(
        new Intl.DateTimeFormat('en', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC',
        }).format(validStart)
      )
    ).toBeInTheDocument();
  });
});
