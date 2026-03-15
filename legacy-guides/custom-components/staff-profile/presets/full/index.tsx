'use client';

/**
 * StaffProfile - Full Preset
 * Comprehensive staff profile with all sections
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createBadgeStyle } from '../../../helpers';
import type { StaffProfileProps, StaffProfileData } from '../../core';

const MOCK_PROFILE: StaffProfileData = {
  id: '1', firstName: 'Maria', lastName: 'Santos', email: 'maria.s@company.com', phone: '+1 555-0123', role: 'Bartender', status: 'active', bio: 'Experienced bartender with 5+ years in craft cocktails and wine service.', hourlyRate: 25, currency: 'USD', hireDate: new Date('2024-03-15'),
  skills: [
    { id: 's1', name: 'Cocktails', level: 'expert', verifiedAt: new Date('2024-04-01') },
    { id: 's2', name: 'Wine Service', level: 'advanced', verifiedAt: new Date('2024-04-01') },
    { id: 's3', name: 'POS Systems', level: 'intermediate' },
    { id: 's4', name: 'Inventory Mgmt', level: 'advanced' },
  ],
  certifications: [
    { id: 'c1', name: 'Food Safety Handler', issuedBy: 'ServSafe', issuedAt: new Date('2024-01-10'), expiresAt: new Date('2027-01-10'), status: 'valid' },
    { id: 'c2', name: 'Responsible Beverage Service', issuedBy: 'State Board', issuedAt: new Date('2023-06-15'), expiresAt: new Date('2025-06-15'), status: 'valid' },
  ],
  workHistory: [
    { id: 'w1', eventName: 'Summer Music Festival', role: 'Lead Bartender', startDate: new Date('2024-07-01'), endDate: new Date('2024-07-03'), hoursWorked: 24, rating: 4.9 },
    { id: 'w2', eventName: 'Corporate Gala', role: 'Bartender', startDate: new Date('2024-06-15'), endDate: new Date('2024-06-15'), hoursWorked: 8, rating: 4.7 },
    { id: 'w3', eventName: 'Wine Tasting Event', role: 'Sommelier', startDate: new Date('2024-05-20'), endDate: new Date('2024-05-20'), hoursWorked: 6, rating: 5.0 },
  ],
  evaluations: [
    { id: 'e1', evaluatorName: 'John Manager', date: new Date('2024-08-01'), overallRating: 4.5, categories: [{ name: 'Punctuality', score: 5 }, { name: 'Quality', score: 4.5 }, { name: 'Teamwork', score: 4 }, { name: 'Communication', score: 4.5 }], comments: 'Excellent performer, consistently reliable.' },
  ],
};

export const FullStaffProfile = createPreset<StaffProfileProps>({
  name: 'StaffProfile.Full',
  render: ({ primitives, props, tokens }: PresetContext<StaffProfileProps>) => {
    const { Box, Text } = primitives;
    const { profile: propProfile, onEdit, onBack, onDeactivate, className, style } = props;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'history' | 'evaluations'>('overview');

    const profile = propProfile ?? MOCK_PROFILE;
    const statusColor = profile.status === 'active' ? tokens.colors.successScale[500] : profile.status === 'on-leave' ? tokens.colors.warningScale[500] : tokens.colors.neutral[400];

    const levelColor = (l: string) => {
      const map: Record<string, string> = { beginner: 'secondary', intermediate: 'info', advanced: 'warning', expert: 'success' };
      return map[l] || 'secondary';
    };

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const tabs = ['overview', 'skills', 'history', 'evaluations'] as const;

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Back & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <button onClick={onBack} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', color: tokens.colors.neutral[700] }}>
            ← Back
          </button>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <button onClick={onEdit} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
              Edit Profile
            </button>
            <button onClick={() => onDeactivate?.(profile.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.errorScale[300]}`, backgroundColor: 'transparent', color: tokens.colors.errorScale[600], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>
              Deactivate
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div style={{ ...cardBase, padding: tokens.spacing[6], marginBottom: tokens.spacing[5], display: 'flex', gap: tokens.spacing[5], alignItems: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500], display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize['2xl'], flexShrink: 0 }}>
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                {profile.firstName} {profile.lastName}
              </Text>
              <span style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: statusColor }} />
            </div>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{profile.role}</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], display: 'block' }}>{profile.email} {profile.phone ? `| ${profile.phone}` : ''}</Text>
            {profile.bio && <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], display: 'block', marginTop: tokens.spacing[2] }}>{profile.bio}</Text>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600], display: 'block' }}>${profile.hourlyRate}/hr</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Since {formatDate(profile.hireDate)}</Text>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: tokens.spacing[1], marginBottom: tokens.spacing[5], borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, border: 'none', backgroundColor: 'transparent', fontSize: tokens.typography.fontSize.sm, fontWeight: activeTab === tab ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: activeTab === tab ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500], borderBottom: activeTab === tab ? `2px solid ${tokens.colors.primaryScale[600]}` : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Skills ({profile.skills.length})</Text>
              <div style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                {profile.skills.map(sk => (
                  <span key={sk.id} style={{ ...createBadgeStyle(tokens, levelColor(sk.level) as any), fontSize: tokens.typography.fontSize.xs }}>{sk.name} - {sk.level}</span>
                ))}
              </div>
            </div>
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Certifications ({profile.certifications.length})</Text>
              {profile.certifications.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[2]}px 0`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800], display: 'block' }}>{c.name}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{c.issuedBy}</Text>
                  </div>
                  <span style={createBadgeStyle(tokens, c.status === 'valid' ? 'success' : c.status === 'expired' ? 'error' : ('warning' as any))}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Skills Assessment</Text>
            {profile.skills.map(sk => (
              <div key={sk.id} style={{ marginBottom: tokens.spacing[3] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>{sk.name}</Text>
                  <span style={{ ...createBadgeStyle(tokens, levelColor(sk.level) as any), fontSize: tokens.typography.fontSize.xs }}>{sk.level}</span>
                </div>
                <div style={{ height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[200], overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[500], width: `${({ beginner: 25, intermediate: 50, advanced: 75, expert: 100 })[sk.level]}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Work History</Text>
            {profile.workHistory.map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${tokens.spacing[3]}px 0`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
                <div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{w.eventName}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{w.role} | {formatDate(w.startDate)} | {w.hoursWorked}h</Text>
                </div>
                {w.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <span style={{ color: tokens.colors.warningScale[500], fontSize: tokens.typography.fontSize.sm }}>★</span>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{w.rating.toFixed(1)}</Text>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'evaluations' && (
          <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Performance Evaluations</Text>
            {profile.evaluations.map(ev => (
              <div key={ev.id} style={{ padding: tokens.spacing[4], borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`, marginBottom: tokens.spacing[3] }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                  <div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>Review by {ev.evaluatorName}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDate(ev.date)}</Text>
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{ev.overallRating}/5</Text>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[2] }}>
                  {ev.categories.map(cat => (
                    <div key={cat.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                      <span>{cat.name}</span>
                      <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>{cat.score}/5</span>
                    </div>
                  ))}
                </div>
                {ev.comments && <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], display: 'block', marginTop: tokens.spacing[3], fontStyle: 'italic' }}>"{ev.comments}"</Text>}
              </div>
            ))}
          </div>
        )}
      </Box>
    );
  },
});
