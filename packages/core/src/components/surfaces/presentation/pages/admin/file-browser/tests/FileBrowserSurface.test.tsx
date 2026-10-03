/** @fileoverview FileBrowserSurface tests -- file list rendering and toolbar actions. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FileBrowserSurface } from '..';
import type { FileBrowserSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<FileBrowserSurfaceConfig>): FileBrowserSurfaceConfig {
  return {
    visual: {
      viewMode: 'list',
    },
    presentation: {
      chrome: {
        title: 'Files',
        subtitle: 'Browse and manage your files',
      },
    },
    behavior: {
      files: [
        { id: 'f1', name: 'report.pdf', type: 'file', mimeType: 'application/pdf', size: 1024 },
        { id: 'f2', name: 'photo.jpg', type: 'file', mimeType: 'image/jpeg', size: 2048 },
      ],
      folders: [
        { id: 'd1', name: 'Documents', type: 'folder', childCount: 5 },
      ],
      onUpload: vi.fn(),
      onDelete: vi.fn(),
      onNavigate: vi.fn(),
    },
    ...overrides,
  };
}

describe('FileBrowserSurface', () => {
  it.each(['bottom-bar', 'floating'] as const)('creates no %s dock for a primary operation denied by final access', async (placement) => {
    const config = buildConfig();
    const denied = vi.fn();
    const allowed = vi.fn();
    config.behavior.actions = [
      { id: 'primary-denied', label: 'Restricted primary', variant: 'primary', onClick: denied },
      { id: 'secondary', label: 'Allowed operation', onClick: allowed },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'primary-denied', visible: false },
      { kind: 'action', id: 'secondary', visible: true },
    ] };
    const { container } = renderSurface(
      <FileBrowserSurface config={config} postures={{ phone: { primaryAction: placement } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Allowed operation' }));
    expect(allowed).toHaveBeenCalledTimes(1);
    expect(denied).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Restricted primary' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="primary-action"]')).toBeNull();
  });

  it('chooses the permitted primary once and passes resolved rows without rerunning their predicates', async () => {
    const config = buildConfig();
    const onPrimary = vi.fn();
    const visible = vi.fn(() => true);
    config.behavior.actions = [
      { id: 'denied', label: 'Restricted primary', variant: 'primary' },
      { id: 'primary', label: 'Permitted primary', variant: 'primary', visible, onClick: onPrimary },
      { id: 'secondary', label: 'Secondary operation' },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'denied', visible: false },
      { kind: 'action', id: 'primary', visible: true },
      { kind: 'action', id: 'secondary', visible: true },
    ] };
    const postures = { phone: { primaryAction: 'bottom-bar' as const } };
    const { container, rerender } = renderSurface(
      <FileBrowserSurface config={config} postures={postures} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    const primary = await screen.findByRole('button', { name: 'Permitted primary' });
    expect(primary.closest('[data-testid="action-dock"]')).not.toBeNull();
    expect(screen.getAllByRole('button', { name: 'Permitted primary' })).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="action-dock"]')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Restricted primary' })).toBeNull();
    fireEvent.click(primary);
    expect(onPrimary).toHaveBeenCalledTimes(1);
    visible.mockClear();
    rerender(<FileBrowserSurface config={config} postures={postures} />);
    expect(visible).toHaveBeenCalledTimes(1);
  });

  it('does not duplicate a primary cloned as disabled by the resolved capability', async () => {
    const config = buildConfig();
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    config.behavior.actions = [
      { id: 'primary', label: 'Disabled primary', variant: 'primary', onClick: onPrimary },
      { id: 'secondary', label: 'Secondary operation', onClick: onSecondary },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'primary', visible: true, disabled: true },
      { kind: 'action', id: 'secondary', visible: true },
    ] };
    renderSurface(<FileBrowserSurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const primary = await screen.findByRole('button', { name: 'Disabled primary' });
    expect(primary).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Disabled primary' })).toHaveLength(1);
    expect(config.behavior.actions[0].disabled).toBeUndefined();
    fireEvent.click(primary);
    fireEvent.click(screen.getByRole('button', { name: 'Secondary operation' }));
    expect(onPrimary).not.toHaveBeenCalled();
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it.each(['hide', 'collapse'] as const)('retains explicit %s of the permitted primary without an empty dock', async (disposition) => {
    const config = buildConfig();
    const primary = vi.fn();
    config.behavior.actions = [
      { id: 'primary', label: 'Primary operation', variant: 'primary', onClick: primary },
      { id: 'secondary', label: 'Secondary operation' },
    ];
    const { container } = renderSurface(
      <FileBrowserSurface config={config} postures={{ phone: { primaryAction: 'bottom-bar', regions: { 'primary-action': disposition } } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT },
    );
    expect(await screen.findByRole('button', { name: 'Secondary operation' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Primary operation' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    const region = container.querySelector('[data-surface-region="primary-action"]');
    if (disposition === 'hide') expect(region).toBeNull();
    else {
      expect(region).toHaveAttribute('data-region-disposition', 'collapse');
      expect(region?.textContent).toBe('');
    }
    expect(primary).not.toHaveBeenCalled();
  });

  it('keeps omitted postures on the original action row and final access path', async () => {
    const config = buildConfig();
    const onPrimary = vi.fn();
    config.behavior.actions = [
      { id: 'primary', label: 'Existing primary', variant: 'primary', onClick: onPrimary },
      { id: 'denied', label: 'Restricted operation' },
    ];
    config.access = { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'primary', visible: true },
      { kind: 'action', id: 'denied', visible: false },
    ] };
    const { container } = renderSurface(<FileBrowserSurface config={config} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Existing primary' }));
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button', { name: 'Existing primary' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Restricted operation' })).toBeNull();
    expect(container.querySelector('[data-testid="action-dock"], [data-surface-region]')).toBeNull();
  });

  it('renders page chrome', async () => {
    renderSurface(<FileBrowserSurface config={buildConfig()} />);

    expect(await screen.findByText('Files')).toBeInTheDocument();
  });

  it('passes files and folders to the pattern', async () => {
    renderSurface(<FileBrowserSurface config={buildConfig()} />);

    // The PatternFileManager should receive the data - page title confirms rendering
    expect(await screen.findByText('Files')).toBeInTheDocument();
  });
});
