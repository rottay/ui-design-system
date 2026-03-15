'use client';

/**
 * StaffDirectory - Table Preset
 * Full staff table with sortable columns
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffDirectoryProps, StaffDirectoryMember } from '../../core';

const MOCK_STAFF: StaffDirectoryMember[] = [
  { id: '1', firstName: 'Maria', lastName: 'Santos', email: 'maria.s@company.com', role: 'Bartender', status: 'active', skills: ['Cocktails', 'Wine'], certifications: ['Food Safety'], availability: 'full-time', hourlyRate: 25, rating: 4.8, hireDate: new Date('2024-03-15') },
  { id: '2', firstName: 'Carlos', lastName: 'Rivera', email: 'carlos.r@company.com', role: 'Security', status: 'active', skills: ['Crowd Control', 'First Aid'], certifications: ['CPR', 'Security License'], availability: 'full-time', hourlyRate: 22, rating: 4.5, hireDate: new Date('2024-01-10') },
  { id: '3', firstName: 'Ana', lastName: 'Lopez', email: 'ana.l@company.com', role: 'Server', status: 'on-leave', skills: ['POS', 'Upselling'], certifications: ['Food Safety'], availability: 'unavailable', hourlyRate: 20, rating: 4.9, hireDate: new Date('2024-06-01') },
  { id: '4', firstName: 'Diego', lastName: 'Martinez', email: 'diego.m@company.com', role: 'Sound Tech', status: 'active', skills: ['Mixing', 'PA Systems'], certifications: ['Audio Engineering'], availability: 'part-time', hourlyRate: 35, rating: 4.7, hireDate: new Date('2023-11-20') },
  { id: '5', firstName: 'Laura', lastName: 'Perez', email: 'laura.p@company.com', role: 'Coordinator', status: 'active', skills: ['Scheduling', 'Coordination'], certifications: [], availability: 'full-time', hourlyRate: 30, rating: 4.6, hireDate: new Date('2024-02-28') },
  { id: '6', firstName: 'Roberto', lastName: 'Garcia', email: 'roberto.g@company.com', role: 'Manager', status: 'inactive', skills: ['Planning', 'Budgets'], certifications: ['PMP'], availability: 'unavailable', hourlyRate: 40, rating: 4.3, hireDate: new Date('2023-09-05') },
];

export const TableStaffDirectory = createPreset<StaffDirectoryProps>({
  name: 'StaffDirectory.Table',
  render: ({ primitives, props, tokens }: PresetContext<StaffDirectoryProps>) => {
    const { Box, Text } = primitives;
    const { staff, onStaffClick, onAddStaff, className, style } = props;

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

    const statusBadge = (s: StaffDirectoryMember['status']) => {
      const color = s === 'active' ? 'success' : s === 'on-leave' ? 'warning' : 'secondary';
      const label = s === 'active' ? 'Active' : s === 'on-leave' ? 'On Leave' : 'Inactive';
      return <span style={createBadgeStyle(tokens, color as any)}>{label}</span>;
    };

    const avatarColors = [tokens.colors.primaryScale[500], tokens.colors.secondaryScale[500], tokens.colors.infoScale[500], tokens.colors.warningScale[500], tokens.colors.successScale[500], tokens.colors.errorScale[500]];

    const columns = [
      { key: 'firstName', label: 'Name' },
      { key: 'role', label: 'Role', width: 120 },
      { key: 'availability', label: 'Availability', width: 120 },
      { key: 'hourlyRate', label: 'Rate', width: 90 },
      { key: 'skills', label: 'Skills' },
      { key: 'certifications', label: 'Certs', width: 80 },
      { key: 'rating', label: 'Rating', width: 90 },
      { key: 'status', label: 'Status', width: 100 },
    ];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Staff Directory
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filtered.length} of {data.length} staff members
            </Text>
          </div>
          <button onClick={onAddStaff} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
            + Add Staff
          </button>
        </div>

        <div style={{ marginBottom: tokens.spacing[4] }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff..."
            style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, outline: 'none', backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[900] }}
          />
        </div>

        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {columns.map(col => (
                  <th
                    key={col.key}
                    onClick={() => !['skills', 'certifications'].includes(col.key) && toggleSort(col.key)}
                    style={{ padding: `${tokens.spacing[3]}px`, textAlign: 'left', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${tokens.colors.neutral[200]}`, cursor: !['skills', 'certifications'].includes(col.key) ? 'pointer' : 'default', width: (col as any).width || 'auto', whiteSpace: 'nowrap' }}
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
                      <div>
                        <span style={{ fontWeight: tokens.typography.fontWeight.medium, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], display: 'block' }}>{s.firstName} {s.lastName}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{s.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <span style={{ ...createBadgeStyle(tokens, 'primary'), fontSize: tokens.typography.fontSize.xs }}>{s.role}</span>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{s.availability}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>${s.hourlyRate}/hr</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                    <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
                      {s.skills.map(sk => (
                        <span key={sk} style={{ fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600] }}>{sk}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], textAlign: 'center' }}>{s.certifications.length}</td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}`, fontSize: tokens.typography.fontSize.sm }}>
                    <span style={{ color: tokens.colors.warningScale[500] }}>{'★'.repeat(Math.floor(s.rating))}</span>
                    <span style={{ color: tokens.colors.neutral[400], marginLeft: tokens.spacing[1] }}>{s.rating.toFixed(1)}</span>
                  </td>
                  <td style={{ padding: `${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>{statusBadge(s.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Box>
    );
  },
});
