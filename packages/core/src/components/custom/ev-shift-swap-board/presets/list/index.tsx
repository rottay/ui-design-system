'use client';

/**
 * EvShiftSwapBoard - List Preset
 * Table view with swap requests, search input, status filter pills,
 * sortable columns, KPI stat cards, resolution rate progress bar,
 * hover row highlighting, action buttons, and empty state
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

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'matched'];
type SortKey = 'date' | 'name' | 'role' | 'created';

export const ListEvShiftSwapBoard = createPreset<EvShiftSwapBoardProps>({
  name: 'EvShiftSwapBoard.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvShiftSwapBoardProps>) => {
    const { Box, Text } = primitives;
    const { requests, onApprove, onReject, onVolunteer, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = requests?.length ? requests : MOCK_REQUESTS;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortKey>('created');
    const [sortAsc, setSortAsc] = useState(false);
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const filteredData = useMemo(() => {
      let result = data.filter(r => {
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          if (!r.requesterName.toLowerCase().includes(term) && !r.shiftRole.toLowerCase().includes(term) && !(r.targetName || '').toLowerCase().includes(term)) return false;
        }
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        return true;
      });

      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'date') cmp = a.shiftDate.getTime() - b.shiftDate.getTime();
        else if (sortBy === 'name') cmp = a.requesterName.localeCompare(b.requesterName);
        else if (sortBy === 'role') cmp = a.shiftRole.localeCompare(b.shiftRole);
        else cmp = a.createdAt.getTime() - b.createdAt.getTime();
        return sortAsc ? cmp : -cmp;
      });

      return result;
    }, [data, searchTerm, statusFilter, sortBy, sortAsc]);

    const handleSort = (key: SortKey) => {
      if (sortBy === key) setSortAsc(!sortAsc);
      else { setSortBy(key); setSortAsc(true); }
    };

    const pendingCount = data.filter(r => r.status === 'pending').length;
    const approvedCount = data.filter(r => r.status === 'approved' || r.status === 'matched').length;
    const rejectedCount = data.filter(r => r.status === 'rejected').length;
    const resolvedCount = approvedCount + rejectedCount;
    const resolutionRate = data.length > 0 ? Math.round((resolvedCount / data.length) * 100) : 0;
    const openSwaps = data.filter(r => r.status === 'pending' && !r.targetName).length;

    const resolutionBar = useMemo(() => createProgressBarStyle(tokens, {
      percent: resolutionRate,
      color: resolutionRate >= 70 ? tokens.colors.successScale[500] : resolutionRate >= 40 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
    }), [tokens, resolutionRate]);

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const statusMap: Record<string, { badge: 'warning' | 'success' | 'error' | 'info'; label: string }> = {
      pending: { badge: 'warning', label: 'Pending' },
      approved: { badge: 'success', label: 'Approved' },
      rejected: { badge: 'error', label: 'Rejected' },
      matched: { badge: 'info', label: 'Matched' },
    };

    const sortIcon = (key: SortKey) => sortBy === key ? (sortAsc ? ' ↑' : ' ↓') : '';

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {'🔄'} Shift Swap Requests
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} total {'·'} {filteredData.length} shown {'·'} {pendingCount} pending
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
            { label: 'Resolved', value: `${resolutionRate}%`, color: tokens.colors.primaryScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Resolution Rate Bar */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Resolution Rate</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <span style={createBadgeStyle(tokens, resolutionRate >= 70 ? 'success' : resolutionRate >= 40 ? 'warning' : 'error')}>
                {resolutionRate >= 70 ? 'On Track' : resolutionRate >= 40 ? 'In Progress' : 'Needs Attention'}
              </span>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{resolutionRate}%</Text>
            </div>
          </div>
          <div style={{ ...resolutionBar.track, height: 8 }}><div style={{ ...resolutionBar.fill, height: '100%' }} /></div>
        </div>

        {/* Search & Status Filters */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input
                type="text"
                placeholder="Search by name, role, or swap partner..."
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
              {STATUS_FILTERS.map(f => (
                <div key={f} onClick={() => setStatusFilter(f)} style={createFilterPillStyle(tokens, { active: statusFilter === f })}>
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {[
                  { key: 'name' as SortKey, label: 'Requester' },
                  { key: 'role' as SortKey, label: 'Role' },
                  { key: 'date' as SortKey, label: 'Shift Date' },
                  { key: null, label: 'Time' },
                  { key: null, label: 'Swap With' },
                  { key: null, label: 'Reason' },
                  { key: 'created' as SortKey, label: 'Requested' },
                  { key: null, label: 'Status' },
                  { key: null, label: 'Actions' },
                ].map((h, i) => (
                  <th
                    key={i}
                    onClick={() => h.key && handleSort(h.key)}
                    style={{
                      padding: `${tokens.spacing[3]}px`,
                      textAlign: 'left' as const,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase' as const,
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      cursor: h.key ? 'pointer' : 'default',
                      whiteSpace: 'nowrap' as const,
                      userSelect: 'none' as const,
                    }}
                  >
                    {h.label}{h.key ? sortIcon(h.key) : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(req => {
                const sm = statusMap[req.status];
                const isHovered = hoveredRow === req.id;
                return (
                  <tr
                    key={req.id}
                    onMouseEnter={() => setHoveredRow(req.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                      transition: `background-color ${tokens.motion.hover}`,
                    }}
                  >
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.primaryScale[700],
                        }}>
                          {req.requesterName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{req.requesterName}</Text>
                      </div>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, 'primary')}>{req.shiftRole}</span>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {formatDate(req.shiftDate)}
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {req.shiftTime}
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: req.targetName ? tokens.colors.neutral[900] : tokens.colors.neutral[400], fontWeight: req.targetName ? tokens.typography.fontWeight.medium : tokens.typography.fontWeight.normal, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {req.targetName || 'Open'}
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, maxWidth: 140, overflow: 'hidden' as const, textOverflow: 'ellipsis' as const, whiteSpace: 'nowrap' as const }}>
                      {req.reason || '—'}
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {formatDate(req.createdAt)}
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      <span style={createBadgeStyle(tokens, sm.badge)}>{sm.label}</span>
                    </td>
                    <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                          <div onClick={() => onApprove?.(req.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontWeight: tokens.typography.fontWeight.semibold }}>
                            {'✓'}
                          </div>
                          <div onClick={() => onReject?.(req.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontWeight: tokens.typography.fontWeight.semibold }}>
                            {'✗'}
                          </div>
                          {!req.targetName && (
                            <div onClick={() => onVolunteer?.(req.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontWeight: tokens.typography.fontWeight.semibold }}>
                              {'🙋'}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'🔄'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No swap requests match your filters</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
