/** @fileoverview AuditSurface tests -- log rendering, filters, and export actions. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuditSurface } from '..';
import type { AuditSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<AuditSurfaceConfig>): AuditSurfaceConfig {
  return {
    visual: {
      density: 'comfortable',
    },
    presentation: {
      chrome: {
        title: 'Audit Log',
        subtitle: 'System activity trail',
      },
    },
    behavior: {
      columns: [
        { key: 'action', label: 'Action' },
        { key: 'actor', label: 'Actor' },
        { key: 'resource', label: 'Resource' },
      ],
      entries: [
        {
          id: '1',
          timestamp: '2026-01-15 10:30:00',
          actor: 'admin@company.com',
          action: 'user.created',
          resource: 'User #42',
          severity: 'info',
          details: 'Created new user account',
        },
        {
          id: '2',
          timestamp: '2026-01-15 11:00:00',
          actor: 'system',
          action: 'breach.detected',
          resource: 'PHI Record #100',
          severity: 'critical',
        },
      ],
      filters: [
        {
          key: 'actor',
          label: 'Actor',
          type: 'text',
          placeholder: 'Search by actor...',
        },
      ],
      onExport: vi.fn(),
    },
    ...overrides,
  };
}

describe('AuditSurface', () => {
  it('renders page chrome, entries, and export buttons', async () => {
    const config = buildConfig();

    renderSurface(<AuditSurface config={config} />);

    expect(await screen.findByText('Audit Log')).toBeInTheDocument();
    expect(await screen.findByText('user.created')).toBeInTheDocument();
    expect(await screen.findByText('breach.detected')).toBeInTheDocument();
    expect(await screen.findByText(/admin@company\.com/)).toBeInTheDocument();

    const csvButton = (await screen.findByText('CSV')).closest('button');
    if (!csvButton) throw new Error('CSV export button not found');
    fireEvent.click(csvButton);
    expect(config.behavior.onExport).toHaveBeenCalledWith('csv');
  });

  it('renders empty state when there are no entries', async () => {
    const config = buildConfig({
      behavior: {
        ...buildConfig().behavior,
        entries: [],
      },
    });

    renderSurface(<AuditSurface config={config} />);

    expect(await screen.findByText('No audit entries')).toBeInTheDocument();
  });
});
