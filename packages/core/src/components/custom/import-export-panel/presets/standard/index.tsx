'use client';

import React, {useState, useMemo} from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ImportExportPanelProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const Standard = createPreset<ImportExportPanelProps>((context: PresetContext<ImportExportPanelProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Button } = primitives;

  const { mode, columns = [], formats = ['csv', 'json', 'xlsx'], onImport, onExport, className, style } = props;

  const [step, setStep] = useState<'upload' | 'preview' | 'mapping' | 'confirm'>('upload');
  const [selectedFormat, setSelectedFormat] = useState(formats[0]);

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  const renderImportSteps = () => {
    switch (step) {
      case 'upload':
        return (
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
              Step 1: Upload File
            </Text>
            <Box
              style={{
                border: `2px dashed ${tokens.colors.neutral[300]}`,
                borderRadius: tokens.borderRadius.md,
                padding: tokens.spacing[8],
                textAlign: 'center',
                backgroundColor: tokens.colors.neutral[50],
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4] }}>
                Drop file here or click to browse
              </Text>
              <Button
                style={{
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Browse Files
              </Button>
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'flex-end', marginTop: tokens.spacing[6] }}>
              <Button
                onClick={() => setStep('preview')}
                style={{
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );

      case 'preview':
        return (
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
              Step 2: Preview Data
            </Text>
            <Box style={{ border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.md, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                Preview of first 5 rows will appear here
              </Text>
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[6] }}>
              <Button
                onClick={() => setStep('upload')}
                style={{
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[700],
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('mapping')}
                style={{
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );

      case 'mapping':
        return (
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
              Step 3: Map Columns
            </Text>
            {columns.map((col) => (
              <Box key={col.key} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[2] }}>
                <Text style={{ flex: 1, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                  {col.label}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>→</Text>
                <Box style={{ flex: 1 }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                    Auto-mapped field
                  </Text>
                </Box>
              </Box>
            ))}
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[6] }}>
              <Button
                onClick={() => setStep('preview')}
                style={{
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[700],
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => setStep('confirm')}
                style={{
                  backgroundColor: tokens.colors.primaryScale[500],
                  color: tokens.colors.common.white,
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        );

      case 'confirm':
        return (
          <Box>
            <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
              Step 4: Confirm Import
            </Text>
            <Box style={{ border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, borderRadius: tokens.borderRadius.md, padding: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[1] }}>
                Ready to import
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                {columns.length} columns mapped
              </Text>
            </Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: tokens.spacing[6] }}>
              <Button
                onClick={() => setStep('mapping')}
                style={{
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[700],
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                  fontSize: tokens.typography.fontSize.sm,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Back
              </Button>
              <Button
                onClick={() => onImport && onImport([])}
                style={{
                  backgroundColor: tokens.colors.successScale[500],
                  color: tokens.colors.common.white,
                  padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: 'none',
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Confirm Import
              </Button>
            </Box>
          </Box>
        );
    }
  };

  const renderExport = () => (
    <Box>
      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
        Export Data
      </Text>
      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4] }}>
        Select format
      </Text>
      <Box style={{ display: 'flex', gap: tokens.spacing[2], marginBottom: tokens.spacing[6] }}>
        {formats.map((format) => (
          <Button
            key={format}
            onClick={() => setSelectedFormat(format)}
            style={{
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              backgroundColor: selectedFormat === format ? tokens.colors.primaryScale[50] : tokens.colors.neutral[50],
              color: selectedFormat === format ? tokens.colors.primaryScale[700] : tokens.colors.neutral[700],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${selectedFormat === format ? tokens.colors.primaryScale[300] : tokens.colors.neutral[300]}`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            {format.toUpperCase()}
          </Button>
        ))}
      </Box>
      <Button
        onClick={() => onExport && onExport(selectedFormat)}
        style={{
          backgroundColor: tokens.colors.successScale[500],
          color: tokens.colors.common.white,
          padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
          borderRadius: tokens.borderRadius.md,
          border: 'none',
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.medium,
          cursor: 'pointer',
          transition: `all ${tokens.motion.hover}`,
        }}
      >
        Export
      </Button>
    </Box>
  );

  return (
    <Box style={cardStyle} className={className}>
      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[6] }}>
        {mode === 'import' ? 'Import Data' : 'Export Data'}
      </Text>
      {mode === 'import' ? renderImportSteps() : renderExport()}
    </Box>
  );
});
