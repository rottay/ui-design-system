'use client';

/**
 * BhJobDetail - Full Preset
 * Complete job detail page with header, metrics, funnel, candidates, template,
 * activity timeline, analytics charts, and settings panel
 */

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type {
  BhJobDetailProps,
  JobDetailTab,
  FunnelStage,
  CandidatePreview,
  JobEvent,
  AnalyticsSource,
  TimeToStageEntry,
  ScoreDistributionBucket,
  JobSettings,
  MetricsTimeRange,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase,
  Building2,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
  Edit3,
  Pause,
  XCircle,
  Copy,
  Users,
  BarChart3,
  Settings,
  Eye,
  ChevronDown,
  ChevronRight,
  User,
  CheckCircle2,
  XOctagon,
  Timer,
  Zap,
  FileText,
  Bot,
  ClipboardList,
  Bell,
  Shield,
  Save,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: status badge color mapping                                 */
/* ------------------------------------------------------------------ */
function getStatusColors(status: string, tokens: DesignTokens) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    draft: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    open: { bg: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    paused: { bg: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    closed: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    filled: { bg: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] },
    new: { bg: tokens.colors.infoScale[100], color: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] },
    screening: { bg: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    interview: { bg: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] },
    offer: { bg: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    hired: { bg: tokens.colors.successScale[100], color: tokens.colors.successScale[800], border: tokens.colors.successScale[200] },
    rejected: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
    withdrawn: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], border: tokens.colors.neutral[200] },
  };
  return map[status] ?? { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
}

function getUrgencyColors(urgency: string, tokens: DesignTokens) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    low: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    medium: { bg: tokens.colors.infoScale[100], color: tokens.colors.infoScale[700], border: tokens.colors.infoScale[200] },
    high: { bg: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    critical: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
  };
  return map[urgency] ?? { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
}

