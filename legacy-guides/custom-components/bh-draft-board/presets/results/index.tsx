'use client';

/**
 * BhDraftBoard - Results Preset
 * Final standings, team breakdowns, MVPs, round analysis,
 * export results, and stats.
 */

import { useState, useMemo } from 'react';
import {
  Trophy,
  Award,
  Star,
  Users,
  BarChart3,
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp,
  Target,
  User,
  Medal,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  createDividerStyle,
  getPersonalityTypography,
  clickableProps,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhDraftBoardProps,
  DraftTeam,
  DraftPick,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRankColor(rank: number, tokens: any): string {
  switch (rank) {
    case 1: return tokens.colors.warningScale[500]; // gold
    case 2: return tokens.colors.neutral[400]; // silver
    case 3: return tokens.colors.warningScale[700]; // bronze
    default: return tokens.colors.neutral[500];
  }
}

function getRankBg(rank: number, tokens: any): string {
  switch (rank) {
    case 1: return tokens.colors.warningScale[50];
    case 2: return tokens.colors.neutral[100];
    case 3: return tokens.colors.warningScale[50];
    default: return tokens.colors.neutral[50];
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const ResultsBhDraftBoard = createPreset<BhDraftBoardProps>(
  'ResultsBhDraftBoard',
  ({ primitives: { Box, Text, Button }, props, tokens }: PresetContext<BhDraftBoardProps>) => {
    const {
      session,
      loading = false,
      className,
      style,
    } = props;

    const teams = session?.teams ?? [];
    const config = session?.config;
    const allCandidates = session?.availableCandidates ?? [];

    const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);

    // Ranked teams
    const rankedTeams = useMemo(
      () => [...teams].sort((a, b) => b.totalScore - a.totalScore),
      [teams]
    );

    // All picks sorted by score
    const allPicks = useMemo(() => {
      return teams
        .flatMap((t) => t.picks.map((p) => ({ ...p, teamName: t.teamName, teamId: t.id })))
        .sort((a, b) => b.score - a.score);
    }, [teams]);

    // MVP picks (top 3)
    const mvpPicks = allPicks.slice(0, 3);

    // Stats
    const stats = useMemo(() => {
      if (allPicks.length === 0) return null;
      const avgScore = allPicks.reduce((acc, p) => acc + p.score, 0) / allPicks.length;
      const maxScore = Math.max(...allPicks.map((p) => p.score));
      const minScore = Math.min(...allPicks.map((p) => p.score));

      // Best value = highest score at a late pick
      const bestValue = [...allPicks].sort((a, b) => {
        const aVal = a.score / a.pick;
        const bVal = b.score / b.pick;
        return bVal - aVal;
      })[0];

      // Reach = lowest score at an early pick
      const reachPick = [...allPicks].sort((a, b) => {
        const aVal = a.pick / Math.max(a.score, 1);
        const bVal = b.pick / Math.max(b.score, 1);
        return bVal - aVal;
      })[0];

      return { avgScore, maxScore, minScore, bestValue, reachPick };
    }, [allPicks]);

    // Round-by-round analysis
    const roundAnalysis = useMemo(() => {
      if (!config) return [];
      return Array.from({ length: config.rounds }, (_, i) => {
        const round = i + 1;
        const roundPicks = allPicks.filter((p) => p.round === round);
        const avg = roundPicks.length > 0
          ? roundPicks.reduce((acc, p) => acc + p.score, 0) / roundPicks.length
          : 0;
        const best = roundPicks.length > 0 ? Math.max(...roundPicks.map((p) => p.score)) : 0;
        return { round, pickCount: roundPicks.length, avgScore: avg, bestScore: best };
      });
    }, [allPicks, config]);

    // Loading
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={{ padding: 24, ...style }} className={className}>
          <Box style={{ ...skeletonStyle, height: 32, width: 200, marginBottom: 24 }} />
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, height: 200 }} />
            ))}
          </Box>
        </Box>
      );
    }

    if (!session) {
      return (
        <Box style={{ ...createEmptyStateStyle(tokens), padding: 48, ...style }} className={className}>
          <Trophy size={48} style={{ color: tokens.colors.neutral[300], marginBottom: 16 }} />
          <Text style={{ fontSize: tokens.typography.fontSize.xl, color: tokens.colors.neutral[500] }}>
            No draft results available
          </Text>
        </Box>
      );
    }

    const cardStyle = createCardStyle(tokens, { elevation: 'sm', padding: 20 });

    return (
      <Box
        style={{
          padding: 24,
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          ...style,
        }}
        className={className}
      >
        {/* Header */}
        <Box style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Text style={{
              fontSize: numericValue(tokens.typography.fontSize.xl) + 4,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 4,
            }}>
              Draft Results
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
              {config?.jobTitle} - {config?.rounds} Rounds - {teams.length} Teams
            </Text>
          </Box>
          <Button
            onClick={() => {
              // Export results as JSON (placeholder)
              const data = JSON.stringify({ teams: rankedTeams, config, picks: allPicks }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `draft-results-${session.id}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white,
            }}
          >
            <Download size={16} />
            Export Results
          </Button>
        </Box>

        {/* Stats Row */}
        {stats && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Avg Pick Score', value: stats.avgScore.toFixed(1), icon: BarChart3, color: tokens.colors.primaryScale },
              { label: 'Highest Score', value: String(stats.maxScore), icon: TrendingUp, color: tokens.colors.successScale },
              { label: 'Total Picks', value: String(allPicks.length), icon: Target, color: tokens.colors.infoScale },
              { label: 'Lowest Score', value: String(stats.minScore), icon: ArrowDownRight, color: tokens.colors.warningScale },
            ].map((stat, idx) => (
              <Box key={idx} style={cardStyle}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Box style={{
                    width: 32, height: 32, borderRadius: tokens.borderRadius.md,
                    backgroundColor: stat.color[100],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <stat.icon size={16} style={{ color: stat.color[600] }} />
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {stat.label}
                  </Text>
                </Box>
                <Text style={{
                  fontSize: numericValue(tokens.typography.fontSize.xl) + 6,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}>
                  {stat.value}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Final Standings */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Trophy size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
              Final Standings
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rankedTeams.map((team, idx) => {
                const rank = idx + 1;
                return (
                  <Box
                    key={team.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: getRankBg(rank, tokens),
                      border: rank <= 3 ? `1px solid ${getRankColor(rank, tokens)}30` : `1px solid ${tokens.colors.neutral[200]}`,
                      cursor: 'pointer',
                    }}
                    {...clickableProps(() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id))}
                  >
                    {/* Rank */}
                    <Box style={{
                      width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                      backgroundColor: rank <= 3 ? getRankColor(rank, tokens) : tokens.colors.neutral[300],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      flexShrink: 0,
                    }}>
                      {rank}
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                      }}>
                        {team.teamName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {team.managerName} - {team.picks.length} picks
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: numericValue(tokens.typography.fontSize.xl) + 2,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.primaryScale[700],
                    }}>
                      {team.totalScore}
                    </Text>
                    {expandedTeamId === team.id ? (
                      <ChevronUp size={16} style={{ color: tokens.colors.neutral[400] }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: tokens.colors.neutral[400] }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* MVPs */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Award size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
              MVP Picks
            </Text>

            {mvpPicks.map((pick, idx) => {
              const candidate = allCandidates.find((c) => c.id === pick.candidateId);
              return (
                <Box
                  key={idx}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: idx === 0 ? tokens.colors.warningScale[50] : tokens.colors.neutral[50],
                    border: `1px solid ${idx === 0 ? tokens.colors.warningScale[200] : tokens.colors.neutral[200]}`,
                    marginBottom: 8,
                  }}
                >
                  <Box style={{
                    width: 32, height: 32, borderRadius: tokens.borderRadius.full,
                    backgroundColor: getRankColor(idx + 1, tokens),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {idx === 0 ? (
                      <Star size={16} style={{ color: tokens.colors.common.white }} />
                    ) : (
                      <Medal size={16} style={{ color: tokens.colors.common.white }} />
                    )}
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[800],
                    }}>
                      {pick.candidateName}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      Drafted by {(pick as any).teamName} (R{pick.round}, P{pick.pick})
                    </Text>
                  </Box>
                  <Text style={{
                    fontSize: numericValue(tokens.typography.fontSize.xl) + 4,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.successScale[600],
                  }}>
                    {pick.score}
                  </Text>
                </Box>
              );
            })}

            {/* Best Value & Reach */}
            {stats?.bestValue && (
              <Box style={{ marginTop: 16 }}>
                <Box style={createDividerStyle(tokens)} />
                <Box style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
                }}>
                  <ArrowUpRight size={16} style={{ color: tokens.colors.successScale[500] }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                    <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>Best Value:</span>{' '}
                    {stats.bestValue.candidateName} ({stats.bestValue.score} pts at Pick #{stats.bestValue.pick})
                  </Text>
                </Box>
                {stats.reachPick && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0' }}>
                    <ArrowDownRight size={16} style={{ color: tokens.colors.warningScale[500] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                      <span style={{ fontWeight: tokens.typography.fontWeight.semibold }}>Biggest Reach:</span>{' '}
                      {stats.reachPick.candidateName} ({stats.reachPick.score} pts at Pick #{stats.reachPick.pick})
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Expanded Team Breakdown */}
        {expandedTeamId && (() => {
          const team = rankedTeams.find((t) => t.id === expandedTeamId);
          if (!team) return null;
          return (
            <Box style={{ ...cardStyle, marginBottom: 24 }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                marginBottom: 16,
              }}>
                {team.teamName} - Picks Breakdown
              </Text>
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {team.picks.map((pick, idx) => (
                  <Box key={idx} style={{
                    padding: 12,
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.common.white,
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Box style={{
                        ...createBadgeStyle(tokens, 'primary'),
                        fontSize: 10, padding: '2px 8px',
                      }}>
                        R{pick.round} P{pick.pick}
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.xl,
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: tokens.colors.primaryScale[600],
                      }}>
                        {pick.score}
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[800],
                    }}>
                      {pick.candidateName}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })()}

        {/* Round-by-Round Analysis */}
        <Box style={cardStyle}>
          <Text style={{
            fontSize: tokens.typography.fontSize.xl,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <BarChart3 size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
            Round-by-Round Analysis
          </Text>
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${roundAnalysis.length}, 1fr)`, gap: 8 }}>
            {roundAnalysis.map((round) => (
              <Box key={round.round} style={{
                padding: 12,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.common.white,
                textAlign: 'center' as const,
              }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.primaryScale[600],
                  marginBottom: 8,
                }}>
                  Round {round.round}
                </Text>
                {/* Simple bar */}
                <Box style={{
                  width: '100%', height: 60,
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Box style={{
                    width: '60%',
                    height: `${Math.min(100, (round.avgScore / (stats?.maxScore ?? 1)) * 100)}%`,
                    backgroundColor: tokens.colors.primaryScale[400],
                    borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                    minHeight: 4,
                  }} />
                </Box>
                <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>
                  Avg: {round.avgScore.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 10, color: tokens.colors.neutral[500] }}>
                  Best: {round.bestScore}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
);
