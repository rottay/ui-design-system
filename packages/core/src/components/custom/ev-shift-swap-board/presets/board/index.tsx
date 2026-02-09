'use client';

/**
 * EvShiftSwapBoard - Board Preset
 * Kanban-style board with 3 columns (Pending, Approved, Rejected),
 * search input, role filter pills, KPI summary cards, hover interactions,
 * approval rate progress bar, and action buttons per request card
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  createProgressBarStyle,
  getHoverTransform,
} from '../../../helpers';
import type { EvShiftSwapBoardProps, SwapRequest } from '../../core';

const MOCK_REQUESTS: SwapRequest[] = [
  { id: 'sw1', requesterName: 'Maria S.', shiftDate: new Date('2026-02-10'), shiftRole: 'Bartender', shiftTime: '18:00-02:00', reason: 'Family event', status: 'pending', createdAt: new Date('2026-02-07') },
  { id: 'sw2', requesterName: 'Carlos R.', targetName: 'Ana L.', shiftDate: new Date('2026-02-11'), shiftRole: 'Security', shiftTime: '16:00-00:00', reason: 'Medical appointment', status: 'approved', createdAt: new Date('2026-02-06') },
  { id: 'sw3', requesterName: 'Diego M.', shiftDate: new Date('2026-02-12'), shiftRole: 'Sound Tech', shiftTime: '14:00-22:00', reason: 'Equipment pickup conflict', status: 'pending', createdAt: new Date('2026-02-08') },
  { id: 'sw4', requesterName: 'Laura P.', targetName: 'Roberto G.', shiftDate: new Date('2026-02-13'), shiftRole: 'Stage Manager', shiftTime: '12:00-20:00', reason: 'Schedule conflict', status: 'rejected', createdAt: new Date('2026-02-05') },
  { id: 'sw5', requesterName: 'Ana L.', shiftDate: new Date('2026-02-14'), shiftRole: 'Server', shiftTime: '17:00-23:00', reason: 'University exam', status: 'pending', createdAt: new Date('2026-02-08') },
  { id: 'sw6', requesterName: 'Roberto G.', targetName: 'Diego M.', shiftDate: new Date('2026-02-15'), shiftRole: 'Bartender', shiftTime: '20:00-04:00', reason: 'Personal commitment', status: 'approved', createdAt: new Date('2026-02-07') },
  { id: 'sw7', requesterName: 'Sofia T.', shiftDate: new Date('2026-02-16'), shiftRole: 'Security', shiftTime: '14:00-22:00', reason: 'Childcare', status: 'matched', createdAt: new Date('2026-02-08') },
  { id: 'sw8', requesterName: 'Pedro K.', shiftDate: new Date('2026-02-17'), shiftRole: 'Server', shiftTime: '16:00-00:00', reason: 'Travel conflict', status: 'pending', createdAt: new Date('2026-02-09') },
  { id: 'sw9', requesterName: 'Elena R.', targetName: 'Laura P.', shiftDate: new Date('2026-02-18'), shiftRole: 'Stage Manager', shiftTime: '10:00-18:00', reason: 'Doctor appointment', status: 'rejected', createdAt: new Date('2026-02-06') },
  { id: 'sw10', requesterName: 'Marco A.', shiftDate: new Date('2026-02-19'), shiftRole: 'Sound Tech', shiftTime: '12:00-20:00', reason: 'Moving day', status: 'pending', createdAt: new Date('2026-02-09') },
];

const ROLE_FILTERS = ['All', 'Bartender', 'Security', 'Server', 'Sound Tech', 'Stage Manager'];

export const BoardEvShiftSwapBoard = createPreset<EvShiftSwapBoardProps>({
  name: 'EvShiftSwapBoard.Board',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvShiftSwapBoardProps>) => {
    const { Box, Text } = primitives;
    const { requests, onApprove, onReject, onVolunteer, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = requests?.length ? requests : MOCK_REQUESTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      return data.filter(r => {
        if (searchTerm && !r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) && !r.shiftRole.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (roleFilter !== 'All' && r.shiftRole !== roleFilter) return false;
        return true;
      });
    }, [data, searchTerm, roleFilter]);

    const pendingCount = data.filter(r => r.status === 'pending').length;
    const approvedCount = data.filter(r => r.status === 'approved' || r.status === 'matched').length;
    const rejectedCount = data.filter(r => r.status === 'rejected').length;
    const resolvedCount = approvedCount + rejectedCount;
    const approvalRate = resolvedCount > 0 ? Math.round((approvedCount / resolvedCount) * 100) : 0;
    const openSwaps = data.filter(r => r.status === 'pending' && !r.targetName).length;

    const approvalBar = useMemo(() => createProgressBarStyle(tokens, {
      percent: approvalRate,
      color: approvalRate >= 70 ? tokens.colors.successScale[500] : approvalRate >= 40 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
    }), [tokens, approvalRate]);

    const columns = [
      { key: 'pending', label: 'Pending', color: tokens.colors.warningScale[500], items: filteredData.filter(r => r.status === 'pending') },
      { key: 'approved', label: 'Approved / Matched', color: tokens.colors.successScale[500], items: filteredData.filter(r => r.status === 'approved' || r.status === 'matched') },
      { key: 'rejected', label: 'Rejected', color: tokens.colors.errorScale[500], items: filteredData.filter(r => r.status === 'rejected') },
    ];

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'🔄'} Shift Swap Board
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} total requests {'·'} {filteredData.length} shown
            </Text>
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Pending', value: pendingCount, color: tokens.colors.warningScale[500] },
            { label: 'Approved', value: approvedCount, color: tokens.colors.successScale[500] },
            { label: 'Rejected', value: rejectedCount, color: tokens.colors.errorScale[500] },
            { label: 'Open Swaps', value: openSwaps, color: tokens.colors.infoScale[500] },
            { label: 'Approval Rate', value: `${approvalRate}%`, color: tokens.colors.primaryScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Approval Rate Bar */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Approval Rate</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{approvalRate}%</Text>
          </div>
          <div style={{ ...approvalBar.track, height: 8 }}><div style={{ ...approvalBar.fill, height: '100%' }} /></div>
        </div>

        {/* Search & Role Filters */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input
                type="text"
                placeholder="Search by name or role..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  backgroundColor: tokens.colors.common.white,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {ROLE_FILTERS.map(f => (
                <div key={f} onClick={() => setRoleFilter(f)} style={createFilterPillStyle(tokens, { active: roleFilter === f })}>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kanban Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4], alignItems: 'flex-start' }}>
          {columns.map(col => (
            <div key={col.key}>
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{col.label}</Text>
                <span style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: col.color, color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold }}>{col.items.length}</span>
              </div>

              {/* Column Cards */}
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {col.items.map(req => {
                  const isHovered = hoveredCard === req.id;
                  return (
                    <div
                      key={req.id}
                      onMouseEnter={() => setHoveredCard(req.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        ...cardBase,
                        padding: tokens.spacing[4],
                        borderLeft: `3px solid ${col.color}`,
                        transform: isHovered ? 'translateY(-2px)' : 'none',
                        boxShadow: isHovered ? tokens.shadows.md : tokens.shadows.sm,
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      {/* Requester */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.primaryScale[700],
                        }}>
                          {req.requesterName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{req.requesterName}</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Requested {formatDate(req.createdAt)}</Text>
                        </div>
                      </div>

                      {/* Shift Info */}
                      <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center', marginBottom: tokens.spacing[2], flexWrap: 'wrap' as const }}>
                        <span style={createBadgeStyle(tokens, 'primary')}>{req.shiftRole}</span>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{req.shiftTime}</Text>
                      </div>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[2] }}>
                        {'📅'} {formatDate(req.shiftDate)}
                      </Text>

                      {/* Reason */}
                      {req.reason && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[2], fontStyle: 'italic' as const, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm }}>
                          "{req.reason}"
                        </Text>
                      )}

                      {/* Swap Target */}
                      {req.targetName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2] }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.successScale[600] }}>{'→'} Swap with:</Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.successScale[700] }}>{req.targetName}</Text>
                        </div>
                      ) : (
                        <div style={{ marginBottom: tokens.spacing[2] }}>
                          <span style={createBadgeStyle(tokens, 'info')}>Open - Needs Volunteer</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      {(req.status === 'approved' || req.status === 'matched') && (
                        <div style={{ marginBottom: tokens.spacing[2] }}>
                          <span style={createBadgeStyle(tokens, req.status === 'matched' ? 'info' : 'success')}>
                            {req.status === 'matched' ? 'Matched' : 'Approved'}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[2] }}>
                          <div onClick={() => onApprove?.(req.id)} style={{ flex: 1, padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', textAlign: 'center' as const }}>
                            Approve
                          </div>
                          <div onClick={() => onReject?.(req.id)} style={{ flex: 1, padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', textAlign: 'center' as const }}>
                            Reject
                          </div>
                          {!req.targetName && (
                            <div onClick={() => onVolunteer?.(req.id)} style={{ flex: 1, padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', textAlign: 'center' as const }}>
                              Volunteer
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {col.items.length === 0 && (
                  <div style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], border: `2px dashed ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.md }}>
                    <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'🔄'}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm }}>No requests match filters</Text>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
