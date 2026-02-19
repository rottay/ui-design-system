'use client';

/**
 * BhFeedbackEditor - Compact Preset
 * Streamlined single-column feedback editor with inline channel selector,
 * quick tone, and collapsible preview. Personality-driven, glass-aware, accessible.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  createEmptyStateStyle,
} from '../../../helpers';
import type {
  BhFeedbackEditorProps,
  FeedbackChannel,
  FeedbackTone,
} from '../../core';
import {
  getChannelConfig,
  getToneConfig,
  getDecisionBadgeColors,
  substituteVariables,
  FEEDBACK_VARIABLES,
} from '../../core';
import type { DesignTokens } from '../../../../../types';
import {
  Mail, MessageSquare, Smartphone, Linkedin,
  Send, Sparkles, Eye, EyeOff, Check, Loader2,
} from 'lucide-react';

export const CompactBhFeedbackEditor = createPreset<BhFeedbackEditorProps>({
  name: 'BhFeedbackEditor.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhFeedbackEditorProps>) => {
    const { Box, Text } = primitives;
    const channelConfig = useMemo(() => getChannelConfig(tokens), [tokens]);
    const toneConfig = useMemo(() => getToneConfig(tokens), [tokens]);
    const personalityTypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(tokens), [tokens]);
    const sectionHeaderStyle = useMemo(() => createPersonalitySectionHeaderStyle(tokens), [tokens]);
    const entranceAnim = useMemo(() => createEntranceAnimation(tokens, { index: 0 }), [tokens]);
    const accentBar = useMemo(() => createPersonalityAccentBar(tokens), [tokens]);
    const accentLayout = useMemo(() => getAccentAwareLayout(tokens), [tokens]);

    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const {
      context,
      messageContent: messageContentProp, onMessageChange,
      subject: subjectProp, onSubjectChange,
      channel: channelProp, onChannelChange,
      tone: toneProp, onToneChange,
      isGenerating: isGeneratingProp, onGenerate,
      showPreview: showPreviewProp, onPreviewToggle,
      onSend, recipientPreview, className, style,
    } = props;

    const [internalMessage, setInternalMessage] = useState('');
    const [internalSubject, setInternalSubject] = useState('');
    const [internalChannel, setInternalChannel] = useState<FeedbackChannel>('email');
    const [internalTone, setInternalTone] = useState<FeedbackTone>('professional');
    const [internalIsGenerating, setInternalIsGenerating] = useState(false);
    const [internalShowPreview, setInternalShowPreview] = useState(false);

    const messageContent = messageContentProp ?? internalMessage;
    const setMessageContent = onMessageChange ?? setInternalMessage;
    const subject = subjectProp ?? internalSubject;
    const setSubject = onSubjectChange ?? setInternalSubject;
    const channel = channelProp ?? internalChannel;
    const setChannel = onChannelChange ?? setInternalChannel;
    const tone = toneProp ?? internalTone;
    const setTone = onToneChange ?? setInternalTone;
    const isGenerating = isGeneratingProp ?? internalIsGenerating;
    const showPreview = showPreviewProp ?? internalShowPreview;
    const setShowPreview = onPreviewToggle ?? setInternalShowPreview;

    const decisionBadge = useMemo(() => getDecisionBadgeColors(tokens, context.decision), [tokens, context.decision]);
    const previewContent = useMemo(() => substituteVariables(messageContent, context), [messageContent, context]);
    const currentChannelConfig = useMemo(() => channelConfig[channel], [channelConfig, channel]);

    const handleGenerate = useCallback(() => {
      if (onGenerate) { onGenerate(); } else { setInternalIsGenerating(true); setTimeout(() => setInternalIsGenerating(false), 2000); }
    }, [onGenerate]);

    const handlePreviewToggle = useCallback(() => { setShowPreview(!showPreview); }, [showPreview, setShowPreview]);
    const handleSend = useCallback(() => { if (messageContent.trim()) onSend?.(); }, [messageContent, onSend]);

    const channelIcons = useMemo<Record<FeedbackChannel, React.ReactNode>>(() => ({
      email: <Mail size={14} />, sms: <Smartphone size={14} />,
      whatsapp: <MessageSquare size={14} />, linkedin: <Linkedin size={14} />,
    }), []);

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { elevation: 'sm', padding: 0, glass: isGlass }),
      borderRadius: tokens.borderRadius.lg,
      overflow: 'hidden' as const,
      width: '100%',
      maxWidth: 520,
      ...entranceAnim.animate, transition: entranceAnim.transition,
    }), [tokens, isGlass, entranceAnim]);
    const entrance = useMemo(() => createEntranceAnimation(tokens), [tokens]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(tokens, index)}ms`,
    });

    return (
      <Box className={className} style={{ ...cardStyle, ...accentLayout.outer, ...style }}>
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box style={createIconContainerStyle(tokens, { size: 28, color: tokens.colors.primaryScale[100] })}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                {(context.candidateName || '').charAt(0).toUpperCase()}
              </Text>
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: personalityTypo.headingWeight,
                color: tokens.colors.neutral[900],
                letterSpacing: personalityTypo.headingLetterSpacing,
              }}>
                {context.candidateName}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{context.jobTitle}</Text>
            </Box>
          </Box>
          <Box style={{
            padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
            backgroundColor: decisionBadge.bgColor, border: `1px solid ${decisionBadge.borderColor}`,
          }}>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: decisionBadge.color }}>
              {context.decision}
            </Text>
          </Box>
        </Box>

        {/* Channel + Tone row */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
          borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          {/* Channel pills */}
          {(['email', 'sms', 'whatsapp', 'linkedin'] as FeedbackChannel[]).map(ch => {
            const cfg = channelConfig[ch];
            const isActive = channel === ch;
            return (
              <Box
                key={ch}
                role="button"
                tabIndex={0}
                aria-label={`${cfg.label} channel`}
                aria-pressed={isActive}
                onClick={() => setChannel(ch)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setChannel(ch); } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
                  backgroundColor: isActive ? cfg.bgColor : 'transparent',
                  cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                }}
              >
                {channelIcons[ch]}
                {isActive && <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: cfg.color }}>{cfg.label}</Text>}
              </Box>
            );
          })}
          <Box style={{ flex: 1 }} />
          {/* Tone mini selector */}
          {(['encouraging', 'neutral', 'professional'] as FeedbackTone[]).map(t => {
            const cfg = toneConfig[t];
            const isActive = tone === t;
            return (
              <Box
                key={t}
                role="button"
                tabIndex={0}
                aria-label={`Tone: ${cfg.label}`}
                aria-pressed={isActive}
                onClick={() => setTone(t)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setTone(t); } }}
                style={{
                  padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
                  border: `1px solid ${isActive ? cfg.borderColor : tokens.colors.neutral[200]}`,
                  backgroundColor: isActive ? cfg.bgColor : 'transparent',
                  cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isActive ? cfg.color : tokens.colors.neutral[500] }}>{cfg.label}</Text>
              </Box>
            );
          })}
        </Box>

        {/* Subject (email only) */}
        {currentChannelConfig.hasSubject && (
          <Box style={{
            padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
            borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.common.white,
          }}>
            <input
              type="text"
              value={subject}
              onChange={(e: any) => setSubject(e.target.value)}
              placeholder="Subject..."
              aria-label="Email subject"
              style={{
                width: '100%', padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}`,
                fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900],
                backgroundColor: tokens.colors.common.white, fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box' as const,
              }}
            />
          </Box>
        )}

        {/* Textarea */}
        <textarea
          value={messageContent}
          onChange={(e: any) => setMessageContent(e.target.value)}
          placeholder="Compose your feedback..."
          aria-label="Feedback message"
          rows={6}
          style={{
            width: '100%', padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
            border: 'none', fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white,
            fontFamily: 'inherit', resize: 'vertical' as const, outline: 'none',
            lineHeight: tokens.typography.lineHeight.relaxed,
            boxSizing: 'border-box' as const,
          }}
        />

        {/* Variable chips */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: tokens.spacing[1], flexWrap: 'wrap' as const,
          padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
          borderTop: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.common.white,
        }}>
          {FEEDBACK_VARIABLES.slice(0, 4).map(v => (
            <Box
              key={v.key}
              role="button"
              tabIndex={0}
              aria-label={`Insert ${v.label}`}
              onClick={() => setMessageContent(messageContent + `{${v.key}}`)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMessageContent(messageContent + `{${v.key}}`); } }}
              style={{
                padding: `0 ${tokens.spacing[2]}px`, borderRadius: badgeRadius,
                border: `1px solid ${tokens.colors.primaryScale[200]}`,
                backgroundColor: tokens.colors.primaryScale[50],
                cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[600], fontFamily: 'monospace' }}>{v.label}</Text>
            </Box>
          ))}
        </Box>

        {/* Preview (collapsible) */}
        {showPreview && previewContent && (
          <Box style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
            borderTop: `1px solid ${tokens.colors.neutral[100]}`,
            backgroundColor: tokens.colors.neutral[50],
            maxHeight: 120, overflowY: 'auto' as const,
          }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600],
              lineHeight: tokens.typography.lineHeight.relaxed,
              whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const,
            }}>
              {previewContent}
            </Text>
          </Box>
        )}

        {/* Footer */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
          borderTop: `1px solid ${tokens.colors.neutral[100]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box
              role="button"
              tabIndex={0}
              aria-label={isGenerating ? 'Generating...' : 'Generate with AI'}
              aria-disabled={isGenerating}
              onClick={isGenerating ? undefined : handleGenerate}
              onKeyDown={(e: React.KeyboardEvent) => { if (!isGenerating && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleGenerate(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.secondaryScale?.[300] ?? tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.secondaryScale?.[50] ?? tokens.colors.primaryScale[50],
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                opacity: isGenerating ? 0.7 : 1, transition: `all ${tokens.motion.hover}`,
              }}
            >
              {isGenerating ? <Loader2 size={12} /> : <Sparkles size={12} color={tokens.colors.secondaryScale?.[700] ?? tokens.colors.primaryScale[700]} />}
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.secondaryScale?.[700] ?? tokens.colors.primaryScale[700] }}>AI</Text>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label={showPreview ? 'Hide preview' : 'Show preview'}
              aria-pressed={showPreview}
              onClick={handlePreviewToggle}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreviewToggle(); } }}
              style={{
                display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[200]}`,
                backgroundColor: showPreview ? tokens.colors.primaryScale[50] : 'transparent',
                cursor: 'pointer', transition: `all ${tokens.motion.hover}`,
              }}
            >
              {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
            </Box>
          </Box>
          <Box
            role="button"
            tabIndex={0}
            aria-label="Send feedback"
            aria-disabled={!messageContent.trim()}
            onClick={handleSend}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSend(); } }}
            style={{
              display: 'flex', alignItems: 'center', gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md,
              backgroundColor: messageContent.trim() ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
              cursor: messageContent.trim() ? 'pointer' : 'not-allowed',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            <Send size={12} color={tokens.colors.common.white} />
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.medium }}>Send</Text>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
