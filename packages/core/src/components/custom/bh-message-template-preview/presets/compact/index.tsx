'use client';

/**
 * BhMessageTemplatePreview - Compact Preset
 * Condensed preview card showing resolved subject and body snippet.
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Eye, Send, Mail,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhMessageTemplatePreviewProps } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveVariables(text: string, data: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
}

const DEFAULT_SAMPLE: Record<string, string> = {
  firstName: 'Alex',
  company: 'TechCorp',
  position: 'Senior Frontend Engineer',
  recruiterName: 'Sarah',
};

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhMessageTemplatePreview = createPreset<BhMessageTemplatePreviewProps>({
  name: 'BhMessageTemplatePreview.Compact',
  render: (ctx: PresetContext<BhMessageTemplatePreviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      templateName = 'Initial Outreach',
      subject = 'Exciting opportunity at {{company}}',
      body = 'Hi {{firstName}}, I came across your profile...',
      sampleData: rawSampleData = DEFAULT_SAMPLE,
      recipientName = 'Alex Rivera',
      onSend,
      className,
      style,
    } = props;

    const sampleData = Array.isArray(rawSampleData) ? rawSampleData : DEFAULT_SAMPLE;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

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
            <Eye size={16} color={t.colors.infoScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Preview
            </Text>
          </Box>
          <Box
            role="button" tabIndex={0} aria-label="Send message"
            onClick={() => onSend?.()}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSend?.(); } }}
            style={{ cursor: 'pointer', padding: 2 }}
          >
            <Send size={14} color={t.colors.primaryScale[500]} />
          </Box>
        </Box>

        {/* Preview content */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
            <Mail size={12} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              To: {recipientName}
            </Text>
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.medium,
            color: t.colors.neutral[900],
            marginBottom: t.spacing[1],
          }}>
            {resolvedSubject}
          </Text>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[600],
            lineHeight: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          } as any}>
            {resolvedBody}
          </Text>
        </Box>
      </Box>
    );
  },
});
