'use client';

/**
 * BhFantasyLeagueGame - Leaderboard Preset
 * Full leaderboard table, podium visualization, season selector,
 * round breakdown, and prize info.
 */

import { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Star,
  User,
  Users,
  Target,
  TrendingUp,
  Award,
  Zap,
  Crown,
  Gift,
  BarChart3,
  ChevronRight,
  Flame,
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
  FantasyPlayer,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPodiumColor(rank: number, tokens: any): string {
  switch (rank) {
    case 1: return tokens.colors.warningScale[500];
    case 2: return tokens.colors.neutral[400];
    case 3: return tokens.colors.warningScale[700];
    default: return tokens.colors.neutral[400];
  }
}

function getPodiumBg(rank: number, tokens: any): string {
  switch (rank) {
    case 1: return tokens.colors.warningScale[50];
    case 2: return tokens.colors.neutral[100];
    case 3: return tokens.colors.warningScale[50];
    default: return tokens.colors.neutral[50];
  }
}

function getPodiumHeight(rank: number): number {
  switch (rank) {
    case 1: return 120;
    case 2: return 90;
    case 3: return 70;
    default: return 50;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const LeaderboardBhFantasyLeagueGame = createPreset<BhFantasyLeagueGameProps>(
  'LeaderboardBhFantasyLeagueGame',
  ({ primitives: { Box, Text, Button }, props, tokens }: PresetContext<BhFantasyLeagueGameProps>) => {
    const {
      league,
      currentPlayer,
      loading = false,
      onViewPlayer,
      className,
      style,
    } = props;

    const players = league?.players ?? [];

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);

    // Sorted players
    const rankedPlayers = useMemo(
      () => [...players].sort((a, b) => a.rank - b.rank),
      [players]
    );

    // Podium (top 3)
    const podiumPlayers = rankedPlayers.slice(0, 3);
    const remainingPlayers = rankedPlayers.slice(3);

    // Loading
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={{ padding: 24, ...style }} className={className}>
          <Box style={{ ...skeletonStyle, height: 32, width: 200, marginBottom: 24 }} />
          <Box style={{ ...skeletonStyle, height: 180, marginBottom: 24 }} />
          <Box style={{ ...skeletonStyle, height: 400 }} />
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
              Leaderboard
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
              {league?.name ?? 'Fantasy League'} - {league?.season ?? 'Current Season'}
            </Text>
          </Box>
          {currentPlayer && (
            <Box style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[50],
              border: `1px solid ${tokens.colors.primaryScale[200]}`,
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Your Rank:</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                #{currentPlayer.rank}
              </Text>
            </Box>
          )}
        </Box>

        {/* Podium */}
        {podiumPlayers.length >= 3 && (
          <Box style={{ ...cardStyle, marginBottom: 24 }}>
            <Box style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 16,
              paddingTop: 20,
              paddingBottom: 8,
            }}>
              {/* 2nd place */}
              <Box style={{ textAlign: 'center' as const, width: 140 }}>
                <Box style={{
                  width: 56, height: 56, borderRadius: tokens.borderRadius.full,
                  backgroundColor: getPodiumBg(2, tokens),
                  border: `3px solid ${getPodiumColor(2, tokens)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                  overflow: 'hidden',
                }}>
                  {podiumPlayers[1].avatarUrl ? (
                    <img src={podiumPlayers[1].avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={24} style={{ color: getPodiumColor(2, tokens) }} />
                  )}
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  {podiumPlayers[1].name}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {podiumPlayers[1].totalPoints} pts
                </Text>
                <Box style={{
                  width: '100%', height: getPodiumHeight(2),
                  backgroundColor: getPodiumBg(2, tokens),
                  borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
                  marginTop: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Medal size={24} style={{ color: getPodiumColor(2, tokens) }} />
                </Box>
              </Box>

              {/* 1st place */}
              <Box style={{ textAlign: 'center' as const, width: 160 }}>
                <Crown size={24} style={{ color: tokens.colors.warningScale[500], margin: '0 auto 4px' }} />
                <Box style={{
                  width: 64, height: 64, borderRadius: tokens.borderRadius.full,
                  backgroundColor: getPodiumBg(1, tokens),
                  border: `3px solid ${getPodiumColor(1, tokens)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                  overflow: 'hidden',
                }}>
                  {podiumPlayers[0].avatarUrl ? (
                    <img src={podiumPlayers[0].avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={28} style={{ color: getPodiumColor(1, tokens) }} />
                  )}
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                  {podiumPlayers[0].name}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.warningScale[600], fontWeight: tokens.typography.fontWeight.semibold }}>
                  {podiumPlayers[0].totalPoints} pts
                </Text>
                <Box style={{
                  width: '100%', height: getPodiumHeight(1),
                  backgroundColor: getPodiumBg(1, tokens),
                  borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
                  marginTop: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Trophy size={28} style={{ color: getPodiumColor(1, tokens) }} />
                </Box>
              </Box>

              {/* 3rd place */}
              <Box style={{ textAlign: 'center' as const, width: 140 }}>
                <Box style={{
                  width: 52, height: 52, borderRadius: tokens.borderRadius.full,
                  backgroundColor: getPodiumBg(3, tokens),
                  border: `3px solid ${getPodiumColor(3, tokens)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 8px',
                  overflow: 'hidden',
                }}>
                  {podiumPlayers[2].avatarUrl ? (
                    <img src={podiumPlayers[2].avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={22} style={{ color: getPodiumColor(3, tokens) }} />
                  )}
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  {podiumPlayers[2].name}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  {podiumPlayers[2].totalPoints} pts
                </Text>
                <Box style={{
                  width: '100%', height: getPodiumHeight(3),
                  backgroundColor: getPodiumBg(3, tokens),
                  borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
                  marginTop: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Award size={22} style={{ color: getPodiumColor(3, tokens) }} />
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Leaderboard Table */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Users size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
              Full Rankings
            </Text>

            {/* Table Header */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 80px 80px 60px 60px 80px',
              gap: 8,
              padding: '8px 12px',
              backgroundColor: tokens.colors.neutral[100],
              borderRadius: tokens.borderRadius.md,
              marginBottom: 4,
            }}>
              {['#', 'Player', 'Points', 'Accuracy', 'Preds', 'Streak', 'Badges'].map((header) => (
                <Text key={header} style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                }}>
                  {header}
                </Text>
              ))}
            </Box>

            {/* Table Rows */}
            <Box style={{ maxHeight: 400, overflowY: 'auto' }}>
              {rankedPlayers.map((player) => {
                const isCurrentUser = currentPlayer?.id === player.id;
                return (
                  <Box
                    key={player.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '48px 1fr 80px 80px 60px 60px 80px',
                      gap: 8,
                      padding: '10px 12px',
                      backgroundColor: isCurrentUser ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                      border: isCurrentUser ? `1px solid ${tokens.colors.primaryScale[200]}` : `1px solid transparent`,
                      borderRadius: tokens.borderRadius.sm,
                      cursor: onViewPlayer ? 'pointer' : 'default',
                      marginBottom: 2,
                    }}
                    {...(onViewPlayer ? clickableProps(() => onViewPlayer(player.id)) : {})}
                  >
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: player.rank <= 3 ? getPodiumColor(player.rank, tokens) : tokens.colors.neutral[500],
                    }}>
                      {player.rank}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Box style={{
                        width: 28, height: 28, borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0,
                      }}>
                        {player.avatarUrl ? (
                          <img src={player.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={14} style={{ color: tokens.colors.primaryScale[500] }} />
                        )}
                      </Box>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: isCurrentUser ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {player.name}{isCurrentUser ? ' (You)' : ''}
                      </Text>
                    </Box>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.primaryScale[700],
                    }}>
                      {player.totalPoints}
                    </Text>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      color: player.accuracy >= 70 ? tokens.colors.successScale[600] : player.accuracy >= 50 ? tokens.colors.warningScale[600] : tokens.colors.errorScale[600],
                    }}>
                      {player.accuracy}%
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[600] }}>
                      {player.predictions}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {player.streak > 0 && <Flame size={12} style={{ color: tokens.colors.warningScale[500] }} />}
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        color: player.streak > 0 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500],
                        fontWeight: player.streak > 0 ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                      }}>
                        {player.streak}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {player.badges.slice(0, 2).map((badge) => (
                        <Box key={badge} style={{
                          ...createBadgeStyle(tokens, 'warning'),
                          fontSize: 9, padding: '1px 4px',
                        }}>
                          {badge}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Prize Info */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {league?.prizes && league.prizes.length > 0 && (
              <Box style={cardStyle}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Gift size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
                  Prizes
                </Text>
                {league.prizes.map((prize, idx) => (
                  <Box key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: idx === 0 ? tokens.colors.warningScale[50] : tokens.colors.neutral[50],
                    border: `1px solid ${idx === 0 ? tokens.colors.warningScale[200] : tokens.colors.neutral[200]}`,
                    marginBottom: 8,
                  }}>
                    <Box style={{
                      width: 28, height: 28, borderRadius: tokens.borderRadius.full,
                      backgroundColor: idx < 3 ? getPodiumColor(idx + 1, tokens) : tokens.colors.neutral[300],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.bold,
                    }}>
                      {idx + 1}
                    </Box>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[700] }}>
                      {prize}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}

            {/* League Info */}
            <Box style={cardStyle}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <BarChart3 size={ICON_SIZES.section} style={{ color: tokens.colors.infoScale[500] }} />
                League Info
              </Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Season', value: league?.season ?? '-' },
                  { label: 'Round', value: `${league?.currentRound ?? 0}/${league?.totalRounds ?? 0}` },
                  { label: 'Players', value: String(players.length) },
                ].map((item) => (
                  <Box key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                      {item.value}
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);
