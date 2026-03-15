import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyStateSurface } from '../empty-state';
import type { EmptyStateSurfaceConfig } from '../types';
import { renderSurface } from './test-utils';

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
    permissions: undefined,
    ...overrides,
  };
}

describe('EmptyStateSurface', () => {
  it('routes the primary action and filters the secondary action through permissions', async () => {
    const config = buildConfig({
      permissions: {
        granted: [],
        actions: {
          'import-projects': {
            permission: 'projects:import',
          },
        },
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
