'use client';

/**
 * BhWarRoom - Collaborative Preset
 * Real-time collaborative view for war room sessions.
 *
 * Layout:
 * - Header: title, job name, timer, participant avatars with online status
 * - Left panel: candidate list with mini-cards
 * - Center panel: selected candidate detail (profile, scores, strengths)
 * - Right panel: voting, vote tally, decision log, action items
 * - Bottom bar: end session, add action item
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  PlayCircle,
  Vote,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Star,
  Ban,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Plus,
  Check,
  AlertTriangle,
  Target,
  Timer,
  MessageSquare,
  ListChecks,
  History,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp,
  Award,
  X,
  Bookmark,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createOverlayStyle,
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getPulseSpeed,
  clickableProps,
  formatDistanceToNow,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhWarRoomProps,
  WarRoomCandidate,
  WarRoomVote,
  WarRoomDecision,
  WarRoomAction,
  WarRoomParticipant,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VOTE_OPTIONS: Array<{
  value: WarRoomVote['vote'];
  label: string;
  shortLabel: string;
  color: 'success' | 'error' | 'warning' | 'primary' | 'secondary';
  icon: typeof ThumbsUp;
}> = [
  { value: 'strong_hire', label: 'Strong Hire', shortLabel: 'SH', color: 'success', icon: Star },
  { value: 'hire', label: 'Hire', shortLabel: 'H', color: 'success', icon: ThumbsUp },
  { value: 'maybe', label: 'Maybe', shortLabel: 'M', color: 'warning', icon: HelpCircle },
  { value: 'no_hire', label: 'No Hire', shortLabel: 'NH', color: 'error', icon: ThumbsDown },
  { value: 'strong_no_hire', label: 'Strong No', shortLabel: 'SN', color: 'error', icon: Ban },
];

const DECISION_OPTIONS: Array<{
  value: WarRoomDecision['decision'];
  label: string;
  color: 'success' | 'error' | 'warning';
  icon: typeof CheckCircle2;
}> = [
  { value: 'advance', label: 'Advance', color: 'success', icon: ArrowUpRight },
  { value: 'hold', label: 'Hold', color: 'warning', icon: Pause },
  { value: 'reject', label: 'Reject', color: 'error', icon: XCircle },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTimer(startedAt?: string): string {
  if (!startedAt) return '00:00';
  const diff = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(diff / 60_000);
  const secs = Math.floor((diff % 60_000) / 1_000);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getVoteColor(vote: WarRoomVote['vote']): string {
  switch (vote) {
    case 'strong_hire': return '#16a34a';
    case 'hire': return '#22c55e';
    case 'maybe': return '#eab308';
    case 'no_hire': return '#f97316';
    case 'strong_no_hire': return '#ef4444';
    default: return '#9ca3af';
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const CollaborativeBhWarRoom = createPreset<BhWarRoomProps>(
  'CollaborativeBhWarRoom',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhWarRoomProps>) => {
    const {
      selectedSession,
      candidates = [],
      participants = [],
      votes = [],
      decisions = [],
      actions = [],
      onCastVote,
      onAddDecision,
      onAddAction,
      onEndSession,
      loading = false,
      currentUserId,
      className,
      style,
    } = props;

    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(
      candidates[0]?.id ?? null
    );
    const [voteNotes, setVoteNotes] = useState('');
    const [decisionReason, setDecisionReason] = useState('');
    const [actionTitle, setActionTitle] = useState('');
    const [timerDisplay, setTimerDisplay] = useState('00:00');
    const [showEndConfirm, setShowEndConfirm] = useState(false);
    const [activeRightTab, setActiveRightTab] = useState<'votes' | 'decisions' | 'actions'>('votes');

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const pulseSpeed = useMemo(() => getPulseSpeed(tokens), [tokens]);
    const panelHeaderStyle = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    // Auto-select first candidate
    useEffect(() => {
      if (!selectedCandidateId && candidates.length > 0) {
        setSelectedCandidateId(candidates[0].id);
      }
    }, [candidates, selectedCandidateId]);

    // Timer
    useEffect(() => {
      if (!selectedSession?.startedAt) return;
      const interval = setInterval(() => {
        setTimerDisplay(formatTimer(selectedSession.startedAt));
      }, 1000);
      return () => clearInterval(interval);
    }, [selectedSession?.startedAt]);

    const selectedCandidate = useMemo(
      () => candidates.find((c) => c.id === selectedCandidateId) ?? null,
      [candidates, selectedCandidateId]
    );

    const candidateVotes = useMemo(
      () => (selectedCandidateId ? votes.filter((v) => v.candidateId === selectedCandidateId) : []),
      [votes, selectedCandidateId]
    );

    const myVote = useMemo(
      () => candidateVotes.find((v) => v.participantId === currentUserId),
      [candidateVotes, currentUserId]
    );

    const candidateDecisions = useMemo(
      () => (selectedCandidateId ? decisions.filter((d) => d.candidateId === selectedCandidateId) : []),
      [decisions, selectedCandidateId]
    );

    // Vote tally for selected candidate
    const voteTally = useMemo(() => {
      const tally: Record<string, number> = { strong_hire: 0, hire: 0, maybe: 0, no_hire: 0, strong_no_hire: 0 };
      for (const v of candidateVotes) {
        tally[v.vote] = (tally[v.vote] || 0) + 1;
      }
      return tally;
    }, [candidateVotes]);

    // ---- Styles ----
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      ...style,
    };

    const mainLayoutStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: '240px 1fr 320px',
      flex: 1,
      overflow: 'hidden',
      gap: 1,
      backgroundColor: tokens.colors.neutral[100],
    };

    const panelStyle: React.CSSProperties = {
      backgroundColor: tokens.colors.common.white,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    };

    // ---- Loading ----
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={containerStyle} className={className}>
          <Box style={{ ...skeletonStyle, height: 56, borderRadius: 0 }} />
          <Box style={{ display: 'flex', flex: 1, gap: 1 }}>
            <Box style={{ ...skeletonStyle, width: 240, height: '100%', borderRadius: 0 }} />
            <Box style={{ ...skeletonStyle, flex: 1, height: '100%', borderRadius: 0 }} />
            <Box style={{ ...skeletonStyle, width: 320, height: '100%', borderRadius: 0 }} />
          </Box>
        </Box>
      );
    }

    if (!selectedSession) {
      return (
        <Box style={containerStyle} className={className}>
          <Box style={createEmptyStateStyle(tokens)}>
            <Target size={ICON_SIZES.illustration} style={{ color: tokens.colors.neutral[300] }} />
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginTop: tokens.spacing[3],
            }}>
              No Session Selected
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
              Select or create a war room session to get started.
            </Text>
          </Box>
        </Box>
      );
    }

    // ================================================================
    // HEADER
    // ================================================================
    const renderHeader = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
        backgroundColor: tokens.colors.common.white,
        borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
        gap: tokens.spacing[3],
        flexShrink: 0,
      }}>
        {/* Left: Title + Job */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1, minWidth: 0 }}>
          <Box style={{
            ...createIconContainerStyle(tokens, { size: 36, color: tokens.colors.primaryScale[50] }),
          }}>
            <Target size={ICON_SIZES.feature} style={{ color: tokens.colors.primaryScale[600] }} />
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {selectedSession.title}
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              {selectedSession.jobTitle}
            </Text>
          </Box>
        </Box>

        {/* Center: Timer */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          backgroundColor: tokens.colors.neutral[50],
          border: `1px solid ${tokens.colors.neutral[200]}`,
        }}>
          <Timer size={ICON_SIZES.section} style={{ color: tokens.colors.neutral[500] }} />
          <Text style={{
            fontSize: tokens.typography.fontSize.lg,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[800],
            fontFeatureSettings: '"tnum"',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {timerDisplay}
          </Text>
        </Box>

        {/* Right: Participants */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {participants.slice(0, 6).map((p, i) => (
              <Box
                key={p.id}
                title={p.name}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: (tokens.colors.primaryScale as unknown as Record<number, string>)[100 + ((i * 100) % 400)],
                  border: `2px solid ${tokens.colors.common.white}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: i > 0 ? -8 : 0,
                  position: 'relative',
                  zIndex: 10 - i,
                  overflow: 'hidden',
                }}
              >
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }}
                  />
                ) : (
                  <Text style={{
                    fontSize: 11,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.primaryScale[700],
                  }}>
                    {p.name?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                )}
                {p.isOnline && (
                  <Box style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: tokens.colors.successScale[500],
                    border: `1.5px solid ${tokens.colors.common.white}`,
                  }} />
                )}
              </Box>
            ))}
            {participants.length > 6 && (
              <Box style={{
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                border: `2px solid ${tokens.colors.common.white}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -8,
              }}>
                <Text style={{ fontSize: 10, color: tokens.colors.neutral[600] }}>
                  +{participants.length - 6}
                </Text>
              </Box>
            )}
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            {participants.filter((p) => p.isOnline).length}/{participants.length} online
          </Text>
        </Box>
      </Box>
    );

    // ================================================================
    // LEFT PANEL: Candidate List
    // ================================================================
    const renderLeftPanel = () => (
      <Box style={{ ...panelStyle, borderRight: `1px solid ${tokens.colors.neutral[100]}` }}>
        <Box style={{
          ...panelHeaderStyle,
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
        }}>
          <Users size={ICON_SIZES.section} style={{ color: tokens.colors.neutral[500] }} />
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
          }}>
            Candidates ({candidates.length})
          </Text>
        </Box>
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {candidates.map((candidate) => {
            const isSelected = candidate.id === selectedCandidateId;
            const candidateVoteCount = votes.filter((v) => v.candidateId === candidate.id).length;
            const hasDecision = decisions.some((d) => d.candidateId === candidate.id);

            return (
              <Box
                key={candidate.id}
                onClick={() => setSelectedCandidateId(candidate.id)}
                {...clickableProps(() => setSelectedCandidateId(candidate.id), `Select ${candidate.name}`)}
                style={{
                  ...createListItemStyle(tokens, { active: isSelected, interactive: true }),
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                }}
              >
                {/* Avatar */}
                <Box style={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[100],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {candidate.avatarUrl ? (
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }}
                    />
                  ) : (
                    <Text style={{
                      fontSize: 13,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.primaryScale[600],
                    }}>
                      {candidate.name?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  )}
                </Box>

                {/* Info */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: isSelected ? tokens.colors.primaryScale[700] : tokens.colors.neutral[800],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}>
                      {candidate.name}
                    </Text>
                    {hasDecision && (
                      <CheckCircle2 size={ICON_SIZES.label} style={{ color: tokens.colors.successScale[500], flexShrink: 0 }} />
                    )}
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: 2 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      Score: {numericValue(candidate.overallScore).toFixed(1)}
                    </Text>
                    {candidateVoteCount > 0 && (
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}>
                        <Vote size={10} style={{ color: tokens.colors.neutral[400] }} />
                        <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>
                          {candidateVoteCount}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {candidates.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(tokens), padding: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                No candidates in this session
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );

    // ================================================================
    // CENTER PANEL: Candidate Detail
    // ================================================================
    const renderCenterPanel = () => {
      if (!selectedCandidate) {
        return (
          <Box style={{ ...panelStyle, alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={ICON_SIZES.illustration} style={{ color: tokens.colors.neutral[200] }} />
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[400],
              marginTop: tokens.spacing[2],
            }}>
              Select a candidate to review
            </Text>
          </Box>
        );
      }

      return (
        <Box style={{ ...panelStyle, overflow: 'auto', padding: tokens.spacing[4] }}>
          {/* Profile Summary */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            marginBottom: tokens.spacing[5],
          }}>
            <Box style={{
              width: 64,
              height: 64,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.primaryScale[100],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}>
              {selectedCandidate.avatarUrl ? (
                <img
                  src={selectedCandidate.avatarUrl}
                  alt={selectedCandidate.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }}
                />
              ) : (
                <Text style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[600],
                }}>
                  {selectedCandidate.name?.[0]?.toUpperCase() ?? '?'}
                </Text>
              )}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}>
                {selectedCandidate.name}
              </Text>
              {selectedCandidate.currentTitle && (
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  marginTop: 2,
                }}>
                  {selectedCandidate.currentTitle}
                </Text>
              )}
              {selectedCandidate.applicationStatus && (
                <Box style={{
                  ...createBadgeStyle(tokens, 'primary'),
                  borderRadius: getPersonalityBadgeRadius(tokens),
                  marginTop: tokens.spacing[2],
                }}>
                  {selectedCandidate.applicationStatus}
                </Box>
              )}
            </Box>

            {/* Score Gauge */}
            <Box style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
            }}>
              <Box style={{ position: 'relative', width: 64, height: 64 }}>
                <svg width={64} height={64} viewBox="0 0 64 64">
                  <circle
                    cx={32} cy={32} r={26}
                    fill="none"
                    stroke={tokens.colors.neutral[100]}
                    strokeWidth={6}
                  />
                  <circle
                    cx={32} cy={32} r={26}
                    fill="none"
                    stroke={tokens.colors.primaryScale[500]}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray={`${(numericValue(selectedCandidate.overallScore) / 10) * (2 * Math.PI * 26)} ${2 * Math.PI * 26}`}
                    transform="rotate(-90 32 32)"
                  />
                </svg>
                <Box style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.lg,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                  }}>
                    {numericValue(selectedCandidate.overallScore).toFixed(1)}
                  </Text>
                </Box>
              </Box>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}>
                Overall Score
              </Text>
            </Box>
          </Box>

          {/* Dimension Scores */}
          {selectedCandidate.dimensionScores.length > 0 && (
            <Box style={{ marginBottom: tokens.spacing[5] }}>
              <Text style={sectionHeaderStyle}>Dimension Scores</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {selectedCandidate.dimensionScores.map((dim) => {
                  const pct = (numericValue(dim.score) / numericValue(dim.maxScore)) * 100;
                  const bar = createProgressBarStyle(tokens, { percent: pct });
                  return (
                    <Box key={dim.dimension} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[600],
                        width: 120,
                        flexShrink: 0,
                      }}>
                        {dim.label}
                      </Text>
                      <Box style={{ flex: 1 }}>
                        <Box style={bar.track}>
                          <Box style={bar.fill} />
                        </Box>
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[700],
                        width: 40,
                        textAlign: 'right',
                        flexShrink: 0,
                      }}>
                        {numericValue(dim.score).toFixed(1)}/{numericValue(dim.maxScore)}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Strengths & Weaknesses */}
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
            {selectedCandidate.strengths && selectedCandidate.strengths.length > 0 && (
              <Box>
                <Text style={sectionHeaderStyle}>Key Strengths</Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  {selectedCandidate.strengths.map((s, i) => (
                    <Box key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[1] }}>
                      <CheckCircle2 size={ICON_SIZES.label} style={{
                        color: tokens.colors.successScale[500],
                        marginTop: 2,
                        flexShrink: 0,
                      }} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        lineHeight: 1.5,
                      }}>
                        {s}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            {selectedCandidate.weaknesses && selectedCandidate.weaknesses.length > 0 && (
              <Box>
                <Text style={sectionHeaderStyle}>Areas of Concern</Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  {selectedCandidate.weaknesses.map((w, i) => (
                    <Box key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[1] }}>
                      <AlertTriangle size={ICON_SIZES.label} style={{
                        color: tokens.colors.warningScale[500],
                        marginTop: 2,
                        flexShrink: 0,
                      }} />
                      <Text style={{
                        fontSize: tokens.typography.fontSize.sm,
                        color: tokens.colors.neutral[700],
                        lineHeight: 1.5,
                      }}>
                        {w}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Interview Highlights */}
          {selectedCandidate.interviewHighlights && selectedCandidate.interviewHighlights.length > 0 && (
            <Box>
              <Text style={sectionHeaderStyle}>Interview Highlights</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                {selectedCandidate.interviewHighlights.map((h, i) => (
                  <Box key={i} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: tokens.spacing[2],
                    padding: tokens.spacing[2],
                    backgroundColor: tokens.colors.neutral[50],
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.neutral[100]}`,
                  }}>
                    <MessageSquare size={ICON_SIZES.label} style={{
                      color: tokens.colors.primaryScale[400],
                      marginTop: 2,
                      flexShrink: 0,
                    }} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      lineHeight: 1.5,
                      fontStyle: 'italic',
                    }}>
                      {h}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      );
    };

    // ================================================================
    // RIGHT PANEL
    // ================================================================
    const renderRightPanel = () => (
      <Box style={{ ...panelStyle, borderLeft: `1px solid ${tokens.colors.neutral[100]}` }}>
        {/* Tab Headers */}
        <Box style={{
          display: 'flex',
          borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
          flexShrink: 0,
        }}>
          {[
            { key: 'votes' as const, label: 'Votes', icon: Vote },
            { key: 'decisions' as const, label: 'Decisions', icon: CheckCircle2 },
            { key: 'actions' as const, label: 'Actions', icon: ListChecks },
          ].map((tab) => (
            <Box
              key={tab.key}
              onClick={() => setActiveRightTab(tab.key)}
              {...clickableProps(() => setActiveRightTab(tab.key), `Show ${tab.label}`)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: activeRightTab === tab.key ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: activeRightTab === tab.key ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                borderBottom: activeRightTab === tab.key
                  ? `2px solid ${tokens.colors.primaryScale[600]}`
                  : '2px solid transparent',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <tab.icon size={ICON_SIZES.label} />
              {tab.label}
            </Box>
          ))}
        </Box>

        {/* Tab Content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[3] }}>
          {/* ---- VOTES TAB ---- */}
          {activeRightTab === 'votes' && selectedCandidateId && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {/* Vote Buttons */}
              {onCastVote && selectedSession.status !== 'closed' && (
                <Box>
                  <Text style={sectionHeaderStyle}>Cast Your Vote</Text>
                  <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[1] }}>
                    {VOTE_OPTIONS.map((opt) => {
                      const isMyVote = myVote?.vote === opt.value;
                      return (
                        <Box
                          key={opt.value}
                          onClick={() => {
                            onCastVote(selectedCandidateId, opt.value, voteNotes || undefined);
                            setVoteNotes('');
                          }}
                          {...clickableProps(
                            () => { onCastVote(selectedCandidateId, opt.value, voteNotes || undefined); setVoteNotes(''); },
                            `Vote ${opt.label}`
                          )}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[1]}px`,
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: isMyVote
                              ? (tokens.colors as any)[`${opt.color}Scale`]?.[100] ?? tokens.colors.neutral[100]
                              : tokens.colors.neutral[50],
                            border: `2px solid ${isMyVote
                              ? (tokens.colors as any)[`${opt.color}Scale`]?.[400] ?? tokens.colors.neutral[300]
                              : tokens.colors.neutral[200]}`,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          <opt.icon size={ICON_SIZES.section} style={{
                            color: isMyVote
                              ? (tokens.colors as any)[`${opt.color}Scale`]?.[600] ?? tokens.colors.neutral[600]
                              : tokens.colors.neutral[500],
                          }} />
                          <Text style={{
                            fontSize: 9,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: isMyVote
                              ? (tokens.colors as any)[`${opt.color}Scale`]?.[700] ?? tokens.colors.neutral[700]
                              : tokens.colors.neutral[600],
                            textAlign: 'center',
                          }}>
                            {opt.shortLabel}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                  {/* Vote notes */}
                  <Box style={{ marginTop: tokens.spacing[2] }}>
                    <textarea
                      placeholder="Add optional notes..."
                      value={voteNotes}
                      onChange={(e) => setVoteNotes(e.target.value)}
                      style={{
                        width: '100%',
                        minHeight: 48,
                        padding: tokens.spacing[2],
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[700],
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'inherit',
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Vote Tally */}
              <Box>
                <Text style={sectionHeaderStyle}>Vote Tally</Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                  {VOTE_OPTIONS.map((opt) => {
                    const tallyCount = voteTally[opt.value] || 0;
                    const total = candidateVotes.length || 1;
                    const pct = (tallyCount / total) * 100;
                    const bar = createProgressBarStyle(tokens, {
                      percent: pct,
                      color: (tokens.colors as any)[`${opt.color}Scale`]?.[500] as string ?? tokens.colors.neutral[500],
                    });
                    return (
                      <Box key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[600],
                          width: 70,
                          flexShrink: 0,
                        }}>
                          {opt.label}
                        </Text>
                        <Box style={{ flex: 1 }}>
                          <Box style={bar.track}>
                            <Box style={bar.fill} />
                          </Box>
                        </Box>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[700],
                          width: 20,
                          textAlign: 'right',
                        }}>
                          {tallyCount}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Individual votes */}
              {candidateVotes.length > 0 && (
                <Box>
                  <Text style={sectionHeaderStyle}>Individual Votes</Text>
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                    {candidateVotes.map((v, i) => (
                      <Box key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        backgroundColor: tokens.colors.neutral[50],
                        borderRadius: tokens.borderRadius.sm,
                      }}>
                        <Box style={{
                          width: 8,
                          height: 8,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: getVoteColor(v.vote),
                          flexShrink: 0,
                        }} />
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[700],
                          flex: 1,
                        }}>
                          {v.participantName ?? v.participantId.slice(0, 8)}
                        </Text>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[600],
                        }}>
                          {VOTE_OPTIONS.find((o) => o.value === v.vote)?.label ?? v.vote}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* ---- DECISIONS TAB ---- */}
          {activeRightTab === 'decisions' && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {/* Add decision */}
              {onAddDecision && selectedCandidateId && selectedSession.status !== 'closed' && (
                <Box>
                  <Text style={sectionHeaderStyle}>Make Decision</Text>
                  <Box style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                    {DECISION_OPTIONS.map((opt) => (
                      <Box
                        key={opt.value}
                        onClick={() => {
                          if (decisionReason.trim()) {
                            onAddDecision(selectedCandidateId, opt.value, decisionReason);
                            setDecisionReason('');
                          }
                        }}
                        {...clickableProps(
                          () => {
                            if (decisionReason.trim()) {
                              onAddDecision(selectedCandidateId, opt.value, decisionReason);
                              setDecisionReason('');
                            }
                          },
                          `Decision: ${opt.label}`
                        )}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.md,
                          ...createBadgeStyle(tokens, opt.color),
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                          opacity: decisionReason.trim() ? 1 : 0.6,
                        }}
                      >
                        <opt.icon size={ICON_SIZES.label} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{opt.label}</Text>
                      </Box>
                    ))}
                  </Box>
                  <textarea
                    placeholder="Reason for decision (required)..."
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: 60,
                      padding: tokens.spacing[2],
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[700],
                      resize: 'vertical',
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                </Box>
              )}

              {/* Decision Log */}
              <Box>
                <Text style={sectionHeaderStyle}>Decision Log</Text>
                {decisions.length === 0 ? (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontStyle: 'italic' }}>
                    No decisions yet
                  </Text>
                ) : (
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
                    {decisions.map((d, i) => {
                      const decCfg = DECISION_OPTIONS.find((o) => o.value === d.decision);
                      return (
                        <Box key={i} style={{
                          padding: tokens.spacing[2],
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: tokens.colors.neutral[50],
                          border: `1px solid ${tokens.colors.neutral[100]}`,
                        }}>
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                              {decCfg && <decCfg.icon size={ICON_SIZES.label} style={{
                                color: (tokens.colors as any)[`${decCfg.color}Scale`]?.[600] as string ?? tokens.colors.neutral[600],
                              }} />}
                              <Text style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[800],
                              }}>
                                {d.candidateName ?? 'Candidate'} - {decCfg?.label ?? d.decision}
                              </Text>
                            </Box>
                          </Box>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[600],
                            lineHeight: 1.4,
                          }}>
                            {d.reason}
                          </Text>
                          <Text style={{
                            fontSize: 10,
                            color: tokens.colors.neutral[400],
                            marginTop: tokens.spacing[1],
                          }}>
                            by {d.decidedByName ?? d.decidedBy.slice(0, 8)} - {formatDistanceToNow(new Date(d.timestamp), { addSuffix: true })}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* ---- ACTIONS TAB ---- */}
          {activeRightTab === 'actions' && (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {/* Add action */}
              {onAddAction && selectedSession.status !== 'closed' && (
                <Box>
                  <Text style={sectionHeaderStyle}>Add Action Item</Text>
                  <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                    <input
                      type="text"
                      placeholder="Action item title..."
                      value={actionTitle}
                      onChange={(e) => setActionTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && actionTitle.trim()) {
                          onAddAction(actionTitle, currentUserId ?? '', undefined);
                          setActionTitle('');
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                        fontSize: tokens.typography.fontSize.xs,
                        color: tokens.colors.neutral[700],
                        outline: 'none',
                      }}
                    />
                    <Box
                      onClick={() => {
                        if (actionTitle.trim()) {
                          onAddAction(actionTitle, currentUserId ?? '', undefined);
                          setActionTitle('');
                        }
                      }}
                      {...clickableProps(
                        () => {
                          if (actionTitle.trim()) {
                            onAddAction(actionTitle, currentUserId ?? '', undefined);
                            setActionTitle('');
                          }
                        },
                        'Add action item'
                      )}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[600],
                        color: tokens.colors.common.white,
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={ICON_SIZES.section} />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Actions list */}
              <Box>
                <Text style={sectionHeaderStyle}>Action Items ({actions.length})</Text>
                {actions.length === 0 ? (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontStyle: 'italic' }}>
                    No action items yet
                  </Text>
                ) : (
                  <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1] }}>
                    {actions.map((a) => (
                      <Box key={a.id} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                        backgroundColor: a.completed ? tokens.colors.successScale[50] : tokens.colors.neutral[50],
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${a.completed ? tokens.colors.successScale[200] : tokens.colors.neutral[100]}`,
                      }}>
                        <Box style={{
                          width: 18,
                          height: 18,
                          borderRadius: tokens.borderRadius.sm,
                          border: `2px solid ${a.completed ? tokens.colors.successScale[500] : tokens.colors.neutral[300]}`,
                          backgroundColor: a.completed ? tokens.colors.successScale[500] : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: 1,
                        }}>
                          {a.completed && <Check size={10} style={{ color: tokens.colors.common.white }} />}
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: a.completed ? tokens.colors.neutral[500] : tokens.colors.neutral[800],
                            textDecoration: a.completed ? 'line-through' : 'none',
                            lineHeight: 1.4,
                          }}>
                            {a.title}
                          </Text>
                          <Text style={{
                            fontSize: 10,
                            color: tokens.colors.neutral[400],
                            marginTop: 2,
                          }}>
                            {a.assigneeName ?? 'Unassigned'}
                            {a.dueDate ? ` - Due ${a.dueDate}` : ''}
                          </Text>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );

    // ================================================================
    // BOTTOM BAR
    // ================================================================
    const renderBottomBar = () => (
      <Box style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
        backgroundColor: tokens.colors.common.white,
        borderTop: `1px solid ${tokens.colors.neutral[200]}`,
        flexShrink: 0,
        gap: tokens.spacing[3],
      }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            {candidates.length} candidates - {votes.length} votes - {decisions.length} decisions
          </Text>
        </Box>

        {onEndSession && selectedSession.status !== 'closed' && (
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {showEndConfirm ? (
              <>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600] }}>
                  End this session?
                </Text>
                <Box
                  onClick={() => { onEndSession(); setShowEndConfirm(false); }}
                  {...clickableProps(() => { onEndSession(); setShowEndConfirm(false); }, 'Confirm end session')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.errorScale[600],
                    color: tokens.colors.common.white,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  <Check size={ICON_SIZES.label} />
                  Confirm
                </Box>
                <Box
                  onClick={() => setShowEndConfirm(false)}
                  {...clickableProps(() => setShowEndConfirm(false), 'Cancel')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.neutral[100],
                    color: tokens.colors.neutral[700],
                    fontSize: tokens.typography.fontSize.xs,
                    cursor: 'pointer',
                    border: 'none',
                  }}
                >
                  Cancel
                </Box>
              </>
            ) : (
              <Box
                onClick={() => setShowEndConfirm(true)}
                {...clickableProps(() => setShowEndConfirm(true), 'End session')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.errorScale[100],
                  color: tokens.colors.errorScale[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: `1px solid ${tokens.colors.errorScale[200]}`,
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <XCircle size={ICON_SIZES.label} />
                End Session
              </Box>
            )}
          </Box>
        )}
      </Box>
    );

    return (
      <Box style={containerStyle} className={className}>
        {renderHeader()}
        <Box style={mainLayoutStyle}>
          {renderLeftPanel()}
          {renderCenterPanel()}
          {renderRightPanel()}
        </Box>
        {renderBottomBar()}
      </Box>
    );
  }
);
