'use client';

/**
 * BhDraftBoard - Live Preset
 * Real-time draft board with candidate selection, draft grid,
 * team details, timer, and pick feed.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Clock,
  User,
  Users,
  Target,
  Pause,
  PlayCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Search,
  Tag,
  BarChart3,
  Zap,
  TrendingUp,
  DollarSign,
  Star,
  Award,
  Filter,
  AlertTriangle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createProgressBarStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  createDividerStyle,
  createPersonalitySkeletonStyle,
  getPersonalityTypography,
  clickableProps,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhDraftBoardProps,
  DraftCandidate,
  DraftTeam,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getTimerColor(seconds: number, tokens: any): string {
  if (seconds <= 10) return tokens.colors.errorScale[500];
  if (seconds <= 30) return tokens.colors.warningScale[500];
  return tokens.colors.neutral[700];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const LiveBhDraftBoard = createPreset<BhDraftBoardProps>(
  'LiveBhDraftBoard',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhDraftBoardProps>) => {
    const {
      session,
      loading = false,
      onDraftCandidate,
      onStartDraft,
      onPauseDraft,
      className,
      style,
    } = props;

    const teams = session?.teams ?? [];
    const availableCandidates = useMemo(
      () => (session?.availableCandidates ?? []).filter((c) => !c.drafted),
      [session?.availableCandidates]
    );
    const currentRound = session?.currentRound ?? 1;
    const currentPick = session?.currentPick ?? 1;
    const currentTeamId = session?.currentTeamId;
    const timer = session?.timer ?? 0;
    const isPaused = session?.status === 'paused';
    const config = session?.config;

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const tickerRef = useRef<HTMLDivElement>(null);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);

    // Current team
    const currentTeam = useMemo(
      () => teams.find((t) => t.id === currentTeamId),
      [teams, currentTeamId]
    );

    // Selected team for right panel
    const viewTeam = useMemo(
      () => teams.find((t) => t.id === (selectedTeamId ?? currentTeamId)),
      [teams, selectedTeamId, currentTeamId]
    );

    // Filtered candidates
    const filteredCandidates = useMemo(() => {
      let filtered = availableCandidates;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (c) => c.name.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return filtered.sort((a, b) => b.currentScore - a.currentScore);
    }, [availableCandidates, searchQuery]);

    // All picks for ticker (most recent first)
    const allPicks = useMemo(() => {
      return teams
        .flatMap((t) => t.picks.map((p) => ({ ...p, teamName: t.teamName })))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [teams]);

    // Snake direction indicator
    const isSnakeReverse = config?.snakeOrder && currentRound % 2 === 0;

    // Handle draft candidate
    const handleDraft = useCallback(
      (candidateId: string) => {
        if (!onDraftCandidate || !currentTeamId) return;
        onDraftCandidate(candidateId, currentTeamId);
      },
      [onDraftCandidate, currentTeamId]
    );

    // Loading
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={{ padding: 16, ...style }} className={className}>
          <Box style={{ ...skeletonStyle, height: 56, marginBottom: 16 }} />
          <Box style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 16 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, height: 500 }} />
            ))}
          </Box>
        </Box>
      );
    }

    if (!session) {
      return (
        <Box style={{ ...createEmptyStateStyle(tokens), padding: 48, ...style }} className={className}>
          <Target size={48} style={{ color: tokens.colors.neutral[300], marginBottom: 16 }} />
          <Text style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.neutral[500] }}>
            No active draft session
          </Text>
        </Box>
      );
    }

    const timerColor = getTimerColor(timer, tokens);

    return (
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: tokens.colors.neutral[50],
          ...style,
        }}
        className={className}
      >
        {/* TOP BAR */}
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: tokens.colors.common.white,
            borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.sm,
          }}
        >
          {/* Round/Pick */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Box style={{
                backgroundColor: tokens.colors.primaryScale[100],
                color: tokens.colors.primaryScale[700],
                padding: '4px 12px',
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
              }}>
                Round {currentRound}/{config?.rounds ?? '?'}
              </Box>
              <Box style={{
                backgroundColor: tokens.colors.neutral[100],
                color: tokens.colors.neutral[700],
                padding: '4px 12px',
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                Pick #{currentPick}
              </Box>
            </Box>

            {/* Snake direction */}
            {config?.snakeOrder && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 4, color: tokens.colors.neutral[500] }}>
                {isSnakeReverse ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                  {isSnakeReverse ? 'Reverse' : 'Forward'}
                </Text>
              </Box>
            )}
          </Box>

          {/* Current team */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>On the clock:</Text>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                border: `2px solid ${tokens.colors.primaryScale[300]}`,
              }}
            >
              <Box style={{
                width: 28, height: 28, borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[200],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {currentTeam?.avatarUrl ? (
                  <img src={currentTeam.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Users size={14} style={{ color: tokens.colors.primaryScale[600] }} />
                )}
              </Box>
              <Text style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.primaryScale[700],
              }}>
                {currentTeam?.teamName ?? 'Unknown'}
              </Text>
            </Box>
          </Box>

          {/* Timer + Controls */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Box style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: timer <= 10 ? tokens.colors.errorScale[50] : timer <= 30 ? tokens.colors.warningScale[50] : tokens.colors.neutral[50],
              border: `1px solid ${timer <= 10 ? tokens.colors.errorScale[200] : timer <= 30 ? tokens.colors.warningScale[200] : tokens.colors.neutral[200]}`,
            }}>
              <Clock size={16} style={{ color: timerColor }} />
              <Text style={{
                fontSize: numericValue(tokens.typography.fontSize.xl) + 2,
                fontWeight: tokens.typography.fontWeight.bold,
                color: timerColor,
                fontFamily: 'monospace',
              }}>
                {formatTimer(timer)}
              </Text>
            </Box>
            <Button
              onClick={onPauseDraft}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px',
                borderRadius: tokens.borderRadius.md,
                backgroundColor: isPaused ? tokens.colors.successScale[500] : tokens.colors.warningScale[500],
                color: tokens.colors.common.white,
              }}
            >
              {isPaused ? <PlayCircle size={16} /> : <Pause size={16} />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          </Box>
        </Box>

        {/* MAIN CONTENT */}
        <Box style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 0, flex: 1, overflow: 'hidden' }}>
          {/* LEFT: Available Candidates */}
          <Box style={{
            borderRight: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <Box style={{ padding: '12px 16px', borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
                marginBottom: 8,
              }}>
                Available ({availableCandidates.length})
              </Text>
              <Input
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(typeof e === 'string' ? e : e?.target?.value ?? '')}
                placeholder="Search..."
                style={{ width: '100%' }}
              />
            </Box>
            <Box style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
              {filteredCandidates.map((candidate) => (
                <Box
                  key={candidate.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.common.white,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    marginBottom: 8,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Box style={{
                      width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {candidate.avatarUrl ? (
                        <img src={candidate.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={14} style={{ color: tokens.colors.primaryScale[500] }} />
                      )}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {candidate.name}
                      </Text>
                      {candidate.source && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {candidate.source}
                        </Text>
                      )}
                    </Box>
                    <Box style={{
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[700],
                      padding: '2px 8px',
                      borderRadius: tokens.borderRadius.sm,
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                    }}>
                      {candidate.currentScore}
                    </Box>
                  </Box>

                  {/* Top 3 dimension bars */}
                  <Box style={{ marginBottom: 6 }}>
                    {candidate.dimensions.slice(0, 3).map((dim) => (
                      <Box key={dim.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <Text style={{
                          fontSize: 10, color: tokens.colors.neutral[500],
                          width: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {dim.name}
                        </Text>
                        <Box style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: tokens.colors.neutral[100] }}>
                          <Box style={{
                            height: '100%',
                            width: `${Math.min(100, (dim.score / 10) * 100)}%`,
                            borderRadius: 2,
                            backgroundColor: dim.score >= 7 ? tokens.colors.successScale[400] : dim.score >= 5 ? tokens.colors.warningScale[400] : tokens.colors.errorScale[400],
                          }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Tags */}
                  {candidate.tags.length > 0 && (
                    <Box style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                      {candidate.tags.slice(0, 3).map((tag) => (
                        <Box key={tag} style={{
                          ...createBadgeStyle(tokens, 'secondary'),
                          fontSize: 10, padding: '1px 6px',
                        }}>
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Draft Button */}
                  <Button
                    onClick={() => handleDraft(candidate.id)}
                    style={{
                      width: '100%',
                      backgroundColor: tokens.colors.primaryScale[500],
                      color: tokens.colors.common.white,
                      padding: '6px 12px',
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    <Zap size={12} />
                    Draft
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>

          {/* CENTER: Draft Board Grid */}
          <Box style={{ overflow: 'auto', padding: 16 }}>
            <Box style={{
              display: 'grid',
              gridTemplateColumns: `60px repeat(${teams.length}, 1fr)`,
              gap: 2,
              minWidth: teams.length * 140 + 60,
            }}>
              {/* Header row */}
              <Box style={{
                padding: '8px 4px',
                backgroundColor: tokens.colors.neutral[100],
                borderRadius: tokens.borderRadius.sm,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500] }}>
                  Round
                </Text>
              </Box>
              {teams.map((team) => (
                <Box
                  key={team.id}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: team.id === currentTeamId ? tokens.colors.primaryScale[100] : tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.sm,
                    textAlign: 'center' as const,
                    cursor: 'pointer',
                    border: team.id === currentTeamId ? `2px solid ${tokens.colors.primaryScale[400]}` : '2px solid transparent',
                  }}
                  {...clickableProps(() => setSelectedTeamId(team.id))}
                >
                  <Text style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: team.id === currentTeamId ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {team.teamName}
                  </Text>
                  <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>
                    {team.totalScore} pts
                  </Text>
                </Box>
              ))}

              {/* Rows */}
              {Array.from({ length: config?.rounds ?? 1 }, (_, roundIndex) => {
                const round = roundIndex + 1;
                return (
                  <>
                    {/* Round label */}
                    <Box
                      key={`round-${round}`}
                      style={{
                        padding: '8px 4px',
                        backgroundColor: round === currentRound ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        borderRadius: tokens.borderRadius.sm,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: round === currentRound ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
                      }}>
                        {round}
                      </Text>
                    </Box>
                    {/* Team cells */}
                    {teams.map((team) => {
                      const pick = team.picks.find((p) => p.round === round);
                      const isCurrentCell = round === currentRound && team.id === currentTeamId;
                      const allCandidates = session?.availableCandidates ?? [];
                      const draftedCandidate = pick ? allCandidates.find((c) => c.id === pick.candidateId) : null;

                      return (
                        <Box
                          key={`${round}-${team.id}`}
                          style={{
                            padding: 8,
                            borderRadius: tokens.borderRadius.sm,
                            border: isCurrentCell
                              ? `2px solid ${tokens.colors.primaryScale[400]}`
                              : `1px solid ${tokens.colors.neutral[200]}`,
                            backgroundColor: isCurrentCell
                              ? tokens.colors.primaryScale[50]
                              : pick
                              ? tokens.colors.common.white
                              : tokens.colors.neutral[50],
                            minHeight: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: isCurrentCell ? 'pulse 2s infinite' : undefined,
                          }}
                        >
                          {pick ? (
                            <Box style={{ textAlign: 'center' as const, width: '100%' }}>
                              <Text style={{
                                fontSize: tokens.typography.fontSize.xs,
                                fontWeight: tokens.typography.fontWeight.semibold,
                                color: tokens.colors.neutral[800],
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {pick.candidateName}
                              </Text>
                              <Text style={{
                                fontSize: 10,
                                color: tokens.colors.primaryScale[600],
                                fontWeight: tokens.typography.fontWeight.medium,
                              }}>
                                {pick.score} pts
                              </Text>
                            </Box>
                          ) : isCurrentCell ? (
                            <Box style={{
                              width: 8, height: 8, borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.primaryScale[400],
                            }} />
                          ) : null}
                        </Box>
                      );
                    })}
                  </>
                );
              })}
            </Box>

            {/* Pulse animation via inline style tag */}
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
            `}</style>
          </Box>

          {/* RIGHT: Team Detail */}
          <Box style={{
            borderLeft: `1px solid ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {viewTeam ? (
              <>
                <Box style={{
                  padding: '16px',
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <Box style={{
                      width: 40, height: 40, borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden',
                    }}>
                      {viewTeam.avatarUrl ? (
                        <img src={viewTeam.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Users size={18} style={{ color: tokens.colors.primaryScale[500] }} />
                      )}
                    </Box>
                    <Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.neutral[900],
                      }}>
                        {viewTeam.teamName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {viewTeam.managerName}
                      </Text>
                    </Box>
                  </Box>

                  {/* Stats */}
                  <Box style={{ display: 'grid', gridTemplateColumns: config?.auctionMode ? '1fr 1fr 1fr' : '1fr 1fr', gap: 8 }}>
                    <Box style={{
                      padding: 8, borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.primaryScale[50], textAlign: 'center' as const,
                    }}>
                      <Text style={{ fontSize: numericValue(tokens.typography.fontSize.xl) + 2, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                        {viewTeam.totalScore}
                      </Text>
                      <Text style={{ fontSize: 10, color: tokens.colors.primaryScale[500] }}>Total Score</Text>
                    </Box>
                    <Box style={{
                      padding: 8, borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50], textAlign: 'center' as const,
                    }}>
                      <Text style={{ fontSize: numericValue(tokens.typography.fontSize.xl) + 2, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[700] }}>
                        {viewTeam.picks.length}
                      </Text>
                      <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>Picks</Text>
                    </Box>
                    {config?.auctionMode && (
                      <Box style={{
                        padding: 8, borderRadius: tokens.borderRadius.md,
                        backgroundColor: (viewTeam.budgetRemaining ?? 0) < (viewTeam.budget ?? 0) * 0.2
                          ? tokens.colors.warningScale[50]
                          : tokens.colors.successScale[50],
                        textAlign: 'center' as const,
                      }}>
                        <Text style={{
                          fontSize: numericValue(tokens.typography.fontSize.xl) + 2,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: (viewTeam.budgetRemaining ?? 0) < (viewTeam.budget ?? 0) * 0.2
                            ? tokens.colors.warningScale[700]
                            : tokens.colors.successScale[700],
                        }}>
                          ${viewTeam.budgetRemaining ?? 0}
                        </Text>
                        <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>Budget Left</Text>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Picks list */}
                <Box style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
                  <Text style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[700],
                    marginBottom: 8,
                  }}>
                    Picks
                  </Text>
                  {viewTeam.picks.length === 0 ? (
                    <Box style={{ ...createEmptyStateStyle(tokens), padding: 24 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        No picks yet
                      </Text>
                    </Box>
                  ) : (
                    viewTeam.picks.map((pick, idx) => (
                      <Box key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 0',
                        borderBottom: idx < viewTeam.picks.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : undefined,
                      }}>
                        <Box style={{
                          width: 24, height: 24, borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[100],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600],
                          flexShrink: 0,
                        }}>
                          R{pick.round}
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {pick.candidateName}
                          </Text>
                        </Box>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[600],
                        }}>
                          {pick.score}
                        </Text>
                      </Box>
                    ))
                  )}
                </Box>
              </>
            ) : (
              <Box style={{ ...createEmptyStateStyle(tokens), flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={32} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                  Select a team to view details
                </Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* BOTTOM TICKER */}
        <div
          ref={tickerRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '8px 20px',
            backgroundColor: tokens.colors.neutral[900],
            overflowX: 'auto',
            whiteSpace: 'nowrap' as const,
          }}
        >
          <Text style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.primaryScale[400],
            flexShrink: 0,
          }}>
            RECENT PICKS
          </Text>
          {allPicks.length === 0 ? (
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              No picks yet
            </Text>
          ) : (
            allPicks.slice(0, 10).map((pick, idx) => (
              <Box key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <Box style={{
                  width: 4, height: 4, borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[400],
                }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[300] }}>
                  <span style={{ color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.semibold }}>
                    {(pick as any).teamName}
                  </span>
                  {' drafts '}
                  <span style={{ color: tokens.colors.primaryScale[300] }}>{pick.candidateName}</span>
                  {' '}
                  <span style={{ color: tokens.colors.neutral[500] }}>(R{pick.round}, P{pick.pick})</span>
                </Text>
              </Box>
            ))
          )}
        </div>
      </Box>
    );
  }
);
