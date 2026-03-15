'use client';

/**
 * BhDocumentViewer - Compact Preset
 * Condensed document card with thumbnail and metadata.
 */

import { useMemo } from 'react';
import { FileText, Download, Eye, MessageSquare, ExternalLink } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhDocumentViewerProps, DocumentAnnotation } from '../../core';
import type { DesignTokens } from '../../../../../types';

export const CompactBhDocumentViewer = createPreset<BhDocumentViewerProps>({
  name: 'BhDocumentViewer.Compact',
  render: (ctx: PresetContext<BhDocumentViewerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);

    const {
      documentUrl,
      documentName = 'Resume_Sarah_Johnson.pdf',
      documentType = 'pdf',
      totalPages = 3,
      annotations: rawAnnotations = [],
      onDownload,
      className,
      style,
    } = props;

    const annotations = Array.isArray(rawAnnotations) ? rawAnnotations : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    return (
      <Box
        className={className}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[3],
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
        }}>
          {/* Thumbnail placeholder */}
          <Box style={{
            width: 48,
            height: 60,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: `1px solid ${t.colors.neutral[200]}`,
          }}>
            <FileText size={20} color={t.colors.neutral[400]} />
          </Box>

          {/* Info */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[800],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              marginBottom: t.spacing[1],
            }}>
              {documentName}
            </Text>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={{
                ...createBadgeStyle(t, 'secondary'),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[1]}px`,
              }}>
                <Text style={{ fontSize: 9 }}>{(documentType || '').toUpperCase()}</Text>
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {totalPages} pg
              </Text>
              {annotations.length > 0 && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <MessageSquare size={10} color={t.colors.warningScale[500]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {annotations.length}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Open URL */}
          {documentUrl && (
            <Box
              tabIndex={0}
              role="link"
              aria-label="Open document"
              onClick={() => window.open(documentUrl, '_blank', 'noopener,noreferrer')}
              onKeyDown={(e: any) => { if (e.key === 'Enter') window.open(documentUrl, '_blank', 'noopener,noreferrer'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                cursor: 'pointer',
                flexShrink: 0,
                transition: `all ${t.motion.hover}`,
              }}
            >
              <ExternalLink size={12} color={t.colors.primaryScale[600]} />
            </Box>
          )}

          {/* Download */}
          <Box
            tabIndex={0}
            role="button"
            aria-label="Download"
            onClick={() => onDownload?.()}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDownload?.(); } }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white,
              cursor: 'pointer',
              flexShrink: 0,
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Download size={12} color={t.colors.neutral[600]} />
          </Box>
        </Box>
      </Box>
    );
  },
});
