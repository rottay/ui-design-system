'use client';

/**
 * EvStaffDirectory - Table Preset
 * Full staff table with columns: Name, Email, Role, Skills, Rating, Status, Hire Date
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { EvStaffDirectoryProps, StaffMember } from '../../core';

const MOCK_STAFF: StaffMember[] = [
  { id: '1', firstName: 'Maria', lastName: 'S.', email: 'maria.s@evnto.com', role: 'Bartender', status: 'active', skills: ['Cocktails', 'Wine', 'POS'], rating: 4.8, hireDate: new Date('2024-03-15') },
  { id: '2', firstName: 'Carlos', lastName: 'R.', email: 'carlos.r@evnto.com', role: 'Security', status: 'active', skills: ['Crowd Control', 'First Aid', 'Radio'], rating: 4.5, hireDate: new Date('2024-01-10') },
  { id: '3', firstName: 'Ana', lastName: 'L.', email: 'ana.l@evnto.com', role: 'Server', status: 'active', skills: ['Food Service', 'POS', 'Upselling'], rating: 4.9, hireDate: new Date('2024-06-01') },
  { id: '4', firstName: 'Diego', lastName: 'M.', email: 'diego.m@evnto.com', role: 'Sound Tech', status: 'on-leave', skills: ['Mixing', 'PA Systems', 'Live Sound'], rating: 4.7, hireDate: new Date('2023-11-20') },
  { id: '5', firstName: 'Laura', lastName: 'P.', email: 'laura.p@evnto.com', role: 'Stage Manager', status: 'active', skills: ['Scheduling', 'Lighting', 'Coordination'], rating: 4.6, hireDate: new Date('2024-02-28') },
  { id: '6', firstName: 'Roberto', lastName: 'G.', email: 'roberto.g@evnto.com', role: 'Event Coord', status: 'inactive', skills: ['Planning', 'Vendor Mgmt', 'Budgets'], rating: 4.3, hireDate: new Date('2023-09-05') },
];

export const TableEvStaffDirectory = createPreset<EvStaffDirectoryProps>({
  name: 'EvStaffDirectory.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStaffDirectoryProps>) => {
    const { Box, Text } = primitives;
    const { staff, onStaffClick, onInviteStaff, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<string>('firstName');
    const [sortAsc, setSortAsc] = useState(true);

    const data = staff?.length ? staff : MOCK_STAFF;
    const filtered = useMemo(() => {
      let result = data.filter(s => !search || `${s.firstName} ${s.lastName} ${s.email} ${s.role}`.toLowerCase().includes(search.toLowerCase()));
      result.sort((a, b) => {
        const av = (a as any)[sortField];
        const bv = (b as any)[sortField];
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : (av > bv ? 1 : -1);
        return sortAsc ? cmp : -cmp;
      });
      return result;
    }, [data, search, sortField, sortAsc]);

    const toggleSort = (field: string) => {
      if (sortField === field) setSortAsc(!sortAsc);
      else { setSortField(field); setSortAsc(true); }
    };

    const statusBadge = (s: StaffMember['status']) => {
      const color = s === 'active' ? 'success' : s === 'on-leave' ? 'warning' : 'secondary';
      const label = s === 'active' ? 'Active' : s === 'on-leave' ? 'On Leave' : 'Inactive';
      return <span style={createBadgeStyle(tokens, color as any)}>{label}</span>;
    };

    const avatarColors = [tokens.colors.primaryScale[500], tokens.colors.secondaryScale[500], tokens.colors.infoScale[500], tokens.colors.warningScale[500], tokens.colors.successScale[500], tokens.colors.errorScale[500]];

    const columns = [
      { key: 'firstName', label: 'Name', width: undefined },
      { key: 'email', label: 'Email', width: undefined },
      { key: 'role', label: 'Role', width: 120 },
      { key: 'skills', label: 'Skills', width: undefined },
      { key: 'rating', label: 'Rating', width: 100 },
      { key: 'status', label: 'Status', width: 110 },
      { key: 'hireDate', label: 'Hire Date', width: 110 },
    ];

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              👥 Staff Directory
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filtered.length} of {data.length} staff members
            </Text>
          </div>
          <button onClick={onInviteStaff} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
            + Invite Staff
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search staff..."
            style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, outline: 'none', backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[900] }}
          />
        </div>

        {/* Table */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.key !== 'skills' && toggleSort(col.key)}
                    style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${tokens.colors.neutral[200]}`, cursor: col.key !== 'skills' ? 'pointer' : 'default', width: col.width || 'auto', whiteSpace: 'nowrap' }}
                  >
                    {col.label} {sortField === col.key && (sortAsc ? '▲' : '▼')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.id}
                  onClick={() => onStaffClick?.(s.id)}
                  style={{ cursor: 'pointer', transition: `background-color ${tokens.motion.hover}` }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[50]; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.xs, flexShrink: 0 }}>
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <span style={{ fontWeight: tokens.typography.fontWeight.medium, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{s.firstName} {s.lastName}</span>
                    </div>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{s.email}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <span style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs }}>{s.role}</span>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
                      {s.skills.map(sk => (
                        <span key={sk} style={{ fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600] }}>{sk}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm }}>
                    <span style={{ color: tokens.colors.warningScale[500] }}>{'★'.repeat(Math.floor(s.rating))}</span>
                    <span style={{ color: tokens.colors.neutral[400], marginLeft: tokens.spacing[1] }}>{s.rating.toFixed(1)}</span>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>{statusBadge(s.status)}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{formatDate(s.hireDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
