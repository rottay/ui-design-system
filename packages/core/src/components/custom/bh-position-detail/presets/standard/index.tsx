'use client';

/**
 * BhPositionDetail - Standard Preset
 * Full position detail with header, requirements, linked jobs, team assignments,
 * financial tracker, SLA monitoring, and activity log.
 * Slite-inspired: generous whitespace, warm neutrals, soft shadows, minimal borders.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createHoverStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
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
  ExternalLink,
  Target,
  Percent,
  Banknote,
  Repeat,
  MapPin,
  Award,
  Tag,
  FileText,
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
export const StandardBhPositionDetail = createPreset<BhPositionDetailProps>({
  name: 'BhPositionDetail.Standard',
  render: ({ primitives, props, tokens }: PresetContext<BhPositionDetailProps>) => {
    const { Box, Flex, Stack, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

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

    const card = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hov = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

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
      <Flex align="start" justify="between" style={{
        padding: `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        gap: tokens.spacing[4],
        flexWrap: 'wrap' as const,
      }}>
        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
          <Text style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            {positionInfo.title}
          </Text>
          <Flex align="center" gap={8} style={{ flexWrap: 'wrap' as const }}>
            {/* Client */}
            <Flex align="center" gap={4} style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}>
              <Building2 size={14} />
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{positionInfo.clientName}</Text>
            </Flex>

            {/* Status badge */}
            <Flex align="center" gap={4} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: statusColors.bg,
              color: statusColors.color,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColors.border}`,
              textTransform: 'capitalize' as const,
            }}>
              <Box style={createStatusDotStyle(tokens, statusColors.color)} />
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{positionInfo.status}</Text>
            </Flex>

            {/* Deadline countdown */}
            <Flex align="center" gap={4} style={{
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
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>
                {isDeadlinePast
                  ? `${Math.abs(deadlineDays)}d overdue`
                  : `${deadlineDays}d remaining`}
              </Text>
            </Flex>

            {/* Fee structure badge */}
            <Flex align="center" gap={4} style={{
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
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{positionInfo.feeStructure}</Text>
            </Flex>
          </Flex>
        </Stack>

        {/* Edit button */}
        {onEdit && (
          <Box onClick={onEdit} style={{
            ...hov,
            display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            color: tokens.colors.neutral[700],
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}>
            Edit Position
          </Box>
        )}
      </Flex>
    );

    /* ================================================================ */
    /*  RENDER: Tabs                                                     */
    /* ================================================================ */
    const renderTabs = () => (
      <Flex gap={0} style={{
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        padding: `0 ${tokens.spacing[6]}px`,
      }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <Box key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: `2px solid ${isActive ? tokens.colors.primaryScale[500] : 'transparent'}`,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                marginBottom: -1,
                transition: `all ${tokens.motion.hover}`,
              }}>
              {tab.icon}
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{tab.label}</Text>
            </Box>
          );
        })}
      </Flex>
    );

    /* ================================================================ */
    /*  RENDER: Requirements Summary                                     */
    /* ================================================================ */
    const renderRequirements = () => {
      if (!requirements) return null;

      const fillPercent = requirements.headcount > 0
        ? Math.round((requirements.filled / requirements.headcount) * 100)
        : 0;

      const ringSize = 80;
      const strokeWidth = 8;
      const radius = (ringSize - strokeWidth) / 2;
      const circumference = 2 * Math.PI * radius;
      const dashOffset = circumference - (fillPercent / 100) * circumference;

      return (
        <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
          <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
            <Target size={14} color={tokens.colors.neutral[500]} />
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Requirements</Text>
          </Flex>

          <Flex gap={20} style={{ flexWrap: 'wrap' as const }}>
            {/* Left: text info */}
            <Stack gap={8} style={{ flex: 1, minWidth: 200 }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}>
                {requirements.description}
              </Text>

              {/* Skills tags */}
              <Stack gap={4}>
                <Flex align="center" gap={4} style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                }}>
                  <Tag size={12} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Skills</Text>
                </Flex>
                <Flex gap={4} style={{ flexWrap: 'wrap' as const }}>
                  {requirements.skills.map((skill, idx) => (
                    <Box key={idx} style={{
                      ...createBadgeStyle(tokens, 'primary'),
                      borderRadius: tokens.borderRadius.md,
                    }}>
                      {skill}
                    </Box>
                  ))}
                </Flex>
              </Stack>

              {/* Meta info row */}
              <Flex gap={16} style={{ flexWrap: 'wrap' as const }}>
                <Flex align="center" gap={4} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  <Award size={12} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: tokens.typography.fontWeight.medium }}>Seniority:</Text>
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{requirements.seniority}</Text>
                </Flex>
                <Flex align="center" gap={4} style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  <MapPin size={12} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit', fontWeight: tokens.typography.fontWeight.medium }}>Location:</Text>
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{requirements.location}</Text>
                </Flex>
              </Flex>
            </Stack>

            {/* Right: headcount progress ring */}
            <Stack gap={4} style={{ alignItems: 'center', flexShrink: 0 }}>
              <svg width={ringSize} height={ringSize}>
                <circle cx={ringSize / 2} cy={ringSize / 2} r={radius}
                  fill="none" stroke={tokens.colors.neutral[200]} strokeWidth={strokeWidth} />
                <circle cx={ringSize / 2} cy={ringSize / 2} r={radius}
                  fill="none"
                  stroke={fillPercent >= 100 ? tokens.colors.successScale[500] : tokens.colors.primaryScale[500]}
                  strokeWidth={strokeWidth} strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                  style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }} />
                <text x={ringSize / 2} y={ringSize / 2 - 4} textAnchor="middle"
                  fill={tokens.colors.neutral[800]} fontSize={16}
                  fontWeight={tokens.typography.fontWeight.bold}>
                  {requirements.filled}/{requirements.headcount}
                </text>
                <text x={ringSize / 2} y={ringSize / 2 + 12} textAnchor="middle"
                  fill={tokens.colors.neutral[500]} fontSize={10}>
                  filled
                </text>
              </svg>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                Headcount
              </Text>
            </Stack>
          </Flex>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Linked Jobs                                              */
    /* ================================================================ */
    const renderLinkedJobs = () => {
      if (linkedJobs.length === 0) return (
        <Flex align="center" justify="center" style={{
          ...card, padding: tokens.spacing[6],
          color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm,
        }}>
          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>No linked jobs.</Text>
        </Flex>
      );

      return (
        <Box style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: tokens.spacing[4] }}>
          <Flex align="center" justify="between" style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <Flex align="center" gap={6}>
              <Briefcase size={14} color={tokens.colors.neutral[500]} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Linked Jobs ({linkedJobs.length})</Text>
            </Flex>
          </Flex>

          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 100px 40px',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[500],
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
          }}>
            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Job Title</Text>
            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Candidates</Text>
            <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Status</Text>
            <Box />
          </div>

          {/* Rows */}
          {linkedJobs.map(job => {
            const jobStatusCol = getJobStatusColors(job.status, tokens);
            return (
              <div key={job.id}
                onClick={() => onJobClick?.(job.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 100px 40px',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  alignItems: 'center',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.neutral[50]; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[800],
                }}>
                  {job.title}
                </Text>
                <Flex align="center" gap={4} style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                }}>
                  <Users size={12} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>{job.candidateCount}</Text>
                </Flex>
                <Box style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: jobStatusCol.bg, color: jobStatusCol.color,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${jobStatusCol.border}`,
                  textTransform: 'capitalize' as const, width: 'fit-content',
                }}>
                  {job.status}
                </Box>
                <Box style={{ color: tokens.colors.neutral[400] }}>
                  <ExternalLink size={14} />
                </Box>
              </div>
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
        <Stack gap={8} style={{
          ...card, padding: tokens.spacing[6],
          alignItems: 'center',
          color: tokens.colors.neutral[400],
          fontSize: tokens.typography.fontSize.sm,
        }}>
          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>No teams assigned.</Text>
          {onTeamAssign && (
            <Box
              onClick={() => setShowAssignForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                ...hov,
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
              }}>
              <UserPlus size={12} />
              <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Assign Team</Text>
            </Box>
          )}
        </Stack>
      );

      const allocationColors = [
        tokens.colors.primaryScale[500],
        tokens.colors.infoScale[500],
        tokens.colors.successScale[500],
        tokens.colors.warningScale[500],
      ];

      return (
        <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
          <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[3] }}>
            <Flex align="center" gap={6}>
              <Users size={14} color={tokens.colors.neutral[500]} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>Team Assignments</Text>
            </Flex>
            {onTeamAssign && (
              <Box
                onClick={() => setShowAssignForm(!showAssignForm)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  ...hov,
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  color: tokens.colors.primaryScale[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                }}>
                <UserPlus size={12} />
                <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Add</Text>
              </Box>
            )}
          </Flex>

          <Stack gap={8}>
            {teamAssignments.map((team, idx) => {
              const barColor = allocationColors[idx % allocationColors.length];
              return (
                <Box key={team.teamName} style={{
                  padding: tokens.spacing[3],
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[2] }}>
                    <Stack gap={1}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                      }}>
                        {team.teamName}
                      </Text>
                      <Flex align="center" gap={4} style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}>
                        <User size={10} />
                        <Text style={{ fontSize: 'inherit', color: 'inherit' }}>Lead: {team.leadRecruiter}</Text>
                      </Flex>
                    </Stack>
                    <Flex align="center" gap={8}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: barColor,
                      }}>
                        {team.allocationPercent}%
                      </Text>
                      {onTeamRemove && (
                        <Box onClick={() => onTeamRemove(team.teamName)}
                          style={{
                            ...hov, width: 20, height: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: tokens.colors.neutral[400],
                            borderRadius: tokens.borderRadius.sm,
                          }}>
                          <XCircle size={14} />
                        </Box>
                      )}
                    </Flex>
                  </Flex>
                  {/* Allocation bar */}
                  <Box style={{
                    height: 8, backgroundColor: tokens.colors.neutral[200],
                    borderRadius: tokens.borderRadius.full, overflow: 'hidden',
                  }}>
                    <Box style={{
                      width: `${team.allocationPercent}%`, height: '100%',
                      backgroundColor: barColor, borderRadius: tokens.borderRadius.full,
                      transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                    }} />
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: Financial Tracker                                        */
    /* ================================================================ */
    const renderFinancials = () => {
      if (!financials) return (
        <Flex align="center" justify="center" style={{
          ...card, padding: tokens.spacing[6],
          color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm,
        }}>
          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>No financial data.</Text>
        </Flex>
      );

      const maxCost = Math.max(financials.projectedCost, financials.actualCost, 1);
      const projectedBarWidth = (financials.projectedCost / maxCost) * 100;
      const actualBarWidth = (financials.actualCost / maxCost) * 100;
      const isOverBudget = financials.actualCost > financials.projectedCost;

      return (
        <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
          <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[4] }}>
            <DollarSign size={14} color={tokens.colors.neutral[500]} />
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Financial Tracker</Text>
          </Flex>

          {/* Fee info */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[3], marginBottom: tokens.spacing[4],
          }}>
            {[
              {
                label: 'Fee Type', value: financials.feeType,
                icon: getFeeIcon(financials.feeType),
                color: tokens.colors.neutral[800], capitalize: true,
              },
              {
                label: 'Fee Amount',
                value: financials.feeType === 'percentage' ? `${financials.amount}%` : formatCurrency(financials.amount),
                color: tokens.colors.primaryScale[600],
              },
              {
                label: 'Variance',
                value: `${isOverBudget ? '+' : ''}${formatCurrency(financials.actualCost - financials.projectedCost)}`,
                color: isOverBudget ? tokens.colors.errorScale[600] : tokens.colors.successScale[600],
                bg: isOverBudget ? tokens.colors.errorScale[50] : tokens.colors.neutral[50],
                borderColor: isOverBudget ? tokens.colors.errorScale[200] : tokens.colors.neutral[200],
              },
            ].map(item => (
              <Stack key={item.label} gap={2} style={{
                padding: tokens.spacing[3],
                backgroundColor: (item as any).bg || tokens.colors.neutral[50],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${(item as any).borderColor || tokens.colors.neutral[200]}`,
                textAlign: 'center' as const,
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {item.label}
                </Text>
                <Text style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: item.color,
                  textTransform: (item as any).capitalize ? 'capitalize' as const : undefined,
                }}>
                  {item.value}
                </Text>
              </Stack>
            ))}
          </div>

          {/* Projected vs Actual comparison bar */}
          <Stack gap={8}>
            {[
              { label: 'Projected', width: projectedBarWidth, value: financials.projectedCost, color: tokens.colors.primaryScale[400] },
              { label: 'Actual', width: actualBarWidth, value: financials.actualCost, color: isOverBudget ? tokens.colors.errorScale[400] : tokens.colors.successScale[400] },
            ].map(bar => (
              <Flex key={bar.label} align="center" gap={8}>
                <Text style={{
                  width: 80, fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                  textAlign: 'right' as const,
                }}>
                  {bar.label}
                </Text>
                <Box style={{
                  flex: 1, height: 20, backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md, overflow: 'hidden',
                }}>
                  <Box style={{
                    width: `${bar.width}%`, height: '100%',
                    backgroundColor: bar.color, borderRadius: tokens.borderRadius.md,
                    display: 'flex', alignItems: 'center', paddingLeft: tokens.spacing[2],
                    fontSize: tokens.typography.fontSize.xs, color: tokens.colors.common.white,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                  }}>
                    {formatCurrency(bar.value)}
                  </Box>
                </Box>
              </Flex>
            ))}
          </Stack>
        </Box>
      );
    };

    /* ================================================================ */
    /*  RENDER: SLA Monitoring                                           */
    /* ================================================================ */
    const renderSlaMonitor = () => {
      if (!slaMonitor) return (
        <Flex align="center" justify="center" style={{
          ...card, padding: tokens.spacing[6],
          color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm,
        }}>
          <Text style={{ fontSize: 'inherit', color: 'inherit' }}>No SLA data available.</Text>
        </Flex>
      );

      const slaDeadlineDays = daysUntil(slaMonitor.deadline);
      const progressPercent = Math.min(Math.max(slaMonitor.progress, 0), 100);
      const progressColor = progressPercent >= 80
        ? tokens.colors.successScale[500]
        : progressPercent >= 50
        ? tokens.colors.warningScale[500]
        : tokens.colors.errorScale[500];

      return (
        <Box style={{ ...card, padding: tokens.spacing[5], marginBottom: tokens.spacing[4] }}>
          <Flex align="center" justify="between" style={{ marginBottom: tokens.spacing[4] }}>
            <Flex align="center" gap={6}>
              <Shield size={14} color={tokens.colors.neutral[500]} />
              <Text style={{ ...sectionHeader, marginBottom: 0 }}>SLA Monitoring</Text>
            </Flex>
            <Flex gap={4}>
              {(['current', 'all'] as const).map(period => (
                <Box key={period}
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
                    textTransform: 'capitalize' as const,
                    transition: `all ${tokens.motion.hover}`,
                  }}>
                  {period}
                </Box>
              ))}
            </Flex>
          </Flex>

          {/* Overall progress bar */}
          <Stack gap={4} style={{ marginBottom: tokens.spacing[4] }}>
            <Flex align="center" justify="between">
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                Overall Progress
              </Text>
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
                color: progressColor,
              }}>
                {progressPercent}%
              </Text>
            </Flex>
            <Box style={{
              height: 12, backgroundColor: tokens.colors.neutral[100],
              borderRadius: tokens.borderRadius.full, overflow: 'hidden',
            }}>
              <Box style={{
                width: `${progressPercent}%`, height: '100%',
                backgroundColor: progressColor, borderRadius: tokens.borderRadius.full,
                transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
              }} />
            </Box>
            <Flex align="center" justify="between">
              <Text style={{
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
              </Text>
              {slaMonitor.breaches > 0 && (
                <Flex align="center" gap={4} style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.errorScale[600],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  <AlertTriangle size={12} />
                  <Text style={{ fontSize: 'inherit', color: 'inherit' }}>
                    {slaMonitor.breaches} breach{slaMonitor.breaches > 1 ? 'es' : ''}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Stack>

          {/* Milestones */}
          {slaMonitor.milestones.length > 0 && (
            <Stack gap={4}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
              }}>
                Milestones
              </Text>
              <Stack gap={4}>
                {slaMonitor.milestones.map((milestone, idx) => {
                  const milestoneDays = daysUntil(milestone.deadline);
                  const isBreach = !milestone.completed && milestoneDays < 0;
                  const milestoneColor = isBreach
                    ? { bg: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200], icon: tokens.colors.errorScale[500] }
                    : milestone.completed
                    ? { bg: tokens.colors.successScale[50], border: tokens.colors.successScale[200], icon: tokens.colors.successScale[500] }
                    : { bg: tokens.colors.neutral[50], border: tokens.colors.neutral[200], icon: tokens.colors.neutral[400] };

                  return (
                    <Flex key={idx} align="center" gap={8} style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      backgroundColor: milestoneColor.bg,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${milestoneColor.border}`,
                    }}>
                      <Box style={{ color: milestoneColor.icon, flexShrink: 0 }}>
                        {milestone.completed
                          ? <CheckCircle2 size={16} />
                          : isBreach
                          ? <AlertTriangle size={16} />
                          : <Clock size={16} />}
                      </Box>
                      <Text style={{
                        flex: 1, fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[700],
                        textDecoration: milestone.completed ? 'line-through' : 'none',
                      }}>
                        {milestone.label}
                      </Text>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: isBreach ? tokens.colors.errorScale[600] : tokens.colors.neutral[500],
                        fontWeight: tokens.typography.fontWeight.medium,
                        flexShrink: 0,
                      }}>
                        {milestone.completed
                          ? 'Done'
                          : milestoneDays < 0
                          ? `${Math.abs(milestoneDays)}d overdue`
                          : `${milestoneDays}d left`}
                      </Text>
                    </Flex>
                  );
                })}
              </Stack>
            </Stack>
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
        <Box style={{ ...card, padding: tokens.spacing[5] }}>
          <Flex align="center" gap={6} style={{ marginBottom: tokens.spacing[3] }}>
            <Clock size={14} color={tokens.colors.neutral[500]} />
            <Text style={{ ...sectionHeader, marginBottom: 0 }}>Activity Log</Text>
          </Flex>
          <Stack gap={0}>
            {events.slice(0, 15).map((event, idx) => {
              const eventMeta = getEventIcon(event.type, tokens);
              const isLast = idx === Math.min(events.length, 15) - 1;
              return (
                <Flex key={event.id} gap={8} style={{
                  position: 'relative' as const,
                  paddingBottom: isLast ? 0 : tokens.spacing[3],
                }}>
                  {/* Timeline connector */}
                  {!isLast && (
                    <Box style={{
                      position: 'absolute' as const,
                      left: 11, top: 24, bottom: 0, width: 2,
                      backgroundColor: tokens.colors.neutral[200],
                    }} />
                  )}
                  {/* Icon */}
                  <Box style={{
                    width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.neutral[100],
                    color: eventMeta.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, zIndex: 1,
                  }}>
                    {eventMeta.icon}
                  </Box>
                  {/* Content */}
                  <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      lineHeight: tokens.typography.lineHeight.normal,
                    }}>
                      {event.message}
                    </Text>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[400],
                    }}>
                      {formatTimeAgo(event.time)}
                    </Text>
                  </Stack>
                </Flex>
              );
            })}
          </Stack>
        </Box>
      );
    };

    /* ================================================================ */
    /*  MAIN RENDER                                                      */
    /* ================================================================ */
    return (
      <Box className={className} style={{
        display: 'flex', flexDirection: 'column' as const,
        backgroundColor: tokens.colors.common.white,
        borderRadius: tokens.borderRadius.lg,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        boxShadow: tokens.shadows.lg,
        width: '100%', overflow: 'hidden',
        ...(isGlass && tokens.glass ? {
          backdropFilter: tokens.glass.blur,
          WebkitBackdropFilter: tokens.glass.blur,
          backgroundColor: tokens.glass.bg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
        } : {}),
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
});
