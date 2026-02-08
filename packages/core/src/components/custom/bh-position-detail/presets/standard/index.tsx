'use client';

/**
 * BhPositionDetail - Standard Preset
 * Full position detail with header, requirements, linked jobs, team assignments,
 * financial tracker, SLA monitoring, and activity log
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhPositionDetailProps,
  PositionTab,
  LinkedJob,
  TeamAssignment,
  SlaMilestone,
  PositionEvent,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Users,
  UserPlus,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Target,
  TrendingUp,
  Percent,
  Banknote,
  Repeat,
  MapPin,
  Award,
  Tag,
  FileText,
  Zap,
  Link,
  User,
  Eye,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helper: status badge color mapping                                 */
/* ------------------------------------------------------------------ */
function getPositionStatusColors(status: string, tokens: DesignTokens) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    draft: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    open: { bg: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    'in-progress': { bg: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] },
    'on-hold': { bg: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    filled: { bg: tokens.colors.successScale[100], color: tokens.colors.successScale[800], border: tokens.colors.successScale[200] },
    cancelled: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
  };
  return map[status] ?? { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
}

function getJobStatusColors(status: string, tokens: DesignTokens) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    draft: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    open: { bg: tokens.colors.successScale[100], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    paused: { bg: tokens.colors.warningScale[100], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    closed: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    filled: { bg: tokens.colors.primaryScale[100], color: tokens.colors.primaryScale[700], border: tokens.colors.primaryScale[200] },
  };
  return map[status] ?? { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] };
}

function getFeeIcon(feeType: string) {
  switch (feeType) {
    case 'percentage': return <Percent size={12} />;
    case 'fixed': return <Banknote size={12} />;
    case 'retainer': return <Repeat size={12} />;
    default: return <DollarSign size={12} />;
  }
}

