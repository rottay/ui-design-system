import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarSurface } from '../sidebar';
import type { SidebarSurfaceConfig } from '../types';
import { renderSurface } from './test-utils';

function buildConfig(): SidebarSurfaceConfig {
  return {
    visual: {
      collapsible: true,
    },
    presentation: {
      sidebar: <div>Workspace nav</div>,
      content: <div>Main content</div>,
    },
    behavior: {
      onCollapsedChange: vi.fn(),
      toggleLabel: 'Collapse nav',
    },
  };
}

describe('SidebarSurface', () => {
  it('toggles collapse state and forwards collapse changes', async () => {
    const config = buildConfig();

    renderSurface(<SidebarSurface config={config} />);

    fireEvent.click(await screen.findByRole('button', { name: /Collapse nav/i }));

    await waitFor(() => {
      expect(config.behavior.onCollapsedChange).toHaveBeenCalledWith(true);
    });

    expect(await screen.findByRole('button', { name: /Expand/i })).toBeInTheDocument();
  });
});
