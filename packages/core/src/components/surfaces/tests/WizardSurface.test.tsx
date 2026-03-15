import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WizardSurface } from '../wizard';
import type { WizardSurfaceConfig } from '../types';
import { renderSurface } from './test-utils';

function buildConfig(overrides?: Partial<WizardSurfaceConfig>): WizardSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Setup flow',
      },
    },
    behavior: {
      steps: [
        {
          key: 'review',
          title: 'Review',
          content: <div>Review the setup</div>,
        },
      ],
      initialValues: {
        region: 'us-east-1',
      },
      submitAction: {
        id: 'complete-setup',
        label: 'Complete setup',
        variant: 'primary',
        onClick: vi.fn(),
      },
    },
    permissions: undefined,
    ...overrides,
  };
}

describe('WizardSurface', () => {
  it('routes completion through submitAction with the resolved values', async () => {
    const config = buildConfig();

    renderSurface(<WizardSurface config={config} />);

    fireEvent.click(await screen.findByRole('button', { name: /Complete setup/i }));

    await waitFor(() => {
      expect(config.behavior.submitAction.onClick).toHaveBeenCalledWith({
        region: 'us-east-1',
      });
    });
  });

  it('hides the complete action when submitAction is denied by permissions', async () => {
    const config = buildConfig({
      permissions: {
        granted: [],
        actions: {
          'complete-setup': {
            permission: 'setup:complete',
          },
        },
      },
    });

    renderSurface(<WizardSurface config={config} />);

    expect(await screen.findByText('Review the setup')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Complete setup/i })).not.toBeInTheDocument();
  });
});
