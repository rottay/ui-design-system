'use client';

/**
 * StaffSwapBoard - Table Preset
 * Tabular view of swap requests
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffSwapBoardProps, ShiftSwapRequest } from '../../core';

const MOCK_REQUESTS: ShiftSwapRequest[] = [
  { id: '1', requesterId: '1', requesterName: 'Maria S.', targetId: '2', targetName: 'Carlos R.', shiftDate: '2024-08-10', shiftTime: '08:00 - 14:00', shiftRole: 'Bartender', reason: 'Doctor appointment', status: 'pending', createdAt: new Date('2024-08-05T10:00:00') },
  { id: '2', requesterId: '3', requesterName: 'Ana L.', shiftDate: '2024-08-11', shiftTime: '18:00 - 22:00', shiftRole: 'Server', status: 'pending', createdAt: new Date('2024-08-05T14:00:00') },
  { id: '3', requesterId: '4', requesterName: 'Diego M.', targetId: '5', targetName: 'Laura P.', shiftDate: '2024-08-09', shiftTime: '10:00 - 16:00', shiftRole: 'Sound Tech', status: 'approved', createdAt: new Date('2024-08-04T09:00:00'), respondedAt: new Date('2024-08-04T11:00:00'), respondedBy: 'Admin' },
];

const STATUS_COLORS: Record<string, string> = { pending: 'warning', approved: 'success', rejected: 'error', cancelled: 'secondary' };

export const TableStaffSwapBoard = createPreset<StaffSwapBoardProps>({
  name: 'StaffSwapBoard.Table',
  render: ({ primitives, props, tokens }: PresetContext<StaffSwapBoardProps>) => {
    const { Box, Text } = primitives;
    const { requests: propRequests, onApprove, onReject, onRequestClick, onCreateRequest, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const requests = propRequests?.length ? propRequests : MOCK_REQUESTS;
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = useMemo(() => statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter), [requests, statusFilter]);
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Shift Swap Requests</Text>
          <button onClick={onCreateRequest} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>+ New Request</button>
        </div>

        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.full, border: statusFilter === s ? 'none' : `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: statusFilter === s ? tokens.colors.primaryScale[600] : tokens.colors.common.white, color: statusFilter === s ? tokens.colors.common.white : tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', textTransform: 'capitalize' }}>{s}</button>
          ))}
        </div>

        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {['Requester', 'Shift', 'Role', 'Swap With', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: tokens.spacing[3], textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} onClick={() => onRequestClick?.(r.id)} style={{ cursor: 'pointer' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50]; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{r.requesterName}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{r.shiftDate} {r.shiftTime}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{r.shiftRole}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{r.targetName || '-'}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason || '-'}</td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <span style={{ ...createBadgeStyle(tokens, STATUS_COLORS[r.status] as any), fontSize: tokens.typography.fontSize.xs }}>{r.status}</span>
                  </td>
                  <td style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                        <button onClick={e => { e.stopPropagation(); onApprove?.(r.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Approve</button>
                        <button onClick={e => { e.stopPropagation(); onReject?.(r.id); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.errorScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
