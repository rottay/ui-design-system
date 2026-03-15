'use client';

/**
 * ImportExportPanel - Compact Preset
 * Compact card with styled drop zone, format pills, file-type icons,
 * progress visualization, status badges, and loading state.
 */

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ImportExportPanelProps } from '../../core';
import {
  createCardStyle, createAccentBarStyle, createPanelHeaderStyle,
  createBadgeStyle, createProgressBarStyle, createFilterPillStyle,
  createHoverStyle, getCardHoverShadow,
} from '../../../helpers';

const FORMAT_COLOR_MAP: Record<string, 'success' | 'primary' | 'info'> = {
  csv: 'success', json: 'primary', xlsx: 'info',
};

export const Compact = createPreset<ImportExportPanelProps>((context: PresetContext<ImportExportPanelProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Button, Stack, Spinner } = primitives;
  const {
    mode, columns, data, onImport, onExport,
    formats = ['csv', 'json', 'xlsx'], className, style,
  } = props;

  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const [dropHovered, setDropHovered] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>(formats[0] || 'csv');
  const [loading] = useState(false);

  const cardStyle = useMemo(() => createCardStyle(tokens, {
    elevation: 'sm', glass: isGlass, padding: 0,
  }), [tokens, isGlass]);
  const accentBarStyle = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);
  const panelHeaderStyle = useMemo(() => createPanelHeaderStyle(tokens), [tokens]);
  const progressStyles = useMemo(() => createProgressBarStyle(tokens, { percent: 0 }), [tokens]);

  const formatIconStyle = (format: string): React.CSSProperties => {
    const colorKey = FORMAT_COLOR_MAP[format.toLowerCase()] || 'primary';
    const scale = (tokens.colors as any)[`${colorKey}Scale`];
    return {
      width: tokens.spacing[4], height: tokens.spacing[4],
      borderRadius: tokens.borderRadius.full,
      backgroundColor: scale?.[100] || tokens.colors.primaryScale[100],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.bold,
      color: scale?.[700] || tokens.colors.primaryScale[700],
      flexShrink: 0,
    };
  };

  const dropZoneStyle = useMemo<React.CSSProperties>(() => ({
    border: `2px dashed ${dropHovered ? tokens.colors.primaryScale[400] : tokens.colors.neutral[300]}`,
    borderRadius: tokens.borderRadius.md,
    padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
    textAlign: 'center' as const,
    backgroundColor: dropHovered ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
    transition: `all ${tokens.motion.hover}`,
    cursor: 'pointer',
    boxShadow: dropHovered ? tokens.shadows.sm : 'none',
  }), [tokens, dropHovered]);

  const dropIconStyle = useMemo<React.CSSProperties>(() => ({
    width: tokens.spacing[8], height: tokens.spacing[8],
    borderRadius: tokens.borderRadius.full,
    backgroundColor: tokens.colors.primaryScale[100],
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto', marginBottom: tokens.spacing[2],
    color: tokens.colors.primaryScale[500],
    fontSize: tokens.typography.fontSize.xl,
    transition: `transform ${tokens.motion.hover}`,
    transform: dropHovered ? tokens.motion.transform : 'none',
  }), [tokens, dropHovered]);

  const modeBadgeStyle = useMemo(() => {
    return createBadgeStyle(tokens, mode === 'import' ? 'primary' : 'success');
  }, [tokens, mode]);
  const recordCountBadgeStyle = useMemo(() => createBadgeStyle(tokens, 'info'), [tokens]);

  const containerStyle = useMemo<React.CSSProperties>(() => ({
    ...cardStyle, overflow: 'hidden' as const, position: 'relative' as const, ...style,
  }), [cardStyle, style]);

  if (loading) {
    return (
      <Box className={className} style={containerStyle}>
        <Box style={accentBarStyle} />
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
        }}>
          <Spinner size="md" />
        </Box>
      </Box>
    );
  }

  return (
    <Box className={className} style={containerStyle}>
      <Box style={accentBarStyle} />

      {/* Panel header */}
      <Box style={{ ...panelHeaderStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          <Box style={{
            width: tokens.spacing[4], height: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
            backgroundColor: mode === 'import' ? tokens.colors.primaryScale[100] : tokens.colors.successScale[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: tokens.typography.fontSize.xs,
            color: mode === 'import' ? tokens.colors.primaryScale[600] : tokens.colors.successScale[600],
          }}>
            {mode === 'import' ? '\u2191' : '\u2193'}
          </Box>
          <Text style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[800],
          }}>
            {mode === 'import' ? 'Import Data' : 'Export Data'}
          </Text>
        </Box>
        <Box style={modeBadgeStyle}>
          <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
            {mode === 'import' ? 'Upload' : 'Download'}
          </Text>
        </Box>
      </Box>

      {/* Body */}
      <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px` }}>
        <Stack direction="vertical" spacing="sm">
          {/* Format selector pills */}
          {formats.length > 1 && (
            <Box>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1],
              }}>
                Format
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' as const }}>
                {formats.map((fmt) => (
                  <button
                    key={fmt} type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    style={{
                      ...createFilterPillStyle(tokens, { active: selectedFormat === fmt }),
                      display: 'inline-flex', alignItems: 'center',
                      gap: tokens.spacing[1], border: 'none',
                    }}
                  >
                    <Box style={formatIconStyle(fmt)}>{fmt.charAt(0).toUpperCase()}</Box>
                    <span>{fmt.toUpperCase()}</span>
                  </button>
                ))}
              </Box>
            </Box>
          )}

          {/* Record count indicator */}
          {data && data.length > 0 && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
              <Box style={recordCountBadgeStyle}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs }}>
                  {data.length} {data.length === 1 ? 'record' : 'records'} ready
                </Text>
              </Box>
              {columns && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  {columns.length} {columns.length === 1 ? 'column' : 'columns'}
                </Text>
              )}
            </Box>
          )}

          {mode === 'import' ? (
            <>
              <Box
                style={dropZoneStyle}
                onMouseEnter={() => setDropHovered(true)}
                onMouseLeave={() => setDropHovered(false)}
                onClick={() => onImport && onImport([])}
              >
                <Box style={dropIconStyle}>
                  <span aria-hidden="true">{'\u2912'}</span>
                </Box>
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[700], marginBottom: tokens.spacing[1],
                }}>
                  Drop file or click to upload
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  Supports {formats.map((f) => f.toUpperCase()).join(', ')}
                </Text>
              </Box>
              <Box style={progressStyles.track}>
                <Box style={progressStyles.fill} />
              </Box>
            </>
          ) : (
            <Button
              onClick={() => onExport && onExport(selectedFormat)}
              style={{
                width: '100%',
                backgroundColor: tokens.colors.successScale[500],
                color: tokens.colors.common.white,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: tokens.spacing[2],
              }}
            >
              <span aria-hidden="true">{'\u2913'}</span>
              Export as {selectedFormat.toUpperCase()}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
});
