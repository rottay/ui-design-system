'use client';

/**
 * BhAgentGalleryEnhanced - Compact Preset
 * Dense list view with inline stats and status indicators.
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
  createPersonalitySectionHeaderStyle,
  createStaggerDelay,
  formatDistanceToNow,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhAgentGalleryEnhancedProps, AgentCard } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Search, Bot, Star, TrendingUp, Activity } from 'lucide-react';

function getStatusColor(status: AgentCard['status'], t: DesignTokens) {
  switch (status) {
    case 'active': return { color: t.colors.successScale[600], label: 'Active' };
    case 'draft': return { color: t.colors.warningScale[600], label: 'Draft' };
    case 'archived': return { color: t.colors.neutral[400], label: 'Archived' };
  }
}

export const CompactBhAgentGalleryEnhanced = createPreset<BhAgentGalleryEnhancedProps>({
  name: 'BhAgentGalleryEnhanced.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhAgentGalleryEnhancedProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      agents = [],
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
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    const categories = useMemo(() => {
      if (propCategories && propCategories.length > 0) return propCategories;
      return Array.from(new Set(agents.map(a => a.category)));
    }, [propCategories, agents]);

    const filteredAgents = useMemo(() => {
      return agents.filter(a => {
        if (selectedCategory && a.category !== selectedCategory) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (!a.name.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    }, [agents, selectedCategory, searchQuery]);

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[8], ...style }}>
          <Activity size={20} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[2] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: 0, ...style }}>
        {/* Header with search */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[2],
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[200]}`,
        }}>
          <Search size={14} strokeWidth={1.5} style={{ color: t.colors.neutral[400], flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Search agents"
            style={{
              border: 'none', outline: 'none', backgroundColor: 'transparent', flex: 1,
              fontSize: t.typography.fontSize.xs, color: t.colors.neutral[800], fontFamily: 'inherit',
            }}
          />
          {/* Category filter */}
          {categories.length > 0 && (
            <Box style={{ display: 'flex', gap: t.spacing[1] }}>
              {categories.slice(0, 4).map(cat => (
                <Box
                  key={cat}
                  role="tab"
                  tabIndex={0}
                  aria-selected={selectedCategory === cat}
                  onClick={() => handleCategoryChange(selectedCategory === cat ? null : cat)}
                  style={{
                    padding: `0 ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    fontSize: t.typography.fontSize.xs,
                    color: selectedCategory === cat ? t.colors.primaryScale[700] : t.colors.neutral[500],
                    backgroundColor: selectedCategory === cat ? t.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                    fontWeight: selectedCategory === cat ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                  }}
                >
                  <Text>{cat}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* List */}
        {filteredAgents.length === 0 ? (
          <Box style={{ ...emptyState, padding: `${t.spacing[6]}px ${t.spacing[4]}px` }}>
            <Bot size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No agents found</Text>
          </Box>
        ) : (
          <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
            {filteredAgents.map((agent, index) => {
              const statusInfo = getStatusColor(agent.status, t);
              return (
                <Box
                  key={agent.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Agent: ${agent.name}`}
                  onClick={() => onAgentClick?.(agent.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[3],
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderBottom: index < filteredAgents.length - 1
                      ? `${t.surface.borderWidth} ${t.surface.borderStyle} ${t.colors.neutral[100]}`
                      : 'none',
                    cursor: 'pointer',
                    transition: `background-color ${t.motion.hover}`,
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = t.colors.neutral[50];
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Status dot */}
                  <Box style={{ width: 8, height: 8, borderRadius: t.borderRadius.full, backgroundColor: statusInfo.color, flexShrink: 0 }} />

                  {/* Name + category */}
                  <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm, fontWeight: ptypo.headingWeight,
                      color: t.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const,
                    }}>
                      {agent.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {agent.category}
                    </Text>
                  </Box>

                  {/* Stats */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], flexShrink: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <TrendingUp size={12} strokeWidth={1.5} style={{ color: t.colors.neutral[400] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                        {agent.usageCount.toLocaleString()}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Star size={12} strokeWidth={1.5} style={{ color: t.colors.warningScale[500] }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                        {agent.avgScore.toFixed(1)}
                      </Text>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      {formatDistanceToNow(agent.lastUsed, { addSuffix: true })}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
