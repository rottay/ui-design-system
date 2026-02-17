'use client';

/**
 * BhEmailComposer - Minimal Preset
 * Condensed email compose widget with subject and body.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Mail, Send, Wand2 } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhEmailComposerProps, EmailVariable } from '../../core';
import type { DesignTokens } from '../../../../../types';

const MOCK_VARIABLES: EmailVariable[] = [
  { key: 'candidateName', label: 'Name', value: 'Sarah Johnson' },
  { key: 'position', label: 'Position', value: 'Senior Frontend Engineer' },
];

export const MinimalBhEmailComposer = createPreset<BhEmailComposerProps>({
  name: 'BhEmailComposer.Minimal',
  render: (ctx: PresetContext<BhEmailComposerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      variables: rawVariables = MOCK_VARIABLES,
      subject = 'Interview Invitation - Senior Frontend Engineer',
      body = 'Dear Sarah Johnson,\n\nWe are pleased to invite you for an interview...\n\nBest regards,\nAlex Thompson',
      recipientName = 'Sarah Johnson',
      recipientEmail = 'sarah@email.com',
      onSend,
      onAiRewrite,
      className,
      style,
    } = props;

    const variables = Array.isArray(rawVariables) ? rawVariables : MOCK_VARIABLES;


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
            <Mail size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Email
            </Text>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[1] }}>
            <Box
              tabIndex={0}
              role="button"
              aria-label="AI Rewrite"
              onClick={() => onAiRewrite?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAiRewrite?.(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Wand2 size={12} color={t.colors.primaryScale[500]} />
            </Box>
            <Box
              tabIndex={0}
              role="button"
              aria-label="Send"
              onClick={() => onSend?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSend?.(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.primaryScale[600],
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Send size={12} color={t.colors.common.white} />
            </Box>
          </Box>
        </Box>

        {/* To */}
        <Box style={{ 
          padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[50]}`,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[1],
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>To:</Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
            {recipientName} ({recipientEmail})
          </Text>
        </Box>

        {/* Subject */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[800],
          }}>
            {subject}
          </Text>
        </Box>

        {/* Body */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          minHeight: 100,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[600],
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {body}
          </Text>
        </Box>
      </Box>
    );
  },
});
