'use client';

/* R6 probe fixtures, lane A: families whose contract-test fixtures reference
   test-local scope that cannot be transplanted. */

import type { ReactNode } from 'react';
import {
  ChatSurface,
  CollectionWorkspaceSurface,
  DetailFormSurface,
  DetailSurface,
  GuidedDraftFormSurface,
  MediaSurface,
  WizardSurface,
} from '@rottay/design-system';

interface ProjectRecord {
  id: string;
  name: string;
  owner: string;
  status: string;
  updatedAt: string;
  summary: string;
}

const PROJECT_RECORD: ProjectRecord = {
  id: 'rec-482',
  name: 'Quarterly launch plan',
  owner: 'Alex Rivera',
  status: 'Active',
  updatedAt: '2026-07-14',
  summary: 'Tracks launch milestones and sign-offs for this quarter.',
};

interface CollectionRecordRow {
  id: string;
  name: string;
  owner: string;
  status: string;
  updatedAt: string;
}

const COLLECTION_ROWS: CollectionRecordRow[] = [
  { id: 'rec-1', name: 'Quarterly launch plan', owner: 'Alex Rivera', status: 'Active', updatedAt: '2026-07-10' },
  { id: 'rec-2', name: 'Budget review', owner: 'Priya Nair', status: 'Draft', updatedAt: '2026-07-11' },
  { id: 'rec-3', name: 'Vendor agreement', owner: 'Sam Okafor', status: 'Archived', updatedAt: '2026-07-05' },
  { id: 'rec-4', name: 'Onboarding checklist', owner: 'Alex Rivera', status: 'Active', updatedAt: '2026-07-12' },
  { id: 'rec-5', name: 'Design review notes', owner: 'Priya Nair', status: 'Active', updatedAt: '2026-07-13' },
  { id: 'rec-6', name: 'Security audit', owner: 'Sam Okafor', status: 'Draft', updatedAt: '2026-07-09' },
];

// Deterministic inline placeholder thumbnails -- self-contained (no network
// request), so MediaSurface gallery cards render identically on every capture.
const MEDIA_SWATCH_A =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'%3E%3Crect width='4' height='3' fill='%2394a3b8'/%3E%3C/svg%3E";
const MEDIA_SWATCH_B =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'%3E%3Crect width='4' height='3' fill='%23a3a3a3'/%3E%3C/svg%3E";
const MEDIA_SWATCH_C =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3'%3E%3Crect width='4' height='3' fill='%23cbd5e1'/%3E%3C/svg%3E";

