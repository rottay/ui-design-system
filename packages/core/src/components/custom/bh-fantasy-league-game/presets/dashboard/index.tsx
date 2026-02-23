'use client';

/**
 * BhFantasyLeagueGame - Dashboard Preset
 * Personal stats, prediction history, points chart,
 * achievements/badges, league rules, join/leave actions.
 */

import { useState, useMemo } from 'react';
import {
  BarChart3,
  Star,
  Target,
  TrendingUp,
  Award,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  User,
  Clock,
  BookOpen,
  LogIn,
  LogOut,
  Percent,
  Hash,
  Zap,
  Shield,
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
  BhFantasyLeagueGameProps,
  FantasyPredictionEntry,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const DashboardBhFantasyLeagueGame = createPreset<BhFantasyLeagueGameProps>(
  'DashboardBhFantasyLeagueGame',
  ({ primitives: { Box, Text, Button }, props, tokens }: PresetContext<BhFantasyLeagueGameProps>) => {
    const {
      league,
      currentPlayer,
      predictions = [],
      loading = false,
      onJoinLeague,
      className,
      style,
    } = props;

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);

    // Resolved predictions for history
    const resolvedPredictions = useMemo(
      () => predictions
        .filter((p) => p.resolved)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      [predictions]
    );

    // Points per round (simple aggregation)
    const pointsPerRound = useMemo(() => {
      if (!league || predictions.length === 0) return [];
      const rounds: Record<number, number> = {};
      // Group predictions by approximate round (using index as proxy)
      predictions.forEach((p, idx) => {
        const round = Math.floor(idx / Math.max(1, Math.ceil(predictions.length / (league.totalRounds || 1)))) + 1;
        rounds[round] = (rounds[round] || 0) + p.pointsEarned;
      });
      return Object.entries(rounds).map(([round, points]) => ({
        round: parseInt(round, 10),
        points,
      }));
    }, [predictions, league]);

    const maxRoundPoints = useMemo(
      () => Math.max(1, ...pointsPerRound.map((r) => Math.abs(r.points))),
      [pointsPerRound]
    );

    // Badges from player
    const badges = currentPlayer?.badges ?? [];

    // Loading
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={{ padding: 24, ...style }} className={className}>
          <Box style={{ ...skeletonStyle, height: 32, width: 200, marginBottom: 24 }} />
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, height: 80 }} />
            ))}
          </Box>
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, height: 200 }} />
            ))}
          </Box>
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
              My Dashboard
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
              {league?.name ?? 'Fantasy League'} - {league?.season ?? 'Current Season'}
            </Text>
          </Box>
          {onJoinLeague && !currentPlayer && (
            <Button
              onClick={onJoinLeague}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px',
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontWeight: tokens.typography.fontWeight.bold,
              }}
            >
              <LogIn size={16} />
              Join League
            </Button>
          )}
        </Box>

        {/* Stats Cards */}
        {currentPlayer && (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Points', value: String(currentPlayer.totalPoints), icon: Star, color: tokens.colors.primaryScale },
              { label: 'Rank', value: `#${currentPlayer.rank}`, icon: Trophy, color: tokens.colors.warningScale },
              { label: 'Accuracy', value: `${currentPlayer.accuracy}%`, icon: Target, color: tokens.colors.successScale },
              { label: 'Streak', value: String(currentPlayer.streak), icon: Flame, color: tokens.colors.errorScale },
            ].map((stat, idx) => (
              <Box key={idx} style={cardStyle}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Box style={{
                    width: 36, height: 36, borderRadius: tokens.borderRadius.md,
                    backgroundColor: stat.color[100],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <stat.icon size={18} style={{ color: stat.color[600] }} />
                  </Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    {stat.label}
                  </Text>
                </Box>
                <Text style={{
                  fontSize: numericValue(tokens.typography.fontSize.xl) + 8,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}>
                  {stat.value}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Points Per Round Chart */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <BarChart3 size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
              Points Per Round
            </Text>

            {pointsPerRound.length === 0 ? (
              <Box style={{ ...createEmptyStateStyle(tokens), padding: 32 }}>
                <BarChart3 size={32} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                  No data yet
                </Text>
              </Box>
            ) : (
              <Box style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, padding: '0 8px' }}>
                {pointsPerRound.map((round) => {
                  const height = Math.max(4, (Math.abs(round.points) / maxRoundPoints) * 100);
                  const isPositive = round.points >= 0;
                  return (
                    <Box key={round.round} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <Text style={{ fontSize: 10, color: isPositive ? tokens.colors.successScale[600] : tokens.colors.errorScale[600], fontWeight: tokens.typography.fontWeight.semibold }}>
                        {round.points > 0 ? '+' : ''}{round.points}
                      </Text>
                      <Box style={{
                        width: '100%',
                        maxWidth: 40,
                        height: `${height}%`,
                        backgroundColor: isPositive ? tokens.colors.successScale[400] : tokens.colors.errorScale[400],
                        borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                        minHeight: 4,
                      }} />
                      <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>R{round.round}</Text>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Prediction History */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Clock size={ICON_SIZES.section} style={{ color: tokens.colors.infoScale[500] }} />
              Prediction History
            </Text>

            <Box style={{ maxHeight: 300, overflowY: 'auto' }}>
              {resolvedPredictions.length === 0 ? (
                <Box style={{ ...createEmptyStateStyle(tokens), padding: 32 }}>
                  <Clock size={32} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                    No resolved predictions yet
                  </Text>
                </Box>
              ) : (
                resolvedPredictions.map((pred) => (
                  <Box key={pred.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: pred.correct ? tokens.colors.successScale[50] : tokens.colors.errorScale[50],
                    marginBottom: 6,
                  }}>
                    {pred.correct ? (
                      <CheckCircle2 size={16} style={{ color: tokens.colors.successScale[500] }} />
                    ) : (
                      <XCircle size={16} style={{ color: tokens.colors.errorScale[500] }} />
                    )}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        color: tokens.colors.neutral[700],
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {pred.candidateName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {pred.prediction} at {pred.confidence}x
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: pred.pointsEarned > 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600],
                    }}>
                      {pred.pointsEarned > 0 ? '+' : ''}{pred.pointsEarned}
                    </Text>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          {/* Achievements / Badges */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Award size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
              Achievements
            </Text>

            {badges.length === 0 ? (
              <Box style={{ ...createEmptyStateStyle(tokens), padding: 32 }}>
                <Award size={32} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                  No badges earned yet
                </Text>
              </Box>
            ) : (
              <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                {badges.map((badge) => (
                  <Box key={badge} style={{
                    padding: 12,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.warningScale[50],
                    border: `1px solid ${tokens.colors.warningScale[200]}`,
                    textAlign: 'center' as const,
                  }}>
                    <Shield size={24} style={{ color: tokens.colors.warningScale[500], marginBottom: 4 }} />
                    <Text style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.warningScale[700],
                    }}>
                      {badge}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* League Rules */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <BookOpen size={ICON_SIZES.section} style={{ color: tokens.colors.infoScale[500] }} />
              League Rules
            </Text>

            {league?.rules ? (
              <Box style={{
                padding: 16,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `1px solid ${tokens.colors.neutral[200]}`,
              }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.md,
                  color: tokens.colors.neutral[700],
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap' as const,
                }}>
                  {league.rules}
                </Text>
              </Box>
            ) : (
              <Box style={{ ...createEmptyStateStyle(tokens), padding: 32 }}>
                <BookOpen size={32} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                  No rules defined
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
);
