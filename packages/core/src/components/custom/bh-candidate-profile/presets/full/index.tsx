'use client';

/**
 * BhCandidateProfile - Full Preset
 * Comprehensive candidate view with tabbed navigation covering profile,
 * applications, interviews, scores, notes, activity, and documents.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createHoverStyle,
  createPanelHeaderStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhCandidateProfileProps,
  CandidateTab,
  CandidateInfo,
  CandidateSkill,
  Experience,
  Education,
  CandidateApplication,
  CandidateInterview,
  ScoreCard,
  CandidateNote,
  CandidateEvent,
  CandidateStats,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  AlertTriangle,
  Calendar,
  Clock,
  Play,
  FileText,
  Edit3,
  Trash2,
  Plus,
  Download,
  Briefcase,
  GraduationCap,
  Globe,
  Link as LinkIcon,
  Star,
  User,
  Activity,
  MessageSquare,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const suffix = diffMs >= 0 ? ' ago' : ' from now';

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds}s${suffix}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m${suffix}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h${suffix}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d${suffix}`;
  const months = Math.floor(days / 30);
  return `${months}mo${suffix}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(date: Date): string {
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

/** Builds an SVG polygon points string for a radar chart */
function radarPoints(dimensions: { score: number }[], cx: number, cy: number, radius: number): string {
  const count = dimensions.length;
  if (count === 0) return '';
  return dimensions
    .map((d, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = (d.score / 100) * radius;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(' ');
}

/** Builds outer frame polygon points for radar chart */
function radarFramePoints(count: number, cx: number, cy: number, radius: number): string {
  if (count === 0) return '';
  return Array.from({ length: count })
    .map((_, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    })
    .join(' ');
}

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */
const TAB_CONFIG: { key: CandidateTab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'applications', label: 'Applications' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'scores', label: 'Scores' },
  { key: 'notes', label: 'Notes' },
  { key: 'activity', label: 'Activity' },
  { key: 'documents', label: 'Documents' },
];

/* ------------------------------------------------------------------ */
/*  Full Preset                                                        */
/* ------------------------------------------------------------------ */
export const FullBhCandidateProfile = createPreset<BhCandidateProfileProps>({
  name: 'BhCandidateProfile.Full',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhCandidateProfileProps>) => {
    const { Box, Text } = primitives;

    const {
      candidate,
      skills = [],
      experience = [],
      education = [],
      applications = [],
      interviews = [],
      scoreCards = [],
      notes = [],
      events = [],
      stats,
      compensationRange,
      languages = [],
      links = [],
      documents = [],
      defaultTab = 'profile',
      onTabChange,
      onApplicationClick,
      onInterviewClick,
      onNoteSave,
      onNoteDelete,
      onNoteAdd,
      onDocumentClick,
      onEventLinkClick,
      onReplayClick,
      onEditProfile,
      className,
      style,
    } = props;

    const [activeTab, setActiveTab] = useState<CandidateTab>(defaultTab);
    const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [expandedScorecard, setExpandedScorecard] = useState<string | null>(null);
    const [activityFilter, setActivityFilter] = useState<string>('all');

    const isGlass = engine === 'modern' && !!tokens.glass;
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);
    const hoverTransform = getHoverTransform(tokens);

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: 'sm',
      glass: isGlass,
    }), [tokens, isGlass]);

    const handleTabChange = (tab: CandidateTab) => {
      setActiveTab(tab);
      onTabChange?.(tab);
    };

    const handleAddNote = () => {
      if (noteText.trim()) {
        onNoteAdd?.(noteText.trim());
        setNoteText('');
        setShowNoteForm(false);
      }
    };

    const filteredEvents = useMemo(() => {
      if (activityFilter === 'all') return events;
      return events.filter((e) => e.type === activityFilter);
    }, [events, activityFilter]);

    const eventTypes = useMemo(() => {
      const types = new Set(events.map((e) => e.type));
      return ['all', ...Array.from(types)];
    }, [events]);

    const candidateName = candidate?.name ?? 'Unknown Candidate';
    const initials = candidateName
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    /* ------------------------------------------------------------------ */
    /*  Status badge color helper                                          */
    /* ------------------------------------------------------------------ */
    const statusBadgeColor = (status: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      const s = status.toLowerCase();
      if (s === 'active' || s === 'hired' || s === 'accepted') return 'success';
      if (s === 'rejected' || s === 'declined' || s === 'withdrawn') return 'error';
      if (s === 'pending' || s === 'review' || s === 'in review') return 'warning';
      if (s === 'offer' || s === 'offered') return 'info';
      return 'primary';
    };

    /* ------------------------------------------------------------------ */
    /*  Event type color                                                   */
    /* ------------------------------------------------------------------ */
    const eventDotColor = (type: string): string => {
      switch (type) {
        case 'applied': return tokens.colors.primaryScale[500];
        case 'interview': return tokens.colors.infoScale[500];
        case 'offer': return tokens.colors.successScale[500];
        case 'hired': return tokens.colors.successScale[700];
        case 'rejected': return tokens.colors.errorScale[500];
        case 'note': return tokens.colors.warningScale[500];
        case 'stage-change': return tokens.colors.secondaryScale[500];
        default: return tokens.colors.neutral[400];
      }
    };

    /* ================================================================== */
    /*  SECTION: Header                                                    */
    /* ================================================================== */
    const renderHeader = () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: tokens.spacing[5],
          padding: tokens.spacing[5],
          ...createSurfaceStyle(tokens, { elevation: 'md', glass: isGlass }),
          backgroundColor: isGlass ? tokens.glass?.bg : tokens.colors.common.white,
          marginBottom: tokens.spacing[4],
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.primaryScale[700],
          }}
        >
          {candidate?.avatar ? (
            <img src={candidate.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
          ) : (
            initials
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2], flexWrap: 'wrap' as const }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {candidateName}
            </Text>

            {candidate?.status && (
              <span style={createBadgeStyle(tokens, statusBadgeColor(candidate.status))}>
                {candidate.status}
              </span>
            )}

            {candidate?.doNotContact && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  backgroundColor: tokens.colors.errorScale[100],
                  color: tokens.colors.errorScale[700],
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                }}
              >
                <AlertTriangle size={12} />
                Do Not Contact
              </span>
            )}
          </div>

          {candidate?.currentRole && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.md,
                color: tokens.colors.neutral[600],
                display: 'block',
                marginBottom: tokens.spacing[2],
              }}
            >
              {candidate.currentRole}
            </Text>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], flexWrap: 'wrap' as const }}>
            {candidate?.location && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                <MapPin size={14} />
                {candidate.location}
              </span>
            )}
            {candidate?.email && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                <Mail size={14} />
                {candidate.email}
              </span>
            )}
            {candidate?.phone && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                <Phone size={14} />
                {candidate.phone}
              </span>
            )}
            {candidate?.source && (
              <span style={createBadgeStyle(tokens, 'secondary')}>
                Source: {candidate.source}
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        {onEditProfile && (
          <button
            onClick={onEditProfile}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              ...hoverStyle,
            }}
          >
            <Edit3 size={14} />
            Edit
          </button>
        )}
      </div>
    );

    /* ================================================================== */
    /*  SECTION: Stats Bar                                                 */
    /* ================================================================== */
    const renderStatsBar = () => {
      if (!stats) return null;

      const avgScoreRadius = 18;
      const avgScoreCircumference = 2 * Math.PI * avgScoreRadius;
      const avgScorePct = Math.min(stats.avgScore / 100, 1);
      const avgScoreDash = `${avgScorePct * avgScoreCircumference} ${avgScoreCircumference}`;

      const statItems = [
        { label: 'Active Applications', value: String(stats.activeApplications), icon: <Briefcase size={16} /> },
        { label: 'Total Interviews', value: String(stats.totalInterviews), icon: <Calendar size={16} /> },
        { label: 'Avg Score', value: null, icon: null, isChart: true },
        { label: 'Last Activity', value: formatRelativeTime(stats.lastActivityDate), icon: <Activity size={16} /> },
      ];

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {statItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                padding: tokens.spacing[4],
              }}
            >
              {item.isChart ? (
                <>
                  <svg width={44} height={44} viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
                    <circle
                      cx={22}
                      cy={22}
                      r={avgScoreRadius}
                      fill="none"
                      stroke={tokens.colors.neutral[100]}
                      strokeWidth={4}
                    />
                    <circle
                      cx={22}
                      cy={22}
                      r={avgScoreRadius}
                      fill="none"
                      stroke={
                        avgScorePct >= 0.7
                          ? tokens.colors.successScale[500]
                          : avgScorePct >= 0.4
                          ? tokens.colors.warningScale[500]
                          : tokens.colors.errorScale[500]
                      }
                      strokeWidth={4}
                      strokeDasharray={avgScoreDash}
                      strokeLinecap="round"
                      transform="rotate(-90 22 22)"
                    />
                    <text
                      x={22}
                      y={22}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{
                        fontSize: '11px',
                        fontWeight: tokens.typography.fontWeight.bold,
                        fill: tokens.colors.neutral[900],
                      }}
                    >
                      {stats.avgScore}%
                    </text>
                  </svg>
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        display: 'block',
                      }}
                    >
                      {item.label}
                    </Text>
                  </div>
                </>
              ) : (
                <>
                  {item.icon && (
                    <div
                      style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tokens.colors.primaryScale[600],
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                        display: 'block',
                      }}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {item.value}
                    </Text>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      );
    };

    /* ================================================================== */
    /*  SECTION: Tab Navigation                                            */
    /* ================================================================== */
    const renderTabs = () => (
      <div
        style={{
          display: 'flex',
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          marginBottom: tokens.spacing[5],
          gap: tokens.spacing[1],
          overflow: 'auto',
        }}
      >
        {TAB_CONFIG.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                borderBottom: isActive
                  ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[600]}`
                  : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} transparent`,
                marginBottom: -1,
                whiteSpace: 'nowrap' as const,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );

    /* ================================================================== */
    /*  TAB: Profile                                                       */
    /* ================================================================== */
    const renderProfileTab = () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[5] }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
          {/* Skills */}
          {skills.length > 0 && (
            <div style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[4],
                }}
              >
                Skills
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {skills.map((skill, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[700],
                        }}
                      >
                        {skill.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {skill.proficiency}%
                      </Text>
                    </div>
                    <svg width="100%" height={8} style={{ display: 'block' }}>
                      <rect
                        x={0}
                        y={0}
                        width="100%"
                        height={8}
                        rx={4}
                        fill={tokens.colors.neutral[100]}
                      />
                      <rect
                        x={0}
                        y={0}
                        width={`${skill.proficiency}%`}
                        height={8}
                        rx={4}
                        fill={
                          skill.proficiency >= 80
                            ? tokens.colors.successScale[500]
                            : skill.proficiency >= 50
                            ? tokens.colors.warningScale[500]
                            : tokens.colors.errorScale[500]
                        }
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[4],
                }}
              >
                Experience
              </Text>
              <div style={{ position: 'relative' as const, paddingLeft: tokens.spacing[6] }}>
                {/* Vertical timeline line */}
                <div
                  style={{
                    position: 'absolute' as const,
                    left: tokens.spacing[2],
                    top: tokens.spacing[1],
                    bottom: tokens.spacing[1],
                    width: 2,
                    backgroundColor: tokens.colors.neutral[200],
                  }}
                />
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative' as const,
                      marginBottom: idx < experience.length - 1 ? tokens.spacing[5] : 0,
                    }}
                  >
                    {/* Timeline dot */}
                    <div
                      style={{
                        position: 'absolute' as const,
                        left: -(tokens.spacing[6] as number) + (tokens.spacing[2] as number) - 4,
                        top: tokens.spacing[1],
                        width: 10,
                        height: 10,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: exp.current
                          ? tokens.colors.primaryScale[500]
                          : tokens.colors.neutral[300],
                        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {exp.role}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.primaryScale[600],
                        fontWeight: tokens.typography.fontWeight.medium,
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {exp.company}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        display: 'block',
                        marginBottom: tokens.spacing[1],
                      }}
                    >
                      {exp.startDate} &mdash; {exp.current ? 'Present' : exp.endDate}
                    </Text>
                    {exp.description && (
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          lineHeight: tokens.typography.lineHeight.relaxed,
                          display: 'block',
                        }}
                      >
                        {exp.description}
                      </Text>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
          {/* Education */}
          {education.length > 0 && (
            <div style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[4],
                }}
              >
                Education
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {education.map((edu, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: tokens.spacing[3],
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                    }}
                  >
                    <div
                      style={{
                        width: tokens.spacing[8],
                        height: tokens.spacing[8],
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.infoScale[50],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tokens.colors.infoScale[600],
                        flexShrink: 0,
                      }}
                    >
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          display: 'block',
                        }}
                      >
                        {edu.degree} in {edu.field}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          display: 'block',
                        }}
                      >
                        {edu.institution}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[400],
                          display: 'block',
                        }}
                      >
                        {edu.year}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compensation */}
          {compensationRange && (
            <div style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[3],
                }}
              >
                Compensation Expectation
              </Text>
              <div style={{ marginBottom: tokens.spacing[2] }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {compensationRange.currency ?? '$'}{compensationRange.min.toLocaleString()}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {compensationRange.currency ?? '$'}{compensationRange.max.toLocaleString()}
                  </Text>
                </div>
                <div
                  style={{
                    height: tokens.spacing[2],
                    backgroundColor: tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: '100%',
                      background: `linear-gradient(90deg, ${tokens.colors.primaryScale[300]}, ${tokens.colors.primaryScale[500]})`,
                      borderRadius: tokens.borderRadius.full,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[3],
                }}
              >
                Languages
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
                {languages.map((lang, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.neutral[100],
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    <Globe size={12} />
                    {lang.name}
                    <span
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      ({lang.level})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                  marginBottom: tokens.spacing[3],
                }}
              >
                Links &amp; Portfolio
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      textDecoration: 'none',
                      color: tokens.colors.primaryScale[600],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      ...hoverStyle,
                    }}
                  >
                    <LinkIcon size={14} />
                    {link.label}
                    <ExternalLink size={12} style={{ marginLeft: 'auto', color: tokens.colors.neutral[400] }} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );

    /* ================================================================== */
    /*  TAB: Applications                                                  */
    /* ================================================================== */
    const renderApplicationsTab = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
        {applications.length === 0 && (
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              textAlign: 'center' as const,
            }}
          >
            <Briefcase size={32} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              No applications found
            </Text>
          </div>
        )}
        {applications.map((app) => (
          <div
            key={app.id}
            onClick={() => {
              setSelectedApplication(app.id);
              onApplicationClick?.(app.id);
            }}
            style={{
              ...cardStyle,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              ...hoverStyle,
              ...(selectedApplication === app.id
                ? {
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`,
                    backgroundColor: tokens.colors.primaryScale[50],
                  }
                : {}),
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {app.jobName}
                </Text>
                <span style={createBadgeStyle(tokens, statusBadgeColor(app.status))}>
                  {app.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={createBadgeStyle(tokens, 'info')}>
                  {app.stage}
                </span>
                <ChevronRight size={16} style={{ color: tokens.colors.neutral[400] }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
              {/* Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Score:
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: app.scorePercent >= 70
                      ? tokens.colors.successScale[600]
                      : app.scorePercent >= 40
                      ? tokens.colors.warningScale[600]
                      : tokens.colors.errorScale[600],
                  }}
                >
                  {app.scorePercent}%
                </Text>
              </div>

              {/* Pipeline progress */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Pipeline:
                </Text>
                <div
                  style={{
                    flex: 1,
                    height: tokens.spacing[2],
                    backgroundColor: tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${app.pipelineProgress * 100}%`,
                      backgroundColor: tokens.colors.primaryScale[500],
                      borderRadius: tokens.borderRadius.full,
                      transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                    }}
                  />
                </div>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {Math.round(app.pipelineProgress * 100)}%
                </Text>
              </div>

              {/* Recruiter */}
              {app.recruiterName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
                  <div
                    style={{
                      width: tokens.spacing[6],
                      height: tokens.spacing[6],
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.secondaryScale[100],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.secondaryScale[700],
                    }}
                  >
                    {app.recruiterAvatar ? (
                      <img src={app.recruiterAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                    ) : (
                      app.recruiterName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                    {app.recruiterName}
                  </Text>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );

    /* ================================================================== */
    /*  TAB: Interviews                                                    */
    /* ================================================================== */
    const renderInterviewsTab = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
        {interviews.length === 0 && (
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              textAlign: 'center' as const,
            }}
          >
            <Calendar size={32} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              No interviews found
            </Text>
          </div>
        )}
        {interviews.map((interview) => {
          const statusColor =
            interview.status === 'completed' ? 'success'
            : interview.status === 'scheduled' ? 'info'
            : 'error';
          const typeColor = interview.type === 'ai' ? 'info' : 'secondary';

          return (
            <div
              key={interview.id}
              onClick={() => onInterviewClick?.(interview.id)}
              style={{
                ...cardStyle,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[4],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                ...hoverStyle,
              }}
            >
              {/* Date block */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: tokens.spacing[2],
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[50],
                  minWidth: 64,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {interview.date.toLocaleDateString([], { month: 'short' })}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}
                >
                  {interview.date.getDate()}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  {interview.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                  <span style={createBadgeStyle(tokens, typeColor as any)}>
                    {interview.type === 'ai' ? 'AI Interview' : 'Human Interview'}
                  </span>
                  <span style={createBadgeStyle(tokens, statusColor as any)}>
                    {interview.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  {interview.duration && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[500],
                      }}
                    >
                      <Clock size={12} />
                      {interview.duration}
                    </span>
                  )}
                  {interview.scorePercent !== undefined && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: interview.scorePercent >= 70
                          ? tokens.colors.successScale[600]
                          : interview.scorePercent >= 40
                          ? tokens.colors.warningScale[600]
                          : tokens.colors.errorScale[600],
                      }}
                    >
                      Score: {interview.scorePercent}%
                    </Text>
                  )}
                </div>
              </div>

              {/* Replay */}
              {interview.hasReplay && interview.status === 'completed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplayClick?.(interview.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    flexShrink: 0,
                    ...hoverStyle,
                  }}
                >
                  <Play size={12} />
                  Replay
                </button>
              )}
            </div>
          );
        })}
      </div>
    );

    /* ================================================================== */
    /*  TAB: Scores                                                        */
    /* ================================================================== */
    const renderScoresTab = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        {scoreCards.length === 0 && (
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              textAlign: 'center' as const,
            }}
          >
            <BarChart3 size={32} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              No score cards available
            </Text>
          </div>
        )}
        {scoreCards.map((sc) => {
          const isExpanded = expandedScorecard === sc.applicationId;
          const radarCx = 80;
          const radarCy = 80;
          const radarR = 60;

          return (
            <div
              key={sc.applicationId}
              style={cardStyle}
            >
              <div
                onClick={() => setExpandedScorecard(isExpanded ? null : sc.applicationId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  marginBottom: isExpanded ? tokens.spacing[4] : 0,
                }}
              >
                <div>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                    }}
                  >
                    {sc.jobName}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      display: 'block',
                    }}
                  >
                    {sc.date}
                  </Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: sc.overallScore >= 70
                        ? tokens.colors.successScale[600]
                        : sc.overallScore >= 40
                        ? tokens.colors.warningScale[600]
                        : tokens.colors.errorScale[600],
                    }}
                  >
                    {sc.overallScore}%
                  </Text>
                  <ChevronRight
                    size={16}
                    style={{
                      color: tokens.colors.neutral[400],
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: `transform ${tokens.transitions?.normal || tokens.motion.hover}`,
                    }}
                  />
                </div>
              </div>

              {isExpanded && (
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: tokens.spacing[4] }}>
                  {/* Radar chart */}
                  <svg width={160} height={160} viewBox="0 0 160 160">
                    {/* Grid rings */}
                    {[0.25, 0.5, 0.75, 1].map((scale) => (
                      <polygon
                        key={scale}
                        points={radarFramePoints(sc.dimensions.length, radarCx, radarCy, radarR * scale)}
                        fill="none"
                        stroke={tokens.colors.neutral[200]}
                        strokeWidth={1}
                      />
                    ))}
                    {/* Axis lines */}
                    {sc.dimensions.map((_, i) => {
                      const angle = (Math.PI * 2 * i) / sc.dimensions.length - Math.PI / 2;
                      return (
                        <line
                          key={i}
                          x1={radarCx}
                          y1={radarCy}
                          x2={radarCx + radarR * Math.cos(angle)}
                          y2={radarCy + radarR * Math.sin(angle)}
                          stroke={tokens.colors.neutral[200]}
                          strokeWidth={1}
                        />
                      );
                    })}
                    {/* Score polygon */}
                    <polygon
                      points={radarPoints(sc.dimensions, radarCx, radarCy, radarR)}
                      fill={tokens.colors.primaryScale[100]}
                      stroke={tokens.colors.primaryScale[500]}
                      strokeWidth={2}
                      fillOpacity={0.4}
                    />
                    {/* Score dots */}
                    {sc.dimensions.map((d, i) => {
                      const angle = (Math.PI * 2 * i) / sc.dimensions.length - Math.PI / 2;
                      const r = (d.score / 100) * radarR;
                      return (
                        <circle
                          key={i}
                          cx={radarCx + r * Math.cos(angle)}
                          cy={radarCy + r * Math.sin(angle)}
                          r={3}
                          fill={tokens.colors.primaryScale[500]}
                        />
                      );
                    })}
                  </svg>

                  {/* Dimension list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {sc.dimensions.map((dim, idx) => (
                      <div key={idx}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: tokens.spacing[1],
                          }}
                        >
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[700],
                            }}
                          >
                            {dim.name}
                          </Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[400],
                              }}
                            >
                              Weight: {dim.weight}x
                            </Text>
                            <Text
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: dim.score >= 70
                                  ? tokens.colors.successScale[600]
                                  : dim.score >= 40
                                  ? tokens.colors.warningScale[600]
                                  : tokens.colors.errorScale[600],
                              }}
                            >
                              {dim.score}%
                            </Text>
                          </div>
                        </div>
                        <div
                          style={{
                            height: tokens.spacing[1],
                            backgroundColor: tokens.colors.neutral[100],
                            borderRadius: tokens.borderRadius.full,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${dim.score}%`,
                              backgroundColor: dim.score >= 70
                                ? tokens.colors.successScale[500]
                                : dim.score >= 40
                                ? tokens.colors.warningScale[500]
                                : tokens.colors.errorScale[500],
                              borderRadius: tokens.borderRadius.full,
                              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );

    /* ================================================================== */
    /*  TAB: Notes                                                         */
    /* ================================================================== */
    const renderNotesTab = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
        {/* Add note button / form */}
        <div style={cardStyle}>
          {!showNoteForm ? (
            <button
              onClick={() => setShowNoteForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} dashed ${tokens.colors.neutral[300]}`,
                backgroundColor: tokens.colors.neutral[50],
                color: tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                width: '100%',
                ...hoverStyle,
              }}
            >
              <Plus size={14} />
              Add a note
            </button>
          ) : (
            <div>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your note..."
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[900],
                  backgroundColor: tokens.colors.common.white,
                  resize: 'vertical' as const,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box' as const,
                  marginBottom: tokens.spacing[2],
                }}
              
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.colors.primaryScale[100]}`;
                  e.currentTarget.style.borderColor = tokens.colors.primaryScale[400];
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = tokens.colors.neutral[300];
                }}
              />
              <div style={{ display: 'flex', gap: tokens.spacing[2], justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowNoteForm(false);
                    setNoteText('');
                  }}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                    color: tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: 'none',
                    backgroundColor: tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    ...hoverStyle,
                  }}
                >
                  Save Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes list */}
        {notes.length === 0 && !showNoteForm && (
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              textAlign: 'center' as const,
            }}
          >
            <MessageSquare size={32} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              No notes yet
            </Text>
          </div>
        )}
        {notes.map((note) => (
          <div key={note.id} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3] }}>
              {/* Author avatar */}
              <div
                style={{
                  width: tokens.spacing[8],
                  height: tokens.spacing[8],
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.secondaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.secondaryScale[700],
                  flexShrink: 0,
                }}
              >
                {note.authorAvatar ? (
                  <img src={note.authorAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />
                ) : (
                  note.authorName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {note.authorName}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                      }}
                    >
                      {formatRelativeTime(note.timestamp)}
                    </Text>
                  </div>

                  {note.isEditable && (
                    <div style={{ display: 'flex', gap: tokens.spacing[1] }}>
                      <button
                        onClick={() => onNoteSave?.(note.id, note.content)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          color: tokens.colors.neutral[400],
                          padding: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.sm,
                          display: 'flex',
                          alignItems: 'center',
                          ...hoverStyle,
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => onNoteDelete?.(note.id)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          color: tokens.colors.errorScale[400],
                          padding: tokens.spacing[1],
                          borderRadius: tokens.borderRadius.sm,
                          display: 'flex',
                          alignItems: 'center',
                          ...hoverStyle,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                    display: 'block',
                    whiteSpace: 'pre-wrap' as const,
                  }}
                >
                  {note.content}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    );

    /* ================================================================== */
    /*  TAB: Activity                                                      */
    /* ================================================================== */
    const renderActivityTab = () => (
      <div>
        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[4] }}>
          {eventTypes.map((type) => (
            <button
              key={type}
              onClick={() => setActivityFilter(type)}
              style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.full,
                border: activityFilter === type
                  ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[300]}`
                  : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: activityFilter === type
                  ? tokens.colors.primaryScale[50]
                  : tokens.colors.common.white,
                color: activityFilter === type
                  ? tokens.colors.primaryScale[600]
                  : tokens.colors.neutral[600],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: activityFilter === type
                  ? tokens.typography.fontWeight.semibold
                  : tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                textTransform: 'capitalize' as const,
                ...hoverStyle,
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Timeline */}
        {filteredEvents.length === 0 && (
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              textAlign: 'center' as const,
            }}
          >
            <Activity size={32} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              No activity found
            </Text>
          </div>
        )}
        <div style={{ position: 'relative' as const, paddingLeft: tokens.spacing[6] }}>
          {/* Vertical line */}
          {filteredEvents.length > 0 && (
            <div
              style={{
                position: 'absolute' as const,
                left: tokens.spacing[2],
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: tokens.colors.neutral[200],
              }}
            />
          )}

          {filteredEvents.map((event, idx) => (
            <div
              key={event.id}
              style={{
                position: 'relative' as const,
                marginBottom: idx < filteredEvents.length - 1 ? tokens.spacing[4] : 0,
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[3],
              }}
            >
              {/* Colored dot */}
              <div
                style={{
                  position: 'absolute' as const,
                  left: -(tokens.spacing[6] as number) + (tokens.spacing[2] as number) - 5,
                  top: tokens.spacing[1],
                  width: 12,
                  height: 12,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: eventDotColor(event.type),
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.common.white}`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                    display: 'block',
                  }}
                >
                  {event.message}
                  {event.entityName && (
                    <span
                      onClick={() => onEventLinkClick?.(event.id)}
                      style={{
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.primaryScale[600],
                        cursor: event.entityLink ? 'pointer' : 'default',
                        marginLeft: tokens.spacing[1],
                      }}
                    >
                      {event.entityName}
                    </span>
                  )}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    display: 'block',
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {formatRelativeTime(event.timestamp)}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    /* ================================================================== */
    /*  TAB: Documents                                                     */
    /* ================================================================== */
    const renderDocumentsTab = () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
        {documents.length === 0 && (
          <div
            style={{
              ...cardStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing[8],
              textAlign: 'center' as const,
            }}
          >
            <FileText size={32} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>
              No documents found
            </Text>
          </div>
        )}
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => onDocumentClick?.(doc.id)}
            style={{
              ...cardStyle,
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              ...hoverStyle,
            }}
          >
            <div
              style={{
                width: tokens.spacing[9],
                height: tokens.spacing[9],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.infoScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.colors.infoScale[600],
                flexShrink: 0,
              }}
            >
              <FileText size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  display: 'block',
                }}
              >
                {doc.name}
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={createBadgeStyle(tokens, 'secondary')}>
                  {doc.type}
                </span>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                  }}
                >
                  Uploaded {formatDate(doc.uploadedAt)}
                </Text>
              </div>
            </div>
            <Download size={16} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
          </div>
        ))}
      </div>
    );

    /* ================================================================== */
    /*  Tab content switch                                                 */
    /* ================================================================== */
    const renderTabContent = () => {
      switch (activeTab) {
        case 'profile':
          return renderProfileTab();
        case 'applications':
          return renderApplicationsTab();
        case 'interviews':
          return renderInterviewsTab();
        case 'scores':
          return renderScoresTab();
        case 'notes':
          return renderNotesTab();
        case 'activity':
          return renderActivityTab();
        case 'documents':
          return renderDocumentsTab();
        default:
          return null;
      }
    };

    /* ================================================================== */
    /*  Main Render                                                        */
    /* ================================================================== */
    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {renderHeader()}
        {renderStatsBar()}
        {renderTabs()}
        {renderTabContent()}
      </Box>
    );
  },
});
