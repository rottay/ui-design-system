'use client';

/* R6 probe fixtures for 11 inherited families, authored against each surface's
   own declared contract. */

import type { ReactNode } from 'react';
import {
  AuditSurface,
  BillingSurface,
  Button,
  CompareSurface,
  DashboardSurface,
  ImportExportSurface,
  IntegrationSurface,
  ProfileSurface,
  ReportSurface,
  SearchSurface,
  SettingsSurface,
  Stack,
  TeamSurface,
  Text,
} from '@rottay/design-system';

export function ConfigInheritedASurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'audit':
      return (
        <AuditSurface
          config={{
            visual: { density: 'comfortable' },
            presentation: {
              chrome: {
                title: 'Audit trail',
                subtitle: 'SOC 2 Type II activity log for the Rottay workspace',
              },
            },
            behavior: {
              columns: [
                { key: 'action', label: 'Action', sortable: true },
                { key: 'resource', label: 'Resource' },
                { key: 'actor', label: 'Actor' },
                { key: 'severity', label: 'Severity' },
              ],
              entries: [
                {
                  id: 'evt-4821',
                  timestamp: '2026-07-04T09:14:00Z',
                  actor: 'Priya Shah',
                  action: 'updated',
                  resource: 'Tenant billing profile',
                  severity: 'warning',
                  details: 'Changed the billing contact email and renewed the payment method.',
                },
                {
                  id: 'evt-4822',
                  timestamp: '2026-07-05T11:02:00Z',
                  actor: 'Marcus Webb',
                  action: 'deleted',
                  resource: 'API key "reporting-service"',
                  severity: 'critical',
                  details: 'Revoked an unused production API key after the quarterly access review.',
                },
                {
                  id: 'evt-4823',
                  timestamp: '2026-07-06T15:47:00Z',
                  actor: 'Dana Reyes',
                  action: 'read',
                  resource: 'Compliance export',
                  severity: 'info',
                  details: 'Downloaded the Q2 compliance export as a CSV file.',
                },
                {
                  id: 'evt-4824',
                  timestamp: '2026-07-07T08:30:00Z',
                  actor: 'Ana Torres',
                  action: 'created',
                  resource: 'Webhook endpoint',
                  severity: 'info',
                  details: 'Registered a new webhook for invoice.paid events.',
                },
              ],
              filters: [
                {
                  key: 'severity',
                  label: 'Severity',
                  type: 'select',
                  options: [
                    { label: 'Info', value: 'info' },
                    { label: 'Warning', value: 'warning' },
                    { label: 'Critical', value: 'critical' },
                  ],
                },
                { key: 'actor', label: 'Actor', type: 'text', placeholder: 'Search by actor' },
              ],
              filterValues: { severity: 'warning' },
              onFilterChange: (() => undefined),
              pagination: { current: 1, pageSize: 10, total: 4, onChange: (() => undefined) },
              onExport: (() => undefined),
            },
          }}
        />
      );
    case 'billing':
      return (
        <BillingSurface
          config={{
            visual: { layout: 'sections' },
            presentation: {
              chrome: {
                title: 'Billing & subscription',
                subtitle: 'Manage your plan, usage, and payment history',
              },
            },
            behavior: {
              currentPlan: {
                name: 'Growth',
                price: '$249',
                interval: 'month',
                features: [
                  'Up to 25 team seats',
                  'Unlimited workspaces',
                  'Priority email support',
                  'Advanced audit exports',
                ],
              },
              usage: [
                { label: 'Team seats', current: 18, limit: 25, unit: 'seats' },
                { label: 'API requests', current: 950000, limit: 1000000, unit: 'requests' },
                { label: 'Storage', current: 512, limit: 500, unit: 'GB' },
              ],
              invoices: [
                {
                  id: 'inv-2026-07',
                  date: '2026-07-01',
                  amount: '$249.00',
                  status: 'paid',
                  downloadUrl: '/invoices/inv-2026-07.pdf',
                },
                { id: 'inv-2026-06', date: '2026-06-01', amount: '$249.00', status: 'pending' },
                {
                  id: 'inv-2026-05',
                  date: '2026-05-01',
                  amount: '$249.00',
                  status: 'overdue',
                  downloadUrl: '/invoices/inv-2026-05.pdf',
                },
              ],
              paymentMethods: [
                { id: 'pm-1', type: 'Visa', last4: '4242', expiry: '09/28', isDefault: true },
                { id: 'pm-2', type: 'Mastercard', last4: '0091', expiry: '02/27', isDefault: false },
              ],
              onUpgrade: (() => undefined),
              onCancel: (() => undefined),
              onDownloadInvoice: (() => undefined),
            },
          }}
        />
      );
    case 'import-export':
      return (
        <ImportExportSurface
          config={{
            visual: {},
            presentation: {
              chrome: {
                title: 'Data import & export',
                subtitle: 'Move candidate records in and out of this workspace',
              },
            },
            behavior: {
              mode: 'both',
              importConfig: {
                acceptedFormats: ['.csv', '.xlsx', '.json'],
                templateUrl: '/templates/candidate-import-template.csv',
              },
              exportConfig: {
                formats: ['csv', 'xlsx', 'json'],
                fields: [
                  { key: 'name', label: 'Full name', selected: true },
                  { key: 'email', label: 'Email address', selected: true },
                  { key: 'role', label: 'Applied role', selected: true },
                  { key: 'stage', label: 'Pipeline stage', selected: false },
                  { key: 'source', label: 'Source', selected: false },
                ],
              },
              history: [
                { id: 'op-9001', type: 'import', date: '2026-07-04', status: 'completed', recordCount: 482 },
                { id: 'op-9002', type: 'export', date: '2026-07-28', status: 'completed', recordCount: 1240 },
                { id: 'op-9003', type: 'import', date: '2026-07-20', status: 'failed', recordCount: 0 },
                { id: 'op-9004', type: 'export', date: '2026-07-14', status: 'in-progress', recordCount: 96 },
              ],
            },
          }}
        />
      );
    case 'integration':
      return (
        <IntegrationSurface
          config={{
            visual: { layout: 'sections' },
            presentation: {
              chrome: {
                title: 'Integrations',
                subtitle: 'API keys, webhooks, and connected apps for this workspace',
              },
            },
            behavior: {
              apiKeys: [
                {
                  id: 'key-1',
                  name: 'Production reporting',
                  key: 'sk_live_****4f2a',
                  createdAt: '2026-05-12',
                  status: 'active',
                },
                {
                  id: 'key-2',
                  name: 'Staging smoke tests',
                  key: 'sk_test_****88c1',
                  createdAt: '2026-06-30',
                  status: 'active',
                },
                {
                  id: 'key-3',
                  name: 'Legacy export script',
                  key: 'sk_live_****11e0',
                  createdAt: '2025-11-04',
                  status: 'expired',
                },
              ],
              webhooks: [
                {
                  id: 'wh-1',
                  url: 'https://hooks.example.com/candidates',
                  events: ['candidate.created', 'candidate.updated'],
                  status: 'active',
                },
                {
                  id: 'wh-2',
                  url: 'https://hooks.example.com/billing',
                  events: ['invoice.paid'],
                  status: 'paused',
                },
              ],
              connectedApps: [
                { id: 'app-1', name: 'Slack', description: 'Pipeline notifications posted to #hiring', status: 'connected' },
                { id: 'app-2', name: 'Google Calendar', description: 'Interview scheduling sync', status: 'connected' },
                {
                  id: 'app-3',
                  name: 'Greenhouse',
                  description: 'Legacy ATS sync, disconnected after migration',
                  status: 'error',
                },
              ],
              onCreateKey: (() => undefined),
              onRevokeKey: (() => undefined),
              onCreateWebhook: (() => undefined),
              onDeleteWebhook: (() => undefined),
              onToggleWebhook: (() => undefined),
              onDisconnectApp: (() => undefined),
              actions: [{ id: 'view-docs', label: 'API documentation', onClick: (() => undefined) }],
            },
          }}
        />
      );
    case 'profile':
      return (
        <ProfileSurface
          config={{
            visual: { layout: 'stacked' },
            presentation: {
              chrome: {
                title: 'Your profile',
                subtitle: 'Account details, workspace identity, and security settings',
              },
            },
            behavior: {
              sections: [
                {
                  key: 'identity',
                  label: 'Identity',
                  description: 'Basic contact information visible to your team',
                  fields: [
                    { key: 'name', label: 'Full name', value: 'Elena Kowalski', type: 'text' },
                    { key: 'email', label: 'Email', value: 'elena.kowalski@example.com', type: 'email', readOnly: true },
                    { key: 'phone', label: 'Phone', value: '+1 (555) 019-2231', type: 'tel' },
                  ],
                },
                {
                  key: 'workspace',
                  label: 'Workspace',
                  description: 'How you appear across shared boards and comments',
                  fields: [
                    { key: 'title', label: 'Job title', value: 'Senior Talent Partner', type: 'text' },
                    {
                      key: 'bio',
                      label: 'Bio',
                      value: 'Leads technical hiring for the platform engineering org.',
                      type: 'textarea',
                    },
                  ],
                },
                {
                  key: 'security',
                  label: 'Security',
                  description: 'Password and account protection',
                  fields: [
                    { key: 'twoFactor', label: 'Two-factor method', value: 'Authenticator app', type: 'text', readOnly: true },
                  ],
                },
              ],
              onSave: (() => undefined),
              onAvatarChange: (() => undefined),
              onPasswordChange: (() => undefined),
              onDeleteAccount: (() => undefined),
            },
          }}
        />
      );
    case 'settings':
      return (
        <SettingsSurface
          config={{
            visual: { tabsType: 'line' },
            presentation: {
              chrome: {
                title: 'Workspace settings',
                subtitle: 'Configure how this workspace behaves for every member',
              },
              intro: 'Changes here apply to every member of this workspace immediately.',
            },
            behavior: {
              tabs: [
                {
                  key: 'general',
                  label: 'General',
                  description: 'Workspace name, timezone, and locale defaults',
                  content: (
                    <Stack spacing="sm">
                      <Text>Workspace name: Rottay</Text>
                      <Text size="sm" color="muted">Default timezone: UTC-05:00 (Eastern)</Text>
                    </Stack>
                  ),
                },
                {
                  key: 'notifications',
                  label: 'Notifications',
                  badge: 2,
                  description: 'Email and in-app alert preferences',
                  content: (
                    <Stack spacing="sm">
                      <Text>The daily digest email is enabled for all admins.</Text>
                      <Text size="sm" color="muted">2 alert rules are awaiting approval.</Text>
                    </Stack>
                  ),
                },
                {
                  key: 'security',
                  label: 'Security',
                  description: 'Single sign-on and session policy',
                  content: (
                    <Stack spacing="sm">
                      <Text>SSO is enforced via Okta for all workspace members.</Text>
                      <Text size="sm" color="muted">Sessions expire after 12 hours of inactivity.</Text>
                    </Stack>
                  ),
                },
              ],
              activeTab: 'notifications',
              onTabChange: (() => undefined),
              actions: [
                { id: 'save-settings', label: 'Save changes', variant: 'primary', onClick: (() => undefined) },
                { id: 'reset-settings', label: 'Reset to defaults', onClick: (() => undefined) },
              ],
            },
          }}
        />
      );
    case 'team':
      return (
        <TeamSurface
          config={{
            visual: { layout: 'table' },
            presentation: {
              chrome: {
                title: 'Team members',
                subtitle: 'Manage who has access to this workspace',
              },
            },
            behavior: {
              members: [
                {
                  id: 'mem-1',
                  name: 'Ana Torres',
                  email: 'ana.torres@example.com',
                  role: 'admin',
                  status: 'active',
                  joinedAt: '2025-02-11',
                },
                {
                  id: 'mem-2',
                  name: 'Marcus Webb',
                  email: 'marcus.webb@example.com',
                  role: 'editor',
                  status: 'active',
                  joinedAt: '2025-06-03',
                },
                {
                  id: 'mem-3',
                  name: 'Priya Shah',
                  email: 'priya.shah@example.com',
                  role: 'viewer',
                  status: 'invited',
                  joinedAt: '2026-07-30',
                },
                {
                  id: 'mem-4',
                  name: 'Dana Reyes',
                  email: 'dana.reyes@example.com',
                  role: 'editor',
                  status: 'disabled',
                  joinedAt: '2024-11-19',
                },
              ],
              roles: [
                { id: 'admin', label: 'Admin', description: 'Full access to billing and workspace settings' },
                { id: 'editor', label: 'Editor', description: 'Can create and edit records' },
                { id: 'viewer', label: 'Viewer', description: 'Read-only access' },
              ],
              onInvite: (() => undefined),
              onRemove: (() => undefined),
              onRoleChange: (() => undefined),
              onEditMember: (() => undefined),
            },
          }}
        />
      );
    case 'compare':
      return (
        <CompareSurface
          config={{
            visual: {},
            presentation: {
              chrome: {
                title: 'Plan comparison',
                subtitle: 'Compare Starter, Growth, and Enterprise plans side by side',
              },
              intro: (
                <Text color="muted">
                  Prices are billed monthly. Enterprise includes unlimited team seats and a dedicated onboarding
                  specialist.
                </Text>
              ),
            },
            behavior: {
              subjects: [
                { key: 'starter', label: 'Starter', description: '$29/month' },
                {
                  key: 'growth',
                  label: 'Growth',
                  description: '$99/month',
                  badge: <Text size="xs" weight="semibold">Most popular</Text>,
                },
                { key: 'enterprise', label: 'Enterprise', description: 'Custom pricing' },
              ],
              sections: [
                {
                  key: 'limits',
                  title: 'Usage limits',
                  description: 'Seats, storage, and API access',
                  rows: [
                    { key: 'seats', label: 'Team seats', values: { starter: '5', growth: '25', enterprise: 'Unlimited' } },
                    {
                      key: 'storage',
                      label: 'Storage',
                      values: { starter: '10 GB', growth: '500 GB', enterprise: '5 TB' },
                    },
                    {
                      key: 'api',
                      label: 'API requests / month',
                      values: { starter: '10,000', growth: '1,000,000', enterprise: 'Unlimited' },
                    },
                  ],
                },
                {
                  key: 'support',
                  title: 'Support',
                  description: 'Response time and channels',
                  rows: [
                    {
                      key: 'response',
                      label: 'Response time',
                      values: { starter: '48 hours', growth: '24 hours', enterprise: '1 hour' },
                    },
                    {
                      key: 'channel',
                      label: 'Support channel',
                      values: { starter: 'Email', growth: 'Email + chat', enterprise: 'Dedicated Slack channel' },
                    },
                  ],
                },
              ],
              actions: [
                { id: 'export-comparison', label: 'Export as PDF', onClick: (() => undefined) },
                { id: 'share-comparison', label: 'Share link', onClick: (() => undefined) },
                { id: 'talk-to-sales', label: 'Talk to sales', variant: 'primary', onClick: (() => undefined) },
              ],
            },
          }}
        />
      );
    case 'dashboard':
      return (
        <DashboardSurface
          config={{
            visual: {},
            presentation: {
              chrome: {
                title: 'Operations dashboard',
                subtitle: 'Hiring pipeline health across all open roles',
              },
              sections: [
                {
                  key: 'pipeline-summary',
                  title: 'Pipeline summary',
                  description: 'Candidates by stage this week',
                  span: 8,
                  content: (
                    <Stack spacing="xs">
                      <Text>142 candidates are active across 18 open roles.</Text>
                      <Text size="sm" color="muted">36 moved to onsite interviews this week, up from 24 last week.</Text>
                    </Stack>
                  ),
                  actions: (
                    <Button size="sm" variant="ghost" onClick={() => undefined}>
                      View pipeline
                    </Button>
                  ),
                },
                {
                  key: 'recent-hires',
                  span: 4,
                  chrome: 'plain',
                  // 'plain' sections render only `content`, so the heading lives inside it.
                  content: (
                    <Stack spacing="xs">
                      <Text weight="semibold">Recent hires</Text>
                      <Text size="sm" color="muted">Offers accepted in the last 30 days</Text>
                      <Text>7 offers accepted: 4 Engineering, 2 Design, 1 Sales.</Text>
                      <Text size="sm" color="muted">Median time from offer to acceptance: 3 days.</Text>
                    </Stack>
                  ),
                },
              ],
            },
            behavior: {
              stats: [
                { key: 'open-roles', label: 'Open roles', value: 18, change: 12.5, changeType: 'increase' },
                { key: 'active-candidates', label: 'Active candidates', value: 142, change: 4.1, changeType: 'increase' },
                { key: 'avg-time-to-hire', label: 'Avg. time to hire', value: 21, suffix: ' days', change: 6, changeType: 'decrease' },
                { key: 'offer-acceptance', label: 'Offer acceptance', value: 86, suffix: '%', change: 2, changeType: 'neutral' },
              ],
              headerActions: [
                { id: 'refresh-dashboard', label: 'Refresh', onClick: (() => undefined) },
                { id: 'export-dashboard', label: 'Export summary', variant: 'secondary', onClick: (() => undefined) },
              ],
              onStatClick: (() => undefined),
            },
          }}
        />
      );
    case 'report':
      return (
        <ReportSurface
          config={{
            visual: { layout: 'top-filters' },
            presentation: {
              chrome: {
                title: 'Recruiting funnel report',
                subtitle: 'Conversion by stage for the last completed quarter',
              },
            },
            behavior: {
              templates: [
                {
                  id: 'funnel',
                  name: 'Funnel conversion',
                  description: 'Stage-by-stage drop-off for a role or department',
                  category: 'Pipeline',
                },
                {
                  id: 'source',
                  name: 'Source effectiveness',
                  description: 'Hires and cost per hire by candidate source',
                  category: 'Sourcing',
                },
                {
                  id: 'diversity',
                  name: 'Diversity snapshot',
                  description: 'Representation across the pipeline stages',
                  category: 'Compliance',
                },
              ],
              selectedTemplate: 'funnel',
              onTemplateSelect: (() => undefined),
              filters: [
                {
                  key: 'department',
                  label: 'Department',
                  type: 'select',
                  options: [
                    { label: 'Engineering', value: 'engineering' },
                    { label: 'Design', value: 'design' },
                    { label: 'Sales', value: 'sales' },
                  ],
                  defaultValue: 'engineering',
                },
                {
                  key: 'quarter',
                  label: 'Quarter',
                  type: 'select',
                  options: [
                    { label: 'Q1 2026', value: '2026-q1' },
                    { label: 'Q2 2026', value: '2026-q2' },
                  ],
                  defaultValue: '2026-q2',
                },
              ],
              filterValues: { department: 'engineering', quarter: '2026-q2' },
              onFilterChange: (() => undefined),
              onExport: (() => undefined),
              reportData: {
                columns: [
                  { key: 'stage', label: 'Stage' },
                  { key: 'count', label: 'Candidates' },
                  { key: 'rate', label: 'Conversion' },
                ],
                rows: [
                  { stage: 'Applied', count: 486, rate: '100%' },
                  { stage: 'Phone screen', count: 210, rate: '43%' },
                  { stage: 'Onsite', count: 68, rate: '32%' },
                  { stage: 'Offer', count: 19, rate: '28%' },
                  { stage: 'Hired', count: 14, rate: '74%' },
                ],
                summary: { 'Total applied': 486, 'Total hired': 14, 'Overall conversion (%)': 3 },
              },
            },
          }}
        />
      );
    case 'search':
      return (
        <SearchSurface
          config={{
            visual: { layout: 'split', minQueryLength: 2 },
            presentation: {
              chrome: {
                title: 'Candidate search',
                subtitle: 'Search across resumes, notes, and interview feedback',
              },
              placeholder: 'Search candidates, roles, or skills',
            },
            behavior: {
              query: 'senior backend engineer',
              onQueryChange: (() => undefined),
              onQuerySubmit: (() => undefined),
              results: [
                {
                  id: 'cand-1',
                  title: 'Noor Al-Rashid',
                  description: 'Senior Backend Engineer candidate, 8 years experience',
                  meta: 'Applied 2026-07-28',
                },
                {
                  id: 'cand-2',
                  title: 'Tomas Ibarra',
                  description: 'Staff Backend Engineer candidate, distributed systems background',
                  meta: 'Applied 2026-07-25',
                },
                {
                  id: 'cand-3',
                  title: 'Kenji Watanabe',
                  description: 'Senior Backend Engineer candidate, ex-payments infrastructure',
                  meta: 'Applied 2026-07-19',
                },
              ],
              selectedResultId: 'cand-2',
              onSelectResult: (() => undefined),
              filters: [
                {
                  key: 'stage',
                  label: 'Stage',
                  type: 'select',
                  options: [
                    { label: 'Applied', value: 'applied' },
                    { label: 'Onsite', value: 'onsite' },
                    { label: 'Offer', value: 'offer' },
                  ],
                },
                { key: 'role', label: 'Role', type: 'text', placeholder: 'Filter by role' },
              ],
              filterValues: { stage: 'onsite' },
              onFilterChange: (() => undefined),
              onFilterReset: (() => undefined),
              actions: [{ id: 'save-search', label: 'Save search', onClick: (() => undefined) }],
              resultActions: [{ id: 'open-profile', label: 'Open profile', variant: 'primary', onClick: (() => undefined) }],
            },
          }}
        />
      );
    default:
      return null;
  }
}

export const CONFIG_INHERITED_A_SLUGS = [
  'audit',
  'billing',
  'import-export',
  'integration',
  'profile',
  'settings',
  'team',
  'compare',
  'dashboard',
  'report',
  'search',
];
