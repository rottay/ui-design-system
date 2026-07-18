'use client';

import type { ReactNode } from 'react';
import {
  Avatar,
  Badge,
  Box,
  Stack,
  Text,
  CompareSurface,
  DashboardSurface,
  DetailSurface,
  ListSurface,
  ReportSurface,
  SearchSurface,
  VisualizationSurface,
  type CompareSurfaceConfig,
  type DashboardSurfaceConfig,
  type DetailSurfaceConfig,
  type ListSurfaceConfig,
  type ReportSurfaceConfig,
  type SearchSurfaceConfig,
  type VisualizationSurfaceConfig,
  type EntityAdapter,
} from '@rottay/design-system';
import { noop } from './surfaces-preview-shared';

// ---------------------------------------------------------------------------
// Neutral record type shared by ListSurface + DetailSurface (both generic).
// Identity map keeps TRaw === TView; EntityFieldMeta.key must be keyof & string.
// ---------------------------------------------------------------------------

interface DataRecord {
  id: string;
  name: string;
  status: string;
  owner: string;
  updatedAt: string;
  score: number;
}

const DATA_ROWS: DataRecord[] = [
  { id: 'rec-1', name: 'Northwind workspace', status: 'Active', owner: 'Ada Lovelace', updatedAt: '2026-04-17', score: 92 },
  { id: 'rec-2', name: 'Umbrella project', status: 'Paused', owner: 'Grace Hopper', updatedAt: '2026-04-18', score: 58 },
  { id: 'rec-3', name: 'Beacon account', status: 'Active', owner: 'Alan Turing', updatedAt: '2026-04-19', score: 24 },
];

const DATA_ADAPTER: EntityAdapter<DataRecord, DataRecord> = {
  entity: 'record',
  version: '1.0.0',
  map: (row) => row,
  fields: [
    { key: 'name', fieldId: 'record.name' },
    { key: 'status', fieldId: 'record.status' },
    { key: 'owner', fieldId: 'record.owner' },
    { key: 'score', fieldId: 'record.score' },
  ],
};

// --- compare ---------------------------------------------------------------

const COMPARE_CONFIG: CompareSurfaceConfig = {
  visual: {},
  presentation: {
    chrome: { title: 'Plan comparison' },
    intro: <Text>Compare the three published plans side by side.</Text>,
  },
  behavior: {
    subjects: [
      { key: 'starter', label: 'Starter' },
      { key: 'standard', label: 'Standard', badge: <Badge variant="secondary">Popular</Badge> },
      { key: 'premium', label: 'Premium' },
    ],
    sections: [
      {
        key: 'capabilities',
        title: 'Capabilities',
        rows: [
          { key: 'projects', label: 'Projects', values: { starter: '3', standard: '25', premium: 'Unlimited' } },
          { key: 'seats', label: 'Included seats', values: { starter: '1', standard: '10', premium: '50' } },
          { key: 'history', label: 'Version history', values: { starter: '7 days', standard: '90 days', premium: '1 year' } },
        ],
      },
      {
        key: 'support',
        title: 'Support',
        rows: [
          { key: 'channels', label: 'Support channels', values: { starter: 'Email', standard: 'Email + chat', premium: '24/7 priority' } },
        ],
      },
    ],
    actions: [{ id: 'export', label: 'Export table', onClick: noop }],
  },
};

// --- dashboard -------------------------------------------------------------

const DASHBOARD_CONFIG: DashboardSurfaceConfig = {
  visual: { statsColumns: 3, sectionsColumns: 12 },
  presentation: {
    chrome: { title: 'Operations overview', subtitle: 'Live workspace metrics' },
    headerContent: <Text size="sm">Updated a moment ago</Text>,
    sections: [
      { key: 'throughput', title: 'Throughput', description: 'Records processed this week', span: 8, content: <Text>1,284 records completed across 6 workspaces.</Text> },
      { key: 'queue', title: 'Queue', description: 'Awaiting review', span: 4, content: <Text>18 items pending.</Text> },
    ],
  },
  behavior: {
    stats: [
      { key: 'active', label: 'Active records', value: 1284, change: 12, changeType: 'increase' },
      { key: 'pending', label: 'Pending review', value: 18, change: -4, changeType: 'decrease' },
      { key: 'sla', label: 'SLA attainment', value: '97%', change: 2, changeType: 'increase' },
    ],
    headerActions: [
      { id: 'refresh', label: 'Refresh', variant: 'primary', onClick: noop },
      { id: 'export', label: 'Export', onClick: noop },
    ],
    onStatClick: noop,
  },
};

