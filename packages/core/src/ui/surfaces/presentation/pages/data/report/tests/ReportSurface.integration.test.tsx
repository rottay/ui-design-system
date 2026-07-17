/** @fileoverview ReportSurface integration tests -- data generation and chart rendering. */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ReportSurface } from '..';
import type { ReportSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';

function findButtonForText(element: HTMLElement): HTMLButtonElement {
  const button = element.closest('button');
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Expected "${element.textContent ?? ''}" to be rendered inside a button`);
  }
  return button;
}

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
        {
          id: 'compliance',
          name: 'Compliance Audit',
          description: 'Regulatory compliance status',
          category: 'Legal',
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
            { label: 'Asia Pacific', value: 'apac' },
          ],
        },
        {
          key: 'minAmount',
          label: 'Min Amount',
          type: 'number',
          placeholder: '0',
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
          { key: 'profit', label: 'Profit' },
        ],
        rows: [
          { month: 'January', revenue: '$45,000', growth: '12%', profit: '$15,000' },
          { month: 'February', revenue: '$52,000', growth: '15%', profit: '$18,000' },
          { month: 'March', revenue: '$48,000', growth: '-8%', profit: '$16,000' },
        ],
        summary: {
          Total: '$145,000',
          Average: '$48,333',
          'Best Month': 'February',
        },
      },
    },
    ...overrides,
  };
}

describe('ReportSurface integration', () => {
  describe('template selection', () => {
    it('renders all available templates', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('Revenue Report')).toBeInTheDocument();
      expect(await screen.findByText('User Activity')).toBeInTheDocument();
      expect(await screen.findByText('Compliance Audit')).toBeInTheDocument();
    });

    it('renders template descriptions', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('Monthly revenue breakdown')).toBeInTheDocument();
      expect(await screen.findByText('Active user metrics')).toBeInTheDocument();
      expect(await screen.findByText('Regulatory compliance status')).toBeInTheDocument();
    });

    it('renders template categories', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('Finance')).toBeInTheDocument();
      expect(await screen.findByText('Analytics')).toBeInTheDocument();
      expect(await screen.findByText('Legal')).toBeInTheDocument();
    });

    it('fires onTemplateSelect when clicking a template', async () => {
      const config = buildConfig();
      renderSurface(<ReportSurface config={config} />);

      const userActivity = await screen.findByText('User Activity');
      // Click the parent clickable card
      fireEvent.click(userActivity);

      expect(config.behavior.onTemplateSelect).toHaveBeenCalledWith('users');
    });
  });

  describe('filter rendering', () => {
    it('renders all filter labels', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('Date Range')).toBeInTheDocument();
      expect(await screen.findByText('Region')).toBeInTheDocument();
      expect(await screen.findByText('Min Amount')).toBeInTheDocument();
    });

    it('renders no filters section when filters array is empty', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          filters: [],
        },
      });

      renderSurface(<ReportSurface config={config} />);

      expect(await screen.findByText('Revenue Report')).toBeInTheDocument();
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });
  });

  describe('generate callback', () => {
    it('fires generate action on button click', async () => {
      const config = buildConfig();
      renderSurface(<ReportSurface config={config} />);

      const generateLabel = await screen.findByText('Generate');
      fireEvent.click(findButtonForText(generateLabel));
      expect(config.behavior.onGenerate).toHaveBeenCalledTimes(1);
    });

    it('does not render generate button when onGenerate is not provided', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          onGenerate: undefined,
        },
      });

      renderSurface(<ReportSurface config={config} />);

      expect(await screen.findByText('Revenue Report')).toBeInTheDocument();
      expect(screen.queryByText('Generate')).not.toBeInTheDocument();
    });
  });

  describe('report data rendering', () => {
    it('renders column headers', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('Month')).toBeInTheDocument();
      expect(await screen.findByText('Revenue')).toBeInTheDocument();
      expect(await screen.findByText('Growth')).toBeInTheDocument();
      expect(await screen.findByText('Profit')).toBeInTheDocument();
    });

    it('renders all data rows', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('January')).toBeInTheDocument();
      // "February" appears in both a data row and the summary
      const febElements = await screen.findAllByText('February');
      expect(febElements.length).toBeGreaterThanOrEqual(1);
      expect(await screen.findByText('March')).toBeInTheDocument();
      expect(await screen.findByText('$45,000')).toBeInTheDocument();
      expect(await screen.findByText('$52,000')).toBeInTheDocument();
      expect(await screen.findByText('$48,000')).toBeInTheDocument();
    });

    it('renders summary values', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('$145,000')).toBeInTheDocument();
      expect(await screen.findByText('$48,333')).toBeInTheDocument();
      // "February" appears in both the data row and summary -- use findAll
      const febElements = await screen.findAllByText('February');
      expect(febElements.length).toBeGreaterThanOrEqual(2);
    });

    it('renders summary labels', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('Total')).toBeInTheDocument();
      expect(await screen.findByText('Average')).toBeInTheDocument();
      expect(await screen.findByText('Best Month')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
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

    it('renders generating state', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          generating: true,
          reportData: undefined,
        },
      });

      renderSurface(<ReportSurface config={config} />);

      expect(await screen.findByText('Generating report...')).toBeInTheDocument();
    });
  });

  describe('export actions', () => {
    it('fires export callback for PDF format', async () => {
      const config = buildConfig();
      renderSurface(<ReportSurface config={config} />);

      const pdfLabel = await screen.findByText('PDF');
      fireEvent.click(findButtonForText(pdfLabel));
      expect(config.behavior.onExport).toHaveBeenCalledWith('pdf');
    });

    it('fires export callback for Excel format', async () => {
      const config = buildConfig();
      renderSurface(<ReportSurface config={config} />);

      const excelLabel = await screen.findByText('EXCEL');
      fireEvent.click(findButtonForText(excelLabel));
      expect(config.behavior.onExport).toHaveBeenCalledWith('excel');
    });

    it('fires export callback for CSV format', async () => {
      const config = buildConfig();
      renderSurface(<ReportSurface config={config} />);

      const csvLabel = await screen.findByText('CSV');
      fireEvent.click(findButtonForText(csvLabel));
      expect(config.behavior.onExport).toHaveBeenCalledWith('csv');
    });

    it('does not render export buttons when onExport is not provided', async () => {
      const config = buildConfig({
        behavior: {
          ...buildConfig().behavior,
          onExport: undefined,
        },
      });

      renderSurface(<ReportSurface config={config} />);

      expect(await screen.findByText('Revenue Report')).toBeInTheDocument();
      expect(screen.queryByText('PDF')).not.toBeInTheDocument();
      expect(screen.queryByText('EXCEL')).not.toBeInTheDocument();
      expect(screen.queryByText('CSV')).not.toBeInTheDocument();
    });
  });

  describe('chrome and layout', () => {
    it('renders the chrome title', async () => {
      renderSurface(<ReportSurface config={buildConfig()} />);

      expect(await screen.findByText('Reports')).toBeInTheDocument();
    });

    it('renders in sidebar-filters layout without error', async () => {
      const config = buildConfig({
        visual: { layout: 'sidebar-filters' },
      });

      renderSurface(<ReportSurface config={config} />);

      expect(await screen.findByText('Revenue Report')).toBeInTheDocument();
    });
  });
});
