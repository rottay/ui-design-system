/** @fileoverview DetailFormSurface tests -- form + detail aside split layout. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailFormSurface } from '..';
import type { DetailFormSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

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

    const saveButton = await screen.findByText('Save changes').then((node) => node.closest('button'));
    if (!saveButton) throw new Error('Save changes button not found');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(config.behavior.submitAction.onClick).toHaveBeenCalledWith({});
    });
  });

  it('renders the summary column when summary content is provided', async () => {
    const config = buildConfig();

    renderSurface(<DetailFormSurface config={config} />);

    expect(await screen.findByText('Workspace summary')).toBeInTheDocument();
  });

  it('protects an explicit cancel while dirty and allows it after confirmation', async () => {
    const confirmDiscard = vi.fn(() => false);
    const onCancel = vi.fn();
    const base = buildConfig();

    renderSurface(
      <DetailFormSurface
        config={{
          ...base,
          behavior: {
            ...base.behavior,
            dirtyState: {
              isDirty: true,
              confirmDiscard,
            },
            cancelAction: {
              id: 'cancel-edit',
              label: 'Cancel',
              onClick: onCancel,
            },
          },
        }}
      />,
      { tenantOverrides: { locale: 'fr' } }
    );

    const cancel = await screen.findByRole('button', { name: 'Cancel' });
    fireEvent.click(cancel);

    expect(confirmDiscard).toHaveBeenCalledWith('Ignorer les modifications non enregistrées du formulaire ?', 'cancel');
    expect(onCancel).not.toHaveBeenCalled();

    confirmDiscard.mockReturnValue(true);
    fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('passes cancel straight through when no dirty state is declared', async () => {
    const onCancel = vi.fn();
    const base = buildConfig();

    renderSurface(
      <DetailFormSurface
        config={{
          ...base,
          behavior: {
            ...base.behavior,
            cancelAction: {
              id: 'cancel-edit',
              label: 'Cancel',
              onClick: onCancel,
            },
          },
        }}
      />
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
