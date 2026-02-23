'use client';

/**
 * BhQuestionBankBrowser - Library Preset
 * Full question bank library view with search, filters, sorting,
 * question cards with metadata badges, and bulk actions.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Trash2,
  Download,
  ChevronDown,
  Brain,
  Code2,
  Users,
  Heart,
  BarChart3,
  Hash,
  Tag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Minus,
  Star,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createFilterPillStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createProgressBarStyle,
  createSurfaceStyle,
  createPanelHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  clickableProps,
  listProps,
  listItemProps,
  formatDistanceToNow,
  ICON_SIZES,
} from '../../../helpers';
import type { BhQuestionBankBrowserProps, Question } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type SortOption = 'effectiveness' | 'usageCount' | 'text';

function getDifficultyConfig(difficulty: Question['difficulty']): {
  label: string;
  color: 'success' | 'warning' | 'error';
} {
  switch (difficulty) {
    case 'easy':
      return { label: 'Easy', color: 'success' };
    case 'medium':
      return { label: 'Medium', color: 'warning' };
    case 'hard':
      return { label: 'Hard', color: 'error' };
    default:
      return { label: 'Unknown', color: 'warning' };
  }
}

function getTypeConfig(type: Question['type']): {
  label: string;
  icon: typeof Brain;
} {
  switch (type) {
    case 'behavioral':
      return { label: 'Behavioral', icon: Brain };
    case 'technical':
      return { label: 'Technical', icon: Code2 };
    case 'situational':
      return { label: 'Situational', icon: Users };
    case 'cultural':
      return { label: 'Cultural', icon: Heart };
    default:
      return { label: 'Other', icon: Brain };
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const LibraryBhQuestionBankBrowser = createPreset<BhQuestionBankBrowserProps>(
  'LibraryBhQuestionBankBrowser',
  ({ primitives, props, tokens, ext }: PresetContext<BhQuestionBankBrowserProps>) => {
    const { Box, Text, Button, Input } = primitives;

    const {
      data,
      loading = false,
      onSelectQuestion,
      onCreateQuestion,
      onEditQuestion,
      onDeleteQuestion,
      onFilterChange,
      className,
      style,
    } = props;

    const questions = data?.questions ?? [];
    const dimensions = data?.dimensions ?? [];
    const filters = data?.filters ?? {};

    const [searchValue, setSearchValue] = useState(filters.search ?? '');
    const [activeDimension, setActiveDimension] = useState<string | undefined>(filters.dimension);
    const [activeType, setActiveType] = useState<string | undefined>(filters.type);
    const [activeDifficulty, setActiveDifficulty] = useState<string | undefined>(filters.difficulty);
    const [sortBy, setSortBy] = useState<SortOption>('effectiveness');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showSortMenu, setShowSortMenu] = useState(false);

    const ptypo = getPersonalityTypography(tokens);
    const badgeRadius = getPersonalityBadgeRadius(tokens);
    const cardHover = createCardHoverStyles(tokens);

    // Filter + sort questions
    const filteredQuestions = useMemo(() => {
      let result = [...questions];

      if (searchValue) {
        const lower = searchValue.toLowerCase();
        result = result.filter(
          (q) =>
            q.text.toLowerCase().includes(lower) ||
            q.dimension.toLowerCase().includes(lower) ||
            q.tags.some((t) => t.toLowerCase().includes(lower))
        );
      }

      if (activeDimension) {
        result = result.filter((q) => q.dimension === activeDimension);
      }
      if (activeType) {
        result = result.filter((q) => q.type === activeType);
      }
      if (activeDifficulty) {
        result = result.filter((q) => q.difficulty === activeDifficulty);
      }

      result.sort((a, b) => {
        switch (sortBy) {
          case 'effectiveness':
            return b.effectiveness - a.effectiveness;
          case 'usageCount':
            return b.usageCount - a.usageCount;
          case 'text':
            return a.text.localeCompare(b.text);
          default:
            return 0;
        }
      });

      return result;
    }, [questions, searchValue, activeDimension, activeType, activeDifficulty, sortBy]);

    const handleSearchChange = useCallback(
      (value: string) => {
        setSearchValue(value);
        onFilterChange?.({ ...filters, search: value || undefined });
      },
      [filters, onFilterChange]
    );

    const handleDimensionFilter = useCallback(
      (dim?: string) => {
        setActiveDimension(dim);
        onFilterChange?.({ ...filters, dimension: dim });
      },
      [filters, onFilterChange]
    );

    const handleTypeFilter = useCallback(
      (type?: string) => {
        setActiveType(type);
        onFilterChange?.({ ...filters, type });
      },
      [filters, onFilterChange]
    );

    const handleDifficultyFilter = useCallback(
      (diff?: string) => {
        setActiveDifficulty(diff);
        onFilterChange?.({ ...filters, difficulty: diff });
      },
      [filters, onFilterChange]
    );

    const toggleSelect = useCallback((id: string) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, []);

    const handleBulkDelete = useCallback(() => {
      selectedIds.forEach((id) => onDeleteQuestion?.(id));
      setSelectedIds(new Set());
    }, [selectedIds, onDeleteQuestion]);

    // ========================================================================
    // SKELETON LOADING
    // ========================================================================

    if (loading) {
      const skelStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box className={className} style={{ ...style, padding: tokens.spacing[4] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <Box style={{ ...skelStyle, height: 48, width: '100%' }} />
            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {[1, 2, 3, 4].map((i) => (
                <Box key={i} style={{ ...skelStyle, height: 32, width: 80 }} />
              ))}
            </Box>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} style={{ ...skelStyle, height: 140, width: '100%' }} />
            ))}
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // EMPTY STATE
    // ========================================================================

    if (!questions.length && !loading) {
      return (
        <Box className={className} style={{ ...style, padding: tokens.spacing[4] }}>
          <Box style={createEmptyStateStyle(tokens)}>
            <Brain size={ICON_SIZES.illustration} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[3] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[1] }}>
              No questions yet
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[4] }}>
              Start building your interview question library
            </Text>
            {onCreateQuestion && (
              <Button onClick={onCreateQuestion}>
                <Plus size={ICON_SIZES.section} />
                Create First Question
              </Button>
            )}
          </Box>
        </Box>
      );
    }

    // ========================================================================
    // MAIN RENDER
    // ========================================================================

    const sortOptions: { key: SortOption; label: string }[] = [
      { key: 'effectiveness', label: 'Effectiveness' },
      { key: 'usageCount', label: 'Recently Used' },
      { key: 'text', label: 'Alphabetical' },
    ];

    return (
      <Box className={className} style={{ ...style, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: ptypo.headingWeight, color: tokens.colors.neutral[900], letterSpacing: ptypo.headingLetterSpacing }}>
              Question Library
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: 2 }}>
              {data?.totalCount ?? questions.length} questions available
            </Text>
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            {selectedIds.size > 0 && (
              <>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.primaryScale[600] }}>
                  {selectedIds.size} selected
                </Text>
                <Box
                  style={{
                    ...createBadgeStyle(tokens, 'error'),
                    borderRadius: badgeRadius,
                    cursor: 'pointer',
                    gap: 4,
                  }}
                  onClick={handleBulkDelete}
                  {...clickableProps(handleBulkDelete, 'Delete selected questions')}
                >
                  <Trash2 size={ICON_SIZES.inline} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs }}>Delete</Text>
                </Box>
                <Box
                  style={{
                    ...createBadgeStyle(tokens, 'secondary'),
                    borderRadius: badgeRadius,
                    cursor: 'pointer',
                    gap: 4,
                  }}
                  {...clickableProps(undefined, 'Export selected questions')}
                >
                  <Download size={ICON_SIZES.inline} />
                  <Text style={{ fontSize: tokens.typography.fontSize.xs }}>Export</Text>
                </Box>
              </>
            )}
            {onCreateQuestion && (
              <Button onClick={onCreateQuestion}>
                <Plus size={ICON_SIZES.section} />
                New Question
              </Button>
            )}
          </Box>
        </Box>

        {/* Search Bar */}
        <Box style={{ position: 'relative' as const }}>
          <Search
            size={ICON_SIZES.section}
            style={{
              position: 'absolute' as const,
              left: tokens.spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
              color: tokens.colors.neutral[400],
              pointerEvents: 'none' as const,
            }}
          />
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search questions by text, dimension, or tag..."
            style={{
              paddingLeft: tokens.spacing[8],
              width: '100%',
            }}
          />
        </Box>

        {/* Filter Pills */}
        <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: tokens.spacing[1], alignItems: 'center' }}>
          <Filter size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400], marginRight: tokens.spacing[1] }} />

          {/* Dimension filters */}
          <Box
            style={createFilterPillStyle(tokens, { active: !activeDimension })}
            onClick={() => handleDimensionFilter(undefined)}
            {...clickableProps(() => handleDimensionFilter(undefined), 'Show all dimensions')}
          >
            All Dimensions
          </Box>
          {dimensions.slice(0, 6).map((dim) => (
            <Box
              key={dim}
              style={createFilterPillStyle(tokens, { active: activeDimension === dim })}
              onClick={() => handleDimensionFilter(activeDimension === dim ? undefined : dim)}
              {...clickableProps(() => handleDimensionFilter(activeDimension === dim ? undefined : dim), `Filter by ${dim}`)}
            >
              {dim}
            </Box>
          ))}

          <Box style={{ width: 1, height: 20, backgroundColor: tokens.colors.neutral[200], margin: `0 ${tokens.spacing[1]}px` }} />

          {/* Type filters */}
          {(['behavioral', 'technical', 'situational', 'cultural'] as const).map((t) => {
            const cfg = getTypeConfig(t);
            const Icon = cfg.icon;
            return (
              <Box
                key={t}
                style={{ ...createFilterPillStyle(tokens, { active: activeType === t }), gap: 4 }}
                onClick={() => handleTypeFilter(activeType === t ? undefined : t)}
                {...clickableProps(() => handleTypeFilter(activeType === t ? undefined : t), `Filter by ${cfg.label}`)}
              >
                <Icon size={ICON_SIZES.inline} />
                {cfg.label}
              </Box>
            );
          })}

          <Box style={{ width: 1, height: 20, backgroundColor: tokens.colors.neutral[200], margin: `0 ${tokens.spacing[1]}px` }} />

          {/* Difficulty filters */}
          {(['easy', 'medium', 'hard'] as const).map((d) => {
            const cfg = getDifficultyConfig(d);
            return (
              <Box
                key={d}
                style={createFilterPillStyle(tokens, { active: activeDifficulty === d })}
                onClick={() => handleDifficultyFilter(activeDifficulty === d ? undefined : d)}
                {...clickableProps(() => handleDifficultyFilter(activeDifficulty === d ? undefined : d), `Filter by ${cfg.label}`)}
              >
                {cfg.label}
              </Box>
            );
          })}
        </Box>

        {/* Sort Controls */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            {filteredQuestions.length} result{filteredQuestions.length !== 1 ? 's' : ''}
          </Text>
          <Box style={{ position: 'relative' as const }}>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                transition: `background-color ${tokens.motion.hover}`,
              }}
              onClick={() => setShowSortMenu(!showSortMenu)}
              {...clickableProps(() => setShowSortMenu(!showSortMenu), 'Sort options')}
            >
              <ArrowUpDown size={ICON_SIZES.label} />
              <Text style={{ fontSize: tokens.typography.fontSize.sm }}>
                Sort: {sortOptions.find((o) => o.key === sortBy)?.label}
              </Text>
              <ChevronDown size={ICON_SIZES.inline} />
            </Box>
            {showSortMenu && (
              <Box
                style={{
                  ...createCardStyle(tokens, { elevation: 'lg' }),
                  position: 'absolute' as const,
                  right: 0,
                  top: '100%',
                  marginTop: tokens.spacing[1],
                  zIndex: 10,
                  minWidth: 160,
                  padding: tokens.spacing[1],
                }}
              >
                {sortOptions.map((opt) => (
                  <Box
                    key={opt.key}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      cursor: 'pointer',
                      fontSize: tokens.typography.fontSize.sm,
                      color: sortBy === opt.key ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
                      backgroundColor: sortBy === opt.key ? tokens.colors.primaryScale[50] : 'transparent',
                      transition: `background-color ${tokens.motion.hover}`,
                    }}
                    onClick={() => {
                      setSortBy(opt.key);
                      setShowSortMenu(false);
                    }}
                    {...clickableProps(() => {
                      setSortBy(opt.key);
                      setShowSortMenu(false);
                    }, `Sort by ${opt.label}`)}
                  >
                    {opt.label}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Question Cards List */}
        <Box {...listProps('Question library')} style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
          {filteredQuestions.map((question, index) => {
            const diffCfg = getDifficultyConfig(question.difficulty);
            const typeCfg = getTypeConfig(question.type);
            const TypeIcon = typeCfg.icon;
            const isSelected = selectedIds.has(question.id);
            const entrance = createEntranceAnimation(tokens, { index });
            const effectivenessBar = createProgressBarStyle(tokens, {
              percent: question.effectiveness,
              color: question.effectiveness >= 70
                ? tokens.colors.successScale[500]
                : question.effectiveness >= 40
                  ? tokens.colors.warningScale[500]
                  : tokens.colors.errorScale[500],
            });

            return (
              <Box
                key={question.id}
                {...listItemProps()}
                style={{
                  ...createCardStyle(tokens, { interactive: true }),
                  ...cardHover.base,
                  ...(isSelected
                    ? { borderColor: tokens.colors.primaryScale[300], backgroundColor: tokens.colors.primaryScale[50] }
                    : {}),
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: tokens.spacing[3],
                  ...entrance.initial,
                  animation: entrance.transition !== 'none'
                    ? `entrance ${entrance.transition}`
                    : undefined,
                }}
              >
                {/* Top Row: Selection checkbox + Text + Type Icon */}
                <Box style={{ display: 'flex', gap: tokens.spacing[3], alignItems: 'flex-start' }}>
                  {/* Selection checkbox area */}
                  <Box
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: tokens.borderRadius.sm,
                      border: `2px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                      backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginTop: 2,
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      toggleSelect(question.id);
                    }}
                    {...clickableProps(() => toggleSelect(question.id), 'Select question')}
                  >
                    {isSelected && <CheckCircle2 size={ICON_SIZES.label} style={{ color: tokens.colors.common.white }} />}
                  </Box>

                  {/* Question text */}
                  <Box
                    style={{ flex: 1, cursor: 'pointer' }}
                    onClick={() => onSelectQuestion?.(question.id)}
                    {...clickableProps(() => onSelectQuestion?.(question.id), 'View question details')}
                  >
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                      lineHeight: 1.5,
                    }}>
                      {truncateText(question.text, 180)}
                    </Text>
                  </Box>

                  {/* Type icon */}
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    backgroundColor: tokens.colors.neutral[50],
                    flexShrink: 0,
                  }}>
                    <TypeIcon size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[500] }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                      {typeCfg.label}
                    </Text>
                  </Box>
                </Box>

                {/* Bottom Row: Badges + Metrics */}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: tokens.spacing[2] }}>
                  {/* Left: Badges */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                    {/* Dimension badge */}
                    <Box style={{ ...createBadgeStyle(tokens, 'primary'), borderRadius: badgeRadius }}>
                      {question.dimension}
                    </Box>

                    {/* Difficulty badge */}
                    <Box style={{ ...createBadgeStyle(tokens, diffCfg.color), borderRadius: badgeRadius }}>
                      {diffCfg.label}
                    </Box>

                    {/* Tags */}
                    {question.tags.slice(0, 3).map((tag) => (
                      <Box
                        key={tag}
                        style={{
                          ...createBadgeStyle(tokens, 'secondary'),
                          borderRadius: badgeRadius,
                          gap: 2,
                        }}
                      >
                        <Tag size={ICON_SIZES.inline} />
                        {tag}
                      </Box>
                    ))}
                    {question.tags.length > 3 && (
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        +{question.tags.length - 3}
                      </Text>
                    )}
                  </Box>

                  {/* Right: Metrics */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
                    {/* Effectiveness */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], minWidth: 120 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={ICON_SIZES.label} style={{ color: tokens.colors.warningScale[500] }} />
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                          {question.effectiveness}%
                        </Text>
                      </Box>
                      <Box style={{ ...effectivenessBar.track, flex: 1, minWidth: 60 }}>
                        <Box style={effectivenessBar.fill} />
                      </Box>
                    </Box>

                    {/* Usage count */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Hash size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {question.usageCount} uses
                      </Text>
                    </Box>

                    {/* Time ago */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {formatDistanceToNow(question.updatedAt, { addSuffix: true })}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* No results after filtering */}
        {filteredQuestions.length === 0 && questions.length > 0 && (
          <Box style={createEmptyStateStyle(tokens)}>
            <Search size={ICON_SIZES.hero} style={{ color: tokens.colors.neutral[300], marginBottom: tokens.spacing[2] }} />
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
              No questions match your filters
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
              Try adjusting your search or filter criteria
            </Text>
          </Box>
        )}
      </Box>
    );
  }
);

LibraryBhQuestionBankBrowser.displayName = 'LibraryBhQuestionBankBrowser';
