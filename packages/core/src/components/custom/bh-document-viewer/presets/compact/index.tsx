'use client';

/**
 * BhDocumentViewer - Compact Preset
 * Condensed document card with thumbnail and metadata.
 */

import { useState, useMemo, useEffect } from 'react';
import { FileText, Download, Eye, MessageSquare } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhDocumentViewerProps, DocumentAnnotation } from '../../core';
import type { DesignTokens } from '../../../../../types';

const MOCK_ANNOTATIONS: DocumentAnnotation[] = [
  { id: 'ann-1', page: 1, x: 30, y: 20, text: 'Good experience section' },
  { id: 'ann-2', page: 1, x: 60, y: 45, text: 'Verify credentials' },
];

export const CompactBhDocumentViewer = createPreset<BhDocumentViewerProps>({
  name: 'BhDocumentViewer.Compact',
  render: (ctx: PresetContext<BhDocumentViewerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      documentName = 'Resume_Sarah_Johnson.pdf',
      documentType = 'pdf',
      totalPages = 3,
      annotations: rawAnnotations = MOCK_ANNOTATIONS,
      onDownload,
      className,
      style,
    } = props;

    const annotations = Array.isArray(rawAnnotations) ? rawAnnotations : MOCK_ANNOTATIONS;


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
