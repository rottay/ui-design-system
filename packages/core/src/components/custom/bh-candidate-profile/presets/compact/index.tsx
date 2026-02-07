'use client';

/**
 * BhCandidateProfile - Compact Preset
 * Summary card version with key candidate information.
 * Ideal for embedding in lists, sidebars, or comparison views.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createSurfaceStyle, createBadgeStyle, createHoverStyle, getHoverTransform } from '../../../helpers';
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
  AlertTriangle,
  Calendar,
  Clock,
  Play,
  FileText,
  Briefcase,
  GraduationCap,
  Globe,
  ExternalLink,
  Star,
  Activity,
  ChevronDown,
  ChevronUp,
  User,
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

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhCandidateProfile = createPreset<BhCandidateProfileProps>({
  name: 'BhCandidateProfile.Compact',
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
      onApplicationClick,
      onInterviewClick,
      onEditProfile,
      onReplayClick,
      onDocumentClick,
      className,
      style,
    } = props;

    const [expanded, setExpanded] = useState(false);

    const isGlass = engine === 'modern' && !!tokens.glass;
    const hoverStyle = createHoverStyle(tokens);

    const cardStyle = createCardStyle(tokens, {
      elevation: 'sm',
      glass: isGlass,
    });

    const candidateName = candidate?.name ?? 'Unknown Candidate';
    const initials = candidateName
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const statusBadgeColor = (status: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' => {
      const s = status.toLowerCase();
      if (s === 'active' || s === 'hired' || s === 'accepted') return 'success';
      if (s === 'rejected' || s === 'declined' || s === 'withdrawn') return 'error';
      if (s === 'pending' || s === 'review' || s === 'in review') return 'warning';
      if (s === 'offer' || s === 'offered') return 'info';
      return 'primary';
    };

    const topSkills = useMemo(() => {
      return [...skills].sort((a, b) => b.proficiency - a.proficiency).slice(0, 5);
    }, [skills]);

    const latestExperience = experience.find((e) => e.current) ?? experience[0];
    const latestEducation = education[0];

    const activeApps = applications.filter((a) => {
      const s = a.status.toLowerCase();
      return s !== 'rejected' && s !== 'withdrawn' && s !== 'declined';
    });

    const upcomingInterviews = interviews.filter((i) => i.status === 'scheduled');

    const avgScore = stats?.avgScore ?? (
      scoreCards.length > 0
        ? Math.round(scoreCards.reduce((sum, sc) => sum + sc.overallScore, 0) / scoreCards.length)
        : 0
    );

    /* ================================================================== */
    /*  Render                                                             */
    /* ================================================================== */
    return (
      <Box
        className={className}
        style={{
          ...cardStyle,
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* ============================================================ */}
        {/*  Header Section                                               */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[3],
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              fontSize: tokens.typography.fontSize.lg,
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

          {/* Name / Role / Status */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}
              >
                {candidateName}
              </Text>
              {candidate?.status && (
                <span style={{
                  ...createBadgeStyle(tokens, statusBadgeColor(candidate.status)),
                  fontSize: '10px',
                  padding: `0 ${tokens.spacing[2]}px`,
                }}>
                  {candidate.status}
                </span>
              )}
              {candidate?.doNotContact && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: '10px',
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.errorScale[600],
                  }}
                >
                  <AlertTriangle size={10} />
                  DNC
                </span>
              )}
            </div>
            {candidate?.currentRole && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  display: 'block',
                }}
              >
                {candidate.currentRole}
              </Text>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginTop: tokens.spacing[1], flexWrap: 'wrap' as const }}>
              {candidate?.location && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  <MapPin size={11} />
                  {candidate.location}
                </span>
              )}
              {candidate?.email && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  <Mail size={11} />
                  {candidate.email}
                </span>
              )}
              {candidate?.phone && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2,
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}
                >
                  <Phone size={11} />
                  {candidate.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  Quick Stats Row                                              */}
        {/* ============================================================ */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[3],
          }}
        >
          {[
            { label: 'Applications', value: String(activeApps.length), color: tokens.colors.primaryScale[600] },
            { label: 'Interviews', value: String(interviews.length), color: tokens.colors.infoScale[600] },
            { label: 'Avg Score', value: avgScore > 0 ? `${avgScore}%` : 'N/A', color: avgScore >= 70 ? tokens.colors.successScale[600] : avgScore >= 40 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600] },
            { label: 'Last Active', value: stats?.lastActivityDate ? formatRelativeTime(stats.lastActivityDate) : 'N/A', color: tokens.colors.neutral[600] },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                padding: tokens.spacing[2],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  display: 'block',
                }}
              >
                {stat.label}
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: stat.color,
                  display: 'block',
                }}
              >
                {stat.value}
              </Text>
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/*  Top Skills                                                    */}
        {/* ============================================================ */}
        {topSkills.length > 0 && (
          <div style={{ marginBottom: tokens.spacing[3] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: tokens.spacing[2],
              }}
            >
              Top Skills
            </Text>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
              {topSkills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: skill.proficiency >= 80
                      ? tokens.colors.successScale[50]
                      : skill.proficiency >= 50
                      ? tokens.colors.warningScale[50]
                      : tokens.colors.neutral[100],
                    color: skill.proficiency >= 80
                      ? tokens.colors.successScale[700]
                      : skill.proficiency >= 50
                      ? tokens.colors.warningScale[700]
                      : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {skill.name}
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>
                    {skill.proficiency}%
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  Active Applications Summary                                   */}
        {/* ============================================================ */}
        {activeApps.length > 0 && (
          <div style={{ marginBottom: tokens.spacing[3] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: tokens.spacing[2],
              }}
            >
              Active Applications
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              {activeApps.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  onClick={() => onApplicationClick?.(app.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: tokens.colors.neutral[50],
                    cursor: 'pointer',
                    ...hoverStyle,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                        whiteSpace: 'nowrap' as const,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {app.jobName}
                    </Text>
                    <span style={{
                      ...createBadgeStyle(tokens, 'info'),
                      fontSize: '10px',
                      padding: `0 ${tokens.spacing[1]}px`,
                    }}>
                      {app.stage}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
                    {/* Mini progress bar */}
                    <div
                      style={{
                        width: 40,
                        height: tokens.spacing[1],
                        backgroundColor: tokens.colors.neutral[200],
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
                        }}
                      />
                    </div>
                    <Text
                      style={{
                        fontSize: '10px',
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
                </div>
              ))}
              {activeApps.length > 3 && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.primaryScale[600],
                    fontWeight: tokens.typography.fontWeight.medium,
                    textAlign: 'center' as const,
                    display: 'block',
                    padding: tokens.spacing[1],
                  }}
                >
                  +{activeApps.length - 3} more
                </Text>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  Upcoming Interviews                                           */}
        {/* ============================================================ */}
        {upcomingInterviews.length > 0 && (
          <div style={{ marginBottom: tokens.spacing[3] }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: tokens.spacing[2],
              }}
            >
              Upcoming Interviews
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
              {upcomingInterviews.slice(0, 2).map((interview) => (
                <div
                  key={interview.id}
                  onClick={() => onInterviewClick?.(interview.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: tokens.colors.neutral[50],
                    cursor: 'pointer',
                    ...hoverStyle,
                  }}
                >
                  <Calendar size={12} style={{ color: tokens.colors.infoScale[500], flexShrink: 0 }} />
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[700],
                      flex: 1,
                    }}
                  >
                    {interview.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                    {interview.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <span style={{
                    ...createBadgeStyle(tokens, interview.type === 'ai' ? 'info' : 'secondary'),
                    fontSize: '10px',
                    padding: `0 ${tokens.spacing[1]}px`,
                  }}>
                    {interview.type === 'ai' ? 'AI' : 'Human'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/*  Expandable Details                                            */}
        {/* ============================================================ */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[1],
            width: '100%',
            padding: `${tokens.spacing[1]}px 0`,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.primaryScale[600],
            ...hoverStyle,
          }}
        >
          {expanded ? 'Show less' : 'Show more details'}
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>

        {expanded && (
          <div style={{ marginTop: tokens.spacing[3] }}>
            {/* Latest experience */}
            {latestExperience && (
              <div style={{ marginBottom: tokens.spacing[3] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Current Experience
                </Text>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[2],
                    padding: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                  }}
                >
                  <Briefcase size={14} style={{ color: tokens.colors.primaryScale[500], flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {latestExperience.role}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        display: 'block',
                      }}
                    >
                      {latestExperience.company}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[400],
                        display: 'block',
                      }}
                    >
                      {latestExperience.startDate} &mdash; {latestExperience.current ? 'Present' : latestExperience.endDate}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {/* Education */}
            {latestEducation && (
              <div style={{ marginBottom: tokens.spacing[3] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Education
                </Text>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[2],
                    padding: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                  }}
                >
                  <GraduationCap size={14} style={{ color: tokens.colors.infoScale[500], flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        display: 'block',
                      }}
                    >
                      {latestEducation.degree} in {latestEducation.field}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        display: 'block',
                      }}
                    >
                      {latestEducation.institution} ({latestEducation.year})
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {/* Compensation */}
            {compensationRange && (
              <div style={{ marginBottom: tokens.spacing[3] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Compensation
                </Text>
                <div
                  style={{
                    padding: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[50],
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                      display: 'block',
                    }}
                  >
                    {compensationRange.currency ?? '$'}{compensationRange.min.toLocaleString()} &mdash; {compensationRange.currency ?? '$'}{compensationRange.max.toLocaleString()}
                  </Text>
                </div>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div style={{ marginBottom: tokens.spacing[3] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Languages
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                  {languages.map((lang, idx) => (
                    <span
                      key={idx}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.neutral[100],
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                      }}
                    >
                      <Globe size={10} />
                      {lang.name}
                      <span style={{ fontSize: '10px', color: tokens.colors.neutral[400] }}>({lang.level})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Documents count */}
            {documents.length > 0 && (
              <div style={{ marginBottom: tokens.spacing[3] }}>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Documents
                </Text>
                <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  {documents.slice(0, 3).map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => onDocumentClick?.(doc.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.neutral[50],
                        cursor: 'pointer',
                        ...hoverStyle,
                      }}
                    >
                      <FileText size={12} style={{ color: tokens.colors.infoScale[500], flexShrink: 0 }} />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                          flex: 1,
                          whiteSpace: 'nowrap' as const,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {doc.name}
                      </Text>
                      <span style={{
                        ...createBadgeStyle(tokens, 'secondary'),
                        fontSize: '10px',
                        padding: `0 ${tokens.spacing[1]}px`,
                      }}>
                        {doc.type}
                      </span>
                    </div>
                  ))}
                  {documents.length > 3 && (
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.primaryScale[600],
                        fontWeight: tokens.typography.fontWeight.medium,
                        textAlign: 'center' as const,
                        display: 'block',
                        padding: tokens.spacing[1],
                      }}
                    >
                      +{documents.length - 3} more documents
                    </Text>
                  )}
                </div>
              </div>
            )}

            {/* Links */}
            {links.length > 0 && (
              <div>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  Links
                </Text>
                <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1] }}>
                  {links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[50],
                        color: tokens.colors.primaryScale[600],
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        textDecoration: 'none',
                        ...hoverStyle,
                      }}
                    >
                      <ExternalLink size={10} />
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Source badge */}
            {candidate?.source && (
              <div style={{ marginTop: tokens.spacing[3] }}>
                <span style={createBadgeStyle(tokens, 'secondary')}>
                  Source: {candidate.source}
                </span>
              </div>
            )}
          </div>
        )}
      </Box>
    );
  },
});
