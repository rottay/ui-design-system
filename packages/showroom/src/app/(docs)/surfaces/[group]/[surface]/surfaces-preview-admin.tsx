'use client';

import type { ReactNode } from 'react';
import {
  AuditSurface,
  BillingSurface,
  FileBrowserSurface,
  ImportExportSurface,
  IntegrationSurface,
  ProfileSurface,
  SettingsSurface,
  TeamSurface,
  Avatar,
  Text,
  type AuditSurfaceConfig,
  type BillingSurfaceConfig,
  type FileBrowserSurfaceConfig,
  type ImportExportSurfaceConfig,
  type IntegrationSurfaceConfig,
  type ProfileSurfaceConfig,
  type SettingsSurfaceConfig,
  type TeamSurfaceConfig,
  type TeamRole,
} from '@rottay/design-system';
import { noop } from './surfaces-preview-shared';

// --- audit -----------------------------------------------------------------

const AUDIT_CONFIG: AuditSurfaceConfig = {
  visual: { density: 'comfortable', maxHeight: '420px' },
  presentation: {
    chrome: {
      title: 'Activity audit',
      subtitle: 'Immutable trail of changes across records and documents.',
    },
  },
  behavior: {
    columns: [
      { key: 'timestamp', label: 'Time', width: 180, sortable: true },
      { key: 'actor', label: 'Person', sortable: true },
      { key: 'action', label: 'Action' },
      { key: 'resource', label: 'Resource' },
    ],
    entries: [
      { id: 'a1', timestamp: '2026-04-18T09:12:00Z', actor: 'Ana Porter', action: 'created', resource: 'report-1024', details: 'Draft report added', severity: 'info' },
      { id: 'a2', timestamp: '2026-04-18T10:03:00Z', actor: 'Marco Silva', action: 'updated', resource: 'account-88', details: 'Plan switched to premium', severity: 'warning' },
      { id: 'a3', timestamp: '2026-04-18T11:47:00Z', actor: 'Jules Carter', action: 'archived', resource: 'document-57', details: 'Moved to archive', severity: 'critical' },
    ],
    filters: [
      { key: 'severity', label: 'Severity', type: 'select', placeholder: 'All levels',
        options: [{ label: 'Info', value: 'info' }, { label: 'Warning', value: 'warning' }, { label: 'Critical', value: 'critical' }] },
      { key: 'actor', label: 'Person', type: 'text', placeholder: 'Filter by person' },
    ],
    filterValues: { severity: 'warning' },
    onFilterChange: noop,
    pagination: { current: 1, pageSize: 10, total: 3, onChange: noop },
    onExport: noop,
  },
};

// --- billing ---------------------------------------------------------------

const BILLING_CONFIG: BillingSurfaceConfig = {
  visual: { layout: 'sections' },
  presentation: {
    chrome: { title: 'Billing', subtitle: 'Plan, usage, and payment history for this workspace.' },
  },
  behavior: {
    currentPlan: {
      name: 'Premium plan',
      price: '$49',
      interval: 'month',
      features: ['Unlimited records', 'Priority support', 'Advanced reports'],
    },
    usage: [
      { label: 'Records stored', current: 3200, limit: 5000, unit: 'items' },
      { label: 'Member seats', current: 8, limit: 10, unit: 'people' },
      { label: 'Storage', current: 42, limit: 100, unit: 'GB' },
    ],
    invoices: [
      { id: 'inv-1', date: '2026-04-01', amount: '$49.00', status: 'paid', downloadUrl: '#' },
      { id: 'inv-2', date: '2026-03-01', amount: '$49.00', status: 'paid', downloadUrl: '#' },
      { id: 'inv-3', date: '2026-02-01', amount: '$49.00', status: 'pending' },
    ],
    paymentMethods: [
      { id: 'pm-1', type: 'Visa', last4: '4242', expiry: '12/28', isDefault: true },
      { id: 'pm-2', type: 'Mastercard', last4: '8210', expiry: '04/27', isDefault: false },
    ],
    onUpgrade: noop,
    onCancel: noop,
    onDownloadInvoice: noop,
  },
};

// --- file-browser ----------------------------------------------------------

