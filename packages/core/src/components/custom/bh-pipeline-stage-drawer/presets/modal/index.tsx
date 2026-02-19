'use client';

/**
 * BhPipelineStageDrawer - Modal Preset
 * Centered dialog with stage detail, conversion trend, bulk actions.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
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
  getAccentAwareLayout,

  createDividerStyle,
  createPersonalitySkeletonStyle,
  formatAbbreviated,
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

const MOCK_TREND = [30, 35, 32, 40, 38, 42, 45];

/* ================================================================== */
/*  Modal Preset                                                       */
/* ================================================================== */

export const ModalBhPipelineStageDrawer = createPreset<BhPipelineStageDrawerProps>({
  name: 'BhPipelineStageDrawer.Modal',
  render: (ctx: PresetContext<BhPipelineStageDrawerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      stage = { name: '', candidateCount: 0, avgDays: 0, conversionRate: 0, candidates: [] } as StageDetail,
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
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const handleClose = useCallback(() => { onClose?.(); }, [onClose]);
    const handleCandidateClick = useCallback((id: string) => { onCandidateClick?.(id); }, [onCandidateClick]);

    const toggleSelect = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const handleBulkAction = useCallback((action: BulkActionType) => {
      onBulkAction?.(action, Array.from(selectedIds));
    }, [onBulkAction, selectedIds]);

    /* Sparkline */
    const sparkWidth = 100;
    const sparkHeight = 28;
    const trendPath = useMemo(() => {
      const maxVal = Math.max(...MOCK_TREND, 1);
      const minVal = Math.min(...MOCK_TREND, 0);
      const range = maxVal - minVal || 1;
      const pts = MOCK_TREND.map((v, i) => ({
        x: (i / (MOCK_TREND.length - 1)) * sparkWidth,
        y: sparkHeight - ((v - minVal) / range) * (sparkHeight - 4) - 2,
      }));
      if (pts.length < 2) return '';
      let d = `M${pts[0].x},${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
      }
      return d;
    }, []);

    if (!isOpen) return <Box style={{ display: 'none' }} />;

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      /* Overlay */
      <Box
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 50,
          opacity: 1,
          transition: 'opacity 200ms ease',
          ...(isGlass && t.glass ? { backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' } : {}),
        }}
        onClick={handleClose}
        role="presentation"
      >
        {/* Dialog */}
        <Box
          className={className}
          role="dialog"
          aria-label={`${stage.name} stage details`}
          aria-modal="true"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          style={{
            width: 560,
            maxWidth: '90vw',
            maxHeight: '80vh',
            backgroundColor: t.colors.common.white,
            borderRadius: t.borderRadius.lg,
            boxShadow: t.shadows.xl,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transform: 'scale(1) translateY(0)',
            opacity: 1,
            transition: 'transform 300ms ease, opacity 200ms ease',
            ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
            ...style,
          }}
        >
          {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

          {/* Header */}
          <Box style={{
            padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <Users size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                  display: 'block',
                }}>
                  {stage.name}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Stage overview and candidate management
                </Text>
              </Box>
            </Box>
            <button
              onClick={handleClose}
              aria-label="Close modal"
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

          {/* Stats + Trend Row */}
          <Box style={{
            padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: t.spacing[4],
            flexWrap: 'wrap',
          }}>
            <Box style={{ display: 'flex', gap: t.spacing[5] }}>
              {[
                { label: 'Candidates', value: String(stage.candidateCount ?? 0), icon: Users },
                { label: 'Avg Days', value: (stage.avgDays ?? 0).toFixed(1), icon: Clock },
                { label: 'Conversion', value: `${((stage.conversionRate ?? 0) * 100).toFixed(0)}%`, icon: TrendingUp },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Box key={stat.label} style={{ ...animStyle(i), textAlign: 'center' }} role="status" aria-label={`${stat.label}: ${stat.value}`}>
                    <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                      {stat.value}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
                      <Icon size={10} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                        {stat.label}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box role="img" aria-label="Conversion trend">
              <svg width={sparkWidth} height={sparkHeight} viewBox={`0 0 ${sparkWidth} ${sparkHeight}`}>
                <path d={trendPath} fill="none" stroke={t.colors.successScale[500]} strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </Box>
          </Box>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <Box style={{
              padding: `${t.spacing[2]}px ${t.spacing[6]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.primaryScale[50],
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[700] }}>
                {selectedIds.size} selected
              </Text>
              <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                {[
                  { action: 'advance' as BulkActionType, icon: ArrowRight, label: 'Advance', color: t.colors.successScale },
                  { action: 'reject' as BulkActionType, icon: XCircle, label: 'Reject', color: t.colors.errorScale },
                  { action: 'send_email' as BulkActionType, icon: Mail, label: 'Email', color: t.colors.infoScale },
                ].map((ba, i) => {
                  const Icon = ba.icon;
                  return (
                    <button
                      key={ba.action}
                      onClick={() => handleBulkAction(ba.action)}
                      aria-label={`${ba.label} selected`}
                      style={{
                        ...animStyle(i),
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                        borderRadius: badgeRadius, fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.medium,
                        border: `1px solid ${ba.color[200]}`,
                        backgroundColor: ba.color[50], color: ba.color[700],
                        cursor: 'pointer', transition: `all ${t.motion.hover}`,
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

          {/* Candidate List */}
          <Box style={{ flex: 1, overflow: 'auto' }} role="list" aria-label="Stage candidates">
            {(stage.candidates ?? []).length === 0 && (
              <Box style={createEmptyStateStyle(t)}>
                <Users size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                  No candidates in this stage
                </Text>
              </Box>
            )}
            {(stage.candidates ?? []).map((candidate, i) => {
              const isSelected = selectedIds.has((candidate.id ?? ''));
              const isHovered = hoveredCandidate === candidate.id;
              return (
                <Box
                  key={candidate.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${candidate.name}, ${getStatusLabel(candidate.status ?? 'new')}`}
                  onClick={() => handleCandidateClick((candidate.id ?? ''))}
                  onMouseEnter={() => setHoveredCandidate((candidate.id ?? null))}
                  onMouseLeave={() => setHoveredCandidate(null)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCandidateClick((candidate.id ?? '')); } }}
                  style={{
                    ...animStyle(i),
                    display: 'flex', alignItems: 'center', gap: t.spacing[3],
                    padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
                    borderBottom: `1px solid ${t.colors.neutral[50]}`,
                    cursor: 'pointer',
                    backgroundColor: isSelected ? t.colors.primaryScale[50] : isHovered ? t.colors.neutral[50] : t.colors.common.white,
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
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

                  <Box style={{
                    width: 32, height: 32, borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.primaryScale[100],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>
                      {candidate.avatarInitial}
                    </Text>
                  </Box>

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[900], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {candidate.name}
                      </Text>
                      <Box style={{ ...createBadgeStyle(t, getStatusBadgeKey(candidate.status ?? 'new')), borderRadius: badgeRadius, padding: `0px ${t.spacing[1]}px` }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(candidate.status ?? 'new')}</Text>
                      </Box>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      Applied {candidate.appliedAt ? formatDistanceToNow((typeof candidate.appliedAt === 'string' ? new Date(candidate.appliedAt) : candidate.appliedAt), { addSuffix: true }) : 'N/A'}
                    </Text>
                  </Box>

                  {candidate.score != null && (
                    <Box style={{
                      ...createBadgeStyle(t, candidate.score >= 80 ? 'success' : candidate.score >= 60 ? 'warning' : 'error'),
                      borderRadius: badgeRadius, padding: `1px ${t.spacing[2]}px`, flexShrink: 0,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>{candidate.score}</Text>
                    </Box>
                  )}

                  <ChevronRight size={14} color={t.colors.neutral[300]} style={{ flexShrink: 0 }} />
                </Box>
              );
            })}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
