import React from 'react';
import { waitFor } from '@testing-library/react';
import { mockMatchMedia } from '@tests/support/browser/match-media';
import { beforeAll, describe, expect, it } from 'vitest';

import { CompareSurface } from '..';
import type { CompareSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function buildConfig(compact: boolean): CompareSurfaceConfig {
  return {
    visual: { compact },
    presentation: { chrome: { title: 'Plan Comparison' } },
    behavior: {
      subjects: [
        { key: 'starter', label: 'Starter' },
        { key: 'enterprise', label: 'Enterprise' },
      ],
      sections: [
        {
          key: 'capabilities',
          title: 'Capabilities',
          rows: [{ key: 'dashboards', label: 'Dashboards', values: { starter: 'Basic', enterprise: 'Advanced' } }],
        },
      ],
    },
  };
}

describe('CompareSurface table size', () => {
  beforeAll(() => {
    mockMatchMedia(1280);
  });

  it.each([
    [true, 'sm'],
    [false, 'md'],
  ] as const)('stamps the modern table step when compact is %s', async (compact, step) => {
    const { container } = renderSurface(<CompareSurface config={buildConfig(compact)} />, { engine: 'modern' });
    await waitFor(() => expect(container.querySelector('[data-part="table"]')).not.toBeNull());
    expect(container.querySelector('[data-part="table"]')).toHaveAttribute('data-size', step);
  });

  it.each([
    [true, 'ant-table-small'],
    [false, 'ant-table-middle'],
  ] as const)('carries the classic table size class when compact is %s', async (compact, sizeClass) => {
    const { container } = renderSurface(<CompareSurface config={buildConfig(compact)} />, { engine: 'classic' });
    await waitFor(() => expect(container.querySelector('.ant-table')).not.toBeNull());
    expect(container.querySelector('.ant-table')).toHaveClass(sizeClass);
  });
});
