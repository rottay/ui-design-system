/** @fileoverview FormSurface tests -- field rendering, aside layout, and action submission. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { FormSurface } from '..';
import type { FormSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';
import { mockMatchMedia } from '../../../../../../_internal/testing/helpers/match-media';

function buildConfig(): FormSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Create record',
      },
    },
    behavior: {
      fields: [],
      submitAction: {
        id: 'submit-record',
        label: 'Create record',
        variant: 'primary',
        onClick: vi.fn(),
      },
    },
  };
}

describe('FormSurface', () => {
  beforeAll(async () => {
    await import('../../../../../primitives/inputs/Button/engines/rustic');
  });

  beforeEach(() => {
    mockMatchMedia(1280);
  });

  it('routes submission through the unified submitAction contract', async () => {
    const config = buildConfig();

    const { container } = renderSurface(<FormSurface config={config} />);

    const form = await waitFor(
      () => {
        const element = container.querySelector('form');
        expect(element).not.toBeNull();
        return element as HTMLFormElement;
      },
      { timeout: 15000 }
    );

    fireEvent.submit(form);

    await waitFor(() => {
      expect(config.behavior.submitAction.onClick).toHaveBeenCalledWith({});
    });
  });

  it('hides the aside and stacks mobile actions by default on narrow screens', async () => {
    mockMatchMedia(390);

    renderSurface(
      <FormSurface
        config={{
          visual: {
            layout: 'horizontal',
            columns: 2,
            mobileActionsSticky: true,
          },
          presentation: {
            chrome: {
              title: 'Create record',
            },
            aside: <div>Helpful aside</div>,
          },
          behavior: {
            fields: [
              {
                fieldId: 'record-name',
                name: 'name',
                label: 'Name',
                type: 'text',
              },
            ],
            cancelAction: {
              id: 'cancel-record',
              label: 'Cancel',
              onClick: vi.fn(),
            },
            submitAction: {
              id: 'submit-record',
              label: 'Create record',
              variant: 'primary',
              onClick: vi.fn(),
            },
          },
        }}
      />
    );

    expect(screen.getAllByText('Create record').length).toBeGreaterThan(0);
    expect(await screen.findByText('Cancel')).toBeInTheDocument();
    expect(screen.getByTestId('form-surface-action-dock')).toHaveAttribute('data-mode', 'fixed');
    const mobileField = document.querySelector('[data-part="field"]');
    expect(mobileField).toBeTruthy();
    expect(mobileField).not.toHaveStyle({ display: 'flex' });
    expect(screen.queryByText('Helpful aside')).not.toBeInTheDocument();
  });

  it('protects an explicit cancel while dirty and allows it after confirmation', async () => {
    const confirmDiscard = vi.fn(() => false);
    const onCancel = vi.fn();

    renderSurface(
      <FormSurface
        config={{
          ...buildConfig(),
          behavior: {
            ...buildConfig().behavior,
            dirtyState: {
              isDirty: true,
              confirmDiscard,
            },
            cancelAction: {
              id: 'cancel-record',
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

  it('keeps the mobile submit action disabled and rejects programmatic submit when the form is disabled', async () => {
    mockMatchMedia(390);
    const config = buildConfig();
    config.visual.mobileActionsSticky = true;
    config.behavior.disabled = true;
    config.behavior.cancelAction = {
      id: 'cancel-record',
      label: 'Cancel',
      onClick: vi.fn(),
    };

    const { container } = renderSurface(<FormSurface config={config} />);

    expect(await screen.findByTestId('form-surface-action-dock')).toHaveAttribute('data-mode', 'fixed');
    expect(screen.getByRole('button', { name: 'Create record' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).not.toBeDisabled();

    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    expect(config.behavior.submitAction.onClick).not.toHaveBeenCalled();
  });
});
