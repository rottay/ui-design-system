'use client';

/**
 * BhPipelineStageDrawer - Drawer Preset
 * Slide-in side panel with stage header stats, candidate mini-list
 * with status chips, conversion trend sparkline, and bulk action buttons.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  X, Users, Clock, TrendingUp, ChevronRight,
  ArrowRight, XCircle, Mail, CheckSquare, Square,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhPipelineStageDrawerProps,
  StageDetail,
  StageCandidate,
  CandidateStatus,
  BulkActionType,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusColor(status: CandidateStatus, t: DesignTokens): string {
  switch (status) {
    case 'active': return t.colors.successScale[600];
    case 'new': return t.colors.infoScale[600];
    case 'on_hold': return t.colors.warningScale[600];
    case 'rejected': return t.colors.errorScale[600];
    case 'advanced': return t.colors.primaryScale[600];
    default: return t.colors.neutral[600];
  }
}

function getStatusBg(status: CandidateStatus, t: DesignTokens): string {
  switch (status) {
    case 'active': return t.colors.successScale[50];
    case 'new': return t.colors.infoScale[50];
    case 'on_hold': return t.colors.warningScale[50];
    case 'rejected': return t.colors.errorScale[50];
    case 'advanced': return t.colors.primaryScale[50];
    default: return t.colors.neutral[50];
  }
}

function getStatusBadgeKey(status: CandidateStatus): 'success' | 'info' | 'warning' | 'error' | 'primary' {
  switch (status) {
    case 'active': return 'success';
    case 'new': return 'info';
    case 'on_hold': return 'warning';
    case 'rejected': return 'error';
    case 'advanced': return 'primary';
    default: return 'info';
  }
}

function getStatusLabel(status: CandidateStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'new': return 'New';
    case 'on_hold': return 'On Hold';
    case 'rejected': return 'Rejected';
    case 'advanced': return 'Advanced';
    default: return status;
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_STAGE: StageDetail = {
  name: 'Technical Interview',
  candidateCount: 12,
  avgDays: 4.5,
  conversionRate: 0.67,
  candidates: [
    { id: 'c-1', name: 'Sarah Johnson', avatarInitial: 'SJ', status: 'active', appliedAt: new Date(Date.now() - 86400000 * 2), score: 85 },
    { id: 'c-2', name: 'Michael Chen', avatarInitial: 'MC', status: 'new', appliedAt: new Date(Date.now() - 86400000), score: 72 },
    { id: 'c-3', name: 'Emily Rodriguez', avatarInitial: 'ER', status: 'active', appliedAt: new Date(Date.now() - 86400000 * 5), score: 91 },
    { id: 'c-4', name: 'James Kim', avatarInitial: 'JK', status: 'on_hold', appliedAt: new Date(Date.now() - 86400000 * 3), score: 65 },
    { id: 'c-5', name: 'Anna Kowalski', avatarInitial: 'AK', status: 'active', appliedAt: new Date(Date.now() - 86400000 * 7), score: 78 },
    { id: 'c-6', name: 'David Park', avatarInitial: 'DP', status: 'new', appliedAt: new Date(Date.now() - 3600000 * 6), score: 88 },
  ],
};

/* Conversion trend sparkline mock */
const MOCK_TREND = [55, 62, 58, 70, 65, 72, 67];

/* ================================================================== */
/*  Drawer Preset                                                      */
/* ================================================================== */

