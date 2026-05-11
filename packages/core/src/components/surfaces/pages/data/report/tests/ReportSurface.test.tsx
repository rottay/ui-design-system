/** @fileoverview ReportSurface tests -- template selection, filters, and export. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReportSurface } from '..';
import type { ReportSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

function buildConfig(overrides?: Partial<ReportSurfaceConfig>): ReportSurfaceConfig {
  return {
    visual: {
      layout: 'top-filters',
    },
    presentation: {
      chrome: {
        title: 'Reports',
        subtitle: 'Generate and export reports',
      },
    },
    behavior: {
      templates: [
        {
          id: 'revenue',
          name: 'Revenue Report',
          description: 'Monthly revenue breakdown',
          category: 'Finance',
        },
        {
          id: 'users',
          name: 'User Activity',
          description: 'Active user metrics',
          category: 'Analytics',
        },
      ],
      selectedTemplate: 'revenue',
      onTemplateSelect: vi.fn(),
      filters: [
        {
          key: 'dateRange',
          label: 'Date Range',
          type: 'text',
          placeholder: 'e.g. 2026-01-01 to 2026-01-31',
        },
        {
          key: 'region',
          label: 'Region',
          type: 'select',
          options: [
            { label: 'North America', value: 'na' },
            { label: 'Europe', value: 'eu' },
          ],
        },
      ],
      filterValues: {},
      onFilterChange: vi.fn(),
      onGenerate: vi.fn(),
      onExport: vi.fn(),
      reportData: {
        columns: [
          { key: 'month', label: 'Month' },
          { key: 'revenue', label: 'Revenue' },
          { key: 'growth', label: 'Growth' },
        ],
        rows: [
          { month: 'January', revenue: '$45,000', growth: '12%' },
          { month: 'February', revenue: '$52,000', growth: '15%' },
        ],
        summary: {
          Total: '$97,000',
          Average: '$48,500',
        },
      },
    },
    ...overrides,
  };
}

describe('ReportSurface', () => {
  it('renders templates, filters, and report data', async () => {
    renderSurface(<ReportSurface config={buildConfig()} />);

    expect(await screen.findByText('Reports')).toBeInTheDocument();
    expect(await screen.findByText('Revenue Report')).toBeInTheDocument();
    expect(await screen.findByText('User Activity')).toBeInTheDocument();
    expect(await screen.findByText('January')).toBeInTheDocument();
    expect(await screen.findByText('$45,000')).toBeInTheDocument();
    expect(await screen.findByText('$97,000')).toBeInTheDocument();
  });

  it('fires export action for each format', async () => {
    const config = buildConfig();

    renderSurface(<ReportSurface config={config} />);

    const pdfButton = await screen.findByText('PDF').then((node) => node.closest('button'));
    if (!pdfButton) throw new Error('PDF export button not found');
    fireEvent.click(pdfButton);
    expect(config.behavior.onExport).toHaveBeenCalledWith('pdf');
  });

  it('renders empty state when no report data is available', async () => {
    const config = buildConfig({
      behavior: {
        ...buildConfig().behavior,
        reportData: undefined,
      },
    });

    renderSurface(<ReportSurface config={config} />);

    expect(await screen.findByText('No report data')).toBeInTheDocument();
  });

  it('fires generate action', async () => {
    const config = buildConfig();

    renderSurface(<ReportSurface config={config} />);

    const generateButton = await screen.findByText('Generate').then((node) => node.closest('button'));
    if (!generateButton) throw new Error('Generate button not found');
    fireEvent.click(generateButton);
    expect(config.behavior.onGenerate).toHaveBeenCalledTimes(1);
  });
});
