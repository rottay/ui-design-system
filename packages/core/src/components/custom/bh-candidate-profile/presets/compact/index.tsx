'use client';

/**
 * BhCandidateProfile - Compact Preset
 * Summary card with avatar, key info, skills, and quick stats.
 * Ideal for sidebars, list items, and comparison embeds.
 *
 * Personality-driven, glass-aware, zero raw HTML.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createProgressBarStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  formatDistanceToNow,
  getCardPadding,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhCandidateProfileProps } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Briefcase, MapPin, Mail, Phone, Star,
  Calendar, FileText, Activity, ChevronRight,
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

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhCandidateProfile = createPreset<BhCandidateProfileProps>({
  name: 'BhCandidateProfile.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhCandidateProfileProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;
    const candidate = props.candidate ?? DEFAULT_CANDIDATE;
    const skills = props.skills ?? DEFAULT_SKILLS;
    const stats = props.stats ?? DEFAULT_STATS;


    const isGlass = useMemo(() => t.surface.useGlass, [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const statusConfig = useMemo(() => getStatusConfig(candidate.status ?? 'active', t), [candidate.status, t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleViewProfile = useCallback(() => {
      props.onEditProfile?.();
    }, [props.onEditProfile]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        props.onEditProfile?.();
      }
    }, [props.onEditProfile]);

    const animStyle = useCallback((index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    }), [entrance, t]);

    /* Score Ring */
    const ScoreRing = useMemo(() => {
      return ({ score, size = 56 }: { score: number; size?: number }) => {
        const color = getScoreColor(score, t);
        const r = (size / 2) - 4;
        const circumference = 2 * Math.PI * r;
        const strokeOffset = circumference - (score / 100) * circumference;
        return (
          <Box style={{ position: 'relative', width: size, height: size, flexShrink: 0 }} role="img" aria-label={`Score: ${score}`}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth="3" />
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="3"
                strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round"
                style={{ transition: `stroke-dashoffset ${t.motion.hover}` }} />
            </svg>
            <Box style={{ 
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color, lineHeight: 1 }}>{score}</Text>
              <Text style={{ fontSize: 8, color: t.colors.neutral[400], lineHeight: 1}}>score</Text>
            </Box>
          </Box>
        );
      };
    }, [t]);

    const statItems = useMemo(() => [
      { label: 'Applications', value: stats.activeApplications, icon: <FileText size={14} color={t.colors.primaryScale[500]} /> },
      { label: 'Interviews', value: stats.totalInterviews, icon: <Calendar size={14} color={t.colors.infoScale[500]} /> },
      { label: 'Avg Score', value: `${stats.avgScore}%`, icon: <Star size={14} color={t.colors.warningScale[500]} /> },
      { label: 'Last Active', value: formatDistanceToNow(stats.lastActivityDate), icon: <Activity size={14} color={t.colors.successScale[500]} /> },
    ], [stats, t]);

    return (
      <Box className={props.className} style={{
        ...card,
        padding: `${t.spacing[6]}px`,
        backgroundColor: isGlass && t.glass ? t.glass.bg : t.colors.common.white,
        ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}),
        ...props.style,
      }}>
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header: Avatar + Name + Status */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], marginBottom: t.spacing[5], ...animStyle(0) }}>
          <Box style={{
            width: 56, height: 56, borderRadius: t.borderRadius.full, flexShrink: 0,
            overflow: 'hidden', backgroundColor: t.colors.primaryScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.primaryScale[700],
          }}>
            {candidate.avatar
              ? <img src={candidate.avatar} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Text style={{ fontSize: t.typography.fontSize.xl, fontWeight: t.typography.fontWeight.semibold, color: t.colors.primaryScale[700] }}>
                  {getInitials(candidate.name)}
                </Text>
            }
          </Box>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: 4 }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                {candidate.name}
              </Text>
              <Box style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: `2px ${t.spacing[2]}px`, borderRadius: badgeRadius,
                backgroundColor: statusConfig.bg, fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium, color: statusConfig.text,
              }}>
                <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: statusConfig.dot }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: statusConfig.text }}>{statusConfig.label}</Text>
              </Box>
            </Box>
            {candidate.currentRole && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                <Briefcase size={13} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>{candidate.currentRole}</Text>
              </Box>
            )}
            {candidate.location && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <MapPin size={13} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>{candidate.location}</Text>
              </Box>
            )}
          </Box>
          <ScoreRing score={stats.avgScore} />
        </Box>

        {/* Contact row */}
        <Box style={{
          display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[5],
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          backgroundColor: t.colors.neutral[50], borderRadius: t.borderRadius.lg,
          ...animStyle(1),
        }}>
          {candidate.email && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Mail size={13} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{candidate.email}</Text>
            </Box>
          )}
          {candidate.phone && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Phone size={13} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>{candidate.phone}</Text>
            </Box>
          )}
        </Box>

        {/* Skills with proficiency bars */}
        <Box style={{ marginBottom: t.spacing[5], ...animStyle(2) }}>
          <Text style={sectionLabel}>Top Skills</Text>
          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
            {skills.slice(0, 5).map(skill => {
              const progressStyle = createProgressBarStyle(t, { percent: skill.proficiency, color: getScoreColor(skill.proficiency, t) });
              return (
                <Box key={skill.name} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], width: 80, flexShrink: 0, fontWeight: t.typography.fontWeight.medium }}>
                    {skill.name}
                  </Text>
                  <Box style={{ flex: 1 }}>
                    <Box style={{ ...progressStyle.track, height: 4 }}>
                      <Box style={{ ...progressStyle.fill, height: 4 }} />
                    </Box>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 28, textAlign: 'right' }}>
                    {skill.proficiency}
                  </Text>
                </Box>
              );
            })}
            {skills.length > 5 && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                +{skills.length - 5} more skills
              </Text>
            )}
          </Box>
        </Box>

        {/* Quick stats */}
        <Box
          role="status"
          aria-label="Candidate statistics"
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: t.spacing[3],
            padding: `${t.spacing[4]}px 0`, borderTop: `1px solid ${t.colors.neutral[100]}`,
            ...animStyle(3),
          }}
        >
          {statItems.map(stat => (
            <Box key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {stat.icon}
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], lineHeight: 1 }}>
                {stat.value}
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[400],
                textTransform: ptypo.labelTransform,
                letterSpacing: ptypo.labelLetterSpacing,
              }}>{stat.label}</Text>
            </Box>
          ))}
        </Box>

        {/* View full profile link */}
        {props.onEditProfile && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View full profile"
            onClick={handleViewProfile}
            onKeyDown={handleKeyDown}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1],
              padding: `${t.spacing[3]}px`,
              borderTop: `1px solid ${t.colors.neutral[100]}`, marginTop: t.spacing[2],
              cursor: 'pointer', color: t.colors.primaryScale[600],
              fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
              transition: `color ${t.motion.hover}`,
            }}
          >
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.primaryScale[600], fontWeight: t.typography.fontWeight.medium }}>View Full Profile</Text>
            <ChevronRight size={14} />
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
