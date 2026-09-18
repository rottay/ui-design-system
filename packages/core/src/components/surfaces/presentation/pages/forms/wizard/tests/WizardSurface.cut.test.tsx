/**
 * WizardSurface cut test -- the DOM contract the anatomy-keyed cut pins:
 * every stamped part survives, the error banner is a ruled alert (no composed
 * card frame), and the dirty-cancel guard keeps its locale floor.
 *
 * Paint-contract cases render the real Modern engine through `renderWithEngine`
 * (the lazy engine chunks resolve after the first microtask, so the assertions
 * wait); the locale floor is behaviour, not paint, and rides the rustic-pinned
 * `renderSurface` like the pre-cut suites.
 */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WizardSurface } from '..';
import type { WizardSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { renderWithEngine } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';

function buildConfig(overrides?: Partial<WizardSurfaceConfig>): WizardSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Setup flow',
      },
      description: 'Work through the setup steps.',
      error: 'The setup could not be validated.',
    },
    behavior: {
      steps: [
        {
          key: 'review',
          title: 'Review',
          content: <div>Review the setup</div>,
        },
      ],
      submitAction: {
        id: 'complete-setup',
        label: 'Complete setup',
        variant: 'primary',
        onClick: vi.fn(),
      },
    },
    ...overrides,
  };
}

describe('WizardSurface cut', () => {
  beforeEach(() => {
    mockMatchMedia(1280);
  });

  it('stamps the full anatomy on the surface root and its regions', async () => {
    const { container } = renderWithEngine(<WizardSurface config={buildConfig()} />, 'modern');

    await waitFor(() => expect(container.querySelector('.ds-wizard[data-part="root"]')).not.toBeNull());
    const root = container.querySelector('.ds-wizard[data-part="root"]');
    expect(root).toHaveAttribute('data-mobile', 'false');
    expect(root).toHaveAttribute('data-stacked', 'false');
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).not.toHaveAttribute('aria-busy');

    expect(container.querySelector('.ds-wizard [data-part="description"]')).not.toBeNull();
  });

  it('stamps the loading contract on the root that survives', async () => {
    const { container } = renderWithEngine(<WizardSurface config={buildConfig()} loading />, 'modern');

    await waitFor(() => expect(container.querySelector('.ds-wizard[data-part="root"]')).not.toBeNull());
    const root = container.querySelector('.ds-wizard[data-part="root"]');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });

  it('renders the error banner as a ruled alert without a composed card frame', async () => {
    const { container } = renderWithEngine(<WizardSurface config={buildConfig()} />, 'modern');

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveAttribute('data-part', 'error-banner');
    expect(banner).toHaveTextContent('The setup could not be validated.');
    // The retired card frame: no composed Card root inside the banner.
    expect(banner.querySelector('.ds-wizard__error-card')).toBeNull();
    expect(banner.querySelector('.ds-card')).toBeNull();
    expect(container.querySelector('[data-part="error-banner"] .ds-card')).toBeNull();
  });

  it('keeps the dirty-cancel guard on its Spanish locale floor', async () => {
    const confirmDiscard = vi.fn(() => false);
    const onCancel = vi.fn();

    renderSurface(
      <WizardSurface
        config={buildConfig({
          behavior: {
            ...buildConfig().behavior,
            dirtyState: { isDirty: true, confirmDiscard },
            cancelAction: { id: 'cancel-setup', label: 'Cancel', onClick: onCancel },
          },
        })}
      />,
      { tenantOverrides: { locale: 'es' } }
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(confirmDiscard).toHaveBeenCalledWith(
      '¿Descartar los cambios sin guardar del asistente?',
      'cancel'
    );
    expect(onCancel).not.toHaveBeenCalled();
  });
});
