import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailFormSurface } from '../detail-form';
import type { DetailFormSurfaceConfig } from '../types';
import { renderSurface } from './test-utils';

function buildConfig(): DetailFormSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Edit workspace',
      },
      summary: <div>Workspace summary</div>,
    },
    behavior: {
      fields: [],
      submitAction: {
        id: 'save-workspace',
        label: 'Save changes',
        variant: 'primary',
        onClick: vi.fn(),
      },
      cancelAction: {
        id: 'cancel-edit',
        label: 'Cancel',
        onClick: vi.fn(),
      },
    },
  };
}

describe('DetailFormSurface', () => {
  it('routes submission through the unified submitAction contract', async () => {
    const config = buildConfig();

    renderSurface(<DetailFormSurface config={config} />);

    fireEvent.click(await screen.findByRole('button', { name: /Save changes/i }));

    await waitFor(() => {
      expect(config.behavior.submitAction.onClick).toHaveBeenCalledWith({});
    });
  });

  it('renders the summary column when summary content is provided', async () => {
    const config = buildConfig();

    renderSurface(<DetailFormSurface config={config} />);

    expect(await screen.findByText('Workspace summary')).toBeInTheDocument();
  });
});
