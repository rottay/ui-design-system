/**
 * FormSurface cut test -- the DOM contract the anatomy-keyed cut pins:
 * every stamped part survives, the drained action-rail gap no longer rides
 * the Flex, the error banner is a ruled alert (no composed card frame), and
 * the dirty-cancel guard keeps its locale floor.
 *
 * Paint-contract cases render the real Modern engine through `renderWithEngine`
 * (the lazy engine chunks resolve after the first microtask, so the assertions
 * wait); the locale floor is behaviour, not paint, and rides the rustic-pinned
 * `renderSurface` like the pre-cut suites.
 */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormSurface } from '..';
import type { FormSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { renderWithEngine } from '@tests/support/engine';
import { mockMatchMedia } from '@tests/support/browser/match-media';

function buildConfig(overrides?: Partial<FormSurfaceConfig>): FormSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Create record',
      },
      description: 'Name the record before assigning it.',
      error: 'The record could not be drafted.',
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
    ...overrides,
  };
}

describe('FormSurface cut', () => {
  beforeEach(() => {
    mockMatchMedia(1280);
  });

  it('stamps the full anatomy on the surface root and its regions', async () => {
    const { container } = renderWithEngine(<FormSurface config={buildConfig()} />, 'modern');

    await waitFor(() => expect(container.querySelector('.ds-form-surface[data-part="root"]')).not.toBeNull());
    const root = container.querySelector('.ds-form-surface[data-part="root"]');
    expect(root).toHaveAttribute('data-mobile', 'false');
    expect(root).toHaveAttribute('data-stacked', 'false');
    expect(root).toHaveAttribute('data-loading', 'false');
    expect(root).not.toHaveAttribute('aria-busy');

    expect(container.querySelector('[data-part="description"]')).not.toBeNull();
    expect(container.querySelector('.ds-form-surface [data-part="actions"]')).not.toBeNull();
  });

  it('stamps the loading contract on the root that survives', async () => {
    const { container } = renderWithEngine(<FormSurface config={buildConfig()} loading />, 'modern');

    await waitFor(() => expect(container.querySelector('.ds-form-surface[data-part="root"]')).not.toBeNull());
    const root = container.querySelector('.ds-form-surface[data-part="root"]');
    expect(root).toHaveAttribute('data-loading', 'true');
    expect(root).toHaveAttribute('aria-busy', 'true');
  });

  it('renders the error banner as a ruled alert without a composed card frame', async () => {
    const { container } = renderWithEngine(<FormSurface config={buildConfig()} />, 'modern');

    const banner = await screen.findByRole('alert');
    expect(banner).toHaveAttribute('data-part', 'error-banner');
    expect(banner).toHaveTextContent('The record could not be drafted.');
    // The retired card frame: no composed Card root inside the banner.
    expect(banner.querySelector('.ds-form-surface__error-card')).toBeNull();
    expect(banner.querySelector('.ds-card')).toBeNull();
    expect(container.querySelector('[data-part="error-banner"] .ds-card')).toBeNull();
  });

  it('owns the action rail gap in the skin, not in a drained Flex prop', async () => {
    const { container } = renderWithEngine(<FormSurface config={buildConfig()} />, 'modern');

    await waitFor(() => expect(container.querySelector('[data-part="actions"]')).not.toBeNull());
    const actions = container.querySelector<HTMLElement>('[data-part="actions"]');
    expect(actions).not.toBeNull();
    // A numeric `gap` prop would stamp `data-gap` and an inline `--ds-flex-gap`;
    // the drain removes both — the skin channel is the only authority left.
    expect(actions).not.toHaveAttribute('data-gap');
    expect(actions?.style.getPropertyValue('--ds-flex-gap')).toBe('');
  });

  it('keeps the dirty-cancel guard on its French locale floor', async () => {
    const confirmDiscard = vi.fn(() => false);
    const onCancel = vi.fn();

    renderSurface(
      <FormSurface
        config={buildConfig({
          behavior: {
            ...buildConfig().behavior,
            dirtyState: { isDirty: true, confirmDiscard },
            cancelAction: { id: 'cancel-record', label: 'Cancel', onClick: onCancel },
          },
        })}
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
