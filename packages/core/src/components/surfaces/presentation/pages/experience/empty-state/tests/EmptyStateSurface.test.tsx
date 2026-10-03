/** @fileoverview EmptyStateSurface tests -- action rendering and guidance content. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyStateSurface } from '..';
import type { EmptyStateSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface, RESOLVED_PHONE_TEST_CONTEXT } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<EmptyStateSurfaceConfig>): EmptyStateSurfaceConfig {
  return {
    visual: {},
    presentation: {
      title: 'No projects yet',
      description: 'Create your first project to get started.',
    },
    behavior: {
      primaryAction: {
        id: 'create-project',
        label: 'Create project',
        variant: 'primary',
        onClick: vi.fn(),
      },
      secondaryAction: {
        id: 'import-projects',
        label: 'Import projects',
        onClick: vi.fn(),
      },
    },
    access: undefined,
    ...overrides,
  };
}

describe('EmptyStateSurface', () => {
  it.each(['app-bar', 'bottom-bar', 'floating'] as const)(
    'resolves each action once and preserves callbacks with %s placement',
    async (placement) => {
      const primaryVisible = vi.fn(() => true);
      const secondaryVisible = vi.fn(() => true);
      const config = buildConfig();
      config.behavior.primaryAction!.visible = primaryVisible;
      config.behavior.secondaryAction!.visible = secondaryVisible;
      config.access = { mode: 'resolved', capabilities: [
        { kind: 'action', id: 'create-project', visible: true },
        { kind: 'action', id: 'import-projects', visible: true },
      ] };
      const postures = { phone: { primaryAction: placement } };
      const props = { config, postures };
      const view = renderSurface(<EmptyStateSurface {...props} />, {
        engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
      });
      const primary = await screen.findByRole('button', { name: 'Create project' });
      const secondary = screen.getByRole('button', { name: 'Import projects' });
      expect(screen.getAllByRole('button', { name: 'Create project' })).toHaveLength(1);
      const dock = primary.closest('[data-testid="action-dock"]');
      if (placement === 'app-bar') {
        expect(dock).toBeNull();
      } else {
        expect(dock).toHaveAttribute('data-mode', placement === 'floating' ? 'fixed' : 'sticky');
      }
      fireEvent.click(primary);
      fireEvent.click(secondary);
      expect(config.behavior.primaryAction!.onClick).toHaveBeenCalledTimes(1);
      expect(config.behavior.secondaryAction!.onClick).toHaveBeenCalledTimes(1);
      primaryVisible.mockClear();
      secondaryVisible.mockClear();
      view.rerender(<EmptyStateSurface {...props} />);
      expect(primaryVisible).toHaveBeenCalledTimes(1);
      expect(secondaryVisible).toHaveBeenCalledTimes(1);
    }
  );

  it('does not create a dock for an inaccessible primary action', async () => {
    const config = buildConfig({ access: { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'create-project', visible: false },
      { kind: 'action', id: 'import-projects', visible: true },
    ] } });
    const { container } = renderSurface(
      <EmptyStateSurface config={config} postures={{ phone: { primaryAction: 'floating' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );
    await screen.findByRole('button', { name: 'Import projects' });
    expect(screen.queryByRole('button', { name: 'Create project' })).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    expect(container.querySelector('[data-surface-region="primary-action"]')).toBeNull();
    expect(config.behavior.primaryAction!.onClick).not.toHaveBeenCalled();
  });

  it('preserves a resolved disabled primary without mutating or duplicating it', async () => {
    const config = buildConfig({ access: { mode: 'resolved', capabilities: [
      { kind: 'action', id: 'create-project', visible: true, disabled: true },
      { kind: 'action', id: 'import-projects', visible: true },
    ] } });
    renderSurface(
      <EmptyStateSurface config={config} postures={{ phone: { primaryAction: 'bottom-bar' } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );
    const primary = await screen.findByRole('button', { name: 'Create project' });
    expect(primary).toBeDisabled();
    expect(screen.getAllByRole('button', { name: 'Create project' })).toHaveLength(1);
    expect(config.behavior.primaryAction!.disabled).toBeUndefined();
    fireEvent.click(primary);
    expect(config.behavior.primaryAction!.onClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Import projects' }));
    expect(config.behavior.secondaryAction!.onClick).toHaveBeenCalledTimes(1);
  });

  it.each(['hide', 'collapse'] as const)('honors %s for the primary action without a dock', async (disposition) => {
    const config = buildConfig();
    const { container } = renderSurface(
      <EmptyStateSurface config={config} postures={{ phone: {
        primaryAction: 'floating', regions: { 'primary-action': disposition },
      } }} />,
      { engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT }
    );
    await screen.findByRole('button', { name: 'Import projects' });
    expect(screen.queryByRole('button', { name: 'Create project' })).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    const region = container.querySelector('[data-surface-region="primary-action"]');
    if (disposition === 'hide') expect(region).toBeNull();
    else {
      expect(region).toHaveAttribute('data-region-disposition', 'collapse');
      expect(region).toBeEmptyDOMElement();
    }
    expect(config.behavior.primaryAction!.onClick).not.toHaveBeenCalled();
  });

  it('keeps omitted postures on the existing action anatomy', async () => {
    const config = buildConfig();
    const { container } = renderSurface(<EmptyStateSurface config={config} />, {
      engine: 'modern', responsiveContext: RESOLVED_PHONE_TEST_CONTEXT,
    });
    const primary = await screen.findByRole('button', { name: 'Create project' });
    expect(container.querySelector('[data-testid="action-dock"]')).toBeNull();
    expect(container.querySelector('[data-surface-region]')).toBeNull();
    fireEvent.click(primary);
    expect(config.behavior.primaryAction!.onClick).toHaveBeenCalledTimes(1);
  });

  it('routes the primary action and applies the secondary action decision', async () => {
    const config = buildConfig({
      access: {
        mode: 'resolved',
        capabilities: [
          { kind: 'action', id: 'create-project', visible: true },
          { kind: 'action', id: 'import-projects', visible: false },
        ],
      },
    });

    renderSurface(<EmptyStateSurface config={config} />);

    fireEvent.click(await screen.findByRole('button', { name: /Create project/i }));

    await waitFor(() => {
      expect(config.behavior.primaryAction?.onClick).toHaveBeenCalledWith(undefined);
    });

    expect(screen.queryByRole('button', { name: /Import projects/i })).not.toBeInTheDocument();
  });
});
