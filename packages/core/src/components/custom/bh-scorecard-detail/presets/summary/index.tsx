'use client';

/**
 * BhScorecardDetail - Summary Preset
 * Compact overview card version showing key scorecard data at a glance.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createStatusDotStyle,
  createProgressBarStyle,
} from '../../../helpers';
import type { BhScorecardDetailProps, ScorecardDimension } from '../../core';
import {
  getScoreLevelColors,
  getPassFailColors,
  getScoreGradientColor,
  getConfidenceLabel,
  getConfidenceColor,
} from '../../core';
import {
  User, Briefcase, Target, CheckCircle2, XCircle, AlertTriangle,
  Shield, Star, AlertOctagon, TrendingUp, ThumbsUp, Edit3,
  RotateCcw, Users, ChevronDown, ChevronRight,
} from 'lucide-react';

export const SummaryBhScorecardDetail = createPreset<BhScorecardDetailProps>({
  name: 'BhScorecardDetail.Summary',
  render: ({ primitives, props, tokens }: PresetContext<BhScorecardDetailProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      header, dimensions, overrideInfo, cohortComparison,
      onApprove, onOverride, onRequestRescore, onDimensionSelect,
      className, style,
    } = props;

    const [expanded, setExpanded] = useState(false);
    const [hoveredDim, setHoveredDim] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);

    const lvlColors = getScoreLevelColors(header.overallLevel, tokens);
    const pfColors = getPassFailColors(header.passFail, tokens);
    const knockouts = dimensions.filter(d => d.isKnockout && d.knockoutTriggered);
    const sorted = useMemo(() => [...dimensions].sort((a, b) => b.score - a.score), [dimensions]);
    const topDims = sorted.slice(0, 3);
    const bottomDims = sorted.slice(-3).reverse();
    const displayDims = expanded ? sorted : sorted.slice(0, 5);

    /* ── Score Ring ─────────────────────────────────────── */
    const ScoreRing = () => {
      const sz = 68, sw = 6, r = (sz - sw) / 2;
      const circ = 2 * Math.PI * r;
      const prog = (header.overallScore / 100) * circ;
      return (
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <circle cx={sz / 2} cy={sz / 2} r={r} fill="none"
            stroke={tokens.colors.neutral[100]} strokeWidth={sw} />
          <circle cx={sz / 2} cy={sz / 2} r={r} fill="none"
            stroke={lvlColors.ring} strokeWidth={sw}
            strokeDasharray={`${prog} ${circ - prog}`}
            strokeDashoffset={circ / 4} strokeLinecap="round"
            style={{ transition: `stroke-dasharray ${tokens.motion.hover}` }} />
          <text x={sz / 2} y={sz / 2} textAnchor="middle" dominantBaseline="middle"
            fill={tokens.colors.neutral[900]}
            fontSize={tokens.typography.fontSize.lg}
            fontWeight={tokens.typography.fontWeight.bold}>
            {header.overallScore}
          </text>
        </svg>
      );
    };

    /* ── Badge pill ─────────────────────────────────────── */
    const Pill = ({ bg, clr, border: brd, icon, label }: {
      bg: string; clr: string; border?: string; icon: React.ReactNode; label: string;
    }) => (
      <Flex align="center" gap={4} style={{
        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold,
        backgroundColor: bg, color: clr,
        ...(brd ? { border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${brd}` } : {}),
      }}>
        {icon}
        <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{label}</Text>
      </Flex>
    );

    /* ── Mini dimension bar ─────────────────────────────── */
    const DimBar = (dim: ScorecardDimension) => {
      const isHov = hoveredDim === dim.id;
      return (
        <Box key={dim.id}
          onMouseEnter={() => setHoveredDim(dim.id)}
          onMouseLeave={() => setHoveredDim(null)}
          onClick={() => onDimensionSelect?.(dim.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, ...hov, padding: `${tokens.spacing[1]}px 0` }}>
          <Text style={{
            flex: 1, fontSize: tokens.typography.fontSize.xs,
            color: isHov ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
            fontWeight: isHov ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            minWidth: 0, transition: `color ${tokens.transitions?.fast || tokens.motion.hover}`,
          }}>
            {dim.name}
          </Text>
          <Box style={{
            width: 80, height: 6, backgroundColor: tokens.colors.neutral[100],
            borderRadius: tokens.borderRadius.full, overflow: 'hidden', flexShrink: 0,
          }}>
            <Box style={{
              width: `${dim.score}%`, height: '100%',
              backgroundColor: getScoreGradientColor(dim.score, tokens),
              borderRadius: tokens.borderRadius.full,
              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
            }} />
          </Box>
          <Text style={{
            fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700], minWidth: 24, textAlign: 'right' as const,
          }}>
            {dim.score}
          </Text>
        </Box>
      );
    };

    /* ── Top/Bottom panel ──────────────────────────────── */
    const DimPanel = ({ title, icon, dims, scale }: {
      title: string; icon: React.ReactNode; dims: ScorecardDimension[];
      scale: { [k: number]: string };
    }) => (
      <Box style={{
        padding: tokens.spacing[3], backgroundColor: (scale as any)[50],
        borderRadius: tokens.borderRadius.lg,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${(scale as any)[100]}`,
      }}>
        <Flex align="center" gap={4} style={{
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: (scale as any)[700], marginBottom: tokens.spacing[2],
        }}>
          {icon}
          <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{title}</Text>
        </Flex>
        <Stack gap={2}>
          {dims.map(dim => (
            <Flex key={dim.id} justify="between" align="center" style={{
              fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
            }}>
              <Text style={{
                fontSize: 'inherit', color: 'inherit', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                flex: 1, minWidth: 0,
              }}>
                {dim.name}
              </Text>
              <Text style={{
                fontSize: 'inherit', fontWeight: tokens.typography.fontWeight.semibold,
                color: (scale as any)[700], marginLeft: tokens.spacing[2],
              }}>
                {dim.score}
              </Text>
            </Flex>
          ))}
        </Stack>
      </Box>
    );

    /* ── Action button ─────────────────────────────────── */
    const ActionBtn = ({ onClick, icon, label, bg, clr, borderClr }: {
      onClick?: () => void; icon: React.ReactNode; label: string;
      bg: string; clr: string; borderClr?: string;
    }) => (
      <Box onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        ...hov, padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
        borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold, color: clr, backgroundColor: bg,
        ...(borderClr ? { border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${borderClr}` } : {}),
      }}>
        {icon}
        <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{label}</Text>
      </Box>
    );

    return (
      <Box className={className} style={{ ...card, padding: tokens.spacing[5], ...style }}>
        {/* ── Header ───────────────────────────────────── */}
        <Flex align="center" gap={16} style={{ marginBottom: tokens.spacing[4] }}>
          <Box style={{
            width: 48, height: 48, borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', flexShrink: 0,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
          }}>
            {header.candidateAvatar
              ? <img src={header.candidateAvatar} alt={header.candidateName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <User size={22} color={tokens.colors.primaryScale[600]} />}
          </Box>
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            }}>
              {header.candidateName}
            </Text>
            <Flex align="center" gap={6} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              <Flex align="center" gap={3}>
                <Briefcase size={12} />
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{header.jobTitle}</Text>
              </Flex>
              <Box style={{ width: 3, height: 3, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[300] }} />
              <Flex align="center" gap={3}>
                <Target size={12} />
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{header.stageName}</Text>
              </Flex>
            </Flex>
          </Stack>
          <ScoreRing />
        </Flex>

        {/* ── Badges ───────────────────────────────────── */}
        <Flex align="center" gap={6} wrap="wrap" style={{ marginBottom: tokens.spacing[4] }}>
          <Pill bg={lvlColors.bg} clr={lvlColors.color} border={lvlColors.border}
            icon={<Star size={10} />} label={header.overallLevel.charAt(0).toUpperCase() + header.overallLevel.slice(1)} />
          <Pill bg={pfColors.bg} clr={pfColors.color} border={pfColors.border}
            icon={header.passFail === 'pass' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            label={header.passFail.toUpperCase()} />
          <Pill bg={tokens.colors.neutral[100]} clr={tokens.colors.neutral[600]}
            icon={<Shield size={10} />}
            label={`${getConfidenceLabel(header.confidence)} (${Math.round(header.confidence * 100)}%)`} />
          {knockouts.length > 0 && (
            <Pill bg={tokens.colors.errorScale[100]} clr={tokens.colors.errorScale[700]}
              border={tokens.colors.errorScale[200]}
              icon={<AlertOctagon size={10} />}
              label={`${knockouts.length} Knockout${knockouts.length > 1 ? 's' : ''}`} />
          )}
          {overrideInfo && (
            <Pill bg={tokens.colors.warningScale[100]} clr={tokens.colors.warningScale[700]}
              icon={<Edit3 size={10} />} label="Overridden" />
          )}
          {cohortComparison && (
            <Pill bg={tokens.colors.primaryScale[50]} clr={tokens.colors.primaryScale[700]}
              icon={<Users size={10} />} label={`P${cohortComparison.percentile}`} />
          )}
        </Flex>

        {/* ── Top / Bottom Strengths ───────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
          <DimPanel title="Top Strengths" icon={<TrendingUp size={12} />}
            dims={topDims} scale={tokens.colors.successScale as unknown as { [k: number]: string }} />
          <DimPanel title="Areas to Improve" icon={<AlertTriangle size={12} />}
            dims={bottomDims} scale={tokens.colors.errorScale as unknown as { [k: number]: string }} />
        </div>

        {/* ── Dimension Bars ───────────────────────────── */}
        <Box style={{ marginBottom: tokens.spacing[4] }}>
          <Flex justify="between" align="center" style={{ marginBottom: tokens.spacing[2] }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Dimensions ({dimensions.length})
            </Text>
          </Flex>
          {displayDims.map(dim => DimBar(dim))}
          {dimensions.length > 5 && (
            <Box
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                ...hov, padding: `${tokens.spacing[1]}px 0`,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.primaryScale[600],
                fontWeight: tokens.typography.fontWeight.medium,
                marginTop: tokens.spacing[1],
              }}>
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit' }}>
                {expanded ? 'Show less' : `Show ${dimensions.length - 5} more`}
              </Text>
            </Box>
          )}
        </Box>

        {/* ── Actions ──────────────────────────────────── */}
        {(onApprove || onOverride || onRequestRescore) && (
          <Flex align="center" gap={8} style={{
            paddingTop: tokens.spacing[3],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            {onApprove && (
              <ActionBtn onClick={onApprove} icon={<ThumbsUp size={12} />}
                label="Approve" bg={tokens.colors.successScale[600]} clr={tokens.colors.common.white} />
            )}
            {onOverride && (
              <ActionBtn onClick={() => onOverride(header.overallScore, '')}
                icon={<Edit3 size={12} />} label="Override"
                bg={tokens.colors.warningScale[50]} clr={tokens.colors.warningScale[700]}
                borderClr={tokens.colors.warningScale[200]} />
            )}
            {onRequestRescore && (
              <ActionBtn onClick={onRequestRescore} icon={<RotateCcw size={12} />}
                label="Re-score" bg={tokens.colors.infoScale[50]} clr={tokens.colors.infoScale[700]}
                borderClr={tokens.colors.infoScale[200]} />
            )}
          </Flex>
        )}
      </Box>
    );
  },
});
