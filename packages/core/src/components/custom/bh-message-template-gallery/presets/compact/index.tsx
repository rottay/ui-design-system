'use client';

/**
 * BhMessageTemplateItemGallery - Compact Preset
 * Condensed template list for sidebar or widget placement.
 */

import { useMemo } from 'react';
import {
  LayoutGrid, Mail, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhMessageTemplateItemGalleryProps, MessageTemplateItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

const CompactBhMessageTemplateItemGallery = createPreset<BhMessageTemplateItemGalleryProps>({
  name: 'BhMessageTemplateGallery.Compact',
  render: (ctx: PresetContext<BhMessageTemplateItemGalleryProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      templates: rawTemplates = [],
      onTemplateClick,
      className,
      style,
    } = props;

    const templates = Array.isArray(rawTemplates) ? rawTemplates : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <LayoutGrid size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Templates
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {templates.length}
          </Text>
        </Box>

        {/* Template list */}
        <Box role="list" aria-label="Message templates">
          {templates.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No templates
              </Text>
            </Box>
          )}
          {templates.map((tmpl) => (
            <Box
              key={tmpl.id}
              role="listitem"
              tabIndex={0}
              aria-label={`${tmpl.name}: ${tmpl.usageCount} uses`}
              onClick={() => onTemplateClick?.((tmpl.id ?? ''))}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTemplateClick?.((tmpl.id ?? '')); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[50]}`,
                cursor: 'pointer',
                backgroundColor: t.colors.common.white,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <Mail size={14} color={t.colors.primaryScale[400]} />
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.neutral[800],
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {tmpl.name ?? ''}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {tmpl.category ?? ''} / {tmpl.usageCount ?? 0} uses
                </Text>
              </Box>
              <ChevronRight size={12} color={t.colors.neutral[300]} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});

// Export with the canonical name (barrel expects this) + legacy alias
export { CompactBhMessageTemplateItemGallery as CompactBhMessageTemplateGallery };
export { CompactBhMessageTemplateItemGallery };
