/** @fileoverview ImportExportSurface tests -- import flow, export field selection, and history. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ImportExportSurface } from '.';
import type { ImportExportSurfaceConfig } from '../../../foundation/types';
import { renderSurface } from '../common/test-utils';

function buildConfig(overrides?: Partial<ImportExportSurfaceConfig>): ImportExportSurfaceConfig {
  return {
    visual: {},
    presentation: {
      chrome: {
        title: 'Import / Export',
        subtitle: 'Bulk data operations',
      },
    },
    behavior: {
      mode: 'both',
      importConfig: {
        acceptedFormats: ['.csv', '.xlsx'],
        templateUrl: '/templates/import.csv',
        onUpload: vi.fn().mockResolvedValue({
          success: true,
          totalRows: 100,
          validRows: 95,
          errorRows: 5,
          errors: [
            { row: 3, field: 'email', message: 'Invalid email format' },
          ],
          detectedMappings: [
            { sourceField: 'name', targetField: 'fullName' },
          ],
        }),
        onConfirm: vi.fn().mockResolvedValue(undefined),
      },
      exportConfig: {
        formats: ['csv', 'json', 'xlsx'],
        fields: [
          { key: 'name', label: 'Name', selected: true },
          { key: 'email', label: 'Email', selected: true },
          { key: 'phone', label: 'Phone', selected: false },
        ],
        onExport: vi.fn().mockResolvedValue('/downloads/export.csv'),
      },
      history: [
        { id: 'h1', type: 'import', date: '2026-01-10', status: 'completed', recordCount: 250 },
        { id: 'h2', type: 'export', date: '2026-01-09', status: 'completed', recordCount: 1200 },
      ],
    },
    ...overrides,
  };
}

describe('ImportExportSurface', () => {
  it('renders import panel, export panel, and history', async () => {
    renderSurface(<ImportExportSurface config={buildConfig()} />);

    expect(await screen.findByText('Import / Export')).toBeInTheDocument();
    expect(screen.getByText('Import Data')).toBeInTheDocument();
    expect(screen.getByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText(/Accepted formats:\s*\.csv, \.xlsx/)).toBeInTheDocument();
    expect(screen.getByText('250 records')).toBeInTheDocument();
  });

  it('renders export panel with format selection and field checkboxes', async () => {
    renderSurface(<ImportExportSurface config={buildConfig()} />);

    expect(await screen.findByText('Export Data')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('XLSX')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /name/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /phone/i })).toBeInTheDocument();
  });

  it('renders only import panel when mode is import', async () => {
    const config = buildConfig({
      behavior: {
        ...buildConfig().behavior,
        mode: 'import',
      },
    });

    renderSurface(<ImportExportSurface config={config} />);

    expect(await screen.findByText('Import Data')).toBeInTheDocument();
    expect(screen.queryByText('Export Data')).not.toBeInTheDocument();
  });
});
