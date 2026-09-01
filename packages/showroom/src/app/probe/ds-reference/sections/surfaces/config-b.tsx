'use client';

/* Surface probe fixtures, lane B: families whose contract-test fixtures reference
   test-local scope that cannot be transplanted. */

import type { ReactNode } from 'react';
import {
  Button,
  DecisionInboxSurface,
  type EntityAdapter,
  FileBrowserSurface,
  Flex,
  FormSurface,
  ListSurface,
  NotificationSurface,
  OperationalSurface,
  RecordWorkbenchSurface,
  Stack,
  Text,
} from '@rottay/design-system';

// decision-inbox fixtures

interface DecisionQueueItem {
  id: string;
  subject: string;
  submittedBy: string;
  amount: string;
  status: string;
}

const decisionQueueItems: DecisionQueueItem[] = [
  {
    id: 'd1',
    subject: 'Expense report for Q3 travel',
    submittedBy: 'Dana Reyes',
    amount: '$482.10',
    status: 'Pending',
  },
  {
    id: 'd2',
    subject: 'Contractor invoice number 4021',
    submittedBy: 'Marcus Webb',
    amount: '$1,250.00',
    status: 'Pending',
  },
  {
    id: 'd3',
    subject: 'Equipment purchase request',
    submittedBy: 'Priya Shah',
    amount: '$3,899.00',
    status: 'Escalated',
  },
];

// operational fixtures

type OperationalFeedRecord = { key: string; title: string; detail: string };

const operationalFeedItems: OperationalFeedRecord[] = [
  { key: 'e1', title: 'Queue depth crossed the warning threshold', detail: 'Support queue' },
  { key: 'e2', title: 'New incident opened', detail: 'Payments service' },
  { key: 'e3', title: 'Deployment completed', detail: 'Checkout service' },
];

// list fixtures

interface ListRow {
  id: string;
  name: string;
  owner: string;
  status: string;
  updatedAt: string;
}

const listRows: ListRow[] = [
  { id: '1', name: 'Draft proposal', owner: 'Dana Reyes', status: 'In review', updatedAt: '2026-07-10' },
  { id: '2', name: 'Vendor agreement', owner: 'Marcus Webb', status: 'Approved', updatedAt: '2026-07-08' },
  { id: '3', name: 'Budget request', owner: 'Priya Shah', status: 'Draft', updatedAt: '2026-07-12' },
  { id: '4', name: 'Onboarding checklist', owner: 'Ana Torres', status: 'Approved', updatedAt: '2026-07-05' },
];

const listAdapter: EntityAdapter<ListRow, ListRow> = {
  entity: 'record',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [
    { key: 'name', fieldId: 'record.name' },
    { key: 'owner', fieldId: 'record.owner' },
    { key: 'status', fieldId: 'record.status' },
    { key: 'updatedAt', fieldId: 'record.updatedAt' },
  ],
};

