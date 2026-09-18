/**
 * DetailFormSurface cut test -- the DOM contract the anatomy-keyed cut pins:
 * both root shapes keep their stamps, the error banner is a ruled alert (no
 * composed card frame), and the dirty-cancel guard keeps its locale floor.
 *
 * Paint-contract cases render the real Modern engine through `renderWithEngine`
 * (the lazy engine chunks resolve after the first microtask, so the assertions
 * wait); the locale floor is behaviour, not paint, and rides the rustic-pinned
 * `renderSurface` like the pre-cut suites.
 */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DetailFormSurface } from '..';
import type { DetailFormSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { renderWithEngine } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';

function buildConfig(overrides?: Partial<DetailFormSurfaceConfig>): DetailFormSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Edit workspace',
      },
      error: 'The workspace could not be saved.',
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
    ...overrides,
  };
}

describe('DetailFormSurface cut', () => {
  beforeEach(() => {
    mockMatchMedia(1280);
  });

  it('stamps the split root with the loading contract', async () => {
    const { container } = renderWithEngine(<DetailFormSurface config={buildConfig()} loading />, 'modern');

    await waitFor(() => expect(container.querySelector('.ds-detail-form[data-part="root"]')).not.toBeNull());
    const root = container.querySelector('.ds-detail-form[data-part="root"]');
    expect(root).toHaveAttribute('data-mobile', 'false');
    expect(root).toHaveAttribute('data-stacked', 'false');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });

  it('stamps the stacked root when no summary content exists', async () => {
    const config = buildConfig();
    const { container } = renderWithEngine(
      <DetailFormSurface
        config={{
          ...config,
          presentation: { ...config.presentation, summary: undefined },
        }}
      />,
      'modern'
    );

    await waitFor(() =>
      expect(container.querySelector('.ds-detail-form--stacked[data-part="root"]')).not.toBeNull()
    );
    const root = container.querySelector('.ds-detail-form--stacked[data-part="root"]');
    expect(root).toHaveAttribute('data-stacked', 'true');
  });

  it('renders the error banner as a ruled alert without a composed card frame', async () => {
    const { container } = renderWithEngine(<DetailFormSurface config={buildConfig()} />, 'modern');

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveAttribute('data-part', 'error-banner');
    expect(banner).toHaveTextContent('The workspace could not be saved.');
    // The retired card frame: no composed Card root inside the banner.
    expect(banner.querySelector('.ds-detail-form__error-card')).toBeNull();
    expect(banner.querySelector('.ds-card')).toBeNull();
    expect(container.querySelector('[data-part="error-banner"] .ds-card')).toBeNull();
  });

  it('keeps the dirty-cancel guard on its French locale floor', async () => {
    const confirmDiscard = vi.fn(() => false);
    const onCancel = vi.fn();

    renderSurface(
      <DetailFormSurface
        config={{
          ...buildConfig(),
          behavior: {
            ...buildConfig().behavior,
            dirtyState: { isDirty: true, confirmDiscard },
            cancelAction: { id: 'cancel-edit', label: 'Cancel', onClick: onCancel },
          },
        }}
      />,
      { tenantOverrides: { locale: 'fr' } }
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(confirmDiscard).toHaveBeenCalledWith(
      'Ignorer les modifications non enregistrées du formulaire ?',
      'cancel'
    );
    expect(onCancel).not.toHaveBeenCalled();
  });
});
