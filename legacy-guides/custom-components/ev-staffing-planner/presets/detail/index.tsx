'use client';

/**
 * EvStaffingPlanner - Detail Preset
 * Single requirement breakdown with assigned staff list, pending invitations,
 * search input, invitation status filter pills, and hover interactions
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
import type { EvStaffingPlannerProps, StaffingRequirement, StaffInvitation } from '../../core';

const MOCK_REQ: StaffingRequirement = { id: 'r1', role: 'Bartender', quantityNeeded: 8, quantityAssigned: 6, hourlyRate: 25, requiredSkills: ['Cocktails', 'POS', 'Wine'], status: 'partially-filled' };

const MOCK_ASSIGNED = [
  { name: 'Maria S.', status: 'confirmed', rating: 4.8, shifts: 12 },
  { name: 'Elena R.', status: 'confirmed', rating: 4.6, shifts: 8 },
  { name: 'Sofia T.', status: 'confirmed', rating: 4.5, shifts: 10 },
  { name: 'Pedro K.', status: 'pending', rating: 4.2, shifts: 5 },
  { name: 'Marco A.', status: 'confirmed', rating: 4.7, shifts: 15 },
  { name: 'Luis F.', status: 'pending', rating: 4.1, shifts: 3 },
];

const MOCK_INVITES: StaffInvitation[] = [
  { id: 'i1', staffName: 'Carmen D.', role: 'Bartender', status: 'pending', sentAt: new Date('2026-02-07') },
  { id: 'i2', staffName: 'Jorge H.', role: 'Bartender', status: 'declined', sentAt: new Date('2026-02-06') },
  { id: 'i3', staffName: 'Isabella M.', role: 'Bartender', status: 'pending', sentAt: new Date('2026-02-08') },
  { id: 'i4', staffName: 'Rafael T.', role: 'Bartender', status: 'accepted', sentAt: new Date('2026-02-05') },
  { id: 'i5', staffName: 'Valentina S.', role: 'Bartender', status: 'pending', sentAt: new Date('2026-02-08') },
];

const INVITE_FILTERS = ['all', 'pending', 'accepted', 'declined'];

export const DetailEvStaffingPlanner = createPreset<EvStaffingPlannerProps>({
  name: 'EvStaffingPlanner.Detail',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStaffingPlannerProps>) => {
    const { Box, Text } = primitives;
    const { requirements, invitations, onSendInvitation, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const req = requirements?.[0] || MOCK_REQ;
    const invites = invitations?.length ? invitations : MOCK_INVITES;

    const [searchTerm, setSearchTerm] = useState('');
    const [inviteFilter, setInviteFilter] = useState<string>('all');
    const [hoveredStaff, setHoveredStaff] = useState<string | null>(null);
    const [hoveredInvite, setHoveredInvite] = useState<string | null>(null);

    const filteredAssigned = useMemo(() => {
      if (!searchTerm) return MOCK_ASSIGNED;
      return MOCK_ASSIGNED.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const filteredInvites = useMemo(() => {
      return invites.filter(i => {
        if (inviteFilter !== 'all' && i.status !== inviteFilter) return false;
        return true;
      });
    }, [invites, inviteFilter]);

    const pct = Math.round((req.quantityAssigned / req.quantityNeeded) * 100);
    const barColor = pct === 100 ? tokens.colors.successScale[500] : pct >= 75 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
    const barStyles = createProgressBarStyle(tokens, { percent: pct, color: barColor });

    const confirmedCount = MOCK_ASSIGNED.filter(s => s.status === 'confirmed').length;
    const avgRating = MOCK_ASSIGNED.reduce((s, a) => s + a.rating, 0) / MOCK_ASSIGNED.length;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1], cursor: 'pointer' }}>{'←'} Back to Overview</Text>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'🍸'} {req.role} Requirement</Text>
          </div>
          <div onClick={() => onSendInvitation?.(req.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
            {'📩'} Send More Invitations
          </div>
        </div>

        {/* Summary Card */}
        <div style={{ ...cardBase, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
            {[
              { label: 'Needed', value: req.quantityNeeded, color: tokens.colors.neutral[700] },
              { label: 'Assigned', value: req.quantityAssigned, color: tokens.colors.primaryScale[600] },
              { label: 'Confirmed', value: confirmedCount, color: tokens.colors.successScale[600] },
              { label: 'Avg Rating', value: avgRating.toFixed(1), color: tokens.colors.warningScale[600] },
              { label: 'Hourly Rate', value: `$${req.hourlyRate}`, color: tokens.colors.infoScale[600] },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: tokens.spacing[2] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Fill Rate</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{pct}%</Text>
            </div>
            <div style={{ ...barStyles.track, height: 10 }}><div style={{ ...barStyles.fill, height: '100%' }} /></div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[3] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginRight: tokens.spacing[1] }}>Required Skills:</Text>
            {req.requiredSkills.map(sk => <span key={sk} style={createBadgeStyle(tokens, 'info')}>{sk}</span>)}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
          {/* Assigned Staff */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{'👥'} Assigned Staff ({MOCK_ASSIGNED.length})</Text>
              <div style={{ flex: 1, position: 'relative' as const }}>
                <div style={{ position: 'absolute' as const, left: tokens.spacing[2], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>{'🔍'}</div>
                <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px ${tokens.spacing[1]}px ${tokens.spacing[6]}px`, borderRadius: tokens.borderRadius.sm, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
              </div>
            </div>
            {filteredAssigned.map((s, i) => {
              const isHovered = hoveredStaff === s.name;
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredStaff(s.name)}
                  onMouseLeave={() => setHoveredStaff(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[700] }}>
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{s.name}</Text>
                      <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[500] }}>{'★'} {s.rating}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{s.shifts} shifts</Text>
                      </div>
                    </div>
                  </div>
                  <span style={createBadgeStyle(tokens, s.status === 'confirmed' ? 'success' : 'warning')}>{s.status}</span>
                </div>
              );
            })}
            {filteredAssigned.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[4], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>No staff match search</Text>
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{'📩'} Invitations ({invites.length})</Text>
              </div>
              <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {INVITE_FILTERS.map(f => (
                  <div key={f} onClick={() => setInviteFilter(f)} style={createFilterPillStyle(tokens, { active: inviteFilter === f })}>
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            {filteredInvites.map(inv => {
              const isHovered = hoveredInvite === inv.id;
              return (
                <div
                  key={inv.id}
                  onMouseEnter={() => setHoveredInvite(inv.id)}
                  onMouseLeave={() => setHoveredInvite(null)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                    transition: `background-color ${tokens.motion.hover}`,
                  }}
                >
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{inv.staffName}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Sent {inv.sentAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  </div>
                  <span style={createBadgeStyle(tokens, inv.status === 'accepted' ? 'success' : inv.status === 'declined' ? 'error' : 'warning')}>{inv.status}</span>
                </div>
              );
            })}
            {filteredInvites.length === 0 && (
              <div style={{ textAlign: 'center' as const, padding: tokens.spacing[4], color: tokens.colors.neutral[400] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>No invitations match filter</Text>
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
