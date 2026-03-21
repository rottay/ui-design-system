/** @fileoverview FormSurface tests -- field rendering, aside layout, and action submission. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { FormSurface } from '.';
import type { FormSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';
import { mockMatchMedia } from '../../../_internal/testing/helpers/match-media';

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
    await import('../../primitives/inputs/Button/engines/rustic');
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
            fields: [],
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

    expect(await screen.findByRole('button', { name: /create record/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.queryByText('Helpful aside')).not.toBeInTheDocument();
  });
});
