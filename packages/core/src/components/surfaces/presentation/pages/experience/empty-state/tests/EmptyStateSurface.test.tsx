/** @fileoverview EmptyStateSurface tests -- action rendering and guidance content. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyStateSurface } from '..';
import type { EmptyStateSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<EmptyStateSurfaceConfig>): EmptyStateSurfaceConfig {
  return {
    visual: {},
    presentation: {
      title: 'No projects yet',
      description: 'Create your first project to get started.',
    },
    behavior: {
      primaryAction: {
        id: 'create-project',
        label: 'Create project',
        variant: 'primary',
        onClick: vi.fn(),
      },
      secondaryAction: {
        id: 'import-projects',
        label: 'Import projects',
        onClick: vi.fn(),
      },
    },
    access: undefined,
    ...overrides,
  };
}

describe('EmptyStateSurface', () => {
  it('routes the primary action and applies the secondary action decision', async () => {
    const config = buildConfig({
      access: {
        mode: 'resolved',
        capabilities: [
          { kind: 'action', id: 'create-project', visible: true },
          { kind: 'action', id: 'import-projects', visible: false },
        ],
      },
    });

    renderSurface(<EmptyStateSurface config={config} />);

    fireEvent.click(await screen.findByRole('button', { name: /Create project/i }));

    await waitFor(() => {
      expect(config.behavior.primaryAction?.onClick).toHaveBeenCalledWith(undefined);
    });

    expect(screen.queryByRole('button', { name: /Import projects/i })).not.toBeInTheDocument();
  });
});