export function ConfigBSurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'decision-inbox':
      return (
        <DecisionInboxSurface<DecisionQueueItem>
          queueName="Approval queue"
          subtitle="Review pending requests before they expire."
          workspace={{ data: decisionQueueItems }}
          columns={[
            { key: 'subject', header: 'Subject', accessorKey: 'subject' },
            { key: 'submittedBy', header: 'Submitted by', accessorKey: 'submittedBy' },
            { key: 'amount', header: 'Amount', accessorKey: 'amount' },
            { key: 'status', header: 'Status', accessorKey: 'status' },
          ]}
          rowKey="id"
          decisions={[
            { key: 'approve', label: 'Approve', variant: 'primary' },
            { key: 'reject', label: 'Reject', variant: 'danger', confirm: 'Reject this request?' },
          ]}
          onDecision={() => undefined}
          actions={() => (
            <Flex gap={8}>
              <Button size="sm" variant="primary" onClick={() => undefined}>
                Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => undefined}>
                Reject
              </Button>
            </Flex>
          )}
          reviewRail={{
            render: (item) => (
              <Stack spacing="sm">
                <Text weight="medium">{item.subject}</Text>
                <Text size="sm" color="muted">{`Submitted by ${item.submittedBy}`}</Text>
                <Text size="sm">{item.amount}</Text>
              </Stack>
            ),
          }}
          sla={{ getDeadline: () => new Date('2026-01-01T00:00:00Z') }}
        />
      );
    case 'record-workbench':
      return (
        <RecordWorkbenchSurface
          title="Ravi Desai"
          subtitle="Record RB-2291"
          status={{ label: 'Active', variant: 'success' }}
          tabs={[
            {
              key: 'overview',
              label: 'Overview',
              render: () => (
                <Stack spacing="sm">
                  <Text>Primary record summary and recent updates appear here.</Text>
                  <Text size="sm" color="muted">
                    Last updated three days ago by the record owner.
                  </Text>
                </Stack>
              ),
            },
            {
              key: 'history',
              label: 'History',
              badge: 5,
              render: () => (
                <Stack spacing="sm">
                  <Text>Status changed from Draft to Active.</Text>
                  <Text size="sm" color="muted">
                    Owner reassigned to a new team member.
                  </Text>
                </Stack>
              ),
            },
            {
              key: 'notes',
              label: 'Notes',
              render: () => <Text>No structured notes have been added to this record yet.</Text>,
            },
          ]}
          actions={[
            { key: 'edit', label: 'Edit', variant: 'primary', onClick: () => undefined },
            { key: 'archive', label: 'Archive', variant: 'secondary', onClick: () => undefined },
          ]}
          metadata={[
            { key: 'owner', label: 'Owner', value: 'Priya Shah' },
            { key: 'created', label: 'Created', value: 'Jul 14, 2026' },
            { key: 'status', label: 'Status', value: 'Active' },
          ]}
        />
      );
    case 'file-browser':
      return (
        <FileBrowserSurface
          config={{
            visual: { viewMode: 'list' },
            presentation: {
              chrome: { title: 'Project files', subtitle: 'Shared workspace storage' },
            },
            behavior: {
              files: [
                {
                  id: 'f1',
                  name: 'quarterly-report.pdf',
                  type: 'file',
                  mimeType: 'application/pdf',
                  size: 245678,
                  modifiedAt: '2026-07-10',
                },
                {
                  id: 'f2',
                  name: 'cover-photo.jpg',
                  type: 'file',
                  mimeType: 'image/jpeg',
                  size: 88210,
                  modifiedAt: '2026-07-12',
                },
                {
                  id: 'f3',
                  name: 'budget.xlsx',
                  type: 'file',
                  mimeType: 'application/vnd.ms-excel',
                  size: 51234,
                  modifiedAt: '2026-07-08',
                },
              ],
              folders: [
                { id: 'd1', name: 'Contracts', type: 'folder', childCount: 8, modifiedAt: '2026-07-09' },
                { id: 'd2', name: 'Design assets', type: 'folder', childCount: 21, modifiedAt: '2026-07-11' },
              ],
              currentPath: [],
              onUpload: () => undefined,
              onDelete: () => undefined,
              onNavigate: () => undefined,
              onSelectionChange: () => undefined,
              onViewModeChange: () => undefined,
              onRename: () => undefined,
            },
          }}
        />
      );
    case 'notification':
      return (
        <NotificationSurface
          config={{
            visual: { layout: 'sections' },
            presentation: {
              chrome: { title: 'Notifications' },
            },
            behavior: {
              notifications: [
                {
                  id: 'n1',
                  title: 'New comment on your draft',
                  message: 'A teammate left feedback on the record you submitted this morning.',
                  timestamp: '2 hours ago',
                  read: false,
                  type: 'info',
                },
                {
                  id: 'n2',
                  title: 'Weekly summary ready',
                  message: 'Your activity summary for last week is ready to review.',
                  timestamp: '1 day ago',
                  read: false,
                  type: 'success',
                },
                {
                  id: 'n3',
                  title: 'Sync failed for one item',
                  message: 'One record could not be synced. Retry from the activity log.',
                  timestamp: '2 days ago',
                  read: true,
                  type: 'error',
                },
                {
                  id: 'n4',
                  title: 'Storage nearing its limit',
                  message: 'Workspace storage is at 82 percent of the plan limit.',
                  timestamp: '3 days ago',
                  read: true,
                  type: 'warning',
                },
              ],
              preferences: [
                {
                  id: 'p1',
                  label: 'Email digest',
                  description: 'Daily summary of unread items.',
                  channel: 'email',
                  enabled: true,
                  category: 'General',
                },
                {
                  id: 'p2',
                  label: 'Push alerts',
                  description: 'Real time alerts on this device.',
                  channel: 'push',
                  enabled: false,
                  category: 'General',
                },
                {
                  id: 'p3',
                  label: 'SMS for critical items',
                  description: 'Only for items marked urgent.',
                  channel: 'sms',
                  enabled: false,
                  category: 'Critical',
                },
              ],
              onMarkRead: () => undefined,
              onMarkAllRead: () => undefined,
              onDelete: () => undefined,
              onPreferenceChange: () => undefined,
              pagination: { current: 1, pageSize: 10, total: 4, onChange: () => undefined },
            },
          }}
        />
      );
    case 'form':
      return (
        <FormSurface
          config={{
            visual: { layout: 'vertical', columns: 1 },
            presentation: {
              chrome: { title: 'Create record', subtitle: 'Fill in the fields below to add a new record.' },
              description: 'Fields marked as required must be completed before submitting.',
            },
            behavior: {
              fields: [
                {
                  fieldId: 'record-name',
                  name: 'name',
                  label: 'Name',
                  type: 'text',
                  placeholder: 'Enter a name',
                  required: true,
                },
                {
                  fieldId: 'record-owner',
                  name: 'owner',
                  label: 'Owner',
                  type: 'text',
                  placeholder: 'Assign an owner',
                },
                {
                  fieldId: 'record-category',
                  name: 'category',
                  label: 'Category',
                  type: 'select',
                  options: [
                    { label: 'General', value: 'general' },
                    { label: 'Priority', value: 'priority' },
                  ],
                },
                {
                  fieldId: 'record-notes',
                  name: 'notes',
                  label: 'Notes',
                  type: 'textarea',
                  placeholder: 'Add any additional context',
                  description: 'Optional context for reviewers.',
                },
              ],
              submitAction: {
                id: 'submit-record',
                label: 'Create record',
                variant: 'primary',
                onClick: () => undefined,
              },
              cancelAction: { id: 'cancel-record', label: 'Cancel', onClick: () => undefined },
            },
          }}
        />
      );
    case 'operational':
      return (
        <OperationalSurface<OperationalFeedRecord>
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Operations overview' },
              primaryPanel: (
                <Stack spacing="sm">
                  <Text weight="medium">Active incidents</Text>
                  <Text size="sm" color="muted">
                    Two incidents are open and assigned to the on-call engineer.
                  </Text>
                </Stack>
              ),
              queue: (
                <Stack spacing="sm">
                  <Text>14 items are waiting for review.</Text>
                  <Text size="sm" color="muted">
                    The oldest item has been waiting 38 minutes.
                  </Text>
                </Stack>
              ),
              sections: [
                {
                  key: 'throughput',
                  title: 'Throughput',
                  description: 'Requests processed per hour across regions.',
                  content: <Text size="sm">312 requests per hour, steady over the last hour.</Text>,
                  span: 6,
                },
                {
                  key: 'latency',
                  title: 'Latency',
                  description: 'P95 response time across services.',
                  content: <Text size="sm">P95 latency is 420 milliseconds, within target range.</Text>,
                  span: 6,
                },
              ],
            },
            behavior: {
              stats: [
                { key: 'open-incidents', label: 'Open incidents', value: 2, change: 1, changeType: 'increase' },
                { key: 'queue-depth', label: 'Queue depth', value: 14 },
                { key: 'avg-resolution', label: 'Avg resolution', value: 38, suffix: 'm' },
              ],
              refreshAction: { id: 'refresh', label: 'Refresh', onClick: () => undefined },
              feed: {
                items: operationalFeedItems,
                renderItem: (item) => (
                  <Stack spacing="xs">
                    <Text weight="medium">{item.title}</Text>
                    <Text size="sm" color="muted">{item.detail}</Text>
                  </Stack>
                ),
              },
            },
          }}
        />
      );
    case 'list':
      return (
        <ListSurface<ListRow, ListRow>
          data={listRows}
          adapter={listAdapter}
          config={{
            visual: { defaultView: 'table' },
            presentation: {
              chrome: { title: 'Records' },
            },
            behavior: {
              columns: [
                { key: 'name', fieldId: 'record.name', header: 'Name', accessorKey: 'name' },
                { key: 'owner', fieldId: 'record.owner', header: 'Owner', accessorKey: 'owner' },
                { key: 'status', fieldId: 'record.status', header: 'Status', accessorKey: 'status' },
                { key: 'updatedAt', fieldId: 'record.updatedAt', header: 'Updated', accessorKey: 'updatedAt' },
              ],
              rowKey: 'id',
              primaryAction: { id: 'create', label: 'New record', variant: 'primary', onClick: () => undefined },
              rowActions: [{ id: 'view', label: 'View', onClick: () => undefined }],
            },
          }}
        />
      );
    default:
      return null;
  }
}

export const CONFIG_B_SLUGS = [
  'decision-inbox',
  'record-workbench',
  'file-browser',
  'notification',
  'form',
  'operational',
  'list',
];