// --- detail ----------------------------------------------------------------

const DETAIL_CONFIG: DetailSurfaceConfig<DataRecord> = {
  visual: { sidebarPosition: 'right', sidebarWidth: 260 },
  presentation: {
    chrome: {
      pageTitle: 'Record detail',
      breadcrumbs: [{ label: 'Records', href: '#' }, { label: 'Detail' }],
    },
    title: (item) => item.name,
    subtitle: (item) => `Owner: ${item.owner}`,
    avatar: (item) => <Avatar size="sm">{item.name.slice(0, 1)}</Avatar>,
    status: (item) => ({ label: item.status }),
    tabs: [
      { key: 'overview', label: 'Overview', content: (item) => <Text>Score {item.score}, updated {item.updatedAt}.</Text> },
      { key: 'activity', label: 'Activity', badge: 3, content: (item) => <Text>Recent changes for {item.name}.</Text> },
    ],
    sidebar: (item) => (
      <Stack spacing="xs">
        <Text size="xs">Owner</Text>
        <Text size="sm">{item.owner}</Text>
      </Stack>
    ),
  },
  behavior: {
    actions: [
      { id: 'edit', label: 'Edit', variant: 'primary', onClick: noop },
      { id: 'archive', label: 'Archive', variant: 'ghost', onClick: noop },
    ],
    activeTab: 'overview',
  },
};

// --- list ------------------------------------------------------------------

const LIST_CONFIG: ListSurfaceConfig<DataRecord> = {
  visual: { defaultView: 'table', mobileDefaultView: 'cards', allowViewSwitch: true },
  presentation: {
    chrome: { title: 'Records', subtitle: '3 items' },
    renderCell: {
      'record.status': (value) => (
        <Badge variant={String(value) === 'Active' ? 'success' : 'secondary'}>{String(value)}</Badge>
      ),
    },
  },
  behavior: {
    columns: [
      { key: 'name', fieldId: 'record.name', header: 'Name', accessorKey: 'name' },
      { key: 'status', fieldId: 'record.status', header: 'Status', accessorKey: 'status' },
      { key: 'owner', fieldId: 'record.owner', header: 'Owner', accessorKey: 'owner' },
      { key: 'score', fieldId: 'record.score', header: 'Score', accessorKey: 'score' },
    ],
    rowKey: 'id',
    filters: [
      { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'Active' }, { label: 'Paused', value: 'Paused' }] },
    ],
    filterValues: { status: 'Active' },
    primaryAction: { id: 'create', label: 'New record', variant: 'primary', onClick: noop },
    rowActions: [{ id: 'view', label: 'View', onClick: noop }],
  },
};

// --- report ----------------------------------------------------------------

const REPORT_CONFIG: ReportSurfaceConfig = {
  visual: { layout: 'top-filters' },
  presentation: { chrome: { title: 'Reports', subtitle: 'Generate and export' } },
  behavior: {
    templates: [
      { id: 'usage', name: 'Usage summary', description: 'Weekly records processed', category: 'Operations' },
      { id: 'growth', name: 'Growth report', description: 'Account trend by month', category: 'Analytics' },
    ],
    selectedTemplate: 'usage',
    onTemplateSelect: noop,
    filters: [
      { key: 'region', label: 'Region', type: 'select', options: [{ label: 'North', value: 'north' }, { label: 'South', value: 'south' }] },
      { key: 'window', label: 'Window', type: 'date-range' },
    ],
    filterValues: { region: 'north' },
    onFilterChange: noop,
    onExport: noop,
    reportData: {
      columns: [{ key: 'month', label: 'Month' }, { key: 'records', label: 'Records' }, { key: 'delta', label: 'Change' }],
      rows: [
        { month: 'April', records: 820, delta: '+6%' },
        { month: 'May', records: 910, delta: '+11%' },
        { month: 'June', records: 1284, delta: '+41%' },
      ],
      summary: { Total: 3014, Average: 1005 },
    },
  },
};

