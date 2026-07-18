'use client';

import { useState, type ReactNode } from 'react';
import {
  Box,
  DashboardSurface,
  ListSurface,
  PatternStatsGrid,
  Text,
  WizardSurface,
  type EntityAdapter,
} from '@rottay/design-system';

// Surface recipes that must not be rendered three times in the engine
// comparison grid (e.g. full-bleed overlays). Empty for now.
export const SINGLE_RUNTIME_SURFACE_SLUGS = new Set<string>([]);

// ---------------------------------------------------------------------------
// Domain-free record fixtures shared across surface previews.
// Neutral vocabulary only (records/items/entries) per the DS ownership law.
// ---------------------------------------------------------------------------

interface RawRecord {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'paused' | 'archived';
  updated: string;
  usage: number;
}

interface RecordView extends RawRecord {
  utilization: string;
}

const RECORD_ROWS: RawRecord[] = [
  { id: 'rec-1', name: 'Quarterly rollout', owner: 'Ana Porter', status: 'active', updated: 'Apr 18', usage: 92 },
  { id: 'rec-2', name: 'Access review', owner: 'Marco Silva', status: 'paused', updated: 'Apr 12', usage: 48 },
  { id: 'rec-3', name: 'Data import', owner: 'Jules Carter', status: 'archived', updated: 'Apr 05', usage: 16 },
];

const recordAdapter: EntityAdapter<RawRecord, RecordView> = {
  entity: 'record',
  version: '1.0',
  map: (raw) => ({ ...raw, utilization: `${raw.usage}%` }),
  fields: [
    { key: 'name', fieldId: 'record.name', label: 'Name' },
    { key: 'owner', fieldId: 'record.owner', label: 'Owner' },
    { key: 'status', fieldId: 'record.status', label: 'Status' },
    { key: 'updated', fieldId: 'record.updated', label: 'Updated' },
    { key: 'utilization', fieldId: 'record.utilization', label: 'Utilization' },
  ],
};

function DashboardFixture() {
  return (
    <Box style={{ width: '100%' }}>
      <DashboardSurface
        config={{
          visual: {},
          presentation: {
            chrome: {
              title: 'Operations overview',
              subtitle: 'Live view of records, tasks, and coverage',
            },
            sections: [
              {
                key: 'quick-stats',
                title: 'Quick stats',
                content: (
                  <PatternStatsGrid
                    stats={[
                      { key: 'records', label: 'Records', value: 248 },
                      { key: 'tasks', label: 'Open tasks', value: 36 },
                      { key: 'coverage', label: 'Coverage', value: '97%' },
                      { key: 'sla', label: 'SLA hit rate', value: '94%' },
                    ]}
                    columns={4}
                    variant="glass"
                  />
                ),
              },
            ],
          },
          behavior: {
            stats: [
              { key: 'active', label: 'Active records', value: 4 },
              { key: 'live', label: 'Live now', value: 1 },
              { key: 'today', label: 'Updated today', value: 18 },
              { key: 'queue', label: 'In queue', value: 342 },
            ],
          },
        }}
      />
    </Box>
  );
}

function ListFixture() {
  return (
    <Box style={{ width: '100%' }}>
      <ListSurface<RawRecord, RecordView>
        data={RECORD_ROWS}
        adapter={recordAdapter}
        config={{
          visual: { defaultView: 'table', allowViewSwitch: true, cardMinWidth: 300 },
          presentation: {
            chrome: {
              title: 'Records',
              subtitle: 'Paginated records with search, filter, and sort',
            },
          },
          behavior: {
            columns: [
              { key: 'name', fieldId: 'record.name', header: 'Name', sortable: true },
              { key: 'owner', fieldId: 'record.owner', header: 'Owner' },
              { key: 'status', fieldId: 'record.status', header: 'Status' },
              { key: 'updated', fieldId: 'record.updated', header: 'Updated', sortable: true },
              { key: 'utilization', fieldId: 'record.utilization', header: 'Utilization' },
            ],
            rowKey: 'id',
            primaryAction: { id: 'create', label: 'New record', variant: 'primary' },
            rowActions: [{ id: 'open', label: 'Open', variant: 'secondary' }],
          },
        }}
      />
    </Box>
  );
}

function WizardFixture() {
  const [step, setStep] = useState(0);

  return (
    <Box style={{ width: '100%' }}>
      <WizardSurface
        config={{
          visual: { showProgress: true },
          presentation: {
            chrome: { title: 'Create record', subtitle: 'Set up a record in a few steps' },
          },
          behavior: {
            currentStep: step,
            onStepChange: setStep,
            steps: [
              {
                key: 'basics',
                title: 'Details',
                fields: [
                  { name: 'name', label: 'Name', type: 'text', required: true },
                  { name: 'summary', label: 'Summary', type: 'textarea' },
                ],
              },
              {
                key: 'settings',
                title: 'Settings',
                fields: [
                  { name: 'owner', label: 'Owner', type: 'text' },
                  { name: 'capacity', label: 'Capacity', type: 'number' },
                ],
              },
              {
                key: 'review',
                title: 'Review',
                content: (
                  <Text style={{ color: 'var(--ds-color-text-secondary)' }}>
                    Review the details before saving this record.
                  </Text>
                ),
              },
            ],
            submitAction: {
              id: 'save',
              label: 'Save record',
              variant: 'primary',
              onClick: async () => undefined,
            },
          },
        }}
      />
    </Box>
  );
}

export const SURFACE_PREVIEWS: Record<string, ReactNode> = {
  dashboard: <DashboardFixture />,
  list: <ListFixture />,
  wizard: <WizardFixture />,
};

export function renderSurfacePreview(slug: string) {
  return SURFACE_PREVIEWS[slug] ?? null;
}
