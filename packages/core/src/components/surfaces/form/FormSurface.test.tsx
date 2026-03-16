/** @fileoverview FormSurface tests -- field rendering, aside layout, and action submission. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { FormSurface } from '.';
import type { FormSurfaceConfig } from '../types';
import { renderSurface } from '../common/test-utils';

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
});
