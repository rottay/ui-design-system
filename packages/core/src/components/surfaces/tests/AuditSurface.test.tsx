import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuditSurface } from '../audit';
import type { AuditSurfaceConfig } from '../types';
import { renderSurface } from './test-utils';

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
    expect(screen.getByText('user.created')).toBeInTheDocument();
    expect(screen.getByText('breach.detected')).toBeInTheDocument();
    expect(screen.getByText(/admin@company\.com/)).toBeInTheDocument();
    expect(screen.getByText('Created new user account')).toBeInTheDocument();

    const csvButton = screen.getByRole('button', { name: /csv/i });
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
