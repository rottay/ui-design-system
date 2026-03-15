import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuditSurface } from '.';
import { createSurfaceStoryDecorator } from '../common/story-helpers';

const meta: Meta<typeof AuditSurface> = {
  title: 'Surfaces/AuditSurface',
  component: AuditSurface,
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
          'Config-driven audit log viewer for compliance frameworks (HIPAA, SOC2, GDPR). ' +
          'Renders a filterable, exportable audit trail with severity indicators.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuditSurface>;

const sampleEntries = [
  {
    id: 'a1',
    timestamp: '2026-03-14 09:12:33',
    actor: 'alice@company.com',
    action: 'user.login',
    resource: 'Auth Session',
    severity: 'info' as const,
    details: 'Successful login from 192.168.1.42',
  },
  {
    id: 'a2',
    timestamp: '2026-03-14 09:15:01',
    actor: 'bob@company.com',
    action: 'record.update',
    resource: 'Patient Record #4821',
    severity: 'warning' as const,
    details: 'PHI field modified: diagnosis updated',
  },
  {
    id: 'a3',
    timestamp: '2026-03-14 09:20:44',
    actor: 'system',
    action: 'access.denied',
    resource: 'Admin Panel',
    severity: 'critical' as const,
    details: 'Unauthorized access attempt from unrecognized IP',
  },
  {
    id: 'a4',
    timestamp: '2026-03-14 10:05:12',
    actor: 'charlie@company.com',
    action: 'record.view',
    resource: 'Invoice #INV-2026-0042',
    severity: 'info' as const,
  },
  {
    id: 'a5',
    timestamp: '2026-03-14 10:30:00',
    actor: 'alice@company.com',
    action: 'export.data',
    resource: 'User Report',
    severity: 'warning' as const,
    details: 'Bulk data export triggered (1,200 records)',
  },
];

const sampleColumns = [
  { key: 'timestamp', label: 'Time', width: 180 },
  { key: 'actor', label: 'Actor', width: 200 },
  { key: 'action', label: 'Action', width: 160 },
  { key: 'resource', label: 'Resource' },
];

const sampleFilters = [
  {
    key: 'severity',
    label: 'Severity',
    type: 'select' as const,
    options: [
      { label: 'Info', value: 'info' },
      { label: 'Warning', value: 'warning' },
      { label: 'Critical', value: 'critical' },
    ],
    placeholder: 'All severities',
  },
  {
    key: 'actor',
    label: 'Actor',
    type: 'text' as const,
    placeholder: 'Search by actor...',
  },
];

export const Default: Story = {
  args: {
    config: {
      visual: { density: 'comfortable' },
      presentation: {
        chrome: { title: 'Audit Log', subtitle: 'Security and compliance event trail' },
      },
      behavior: {
        columns: sampleColumns,
        entries: sampleEntries,
        filters: sampleFilters,
        filterValues: {},
        onFilterChange: (filters) => console.log('Filters:', filters),
        onExport: (format) => console.log('Export:', format),
      },
    },
  },
};

export const Compact: Story = {
  args: {
    config: {
      visual: { density: 'compact', maxHeight: '400px' },
      presentation: {
        chrome: { title: 'Audit Log (Compact)', subtitle: 'Dense view with fixed height' },
      },
      behavior: {
        columns: sampleColumns,
        entries: sampleEntries,
        filters: [],
        filterValues: {},
        onExport: (format) => console.log('Export:', format),
      },
    },
  },
};

export const Empty: Story = {
  args: {
    config: {
      visual: { density: 'comfortable' },
      presentation: {
        chrome: { title: 'Audit Log', subtitle: 'No matching entries' },
      },
      behavior: {
        columns: sampleColumns,
        entries: [],
        filters: sampleFilters,
        filterValues: { severity: 'critical' },
        onFilterChange: (filters) => console.log('Filters:', filters),
      },
    },
  },
};

export const WithPagination: Story = {
  args: {
    config: {
      visual: { density: 'comfortable' },
      presentation: {
        chrome: { title: 'Audit Log', subtitle: 'Paginated results' },
      },
      behavior: {
        columns: sampleColumns,
        entries: sampleEntries,
        filters: [],
        filterValues: {},
        pagination: { current: 1, pageSize: 5, total: 47 },
        onExport: (format) => console.log('Export:', format),
      },
    },
  },
};
