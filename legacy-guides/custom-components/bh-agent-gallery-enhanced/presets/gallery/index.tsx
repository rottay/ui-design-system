'use client';

/**
 * BhAgentGalleryEnhanced - Gallery Preset
 * Card grid with search bar, category tabs, usage stats, score, and status per card.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createStaggerDelay,
  formatDistanceToNow,
  createEmptyStateStyle,
  createProgressBarStyle,
  createPersonalityAccentBar,

  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhAgentGalleryEnhancedProps, AgentCard } from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Search,
  Bot,
  Star,
  Activity,
  Archive,
  FileEdit,
  TrendingUp,
  Tag,
} from 'lucide-react';

function getStatusColor(status: AgentCard['status'], t: DesignTokens) {
  switch (status) {
    case 'active': return { bg: t.colors.successScale[100], color: t.colors.successScale[700], label: 'Active' };
    case 'draft': return { bg: t.colors.warningScale[100], color: t.colors.warningScale[700], label: 'Draft' };
    case 'archived': return { bg: t.colors.neutral[100], color: t.colors.neutral[500], label: 'Archived' };
  }
}

export const GalleryBhAgentGalleryEnhanced = createPreset<BhAgentGalleryEnhancedProps>({
  name: 'BhAgentGalleryEnhanced.Gallery',
  render: ({ primitives, props, tokens }: PresetContext<BhAgentGalleryEnhancedProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      agents: rawAgents = [],
      categories: propCategories,
      searchQuery: controlledSearch,
      selectedCategory: controlledCategory,
      onAgentClick,
      onSearchChange,
      onCategoryChange,
      loading = false,
      className,
      style,
    } = props;

    const agents = Array.isArray(rawAgents) ? rawAgents : [];

    const [localSearch, setLocalSearch] = useState('');
    const [localCategory, setLocalCategory] = useState<string | null>(null);

    const searchQuery = controlledSearch ?? localSearch;
    const selectedCategory = controlledCategory ?? localCategory;

    const handleSearchChange = useCallback((q: string) => {
      onSearchChange?.(q);
      if (controlledSearch === undefined) setLocalSearch(q);
    }, [onSearchChange, controlledSearch]);

    const handleCategoryChange = useCallback((c: string | null) => {
      onCategoryChange?.(c);
      if (controlledCategory === undefined) setLocalCategory(c);
    }, [onCategoryChange, controlledCategory]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const categories = useMemo(() => {
      if (propCategories && propCategories.length > 0) return propCategories;
      return Array.from(new Set(agents.map(a => a.category)));
    }, [propCategories, agents]);

    const filteredAgents = useMemo(() => {
      return agents.filter(a => {
        if (selectedCategory && a.category !== selectedCategory) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (
            !a.name.toLowerCase().includes(q) &&
            !a.description.toLowerCase().includes(q) &&
            !a.tags.some(tag => tag.toLowerCase().includes(q))
          ) return false;
        }
        return true;
      });
    }, [agents, selectedCategory, searchQuery]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading agents...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[5], ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Search Bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3],
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderRadius: t.borderRadius.lg,
          border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
          backgroundColor: isGlass && t.glass ? t.glass.bg : t.colors.common.white,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur } : {}),
        }}>
          <Search size={18} strokeWidth={1.5} style={{ color: t.colors.neutral[400], flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search agents by name, description, or tag..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search agents"
            style={{
              border: 'none', outline: 'none', backgroundColor: 'transparent', flex: 1,
              fontSize: t.typography.fontSize.sm, color: t.colors.neutral[800], fontFamily: 'inherit',
            }}
          />
        </Box>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' as const }}>
            <Box
              role="tab"
              tabIndex={0}
              aria-selected={selectedCategory === null}
              onClick={() => handleCategoryChange(null)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryChange(null); } }}
              style={{
                padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.sm,
                fontWeight: selectedCategory === null ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                color: selectedCategory === null ? t.colors.primaryScale[700] : t.colors.neutral[600],
                backgroundColor: selectedCategory === null ? t.colors.primaryScale[50] : t.colors.neutral[100],
                border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${selectedCategory === null ? t.colors.primaryScale[200] : 'transparent'}`,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Text>All</Text>
            </Box>
            {categories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <Box
                  key={cat}
                  role="tab"
                  tabIndex={0}
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(cat)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCategoryChange(cat); } }}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    borderRadius: badgeRadius,
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                    color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[600],
                    backgroundColor: isActive ? t.colors.primaryScale[50] : t.colors.neutral[100],
                    border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${isActive ? t.colors.primaryScale[200] : 'transparent'}`,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text>{cat}</Text>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Results count */}
        <Text style={{ ...sectionLabel, marginBottom: 0 }}>
          {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''}
        </Text>

        {/* Agent Cards Grid */}
        {filteredAgents.length === 0 ? (
          <Box style={emptyState}>
            <Bot size={48} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[3] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], display: 'block', marginBottom: t.spacing[2] }}>
              No agents found
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              Try adjusting your search or filters
            </Text>
          </Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: t.spacing[4] }}>
            {filteredAgents.map((agent, index) => {
              const statusInfo = getStatusColor(agent.status, t);
              const staggerDelay = createStaggerDelay(t, index);
              const scorePercent = Math.min(100, Math.max(0, agent.avgScore * 10));
              const scoreBar = createProgressBarStyle(t, { percent: scorePercent });

              return (
                <Box
                  key={agent.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Agent: ${agent.name}`}
                  onClick={() => onAgentClick?.(agent.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAgentClick?.(agent.id); } }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    Object.assign(e.currentTarget.style, hoverStyles.hover);
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = t.shadows.sm;
                    e.currentTarget.style.backgroundColor = isGlass && t.glass ? t.glass.bg : t.colors.common.white;
                  }}
                  style={{
                    ...cardBase,
                    ...hoverStyles.base,
                    padding: t.spacing[4],
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: t.spacing[3],
                    ...entrance.animate,
                    transition: entrance.transition,
                    transitionDelay: `${staggerDelay}ms`,
                  }}
                >
                  {/* Header: Icon + Name + Status */}
                  <Box style={{ display: 'flex', alignItems: 'flex-start', gap: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                      <Bot size={20} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.md, fontWeight: ptypo.headingWeight,
                        letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900],
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                      }}>
                        {agent.name}
                      </Text>
                      <Box style={{
                        display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                        padding: `0 ${t.spacing[2]}px`, borderRadius: badgeRadius,
                        backgroundColor: statusInfo.bg, marginTop: t.spacing[1],
                      }}>
                        <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: statusInfo.color }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: statusInfo.color, fontWeight: t.typography.fontWeight.medium }}>
                          {statusInfo.label}
                        </Text>
                      </Box>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Text style={{
                    fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600],
                    lineHeight: t.typography.lineHeight.relaxed,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
                  }}>
                    {agent.description}
                  </Text>

                  {/* Stats Row */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <TrendingUp size={14} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>
                        {(agent.usageCount ?? 0).toLocaleString()} uses
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Star size={14} strokeWidth={1.5} style={{ color: t.colors.warningScale[500] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>
                        {(agent.avgScore ?? 0).toFixed(1)}
                      </Text>
                    </Box>
                  </Box>

                  {/* Score Bar */}
                  <Box>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Avg Score</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.semibold }}>
                        {(agent.avgScore ?? 0).toFixed(1)}/10
                      </Text>
                    </Box>
                    <Box style={scoreBar.track}>
                      <Box style={scoreBar.fill} />
                    </Box>
                  </Box>

                  {/* Tags */}
                  {agent.tags.length > 0 && (
                    <Box style={{ display: 'flex', flexWrap: 'wrap' as const, gap: t.spacing[1] }}>
                      {agent.tags.slice(0, 3).map(tag => (
                        <Box key={tag} style={{
                          ...createBadgeStyle(t, 'secondary'),
                          borderRadius: badgeRadius,
                          fontSize: t.typography.fontSize.xs,
                          padding: `0 ${t.spacing[2]}px`,
                        }}>
                          <Tag size={10} strokeWidth={1.5} style={{ marginRight: t.spacing[1] }} />
                          <Text>{tag}</Text>
                        </Box>
                      ))}
                      {agent.tags.length > 3 && (
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          +{agent.tags.length - 3}
                        </Text>
                      )}
                    </Box>
                  )}

                  {/* Last used */}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    Last used {formatDistanceToNow(agent.lastUsed, { addSuffix: true })}
                  </Text>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