export const DrawerBhPipelineStageDrawer = createPreset<BhPipelineStageDrawerProps>({
  name: 'BhPipelineStageDrawer.Drawer',
  render: (ctx: PresetContext<BhPipelineStageDrawerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      stage = { name: '', candidateCount: 0, avgDays: 0, conversionRate: 0, candidates: [] },
      isOpen = true,
      onClose,
      onBulkAction,
      onCandidateClick,
      className,
      style,
    } = props;

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [hoveredCandidate, setHoveredCandidate] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    const handleCandidateClick = useCallback((id: string) => {
      onCandidateClick?.(id);
    }, [onCandidateClick]);

    const toggleSelect = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }, []);

    const stageCandidates = stage.candidates ?? [];

    const toggleSelectAll = useCallback(() => {
      setSelectedIds(prev => {
        if (prev.size === stageCandidates.length) {
          return new Set();
        }
        return new Set(stageCandidates.map(c => c.id ?? '').filter(Boolean));
      });
    }, [stageCandidates]);

    const handleBulkAction = useCallback((action: BulkActionType) => {
      onBulkAction?.(action, Array.from(selectedIds));
    }, [onBulkAction, selectedIds]);

    /* Sparkline for conversion trend */
    const sparkWidth = 120;
    const sparkHeight = 32;
    const trendPoints = useMemo(() => {
      const maxVal = Math.max(...MOCK_TREND, 1);
      const minVal = Math.min(...MOCK_TREND, 0);
      const range = maxVal - minVal || 1;
      return MOCK_TREND.map((v, i) => ({
        x: (i / (MOCK_TREND.length - 1)) * sparkWidth,
        y: sparkHeight - ((v - minVal) / range) * (sparkHeight - 4) - 2,
      }));
    }, []);

    const trendPath = useMemo(() => {
      if (trendPoints.length < 2) return '';
      let d = `M${trendPoints[0].x},${trendPoints[0].y}`;
      for (let i = 1; i < trendPoints.length; i++) {
        const prev = trendPoints[i - 1];
        const curr = trendPoints[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
      }
      return d;
    }, [trendPoints]);

    if (!isOpen) return <Box style={{ display: 'none' }} />;

    const allSelected = selectedIds.size === stageCandidates.length && stageCandidates.length > 0;

    return (
      <Box
        className={className}
        role="dialog"
        aria-label={`${stage.name} stage details`}
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '100vw',
          backgroundColor: t.colors.common.white,
          boxShadow: t.shadows.xl,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50,
          transform: 'translateX(0)',
          transition: `transform 300ms ease`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          flexShrink: 0,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <Users size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                  display: 'block',
                }}>
                  {stage.name}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {stage.candidateCount} candidates in stage
                </Text>
              </Box>
            </Box>
            <button
              onClick={handleClose}
              aria-label="Close drawer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white, color: t.colors.neutral[500],
                cursor: 'pointer', padding: 0,
                transition: `all ${t.motion.hover}`,
              }}
            >
              <X size={16} />
            </button>
          </Box>

          {/* Stats Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: t.spacing[3],
          }}>
            {[
              { label: 'Candidates', value: String(stage.candidateCount ?? 0), icon: Users, color: t.colors.primaryScale },
              { label: 'Avg Days', value: (stage.avgDays ?? 0).toFixed(1), icon: Clock, color: t.colors.warningScale },
              { label: 'Conversion', value: `${((stage.conversionRate ?? 0) * 100).toFixed(0)}%`, icon: TrendingUp, color: t.colors.successScale },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Box
                  key={stat.label}
                  style={{
                    ...card,
                    padding: t.spacing[3],
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    gap: t.spacing[1],
                  }}
                  role="status"
                  aria-label={`${stat.label}: ${stat.value}`}
                >
                  <Icon size={14} color={stat.color[500]} />
                  <Text style={{
                    fontSize: t.typography.fontSize.lg,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {stat.value}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {stat.label}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Conversion Trend */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ ...sectionLabel, marginBottom: 0 }}>Conversion Trend</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Last 7 periods</Text>
          </Box>
          <Box role="img" aria-label="Conversion trend sparkline">
            <svg width={sparkWidth} height={sparkHeight} viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}>
              <path d={trendPath} fill="none" stroke={t.colors.successScale[500]} strokeWidth={1.5} strokeLinecap="round" />
              {trendPoints.length > 0 && (
                <circle
                  cx={trendPoints[trendPoints.length - 1].x}
                  cy={trendPoints[trendPoints.length - 1].y}
                  r={2.5}
                  fill={t.colors.successScale[500]}
                />
              )}
            </svg>
          </Box>
        </Box>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <Box style={{
            padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.primaryScale[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[700] }}>
              {selectedIds.size} selected
            </Text>
            <Box style={{ display: 'flex', gap: t.spacing[1] }}>
              {[
                { action: 'advance' as BulkActionType, icon: ArrowRight, label: 'Advance', color: t.colors.successScale },
                { action: 'reject' as BulkActionType, icon: XCircle, label: 'Reject', color: t.colors.errorScale },
                { action: 'send_email' as BulkActionType, icon: Mail, label: 'Email', color: t.colors.infoScale },
              ].map((ba) => {
                const Icon = ba.icon;
                return (
                  <button
                    key={ba.action}
                    onClick={() => handleBulkAction(ba.action)}
                    aria-label={`${ba.label} selected candidates`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                      borderRadius: badgeRadius,
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      border: `1px solid ${ba.color[200]}`,
                      backgroundColor: ba.color[50],
                      color: ba.color[700],
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Icon size={12} />
                    {ba.label}
                  </button>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Candidate List Header */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <button
              onClick={toggleSelectAll}
              aria-label={allSelected ? 'Deselect all candidates' : 'Select all candidates'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, padding: 0,
                backgroundColor: 'transparent', border: 'none',
                cursor: 'pointer', color: allSelected ? t.colors.primaryScale[600] : t.colors.neutral[400],
              }}
            >
              {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            </button>
            <Text style={{ ...sectionLabel, marginBottom: 0, fontSize: t.typography.fontSize.xs }}>
              Candidates
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {stageCandidates.length} total
          </Text>
        </Box>

        {/* Candidate List */}
        <Box style={{ flex: 1, overflow: 'auto' }} role="list" aria-label="Stage candidates">
          {stageCandidates.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Users size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No candidates in this stage
              </Text>
            </Box>
          )}
          {stageCandidates.map((candidate, i) => {
            const isSelected = selectedIds.has((candidate.id ?? ''));
            const isHovered = hoveredCandidate === candidate.id;

            return (
              <Box
                key={candidate.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${candidate.name}, ${getStatusLabel(candidate.status!)}${candidate.score != null ? `, score ${candidate.score}` : ''}`}
                onClick={() => handleCandidateClick((candidate.id ?? ''))}
                onMouseEnter={() => setHoveredCandidate((candidate.id ?? null))}
                onMouseLeave={() => setHoveredCandidate(null)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCandidateClick((candidate.id ?? '')); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[3],
                  padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected
                    ? t.colors.primaryScale[50]
                    : isHovered
                      ? t.colors.neutral[50]
                      : t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                  ...entrance.animate,
                  transitionDelay: `${createStaggerDelay(t, i)}ms`,
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={(e) => toggleSelect((candidate.id ?? ''), e)}
                  aria-label={isSelected ? `Deselect ${candidate.name}` : `Select ${candidate.name}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 20, height: 20, padding: 0, flexShrink: 0,
                    backgroundColor: 'transparent', border: 'none',
                    cursor: 'pointer', color: isSelected ? t.colors.primaryScale[600] : t.colors.neutral[300],
                  }}
                >
                  {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                </button>

                {/* Avatar */}
                <Box style={{
                  width: 32, height: 32, borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.primaryScale[100],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.primaryScale[700],
                  }}>
                    {candidate.avatarInitial}
                  </Text>
                </Box>

                {/* Info */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[900],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {candidate.name}
                    </Text>
                    <Box style={{
                      ...createBadgeStyle(t, getStatusBadgeKey(candidate.status!)),
                      borderRadius: badgeRadius,
                      padding: `0px ${t.spacing[1]}px`,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(candidate.status!)}</Text>
                    </Box>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    Applied {formatDistanceToNow((typeof candidate.appliedAt! === 'string' ? new Date(candidate.appliedAt!) : candidate.appliedAt!), { addSuffix: true })}
                  </Text>
                </Box>

                {/* Score */}
                {candidate.score != null && (
                  <Box style={{
                    ...createBadgeStyle(t, candidate.score >= 80 ? 'success' : candidate.score >= 60 ? 'warning' : 'error'),
                    borderRadius: badgeRadius,
                    padding: `1px ${t.spacing[2]}px`,
                    flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
                      {candidate.score}
                    </Text>
                  </Box>
                )}

                <ChevronRight size={14} color={t.colors.neutral[300]} style={{ flexShrink: 0 }} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