function getEventIcon(type: string, tokens: DesignTokens) {
  const size = 14;
  const map: Record<string, { icon: React.ReactNode; color: string }> = {
    created: { icon: <FileText size={size} />, color: tokens.colors.primaryScale[500] },
    opened: { icon: <CheckCircle2 size={size} />, color: tokens.colors.successScale[500] },
    'job-linked': { icon: <Link size={size} />, color: tokens.colors.infoScale[500] },
    'team-assigned': { icon: <Users size={size} />, color: tokens.colors.primaryScale[500] },
    'milestone-reached': { icon: <Target size={size} />, color: tokens.colors.successScale[500] },
    'sla-breach': { icon: <AlertTriangle size={size} />, color: tokens.colors.errorScale[500] },
    filled: { icon: <CheckCircle2 size={size} />, color: tokens.colors.successScale[600] },
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

function daysUntil(date: Date): number {
  const now = Date.now();
  const diff = date.getTime() - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/* ------------------------------------------------------------------ */
/*  Standard Preset                                                    */
/* ------------------------------------------------------------------ */
export const StandardBhPositionDetail = createPreset<BhPositionDetailProps>(
  'BhPositionDetail.Standard',
  ({ primitives, props, tokens, engine }: PresetContext<BhPositionDetailProps>) => {
    const { Box } = primitives;
    const isModern = engine === 'modern';

    const {
      positionInfo,
      requirements,
      linkedJobs = [],
      teamAssignments = [],
      financials,
      slaMonitor,
      events = [],
      onTabChange,
      onJobClick,
      onEdit,
      onTeamAssign,
      onTeamRemove,
      className,
      style,
    } = props;

    /* ---- internal state ---- */
    const [activeTab, setActiveTab] = useState<PositionTab>('overview');
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [slaPeriod, setSlaPeriod] = useState<'current' | 'all'>('current');

    const handleTabChange = (tab: PositionTab) => {
      setActiveTab(tab);
      onTabChange?.(tab);
    };

    const toggleJobExpand = (id: string) => {
      setExpandedJobs(prev => {
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
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
        }
      : {};

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isModern }), [tokens, isModern]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);

    /* ---- derived values ---- */
    const statusColors = getPositionStatusColors(positionInfo.status, tokens);
    const deadlineDays = daysUntil(positionInfo.deadline);
    const isDeadlineUrgent = deadlineDays <= 7 && deadlineDays > 0;
    const isDeadlinePast = deadlineDays < 0;

    /* ---- tabs config ---- */
    const tabs: { key: PositionTab; label: string; icon: React.ReactNode }[] = [
      { key: 'overview', label: 'Overview', icon: <Eye size={14} /> },
      { key: 'jobs', label: 'Jobs', icon: <Briefcase size={14} /> },
      { key: 'team', label: 'Team', icon: <Users size={14} /> },
      { key: 'financials', label: 'Financials', icon: <DollarSign size={14} /> },
      { key: 'sla', label: 'SLA', icon: <Shield size={14} /> },
    ];

    /* ================================================================ */
    /*  RENDER: Header                                                   */
    /* ================================================================ */
    const renderHeader = () => (
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
          <Box style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            lineHeight: tokens.typography.lineHeight.tight,
            marginBottom: tokens.spacing[2],
          }}>
            {positionInfo.title}
          </Box>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            flexWrap: 'wrap' as const,
          }}>
            {/* Client */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}>
              <Building2 size={14} />
              {positionInfo.clientName}
            </Box>

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
              {positionInfo.status}
            </Box>

            {/* Deadline countdown */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: isDeadlinePast
                ? tokens.colors.errorScale[600]
                : isDeadlineUrgent
                ? tokens.colors.warningScale[600]
                : tokens.colors.neutral[500],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: isDeadlinePast
                ? tokens.colors.errorScale[50]
                : isDeadlineUrgent
                ? tokens.colors.warningScale[50]
                : tokens.colors.neutral[50],
            }}>
              <Calendar size={12} />
              {isDeadlinePast
                ? `${Math.abs(deadlineDays)}d overdue`
                : `${deadlineDays}d remaining`}
            </Box>

            {/* Fee structure badge */}
            <Box style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: tokens.colors.secondaryScale[100],
              color: tokens.colors.secondaryScale[700],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.secondaryScale[200]}`,
              textTransform: 'capitalize' as const,
            }}>
              {getFeeIcon(positionInfo.feeStructure)}
              {positionInfo.feeStructure}
            </Box>
          </Box>
        </Box>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              fontFamily: 'inherit',
              ...hoverStyle,
            }}
          >
            Edit Position
          </button>
        )}
      </Box>
    );

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
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[500] : 'transparent'}`,
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                fontFamily: 'inherit',
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
    /*  RENDER: Requirements Summary                                     */
    /* ================================================================ */
    const renderRequirements = () => {
      if (!requirements) return null;

      const fillPercent = requirements.headcount > 0
        ? Math.round((requirements.filled / requirements.headcount) * 100)
        : 0;

      /* Headcount progress ring SVG */
      const ringSize = 80;
      const strokeWidth = 8;
      const radius = (ringSize - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference - (fillPercent / 100) * circumference;

      return (
        <Box style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <Box style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            marginBottom: tokens.spacing[3],
          }}>
            Requirements
          </Box>

          <Box style={{ display: 'flex', gap: tokens.spacing[5], flexWrap: 'wrap' as const }}>
            {/* Left: text info */}
            <Box style={{ flex: 1, minWidth: 200 }}>
              {/* Description */}
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
                lineHeight: tokens.typography.lineHeight.relaxed,
                marginBottom: tokens.spacing[3],
              }}>
                {requirements.description}
              </Box>

              {/* Skills tags */}
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
                  <Tag size={12} />
                  Skills
                </Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                  {requirements.skills.map((skill, idx) => (
                    <Box key={idx} style={{
                      ...createBadgeStyle(tokens, 'primary'),
                      borderRadius: tokens.borderRadius.md,
                    }}>
                      {skill}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Meta info row */}
              <Box style={{ display: 'flex', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  <Award size={12} />
                  <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>Seniority:</span>
                  {requirements.seniority}
                </Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  <MapPin size={12} />
                  <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>Location:</span>
                  {requirements.location}
                </Box>
              </Box>
            </Box>

            {/* Right: headcount progress ring */}
            <Box style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              gap: tokens.spacing[2],
              flexShrink: 0,
            }}>
              <svg width={ringSize} height={ringSize}>
                {/* Background circle */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke={tokens.colors.neutral[200]}
                  strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={radius}
                  fill="none"
                  stroke={fillPercent >= 100 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500]}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
                />
                {/* Center text */}
                <text
                  x={ringSize / 2}
                  y={ringSize / 2 - 4}
                  textAnchor="middle"
                  fill={tokens.colors.neutral[800]}
                  fontSize={16}
                  fontWeight={tokens.typography.fontWeight.bold}
                >
                  {requirements.filled}/{requirements.headcount}
                </text>
                <text
                  x={ringSize / 2}
                  y={ringSize / 2 + 12}
                  textAnchor="middle"
                  fill={tokens.colors.neutral[500]}
                  fontSize={10}
                >
                  filled
                </text>
              </svg>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                Headcount
              </Box>
            </Box>
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Linked Jobs                                              */
    /* ================================================================ */
    const renderLinkedJobs = () => {
      if (linkedJobs.length === 0) return (
        <Box style={{
          padding: `${tokens.spacing[6]}px`,
          textAlign: 'center' as const,
          color: tokens.colors.neutral[400],
          fontSize: tokens.typography.fontSize.sm,
        }}>
          No linked jobs.
        </Box>
      );

      return (
        <Box style={{ ...cardBase, padding: 0, overflow: 'hidden', marginBottom: tokens.spacing[4] }}>
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Linked Jobs ({linkedJobs.length})
            </Box>
          </Box>
          {/* Table header */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: '1fr 120px 100px 40px',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          }}>
            <Box>Job Title</Box>
            <Box>Candidates</Box>
            <Box>Status</Box>
            <Box />
          </Box>
          {/* Rows */}
          {linkedJobs.map(job => {
            const jobStatusCol = getJobStatusColors(job.status, tokens);
            return (
              <Box
                key={job.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 100px 40px',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  alignItems: 'center',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onClick={() => onJobClick?.(job.id)}
              >
                <Box style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                }}>
                  {job.title}
                </Box>
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                }}>
                  <Users size={12} />
                  {job.candidateCount}
                </Box>
                <Box style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: jobStatusCol.bg,
                  color: jobStatusCol.color,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${jobStatusCol.border}`,
                  textTransform: 'capitalize' as const,
                  width: 'fit-content',
                }}>
                  {job.status}
                </Box>
                <Box style={{ color: tokens.colors.neutral[400] }}>
                  <ExternalLink size={14} />
                </Box>
              </Box>
            );
          })}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Team Assignments                                         */
    /* ================================================================ */
    const renderTeamAssignments = () => {
      if (teamAssignments.length === 0 && !showAssignForm) return (
        <Box style={{
          padding: `${tokens.spacing[6]}px`,
          textAlign: 'center' as const,
          color: tokens.colors.neutral[400],
          fontSize: tokens.typography.fontSize.sm,
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          gap: tokens.spacing[2],
        }}>
          No teams assigned.
          {onTeamAssign && (
            <button
              onClick={() => setShowAssignForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                fontFamily: 'inherit',
              }}
            >
              <UserPlus size={12} />
              Assign Team
            </button>
          )}
        </Box>
      );

      const maxAllocation = 100;

      return (
        <Box style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[3],
          }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              Team Assignments
            </Box>
            {onTeamAssign && (
              <button
                onClick={() => setShowAssignForm(!showAssignForm)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: tokens.colors.primaryScale[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontFamily: 'inherit',
                }}
              >
                <UserPlus size={12} />
                Add
              </button>
            )}
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            {teamAssignments.map((team, idx) => {
              const allocationColors = [
                tokens.colors.primaryScale[500],
                tokens.colors.infoScale[500],
                tokens.colors.successScale[500],
                tokens.colors.warningScale[500],
              ];
              const barColor = allocationColors[idx % allocationColors.length];

              return (
                <Box key={team.teamName} style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[2],
                  }}>
                    <Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                      }}>
                        {team.teamName}
                      </Box>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}>
                        <User size={10} />
                        Lead: {team.leadRecruiter}
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: barColor,
                      }}>
                        {team.allocationPercent}%
                      </Box>
                      {onTeamRemove && (
                        <button
                          onClick={() => onTeamRemove(team.teamName)}
                          style={{
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            color: tokens.colors.neutral[400],
                            borderRadius: tokens.borderRadius.sm,
                          }}
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </Box>
                  </Box>
                  {/* Horizontal allocation bar */}
                  <Box style={{
                    height: 8,
                    backgroundColor: tokens.colors.neutral[200],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                  }}>
                    <Box style={{
                      width: `${team.allocationPercent}%`,
                      height: '100%',
                      backgroundColor: barColor,
                      borderRadius: tokens.borderRadius.full,
                      transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                    }} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Financial Tracker                                        */
    /* ================================================================ */
    const renderFinancials = () => {
      if (!financials) return (
        <Box style={{
          padding: `${tokens.spacing[6]}px`,
          textAlign: 'center' as const,
          color: tokens.colors.neutral[400],
          fontSize: tokens.typography.fontSize.sm,
        }}>
          No financial data.
        </Box>
      );

      const maxCost = Math.max(financials.projectedCost, financials.actualCost, 1);
      const projectedBarWidth = (financials.projectedCost / maxCost) * 100;
      const actualBarWidth = (financials.actualCost / maxCost) * 100;
      const isOverBudget = financials.actualCost > financials.projectedCost;

      return (
        <Box style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <Box style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            marginBottom: tokens.spacing[4],
          }}>
            Financial Tracker
          </Box>

          {/* Fee info */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}>
            <Box style={{
              padding: `${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              textAlign: 'center' as const,
            }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                Fee Type
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[800],
                textTransform: 'capitalize' as const,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[1],
              }}>
                {getFeeIcon(financials.feeType)}
                {financials.feeType}
              </Box>
            </Box>
            <Box style={{
              padding: `${tokens.spacing[3]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              textAlign: 'center' as const,
            }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                Fee Amount
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[600],
              }}>
                {financials.feeType === 'percentage'
                  ? `${financials.amount}%`
                  : formatCurrency(financials.amount)}
              </Box>
            </Box>
            <Box style={{
              padding: `${tokens.spacing[3]}px`,
              backgroundColor: isOverBudget ? tokens.colors.errorScale[50] : tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isOverBudget ? tokens.colors.errorScale[200] : tokens.colors.neutral[200]}`,
              textAlign: 'center' as const,
            }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: isOverBudget ? tokens.colors.errorScale[600] : tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                Variance
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
                color: isOverBudget ? tokens.colors.errorScale[600] : tokens.colors.successScale[600],
              }}>
                {isOverBudget ? '+' : ''}{formatCurrency(financials.actualCost - financials.projectedCost)}
              </Box>
            </Box>
          </Box>

          {/* Projected vs Actual comparison bar */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
            {/* Projected */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Box style={{
                width: 80,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
                textAlign: 'right' as const,
              }}>
                Projected
              </Box>
              <Box style={{ flex: 1, height: 20, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
                <Box style={{
                  width: `${projectedBarWidth}%`,
                  height: '100%',
                  backgroundColor: tokens.colors.primaryScale[400],
                  borderRadius: tokens.borderRadius.md,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.common.white,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                }}>
                  {formatCurrency(financials.projectedCost)}
                </Box>
              </Box>
            </Box>
            {/* Actual */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <Box style={{
                width: 80,
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
                textAlign: 'right' as const,
              }}>
                Actual
              </Box>
              <Box style={{ flex: 1, height: 20, backgroundColor: tokens.colors.neutral[100], borderRadius: tokens.borderRadius.md, overflow: 'hidden' }}>
                <Box style={{
                  width: `${actualBarWidth}%`,
                  height: '100%',
                  backgroundColor: isOverBudget ? tokens.colors.errorScale[400] : tokens.colors.successScale[400],
                  borderRadius: tokens.borderRadius.md,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: tokens.spacing[2],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.common.white,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                }}>
                  {formatCurrency(financials.actualCost)}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: SLA Monitoring                                           */
    /* ================================================================ */
    const renderSlaMonitor = () => {
      if (!slaMonitor) return (
        <Box style={{
          padding: `${tokens.spacing[6]}px`,
          textAlign: 'center' as const,
          color: tokens.colors.neutral[400],
          fontSize: tokens.typography.fontSize.sm,
        }}>
          No SLA data available.
        </Box>
      );

      const slaDeadlineDays = daysUntil(slaMonitor.deadline);
      const progressPercent = Math.min(Math.max(slaMonitor.progress, 0), 100);

      return (
        <Box style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[4],
          }}>
            <Box style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              SLA Monitoring
            </Box>
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {(['current', 'all'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSlaPeriod(period)}
                  style={{
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${slaPeriod === period ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: slaPeriod === period ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: slaPeriod === period ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textTransform: 'capitalize' as const,
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {period}
                </button>
              ))}
            </Box>
          </Box>

          {/* Overall progress bar */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                Overall Progress
              </Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                color: progressPercent >= 80
                  ? tokens.colors.successScale[600]
                  : progressPercent >= 50
                  ? tokens.colors.warningScale[600]
                  : tokens.colors.errorScale[600],
              }}>
                {progressPercent}%
              </Box>
            </Box>
            <Box style={{
              height: 12,
              backgroundColor: tokens.colors.neutral[100],
              borderRadius: tokens.borderRadius.full,
              overflow: 'hidden',
            }}>
              <Box style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: progressPercent >= 80
                  ? tokens.colors.successScale[500]
                  : progressPercent >= 50
                  ? tokens.colors.warningScale[500]
                  : tokens.colors.errorScale[500],
                borderRadius: tokens.borderRadius.full,
                transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
              }} />
            </Box>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: tokens.spacing[1],
            }}>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: slaDeadlineDays < 0
                  ? tokens.colors.errorScale[600]
                  : slaDeadlineDays <= 7
                  ? tokens.colors.warningScale[600]
                  : tokens.colors.neutral[500],
              }}>
                {slaDeadlineDays < 0
                  ? `${Math.abs(slaDeadlineDays)}d overdue`
                  : `${slaDeadlineDays}d remaining`}
              </Box>
              {slaMonitor.breaches > 0 && (
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.errorScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  <AlertTriangle size={12} />
                  {slaMonitor.breaches} breach{slaMonitor.breaches > 1 ? 'es' : ''}
                </Box>
              )}
            </Box>
          </Box>

          {/* Milestones */}
          {slaMonitor.milestones.length > 0 && (
            <Box>
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[2],
              }}>
                Milestones
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                {slaMonitor.milestones.map((milestone, idx) => {
                  const milestoneDays = daysUntil(milestone.deadline);
                  const isBreach = !milestone.completed && milestoneDays < 0;

                  return (
                    <Box key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[3],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      backgroundColor: isBreach
                        ? tokens.colors.errorScale[50]
                        : milestone.completed
                        ? tokens.colors.successScale[50]
                        : tokens.colors.neutral[50],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                        isBreach
                          ? tokens.colors.errorScale[200]
                          : milestone.completed
                          ? tokens.colors.successScale[200]
                          : tokens.colors.neutral[200]
                      }`,
                    }}>
                      {/* Status icon */}
                      <Box style={{
                        color: isBreach
                          ? tokens.colors.errorScale[500]
                          : milestone.completed
                          ? tokens.colors.successScale[500]
                          : tokens.colors.neutral[400],
                        flexShrink: 0,
                      }}>
                        {milestone.completed
                          ? <CheckCircle2 size={16} />
                          : isBreach
                          ? <AlertTriangle size={16} />
                          : <Clock size={16} />}
                      </Box>
                      {/* Label */}
                      <Box style={{ flex: 1 }}>
                        <Box style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                          textDecoration: milestone.completed ? 'line-through' : 'none',
                        }}>
                          {milestone.label}
                        </Box>
                      </Box>
                      {/* Deadline */}
                      <Box style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: isBreach
                          ? tokens.colors.errorScale[600]
                          : tokens.colors.neutral[500],
                        fontWeight: tokens.typography.fontWeight.medium,
                        flexShrink: 0,
                      }}>
                        {milestone.completed
                          ? 'Done'
                          : milestoneDays < 0
                          ? `${Math.abs(milestoneDays)}d overdue`
                          : `${milestoneDays}d left`}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Activity Log                                             */
    /* ================================================================ */
    const renderActivityLog = () => {
      if (events.length === 0) return null;

      return (
        <Box style={{ ...cardBase, padding: tokens.spacing[4] }}>
          <Box style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            marginBottom: tokens.spacing[3],
          }}>
            Activity Log
          </Box>
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
                {/* Timeline connector */}
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

        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px ${tokens.spacing[6]}px` }}>
          {activeTab === 'overview' && (
            <>
              {renderRequirements()}
              {renderLinkedJobs()}
              {renderTeamAssignments()}
              {renderFinancials()}
              {renderSlaMonitor()}
              {renderActivityLog()}
            </>
          )}

          {activeTab === 'jobs' && renderLinkedJobs()}
          {activeTab === 'team' && renderTeamAssignments()}
          {activeTab === 'financials' && renderFinancials()}
          {activeTab === 'sla' && renderSlaMonitor()}
        </Box>
      </Box>
    );
  },
);
