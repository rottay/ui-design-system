'use client';

/**
 * BhDraftBoard - Setup Preset
 * Draft configuration form: job selector, rounds, time per pick,
 * snake order toggle, auction mode, budget per team.
 * Team setup: add teams with names and managers, reorder, remove.
 * Candidate pool preview and draft order visualization.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Users,
  Settings,
  PlayCircle,
  Clock,
  DollarSign,
  ArrowRightLeft,
  BarChart3,
  User,
  Search,
  Tag,
  Filter,
  Briefcase,
  Zap,
  ListOrdered,
  GripVertical,
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
  createDividerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  clickableProps,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhDraftBoardProps,
  DraftCandidate,
  DraftConfig,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

interface TeamEntry {
  id: string;
  teamName: string;
  managerName: string;
}

let nextTeamId = 1;
function generateTeamId(): string {
  return `team-${nextTeamId++}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const SetupBhDraftBoard = createPreset<BhDraftBoardProps>(
  'SetupBhDraftBoard',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhDraftBoardProps>) => {
    const {
      session,
      loading = false,
      onConfigUpdate,
      onCreateDraft,
      className,
      style,
    } = props;

    const candidates = session?.availableCandidates ?? [];

    // Config state
    const [jobTitle, setJobTitle] = useState(session?.config?.jobTitle ?? '');
    const [jobId, setJobId] = useState(session?.config?.jobId ?? '');
    const [rounds, setRounds] = useState(session?.config?.rounds ?? 3);
    const [timePerPick, setTimePerPick] = useState(session?.config?.timePerPick ?? 60);
    const [snakeOrder, setSnakeOrder] = useState(session?.config?.snakeOrder ?? true);
    const [auctionMode, setAuctionMode] = useState(session?.config?.auctionMode ?? false);
    const [budgetPerTeam, setBudgetPerTeam] = useState(session?.config?.budgetPerTeam ?? 1000);

    // Team state
    const [teams, setTeams] = useState<TeamEntry[]>(
      session?.teams?.map((t) => ({ id: t.id, teamName: t.teamName, managerName: t.managerName })) ?? []
    );
    const [newTeamName, setNewTeamName] = useState('');
    const [newManagerName, setNewManagerName] = useState('');

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSource, setSelectedSource] = useState<string | null>(null);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);

    // Filtered candidates
    const filteredCandidates = useMemo(() => {
      let filtered = candidates;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (c) => c.name.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (selectedSource) {
        filtered = filtered.filter((c) => c.source === selectedSource);
      }
      return filtered.sort((a, b) => b.currentScore - a.currentScore);
    }, [candidates, searchQuery, selectedSource]);

    // Unique sources
    const sources = useMemo(() => {
      const s = new Set(candidates.map((c) => c.source).filter(Boolean) as string[]);
      return Array.from(s);
    }, [candidates]);

    // Handlers
    const handleAddTeam = useCallback(() => {
      if (!newTeamName.trim()) return;
      setTeams((prev) => [
        ...prev,
        { id: generateTeamId(), teamName: newTeamName.trim(), managerName: newManagerName.trim() },
      ]);
      setNewTeamName('');
      setNewManagerName('');
    }, [newTeamName, newManagerName]);

    const handleRemoveTeam = useCallback((teamId: string) => {
      setTeams((prev) => prev.filter((t) => t.id !== teamId));
    }, []);

    const handleMoveTeam = useCallback((index: number, direction: 'up' | 'down') => {
      setTeams((prev) => {
        const next = [...prev];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= next.length) return prev;
        [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
        return next;
      });
    }, []);

    const handleStartDraft = useCallback(() => {
      if (!onCreateDraft || teams.length < 2) return;
      const config: DraftConfig = {
        jobId,
        jobTitle,
        rounds,
        timePerPick,
        snakeOrder,
        auctionMode,
        budgetPerTeam: auctionMode ? budgetPerTeam : undefined,
      };
      onCreateDraft(config, teams.map((t) => ({ teamName: t.teamName, managerName: t.managerName })));
    }, [onCreateDraft, teams, jobId, jobTitle, rounds, timePerPick, snakeOrder, auctionMode, budgetPerTeam]);

    // Draft order preview
    const draftOrder = useMemo(() => {
      if (teams.length === 0) return [];
      const order: Array<{ round: number; pick: number; teamName: string }> = [];
      for (let r = 1; r <= Math.min(rounds, 5); r++) {
        const teamOrder = snakeOrder && r % 2 === 0 ? [...teams].reverse() : teams;
        teamOrder.forEach((team, i) => {
          order.push({ round: r, pick: (r - 1) * teams.length + i + 1, teamName: team.teamName });
        });
      }
      return order;
    }, [teams, rounds, snakeOrder]);

    // Skeleton
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={{ padding: 24, ...style }} className={className}>
          <Box style={{ ...skeletonStyle, height: 32, width: 200, marginBottom: 24 }} />
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
            {[1, 2, 3].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, height: 300 }} />
            ))}
          </Box>
        </Box>
      );
    }

    const cardStyle = createCardStyle(tokens, { elevation: 'sm', padding: 20 });
    const sectionTitleStyle = {
      fontSize: tokens.typography.fontSize.xl,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      marginBottom: 16,
      display: 'flex' as const,
      alignItems: 'center' as const,
      gap: 8,
    };

    const labelStyle = {
      fontSize: tokens.typography.fontSize.md,
      fontWeight: tokens.typography.fontWeight.medium,
      color: tokens.colors.neutral[700],
      marginBottom: 6,
    };

    const inputContainerStyle = { marginBottom: 16 };

    const toggleStyle = (active: boolean) => ({
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      padding: '12px 16px',
      borderRadius: tokens.borderRadius.md,
      backgroundColor: active ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
      border: `1px solid ${active ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
      cursor: 'pointer' as const,
      marginBottom: 12,
      transition: 'all 0.15s ease',
    });

    const toggleDotStyle = (active: boolean) => ({
      width: 36,
      height: 20,
      borderRadius: tokens.borderRadius.full,
      backgroundColor: active ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
      position: 'relative' as const,
      transition: 'all 0.2s ease',
    });

    const toggleKnobStyle = (active: boolean) => ({
      width: 16,
      height: 16,
      borderRadius: tokens.borderRadius.full,
      backgroundColor: tokens.colors.common.white,
      position: 'absolute' as const,
      top: 2,
      left: active ? 18 : 2,
      transition: 'all 0.2s ease',
      boxShadow: tokens.shadows.sm,
    });

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
        <Box style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: numericValue(tokens.typography.fontSize.xl) + 4,
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            marginBottom: 4,
          }}>
            Draft Setup
          </Text>
          <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
            Configure your draft session, add teams, and review the candidate pool.
          </Text>
        </Box>

        {/* Three-column layout */}
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {/* LEFT: Configuration */}
          <Box style={cardStyle}>
            <Text style={sectionTitleStyle}>
              <Settings size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
              Draft Configuration
            </Text>

            <Box style={inputContainerStyle}>
              <Text style={labelStyle}>Job Title</Text>
              <Input
                value={jobTitle}
                onChange={(e: any) => setJobTitle(typeof e === 'string' ? e : e?.target?.value ?? '')}
                placeholder="e.g. Senior Engineer"
                style={{ width: '100%' }}
              />
            </Box>

            <Box style={inputContainerStyle}>
              <Text style={labelStyle}>Rounds</Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Button
                  onClick={() => setRounds((r) => Math.max(1, r - 1))}
                  style={{
                    width: 36, height: 36, padding: 0,
                    borderRadius: tokens.borderRadius.md,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  -
                </Button>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  minWidth: 32,
                  textAlign: 'center' as const,
                }}>
                  {rounds}
                </Text>
                <Button
                  onClick={() => setRounds((r) => Math.min(10, r + 1))}
                  style={{
                    width: 36, height: 36, padding: 0,
                    borderRadius: tokens.borderRadius.md,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </Button>
              </Box>
            </Box>

            <Box style={inputContainerStyle}>
              <Text style={labelStyle}>Time Per Pick (seconds)</Text>
              <Input
                value={String(timePerPick)}
                onChange={(e: any) => {
                  const val = typeof e === 'string' ? e : e?.target?.value ?? '';
                  setTimePerPick(Math.max(10, parseInt(val, 10) || 60));
                }}
                placeholder="60"
                style={{ width: '100%' }}
              />
            </Box>

            {/* Snake Order Toggle */}
            <Box
              style={toggleStyle(snakeOrder)}
              {...clickableProps(() => setSnakeOrder((v) => !v))}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ArrowRightLeft size={ICON_SIZES.label} style={{ color: snakeOrder ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500] }} />
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                    Snake Order
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    Reverse order each round
                  </Text>
                </Box>
              </Box>
              <Box style={toggleDotStyle(snakeOrder)}>
                <Box style={toggleKnobStyle(snakeOrder)} />
              </Box>
            </Box>

            {/* Auction Mode Toggle */}
            <Box
              style={toggleStyle(auctionMode)}
              {...clickableProps(() => setAuctionMode((v) => !v))}
            >
              <Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={ICON_SIZES.label} style={{ color: auctionMode ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500] }} />
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[800] }}>
                    Auction Mode
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    Bid with team budgets
                  </Text>
                </Box>
              </Box>
              <Box style={toggleDotStyle(auctionMode)}>
                <Box style={toggleKnobStyle(auctionMode)} />
              </Box>
            </Box>

            {auctionMode && (
              <Box style={inputContainerStyle}>
                <Text style={labelStyle}>Budget Per Team</Text>
                <Input
                  value={String(budgetPerTeam)}
                  onChange={(e: any) => {
                    const val = typeof e === 'string' ? e : e?.target?.value ?? '';
                    setBudgetPerTeam(Math.max(100, parseInt(val, 10) || 1000));
                  }}
                  placeholder="1000"
                  style={{ width: '100%' }}
                />
              </Box>
            )}
          </Box>

          {/* CENTER: Teams */}
          <Box style={cardStyle}>
            <Text style={sectionTitleStyle}>
              <Users size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
              Teams ({teams.length})
            </Text>

            {/* Add Team Form */}
            <Box style={{
              padding: 12,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.neutral[50],
              border: `1px dashed ${tokens.colors.neutral[300]}`,
              marginBottom: 16,
            }}>
              <Box style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <Input
                  value={newTeamName}
                  onChange={(e: any) => setNewTeamName(typeof e === 'string' ? e : e?.target?.value ?? '')}
                  placeholder="Team name"
                  style={{ flex: 1 }}
                />
                <Input
                  value={newManagerName}
                  onChange={(e: any) => setNewManagerName(typeof e === 'string' ? e : e?.target?.value ?? '')}
                  placeholder="Manager name"
                  style={{ flex: 1 }}
                />
              </Box>
              <Button
                onClick={handleAddTeam}
                style={{
                  width: '100%',
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.md,
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  opacity: newTeamName.trim() ? 1 : 0.5,
                }}
              >
                <Plus size={ICON_SIZES.label} />
                Add Team
              </Button>
            </Box>

            {/* Team List */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {teams.length === 0 ? (
                <Box style={createEmptyStateStyle(tokens)}>
                  <Users size={ICON_SIZES.feature} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                    Add at least 2 teams to start
                  </Text>
                </Box>
              ) : (
                teams.map((team, index) => (
                  <Box
                    key={team.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 12px',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.common.white,
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <GripVertical size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[300], flexShrink: 0 }} />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[800],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {team.teamName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {team.managerName || 'No manager'}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                      <Box
                        style={{
                          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: index > 0 ? 'pointer' : 'default',
                          opacity: index > 0 ? 1 : 0.3,
                          borderRadius: tokens.borderRadius.sm,
                        }}
                        {...(index > 0 ? clickableProps(() => handleMoveTeam(index, 'up')) : {})}
                      >
                        <ChevronUp size={14} style={{ color: tokens.colors.neutral[500] }} />
                      </Box>
                      <Box
                        style={{
                          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: index < teams.length - 1 ? 'pointer' : 'default',
                          opacity: index < teams.length - 1 ? 1 : 0.3,
                          borderRadius: tokens.borderRadius.sm,
                        }}
                        {...(index < teams.length - 1 ? clickableProps(() => handleMoveTeam(index, 'down')) : {})}
                      >
                        <ChevronDown size={14} style={{ color: tokens.colors.neutral[500] }} />
                      </Box>
                      <Box
                        style={{
                          width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          borderRadius: tokens.borderRadius.sm,
                        }}
                        {...clickableProps(() => handleRemoveTeam(team.id))}
                      >
                        <Trash2 size={14} style={{ color: tokens.colors.errorScale[500] }} />
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </Box>

            {/* Draft Order Preview */}
            {draftOrder.length > 0 && (
              <Box style={{ marginTop: 20 }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <ListOrdered size={ICON_SIZES.label} />
                  Draft Order Preview
                </Text>
                <Box style={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  border: `1px solid ${tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                }}>
                  {draftOrder.map((entry, idx) => (
                    <Box
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        backgroundColor: entry.round % 2 === 0 ? tokens.colors.neutral[50] : tokens.colors.common.white,
                        borderBottom: idx < draftOrder.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : undefined,
                        fontSize: tokens.typography.fontSize.xs,
                      }}
                    >
                      <Text style={{
                        width: 24, textAlign: 'center' as const,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[400],
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        {entry.pick}
                      </Text>
                      <Box style={{
                        width: 4, height: 4, borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[400],
                      }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>
                        {entry.teamName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginLeft: 'auto' }}>
                        R{entry.round}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* RIGHT: Candidate Pool */}
          <Box style={cardStyle}>
            <Text style={sectionTitleStyle}>
              <BarChart3 size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
              Candidate Pool ({candidates.length})
            </Text>

            {/* Search */}
            <Box style={{ marginBottom: 12 }}>
              <Input
                value={searchQuery}
                onChange={(e: any) => setSearchQuery(typeof e === 'string' ? e : e?.target?.value ?? '')}
                placeholder="Search candidates..."
                style={{ width: '100%' }}
              />
            </Box>

            {/* Source Filters */}
            {sources.length > 0 && (
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                <Box
                  style={createFilterPillStyle(tokens, { active: !selectedSource })}
                  {...clickableProps(() => setSelectedSource(null))}
                >
                  <Text style={{ fontSize: tokens.typography.fontSize.xs }}>All</Text>
                </Box>
                {sources.map((source) => (
                  <Box
                    key={source}
                    style={createFilterPillStyle(tokens, { active: selectedSource === source })}
                    {...clickableProps(() => setSelectedSource(selectedSource === source ? null : source))}
                  >
                    <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{source}</Text>
                  </Box>
                ))}
              </Box>
            )}

            {/* Candidate List */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {filteredCandidates.length === 0 ? (
                <Box style={createEmptyStateStyle(tokens)}>
                  <Search size={ICON_SIZES.feature} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                    No candidates found
                  </Text>
                </Box>
              ) : (
                filteredCandidates.map((candidate) => (
                  <Box
                    key={candidate.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.common.white,
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    {/* Avatar */}
                    <Box style={{
                      width: 36, height: 36, borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.primaryScale[100],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {candidate.avatarUrl ? (
                        <img
                          src={candidate.avatarUrl}
                          alt={candidate.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <User size={ICON_SIZES.label} style={{ color: tokens.colors.primaryScale[500] }} />
                      )}
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[800],
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {candidate.name}
                      </Text>
                      {candidate.tags.length > 0 && (
                        <Box style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                          {candidate.tags.slice(0, 2).map((tag) => (
                            <Box
                              key={tag}
                              style={{
                                ...createBadgeStyle(tokens, 'secondary'),
                                fontSize: 10,
                                padding: '1px 6px',
                              }}
                            >
                              {tag}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                    {/* Score */}
                    <Box style={{
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[700],
                      padding: '4px 10px',
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      flexShrink: 0,
                    }}>
                      {candidate.currentScore}
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </Box>

        {/* Start Draft Button */}
        <Box style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Button
            onClick={handleStartDraft}
            style={{
              backgroundColor: teams.length >= 2 ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
              color: tokens.colors.common.white,
              padding: '14px 48px',
              borderRadius: tokens.borderRadius.lg,
              fontSize: numericValue(tokens.typography.fontSize.xl),
              fontWeight: tokens.typography.fontWeight.bold,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: teams.length >= 2 ? 'pointer' : 'not-allowed',
              boxShadow: teams.length >= 2 ? tokens.shadows.md : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <PlayCircle size={ICON_SIZES.section} />
            Start Draft
          </Button>
        </Box>
      </Box>
    );
  }
);
