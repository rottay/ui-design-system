'use client';

/**
 * BhCandidateComparison - Side-by-Side Preset
 * Candidates in columns with radar chart and comparison table.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Users, Award, Briefcase, GraduationCap, ArrowUpDown,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhCandidateComparisonProps, ComparisonCandidate } from '../../core';
import { getCandidateFullName, getCandidateRole, getCandidateExperience } from '../../core';
import type { DesignTokens } from '../../../../../types';
import type { DBCandidate } from '@rottay/recruiter';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CANDIDATES: ComparisonCandidate[] = [
  {
    candidate: { id: 'c-1', firstName: 'Sarah', lastName: 'Johnson', currentTitle: 'Senior Frontend Engineer', currentCompany: 'Google', yearsOfExperience: 8 } as unknown as DBCandidate,
    scores: { 'Technical': 92, 'Communication': 85, 'Leadership': 78, 'Problem Solving': 90, 'Culture Fit': 88 },
  },
  {
    candidate: { id: 'c-2', firstName: 'Michael', lastName: 'Chen', currentTitle: 'Full Stack Developer', currentCompany: 'Stripe', yearsOfExperience: 6 } as unknown as DBCandidate,
    scores: { 'Technical': 88, 'Communication': 92, 'Leadership': 85, 'Problem Solving': 82, 'Culture Fit': 90 },
  },
  {
    candidate: { id: 'c-3', firstName: 'Emily', lastName: 'Rodriguez', currentTitle: 'Staff Engineer', currentCompany: 'Meta', yearsOfExperience: 10 } as unknown as DBCandidate,
    scores: { 'Technical': 95, 'Communication': 78, 'Leadership': 72, 'Problem Solving': 94, 'Culture Fit': 80 },
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCandidateColor(index: number, t: DesignTokens): string {
  const palette = [
    t.colors.primaryScale[500],
    t.colors.successScale[500],
    t.colors.warningScale[500],
    t.colors.infoScale[500],
  ];
  return palette[index % palette.length];
}

function getScoreColor(score: number, t: DesignTokens): string {
  if (score >= 90) return t.colors.successScale[600];
  if (score >= 75) return t.colors.primaryScale[600];
  if (score >= 60) return t.colors.warningScale[600];
  return t.colors.errorScale[600];
}

/* ================================================================== */
/*  Side-by-Side Preset                                                */
/* ================================================================== */

