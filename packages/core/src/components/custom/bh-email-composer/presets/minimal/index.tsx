'use client';

/**
 * BhEmailComposer - Minimal Preset
 * Condensed email compose widget with subject and body.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Mail, Send, Wand2, Paperclip, Clock, Eye, MousePointerClick, Users } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  ICON_SIZES,
} from '../../../helpers';
import type { BhEmailComposerProps, EmailVariable } from '../../core';
import type { DesignTokens } from '../../../../../types';

export const MinimalBhEmailComposer = createPreset<BhEmailComposerProps>({
  name: 'BhEmailComposer.Minimal',
  render: (ctx: PresetContext<BhEmailComposerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      variables: rawVariables = [],
      subject = 'Interview Invitation - Senior Frontend Engineer',
      body = 'Dear Sarah Johnson,\n\nWe are pleased to invite you for an interview...\n\nBest regards,\nAlex Thompson',
      recipientName = 'Sarah Johnson',
      recipientEmail = 'sarah@email.com',
      onSend,
      onAiRewrite,
      ccRecipients: rawCcRecipients,
      bccRecipients: rawBccRecipients,
      attachments: rawAttachments,
      scheduleSendAt,
      trackOpens,
      trackClicks,
      className,
      style,
    } = props;

    const ccRecipients = Array.isArray(rawCcRecipients) ? rawCcRecipients : [];
    const bccRecipients = Array.isArray(rawBccRecipients) ? rawBccRecipients : [];
    const attachments = Array.isArray(rawAttachments) ? rawAttachments : [];

    const variables = Array.isArray(rawVariables) ? rawVariables : [];

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
            <Mail size={ICON_SIZES.label} color={t.colors.primaryScale[500]} />
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
              <Wand2 size={ICON_SIZES.label} color={t.colors.primaryScale[500]} />
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
              <Send size={ICON_SIZES.label} color={t.colors.common.white} />
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

        {/* CC */}
        {ccRecipients.length > 0 && (
          <Box style={{
            padding: `${t.spacing[1]}px ${t.spacing[4]}px`,
            borderBottom: `1px solid ${t.colors.neutral[50]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[1],
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>CC:</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
              {ccRecipients.join(', ')}
            </Text>
          </Box>
        )}

        {/* BCC */}
        {bccRecipients.length > 0 && (
          <Box style={{
            padding: `${t.spacing[1]}px ${t.spacing[4]}px`,
            borderBottom: `1px solid ${t.colors.neutral[50]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[1],
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>BCC:</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
              {bccRecipients.join(', ')}
            </Text>
          </Box>
        )}

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

        {/* Attachments */}
        {attachments.length > 0 && (
          <Box style={{
            padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
            borderTop: `1px solid ${t.colors.neutral[50]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[1],
            flexWrap: 'wrap',
          }}>
            <Paperclip size={ICON_SIZES.inline} color={t.colors.neutral[400]} />
            {attachments.map((att, i) => (
              <Text key={i} style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {att.name}{i < attachments.length - 1 ? ',' : ''}
              </Text>
            ))}
          </Box>
        )}

        {/* Tracking & Schedule */}
        {(scheduleSendAt || trackOpens != null || trackClicks != null) && (
          <Box style={{
            padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
            borderTop: `1px solid ${t.colors.neutral[50]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            flexWrap: 'wrap',
          }}>
            {scheduleSendAt && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={ICON_SIZES.inline} color={t.colors.infoScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.infoScale[600] }}>
                  {new Date(scheduleSendAt).toLocaleString()}
                </Text>
              </Box>
            )}
            {trackOpens && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Eye size={ICON_SIZES.inline} color={t.colors.successScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600] }}>Opens</Text>
              </Box>
            )}
            {trackClicks && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MousePointerClick size={ICON_SIZES.inline} color={t.colors.successScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600] }}>Clicks</Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  },
});
