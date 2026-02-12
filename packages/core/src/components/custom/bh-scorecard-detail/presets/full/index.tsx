'use client';

/**
 * BhScorecardDetail - Full Preset
 * Complete scorecard with radar chart, dimension details, evidence, confidence,
 * override support, and cohort comparison.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSectionHeaderStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createSurfaceStyle,
} from '../../../helpers';
import type {
  BhScorecardDetailProps, ScorecardDimension, ScorecardSortBy, ScorecardView,
} from '../../core';
import {
  getScoreLevelColors, getPassFailColors, getScoreGradientColor,
  getConfidenceLabel, getConfidenceColor,
} from '../../core';
import {
  User, Briefcase, Target, CheckCircle2, XCircle, AlertTriangle,
  Shield, Star, AlertOctagon, TrendingUp, ThumbsUp, Edit3,
  RotateCcw, Users, ChevronDown, ChevronRight, MessageSquare,
  Quote, BarChart3, Eye, Table, Hexagon, FileText, Activity,
  Bot, ArrowUpDown,
} from 'lucide-react';

/* ── Helpers ───────────────────────────────────────────── */
function sortDimensions(dims: ScorecardDimension[], sortBy: ScorecardSortBy): ScorecardDimension[] {
  const s = [...dims];
  const fns: Record<string, () => ScorecardDimension[]> = {
    name: () => s.sort((a, b) => a.name.localeCompare(b.name)),
    score: () => s.sort((a, b) => b.score - a.score),
    weight: () => s.sort((a, b) => b.weight - a.weight),
    confidence: () => s.sort((a, b) => b.confidence - a.confidence),
    evidence: () => s.sort((a, b) => b.evidenceCount - a.evidenceCount),
  };
  return (fns[sortBy] ?? (() => s))();
}

