'use client';

/**
 * BhMessageTemplateItemGallery - Gallery Preset
 * Full template gallery with search, category filters, card grid,
 * and usage stats. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  LayoutGrid, Search, Tag, Mail, Clock,
  ChevronRight, Hash, FileText,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
  createPersonalityAccentBar,
} from '../../../helpers';
import type { BhMessageTemplateItemGalleryProps, MessageTemplateItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Gallery Preset                                                     */
/* ================================================================== */

const GalleryBhMessageTemplateItemGallery = createPreset<BhMessageTemplateItemGalleryProps>({
  name: 'BhMessageTemplateGallery.Gallery',
  render: (ctx: PresetContext<BhMessageTemplateItemGalleryProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      templates: rawTemplates = [],
      searchQuery = '',
      selectedCategory,
      onTemplateClick,
      onSearchChange,
      onCategoryChange,
      loading,
      className,
      style,
    } = props;

    const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const categories = useMemo(() => {
      const cats = new Set((templates ?? []).map(t => t.category ?? ''));
      return Array.from(cats).sort();
    }, [templates]);

    const filtered = useMemo(() => {
      let result = templates;
      if (selectedCategory) {
        result = result.filter(t => t.category === selectedCategory);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(t => (t.name ?? '').toLowerCase().includes(q) || (t.subject ?? '').toLowerCase().includes(q) || (t.tags ?? []).some(tag => (tag ?? '').includes(q)));
      }
      return result;
    }, [templates, selectedCategory, searchQuery]);

    const handleClick = useCallback((id: string) => { onTemplateClick?.(id); }, [onTemplateClick]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4], marginBottom: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
              <LayoutGrid size={22} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Message Templates
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                Browse and manage your outreach templates
              </Text>
            </Box>
          </Box>

          {/* Search + filters */}
          <Box style={{ display: 'flex', gap: t.spacing[3], alignItems: 'center' }}>
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              flex: 1, padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white,
            }}>
              <Search size={16} color={t.colors.neutral[400]} />
              <Box
                role="searchbox"
                aria-label="Search templates"
                tabIndex={0}
                style={{ flex: 1, border: 'none', outline: 'none', fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}
              >
                <Text style={{ fontSize: t.typography.fontSize.sm, color: searchQuery ? t.colors.neutral[900] : t.colors.neutral[400] }}>
                  {searchQuery || 'Search templates...'}
                </Text>
              </Box>
            </Box>
            {/* Category pills */}
            <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' }}>
              <Box
                role="button"
                tabIndex={0}
                aria-label="All categories"
                aria-pressed={!selectedCategory}
                onClick={() => onCategoryChange?.(null)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCategoryChange?.(null); } }}
                style={{
                  padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                  borderRadius: badgeRadius,
                  backgroundColor: !selectedCategory ? t.colors.primaryScale[50] : t.colors.neutral[100],
                  color: !selectedCategory ? t.colors.primaryScale[700] : t.colors.neutral[600],
                  cursor: 'pointer', fontSize: t.typography.fontSize.xs,
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>All</Text>
              </Box>
              {categories.map(cat => (
                <Box
                  key={cat}
                  role="button"
                  tabIndex={0}
                  aria-label={`Filter by ${cat}`}
                  aria-pressed={selectedCategory === cat}
                  onClick={() => onCategoryChange?.(cat)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCategoryChange?.(cat); } }}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    backgroundColor: selectedCategory === cat ? t.colors.primaryScale[50] : t.colors.neutral[100],
                    color: selectedCategory === cat ? t.colors.primaryScale[700] : t.colors.neutral[600],
                    cursor: 'pointer', fontSize: t.typography.fontSize.xs,
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{cat}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {filtered.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <FileText size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No templates found
              </Text>
            </Box>
          )}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: t.spacing[4] }}>
            {filtered.map((tmpl, i) => {
              const isHovered = hoveredId === tmpl.id;
              return (
                <Box
                  key={tmpl.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Template: ${tmpl.name}, Category: ${tmpl.category}, Used ${tmpl.usageCount} times`}
                  onClick={() => handleClick((tmpl.id ?? ''))}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick((tmpl.id ?? '')); } }}
                  onMouseEnter={() => setHoveredId((tmpl.id ?? null))}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    ...card,
                    ...hoverStyles.base,
                    ...(isHovered ? hoverStyles.hover : {}),
                    ...animStyle(i),
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Template header */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Mail size={16} color={t.colors.primaryScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                        {tmpl.name}
                      </Text>
                    </Box>
                    <Box style={{
                      ...createBadgeStyle(t, 'secondary'),
                      borderRadius: badgeRadius,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{tmpl.category}</Text>
                    </Box>
                  </Box>

                  {/* Subject */}
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[600],
                    marginBottom: t.spacing[1],
                    fontWeight: t.typography.fontWeight.medium,
                  }}>
                    {tmpl.subject}
                  </Text>

                  {/* Preview */}
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[400],
                    marginBottom: t.spacing[3],
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                    lineHeight: 1.5,
                    flex: 1,
                  }}>
                    {tmpl.preview}
                  </Text>

                  {/* Footer: tags + usage */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' }}>
                      {(tmpl.tags ?? []).slice(0, 2).map(tag => (
                        <Box key={tag} style={{
                          padding: `0 ${t.spacing[1]}px`,
                          borderRadius: t.borderRadius.sm,
                          backgroundColor: t.colors.neutral[100],
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>#{tag}</Text>
                        </Box>
                      ))}
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {tmpl.usageCount ?? 0} uses
                      </Text>
                      {tmpl.lastUsed && (
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>
                          {formatDistanceToNow(tmpl.lastUsed, { addSuffix: true })}
                        </Text>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});

// Export with the canonical name (barrel expects this) + legacy alias
export { GalleryBhMessageTemplateItemGallery as GalleryBhMessageTemplateGallery };
export { GalleryBhMessageTemplateItemGallery };