const FILE_BROWSER_CONFIG: FileBrowserSurfaceConfig = {
  visual: { viewMode: 'grid', maxWidth: 960 },
  presentation: {
    chrome: { title: 'Files', subtitle: 'Browse documents and folders in this workspace.' },
  },
  behavior: {
    files: [
      { id: 'f1', name: 'quarterly-report.pdf', type: 'file', mimeType: 'application/pdf', size: 248000, modifiedAt: '2026-04-15T09:00:00Z' },
      { id: 'f2', name: 'budget.xlsx', type: 'file', mimeType: 'application/vnd.ms-excel', size: 82000, modifiedAt: '2026-04-16T12:00:00Z' },
      { id: 'f3', name: 'notes.txt', type: 'file', mimeType: 'text/plain', size: 1200, modifiedAt: '2026-04-17T14:30:00Z' },
    ],
    folders: [
      { id: 'd1', name: 'Documents', type: 'folder', childCount: 12 },
      { id: 'd2', name: 'Reports', type: 'folder', childCount: 5 },
    ],
    currentPath: [],
    selectedItems: [],
    onUpload: noop,
    onDelete: noop,
    onNavigate: noop,
    onSelectionChange: noop,
    onViewModeChange: noop,
    onRename: noop,
  },
};

// --- import-export ---------------------------------------------------------

const IMPORT_EXPORT_CONFIG: ImportExportSurfaceConfig = {
  visual: { maxWidth: 960 },
  presentation: {
    chrome: { title: 'Import and export', subtitle: 'Move records in and out of this workspace.' },
  },
  behavior: {
    mode: 'both',
    importConfig: {
      acceptedFormats: ['.csv', '.xlsx'],
      templateUrl: '#',
      onUpload: async () => ({
        success: true,
        totalRows: 120,
        validRows: 118,
        errorRows: 2,
        errors: [
          { row: 14, field: 'email', message: 'Invalid format' },
          { row: 87, field: 'name', message: 'Required value missing' },
        ],
        detectedMappings: [
          { sourceField: 'Full Name', targetField: 'name' },
          { sourceField: 'Email', targetField: 'email' },
        ],
      }),
      onConfirm: async () => undefined,
    },
    exportConfig: {
      formats: ['csv', 'json', 'xlsx'],
      fields: [
        { key: 'name', label: 'Name', selected: true },
        { key: 'email', label: 'Email', selected: true },
        { key: 'createdAt', label: 'Created', selected: false },
        { key: 'status', label: 'Status', selected: true },
      ],
      onExport: async () => '#',
    },
    history: [
      { id: 'h1', type: 'import', date: '2026-04-10', status: 'completed', recordCount: 320 },
      { id: 'h2', type: 'export', date: '2026-04-12', status: 'completed', recordCount: 512 },
      { id: 'h3', type: 'import', date: '2026-04-14', status: 'failed', recordCount: 0 },
    ],
  },
};

// --- integration -----------------------------------------------------------

const INTEGRATION_CONFIG: IntegrationSurfaceConfig = {
  visual: { layout: 'sections', maxWidth: 960 },
  presentation: {
    chrome: { title: 'Developer settings', subtitle: 'API keys, webhooks, and connected apps.' },
  },
  behavior: {
    apiKeys: [
      { id: 'k1', name: 'Production key', key: 'sk_live_9f2a...c71d', createdAt: '2026-01-15', status: 'active' },
      { id: 'k2', name: 'Staging key', key: 'sk_test_44b1...09ee', createdAt: '2026-03-02', status: 'expired' },
    ],
    webhooks: [
      { id: 'w1', url: 'https://hooks.example.com/inbound', events: ['record.created', 'record.updated'], status: 'active' },
      { id: 'w2', url: 'https://hooks.example.com/sync', events: ['item.deleted'], status: 'failed' },
    ],
    connectedApps: [
      { id: 'app1', name: 'Analytics Suite', description: 'Streams metrics to an external dashboard.', status: 'connected' },
      { id: 'app2', name: 'Storage Bridge', description: 'Mirrors documents to object storage.', status: 'error' },
    ],
    onCreateKey: noop,
    onRevokeKey: noop,
    onCreateWebhook: noop,
    onDeleteWebhook: noop,
    onDisconnectApp: noop,
  },
};

