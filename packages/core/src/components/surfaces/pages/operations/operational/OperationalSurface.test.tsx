/** @fileoverview OperationalSurface tests -- live feed, stats, and queue panels. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { OperationalSurface } from '.';
import type { OperationalSurfaceConfig } from '../../../foundation/types';
import { renderSurface } from '../common/test-utils';
import { mockMatchMedia } from '../../../../_internal/testing/helpers/match-media';

function buildConfig(
  overrides?: Partial<OperationalSurfaceConfig<{ key: string; title: string }>>
): OperationalSurfaceConfig<{ key: string; title: string }> {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Operational Center' },
      primaryPanel: <div>Primary operator panel</div>,
      queue: <div>Queue module</div>,
    },
    behavior: {
      stats: [{ key: 'alerts', label: 'Alerts', value: 4 }],
      feed: {
        items: [{ key: 'feed-1', title: 'Scanner spike detected' }],
        renderItem: (item) => <div>{item.title}</div>,
      },
    },
    ...overrides,
  };
}

describe('OperationalSurface', () => {
  it('localizes the empty state when no operational modules are configured', async () => {
    renderSurface(
      <OperationalSurface
        config={buildConfig({
          presentation: {
            chrome: { title: 'Centro Operativo' },
          },
          behavior: {},
        })}
      />,
      {
        tenantOverrides: {
          locale: 'es',
        },
      }
    );

    expect(await screen.findByText('No hay modulos operativos configurados')).toBeInTheDocument();
  });

  it('keeps queue and live feed visible when the layout stacks on mobile', async () => {
    mockMatchMedia(375);

    renderSurface(<OperationalSurface config={buildConfig()} />);

    expect(await screen.findByText('Queue')).toBeInTheDocument();
    expect(await screen.findByText('Live feed')).toBeInTheDocument();
    expect(await screen.findByText('Queue module')).toBeInTheDocument();
    expect(await screen.findByText('Scanner spike detected')).toBeInTheDocument();
  });

  it('repositions feed and queue while hiding the secondary panel on mobile', async () => {
    mockMatchMedia(390);

    renderSurface(
      <OperationalSurface
        config={buildConfig({
          visual: {
            mobileQueuePosition: 'top',
            mobileFeedPosition: 'bottom',
            hideSecondaryPanelOnMobile: true,
          },
          presentation: {
            chrome: { title: 'Operational Center' },
            primaryPanel: <div>Primary operator panel</div>,
            secondaryPanel: <div>Secondary operator panel</div>,
            queue: <div>Queue module</div>,
          },
          behavior: {
            stats: [{ key: 'alerts', label: 'Alerts', value: 4 }],
            feed: {
              items: [{ key: 'feed-1', title: 'Scanner spike detected' }],
              renderItem: (item) => <div>{item.title}</div>,
            },
          },
        })}
      />
    );

    expect(await screen.findByText('Queue module')).toBeInTheDocument();
    expect(await screen.findByText('Scanner spike detected')).toBeInTheDocument();
    expect(screen.queryByText('Secondary operator panel')).not.toBeInTheDocument();
  });
});
