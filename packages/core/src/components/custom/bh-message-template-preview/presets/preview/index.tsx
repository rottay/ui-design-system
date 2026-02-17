'use client';

/**
 * BhMessageTemplatePreview - Preview Preset
 * Full email preview with rendered variables, recipient info,
 * and action buttons. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Eye, Send, Pencil, X, Mail, User, AtSign,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhMessageTemplatePreviewProps } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Default data                                                       */
/* ------------------------------------------------------------------ */

const DEFAULT_SAMPLE_DATA: Record<string, string> = {
  firstName: 'Alex',
  lastName: 'Rivera',
  company: 'TechCorp',
  position: 'Senior Frontend Engineer',
  recruiterName: 'Sarah Johnson',
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveVariables(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
}

/* ================================================================== */
/*  Preview Preset                                                     */
/* ================================================================== */

export const PreviewBhMessageTemplatePreview = createPreset<BhMessageTemplatePreviewProps>({
  name: 'BhMessageTemplatePreview.Preview',
  render: (ctx: PresetContext<BhMessageTemplatePreviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      templateName = 'Initial Outreach',
      subject = 'Exciting opportunity at {{company}}',
      body = 'Hi {{firstName}},\n\nI came across your profile and was impressed by your experience. We have an exciting {{position}} role at {{company}} that I think would be a great fit.\n\nWould you be open to a brief conversation?\n\nBest regards,\n{{recruiterName}}',
      sampleData: rawSampleData = DEFAULT_SAMPLE_DATA,
      recipientName = 'Alex Rivera',
      recipientEmail = 'alex.rivera@example.com',
      onSend,
      onEdit,
      onClose,
      loading,
      className,
      style,
    } = props;

    const sampleData = Array.isArray(rawSampleData) ? rawSampleData : DEFAULT_SAMPLE_DATA;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const resolvedSubject = useMemo(() => resolveVariables(subject, sampleData), [subject, sampleData]);
    const resolvedBody = useMemo(() => resolveVariables(body, sampleData), [body, sampleData]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

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
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.infoScale[50] })}>
                <Eye size={22} color={t.colors.infoScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Template Preview
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  {templateName}
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              <Box
                role="button" tabIndex={0} aria-label="Edit template"
                onClick={() => onEdit?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit?.(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <Pencil size={14} color={t.colors.neutral[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>Edit</Text>
              </Box>
              <Box
                role="button" tabIndex={0} aria-label="Send message"
                onClick={() => onSend?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSend?.(); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.primaryScale[600],
                  cursor: 'pointer', transition: `all ${t.motion.hover}`,
                }}
              >
                <Send size={14} color={t.colors.common.white} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white, fontWeight: t.typography.fontWeight.medium }}>Send</Text>
              </Box>
              <Box
                role="button" tabIndex={0} aria-label="Close preview"
                onClick={() => onClose?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClose?.(); } }}
                style={{ cursor: 'pointer', padding: t.spacing[2] }}
              >
                <X size={16} color={t.colors.neutral[400]} />
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Email preview */}
        <Box style={{ padding: t.spacing[7], flex: 1, display: 'flex', justifyContent: 'center' }}>
          <Box style={{ ...card, ...animStyle, maxWidth: 640, width: '100%' }}>
            {/* Recipient info */}
            <Box style={{
              padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[2] }}>
                <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.primaryScale[50] })}>
                  <User size={16} color={t.colors.primaryScale[600]} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>
                    {recipientName}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {recipientEmail}
                  </Text>
                </Box>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Mail size={14} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[800] }}>
                  {resolvedSubject}
                </Text>
              </Box>
            </Box>

            {/* Email body */}
            <Box style={{ padding: `${t.spacing[5]}px ${t.spacing[5]}px` }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[700],
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
              }}>
                {resolvedBody}
              </Text>
            </Box>

            {/* Sample data legend */}
            <Box style={{
              padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
              borderTop: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: `0 0 ${t.borderRadius.lg} ${t.borderRadius.lg}`,
            }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>Sample Data Used</Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
                {Object.entries(sampleData).map(([key, value]) => (
                  <Box key={key} style={{
                    ...createBadgeStyle(t, 'info'),
                    borderRadius: badgeRadius,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{key}: {value}</Text>
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
