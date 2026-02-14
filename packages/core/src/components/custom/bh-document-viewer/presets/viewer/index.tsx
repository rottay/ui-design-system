'use client';

/**
 * BhDocumentViewer - Viewer Preset
 * Full document viewer with page navigation, zoom controls,
 * annotation markers, and download. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText, Download, ZoomIn, ZoomOut,
  ChevronLeft, ChevronRight, MessageSquare,
  Highlighter, StickyNote, Eye,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhDocumentViewerProps, DocumentAnnotation } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ANNOTATIONS: DocumentAnnotation[] = [
  { id: 'ann-1', page: 1, x: 30, y: 20, text: 'Strong leadership experience', color: undefined },
  { id: 'ann-2', page: 1, x: 60, y: 45, text: 'Check references for this claim' },
  { id: 'ann-3', page: 2, x: 40, y: 30, text: 'Relevant project experience' },
];

/* ================================================================== */
/*  Viewer Preset                                                      */
/* ================================================================== */

export const ViewerBhDocumentViewer = createPreset<BhDocumentViewerProps>({
  name: 'BhDocumentViewer.Viewer',
  render: (ctx: PresetContext<BhDocumentViewerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      documentName = 'Resume_Sarah_Johnson.pdf',
      documentType = 'pdf',
      totalPages = 3,
      currentPage: propPage = 1,
      annotations = MOCK_ANNOTATIONS,
      onPageChange,
      onAnnotationClick,
      onDownload,
      zoom: propZoom = 1,
      className,
      style,
    } = props;

    const [page, setPage] = useState(propPage);
    const [zoom, setZoom] = useState(propZoom);
    const [activeTool, setActiveTool] = useState<'select' | 'highlight' | 'note'>('select');

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const pageAnnotations = useMemo(
      () => annotations.filter(a => a.page === page),
      [annotations, page],
    );

    const handlePageChange = useCallback((newPage: number) => {
      const clamped = Math.max(1, Math.min(newPage, totalPages));
      setPage(clamped);
      onPageChange?.(clamped);
    }, [totalPages, onPageChange]);

    const handleZoom = useCallback((delta: number) => {
      setZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
    }, []);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const toolBtnStyle = useCallback((tool: string) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: t.borderRadius.md,
      border: `1px solid ${activeTool === tool ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
      backgroundColor: activeTool === tool ? t.colors.primaryScale[50] : t.colors.common.white,
      cursor: 'pointer',
      transition: `all ${t.motion.hover}`,
    }), [activeTool, t]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          ...accentLayout.outer,
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={{ ...accentLayout.inner, display: 'flex', flexDirection: 'column' as const, flex: 1 }}>
        {/* Toolbar */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[50] })}>
              <FileText size={16} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
              }}>
                {documentName}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {(documentType || '').toUpperCase()} - {totalPages} page{totalPages > 1 ? 's' : ''}
              </Text>
            </Box>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            {/* Annotation tools */}
            <Box style={{ display: 'flex', gap: t.spacing[1], marginRight: t.spacing[2] }}>
              <Box
                tabIndex={0}
                role="button"
                aria-label="Select tool"
                aria-pressed={activeTool === 'select'}
                onClick={() => setActiveTool('select')}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTool('select'); } }}
                style={toolBtnStyle('select')}
              >
                <Eye size={14} color={activeTool === 'select' ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
              </Box>
              <Box
                tabIndex={0}
                role="button"
                aria-label="Highlight tool"
                aria-pressed={activeTool === 'highlight'}
                onClick={() => setActiveTool('highlight')}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTool('highlight'); } }}
                style={toolBtnStyle('highlight')}
              >
                <Highlighter size={14} color={activeTool === 'highlight' ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
              </Box>
              <Box
                tabIndex={0}
                role="button"
                aria-label="Note tool"
                aria-pressed={activeTool === 'note'}
                onClick={() => setActiveTool('note')}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveTool('note'); } }}
                style={toolBtnStyle('note')}
              >
                <StickyNote size={14} color={activeTool === 'note' ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
              </Box>
            </Box>

            {/* Zoom */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box
                tabIndex={0}
                role="button"
                aria-label="Zoom out"
                onClick={() => handleZoom(-0.1)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoom(-0.1); } }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white, cursor: 'pointer',
                }}
              >
                <ZoomOut size={12} color={t.colors.neutral[600]} />
              </Box>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], width: 36, textAlign: 'center' }}>
                {Math.round(zoom * 100)}%
              </Text>
              <Box
                tabIndex={0}
                role="button"
                aria-label="Zoom in"
                onClick={() => handleZoom(0.1)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleZoom(0.1); } }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 28, height: 28, borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white, cursor: 'pointer',
                }}
              >
                <ZoomIn size={12} color={t.colors.neutral[600]} />
              </Box>
            </Box>

            {/* Download */}
            <Box
              tabIndex={0}
              role="button"
              aria-label="Download document"
              onClick={() => onDownload?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDownload?.(); } }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white, cursor: 'pointer',
                marginLeft: t.spacing[1],
              }}
            >
              <Download size={12} color={t.colors.neutral[600]} />
            </Box>
          </Box>
        </Box>

        {/* Document viewport */}
        <Box style={{
          flex: 1,
          minHeight: 400,
          backgroundColor: t.colors.neutral[200],
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: t.spacing[6],
          position: 'relative',
          overflow: 'auto',
        }}>
          {/* Document placeholder */}
          <Box style={{
            width: `${480 * zoom}px`,
            height: `${640 * zoom}px`,
            backgroundColor: t.colors.common.white,
            borderRadius: t.borderRadius.md,
            boxShadow: t.shadows.lg,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `width ${t.motion.hover}, height ${t.motion.hover}`,
          }} role="document" aria-label={`${documentName} page ${page}`}>
            <FileText size={48} color={t.colors.neutral[200]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              {documentName}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300]}}>
              Page {page} of {totalPages}
            </Text>

            {/* Annotation markers */}
            {pageAnnotations.map((ann) => (
              <Box
                key={ann.id}
                tabIndex={0}
                role="button"
                aria-label={`Annotation: ${ann.text}`}
                onClick={() => onAnnotationClick?.((ann.id ?? ''))}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAnnotationClick?.((ann.id ?? '')); } }}
                style={{
                  position: 'absolute',
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  width: 24,
                  height: 24,
                  borderRadius: t.borderRadius.full,
                  backgroundColor: ann.color ?? t.colors.warningScale[400],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: t.shadows.md,
                  transition: `transform ${t.motion.hover}`,
                }}
              >
                <MessageSquare size={12} color={t.colors.common.white} />
              </Box>
            ))}
          </Box>
        </Box>

        {/* Page navigation */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{
            ...createBadgeStyle(t, 'info'),
            borderRadius: badgeRadius,
          }}>
            <MessageSquare size={10} style={{ marginRight: 3 }} />
            <Text style={{ fontSize: t.typography.fontSize.xs }}>
              {pageAnnotations.length} annotation{pageAnnotations.length !== 1 ? 's' : ''}
            </Text>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box
              tabIndex={0}
              role="button"
              aria-label="Previous page"
              onClick={() => handlePageChange(page - 1)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePageChange(page - 1); } }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: page <= 1 ? t.colors.neutral[100] : t.colors.common.white,
                cursor: page <= 1 ? 'default' : 'pointer',
                opacity: page <= 1 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={14} color={t.colors.neutral[600]} />
            </Box>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
              {page} / {totalPages}
            </Text>
            <Box
              tabIndex={0}
              role="button"
              aria-label="Next page"
              onClick={() => handlePageChange(page + 1)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePageChange(page + 1); } }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 28, height: 28, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: page >= totalPages ? t.colors.neutral[100] : t.colors.common.white,
                cursor: page >= totalPages ? 'default' : 'pointer',
                opacity: page >= totalPages ? 0.5 : 1,
              }}
            >
              <ChevronRight size={14} color={t.colors.neutral[600]} />
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
