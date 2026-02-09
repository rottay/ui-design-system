'use client';

/**
 * EvAttendeeList - Table Preset
 * Full attendee table with search, filter pills, and export
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createFilterPillStyle, createSectionHeaderStyle } from '../../../helpers';
import type { EvAttendeeListProps, AttendeeRecord } from '../../core';

const MOCK_ATTENDEES: AttendeeRecord[] = [
  { id: '1', name: 'Sarah Connor', email: 'sarah@skynet.com', ticketType: 'VIP', ticketNumber: 'TK-4821', purchaseDate: new Date('2026-04-12'), checkInStatus: 'checked-in', zone: 'Zone A' },
  { id: '2', name: 'John Reese', email: 'john@resistance.io', ticketType: 'GA', ticketNumber: 'TK-3917', purchaseDate: new Date('2026-04-15'), checkInStatus: 'checked-in', zone: 'Zone B' },
  { id: '3', name: 'Kyle Smith', email: 'kyle@email.com', ticketType: 'Backstage', ticketNumber: 'TK-2205', purchaseDate: new Date('2026-03-28'), checkInStatus: 'pending', zone: 'Zone A' },
  { id: '4', name: 'Elena Diaz', email: 'elena.d@email.com', ticketType: 'VIP', ticketNumber: 'TK-1088', purchaseDate: new Date('2026-04-02'), checkInStatus: 'checked-in', zone: 'Zone C' },
  { id: '5', name: 'Marcus Lee', email: 'marcuslee@inbox.com', ticketType: 'GA', ticketNumber: 'TK-0914', purchaseDate: new Date('2026-04-20'), checkInStatus: 'no-show', zone: 'Zone B' },
  { id: '6', name: 'Ava Chen', email: 'ava.chen@mail.com', ticketType: 'Early Bird', ticketNumber: 'TK-7763', purchaseDate: new Date('2026-02-20'), checkInStatus: 'checked-in', zone: 'Zone A' },
  { id: '7', name: 'Derek Miles', email: 'derek.m@email.com', ticketType: 'GA', ticketNumber: 'TK-5501', purchaseDate: new Date('2026-04-18'), checkInStatus: 'pending', zone: 'Zone D' },
  { id: '8', name: 'Nina Patel', email: 'nina.p@corp.com', ticketType: 'VIP', ticketNumber: 'TK-3342', purchaseDate: new Date('2026-03-15'), checkInStatus: 'checked-in', zone: 'Zone A' },
];

export const TableEvAttendeeList = createPreset<EvAttendeeListProps>({
  name: 'EvAttendeeList.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAttendeeListProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const attendees = props.attendees ?? MOCK_ATTENDEES;
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const ticketTypes = [...new Set(attendees.map(a => a.ticketType))];
    const statuses = ['checked-in', 'pending', 'no-show'];

    const filtered = useMemo(() => attendees.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter && a.ticketType !== typeFilter) return false;
      if (statusFilter && a.checkInStatus !== statusFilter) return false;
      return true;
    }), [attendees, search, typeFilter, statusFilter]);

    const statusBadge = (s: string): 'success' | 'warning' | 'error' => s === 'checked-in' ? 'success' : s === 'pending' ? 'warning' : 'error';
    const statusIcon = (s: string) => s === 'checked-in' ? '\u2705' : s === 'pending' ? '\u23F3' : '\u274C';

    const thStyle = { textAlign: 'left' as const, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], backgroundColor: tokens.colors.neutral[50], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` };
    const tdStyle = { padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` };

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], padding: tokens.spacing[4], backgroundColor: tokens.colors.neutral[50], height: '100%', overflow: 'auto', ...props.style }}>
        {/* Header */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>Attendees</h2>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{filtered.length} of {attendees.length} attendees</span>
          </div>
          {props.onExport && (
            <button onClick={props.onExport} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, border: 'none', borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Export CSV</button>
          )}
        </Box>

        {/* Search + Filters */}
        <Box style={cardBase}>
          <Box style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'center', flexWrap: 'wrap' }}>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="\uD83D\uDD0D Search by name or email..." style={{ flex: 1, minWidth: 200, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', backgroundColor: tokens.colors.common.white }} />
            <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
              {ticketTypes.map(t => (
                <span key={t} onClick={() => setTypeFilter(typeFilter === t ? null : t)} style={createFilterPillStyle(tokens, { active: typeFilter === t })}>{t}</span>
              ))}
              <span style={{ width: 1, backgroundColor: tokens.colors.neutral[200], margin: `0 ${tokens.spacing[1]}px` }} />
              {statuses.map(s => (
                <span key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} style={createFilterPillStyle(tokens, { active: statusFilter === s })}>{statusIcon(s)} {s}</span>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Table */}
        <Box style={cardBase}>
          <Box style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['Name', 'Email', 'Ticket', 'Ticket #', 'Purchase Date', 'Check-in', 'Zone'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} onClick={() => props.onAttendeeClick?.(a.id)} style={{ cursor: props.onAttendeeClick ? 'pointer' : 'default', transition: `background-color ${tokens.motion.hover}` }}>
                    <td style={{ ...tdStyle, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[700], fontWeight: tokens.typography.fontWeight.semibold }}>{a.name.split(' ').map(n => n[0]).join('')}</Box>
                        {a.name}
                      </Box>
                    </td>
                    <td style={{ ...tdStyle, color: tokens.colors.neutral[500] }}>{a.email}</td>
                    <td style={tdStyle}><span style={createBadgeStyle(tokens, a.ticketType === 'VIP' || a.ticketType === 'Backstage' ? 'warning' : 'primary')}>{a.ticketType}</span></td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs }}>{a.ticketNumber}</td>
                    <td style={tdStyle}>{a.purchaseDate.toLocaleDateString()}</td>
                    <td style={tdStyle}><span style={createBadgeStyle(tokens, statusBadge(a.checkInStatus))}>{statusIcon(a.checkInStatus)} {a.checkInStatus}</span></td>
                    <td style={tdStyle}>{a.zone ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    );
  },
});
