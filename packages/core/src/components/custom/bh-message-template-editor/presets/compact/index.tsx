'use client';

/**
 * BhMessageTemplateEditor - Compact Preset
 * Condensed template editor for inline or sidebar use.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileEdit, Save, X, Variable,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalitySectionHeaderStyle,
} from '../../../helpers';
import type { BhMessageTemplateEditorProps, TemplateVariable } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_VARIABLES: TemplateVariable[] = [
  { key: 'firstName', label: 'First Name', defaultValue: 'John' },
  { key: 'company', label: 'Company', defaultValue: 'Acme Inc.' },
  { key: 'position', label: 'Position', defaultValue: 'Software Engineer' },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhMessageTemplateEditor = createPreset<BhMessageTemplateEditorProps>({
  name: 'BhMessageTemplateEditor.Compact',
  render: (ctx: PresetContext<BhMessageTemplateEditorProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      templateName = 'New Template',
      subject = 'Exciting opportunity',
      body = 'Hi {{firstName}}, we have a {{position}} role at {{company}}...',
      variables = DEFAULT_VARIABLES,
      onSave,
      onCancel,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

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
            <FileEdit size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Editor
            </Text>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[1] }}>
            <Box
              role="button" tabIndex={0} aria-label="Cancel"
              onClick={() => onCancel?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel?.(); } }}
              style={{ cursor: 'pointer', padding: 2 }}
            >
              <X size={14} color={t.colors.neutral[400]} />
            </Box>
            <Box
              role="button" tabIndex={0} aria-label="Save"
              onClick={() => onSave?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSave?.(); } }}
              style={{ cursor: 'pointer', padding: 2 }}
            >
              <Save size={14} color={t.colors.primaryScale[500]} />
            </Box>
          </Box>
        </Box>

        {/* Compact form */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Name</Text>
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900] }}>{templateName}</Text>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Subject</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{subject}</Text>
          </Box>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>Body</Text>
            <Text style={{
              fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600],
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
              lineHeight: 1.4,
            } as any}>
              {body}
            </Text>
          </Box>

          {/* Variables */}
          <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap', marginTop: t.spacing[1] }}>
            {variables.map(v => (
              <Box key={v.key} style={{
                ...createBadgeStyle(t, 'primary'),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[1]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{`{{${v.key}}}`}</Text>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  },
});
