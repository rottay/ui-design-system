'use client';

/**
 * BhCandidateProfile - Compact Preset
 * Summary card with avatar, key info, skills, and quick stats.
 * Ideal for sidebars, list items, and comparison embeds.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createProgressBarStyle,
  getPersonalityBadgeRadius,
  getCardPadding,
} from '../../../helpers';
import type { BhCandidateProfileProps } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase, MapPin, Mail, Phone, ExternalLink, Star,
  Calendar, FileText, MessageSquare, Activity, ChevronRight,
  Linkedin, Github,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const DEFAULT_CANDIDATE = {
  id: 'c-1', name: 'Sarah Johnson', avatar: '',
  currentRole: 'Senior Frontend Engineer at Google',
  location: 'San Francisco, CA', email: 'sarah.j@google.com',
  phone: '+1 (415) 555-0127', source: 'LinkedIn',
  status: 'active', doNotContact: false,
};

const DEFAULT_SKILLS = [
  { name: 'React', proficiency: 95 },
  { name: 'TypeScript', proficiency: 92 },
  { name: 'Next.js', proficiency: 88 },
  { name: 'GraphQL', proficiency: 80 },
  { name: 'Node.js', proficiency: 75 },
  { name: 'System Design', proficiency: 70 },
];

const DEFAULT_STATS = {
  activeApplications: 3,
  totalInterviews: 7,
  avgScore: 91,
  lastActivityDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.charAt(0).toUpperCase();
}

function getStatusConfig(status: string, tokens: DesignTokens) {
  const map: Record<string, { dot: string; label: string; bg: string; text: string }> = {
    active: { dot: tokens.colors.successScale[500], label: 'Active', bg: tokens.colors.successScale[50], text: tokens.colors.successScale[700] },
    passive: { dot: tokens.colors.infoScale[500], label: 'Passive', bg: tokens.colors.infoScale[50], text: tokens.colors.infoScale[700] },
    hired: { dot: tokens.colors.primaryScale[500], label: 'Hired', bg: tokens.colors.primaryScale[50], text: tokens.colors.primaryScale[700] },
    inactive: { dot: tokens.colors.neutral[400], label: 'Inactive', bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600] },
    do_not_contact: { dot: tokens.colors.errorScale[500], label: 'Do Not Contact', bg: tokens.colors.errorScale[50], text: tokens.colors.errorScale[700] },
  };
  return map[status] ?? map['inactive'];
}

function getScoreColor(score: number, tokens: DesignTokens): string {
  if (score >= 80) return tokens.colors.successScale[500];
  if (score >= 60) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/* ------------------------------------------------------------------ */