export const FullBhScorecardDetail = createPreset<BhScorecardDetailProps>({
  name: 'BhScorecardDetail.Full',
  render: ({ primitives, props, tokens }: PresetContext<BhScorecardDetailProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      header, dimensions, selectedDimension: selDimProp, evidence = [],
      overrideInfo, cohortComparison,
      onDimensionSelect, onApprove, onOverride, onRequestRescore,
      onSubmitAppeal, showOverrideForm: showOverProp, onOverrideFormToggle,
      overrideReason: overReasonProp, onOverrideReasonChange,
      sortBy: sortByProp, onSortChange, activeView: viewProp,
      className, style,
    } = props;

    const [intExpandedDim, setIntExpandedDim] = useState<string | null>(null);
    const [intShowOverride, setIntShowOverride] = useState(false);
    const [intOverrideReason, setIntOverrideReason] = useState('');
    const [intSortBy, setIntSortBy] = useState<ScorecardSortBy>('score');
    const [intActiveView, setIntActiveView] = useState<ScorecardView>('table');

    const selectedDimension = selDimProp ?? intExpandedDim;
    const showOverride = showOverProp ?? intShowOverride;
    const overrideReason = overReasonProp ?? intOverrideReason;
    const sortBy = sortByProp ?? intSortBy;
    const activeView = viewProp ?? intActiveView;

    const handleDimSelect = (id: string) => { onDimensionSelect?.(id); setIntExpandedDim(prev => prev === id ? null : id); };
    const handleSort = (f: ScorecardSortBy) => { onSortChange?.(f); setIntSortBy(f); };
    const handleOverToggle = (s: boolean) => { onOverrideFormToggle?.(s); setIntShowOverride(s); };
    const handleOverReason = (r: string) => { onOverrideReasonChange?.(r); setIntOverrideReason(r); };

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const surfStyle = useMemo(() => createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const sorted = useMemo(() => sortDimensions(dimensions, sortBy), [dimensions, sortBy]);
    const knockouts = dimensions.filter(d => d.isKnockout && d.knockoutTriggered);
    const lvlColors = getScoreLevelColors(header.overallLevel, tokens);
    const pfColors = getPassFailColors(header.passFail, tokens);

    const bdr = `${tokens.surface.borderWidth} ${tokens.surface.borderStyle}`;
    const trans = tokens.transitions?.normal || tokens.motion.hover;

    /* ── Score Ring ─────────────────────────────────── */
    const ScoreRing = ({ size = 96, sw = 8 }: { size?: number; sw?: number }) => {
      const r = (size - sw) / 2, circ = 2 * Math.PI * r, prog = (header.overallScore / 100) * circ;
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tokens.colors.neutral[100]} strokeWidth={sw} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={lvlColors.ring} strokeWidth={sw}
            strokeDasharray={`${prog} ${circ - prog}`} strokeDashoffset={circ / 4} strokeLinecap="round"
            style={{ transition: `stroke-dasharray ${tokens.motion.hover}` }} />
          <text x={size / 2} y={size / 2 - 6} textAnchor="middle" dominantBaseline="middle"
            fill={tokens.colors.neutral[900]} fontSize={tokens.typography.fontSize['2xl'] || '1.5rem'} fontWeight={tokens.typography.fontWeight.bold}>{header.overallScore}</text>
          <text x={size / 2} y={size / 2 + 14} textAnchor="middle" dominantBaseline="middle"
            fill={tokens.colors.neutral[500]} fontSize={tokens.typography.fontSize.xs}>/ 100</text>
        </svg>
      );
    };

    /* ── Badge Pill ─────────────────────────────────── */
    const Pill = ({ bg, clr, border: brd, icon, label }: {
      bg: string; clr: string; border?: string; icon: React.ReactNode; label: string;
    }) => (
      <Flex align="center" gap={4} style={{
        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSize.xs,
        fontWeight: tokens.typography.fontWeight.semibold,
        backgroundColor: bg, color: clr,
        ...(brd ? { border: `${bdr} ${brd}` } : {}),
      }}>
        {icon}
        <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{label}</Text>
      </Flex>
    );

    /* ── Radar Chart ───────────────────────────────── */
    const RadarChart = () => {
      const sz = 280, cx = sz / 2, cy = sz / 2, maxR = sz / 2 - 40;
      const n = dimensions.length;
      if (n < 3) return null;
      const step = (2 * Math.PI) / n;

      const polygon = (radius: number) =>
        dimensions.map((_, i) => {
          const a = i * step - Math.PI / 2;
          return `${cx + radius * Math.cos(a)},${cy + radius * Math.sin(a)}`;
        }).join(' ');

      const dataPolygon = dimensions.map((d, i) => {
        const a = i * step - Math.PI / 2;
        const r = (d.score / 100) * maxR;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(' ');

      return (
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          {[0.25, 0.5, 0.75, 1].map(p => (
            <polygon key={p} points={polygon(maxR * p)}
              fill="none" stroke={tokens.colors.neutral[200]} strokeWidth={1} />
          ))}
          {dimensions.map((_, i) => {
            const a = i * step - Math.PI / 2;
            return <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)}
              stroke={tokens.colors.neutral[200]} strokeWidth={1} />;
          })}
          <polygon points={dataPolygon}
            fill={tokens.colors.primaryScale[500] + '20'}
            stroke={tokens.colors.primaryScale[500]} strokeWidth={2} />
          {dimensions.map((d, i) => {
            const a = i * step - Math.PI / 2;
            const r = (d.score / 100) * maxR;
            const lx = cx + (maxR + 20) * Math.cos(a);
            const ly = cy + (maxR + 20) * Math.sin(a);
            return (
              <g key={d.id}>
                <circle cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)}
                  r={4} fill={tokens.colors.common.white} stroke={getScoreGradientColor(d.score, tokens)} strokeWidth={2} />
                <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                  fill={tokens.colors.neutral[600]} fontSize={tokens.typography.fontSize.xs}>
                  {d.name.length > 12 ? d.name.slice(0, 10) + '..' : d.name}
                </text>
              </g>
            );
          })}
        </svg>
      );
    };

    /* ── View Tabs ─────────────────────────────────── */
    const viewTabs: { key: ScorecardView; label: string; icon: React.ReactNode }[] = [
      { key: 'table', label: 'Table', icon: <Table size={14} /> },
      { key: 'radar', label: 'Radar', icon: <Hexagon size={14} /> },
      { key: 'detail', label: 'Detail', icon: <Eye size={14} /> },
    ];

    const sortOpts: { key: ScorecardSortBy; label: string }[] = [
      { key: 'name', label: 'Name' }, { key: 'score', label: 'Score' },
      { key: 'weight', label: 'Weight' }, { key: 'confidence', label: 'Confidence' },
      { key: 'evidence', label: 'Evidence' },
    ];

    /* ── Evidence renderer ─────────────────────────── */
    const renderEvidence = () => {
      if (evidence.length === 0) {
        return (
          <Flex align="center" justify="center" style={{
            padding: tokens.spacing[6], color: tokens.colors.neutral[400],
            fontSize: tokens.typography.fontSize.sm, fontStyle: 'italic' as const,
          }}>
            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>No evidence available for this dimension.</Text>
          </Flex>
        );
      }
      return (
        <Stack gap={12} style={{
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          marginLeft: tokens.spacing[6], marginBottom: tokens.spacing[3],
          borderLeft: `3px solid ${tokens.colors.primaryScale[200]}`,
        }}>
          {evidence.map((ev, idx) => (
            <Box key={idx}>
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderLeft: `4px solid ${tokens.colors.primaryScale[300]}`,
                borderRadius: `0 ${tokens.borderRadius.lg} ${tokens.borderRadius.lg} 0`,
                marginBottom: tokens.spacing[2],
              }}>
                <Flex align="start" gap={6}>
                  <Quote size={14} color={tokens.colors.neutral[300]} style={{ flexShrink: 0, marginTop: 3 }} />
                  <Text style={{
                    fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700],
                    fontStyle: 'italic' as const, lineHeight: 1.6,
                  }}>
                    {ev.quote}
                  </Text>
                </Flex>
                <Flex align="center" gap={8} style={{ marginTop: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.primaryScale[600] }}>
                    {ev.speaker}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                    Turn {ev.turnRef}
                  </Text>
                </Flex>
              </Box>
              <Flex align="start" gap={6} style={{
                padding: tokens.spacing[3], borderRadius: tokens.borderRadius.lg,
                backgroundColor: tokens.colors.primaryScale[50],
                border: `${bdr} ${tokens.colors.primaryScale[100]}`,
              }}>
                <Bot size={14} color={tokens.colors.primaryScale[500]} style={{ flexShrink: 0, marginTop: 2 }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], lineHeight: 1.6 }}>
                  {ev.aiReasoning}
                </Text>
              </Flex>
            </Box>
          ))}
        </Stack>
      );
    };

    /* ── Dimension Row ─────────────────────────────── */
    const DimRow = (dim: ScorecardDimension) => {
      const isSel = selectedDimension === dim.id;
      const sc = getScoreGradientColor(dim.score, tokens);
      const cc = getConfidenceColor(dim.confidence, tokens);
      return (
        <Box key={dim.id}>
          <Box
            onClick={() => handleDimSelect(dim.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              ...hov, padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: isSel ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              border: `${bdr} ${isSel ? tokens.colors.primaryScale[200] : tokens.colors.neutral[100]}`,
              marginBottom: tokens.spacing[2],
            }}>
            <Box style={{ flexShrink: 0, color: tokens.colors.neutral[400] }}>
              {isSel ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Box>
            <Text style={{
              flex: 1, minWidth: 0, fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[800],
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
            }}>
              {dim.name}
            </Text>
            <Flex align="center" gap={6} style={{ width: 130 }}>
              <Box style={{ flex: 1, height: 8, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                <Box style={{ width: `${dim.score}%`, height: '100%', backgroundColor: sc, borderRadius: tokens.borderRadius.full, transition: `width ${trans}` }} />
              </Box>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700], minWidth: 28, textAlign: 'right' as const }}>
                {dim.score}
              </Text>
            </Flex>
            <Box style={{ ...createBadgeStyle(tokens, 'secondary'), minWidth: 40, justifyContent: 'center' }}>
              {dim.weight}%
            </Box>
            <Flex align="center" gap={4}>
              <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: cc }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], minWidth: 32 }}>
                {Math.round(dim.confidence * 100)}%
              </Text>
            </Flex>
            {dim.isKnockout && (
              <Flex align="center" gap={3} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: dim.knockoutTriggered ? tokens.colors.errorScale[100] : tokens.colors.neutral[100],
                color: dim.knockoutTriggered ? tokens.colors.errorScale[700] : tokens.colors.neutral[500],
              }}>
                <AlertOctagon size={10} />
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>KO</Text>
              </Flex>
            )}
            <Flex align="center" gap={3} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500], backgroundColor: tokens.colors.neutral[50],
            }}>
              <MessageSquare size={10} />
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{dim.evidenceCount}</Text>
            </Flex>
          </Box>
          {isSel && renderEvidence()}
        </Box>
      );
    };

    /* ── Confidence Factors ─────────────────────────── */
    const confFactors = [
      { label: 'Evidence Quality', value: Math.round(header.confidence * 100), icon: <MessageSquare size={16} />, color: tokens.colors.primaryScale[500], desc: 'Based on the quality and specificity of interview evidence' },
      { label: 'Response Completeness', value: Math.min(100, Math.round(header.confidence * 100 + 5)), icon: <FileText size={16} />, color: tokens.colors.infoScale[500], desc: 'Coverage of all scoring dimensions with sufficient data' },
      { label: 'Consistency', value: Math.max(0, Math.round(header.confidence * 100 - 3)), icon: <Activity size={16} />, color: tokens.colors.successScale[500], desc: 'Cross-dimension and cross-evidence consistency score' },
    ];

    /* ── Action Button ─────────────────────────────── */
    const ActBtn = ({ onClick, icon, label, bg, clr, borderClr }: {
      onClick?: () => void; icon: React.ReactNode; label: string;
      bg: string; clr: string; borderClr?: string;
    }) => (
      <Box onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        ...hov, padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
        borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm,
        fontWeight: tokens.typography.fontWeight.semibold, color: clr, backgroundColor: bg,
        ...(borderClr ? { border: `${bdr} ${borderClr}` } : {}),
        ...(!borderClr ? { boxShadow: tokens.shadows.sm } : {}),
      }}>
        {icon}
        <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{label}</Text>
      </Box>
    );

    return (
      <Box className={className} style={{
        ...surfStyle, backgroundColor: tokens.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* ── Header ───────────────────────────────────── */}
        <Flex align="center" justify="between" wrap="wrap" gap={20} style={{
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `${bdr} ${tokens.colors.neutral[200]}`,
        }}>
          <Flex align="center" gap={16} style={{ flex: 1, minWidth: 0 }}>
            <Box style={{
              width: 56, height: 56, borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
              border: `${bdr} ${tokens.colors.primaryScale[200]}`,
            }}>
              {header.candidateAvatar
                ? <img src={header.candidateAvatar} alt={header.candidateName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={24} color={tokens.colors.primaryScale[600]} />}
            </Box>
            <Stack gap={4}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xl || '1.25rem',
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                {header.candidateName}
              </Text>
              <Flex gap={12} align="center" wrap="wrap">
                <Flex align="center" gap={4} style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                  <Briefcase size={14} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{header.jobTitle}</Text>
                </Flex>
                <Flex align="center" gap={4} style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                  <Target size={14} color={tokens.colors.neutral[400]} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{header.stageName}</Text>
                </Flex>
              </Flex>
            </Stack>
          </Flex>
          <Flex align="center" gap={16}>
            <ScoreRing />
            <Stack gap={6}>
              <Pill bg={lvlColors.bg} clr={lvlColors.color} border={lvlColors.border}
                icon={<Star size={12} />} label={header.overallLevel.charAt(0).toUpperCase() + header.overallLevel.slice(1)} />
              <Pill bg={pfColors.bg} clr={pfColors.color} border={pfColors.border}
                icon={header.passFail === 'pass' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                label={header.passFail.toUpperCase()} />
              <Flex align="center" gap={6}>
                <Box style={{ width: 80, height: 6, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                  <Box style={{ width: `${header.confidence * 100}%`, height: '100%', backgroundColor: getConfidenceColor(header.confidence, tokens), borderRadius: tokens.borderRadius.full, transition: `width ${trans}` }} />
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {Math.round(header.confidence * 100)}%
                </Text>
              </Flex>
            </Stack>
          </Flex>
        </Flex>

        {/* ── Body ─────────────────────────────────────── */}
        <Box style={{ padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px` }}>
          {/* View Tabs */}
          <Flex gap={4} style={{
            padding: tokens.spacing[1], backgroundColor: tokens.colors.neutral[100],
            borderRadius: tokens.borderRadius.lg, marginBottom: tokens.spacing[4],
          }}>
            {viewTabs.map(v => (
              <Box key={v.key}
                onClick={() => setIntActiveView(v.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  ...hov, padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: activeView === v.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                  color: activeView === v.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[600],
                  backgroundColor: activeView === v.key ? tokens.colors.common.white : 'transparent',
                  boxShadow: activeView === v.key ? tokens.shadows.sm : 'none',
                }}>
                {v.icon}
                <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{v.label}</Text>
              </Box>
            ))}
          </Flex>

          {/* Knockouts */}
          {knockouts.length > 0 && (
            <Box style={{
              padding: tokens.spacing[4], backgroundColor: tokens.colors.errorScale[50],
              border: `${bdr} ${tokens.colors.errorScale[200]}`,
              borderRadius: tokens.borderRadius.lg, marginBottom: tokens.spacing[4],
            }}>
              <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
                <AlertTriangle size={18} color={tokens.colors.errorScale[600]} />
                <Text style={{ fontSize: tokens.typography.fontSize.md || '1rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.errorScale[800] }}>
                  Knockout Criteria Triggered
                </Text>
              </Flex>
              <Stack gap={6}>
                {knockouts.map(dim => (
                  <Flex key={dim.id} align="center" justify="between" style={{
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    backgroundColor: tokens.colors.common.white,
                    borderRadius: tokens.borderRadius.lg,
                    border: `${bdr} ${tokens.colors.errorScale[200]}`,
                  }}>
                    <Flex align="center" gap={6}>
                      <AlertOctagon size={16} color={tokens.colors.errorScale[500]} />
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.errorScale[800] }}>
                        {dim.name}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={8}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        Score: {dim.score} / Weight: {dim.weight}%
                      </Text>
                      <Box style={{ ...createBadgeStyle(tokens, 'error') }}>Below Threshold</Box>
                    </Flex>
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}

          {/* Radar */}
          {(activeView === 'radar' || activeView === 'detail') && dimensions.length >= 3 && (
            <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
              <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
                <Hexagon size={16} color={tokens.colors.primaryScale[500]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                  Score Radar
                </Text>
              </Flex>
              <Flex justify="center">
                <RadarChart />
              </Flex>
            </Box>
          )}

          {/* Dimension Table */}
          {(activeView === 'table' || activeView === 'detail') && (
            <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
              <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[3] }}>
                <Flex align="center" gap={6}>
                  <BarChart3 size={16} color={tokens.colors.primaryScale[500]} />
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                    Dimension Breakdown
                  </Text>
                </Flex>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  {dimensions.length} dimensions
                </Text>
              </Flex>
              {/* Sort controls */}
              <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
                <ArrowUpDown size={14} color={tokens.colors.neutral[400]} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Sort by:</Text>
                {sortOpts.map(o => (
                  <Box key={o.key} onClick={() => handleSort(o.key)} style={{
                    ...hov, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: sortBy === o.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                    color: sortBy === o.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                    backgroundColor: sortBy === o.key ? tokens.colors.primaryScale[50] : 'transparent',
                  }}>
                    {o.label}
                  </Box>
                ))}
              </Flex>
              {sorted.map(dim => DimRow(dim))}
            </Box>
          )}

          {/* Confidence Factors */}
          <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
            <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
              <Shield size={16} color={tokens.colors.primaryScale[500]} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                Confidence Factors
              </Text>
            </Flex>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
              {confFactors.map(f => (
                <Box key={f.label} style={{
                  padding: tokens.spacing[3], backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.lg,
                  border: `${bdr} ${tokens.colors.neutral[100]}`,
                }}>
                  <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[2] }}>
                    <Flex align="center" gap={6} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                      <Box style={{ color: f.color }}>{f.icon}</Box>
                      <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>{f.label}</Text>
                    </Flex>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[800] }}>
                      {f.value}%
                    </Text>
                  </Flex>
                  <Box style={{ height: 4, backgroundColor: tokens.colors.neutral[200], borderRadius: tokens.borderRadius.full, overflow: 'hidden', marginBottom: tokens.spacing[2] }}>
                    <Box style={{ width: `${f.value}%`, height: '100%', backgroundColor: f.color, borderRadius: tokens.borderRadius.full, transition: `width ${trans}` }} />
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], lineHeight: 1.5 }}>
                    {f.desc}
                  </Text>
                </Box>
              ))}
            </div>
          </Box>

          {/* Override Info */}
          {overrideInfo && (
            <Box style={{
              ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4],
              border: `${bdr} ${tokens.colors.warningScale[200]}`,
            }}>
              <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
                <Edit3 size={16} color={tokens.colors.warningScale[600]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[800] }}>
                  Score Override Applied
                </Text>
              </Flex>
              <Flex gap={16} align="center" style={{ marginBottom: tokens.spacing[3] }}>
                <Stack gap={2} style={{
                  padding: tokens.spacing[3], backgroundColor: tokens.colors.errorScale[50],
                  borderRadius: tokens.borderRadius.lg, border: `${bdr} ${tokens.colors.errorScale[200]}`,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Original</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg || '1.125rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.errorScale[600], textDecoration: 'line-through' as const }}>
                    {overrideInfo.originalScore}
                  </Text>
                </Stack>
                <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.lg || '1.125rem' }}>{'\u2192'}</Text>
                <Stack gap={2} style={{
                  padding: tokens.spacing[3], backgroundColor: tokens.colors.successScale[50],
                  borderRadius: tokens.borderRadius.lg, border: `${bdr} ${tokens.colors.successScale[200]}`,
                }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Override</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg || '1.125rem', fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[700] }}>
                    {overrideInfo.overrideScore}
                  </Text>
                </Stack>
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Overridden by</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                    {overrideInfo.reviewerName}
                  </Text>
                </Stack>
              </Flex>
              <Box style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.lg,
                borderLeft: `3px solid ${tokens.colors.warningScale[300]}`,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], lineHeight: 1.6 }}>
                  {overrideInfo.reasoning}
                </Text>
              </Box>
            </Box>
          )}

          {/* Override Form */}
          {showOverride && (
            <Box style={{
              ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4],
              border: `${bdr} ${tokens.colors.warningScale[200]}`,
              backgroundColor: tokens.colors.warningScale[50],
            }}>
              <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
                <Edit3 size={16} color={tokens.colors.warningScale[600]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[800] }}>
                  Override Score
                </Text>
              </Flex>
              <Box style={{ marginBottom: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>
                  Reason for override
                </Text>
                <textarea
                  value={overrideReason}
                  onChange={(e) => handleOverReason(e.target.value)}
                  placeholder="Provide a detailed reason for overriding this score..."
                  style={{
                    width: '100%', minHeight: 80, padding: tokens.spacing[3],
                    borderRadius: tokens.borderRadius.lg,
                    border: `${bdr} ${tokens.colors.neutral[300]}`,
                    fontSize: tokens.typography.fontSize.sm, fontFamily: 'inherit',
                    color: tokens.colors.neutral[700], backgroundColor: tokens.colors.common.white,
                    resize: 'vertical' as const, outline: 'none',
                  }}
                />
              </Box>
              <Flex gap={6} justify="end">
                <Box onClick={() => handleOverToggle(false)} style={{
                  ...hov, padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[600], backgroundColor: tokens.colors.neutral[100],
                  border: `${bdr} ${tokens.colors.neutral[200]}`,
                }}>
                  Cancel
                </Box>
                <Box onClick={() => { onOverride?.(header.overallScore, overrideReason); handleOverToggle(false); }}
                  style={{
                    ...hov, padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.common.white, backgroundColor: tokens.colors.warningScale[600],
                  }}>
                  Submit Override
                </Box>
              </Flex>
            </Box>
          )}

          {/* Cohort Comparison */}
          {cohortComparison && (
            <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
              <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
                <Users size={16} color={tokens.colors.primaryScale[500]} />
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                  Cohort Comparison
                </Text>
              </Flex>
              <Flex align="center" gap={16} style={{ marginBottom: tokens.spacing[3] }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize['3xl'] || '1.875rem',
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[600],
                }}>
                  P{cohortComparison.percentile}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                  out of {cohortComparison.totalInCohort} candidates
                </Text>
              </Flex>
              <Box style={{ position: 'relative' as const, height: 24, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                <Box style={{
                  position: 'absolute' as const, left: 0, top: 0, height: '100%',
                  width: `${cohortComparison.percentile}%`,
                  background: `linear-gradient(90deg, ${tokens.colors.primaryScale[200]}, ${tokens.colors.primaryScale[500]})`,
                  borderRadius: tokens.borderRadius.full, transition: `width ${trans}`,
                }} />
                <Box style={{
                  position: 'absolute' as const, left: `${cohortComparison.percentile}%`, top: -4,
                  transform: 'translateX(-50%)', width: 16, height: 32,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[600],
                  border: `3px solid ${tokens.colors.common.white}`,
                  boxShadow: tokens.shadows.md,
                }} />
              </Box>
              <Flex justify="between" style={{ marginTop: tokens.spacing[1] }}>
                {['0th', '50th', '100th'].map(l => (
                  <Text key={l} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{l}</Text>
                ))}
              </Flex>
            </Box>
          )}
        </Box>

        {/* ── Actions ──────────────────────────────────── */}
        <Flex align="center" gap={8} wrap="wrap" style={{
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
          borderTop: `${bdr} ${tokens.colors.neutral[200]}`,
        }}>
          {onApprove && <ActBtn onClick={onApprove} icon={<ThumbsUp size={14} />} label="Approve" bg={tokens.colors.successScale[600]} clr={tokens.colors.common.white} />}
          {onOverride && <ActBtn onClick={() => handleOverToggle(!showOverride)} icon={<Edit3 size={14} />} label="Override" bg={tokens.colors.warningScale[50]} clr={tokens.colors.warningScale[700]} borderClr={tokens.colors.warningScale[200]} />}
          {onRequestRescore && <ActBtn onClick={onRequestRescore} icon={<RotateCcw size={14} />} label="Re-score" bg={tokens.colors.infoScale[50]} clr={tokens.colors.infoScale[700]} borderClr={tokens.colors.infoScale[200]} />}
          {onSubmitAppeal && <ActBtn onClick={() => onSubmitAppeal(overrideReason)} icon={<AlertTriangle size={14} />} label="Appeal" bg={tokens.colors.warningScale[50]} clr={tokens.colors.warningScale[700]} borderClr={tokens.colors.warningScale[200]} />}
        </Flex>
      </Box>
    );
  },
});
