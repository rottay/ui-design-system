'use client';

import { useState } from 'react';
import {
  Box,
  PatternApprovalInbox,
  PatternModerationGallery,
  PatternOperationalLedger,
  PatternShiftMatrix,
} from '@rottay/design-system';
import { createThumbnail } from '../pattern-preview-shared';

export function ApprovalInboxPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 840 }}>
      <PatternApprovalInbox
        groups={[
          {
            domain: 'Finance',
            items: [
              {
                id: 'ap-1',
                title: 'Invoice #4521',
                subtitle: 'AV supplier payout',
                amount: 12500,
                risk: 'low',
                submittedAt: '2026-04-18T09:00:00Z',
                slaDeadline: '2026-04-21T17:00:00Z',
              },
            ],
          },
          {
            domain: 'Legal',
            items: [
              {
                id: 'ap-2',
                title: 'Venue contract revision',
                subtitle: 'Main hall amendment',
                amount: 48000,
                risk: 'medium',
                submittedAt: '2026-04-19T11:30:00Z',
                slaDeadline: '2026-04-22T17:00:00Z',
              },
            ],
          },
        ]}
        onApprove={() => undefined}
        onReject={() => undefined}
        onBatchApprove={() => undefined}
      />
    </Box>
  );
}

export function ModerationGalleryPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 920 }}>
      <PatternModerationGallery
        items={[
          {
            id: 'mg-1',
            thumbnailUrl: createThumbnail('Pending', '#7c3aed'),
            type: 'image',
            status: 'pending',
            engagement: 142,
            uploadedBy: 'ops-team',
            uploadedAt: '2026-04-18T08:00:00Z',
          },
          {
            id: 'mg-2',
            thumbnailUrl: createThumbnail('Approved', '#0f766e'),
            type: 'image',
            status: 'approved',
            engagement: 284,
            uploadedBy: 'growth-team',
            uploadedAt: '2026-04-18T10:00:00Z',
          },
          {
            id: 'mg-3',
            thumbnailUrl: createThumbnail('Rejected', '#b91c1c'),
            type: 'video',
            status: 'rejected',
            engagement: 51,
            uploadedBy: 'partner',
            uploadedAt: '2026-04-19T13:00:00Z',
          },
        ]}
        selectable
        onApprove={() => undefined}
        onReject={() => undefined}
        onBulkAction={() => undefined}
      />
    </Box>
  );
}

export function OperationalLedgerPreview() {
  const [filters, setFilters] = useState<any>({ types: ['credit', 'debit'] });

  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternOperationalLedger
        entries={[
          {
            id: 'led-1',
            timestamp: '2026-04-18T10:00:00Z',
            description: 'Sponsorship deposit',
            quantity: 15000,
            type: 'credit',
            actor: 'Finance bot',
            reason: 'SPN-018',
          },
          {
            id: 'led-2',
            timestamp: '2026-04-19T14:30:00Z',
            description: 'Venue payment',
            quantity: 4800,
            type: 'debit',
            actor: 'Ops team',
            reference: 'INV-1184',
          },
        ]}
        filters={filters}
        onFilter={setFilters}
      />
    </Box>
  );
}

export function ShiftMatrixPreview() {
  return (
    <Box style={{ width: '100%', maxWidth: 860 }}>
      <PatternShiftMatrix
        roles={['Check-in', 'Security', 'Stage Crew']}
        timeSlots={[
          { label: '09:00-12:00', start: '09:00', end: '12:00' },
          { label: '12:00-15:00', start: '12:00', end: '15:00' },
          { label: '15:00-18:00', start: '15:00', end: '18:00' },
        ]}
        assignments={[
          {
            role: 'Check-in',
            timeSlot: '09:00-12:00',
            assigned: 3,
            required: 4,
            staff: ['Ana', 'Jules', 'Lina'],
          },
          {
            role: 'Security',
            timeSlot: '12:00-15:00',
            assigned: 4,
            required: 4,
            staff: ['Leo', 'Finn', 'Maya', 'Noah'],
          },
          {
            role: 'Stage Crew',
            timeSlot: '15:00-18:00',
            assigned: 2,
            required: 3,
            staff: ['Omar', 'June'],
          },
        ]}
        onQuickAssign={() => undefined}
      />
    </Box>
  );
}
