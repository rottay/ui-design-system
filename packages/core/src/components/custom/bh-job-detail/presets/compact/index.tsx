'use client';

/**
 * BhJobDetail - Compact Preset
 * Tabbed summary version with key job information, condensed layout
 */

import { useState } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
import type {
  BhJobDetailProps,
  JobDetailTab,
  CandidatePreview,
  JobEvent,
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
  Users,
  BarChart3,
  Settings,
  Eye,
  User,
  CheckCircle2,
  FileText,
  Timer,
  Zap,
  XOctagon,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
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
  const size = 12;
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
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhJobDetail = createPreset<BhJobDetailProps>(
  'BhJobDetail.Compact',
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
      activeTab: activeTabProp,
      onTabChange,
      onCandidateClick,
      className,
      style,
    } = props;

    /* ---- internal state ---- */
    const [internalTab, setInternalTab] = useState<'summary' | 'pipeline' | 'candidates' | 'activity'>('summary');
    const activeTab = (activeTabProp as string) === 'overview' ? 'summary' : ((activeTabProp as string) ?? internalTab) as typeof internalTab;

    const handleTabChange = (tab: typeof internalTab) => {
      onTabChange?.(tab as any);
      setInternalTab(tab);
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

    const cardBase = createCardStyle(tokens, { elevation: 'sm', glass: isModern });
    const hoverStyle = createHoverStyle(tokens);

    const statusColors = getStatusColors(jobInfo.status, tokens);
    const urgencyColors = getUrgencyColors(jobInfo.urgency, tokens);

    /* ---- tab config ---- */
    const compactTabs: { key: typeof internalTab; label: string }[] = [
      { key: 'summary', label: 'Summary' },
      { key: 'pipeline', label: 'Pipeline' },
      { key: 'candidates', label: 'Candidates' },
      { key: 'activity', label: 'Activity' },
    ];

    /* ================================================================ */
    /*  RENDER: Compact Header                                           */
    /* ================================================================ */
    const renderCompactHeader = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        gap: tokens.spacing[3],
        flexWrap: 'wrap' as const,
      }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1, minWidth: 0 }}>
          <Box style={{
            width: 32,
            height: 32,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: tokens.colors.primaryScale[100],
            color: tokens.colors.primaryScale[600],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Briefcase size={16} />
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              whiteSpace: 'nowrap' as const,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {jobInfo.title}
            </Box>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <span>{jobInfo.code}</span>
              <span>-</span>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Building2 size={10} />
                {jobInfo.clientName}
              </Box>
            </Box>
          </Box>
        </Box>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {/* Status */}
          <Box style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            backgroundColor: statusColors.bg,
            color: statusColors.color,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColors.border}`,
            textTransform: 'capitalize' as const,
          }}>
            <Box style={{
              width: 5,
              height: 5,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: statusColors.color,
            }} />
            {jobInfo.status}
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
            <AlertTriangle size={10} />
            {jobInfo.urgency}
          </Box>
          {/* Days open */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
          }}>
            <Clock size={10} />
            {jobInfo.daysOpen}d
          </Box>
        </Box>
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Compact Tabs                                             */
    /* ================================================================ */
    const renderCompactTabs = () => (
      <Box style={{
        display: 'flex',
        gap: 0,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        padding: `0 ${tokens.spacing[4]}px`,
      }}>
        {compactTabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                border: 'none',
                borderBottom: `2px solid ${isActive ? tokens.colors.primaryScale[500] : 'transparent'}`,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Summary Tab                                              */
    /* ================================================================ */
    const renderSummary = () => (
      <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
        {/* Condensed metrics row */}
        {metrics.length > 0 && (
          <Box style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(metrics.length, 4)}, 1fr)`,
            gap: tokens.spacing[2],
          }}>
            {metrics.slice(0, 4).map((metric, idx) => (
              <Box key={idx} style={{
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                backgroundColor: tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                textAlign: 'center' as const,
              }}>
                <Box style={{
                  fontSize: tokens.typography.fontSize.lg,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}>
                  {metric.value}
                </Box>
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}>
                  {metric.label}
                </Box>
                {metric.trendValue !== undefined && (
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    fontSize: tokens.typography.fontSize.xs,
                    color: metric.trend === 'up'
                      ? tokens.colors.successScale[600]
                      : metric.trend === 'down'
                      ? tokens.colors.errorScale[600]
                      : tokens.colors.neutral[500],
                    marginTop: tokens.spacing[1],
                  }}>
                    {metric.trend === 'up' && <TrendingUp size={10} />}
                    {metric.trend === 'down' && <TrendingDown size={10} />}
                    {metric.trend === 'flat' && <Minus size={10} />}
                    <span>{metric.trendValue}%</span>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Compact funnel - horizontal bar style */}
        {funnelStages.length > 0 && (
          <Box style={{ ...cardBase, padding: tokens.spacing[3] }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[2],
            }}>
              Pipeline
            </Box>
            <Box style={{ display: 'flex', height: 24, borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
              {funnelStages.map(stage => (
                <Box
                  key={stage.name}
                  title={`${stage.name}: ${stage.count} (${stage.percentage}%)`}
                  style={{
                    width: `${stage.percentage}%`,
                    minWidth: stage.percentage > 0 ? 2 : 0,
                    backgroundColor: stage.color || tokens.colors.primaryScale[400],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: tokens.colors.common.white,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    overflow: 'hidden',
                  }}
                >
                  {stage.percentage >= 10 ? stage.count : ''}
                </Box>
              ))}
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2], marginTop: tokens.spacing[2] }}>
              {funnelStages.map(stage => (
                <Box key={stage.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                }}>
                  <Box style={{
                    width: 8,
                    height: 8,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: stage.color || tokens.colors.primaryScale[400],
                  }} />
                  {stage.name}: {stage.count}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Template quick info */}
        {templateInfo && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              Template
            </Box>
            <Box style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.primaryScale[600],
            }}>
              {templateInfo.name} ({templateInfo.stages.length} stages)
            </Box>
          </Box>
        )}
      </Box>
    );

    /* ================================================================ */
    /*  RENDER: Pipeline Tab                                             */
    /* ================================================================ */
    const renderPipeline = () => {
      if (funnelStages.length === 0) return (
        <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
          No pipeline data.
        </Box>
      );
      const maxCount = Math.max(...funnelStages.map(s => s.count), 1);
      return (
        <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {funnelStages.map(stage => (
            <Box key={stage.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              <Box style={{
                width: 80,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[700],
                flexShrink: 0,
              }}>
                {stage.name}
              </Box>
              <Box style={{ flex: 1, height: 12, backgroundColor: tokens.colors.neutral[200], borderRadius: tokens.borderRadius.full, overflow: 'hidden' }}>
                <Box style={{
                  width: `${(stage.count / maxCount) * 100}%`,
                  height: '100%',
                  backgroundColor: stage.color || tokens.colors.primaryScale[400],
                  borderRadius: tokens.borderRadius.full,
                  transition: `width ${tokens.motion.hover}`,
                }} />
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[600],
                minWidth: 48,
                textAlign: 'right' as const,
              }}>
                {stage.count} ({stage.percentage}%)
              </Box>
            </Box>
          ))}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Candidates Tab                                           */
    /* ================================================================ */
    const renderCandidatesList = () => {
      if (candidates.length === 0) return (
        <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
          No candidates yet.
        </Box>
      );
      return (
        <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {candidates.slice(0, 10).map(candidate => {
            const statusCol = getStatusColors(candidate.status, tokens);
            return (
              <Box
                key={candidate.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  cursor: 'pointer',
                  ...hoverStyle,
                }}
                onClick={() => onCandidateClick?.(candidate.id)}
              >
                {/* Avatar */}
                {candidate.avatar ? (
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: tokens.borderRadius.full,
                      objectFit: 'cover' as const,
                    }}
                  />
                ) : (
                  <Box style={{
                    width: 24,
                    height: 24,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.primaryScale[100],
                    color: tokens.colors.primaryScale[600],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    flexShrink: 0,
                  }}>
                    {candidate.name.charAt(0).toUpperCase()}
                  </Box>
                )}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[800],
                  }}>
                    {candidate.name}
                  </Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {candidate.stage}
                  </Box>
                </Box>
                {/* Score */}
                <Box style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: candidate.scorePercent >= 75
                    ? tokens.colors.successScale[600]
                    : candidate.scorePercent >= 50
                    ? tokens.colors.warningScale[600]
                    : tokens.colors.errorScale[600],
                }}>
                  {candidate.scorePercent}%
                </Box>
                {/* Status badge */}
                <Box style={{
                  padding: `1px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: statusCol.bg,
                  color: statusCol.color,
                  textTransform: 'capitalize' as const,
                }}>
                  {candidate.status}
                </Box>
              </Box>
            );
          })}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Activity Tab                                             */
    /* ================================================================ */
    const renderActivityList = () => {
      if (events.length === 0) return (
        <Box style={{ padding: tokens.spacing[6], textAlign: 'center' as const, color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
          No recent activity.
        </Box>
      );
      return (
        <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {events.slice(0, 10).map(event => {
            const eventMeta = getEventIcon(event.type, tokens);
            return (
              <Box key={event.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}>
                <Box style={{
                  width: 20,
                  height: 20,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  color: eventMeta.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 1,
                }}>
                  {eventMeta.icon}
                </Box>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[700],
                    lineHeight: tokens.typography.lineHeight.normal,
                  }}>
                    {event.message}
                  </Box>
                  <Box style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    marginTop: 2,
                  }}>
                    {formatTimeAgo(event.time)}
                  </Box>
                </Box>
              </Box>
            );
          })}
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
        boxShadow: tokens.shadows.md,
        width: '100%',
        maxWidth: 480,
        overflow: 'hidden',
        ...glassCard,
        ...style,
      }}>
        {renderCompactHeader()}
        {renderCompactTabs()}

        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'pipeline' && renderPipeline()}
        {activeTab === 'candidates' && renderCandidatesList()}
        {activeTab === 'activity' && renderActivityList()}
      </Box>
    );
  },
);
