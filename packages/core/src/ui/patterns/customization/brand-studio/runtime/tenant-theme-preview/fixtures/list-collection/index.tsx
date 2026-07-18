'use client';

/**
 * @fileoverview Domain-free ListSurface fixture for the tenant-theme preview.
 *
 * Renders a generic collection list (records with a status and a score) so a
 * compiled tenant theme visibly re-skins a real list surface -- table chrome,
 * row rhythm, filter pills, primary action -- inside the preview scope. It uses
 * only generic vocabulary (records, workspaces, status, score) and knows nothing
 * about tenants, candidates, roles, companies, interviews, or events.
 *
 * @remarks
 * This is a preview fixture, not product code. It lives under a `fixtures/`
 * container so it may compose the surface tier for demonstration; production
 * Brand Studio never imports it (the surfaces reach the preview through the
 * consumer-provided galleries slot).
 */

import type { EntityAdapter } from '@/ui/surfaces';
import { ListSurface } from '@/ui/surfaces';
import { Card, Text } from '@/ui/primitives';

interface PreviewRecord {
  id: string;
  name: string;
  status: string;
  score: number;
}

const PREVIEW_ROWS: PreviewRecord[] = [
  { id: 'rec-1', name: 'Alpha workspace', status: 'Active', score: 92 },
  { id: 'rec-2', name: 'Beta workspace', status: 'Paused', score: 58 },
  { id: 'rec-3', name: 'Gamma workspace', status: 'Active', score: 24 },
  { id: 'rec-4', name: 'Delta workspace', status: 'Archived', score: 71 },
];

const PREVIEW_ADAPTER: EntityAdapter<PreviewRecord, PreviewRecord> = {
  entity: 'preview-record',
  version: '1.0.0',
  map: (row) => row,
  fields: [
    { key: 'name', fieldId: 'preview.name' },
    { key: 'status', fieldId: 'preview.status' },
    { key: 'score', fieldId: 'preview.score' },
  ],
};

const noop = (): void => undefined;

/** A themed list collection surface for the live preview scope. */
export function ListCollectionPreviewFixture(): React.ReactElement {
  return (
    <ListSurface
      data={PREVIEW_ROWS}
      adapter={PREVIEW_ADAPTER}
      config={{
        visual: { defaultView: 'table', mobileDefaultView: 'cards', allowViewSwitch: true },
        presentation: {
          chrome: { title: 'Records' },
          toolbarStart: <Text size="xs">Scoped preview collection</Text>,
          renderCell: {
            'preview.name': (value) => <Text weight="semibold">{String(value)}</Text>,
          },
          renderCard: (row) => (
            <Card variant="outlined">
              <Card.Body>{row.name}</Card.Body>
            </Card>
          ),
        },
        behavior: {
          columns: [
            { key: 'name', fieldId: 'preview.name', header: 'Name', accessorKey: 'name' },
            { key: 'status', fieldId: 'preview.status', header: 'Status', accessorKey: 'status' },
            { key: 'score', fieldId: 'preview.score', header: 'Score', accessorKey: 'score' },
          ],
          filters: [
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [{ label: 'Active', value: 'Active' }],
            },
          ],
          filterValues: { status: 'Active' },
          pagination: false,
          primaryAction: { id: 'create', label: 'New record', variant: 'primary', onClick: noop },
          rowActions: [{ id: 'view', label: 'View', onClick: noop }],
        },
      }}
    />
  );
}