function getEventIcon(type: string, tokens: DesignTokens) {
  const size = 14;
  const map: Record<string, { icon: React.ReactNode; color: string }> = {
    created: { icon: <FileText size={size} />, color: tokens.colors.primaryScale[500] },
    opened: { icon: <CheckCircle2 size={size} />, color: tokens.colors.successScale[500] },
    'candidate-added': { icon: <User size={size} />, color: tokens.colors.infoScale[500] },
    'stage-change': { icon: <ChevronRight size={size} />, color: tokens.colors.warningScale[500] },
    'interview-scheduled': { icon: <Timer size={size} />, color: tokens.colors.primaryScale[500] },
    'offer-sent': { icon: <Zap size={size} />, color: tokens.colors.successScale[500] },
    closed: { icon: <XOctagon size={size} />, color: tokens.colors.neutral[400] },
    note: { icon: <FileText size={size} />, color: tokens.colors.neutral[400] },
  };
  return map[type] ?? { icon: <FileText size={size} />, color: tokens.colors.neutral[400] };
}

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ------------------------------------------------------------------ */
/*  Full Preset                                                        */
/* ------------------------------------------------------------------ */
export const FullBhJobDetail = createPreset<BhJobDetailProps>(
  'BhJobDetail.Full',
  ({ primitives, props, tokens, engine }: PresetContext<BhJobDetailProps>) => {
    const { Box } = primitives;
    const isModern = engine === 'modern';

    const {
      jobInfo,
      metrics = [],
      funnelStages = [],
      candidates = [],
      templateInfo,
      events = [],
      analytics,
      settings,
      activeTab: activeTabProp,
      onTabChange,
      onEdit,
      onPause,
      onClose,
      onDuplicate,
      onCandidateClick,
      onSettingsSave,
      className,
      style,
    } = props;

    /* ---- internal state ---- */
    const [internalTab, setInternalTab] = useState<JobDetailTab>('overview');
    const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
    const [metricsTimeRange, setMetricsTimeRange] = useState<MetricsTimeRange>('30d');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      funnel: true,
      candidates: true,
      template: true,
      activity: true,
    });
    const [showSettings, setShowSettings] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(false);

    const activeTab = activeTabProp ?? internalTab;
    const handleTabChange = (tab: JobDetailTab) => {
      onTabChange?.(tab);
      setInternalTab(tab);
    };

    const toggleSection = (key: string) => {
      setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleCandidate = (id: string) => {
      setSelectedCandidates(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    /* ---- glass support ---- */
    const glassCard = isModern && tokens.glass
      ? {
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          backgroundColor: tokens.glass.bg,
          border: `1px solid ${tokens.glass.border}`,
        }
      : {};

    const surfaceStyle = createSurfaceStyle(tokens, { elevation: 'md', glass: isModern });
    const cardBase = createCardStyle(tokens, { elevation: 'sm', glass: isModern });
    const hoverStyle = createHoverStyle(tokens);
    const hoverTransform = getHoverTransform(tokens);

    /* ---- tabs config ---- */
    const tabs: { key: JobDetailTab; label: string; icon: React.ReactNode }[] = [
      { key: 'overview', label: 'Overview', icon: <Eye size={14} /> },
      { key: 'candidates', label: 'Candidates', icon: <Users size={14} /> },
      { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={14} /> },
      { key: 'settings', label: 'Settings', icon: <Settings size={14} /> },
    ];

    /* ================================================================ */
    /*  RENDER: Header                                                   */
    /* ================================================================ */
    const renderHeader = () => {
      const statusColors = getStatusColors(jobInfo.status, tokens);
      const urgencyColors = getUrgencyColors(jobInfo.urgency, tokens);

      return (
        <Box style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          gap: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexWrap: 'wrap' as const, marginBottom: tokens.spacing[2] }}>
              <Box style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {jobInfo.title}
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                backgroundColor: tokens.colors.neutral[100],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
              }}>
                {jobInfo.code}
              </Box>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
              {/* Status badge */}
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: statusColors.bg,
                color: statusColors.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColors.border}`,
                textTransform: 'capitalize' as const,
              }}>
                <Box style={{
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: statusColors.color,
                }} />
                {jobInfo.status}
              </Box>

              {/* Client */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.sm }}>
                <Building2 size={14} />
                <span>{jobInfo.clientName}</span>
              </Box>

              {/* Days open */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.sm }}>
                <Clock size={14} />
                <span>{jobInfo.daysOpen} days open</span>
              </Box>

              {/* Urgency */}
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: urgencyColors.bg,
                color: urgencyColors.color,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${urgencyColors.border}`,
                textTransform: 'capitalize' as const,
              }}>
                <AlertTriangle size={12} />
                {jobInfo.urgency}
              </Box>
            </Box>
          </Box>

          {/* Action dropdown */}
          <Box style={{ position: 'relative' as const, flexShrink: 0 }}>
            <button
              onClick={() => setShowActionMenu(!showActionMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: tokens.spacing[9],
                height: tokens.spacing[9],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.common.white,
                cursor: 'pointer',
                color: tokens.colors.neutral[600],
                ...hoverStyle,
              }}
            >
              <MoreVertical size={16} />
            </button>
            {showActionMenu && (
              <Box style={{
                position: 'absolute' as const,
                top: '100%',
                right: 0,
                marginTop: tokens.spacing[1],
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                minWidth: 180,
                padding: `${tokens.spacing[1]}px 0`,
                ...glassCard,
              }}>
                {[
                  { label: 'Edit Job', icon: <Edit3 size={14} />, action: onEdit },
                  { label: 'Pause Job', icon: <Pause size={14} />, action: onPause },
                  { label: 'Close Job', icon: <XCircle size={14} />, action: onClose },
                  { label: 'Duplicate', icon: <Copy size={14} />, action: onDuplicate },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action?.(); setShowActionMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      width: '100%',
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      fontFamily: 'inherit',
                      textAlign: 'left' as const,
                      ...hoverStyle,
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Tabs                                                     */
    /* ================================================================ */
    const renderTabs = () => (
      <Box style={{
        display: 'flex',
        gap: 0,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        padding: `0 ${tokens.spacing[6]}px`,
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                border: 'none',
                borderBottom: `2px solid ${isActive ? tokens.colors.primaryScale[500] : 'transparent'}`,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
                marginBottom: -1,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Metrics Bar                                              */
    /* ================================================================ */
    const renderMetrics = () => {
      if (metrics.length === 0) return null;
      return (
        <Box style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(metrics.length, 6)}, 1fr)`,
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
        }}>
          {metrics.slice(0, 6).map((metric, idx) => (
            <Box
              key={idx}
              style={{
                ...cardBase,
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                display: 'flex',
                flexDirection: 'column' as const,
                gap: tokens.spacing[1],
              }}
            >
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {metric.label}
                </Box>
                {metric.icon && (
                  <Box style={{ color: tokens.colors.neutral[400] }}>
                    {metric.icon}
                  </Box>
                )}
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                {metric.value}
              </Box>
              {metric.trendValue !== undefined && (
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: metric.trend === 'up'
                    ? tokens.colors.successScale[600]
                    : metric.trend === 'down'
                    ? tokens.colors.errorScale[600]
                    : tokens.colors.neutral[500],
                }}>
                  {metric.trend === 'up' && <TrendingUp size={12} />}
                  {metric.trend === 'down' && <TrendingDown size={12} />}
                  {metric.trend === 'flat' && <Minus size={12} />}
                  <span>{metric.trend === 'up' ? '+' : ''}{metric.trendValue}%</span>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Funnel Visualization                                     */
    /* ================================================================ */
    const renderFunnel = () => {
      if (funnelStages.length === 0) return null;
      const maxCount = Math.max(...funnelStages.map(s => s.count), 1);
      const svgWidth = 600;
      const svgHeight = 60 + funnelStages.length * 48;
      const stageHeight = 36;
      const stageGap = 12;
      const maxBarWidth = svgWidth - 200;

      return (
        <Box style={{ padding: `0 ${tokens.spacing[6]}px ${tokens.spacing[4]}px` }}>
          <Box
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}
            onClick={() => toggleSection('funnel')}
          >
            {expandedSections.funnel ? <ChevronDown size={16} color={tokens.colors.neutral[500]} /> : <ChevronRight size={16} color={tokens.colors.neutral[500]} />}
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Pipeline Funnel
            </Box>
          </Box>
          {expandedSections.funnel && (
            <Box style={{ ...cardBase, padding: tokens.spacing[4], overflow: 'auto' }}>
              <svg
                width="100%"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ display: 'block', maxWidth: svgWidth }}
              >
                {funnelStages.map((stage, idx) => {
                  const y = 10 + idx * (stageHeight + stageGap);
                  const barWidth = Math.max((stage.count / maxCount) * maxBarWidth, 4);
                  const topWidth = idx === 0 ? barWidth : Math.max((funnelStages[idx - 1].count / maxCount) * maxBarWidth, 4);
                  const x = 160;

                  return (
                    <g key={stage.name}>
                      {/* Trapezoid bar */}
                      <polygon
                        points={`
                          ${x},${y}
                          ${x + topWidth},${y}
                          ${x + barWidth},${y + stageHeight}
                          ${x},${y + stageHeight}
                        `}
                        fill={stage.color || tokens.colors.primaryScale[400]}
                        opacity={0.85}
                        rx={4}
                      />
                      {/* Stage label */}
                      <text
                        x={10}
                        y={y + stageHeight / 2 + 4}
                        fill={tokens.colors.neutral[700]}
                        fontSize={12}
                        fontWeight={tokens.typography.fontWeight.medium}
                      >
                        {stage.name}
                      </text>
                      {/* Count */}
                      <text
                        x={x + barWidth + 10}
                        y={y + stageHeight / 2 + 4}
                        fill={tokens.colors.neutral[600]}
                        fontSize={12}
                        fontWeight={tokens.typography.fontWeight.semibold}
                      >
                        {stage.count} ({stage.percentage}%)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Candidate Mini-Table                                     */
    /* ================================================================ */
    const renderCandidates = () => {
      if (candidates.length === 0) return null;
      const displayCandidates = activeTab === 'candidates' ? candidates : candidates.slice(0, 10);

      return (
        <Box style={{ padding: `0 ${tokens.spacing[6]}px ${tokens.spacing[4]}px` }}>
          <Box
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}
            onClick={() => toggleSection('candidates')}
          >
            {expandedSections.candidates ? <ChevronDown size={16} color={tokens.colors.neutral[500]} /> : <ChevronRight size={16} color={tokens.colors.neutral[500]} />}
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Top Candidates ({candidates.length})
            </Box>
          </Box>
          {expandedSections.candidates && (
            <Box style={{ ...cardBase, padding: 0, overflow: 'hidden' }}>
              {/* Table header */}
              <Box style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 120px 160px 100px',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                <Box />
                <Box>Candidate</Box>
                <Box>Stage</Box>
                <Box>Score</Box>
                <Box>Status</Box>
              </Box>
              {/* Rows */}
              {displayCandidates.map((candidate) => {
                const statusCol = getStatusColors(candidate.status, tokens);
                const isSelected = selectedCandidates.has(candidate.id);
                return (
                  <Box
                    key={candidate.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 120px 160px 100px',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                      alignItems: 'center',
                      borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onClick={() => onCandidateClick?.(candidate.id)}
                  >
                    {/* Checkbox */}
                    <Box
                      style={{ cursor: 'pointer' }}
                      onClick={(e: React.MouseEvent) => { e.stopPropagation(); toggleCandidate(candidate.id); }}
                    >
                      <Box style={{
                        width: 16,
                        height: 16,
                        borderRadius: tokens.borderRadius.sm,
                        border: `2px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 10 10">
                            <path d="M2 5l2 2 4-4" stroke={tokens.colors.common.white} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </Box>
                    </Box>
                    {/* Name + avatar */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      {candidate.avatar ? (
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: tokens.borderRadius.full,
                            objectFit: 'cover' as const,
                          }}
                        />
                      ) : (
                        <Box style={{
                          width: 28,
                          height: 28,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          color: tokens.colors.primaryScale[600],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                        }}>
                          {candidate.name.charAt(0).toUpperCase()}
                        </Box>
                      )}
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                      }}>
                        {candidate.name}
                      </Box>
                    </Box>
                    {/* Stage */}
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                    }}>
                      {candidate.stage}
                    </Box>
                    {/* Score bar */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{
                        flex: 1,
                        height: 6,
                        backgroundColor: tokens.colors.neutral[100],
                        borderRadius: tokens.borderRadius.full,
                        overflow: 'hidden',
                      }}>
                        <Box style={{
                          width: `${candidate.scorePercent}%`,
                          height: '100%',
                          backgroundColor: candidate.scorePercent >= 75
                            ? tokens.colors.successScale[500]
                            : candidate.scorePercent >= 50
                            ? tokens.colors.warningScale[500]
                            : tokens.colors.errorScale[500],
                          borderRadius: tokens.borderRadius.full,
                          transition: `width ${tokens.motion.hover}`,
                        }} />
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[600],
                        minWidth: 32,
                        textAlign: 'right' as const,
                      }}>
                        {candidate.scorePercent}%
                      </Box>
                    </Box>
                    {/* Status */}
                    <Box style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      backgroundColor: statusCol.bg,
                      color: statusCol.color,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCol.border}`,
                      textTransform: 'capitalize' as const,
                      width: 'fit-content',
                    }}>
                      {candidate.status}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Template Info                                            */
    /* ================================================================ */
    const renderTemplate = () => {
      if (!templateInfo) return null;
      return (
        <Box style={{ padding: `0 ${tokens.spacing[6]}px ${tokens.spacing[4]}px` }}>
          <Box
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}
            onClick={() => toggleSection('template')}
          >
            {expandedSections.template ? <ChevronDown size={16} color={tokens.colors.neutral[500]} /> : <ChevronRight size={16} color={tokens.colors.neutral[500]} />}
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Hiring Template
            </Box>
          </Box>
          {expandedSections.template && (
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
                marginBottom: tokens.spacing[3],
              }}>
                {templateInfo.name}
              </Box>
              {/* Stages */}
              <Box style={{ marginBottom: tokens.spacing[3] }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[2],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <ClipboardList size={12} />
                  Stages
                </Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
                  {templateInfo.stages.map((stage, idx) => (
                    <Box key={idx} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[700],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    }}>
                      <Box style={{
                        width: 16,
                        height: 16,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        color: tokens.colors.primaryScale[600],
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}>
                        {idx + 1}
                      </Box>
                      {stage}
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Agents */}
              <Box style={{ marginBottom: tokens.spacing[3] }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[2],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <Bot size={12} />
                  AI Agents
                </Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
                  {templateInfo.agents.map((agent, idx) => (
                    <Box key={idx} style={{
                      ...createBadgeStyle(tokens, 'info'),
                    }}>
                      <Bot size={10} />
                      {agent}
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Rubrics */}
              <Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[2],
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <FileText size={12} />
                  Rubrics
                </Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
                  {templateInfo.rubrics.map((rubric, idx) => (
                    <Box key={idx} style={{
                      ...createBadgeStyle(tokens, 'secondary'),
                    }}>
                      {rubric}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Activity Timeline                                        */
    /* ================================================================ */
    const renderActivity = () => {
      if (events.length === 0) return null;
      return (
        <Box style={{ padding: `0 ${tokens.spacing[6]}px ${tokens.spacing[4]}px` }}>
          <Box
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}
            onClick={() => toggleSection('activity')}
          >
            {expandedSections.activity ? <ChevronDown size={16} color={tokens.colors.neutral[500]} /> : <ChevronRight size={16} color={tokens.colors.neutral[500]} />}
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Recent Activity
            </Box>
          </Box>
          {expandedSections.activity && (
            <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
              {events.slice(0, 15).map((event, idx) => {
                const eventMeta = getEventIcon(event.type, tokens);
                const isLast = idx === Math.min(events.length, 15) - 1;
                return (
                  <Box key={event.id} style={{
                    display: 'flex',
                    gap: tokens.spacing[3],
                    position: 'relative' as const,
                    paddingBottom: isLast ? 0 : tokens.spacing[3],
                  }}>
                    {/* Timeline line */}
                    {!isLast && (
                      <Box style={{
                        position: 'absolute' as const,
                        left: 11,
                        top: 24,
                        bottom: 0,
                        width: 2,
                        backgroundColor: tokens.colors.neutral[200],
                      }} />
                    )}
                    {/* Icon */}
                    <Box style={{
                      width: 24,
                      height: 24,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.neutral[100],
                      color: eventMeta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      {eventMeta.icon}
                    </Box>
                    {/* Content */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        lineHeight: tokens.typography.lineHeight.normal,
                      }}>
                        {event.message}
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        marginTop: tokens.spacing[1],
                      }}>
                        {formatTimeAgo(event.time)}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Analytics Tab                                            */
    /* ================================================================ */
    const renderAnalytics = () => {
      if (!analytics) return (
        <Box style={{
          padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
          textAlign: 'center' as const,
          color: tokens.colors.neutral[400],
          fontSize: tokens.typography.fontSize.sm,
        }}>
          No analytics data available.
        </Box>
      );

      const { sources, timeToStage, scoreDistribution } = analytics;

      /* Source breakdown horizontal bar chart */
      const maxSourceCount = Math.max(...sources.map(s => s.count), 1);
      const sourceBarMaxWidth = 300;

      /* Time-to-stage grouped bar chart */
      const maxDays = Math.max(...timeToStage.map(s => Math.max(s.avgDays, s.targetDays)), 1);
      const ttsBarMaxWidth = 240;

      /* Score distribution histogram */
      const maxBucketCount = Math.max(...scoreDistribution.map(b => b.count), 1);
      const histBarWidth = Math.min(60, 400 / Math.max(scoreDistribution.length, 1));
      const histHeight = 160;

      return (
        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[5] }}>
          {/* Time range selector */}
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {(['7d', '14d', '30d', '90d'] as MetricsTimeRange[]).map(range => (
              <button
                key={range}
                onClick={() => setMetricsTimeRange(range)}
                style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${metricsTimeRange === range ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: metricsTimeRange === range ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: metricsTimeRange === range ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                {range}
              </button>
            ))}
          </Box>

          {/* Source Breakdown */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[3],
            }}>
              Source Breakdown
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {sources.map((source, idx) => {
                const sourceColors = [
                  tokens.colors.primaryScale[500],
                  tokens.colors.infoScale[500],
                  tokens.colors.successScale[500],
                  tokens.colors.warningScale[500],
                  tokens.colors.secondaryScale[500],
                  tokens.colors.errorScale[400],
                ];
                const barColor = sourceColors[idx % sourceColors.length];
                return (
                  <Box key={source.name} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <Box style={{
                      width: 100,
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      fontWeight: tokens.typography.fontWeight.medium,
                      textAlign: 'right' as const,
                      flexShrink: 0,
                    }}>
                      {source.name}
                    </Box>
                    <Box style={{
                      flex: 1,
                      maxWidth: sourceBarMaxWidth,
                      height: 18,
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.sm,
                      overflow: 'hidden',
                      position: 'relative' as const,
                    }}>
                      <Box style={{
                        width: `${(source.count / maxSourceCount) * 100}%`,
                        height: '100%',
                        backgroundColor: barColor,
                        borderRadius: tokens.borderRadius.sm,
                        transition: `width ${tokens.motion.hover}`,
                      }} />
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      minWidth: 60,
                    }}>
                      {source.count} ({source.percentage}%)
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Time-to-Stage Chart */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[3],
            }}>
              Time to Stage (days)
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {timeToStage.map(entry => (
                <Box key={entry.stageName} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <Box style={{
                    width: 100,
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    fontWeight: tokens.typography.fontWeight.medium,
                    textAlign: 'right' as const,
                    flexShrink: 0,
                  }}>
                    {entry.stageName}
                  </Box>
                  <Box style={{ flex: 1, maxWidth: ttsBarMaxWidth, display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                    {/* Actual bar */}
                    <Box style={{
                      height: 10,
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.sm,
                      overflow: 'hidden',
                    }}>
                      <Box style={{
                        width: `${(entry.avgDays / maxDays) * 100}%`,
                        height: '100%',
                        backgroundColor: entry.avgDays > entry.targetDays ? tokens.colors.errorScale[400] : tokens.colors.primaryScale[400],
                        borderRadius: tokens.borderRadius.sm,
                      }} />
                    </Box>
                    {/* Target bar */}
                    <Box style={{
                      height: 6,
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.sm,
                      overflow: 'hidden',
                    }}>
                      <Box style={{
                        width: `${(entry.targetDays / maxDays) * 100}%`,
                        height: '100%',
                        backgroundColor: tokens.colors.neutral[300],
                        borderRadius: tokens.borderRadius.sm,
                      }} />
                    </Box>
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: entry.avgDays > entry.targetDays ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
                    minWidth: 60,
                  }}>
                    {entry.avgDays}d / {entry.targetDays}d
                  </Box>
                </Box>
              ))}
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[4], marginTop: tokens.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                <Box style={{ width: 12, height: 8, backgroundColor: tokens.colors.primaryScale[400], borderRadius: tokens.borderRadius.sm }} />
                Actual
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                <Box style={{ width: 12, height: 6, backgroundColor: tokens.colors.neutral[300], borderRadius: tokens.borderRadius.sm }} />
                Target
              </Box>
            </Box>
          </Box>

          {/* Score Distribution Histogram */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginBottom: tokens.spacing[3],
            }}>
              Score Distribution
            </Box>
            <svg
              width="100%"
              viewBox={`0 0 ${scoreDistribution.length * (histBarWidth + 8) + 40} ${histHeight + 40}`}
              style={{ display: 'block', maxWidth: 500 }}
            >
              {scoreDistribution.map((bucket, idx) => {
                const barHeight = (bucket.count / maxBucketCount) * histHeight;
                const x = 20 + idx * (histBarWidth + 8);
                const y = histHeight - barHeight + 10;
                return (
                  <g key={bucket.range}>
                    <rect
                      x={x}
                      y={y}
                      width={histBarWidth}
                      height={barHeight}
                      fill={tokens.colors.primaryScale[400]}
                      rx={3}
                      opacity={0.85}
                    />
                    <text
                      x={x + histBarWidth / 2}
                      y={y - 4}
                      textAnchor="middle"
                      fill={tokens.colors.neutral[600]}
                      fontSize={10}
                      fontWeight={tokens.typography.fontWeight.medium}
                    >
                      {bucket.count}
                    </text>
                    <text
                      x={x + histBarWidth / 2}
                      y={histHeight + 24}
                      textAnchor="middle"
                      fill={tokens.colors.neutral[500]}
                      fontSize={9}
                    >
                      {bucket.range}
                    </text>
                  </g>
                );
              })}
              {/* Baseline */}
              <line
                x1={16}
                y1={histHeight + 10}
                x2={scoreDistribution.length * (histBarWidth + 8) + 20}
                y2={histHeight + 10}
                stroke={tokens.colors.neutral[200]}
                strokeWidth={1}
              />
            </svg>
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Settings Panel                                           */
    /* ================================================================ */
    const renderSettings = () => {
      if (!settings) return (
        <Box style={{
          padding: `${tokens.spacing[8]}px ${tokens.spacing[6]}px`,
          textAlign: 'center' as const,
          color: tokens.colors.neutral[400],
          fontSize: tokens.typography.fontSize.sm,
        }}>
          No settings configured.
        </Box>
      );

      return (
        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          {/* Template Association */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <ClipboardList size={16} color={tokens.colors.primaryScale[500]} />
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
              }}>
                Template Association
              </Box>
            </Box>
            <Box style={{
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              Template ID: {settings.templateId}
            </Box>
          </Box>

          {/* Notifications */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <Bell size={16} color={tokens.colors.infoScale[500]} />
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
              }}>
                Notifications
              </Box>
            </Box>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                Email notifications
              </Box>
              <Box style={{
                width: 36,
                height: 20,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: settings.notifications ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                position: 'relative' as const,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}>
                <Box style={{
                  width: 16,
                  height: 16,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.common.white,
                  position: 'absolute' as const,
                  top: 2,
                  left: settings.notifications ? 18 : 2,
                  transition: `all ${tokens.motion.hover}`,
                  boxShadow: tokens.shadows.sm,
                }} />
              </Box>
            </Box>
          </Box>

          {/* SLA Config */}
          <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
              <Shield size={16} color={tokens.colors.warningScale[500]} />
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[700],
              }}>
                SLA Configuration
              </Box>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
              {[
                { label: 'Max Days Open', value: settings.slaConfig.maxDaysOpen },
                { label: 'Max Days Per Stage', value: settings.slaConfig.maxDaysPerStage },
              ].map(item => (
                <Box key={item.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    {item.label}
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[800],
                  }}>
                    {item.value} days
                  </Box>
                </Box>
              ))}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                  Notify on Breach
                </Box>
                <Box style={{
                  width: 36,
                  height: 20,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: settings.slaConfig.notifyOnBreach ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                  position: 'relative' as const,
                  transition: `all ${tokens.motion.hover}`,
                }}>
                  <Box style={{
                    width: 16,
                    height: 16,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.common.white,
                    position: 'absolute' as const,
                    top: 2,
                    left: settings.slaConfig.notifyOnBreach ? 18 : 2,
                    transition: `all ${tokens.motion.hover}`,
                    boxShadow: tokens.shadows.sm,
                  }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Save button */}
          {onSettingsSave && (
            <Box style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => onSettingsSave(settings)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  ...hoverStyle,
                }}
              >
                <Save size={14} />
                Save Settings
              </button>
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  MAIN RENDER                                                      */
    /* ================================================================ */
    return (
      <Box className={className} style={{
        display: 'flex',
        flexDirection: 'column' as const,
        backgroundColor: tokens.colors.common.white,
        borderRadius: tokens.borderRadius.lg,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        boxShadow: tokens.shadows.lg,
        width: '100%',
        overflow: 'hidden',
        ...glassCard,
        ...style,
      }}>
        {renderHeader()}
        {renderTabs()}

        {activeTab === 'overview' && (
          <>
            {renderMetrics()}
            {renderFunnel()}
            {renderCandidates()}
            {renderTemplate()}
            {renderActivity()}
          </>
        )}

        {activeTab === 'candidates' && renderCandidates()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </Box>
    );
  },
);
