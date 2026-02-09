'use client';

/**
 * EvStaffingPlanner - Overview Preset
 * Requirements list with fill rate bars, invitation stats, search,
 * role filter pills, hover interactions, and send invitation button
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

const MOCK_REQS: StaffingRequirement[] = [
  { id: 'r1', role: 'Bartender', quantityNeeded: 8, quantityAssigned: 6, hourlyRate: 25, requiredSkills: ['Cocktails', 'POS'], status: 'partially-filled' },
  { id: 'r2', role: 'Security', quantityNeeded: 12, quantityAssigned: 10, hourlyRate: 22, requiredSkills: ['Crowd Control', 'First Aid'], status: 'partially-filled' },
  { id: 'r3', role: 'Sound Tech', quantityNeeded: 4, quantityAssigned: 4, hourlyRate: 35, requiredSkills: ['Mixing', 'PA Systems'], status: 'filled' },
  { id: 'r4', role: 'Server', quantityNeeded: 6, quantityAssigned: 3, hourlyRate: 20, requiredSkills: ['Food Service', 'POS'], status: 'open' },
  { id: 'r5', role: 'Stage Manager', quantityNeeded: 2, quantityAssigned: 2, hourlyRate: 40, requiredSkills: ['Scheduling', 'Coordination'], status: 'filled' },
  { id: 'r6', role: 'Event Coordinator', quantityNeeded: 3, quantityAssigned: 1, hourlyRate: 38, requiredSkills: ['Logistics', 'Communication'], status: 'open' },
];

const MOCK_INVITES: StaffInvitation[] = [
  { id: 'i1', staffName: 'Sofia T.', role: 'Bartender', status: 'pending', sentAt: new Date('2026-02-06') },
  { id: 'i2', staffName: 'Pedro K.', role: 'Security', status: 'accepted', sentAt: new Date('2026-02-05') },
  { id: 'i3', staffName: 'Lucia V.', role: 'Server', status: 'declined', sentAt: new Date('2026-02-05') },
  { id: 'i4', staffName: 'Marco A.', role: 'Server', status: 'pending', sentAt: new Date('2026-02-07') },
  { id: 'i5', staffName: 'Elena R.', role: 'Bartender', status: 'accepted', sentAt: new Date('2026-02-04') },
  { id: 'i6', staffName: 'Jorge H.', role: 'Event Coordinator', status: 'pending', sentAt: new Date('2026-02-08') },
];

const STATUS_OPTIONS = ['all', 'filled', 'partially-filled', 'open'];

export const OverviewEvStaffingPlanner = createPreset<EvStaffingPlannerProps>({
  name: 'EvStaffingPlanner.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvStaffingPlannerProps>) => {
    const { Box, Text } = primitives;
    const { requirements, invitations, onSendInvitation, onRequirementClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const reqs = requirements?.length ? requirements : MOCK_REQS;
    const invites = invitations?.length ? invitations : MOCK_INVITES;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [hoveredReq, setHoveredReq] = useState<string | null>(null);

    const filteredReqs = useMemo(() => {
      return reqs.filter(r => {
        if (searchTerm && !r.role.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;
        return true;
      });
    }, [reqs, searchTerm, statusFilter]);

    const totalNeeded = reqs.reduce((s, r) => s + r.quantityNeeded, 0);
    const totalAssigned = reqs.reduce((s, r) => s + r.quantityAssigned, 0);
    const fillRate = Math.round((totalAssigned / totalNeeded) * 100);
    const totalBudget = reqs.reduce((s, r) => s + r.hourlyRate * r.quantityNeeded * 8, 0);

    const inviteStats = {
      pending: invites.filter(i => i.status === 'pending').length,
      accepted: invites.filter(i => i.status === 'accepted').length,
      declined: invites.filter(i => i.status === 'declined').length,
    };

    const getBarColor = (r: StaffingRequirement) => {
      if (r.status === 'filled') return tokens.colors.successScale[500];
      const pct = r.quantityAssigned / r.quantityNeeded;
      return pct >= 0.75 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500];
    };

    const getStatusColor = (r: StaffingRequirement): 'success' | 'warning' | 'error' => {
      if (r.status === 'filled') return 'success';
      const pct = r.quantityAssigned / r.quantityNeeded;
      return pct >= 0.75 ? 'warning' : 'error';
    };

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{'📋'} Staffing Planner</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{totalAssigned}/{totalNeeded} positions filled ({fillRate}%) {'·'} {filteredReqs.length} roles shown</Text>
          </div>
          <div onClick={() => onSendInvitation?.('')} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
            {'📩'} Send Invitations
          </div>
        </div>

        {/* KPI Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          {[
            { label: 'Fill Rate', value: `${fillRate}%`, color: fillRate >= 80 ? tokens.colors.successScale[500] : tokens.colors.warningScale[500] },
            { label: 'Est. Budget', value: `$${(totalBudget / 1000).toFixed(1)}k`, color: tokens.colors.primaryScale[500] },
            { label: 'Pending', value: inviteStats.pending, color: tokens.colors.warningScale[500] },
            { label: 'Accepted', value: inviteStats.accepted, color: tokens.colors.successScale[500] },
            { label: 'Declined', value: inviteStats.declined, color: tokens.colors.errorScale[500] },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[3], textAlign: 'center' as const }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: s.color, display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' as const }}>
              <div style={{ position: 'absolute' as const, left: tokens.spacing[3], top: '50%', transform: 'translateY(-50%)', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>{'🔍'}</div>
              <input type="text" placeholder="Search roles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px ${tokens.spacing[2]}px ${tokens.spacing[8]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
              {STATUS_OPTIONS.map(st => (
                <div key={st} onClick={() => setStatusFilter(st)} style={createFilterPillStyle(tokens, { active: statusFilter === st })}>
                  {st === 'all' ? 'All' : st === 'partially-filled' ? 'Partial' : st.charAt(0).toUpperCase() + st.slice(1)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements List */}
        <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
          <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Staffing Requirements</Text>
          </div>
          {filteredReqs.map(r => {
            const pct = Math.round((r.quantityAssigned / r.quantityNeeded) * 100);
            const barStyles = createProgressBarStyle(tokens, { percent: pct, color: getBarColor(r) });
            const isHovered = hoveredReq === r.id;
            return (
              <div
                key={r.id}
                onClick={() => onRequirementClick?.(r.id)}
                onMouseEnter={() => setHoveredReq(r.id)}
                onMouseLeave={() => setHoveredReq(null)}
                style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  cursor: 'pointer',
                  backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
                  transition: `background-color ${tokens.motion.hover}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{r.role}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>${r.hourlyRate}/hr</Text>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{r.quantityAssigned}/{r.quantityNeeded}</Text>
                    <span style={createBadgeStyle(tokens, getStatusColor(r))}>{r.status === 'filled' ? 'Filled' : r.status === 'partially-filled' ? 'Partial' : 'Open'}</span>
                  </div>
                </div>
                <div style={barStyles.track}><div style={barStyles.fill} /></div>
                <div style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[2] }}>
                  {r.requiredSkills.map(sk => <span key={sk} style={{ fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[0]}px ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600] }}>{sk}</span>)}
                </div>
              </div>
            );
          })}
          {filteredReqs.length === 0 && (
            <div style={{ textAlign: 'center' as const, padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block', marginBottom: tokens.spacing[2] }}>{'📋'}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>No requirements match your filters</Text>
            </div>
          )}
        </div>
      </Box>
    );
  },
});
