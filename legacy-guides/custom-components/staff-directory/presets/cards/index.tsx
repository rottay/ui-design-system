'use client';

/**
 * StaffDirectory - Cards Preset
 * Staff directory displayed as cards in a grid layout
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createFilterPillStyle,
  getHoverTransform,
} from '../../../helpers';
import type { StaffDirectoryProps, StaffDirectoryMember } from '../../core';

const MOCK_STAFF: StaffDirectoryMember[] = [
  { id: '1', firstName: 'Maria', lastName: 'Santos', email: 'maria.s@company.com', role: 'Bartender', status: 'active', skills: ['Cocktails', 'Wine'], certifications: ['Food Safety'], availability: 'full-time', hourlyRate: 25, rating: 4.8, hireDate: new Date('2024-03-15') },
  { id: '2', firstName: 'Carlos', lastName: 'Rivera', email: 'carlos.r@company.com', role: 'Security', status: 'active', skills: ['Crowd Control', 'First Aid'], certifications: ['CPR', 'Security License'], availability: 'full-time', hourlyRate: 22, rating: 4.5, hireDate: new Date('2024-01-10') },
  { id: '3', firstName: 'Ana', lastName: 'Lopez', email: 'ana.l@company.com', role: 'Server', status: 'on-leave', skills: ['POS', 'Upselling'], certifications: ['Food Safety'], availability: 'unavailable', hourlyRate: 20, rating: 4.9, hireDate: new Date('2024-06-01') },
  { id: '4', firstName: 'Diego', lastName: 'Martinez', email: 'diego.m@company.com', role: 'Sound Tech', status: 'active', skills: ['Mixing', 'PA Systems'], certifications: ['Audio Engineering'], availability: 'part-time', hourlyRate: 35, rating: 4.7, hireDate: new Date('2023-11-20') },
  { id: '5', firstName: 'Laura', lastName: 'Perez', email: 'laura.p@company.com', role: 'Coordinator', status: 'active', skills: ['Scheduling', 'Coordination'], certifications: [], availability: 'full-time', hourlyRate: 30, rating: 4.6, hireDate: new Date('2024-02-28') },
  { id: '6', firstName: 'Roberto', lastName: 'Garcia', email: 'roberto.g@company.com', role: 'Manager', status: 'inactive', skills: ['Planning', 'Budgets'], certifications: ['PMP'], availability: 'unavailable', hourlyRate: 40, rating: 4.3, hireDate: new Date('2023-09-05') },
];

const ROLES = ['All', 'Bartender', 'Security', 'Server', 'Sound Tech', 'Coordinator', 'Manager'];

export const CardsStaffDirectory = createPreset<StaffDirectoryProps>({
  name: 'StaffDirectory.Cards',
  render: ({ primitives, props, tokens }: PresetContext<StaffDirectoryProps>) => {
    const { Box, Text } = primitives;
    const { staff, onStaffClick, onAddStaff, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    const data = staff?.length ? staff : MOCK_STAFF;
    const filtered = useMemo(() => data.filter(s => {
      const matchSearch = !search || `${s.firstName} ${s.lastName} ${s.email} ${s.role}`.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || s.role === roleFilter;
      return matchSearch && matchRole;
    }), [data, search, roleFilter]);

    const statusColor = (s: StaffDirectoryMember['status']) =>
      s === 'active' ? tokens.colors.successScale[500] : s === 'on-leave' ? tokens.colors.warningScale[500] : tokens.colors.neutral[400];
    const statusLabel = (s: StaffDirectoryMember['status']) =>
      s === 'active' ? 'Active' : s === 'on-leave' ? 'On Leave' : 'Inactive';

    const availabilityBadge = (a: StaffDirectoryMember['availability']) => {
      const map = { 'full-time': 'success', 'part-time': 'info', 'on-call': 'warning', 'unavailable': 'secondary' } as const;
      return createBadgeStyle(tokens, map[a] as any);
    };

    const avatarColors = [tokens.colors.primaryScale[500], tokens.colors.secondaryScale[500], tokens.colors.infoScale[500], tokens.colors.warningScale[500], tokens.colors.successScale[500], tokens.colors.errorScale[500]];

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              Staff Directory
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {filtered.length} staff members
            </Text>
          </div>
          <button onClick={onAddStaff} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
            + Add Staff
          </button>
        </div>

        {/* Search */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[3] }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, outline: 'none', backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[900] }}
          />
        </div>

        {/* Role Filters */}
        <div style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[5], flexWrap: 'wrap' }}>
          {ROLES.map(role => (
            <span key={role} onClick={() => setRoleFilter(role)} style={createFilterPillStyle(tokens, { active: roleFilter === role })}>
              {role}
            </span>
          ))}
        </div>

        {/* Staff Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
          {filtered.map((s, i) => (
            <div
              key={s.id}
              onClick={() => onStaffClick?.(s.id)}
              style={{ ...cardBase, ...hoverStyle, padding: tokens.spacing[5], display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tokens.spacing[3], position: 'relative' }}
              onMouseEnter={e => { Object.assign(e.currentTarget.style, getHoverTransform(tokens)); e.currentTarget.style.boxShadow = tokens.shadows.md; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = tokens.shadows.sm; }}
            >
              {/* Status dot */}
              <div style={{ position: 'absolute', top: tokens.spacing[3], right: tokens.spacing[3], display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: statusColor(s.status) }} />
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{statusLabel(s.status)}</span>
              </div>

              {/* Avatar */}
              <div style={{ width: 56, height: 56, borderRadius: tokens.borderRadius.full, backgroundColor: avatarColors[i % avatarColors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize.lg }}>
                {s.firstName[0]}{s.lastName[0]}
              </div>

              {/* Name & Role */}
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>
                  {s.firstName} {s.lastName}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  {s.role}
                </Text>
              </div>

              {/* Rate & Availability */}
              <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                  ${s.hourlyRate}/hr
                </Text>
                <span style={{ ...availabilityBadge(s.availability), fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px` }}>
                  {s.availability}
                </span>
              </div>

              {/* Skills */}
              <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap', justifyContent: 'center' }}>
                {s.skills.map(skill => (
                  <span key={skill} style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px` }}>
                    {skill}
                  </span>
                ))}
              </div>

              {/* Certifications */}
              {s.certifications.length > 0 && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  {s.certifications.length} certification{s.certifications.length > 1 ? 's' : ''}
                </Text>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg }}>No staff found matching your criteria.</Text>
          </div>
        )}
      </Box>
    );
  },
});
