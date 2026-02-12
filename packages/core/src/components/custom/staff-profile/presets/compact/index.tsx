'use client';

/**
 * StaffProfile - Compact Preset
 * Condensed staff profile sidebar/panel view
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffProfileProps, StaffProfileData } from '../../core';

const MOCK_PROFILE: StaffProfileData = {
  id: '1', firstName: 'Maria', lastName: 'Santos', email: 'maria.s@company.com', phone: '+1 555-0123', role: 'Bartender', status: 'active', bio: 'Experienced bartender.', hourlyRate: 25, currency: 'USD', hireDate: new Date('2024-03-15'),
  skills: [
    { id: 's1', name: 'Cocktails', level: 'expert' },
    { id: 's2', name: 'Wine Service', level: 'advanced' },
  ],
  certifications: [
    { id: 'c1', name: 'Food Safety Handler', issuedBy: 'ServSafe', issuedAt: new Date('2024-01-10'), expiresAt: new Date('2027-01-10'), status: 'valid' },
  ],
  workHistory: [
    { id: 'w1', eventName: 'Summer Festival', role: 'Lead Bartender', startDate: new Date('2024-07-01'), endDate: new Date('2024-07-03'), hoursWorked: 24, rating: 4.9 },
  ],
  evaluations: [
    { id: 'e1', evaluatorName: 'John M.', date: new Date('2024-08-01'), overallRating: 4.5, categories: [{ name: 'Quality', score: 4.5 }] },
  ],
};

export const CompactStaffProfile = createPreset<StaffProfileProps>({
  name: 'StaffProfile.Compact',
  render: ({ primitives, props, tokens }: PresetContext<StaffProfileProps>) => {
    const { Box, Text } = primitives;
    const { profile: propProfile, onEdit, onBack, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const profile = propProfile ?? MOCK_PROFILE;
    const statusColor = profile.status === 'active' ? tokens.colors.successScale[500] : profile.status === 'on-leave' ? tokens.colors.warningScale[500] : tokens.colors.neutral[400];
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[4], maxWidth: 360, ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
          <button onClick={onBack} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', color: tokens.colors.neutral[600] }}>← Back</button>
          <button onClick={onEdit} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.sm, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer' }}>Edit</button>
        </div>

        {/* Profile Card */}
        <div style={{ ...cardBase, padding: tokens.spacing[4], textAlign: 'center', marginBottom: tokens.spacing[3] }}>
          <div style={{ width: 56, height: 56, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize.lg, margin: '0 auto', marginBottom: tokens.spacing[2] }}>
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{profile.firstName} {profile.lastName}</Text>
            <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: statusColor }} />
          </div>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block' }}>{profile.role}</Text>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block', marginTop: tokens.spacing[2] }}>${profile.hourlyRate}/hr</Text>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
          {[
            { label: 'Skills', value: profile.skills.length },
            { label: 'Certs', value: profile.certifications.length },
            { label: 'Events', value: profile.workHistory.length },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: tokens.spacing[2], textAlign: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{s.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{s.label}</Text>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[2] }}>Skills</Text>
          <div style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
            {profile.skills.map(sk => (
              <span key={sk.id} style={{ ...createBadgeStyle(tokens, 'info'), fontSize: tokens.typography.fontSize.xs }}>{sk.name}</span>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div style={{ ...cardBase, padding: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[2] }}>Certifications</Text>
          {profile.certifications.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{c.name}</Text>
              <span style={{ ...createBadgeStyle(tokens, c.status === 'valid' ? 'success' : ('error' as any)), fontSize: tokens.typography.fontSize.xs }}>{c.status}</span>
            </div>
          ))}
        </div>

        {/* Recent Work */}
        <div style={{ ...cardBase, padding: tokens.spacing[3] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[2] }}>Recent Work</Text>
          {profile.workHistory.slice(0, 3).map(w => (
            <div key={w.id} style={{ marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>{w.eventName}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDate(w.startDate)} | {w.hoursWorked}h</Text>
            </div>
          ))}
        </div>
      </Box>
    );
  },
});
