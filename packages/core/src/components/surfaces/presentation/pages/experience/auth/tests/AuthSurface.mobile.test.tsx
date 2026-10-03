/** @fileoverview AuthSurface mobile tests -- responsive stacking and hero collapse. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthSurface } from '..';
import type { AuthSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';
import { mockMatchMedia } from '@tests/support/browser/match-media';

function buildConfig(): AuthSurfaceConfig {
  return {
    visual: {
      layout: 'split',
    },
    presentation: {
      title: 'Sign in',
      subtitle: 'Access your workspace',
      form: <div>Auth form</div>,
      hero: <div>Hero content</div>,
    },
    behavior: {},
  };
}

describe('AuthSurface responsive layout', () => {
  it('keeps an explicit app-bar action in its existing chrome', async () => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Chrome operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <AuthSurface config={config} postures={{ phone: { primaryAction: 'app-bar' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Chrome operation' });
    expect(action.closest('.ds-auth__form-panel')).not.toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    expect(action.closest('[data-surface-region="primary-action"]')).not.toBeNull();
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['hide', 'collapse'] as const)('honors primary-action %s without leaving a dock', async (disposition) => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Hidden operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <AuthSurface config={config} postures={{ phone: { primaryAction: 'floating', regions: { 'primary-action': disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    await screen.findByText('Sign in');
    expect(screen.queryByRole('button', { name: 'Hidden operation' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    const region = container.querySelector('[data-surface-region="primary-action"]');
    if (disposition === 'hide') expect(region).toBeNull();
    else {
      expect(region).toHaveAttribute('data-region-disposition', 'collapse');
      expect(region).toBeEmptyDOMElement();
    }
    expect(callback).not.toHaveBeenCalled();
  });

  it.each(['bottom-bar', 'floating'] as const)('places %s actions after the auth body without confining the dock to its form card', async (placement) => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Continue operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <AuthSurface config={config} postures={{ phone: { primaryAction: placement } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Continue operation' });
    const dock = action.closest('[data-testid="action-dock"]');
    expect(dock).toHaveAttribute('data-mode', placement === 'bottom-bar' ? 'sticky' : 'fixed');
    expect(action.closest('[data-part="header"], .ds-auth__form-panel')).toBeNull();
    expect(dock?.parentElement).toHaveClass('ds-auth__container');
    expect(dock?.parentElement?.lastElementChild).toBe(dock);
    expect(container.querySelectorAll('[data-testid="action-dock"]')).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Continue operation' })).toHaveLength(1);
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['absent', 'denied'] as const)('creates no dock when its actions are %s', async (state) => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = state === 'absent' ? undefined : [
      { id: 'denied', label: 'Restricted operation', variant: 'primary', onClick: callback },
    ];
    config.access = { mode: 'resolved', capabilities: [{ kind: 'action', id: 'denied', visible: false }] };
    const { container } = renderSurface(<AuthSurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    expect(await screen.findByText('Sign in')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region="primary-action"]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Restricted operation' })).toBeNull();
    expect(callback).not.toHaveBeenCalled();
  });

  it('uses resolved disabled rows without duplicate controls or predicate re-evaluation', async () => {
    const config = buildConfig();
    const visible = vi.fn(() => true);
    const blocked = vi.fn();
    const allowed = vi.fn();
    config.behavior.actions = [
      { id: 'disabled', label: 'Disabled operation', variant: 'primary', visible, onClick: blocked },
      { id: 'allowed', label: 'Allowed operation', onClick: allowed },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'disabled', visible: true, disabled: true },
      { kind: 'action', id: 'allowed', visible: true },
    ] };
    const postures = { phone: { primaryAction: 'bottom-bar' as const } };
    const { rerender } = renderSurface(<AuthSurface config={config} postures={postures} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const disabled = await screen.findByRole('button', { name: 'Disabled operation' });
    expect(disabled).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Disabled operation' })).toHaveLength(1);
    expect(config.behavior.actions[0].disabled).toBeUndefined();
    fireEvent.click(disabled);
    fireEvent.click(screen.getByRole('button', { name: 'Allowed operation' }));
    expect(blocked).not.toHaveBeenCalled();
    expect(allowed).toHaveBeenCalledTimes(1);
    visible.mockClear();
    rerender(<AuthSurface config={config} postures={postures} />);
    expect(visible).toHaveBeenCalledTimes(1);
  });

  it('keeps omitted postures on the existing action row without a dock', async () => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Existing operation', onClick: callback }];
    const { container } = renderSurface(<AuthSurface config={config} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const action = await screen.findByRole('button', { name: 'Existing operation' });
    expect(action.closest('.ds-auth__form-panel')).not.toBeNull();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region]')).toBeNull();
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['hide', 'collapse'] as const)('applies form-panel %s to errors', async (disposition) => {
    const { container } = renderSurface(
      <AuthSurface config={buildConfig()} error={new Error('Auth payload failure')} onRetry={vi.fn()} postures={{ phone: { regions: { 'form-panel': disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByText('Hero content')).toBeInTheDocument();
    expect(screen.queryByText('Auth payload failure')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    const panel = container.querySelector('[data-surface-region="form-panel"]');
    if (disposition === 'hide') expect(panel).toBeNull();
    else {
      expect(panel).toHaveAttribute('data-region-disposition', 'collapse');
      expect(panel?.textContent).toBe('');
    }
  });

  it.each([
    { loading: true, disposition: 'hide' },
    { loading: true, disposition: 'collapse' },
    { loading: false, disposition: 'hide' },
    { loading: false, disposition: 'collapse' },
  ] as const)('applies form $disposition with loading=$loading', async ({ loading, disposition }) => {
    const { container } = renderSurface(
      <AuthSurface config={buildConfig()} loading={loading} postures={{ phone: { regions: { form: disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByText('Sign in')).toBeInTheDocument();
    expect(screen.queryByText('Auth form')).toBeNull();
    expect(container.querySelector('[data-part="auth-skeleton-field"], [data-part="auth-skeleton-cta"]')).toBeNull();
    const form = container.querySelector('[data-surface-region="form"]');
    if (disposition === 'hide') expect(form).toBeNull();
    else {
      expect(form).toHaveAttribute('data-region-disposition', 'collapse');
      expect(form?.textContent).toBe('');
    }
  });

  it('keeps the hero visible when the split layout stacks on mobile', async () => {
    mockMatchMedia(375);

    renderSurface(<AuthSurface config={buildConfig()} />);

    expect(await screen.findByText('Hero content')).toBeInTheDocument();
    expect(await screen.findByText('Auth form')).toBeInTheDocument();
  });

  it('prefers the mobile hero when one is provided', async () => {
    mockMatchMedia(375);

    const config = buildConfig();
    config.presentation.mobileHero = <div>Mobile hero summary</div>;

    renderSurface(<AuthSurface config={config} />);

    expect(await screen.findByText('Mobile hero summary')).toBeInTheDocument();
    expect(screen.queryByText('Hero content')).not.toBeInTheDocument();
  });
});