export const SideBySideBhCandidateComparison = createPreset<BhCandidateComparisonProps>({
  name: 'BhCandidateComparison.SideBySide',
  render: (ctx: PresetContext<BhCandidateComparisonProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      candidates = [],
      dimensions,
      title = 'Candidate Comparison',
      onCandidateSelect,
      highlightedId,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const dims = useMemo(() => {
      if (dimensions && dimensions.length > 0) return dimensions;
      if (candidates.length > 0) return Object.keys(candidates[0].scores);
      return [];
    }, [dimensions, candidates]);

    const handleSelect = useCallback((id: string) => {
      onCandidateSelect?.(id);
    }, [onCandidateSelect]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* Find highest score per dimension */
    const bestScores = useMemo(() => {
      const bests: Record<string, { value: number; candidateId: string }> = {};
      dims.forEach(dim => {
        let best = { value: 0, candidateId: '' };
        candidates.forEach(c => {
          if ((c.scores[dim] ?? 0) > best.value) {
            best = { value: c.scores[dim] ?? 0, candidateId: c.candidate.id };
          }
        });
        bests[dim] = best;
      });
      return bests;
    }, [dims, candidates]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <ArrowUpDown size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                {title}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Comparing {candidates.length} candidates across {dims.length} dimensions
              </Text>
            </Box>
          </Box>
        </Box>

        {candidates.length === 0 ? (
          <Box style={createEmptyStateStyle(t)}>
            <Users size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              No candidates to compare
            </Text>
          </Box>
        ) : (
          <Box style={{ padding: t.spacing[5] }}>
            {/* Candidate cards row */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(candidates.length, 4)}, 1fr)`,
              gap: t.spacing[3],
              marginBottom: t.spacing[5],
            }}>
              {candidates.slice(0, 4).map((compCandidate, i) => {
                const color = getCandidateColor(i, t);
                const cand = compCandidate.candidate;
                const name = getCandidateFullName(cand);
                const roleStr = getCandidateRole(cand);
                const expStr = getCandidateExperience(cand);
                const isHighlighted = highlightedId === cand.id;
                const totalScore = dims.reduce((s, d) => s + (compCandidate.scores[d] ?? 0), 0);
                const avgScore = dims.length > 0 ? Math.round(totalScore / dims.length) : 0;

                return (
                  <Box
                    key={cand.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${name}, average score ${avgScore}`}
                    onClick={() => handleSelect(cand.id)}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelect(cand.id);
                      }
                    }}
                    style={{
                      ...animStyle(i),
                      padding: t.spacing[4],
                      borderRadius: t.borderRadius.lg,
                      border: isHighlighted
                        ? `2px solid ${color}`
                        : `1px solid ${t.colors.neutral[100]}`,
                      backgroundColor: isHighlighted ? `${color}08` : t.colors.common.white,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    {/* Avatar circle */}
                    <Box style={{
                      width: 48,
                      height: 48,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      marginBottom: t.spacing[2],
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.lg,
                        fontWeight: t.typography.fontWeight.bold,
                        color: t.colors.common.white,
                      }}>
                        {name.charAt(0)}
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: t.colors.neutral[900],
                      marginBottom: t.spacing[1],
                    }}>
                      {name}
                    </Text>
                    {roleStr && (
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                        <Briefcase size={11} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{roleStr}</Text>
                      </Box>
                    )}
                    {expStr && (
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1] }}>
                        <Award size={11} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{expStr}</Text>
                      </Box>
                    )}
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                      marginTop: t.spacing[3],
                      padding: `${t.spacing[2]}px 0`,
                      borderTop: `1px solid ${t.colors.neutral[100]}`,
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize['2xl'],
                        fontWeight: t.typography.fontWeight.bold,
                        color: getScoreColor(avgScore, t),
                      }}>
                        {avgScore}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], display: 'block' }}>
                        avg score
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {/* Comparison table */}
            <Box style={{
              border: `1px solid ${t.colors.neutral[100]}`,
              borderRadius: t.borderRadius.lg,
              overflow: 'hidden',
            }}>
              {/* Table header */}
              <Box style={{
                display: 'grid',
                gridTemplateColumns: `140px repeat(${Math.min(candidates.length, 4)}, 1fr)`,
                backgroundColor: t.colors.neutral[50],
                borderBottom: `1px solid ${t.colors.neutral[100]}`,
              }}>
                <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px` }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[500],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    Dimension
                  </Text>
                </Box>
                {candidates.slice(0, 4).map((c, i) => (
                  <Box key={c.candidate.id} style={{
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    textAlign: 'center',
                  }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: getCandidateColor(i, t),
                    }}>
                      {(c.candidate.firstName ?? '').split(' ')[0] || getCandidateFullName(c.candidate).split(' ')[0]}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Table rows */}
              {dims.map((dim, di) => (
                <Box
                  key={dim}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `140px repeat(${Math.min(candidates.length, 4)}, 1fr)`,
                    borderBottom: di < dims.length - 1 ? `1px solid ${t.colors.neutral[50]}` : 'none',
                  }}
                >
                  <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[3]}px` }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[700],
                    }}>
                      {dim}
                    </Text>
                  </Box>
                  {candidates.slice(0, 4).map((c) => {
                    const score = c.scores[dim] ?? 0;
                    const isBest = bestScores[dim]?.candidateId === c.candidate.id;
                    return (
                      <Box key={c.candidate.id} style={{
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        textAlign: 'center',
                        backgroundColor: isBest ? t.colors.successScale[50] : 'transparent',
                      }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: isBest ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                          color: getScoreColor(score, t),
                        }}>
                          {score}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
