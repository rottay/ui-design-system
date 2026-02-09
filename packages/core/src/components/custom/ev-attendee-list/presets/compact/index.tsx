'use client';

/**
 * EvAttendeeList - Compact Preset
 * Condensed list with avatar, name, ticket badge, and check-in dot
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle, createStatusDotStyle, createFilterPillStyle } from '../../../helpers';
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

export const CompactEvAttendeeList = createPreset<EvAttendeeListProps>({
  name: 'EvAttendeeList.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvAttendeeListProps>) => {
    const { Box } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const attendees = props.attendees ?? MOCK_ATTENDEES;
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const filtered = useMemo(() => attendees.filter(a => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter && a.checkInStatus !== statusFilter) return false;
      return true;
    }), [attendees, search, statusFilter]);

    const statusDotColor = (s: string) => s === 'checked-in' ? tokens.colors.successScale[500] : s === 'pending' ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];

    const checkedIn = attendees.filter(a => a.checkInStatus === 'checked-in').length;
    const pending = attendees.filter(a => a.checkInStatus === 'pending').length;
    const noShow = attendees.filter(a => a.checkInStatus === 'no-show').length;

    return (
      <Box className={props.className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], height: '100%', backgroundColor: tokens.colors.common.white, ...props.style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
            <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Attendees</h3>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{attendees.length} total</span>
          </Box>

          {/* Summary badges */}
          <Box style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
            <span style={createBadgeStyle(tokens, 'success')}>{'\u2705'} {checkedIn} checked in</span>
            <span style={createBadgeStyle(tokens, 'warning')}>{'\u23F3'} {pending} pending</span>
            <span style={createBadgeStyle(tokens, 'error')}>{'\u274C'} {noShow} no-show</span>
          </Box>

          {/* Search + filter */}
          <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search attendees..." style={{ flex: 1, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit', backgroundColor: tokens.colors.common.white }} />
            {['checked-in', 'pending', 'no-show'].map(s => (
              <span key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} style={createFilterPillStyle(tokens, { active: statusFilter === s })}>
                {s}
              </span>
            ))}
          </Box>
        </Box>

        {/* List */}
        <Box style={{ flex: 1, overflow: 'auto', padding: `0 ${tokens.spacing[4]}px` }}>
          {filtered.map((a, idx) => (
            <Box key={a.id} onClick={() => props.onAttendeeClick?.(a.id)} style={{
              display: 'flex', alignItems: 'center', gap: tokens.spacing[3],
              padding: `${tokens.spacing[2]}px 0`,
              borderBottom: idx < filtered.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
              cursor: props.onAttendeeClick ? 'pointer' : 'default',
              transition: `background-color ${tokens.motion.hover}`,
            }}>
              {/* Avatar */}
              <Box style={{ width: 36, height: 36, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primaryScale[700], fontWeight: tokens.typography.fontWeight.semibold, flexShrink: 0 }}>
                {a.name.split(' ').map(n => n[0]).join('')}
              </Box>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
              </div>

              {/* Ticket badge */}
              <span style={createBadgeStyle(tokens, a.ticketType === 'VIP' || a.ticketType === 'Backstage' ? 'warning' : 'primary')}>{a.ticketType}</span>

              {/* Check-in dot */}
              <span style={createStatusDotStyle(tokens, statusDotColor(a.checkInStatus))} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
