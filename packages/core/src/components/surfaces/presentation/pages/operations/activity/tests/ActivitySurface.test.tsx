/** @fileoverview ActivitySurface tests -- timeline rendering and pagination. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ActivitySurface } from '..';
import type { ActivitySurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<ActivitySurfaceConfig>): ActivitySurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Activity Log',
        subtitle: 'Recent actions across the platform',
      },
    },
    behavior: {
      activities: [
        {
          id: 'a1',
          user: { name: 'Alice' },
          action: 'Created document',
          timestamp: '2026-03-15T10:30:00Z',
          entityType: 'document',
        },
        {
          id: 'a2',
          user: { name: 'Bob' },
          action: 'Updated settings',
          timestamp: '2026-03-15T09:15:00Z',
          entityType: 'settings',
        },
      ],
      onActivityClick: vi.fn(),
    },
    ...overrides,
  };
}

describe('ActivitySurface', () => {
  it('keeps an explicit app-bar action in its existing chrome', async () => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Chrome operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <ActivitySurface config={config} postures={{ phone: { primaryAction: 'app-bar' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Chrome operation' });
    expect(action.closest('[data-part="header"]')).not.toBeNull();
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
      <ActivitySurface config={config} postures={{ phone: { primaryAction: 'floating', regions: { 'primary-action': disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    await screen.findByText('Activity Log');
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

  it.each([
      { placement: 'bottom-bar', error: undefined },
      { placement: 'floating', error: undefined },
      { placement: 'bottom-bar', error: new Error('Payload failure') },
      { placement: 'floating', error: new Error('Payload failure') },
    ] as const)('places $placement actions after the body with error=$error', async ({ placement, error }) => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Continue operation', variant: 'primary', onClick: callback }];
    const { container } = renderSurface(
      <ActivitySurface config={config} error={error} postures={{ phone: { primaryAction: placement } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const action = await screen.findByRole('button', { name: 'Continue operation' });
    const dock = action.closest('[data-testid="action-dock"]');
    expect(dock).toHaveAttribute('data-mode', placement === 'bottom-bar' ? 'sticky' : 'fixed');
    expect(action.closest('[data-part="header"], .ds-auth__form-panel')).toBeNull();
    expect(dock?.parentElement).toHaveClass('ds-page-shell-surface');
    expect(dock?.parentElement).toHaveAttribute('data-part', 'body');
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
    const { container } = renderSurface(<ActivitySurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    expect(await screen.findByText('Activity Log')).toBeInTheDocument();
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
    const { rerender } = renderSurface(<ActivitySurface config={config} postures={postures} />, {
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
    rerender(<ActivitySurface config={config} postures={postures} />);
    expect(visible).toHaveBeenCalledTimes(1);
  });

  it('keeps omitted postures on the existing action row without a dock', async () => {
    const config = buildConfig();
    const callback = vi.fn();
    config.behavior.actions = [{ id: 'continue', label: 'Existing operation', onClick: callback }];
    const { container } = renderSurface(<ActivitySurface config={config} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const action = await screen.findByRole('button', { name: 'Existing operation' });
    expect(action.closest('[data-part="header"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region]')).toBeNull();
    fireEvent.click(action);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it.each(['hide', 'collapse'] as const)('applies activity %s to errors without removing page chrome', async (disposition) => {
    const { container } = renderSurface(
      <ActivitySurface config={buildConfig()} error={new Error('Activity payload failure')} onRetry={vi.fn()} postures={{ phone: { regions: { activity: disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByText('Activity Log')).toBeInTheDocument();
    expect(screen.queryByText('Activity payload failure')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
    const activity = container.querySelector('[data-surface-region="activity"]');
    if (disposition === 'hide') expect(activity).toBeNull();
    else {
      expect(activity).toHaveAttribute('data-region-disposition', 'collapse');
      expect(activity?.textContent).toBe('');
    }
  });

  it('renders page chrome and activities', async () => {
    renderSurface(<ActivitySurface config={buildConfig()} />);

    expect(await screen.findByText('Activity Log')).toBeInTheDocument();
  });

  it('renders pagination when provided', async () => {
    const config = buildConfig({
      behavior: {
        activities: [
          { id: 'a1', user: { name: 'Alice' }, action: 'Created', timestamp: '2026-03-15' },
        ],
        pagination: { current: 1, total: 50, pageSize: 10, onChange: vi.fn() },
      },
    });

    renderSurface(<ActivitySurface config={config} />);

    expect(await screen.findByText(/Page 1/)).toBeInTheDocument();
    expect(await screen.findByText(/50 entries/)).toBeInTheDocument();
  });
});
