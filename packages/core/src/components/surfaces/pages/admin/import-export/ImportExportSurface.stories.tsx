/** @fileoverview ImportExportSurface Storybook stories. */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { ImportExportSurface } from '.';
import { createSurfaceStoryDecorator } from '../../../foundation/common/story-helpers';

const meta: Meta<typeof ImportExportSurface> = {
  title: 'Surfaces/ImportExportSurface',
  component: ImportExportSurface,
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
          'Data bulk operations surface supporting import uploads, export field selection, ' +
          'and operation history.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImportExportSurface>;

const sampleExportFields = [
  { key: 'name', label: 'Name', selected: true },
  { key: 'email', label: 'Email', selected: true },
  { key: 'role', label: 'Role', selected: true },
  { key: 'department', label: 'Department', selected: true },
  { key: 'status', label: 'Status', selected: false },
  { key: 'createdAt', label: 'Created At', selected: false },
  { key: 'lastLogin', label: 'Last Login', selected: false },
  { key: 'phone', label: 'Phone', selected: false },
];

const sampleHistory = [
  { id: 'h1', type: 'import' as const, date: 'Mar 14, 2026', status: 'completed', recordCount: 245 },
  { id: 'h2', type: 'export' as const, date: 'Mar 12, 2026', status: 'completed', recordCount: 1200 },
  { id: 'h3', type: 'import' as const, date: 'Mar 10, 2026', status: 'failed', recordCount: 0 },
  { id: 'h4', type: 'export' as const, date: 'Mar 5, 2026', status: 'completed', recordCount: 890 },
];

export const Default: Story = {
  args: {
    config: {
      visual: {},
      presentation: {
        chrome: { title: 'Import & Export', subtitle: 'Bulk data operations' },
      },
      behavior: {
        mode: 'both',
        importConfig: {
          acceptedFormats: ['.csv', '.xlsx', '.json'],
          templateUrl: '#',
          onUpload: async () => ({
            success: true,
            totalRows: 150,
            validRows: 142,
            errorRows: 8,
            errors: [
              { row: 12, field: 'email', message: 'Invalid email format' },
              { row: 45, field: 'role', message: 'Unknown role value' },
            ],
            detectedMappings: [
              { sourceField: 'Name', targetField: 'name' },
              { sourceField: 'Email Address', targetField: 'email' },
            ],
          }),
          onConfirm: async () => console.log('Import confirmed'),
        },
        exportConfig: {
          formats: ['csv', 'xlsx', 'json'],
          fields: sampleExportFields,
          onExport: async (format, fields) => {
            console.log('Export:', format, fields);
            return 'export-url';
          },
        },
        history: sampleHistory,
      },
    },
  },
};

export const ImportOnly: Story = {
  args: {
    config: {
      visual: {},
      presentation: {
        chrome: { title: 'Import Data' },
      },
      behavior: {
        mode: 'import',
        importConfig: {
          acceptedFormats: ['.csv', '.xlsx'],
          templateUrl: '#',
          onUpload: async () => ({
            success: true,
            totalRows: 50,
            validRows: 50,
            errorRows: 0,
            detectedMappings: [],
          }),
          onConfirm: async () => console.log('Import confirmed'),
        },
        history: sampleHistory.filter((h) => h.type === 'import'),
      },
    },
  },
};

export const ExportOnly: Story = {
  args: {
    config: {
      visual: {},
      presentation: {
        chrome: { title: 'Export Data' },
      },
      behavior: {
        mode: 'export',
        exportConfig: {
          formats: ['csv', 'xlsx', 'json', 'pdf'],
          fields: sampleExportFields,
          onExport: async (format, fields) => {
            console.log('Export:', format, fields);
            return 'export-url';
          },
        },
        history: sampleHistory.filter((h) => h.type === 'export'),
      },
    },
  },
};