// --- profile ---------------------------------------------------------------

const PROFILE_CONFIG: ProfileSurfaceConfig = {
  visual: { layout: 'stacked' },
  presentation: {
    chrome: { title: 'Profile', subtitle: 'Manage account details and preferences.' },
  },
  behavior: {
    sections: [
      {
        key: 'personal',
        label: 'Personal information',
        description: 'Basic details shown across the workspace.',
        fields: [
          { key: 'name', label: 'Full name', value: 'Ana Porter', type: 'text' },
          { key: 'email', label: 'Email', value: 'ana@example.com', type: 'email' },
          { key: 'phone', label: 'Phone', value: '+1 (555) 010-4477', type: 'tel' },
        ],
      },
      {
        key: 'about',
        label: 'About',
        fields: [
          { key: 'bio', label: 'Short bio', value: 'Operations lead focused on process quality.', type: 'textarea', placeholder: 'Tell others about yourself' },
          { key: 'timezone', label: 'Time zone', value: 'UTC-5', type: 'text', readOnly: true },
        ],
      },
    ],
    onSave: noop,
    onPasswordChange: noop,
    onDeleteAccount: noop,
  },
};

// --- settings --------------------------------------------------------------

const SETTINGS_CONFIG: SettingsSurfaceConfig = {
  visual: { maxWidth: 960 },
  presentation: {
    chrome: { title: 'Settings', subtitle: 'Workspace configuration and preferences.' },
    intro: 'Adjust how this workspace behaves for everyone on the account.',
  },
  behavior: {
    tabs: [
      { key: 'general', label: 'General', description: 'Names, defaults, and locale.', content: <Text>General settings panel content.</Text> },
      { key: 'notifications', label: 'Notifications', description: 'Choose how updates reach the account.', content: <Text>Notification settings panel content.</Text> },
      { key: 'security', label: 'Security', description: 'Authentication and session controls.', content: <Text>Security settings panel content.</Text> },
    ],
    activeTab: 'general',
    onTabChange: noop,
  },
};

// --- team ------------------------------------------------------------------
// `role` / `roles` / `onRoleChange` / type `TeamRole` are unavoidable DS API
// tokens (not domain copy); every value assigned is neutral (admin/editor/viewer).

const TEAM_ROLES: TeamRole[] = [
  { id: 'admin', label: 'Admin', description: 'Full access' },
  { id: 'editor', label: 'Editor', description: 'Can edit records' },
  { id: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

const TEAM_CONFIG: TeamSurfaceConfig = {
  visual: { layout: 'table', maxWidth: 960 },
  presentation: {
    chrome: { title: 'Team', subtitle: 'People with access to this workspace.' },
  },
  behavior: {
    members: [
      { id: 'm1', name: 'Ana Porter', email: 'ana@example.com', role: 'admin', status: 'active', avatar: <Avatar size="sm">AP</Avatar> },
      { id: 'm2', name: 'Marco Silva', email: 'marco@example.com', role: 'editor', status: 'active', avatar: <Avatar size="sm">MS</Avatar> },
      { id: 'm3', name: 'Jules Carter', email: 'jules@example.com', role: 'viewer', status: 'invited', avatar: <Avatar size="sm">JC</Avatar> },
    ],
    roles: TEAM_ROLES,
    onInvite: noop,
    onRoleChange: noop,
    onEditMember: noop,
    onRemove: noop,
  },
};

export const ADMIN_SURFACE_PREVIEWS: Record<string, ReactNode> = {
  audit: <AuditSurface config={AUDIT_CONFIG} />,
  billing: <BillingSurface config={BILLING_CONFIG} />,
  'file-browser': <FileBrowserSurface config={FILE_BROWSER_CONFIG} />,
  'import-export': <ImportExportSurface config={IMPORT_EXPORT_CONFIG} />,
  integration: <IntegrationSurface config={INTEGRATION_CONFIG} />,
  profile: <ProfileSurface config={PROFILE_CONFIG} />,
  settings: <SettingsSurface config={SETTINGS_CONFIG} />,
  team: <TeamSurface config={TEAM_CONFIG} />,
};
