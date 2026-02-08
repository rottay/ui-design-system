import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ImportExportPanelProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const Compact = createPreset<ImportExportPanelProps>((context: PresetContext<ImportExportPanelProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Button } = primitives;

  const { mode, onImport, onExport, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  return (
    <Box style={cardStyle} className={className}>
      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
        {mode === 'import' ? 'Import' : 'Export'}
      </Text>

      {mode === 'import' ? (
        <Box>
          <Box
            style={{
              border: `2px dashed ${tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.md,
              padding: tokens.spacing[6],
              textAlign: 'center',
              backgroundColor: tokens.colors.neutral[50],
              marginBottom: tokens.spacing[4],
            }}
          >
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
              Drop file or click to upload
            </Text>
          </Box>
          <Button
            onClick={() => onImport && onImport([])}
            style={{
              width: '100%',
              backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white,
              padding: tokens.spacing[2],
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            Import
          </Button>
        </Box>
      ) : (
        <Button
          onClick={() => onExport && onExport('csv')}
          style={{
            width: '100%',
            backgroundColor: tokens.colors.successScale[500],
            color: tokens.colors.common.white,
            padding: tokens.spacing[2],
            borderRadius: tokens.borderRadius.md,
            border: 'none',
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          Export Data
        </Button>
      )}
    </Box>
  );
});
