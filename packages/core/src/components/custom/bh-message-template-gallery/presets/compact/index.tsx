'use client';

/**
 * BhMessageTemplateItemGallery - Compact Preset
 * Condensed template list for sidebar or widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
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
} from '../../../helpers';
import type { BhMessageTemplateItemGalleryProps, MessageTemplateItem } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_TEMPLATES: MessageTemplateItem[] = [
  { id: 'mt-1', name: 'Initial Outreach', category: 'Sourcing', subject: 'Exciting opportunity', preview: 'Hi {{firstName}}...', usageCount: 342, tags: ['sourcing'] },
  { id: 'mt-2', name: 'Interview Invitation', category: 'Scheduling', subject: 'Interview invitation', preview: 'Dear {{firstName}}...', usageCount: 256, tags: ['scheduling'] },
  { id: 'mt-3', name: 'Rejection', category: 'Rejection', subject: 'Application update', preview: 'Dear {{firstName}}...', usageCount: 189, tags: ['rejection'] },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

const CompactBhMessageTemplateItemGallery = createPreset<BhMessageTemplateItemGalleryProps>({
  name: 'BhMessageTemplateGallery.Compact',
  render: (ctx: PresetContext<BhMessageTemplateItemGalleryProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      templates = MOCK_TEMPLATES,
      onTemplateClick,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
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
