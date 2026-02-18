'use client';

/**
 * BhMessageTemplateEditor - Editor Preset
 * Full template editor with field inputs, variable chips,
 * and body textarea with variable highlighting. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileEdit, Save, X, Variable, Tag,
  Type, AlignLeft, AtSign, Globe,
  Share2, ShieldCheck, Hash, Target, Layers,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createBooleanBadgeStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createMetadataFieldStyle,
  createMetadataLabelStyle,
  createMetadataValueStyle,
  createMetadataGridStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  ICON_SIZES,
} from '../../../helpers';
import type { BhMessageTemplateEditorProps, TemplateVariable } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Editor Preset                                                      */
/* ================================================================== */

export const EditorBhMessageTemplateEditor = createPreset<BhMessageTemplateEditorProps>({
  name: 'BhMessageTemplateEditor.Editor',
  render: (ctx: PresetContext<BhMessageTemplateEditorProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      templateName = 'New Template',
      subject = 'Exciting opportunity at {{company}}',
      body = 'Hi {{firstName}},\n\nI came across your profile and was impressed by your experience. We have an exciting {{position}} role at {{company}} that I think would be a great fit.\n\nWould you be open to a brief conversation?\n\nBest regards,\n{{recruiterName}}',
      variables: rawVariables = [],
      category = 'Sourcing',
      onNameChange,
      onSubjectChange,
      onBodyChange,
      onSave,
      onCancel,
      templateType,
      targetAudience,
      useCase,
      language,
      isShared,
      requiresApproval,
      version,
      plainTextBody,
      loading,
      className,
      style,
    } = props;

    const variables = Array.isArray(rawVariables) ? rawVariables : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* Highlight variables in body text */
    const highlightedParts = useMemo(() => {
      const regex = /\{\{(\w+)\}\}/g;
      const parts: { text: string; isVar: boolean }[] = [];
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(body)) !== null) {
        if (match.index > lastIndex) {
          parts.push({ text: body.slice(lastIndex, match.index), isVar: false });
        }
        parts.push({ text: match[0], isVar: true });
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < body.length) {
        parts.push({ text: body.slice(lastIndex), isVar: false });
      }
      return parts;
    }, [body]);

    const inputStyle = useMemo((): React.CSSProperties => ({
      width: '100%',
      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
      borderRadius: t.borderRadius.md,
      border: `1px solid ${t.colors.neutral[200]}`,
      backgroundColor: t.colors.common.white,
      fontSize: t.typography.fontSize.sm,
      color: t.colors.neutral[900],
      outline: 'none',
      transition: `border-color ${t.motion.hover}`,
    }), [t]);

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
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <FileEdit size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Template Editor
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Create or modify message templates
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Cancel editing"
                onClick={() => onCancel?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCancel?.(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <X size={14} color={t.colors.neutral[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Cancel</Text>
              </Box>
              <Box
                role="button"
                tabIndex={0}
                aria-label="Save template"
                onClick={() => onSave?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSave?.(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.primaryScale[600],
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Save size={14} color={t.colors.common.white} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white, fontWeight: t.typography.fontWeight.medium }}>Save</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1, display: 'flex', gap: t.spacing[6] }}>
          {/* Left: Form */}
          <Box style={{ flex: 2, ...animStyle }}>
            <Box style={{ ...card, display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
              {/* Template Name */}
              <Box>
                <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Template Name</Text>
                <Box style={inputStyle}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900] }}>{templateName}</Text>
                </Box>
              </Box>

              {/* Category */}
              <Box>
                <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Category</Text>
                <Box style={inputStyle}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900] }}>{category}</Text>
                </Box>
              </Box>

              {/* Subject */}
              <Box>
                <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Subject Line</Text>
                <Box style={inputStyle}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900] }}>{subject}</Text>
                </Box>
              </Box>

              {/* Body */}
              <Box>
                <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Message Body</Text>
                <Box style={{
                  ...inputStyle,
                  minHeight: 200,
                  padding: t.spacing[3],
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {highlightedParts.map((part, i) => (
                    part.isVar ? (
                      <Text key={i} style={{
                        backgroundColor: t.colors.primaryScale[100],
                        color: t.colors.primaryScale[700],
                        padding: `0 ${t.spacing[1]}px`,
                        borderRadius: t.borderRadius.sm,
                        fontWeight: t.typography.fontWeight.medium,
                        fontSize: t.typography.fontSize.sm,
                      }}>
                        {part.text}
                      </Text>
                    ) : (
                      <Text key={i} style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[900] }}>
                        {part.text}
                      </Text>
                    )
                  ))}
                </Box>
              </Box>

              {/* Plain Text Body */}
              {plainTextBody && (
                <Box>
                  <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Plain Text Version</Text>
                  <Box style={{
                    ...inputStyle,
                    minHeight: 80,
                    padding: t.spacing[3],
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    backgroundColor: t.colors.neutral[50],
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                      {plainTextBody}
                    </Text>
                  </Box>
                </Box>
              )}

              {/* Template Metadata */}
              <Box style={createMetadataGridStyle(t, { columns: 2, withBackground: true })}>
                {templateType && (
                  <Box style={createMetadataFieldStyle(t)}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Layers size={ICON_SIZES.label} color={t.colors.neutral[400]} />
                      <Text style={createMetadataLabelStyle(t)}>Type</Text>
                    </Box>
                    <Text style={{ ...createMetadataValueStyle(t), textTransform: 'capitalize' as const }}>{templateType}</Text>
                  </Box>
                )}
                {targetAudience && (
                  <Box style={createMetadataFieldStyle(t)}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Target size={ICON_SIZES.label} color={t.colors.neutral[400]} />
                      <Text style={createMetadataLabelStyle(t)}>Audience</Text>
                    </Box>
                    <Text style={createMetadataValueStyle(t)}>{targetAudience}</Text>
                  </Box>
                )}
                {useCase && (
                  <Box style={createMetadataFieldStyle(t)}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Tag size={ICON_SIZES.label} color={t.colors.neutral[400]} />
                      <Text style={createMetadataLabelStyle(t)}>Use Case</Text>
                    </Box>
                    <Text style={createMetadataValueStyle(t)}>{useCase}</Text>
                  </Box>
                )}
                {language && (
                  <Box style={createMetadataFieldStyle(t)}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Globe size={ICON_SIZES.label} color={t.colors.neutral[400]} />
                      <Text style={createMetadataLabelStyle(t)}>Language</Text>
                    </Box>
                    <Text style={{ ...createMetadataValueStyle(t), textTransform: 'uppercase' as const }}>{language}</Text>
                  </Box>
                )}
                {version != null && (
                  <Box style={createMetadataFieldStyle(t)}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Hash size={ICON_SIZES.label} color={t.colors.neutral[400]} />
                      <Text style={createMetadataLabelStyle(t)}>Version</Text>
                    </Box>
                    <Text style={createMetadataValueStyle(t)}>v{version}</Text>
                  </Box>
                )}
                <Box style={{ display: 'flex', gap: t.spacing[2], gridColumn: 'span 2' }}>
                  {isShared != null && (() => {
                    const sharedBadge = createBooleanBadgeStyles(t, isShared, { trueColor: 'info' });
                    return sharedBadge && (
                      <Box style={sharedBadge}>
                        <Share2 size={ICON_SIZES.inline} />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{isShared ? 'Shared' : 'Private'}</Text>
                      </Box>
                    );
                  })()}
                  {requiresApproval != null && (
                    <Box style={{
                      ...createBadgeStyle(t, requiresApproval ? 'warning' : 'success'),
                      borderRadius: badgeRadius,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      <ShieldCheck size={ICON_SIZES.inline} />
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{requiresApproval ? 'Requires Approval' : 'No Approval Needed'}</Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right: Variables */}
          <Box style={{ flex: 1, ...animStyle }}>
            <Box style={card}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Available Variables</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                {variables.map(v => (
                  <Box
                    key={v.key}
                    role="button"
                    tabIndex={0}
                    aria-label={`Insert variable: ${v.label}`}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.primaryScale[50],
                      border: `1px solid ${t.colors.primaryScale[100]}`,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Variable size={ICON_SIZES.label} color={t.colors.primaryScale[500]} />
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.primaryScale[700] }}>
                          {v.label}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[400] }}>
                          {`{{${v.key}}}`}
                        </Text>
                      </Box>
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{v.defaultValue}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
