/** @fileoverview CompareSurface tests -- column rendering, highlight, and responsive. */

import React from 'react';
import { screen } from '@testing-library/react';
import { mockMatchMedia } from '../../../../_internal/testing/helpers/match-media';
import { beforeAll, describe, expect, it } from 'vitest';

import { CompareSurface } from '.';
import type { CompareSurfaceConfig } from '../../../foundation/types';
import { renderSurface } from '../common/test-utils';

function buildConfig(overrides?: Partial<CompareSurfaceConfig>): CompareSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: { title: 'Plan Comparison' },
    },
    behavior: {
      subjects: [
        { key: 'starter', label: 'Starter' },
        { key: 'enterprise', label: 'Enterprise' },
      ],
      sections: [
        {
          key: 'capabilities',
          title: 'Capabilities',
          rows: [
            {
              key: 'dashboards',
              label: 'Dashboards',
              values: {
                starter: 'Basic',
                enterprise: 'Advanced',
              },
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}

describe('CompareSurface', () => {
  beforeAll(async () => {
    await import('../../primitives/display/Table/engines/rustic');
  });

  it('localizes the default empty state through the provider locale', async () => {
    renderSurface(
      <CompareSurface
        config={buildConfig({
          behavior: {
            subjects: [],
            sections: [],
          },
        })}
      />,
      {
        tenantOverrides: {
          locale: 'es',
        },
      }
    );

    expect(await screen.findByText('No hay datos de comparacion')).toBeInTheDocument();
  });

  it('renders criteria and subjects when comparison data exists', async () => {
    mockMatchMedia(1280);

    renderSurface(<CompareSurface config={buildConfig()} />);

    expect(await screen.findByRole('grid', undefined, { timeout: 15000 })).toBeInTheDocument();
    expect(await screen.findByText('Starter', undefined, { timeout: 15000 })).toBeInTheDocument();
    expect(await screen.findByText('Enterprise', undefined, { timeout: 15000 })).toBeInTheDocument();
    expect(await screen.findByText('Capabilities')).toBeInTheDocument();
    expect(await screen.findByText('Dashboards')).toBeInTheDocument();
  });

  it('stacks comparison rows into cards on mobile', async () => {
    mockMatchMedia(390);

    renderSurface(<CompareSurface config={buildConfig()} />);

    expect(await screen.findByText('Dashboards')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
