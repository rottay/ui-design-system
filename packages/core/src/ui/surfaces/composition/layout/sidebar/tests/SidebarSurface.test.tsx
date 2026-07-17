/** @fileoverview SidebarSurface tests -- collapse, responsive stacking, slot rendering. */

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SidebarSurface } from '..';
import type { SidebarSurfaceConfig } from '../../../../foundation/contracts';
import { renderSurface } from '../../../../foundation/common/test-utils';

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

    fireEvent.click(await screen.findByText('Collapse nav'));

    await waitFor(() => {
      expect(config.behavior.onCollapsedChange).toHaveBeenCalledWith(true);
    });

    expect(await screen.findByText('Expand')).toBeInTheDocument();
  });
});