/*  Score Ring                                                         */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, tokens, size = 56 }: { score: number; tokens: DesignTokens; size?: number }) {
  const color = getScoreColor(score, tokens);
  const r = (size / 2) - 4;
  const circumference = 2 * Math.PI * r;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth="3" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      </svg>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 8, color: tokens.colors.neutral[400], lineHeight: 1, marginTop: 2 }}>score</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhCandidateProfile = createPreset<BhCandidateProfileProps>({
  name: 'BhCandidateProfile.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhCandidateProfileProps>) => {
    const { Box, Text } = primitives;
    const candidate = props.candidate ?? DEFAULT_CANDIDATE;
    const skills = props.skills ?? DEFAULT_SKILLS;
    const stats = props.stats ?? DEFAULT_STATS;
    const badgeRadius = getPersonalityBadgeRadius(tokens);
    const cardHover = createCardHoverStyles(tokens);
    const statusConfig = getStatusConfig(candidate.status ?? 'active', tokens);

    return (
      <Box className={props.className} style={{
        ...createCardStyle(tokens, { elevation: 'sm' }),
        padding: `${tokens.spacing[6]}px`,
        border: `1px solid ${tokens.colors.neutral[100]}`,
        backgroundColor: tokens.colors.common.white,
        ...props.style,
      }}>
        {/* Header: Avatar + Name + Status */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          <Box style={{
            width: 56, height: 56, borderRadius: tokens.borderRadius.full, flexShrink: 0,
            overflow: 'hidden', backgroundColor: tokens.colors.primaryScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.primaryScale[700],
          }}>
            {candidate.avatar
              ? <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : getInitials(candidate.name)
            }
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: 4 }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                {candidate.name}
              </Text>
              <Box style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: `2px ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
                backgroundColor: statusConfig.bg, fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium, color: statusConfig.text,
              }}>
                <Box style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: statusConfig.dot }} />
                {statusConfig.label}
              </Box>
            </Box>
            {candidate.currentRole && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: 2 }}>
                <Briefcase size={13} color={tokens.colors.neutral[400]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{candidate.currentRole}</Text>
              </Box>
            )}
            {candidate.location && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <MapPin size={13} color={tokens.colors.neutral[400]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{candidate.location}</Text>
              </Box>
            )}
          </Box>
          <ScoreRing score={stats.avgScore} tokens={tokens} />
        </Box>

        {/* Contact row */}
        <Box style={{
          display: 'flex', gap: tokens.spacing[4], marginBottom: tokens.spacing[5],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.lg,
        }}>
          {candidate.email && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Mail size={13} color={tokens.colors.neutral[400]} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{candidate.email}</Text>
            </Box>
          )}
          {candidate.phone && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Phone size={13} color={tokens.colors.neutral[400]} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{candidate.phone}</Text>
            </Box>
          )}
        </Box>

        {/* Skills with proficiency bars */}
        <Box style={{ marginBottom: tokens.spacing[5] }}>
          <Text style={{
            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em',
            marginBottom: tokens.spacing[3],
          }}>
            Top Skills
          </Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
            {skills.slice(0, 5).map(skill => {
              const progressStyle = createProgressBarStyle(tokens, { percent: skill.proficiency, color: getScoreColor(skill.proficiency, tokens) });
              return (
                <Box key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], width: 80, flexShrink: 0, fontWeight: tokens.typography.fontWeight.medium }}>
                    {skill.name}
                  </Text>
                  <Box style={{ flex: 1 }}>
                    <Box style={{ ...progressStyle.track, height: 4 }}>
                      <Box style={{ ...progressStyle.fill, height: 4 }} />
                    </Box>
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], width: 28, textAlign: 'right' }}>
                    {skill.proficiency}
                  </Text>
                </Box>
              );
            })}
            {skills.length > 5 && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                +{skills.length - 5} more skills
              </Text>
            )}
          </Box>
        </Box>

        {/* Quick stats */}
        <Box style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3],
          padding: `${tokens.spacing[4]}px 0`, borderTop: `1px solid ${tokens.colors.neutral[100]}`,
        }}>
          {[
            { label: 'Applications', value: stats.activeApplications, icon: <FileText size={14} color={tokens.colors.primaryScale[500]} /> },
            { label: 'Interviews', value: stats.totalInterviews, icon: <Calendar size={14} color={tokens.colors.infoScale[500]} /> },
            { label: 'Avg Score', value: `${stats.avgScore}%`, icon: <Star size={14} color={tokens.colors.warningScale[500]} /> },
            { label: 'Last Active', value: timeAgo(stats.lastActivityDate), icon: <Activity size={14} color={tokens.colors.successScale[500]} /> },
          ].map(stat => (
            <Box key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {stat.icon}
              <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: 1 }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{stat.label}</Text>
            </Box>
          ))}
        </Box>

        {/* View full profile link */}
        {props.onEditProfile && (
          <Box
            onClick={props.onEditProfile}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[3]}px`,
              borderTop: `1px solid ${tokens.colors.neutral[100]}`, marginTop: tokens.spacing[2],
              cursor: 'pointer', color: tokens.colors.primaryScale[600],
              fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
              transition: `color ${tokens.motion.hover}`,
            }}
          >
            View Full Profile <ChevronRight size={14} />
          </Box>
        )}
      </Box>
    );
  },
});