export function ConfigASurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'detail':
      return (
        <DetailSurface<ProjectRecord, ProjectRecord>
          data={PROJECT_RECORD}
          adapter={{
            entity: 'record',
            version: '1.0',
            map: (raw: ProjectRecord) => raw,
            fields: [
              { key: 'name', fieldId: 'record.name', label: 'Name' },
              { key: 'owner', fieldId: 'record.owner', label: 'Owner' },
              { key: 'status', fieldId: 'record.status', label: 'Status' },
            ],
          }}
          config={{
            visual: {},
            presentation: {
              chrome: { breadcrumbs: [{ label: 'Records' }, { label: 'Quarterly launch plan' }] },
              title: (item) => item.name,
              subtitle: (item) => item.summary,
              status: (item) => ({ label: item.status }),
              tabs: [
                {
                  key: 'overview',
                  label: 'Overview',
                  content: (item) => <div>Owner: {item.owner}. Updated {item.updatedAt}.</div>,
                },
                {
                  key: 'activity',
                  label: 'Activity',
                  content: () => <div>No activity recorded for this window.</div>,
                },
                {
                  key: 'details',
                  label: 'Details',
                  content: (item) => <div>Status: {item.status}</div>,
                },
              ],
              sidebar: () => <div>Linked records: 3.</div>,
            },
            behavior: {
              actions: [
                { id: 'edit', label: 'Edit', variant: 'primary', onClick: (() => undefined) },
                { id: 'archive', label: 'Archive', onClick: (() => undefined) },
              ],
              activeTab: 'overview',
              onTabChange: (() => undefined),
            },
          }}
        />
      );
    case 'chat':
      return (
        <ChatSurface
          config={{
            visual: { composerRows: 3 },
            presentation: {
              chrome: { title: 'Support conversation' },
              composerPlaceholder: 'Write a reply',
              sidebar: <div>Participants: Owner, Reviewer.</div>,
            },
            behavior: {
              messages: [
                { id: 'msg-1', author: 'Owner', align: 'start', body: 'The draft is ready for review.', timestamp: '09:02' },
                { id: 'msg-2', author: 'Reviewer', align: 'end', body: 'Looks good, one comment on the summary section.', timestamp: '09:05' },
                { id: 'msg-3', author: 'Owner', align: 'start', body: 'Updated the summary section just now.', timestamp: '09:12' },
                { id: 'msg-4', author: 'Reviewer', align: 'end', body: 'Approved, ready to publish.', timestamp: '09:14' },
              ],
              onSend: (() => undefined),
            },
          }}
        />
      );
    case 'media':
      return (
        <MediaSurface
          config={{
            visual: { layout: 'detail', columns: 3 },
            presentation: {
              chrome: { title: 'Media library' },
            },
            behavior: {
              items: [
                { id: 'item-1', src: MEDIA_SWATCH_A, title: 'Cover photo', description: 'Wide shot used for the listing header.' },
                { id: 'item-2', src: MEDIA_SWATCH_B, title: 'Detail shot', description: 'Close-up of the primary feature.' },
                { id: 'item-3', src: MEDIA_SWATCH_C, title: 'Floor plan', description: 'Top-down layout reference.' },
                { id: 'item-4', src: MEDIA_SWATCH_A, title: 'Exterior view', description: 'Entrance and surrounding area.' },
                { id: 'item-5', src: MEDIA_SWATCH_B, title: 'Night shot', description: 'Evening lighting reference.' },
              ],
              onSelectItem: (() => undefined),
            },
          }}
        />
      );
    case 'detail-form':
      return (
        <DetailFormSurface
          config={{
            visual: {},
            presentation: {
              chrome: { title: 'Edit record' },
              summary: <div>Record rec-482, last updated 2026-07-14.</div>,
              summaryTitle: 'Record summary',
            },
            behavior: {
              fields: [
                { name: 'title', label: 'Title', type: 'text', required: true },
                { name: 'owner', label: 'Owner', type: 'text' },
                {
                  name: 'status',
                  label: 'Status',
                  type: 'select',
                  options: [
                    { label: 'Draft', value: 'draft' },
                    { label: 'Active', value: 'active' },
                    { label: 'Archived', value: 'archived' },
                  ],
                },
                { name: 'notes', label: 'Notes', type: 'textarea' },
              ],
              initialValues: {
                title: 'Quarterly launch plan',
                owner: 'Alex Rivera',
                status: 'draft',
                notes: 'Reviewed once, needs a final sign-off before publishing.',
              },
              submitAction: { id: 'save-record', label: 'Save changes', variant: 'primary', onClick: (() => undefined) },
              cancelAction: { id: 'cancel-edit', label: 'Cancel', onClick: (() => undefined) },
            },
          }}
        />
      );
    case 'guided-draft-form':
      return (
        <GuidedDraftFormSurface
          title="Create record"
          subtitle="Complete each section before submitting."
          sections={[
            {
              key: 'basics',
              title: 'Basics',
              description: 'Core identifying information.',
              isComplete: true,
              render: () => (
                <div>
                  <div>Title: Quarterly launch plan</div>
                  <div>Owner: Alex Rivera</div>
                </div>
              ),
            },
            {
              key: 'details',
              title: 'Details',
              description: 'Supporting context for reviewers.',
              hasErrors: true,
              render: () => (
                <div>
                  <div>Description: Tracks launch milestones and sign-offs for this quarter.</div>
                  <div>Priority: High</div>
                </div>
              ),
            },
            {
              key: 'review',
              title: 'Review',
              description: 'Confirm the details before submitting.',
              render: () => <div>Everything above will be saved when this draft is submitted.</div>,
            },
          ]}
          draftStatus="saved"
          lastSavedAt="09:14"
          draftRecovery={{
            hasDraft: true,
            onRecover: (() => undefined),
            onDiscard: (() => undefined),
            draftDate: 'Yesterday',
          }}
          templates={{
            items: [{ id: 'standard', name: 'Standard template', description: 'Default section layout.' }],
            onSelect: (() => undefined),
          }}
          validationIssues={[
            { field: 'Priority', message: 'Confirm the priority before submitting.', severity: 'warning', sectionKey: 'details' },
          ]}
          onSubmit={(() => undefined)}
          submitLabel="Submit draft"
          secondaryActions={[{ key: 'save-draft', label: 'Save draft', onClick: (() => undefined) }]}
        />
      );
    case 'wizard':
      return (
        <WizardSurface
          config={{
            visual: { orientation: 'horizontal', showProgress: true },
            presentation: {
              chrome: { title: 'Create record' },
              aside: <div>Complete each step, then review before finishing.</div>,
            },
            behavior: {
              steps: [
                {
                  key: 'basics',
                  title: 'Basics',
                  description: 'Name and type the new record.',
                  fields: [
                    { name: 'name', label: 'Name', type: 'text', required: true },
                    {
                      name: 'type',
                      label: 'Type',
                      type: 'select',
                      options: [
                        { label: 'Standard', value: 'standard' },
                        { label: 'Priority', value: 'priority' },
                      ],
                    },
                  ],
                },
                {
                  key: 'details',
                  title: 'Details',
                  description: 'Add supporting details for reviewers.',
                  fields: [
                    { name: 'description', label: 'Description', type: 'textarea' },
                    { name: 'owner', label: 'Owner', type: 'text' },
                  ],
                },
                {
                  key: 'review',
                  title: 'Review',
                  description: 'Confirm the details before finishing.',
                  content: <div>Review the entered values, then complete the flow.</div>,
                },
              ],
              initialValues: {
                name: 'Quarterly launch plan',
                type: 'standard',
                owner: 'Alex Rivera',
                description: 'Tracks launch milestones and sign-offs for this quarter.',
              },
              currentStep: 1,
              submitAction: { id: 'complete-setup', label: 'Complete', variant: 'primary', onClick: (() => undefined) },
            },
          }}
        />
      );
    case 'collection-workspace':
      return (
        <CollectionWorkspaceSurface<CollectionRecordRow>
          title="Records"
          subtitle="All records in this workspace."
          data={COLLECTION_ROWS}
          columns={[
            { key: 'name', header: 'Name', accessorKey: 'name', sortable: true },
            { key: 'owner', header: 'Owner', accessorKey: 'owner' },
            { key: 'status', header: 'Status', accessorKey: 'status' },
            { key: 'updatedAt', header: 'Updated', accessorKey: 'updatedAt' },
          ]}
          rowKey="id"
          controls={{ search: { enabled: true, placeholder: 'Search records' } }}
          behavior={{
            pagination: { current: 1, pageSize: 10, total: COLLECTION_ROWS.length, onChange: (() => undefined) },
            selection: { enabled: true },
          }}
        />
      );
    default:
      return null;
  }
}

export const CONFIG_A_SLUGS = [
  'detail',
  'chat',
  'media',
  'detail-form',
  'guided-draft-form',
  'wizard',
  'collection-workspace',
];