// --- search ----------------------------------------------------------------

const SEARCH_CONFIG: SearchSurfaceConfig = {
  visual: { layout: 'split', minQueryLength: 2 },
  presentation: {
    chrome: { title: 'Search' },
    placeholder: 'Search records and documents',
    resultPreview: (result) => <Text>Preview for {result.title}</Text>,
  },
  behavior: {
    query: 'be',
    onQueryChange: noop,
    results: [
      { id: 'r1', title: 'Beacon account', description: 'Active workspace, updated today', meta: <Text size="xs">Owner: Alan Turing</Text>, badge: <Badge variant="success">Active</Badge> },
      { id: 'r2', title: 'Bedrock project', description: 'Paused project, 3 open tasks' },
      { id: 'r3', title: 'Belfry report', description: 'Draft report, last saved yesterday' },
    ],
    selectedResultId: 'r1',
    onSelectResult: noop,
    resultActions: [
      { id: 'open', label: 'Open', variant: 'primary', onClick: noop },
      { id: 'copy', label: 'Copy link', onClick: noop },
    ],
    filters: [
      { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Active', value: 'active' }, { label: 'Paused', value: 'paused' }] },
    ],
    filterValues: { status: 'active' },
    onFilterChange: noop,
  },
};

// --- visualization ---------------------------------------------------------

const VISUALIZATION_CONFIG: VisualizationSurfaceConfig = {
  visual: { tabsType: 'line' },
  presentation: {
    chrome: { title: 'Metrics explorer' },
    intro: <Text>Switch between the published views.</Text>,
    aside: <Text size="sm">Data refreshed a moment ago.</Text>,
    footer: <Text size="xs">Source: workspace metrics pipeline.</Text>,
  },
  behavior: {
    activeView: 'trend',
    views: [
      { key: 'trend', label: 'Trend', badge: <Badge variant="secondary">Live</Badge>, description: 'Records processed per week',
        content: <Box style={{ height: 160, border: '1px dashed var(--ds-color-border)', display: 'grid', placeItems: 'center' }}><Text size="sm">Chart slot (app-provided)</Text></Box> },
      { key: 'breakdown', label: 'Breakdown', description: 'Distribution by stage',
        content: <Box style={{ height: 160, border: '1px dashed var(--ds-color-border)', display: 'grid', placeItems: 'center' }}><Text size="sm">Chart slot (app-provided)</Text></Box> },
      { key: 'raw', label: 'Raw', disabled: true, content: <Text>Raw data view.</Text> },
    ],
    stats: [
      { key: 'total', label: 'Total records', value: '3,014' },
      { key: 'weekly', label: 'Weekly average', value: 1005, change: 8, changeType: 'increase' },
    ],
    onViewChange: noop,
    actions: [{ id: 'export', label: 'Export', onClick: noop }],
  },
};

export const DATA_SURFACE_PREVIEWS: Record<string, ReactNode> = {
  compare: <CompareSurface config={COMPARE_CONFIG} />,
  dashboard: <DashboardSurface config={DASHBOARD_CONFIG} />,
  detail: <DetailSurface<DataRecord, DataRecord> data={DATA_ROWS[0]} adapter={DATA_ADAPTER} config={DETAIL_CONFIG} />,
  list: <ListSurface<DataRecord, DataRecord> data={DATA_ROWS} adapter={DATA_ADAPTER} config={LIST_CONFIG} />,
  report: <ReportSurface config={REPORT_CONFIG} />,
  search: <SearchSurface config={SEARCH_CONFIG} />,
  visualization: <VisualizationSurface config={VISUALIZATION_CONFIG} />,
};
