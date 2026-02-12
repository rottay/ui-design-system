'use client';

/**
 * StaffSwapBoard - Board Preset
 * Kanban-style board with columns by status
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type { StaffSwapBoardProps, ShiftSwapRequest } from '../../core';

const MOCK_REQUESTS: ShiftSwapRequest[] = [
  { id: '1', requesterId: '1', requesterName: 'Maria S.', targetId: '2', targetName: 'Carlos R.', shiftDate: '2024-08-10', shiftTime: '08:00 - 14:00', shiftRole: 'Bartender', reason: 'Doctor appointment', status: 'pending', createdAt: new Date('2024-08-05T10:00:00') },
  { id: '2', requesterId: '3', requesterName: 'Ana L.', shiftDate: '2024-08-11', shiftTime: '18:00 - 22:00', shiftRole: 'Server', reason: 'Family event', status: 'pending', createdAt: new Date('2024-08-05T14:00:00') },
  { id: '3', requesterId: '4', requesterName: 'Diego M.', targetId: '5', targetName: 'Laura P.', shiftDate: '2024-08-09', shiftTime: '10:00 - 16:00', shiftRole: 'Sound Tech', status: 'approved', createdAt: new Date('2024-08-04T09:00:00'), respondedAt: new Date('2024-08-04T11:00:00'), respondedBy: 'Admin' },
  { id: '4', requesterId: '2', requesterName: 'Carlos R.', targetId: '1', targetName: 'Maria S.', shiftDate: '2024-08-08', shiftTime: '18:00 - 02:00', shiftRole: 'Security', reason: 'Personal', status: 'rejected', createdAt: new Date('2024-08-03T16:00:00'), respondedAt: new Date('2024-08-03T17:00:00'), respondedBy: 'Admin' },
];

const STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
const STATUS_COLORS: Record<string, string> = { pending: 'warning', approved: 'success', rejected: 'error', cancelled: 'secondary' };

export const BoardStaffSwapBoard = createPreset<StaffSwapBoardProps>({
  name: 'StaffSwapBoard.Board',
  render: ({ primitives, props, tokens }: PresetContext<StaffSwapBoardProps>) => {
    const { Box, Text } = primitives;
    const { requests: propRequests, onApprove, onReject, onRequestClick, onCreateRequest, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const requests = propRequests?.length ? propRequests : MOCK_REQUESTS;

    const byStatus = useMemo(() => {
      const map: Record<string, ShiftSwapRequest[]> = {};
      STATUSES.forEach(s => { map[s] = requests.filter(r => r.status === s); });
      return map;
    }, [requests]);

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>Shift Swap Board</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{requests.length} requests</Text>
          </div>
          <button onClick={onCreateRequest} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Request</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`, gap: tokens.spacing[4] }}>
          {STATUSES.map(status => (
            <div key={status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], textTransform: 'capitalize' }}>{status}</Text>
                <span style={{ ...createBadgeStyle(tokens, STATUS_COLORS[status] as any), fontSize: tokens.typography.fontSize.xs }}>{byStatus[status]?.length || 0}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {(byStatus[status] || []).map(req => (
                  <div
                    key={req.id}
                    onClick={() => onRequestClick?.(req.id)}
                    style={{ ...cardBase, ...hoverStyle, padding: tokens.spacing[3], cursor: 'pointer' }}
                    onMouseEnter={e => { Object.assign(e.currentTarget.style, getHoverTransform(tokens)); }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{req.requesterName}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDate(req.createdAt)}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[1] }}>
                      {req.shiftDate} | {req.shiftTime}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>
                      {req.shiftRole} {req.targetName ? `→ ${req.targetName}` : '(open)'}
                    </Text>
                    {req.reason && <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontStyle: 'italic', display: 'block', marginBottom: tokens.spacing[2] }}>"{req.reason}"</Text>}

                    {status === 'pending' && (
                      <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                        <button onClick={e => { e.stopPropagation(); onApprove?.(req.id); }} style={{ flex: 1, padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Approve</button>
                        <button onClick={e => { e.stopPropagation(); onReject?.(req.id); }} style={{ flex: 1, padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.errorScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
