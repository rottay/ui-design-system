/** @fileoverview ReportSurface Storybook stories. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ReportSurface } from '.';
import { Text, Flex, Stack } from '../../../../primitives';
import { createSurfaceStoryDecorator } from '../../../foundation/common/story-helpers';

const meta: Meta<typeof ReportSurface> = {
  title: 'Surfaces/ReportSurface',
  component: ReportSurface,
  decorators: [
    createSurfaceStoryDecorator({
      productProfile: 'events.organizer',
      engine: 'rustic',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Report builder surface with template selection, configurable filters, data ' +
          'generation, chart rendering, and export capabilities.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ReportSurface>;

const sampleTemplates = [
  { id: 'revenue', name: 'Revenue Report', description: 'Monthly revenue breakdown by source', category: 'Finance' },
  { id: 'users', name: 'User Growth', description: 'User registration and activity metrics', category: 'Analytics' },
  { id: 'compliance', name: 'Compliance Audit', description: 'Regulatory compliance status summary', category: 'Compliance' },
  { id: 'events', name: 'Event Performance', description: 'Attendance and engagement metrics', category: 'Analytics' },
];

const sampleFilters = [
  {
    key: 'period',
    label: 'Period',
    type: 'select' as const,
    options: [
      { label: 'Last 7 days', value: '7d' },
      { label: 'Last 30 days', value: '30d' },
      { label: 'Last 90 days', value: '90d' },
      { label: 'Last year', value: '1y' },
    ],
    placeholder: 'Select period',
  },
  {
    key: 'department',
    label: 'Department',
    type: 'select' as const,
    options: [
      { label: 'All Departments', value: 'all' },
      { label: 'Engineering', value: 'eng' },
      { label: 'Marketing', value: 'mkt' },
      { label: 'Sales', value: 'sales' },
    ],
    placeholder: 'Select department',
  },
];

const sampleReportData = {
  columns: [
    { key: 'month', label: 'Month' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'expenses', label: 'Expenses' },
    { key: 'profit', label: 'Net Profit' },
    { key: 'margin', label: 'Margin' },
  ],
  rows: [
    { month: 'January', revenue: '$42,500', expenses: '$28,100', profit: '$14,400', margin: '33.9%' },
    { month: 'February', revenue: '$45,200', expenses: '$29,800', profit: '$15,400', margin: '34.1%' },
    { month: 'March', revenue: '$51,800', expenses: '$31,200', profit: '$20,600', margin: '39.8%' },
    { month: 'April', revenue: '$48,900', expenses: '$30,500', profit: '$18,400', margin: '37.6%' },
    { month: 'May', revenue: '$55,100', expenses: '$32,800', profit: '$22,300', margin: '40.5%' },
  ],
  summary: {
    'Total Revenue': '$243,500',
    'Total Expenses': '$152,400',
    'Net Profit': '$91,100',
    'Average Margin': '37.2%',
  },
};

export const Default: Story = {
  args: {
    config: {
      visual: { layout: 'top-filters' },
      presentation: {
        chrome: { title: 'Reports', subtitle: 'Generate and export business reports' },
      },
      behavior: {
        templates: sampleTemplates,
        selectedTemplate: 'revenue',
        onTemplateSelect: (id) => console.log('Template:', id),
        filters: sampleFilters,
        filterValues: { period: '30d' },
        onFilterChange: (filters) => console.log('Filters:', filters),
        reportData: sampleReportData,
        onGenerate: async () => sampleReportData,
        onExport: (format) => console.log('Export:', format),
      },
    },
  },
};

export const SidebarLayout: Story = {
  args: {
    config: {
      visual: { layout: 'sidebar-filters' },
      presentation: { chrome: { title: 'Report Builder' } },
      behavior: {
        templates: sampleTemplates,
        selectedTemplate: 'users',
        onTemplateSelect: (id) => console.log('Template:', id),
        filters: sampleFilters,
        filterValues: {},
        onFilterChange: (filters) => console.log('Filters:', filters),
        reportData: sampleReportData,
        onGenerate: async () => sampleReportData,
        onExport: (format) => console.log('Export:', format),
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    config: {
      visual: { layout: 'top-filters' },
      presentation: { chrome: { title: 'Reports' } },
      behavior: {
        templates: sampleTemplates,
        onTemplateSelect: (id) => console.log('Template:', id),
        filters: [],
        filterValues: {},
        onGenerate: async () => sampleReportData,
      },
    },
  },
};

export const Generating: Story = {
  args: {
    config: {
      visual: { layout: 'top-filters' },
      presentation: { chrome: { title: 'Reports', subtitle: 'Generating report...' } },
      behavior: {
        templates: sampleTemplates,
        selectedTemplate: 'compliance',
        onTemplateSelect: (id) => console.log('Template:', id),
        filters: sampleFilters,
        filterValues: { period: '90d' },
        generating: true,
        onGenerate: async () => sampleReportData,
      },
    },
  },
};

export const WithChart: Story = {
  args: {
    config: {
      visual: { layout: 'top-filters' },
      presentation: {
        chrome: { title: 'Revenue Report' },
        renderChart: (data) => (
          <Stack spacing="md">
            <Text style={{ fontSize: 16, fontWeight: 600 }}>Revenue Trend</Text>
            <Flex gap={4} align="end" style={{ height: 120 }}>
              {data.rows.map((row, i) => {
                const value = parseInt(String(row.revenue).replace(/[$,]/g, ''), 10);
                const maxValue = 60000;
                const height = Math.round((value / maxValue) * 100);
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${height}%`,
                        backgroundColor: 'var(--ds-color-primary)',
                        borderRadius: '4px 4px 0 0',
                        minHeight: 4,
                      }}
                    />
                    <Text style={{ fontSize: 11, color: 'var(--ds-color-text-muted)' }}>
                      {String(row.month).substring(0, 3)}
                    </Text>
                  </div>
                );
              })}
            </Flex>
          </Stack>
        ),
      },
      behavior: {
        templates: sampleTemplates,
        selectedTemplate: 'revenue',
        onTemplateSelect: (id) => console.log('Template:', id),
        filters: sampleFilters,
        filterValues: { period: '30d' },
        reportData: sampleReportData,
        onGenerate: async () => sampleReportData,
        onExport: (format) => console.log('Export:', format),
      },
    },
  },
};
