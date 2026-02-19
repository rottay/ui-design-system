'use client';

/**
 * BhEmailComposer - Full Preset
 * Complete email editor with template selector, variable injection,
 * AI rewrite button, and preview. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Mail, Send, Wand2, FileText, ChevronDown,
  User, AtSign, Variable, Sparkles,
  Paperclip, Clock, Eye, MousePointerClick, Users,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createBooleanBadgeStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  createMetadataLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  ICON_SIZES,
} from '../../../helpers';
import type { BhEmailComposerProps, EmailTemplate, EmailVariable } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Full Preset                                                        */
/* ================================================================== */

export const FullBhEmailComposer = createPreset<BhEmailComposerProps>({
  name: 'BhEmailComposer.Full',
  render: (ctx: PresetContext<BhEmailComposerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      templates: rawTemplates = [],
      variables: rawVariables = [],
      selectedTemplateId,
      subject: propSubject,
      body: propBody,
      recipientName = 'Sarah Johnson',
      recipientEmail = 'sarah.johnson@email.com',
      onTemplateSelect,
      onSubjectChange,
      onBodyChange,
      onSend,
      onAiRewrite,
      ccRecipients: rawCcRecipients,
      bccRecipients: rawBccRecipients,
      attachments: rawAttachments,
      scheduleSendAt,
      trackOpens,
      trackClicks,
      loading,
      className,
      style,
    } = props;

    const ccRecipients = Array.isArray(rawCcRecipients) ? rawCcRecipients : [];
    const bccRecipients = Array.isArray(rawBccRecipients) ? rawBccRecipients : [];
    const attachments = Array.isArray(rawAttachments) ? rawAttachments : [];

    const templates = Array.isArray(rawTemplates) ? rawTemplates : [];
    const variables = Array.isArray(rawVariables) ? rawVariables : [];

    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(selectedTemplateId ?? templates[0]?.id ?? null);
    const [showTemplates, setShowTemplates] = useState(false);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const activeTemplate = useMemo(
      () => templates.find(tpl => tpl.id === activeTemplateId) ?? templates[0],
      [templates, activeTemplateId],
    );

    const resolvedSubject = useMemo(() => {
      if (propSubject) return propSubject;
      let subj = activeTemplate?.subject ?? '';
      variables.forEach(v => {
        subj = subj.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.value);
      });
      return subj;
    }, [propSubject, activeTemplate, variables]);

    const resolvedBody = useMemo(() => {
      if (propBody) return propBody;
      let body = activeTemplate?.body ?? '';
      variables.forEach(v => {
        body = body.replace(new RegExp(`\\{\\{${v.key}\\}\\}`, 'g'), v.value);
      });
      return body;
    }, [propBody, activeTemplate, variables]);

    const handleTemplateSelect = useCallback((id: string) => {
      setActiveTemplateId(id);
      setShowTemplates(false);
      onTemplateSelect?.(id);
    }, [onTemplateSelect]);

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
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <Mail size={ICON_SIZES.feature} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Compose Email
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                  Draft and send personalized emails
                </Text>
              </Box>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[2] }}>
              <Box
                tabIndex={0}
                role="button"
                aria-label="AI Rewrite"
                onClick={() => onAiRewrite?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAiRewrite?.(); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Wand2 size={14} color={t.colors.primaryScale[500]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[600], fontWeight: t.typography.fontWeight.medium }}>
                  AI Rewrite
                </Text>
              </Box>
              <Box
                tabIndex={0}
                role="button"
                aria-label="Send email"
                onClick={() => onSend?.()}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSend?.(); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  backgroundColor: t.colors.primaryScale[600],
                  color: t.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Send size={14} />
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.common.white }}>
                  Send
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Template selector */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <FileText size={ICON_SIZES.label} color={t.colors.neutral[500]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], flexShrink: 0 }}>
              Template:
            </Text>
            <Box
              tabIndex={0}
              role="button"
              aria-label="Select template"
              aria-expanded={showTemplates}
              onClick={() => setShowTemplates(!showTemplates)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowTemplates(!showTemplates); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                cursor: 'pointer',
                flex: 1,
              }}
            >
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700], flex: 1 }}>
                {activeTemplate?.name ?? 'Select template...'}
              </Text>
              <ChevronDown size={ICON_SIZES.label} color={t.colors.neutral[400]} />
            </Box>
          </Box>
          {showTemplates && (
            <Box style={{
              marginTop: t.spacing[2],
              border: `1px solid ${t.colors.neutral[200]}`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.common.white,
              overflow: 'hidden',
            }} role="listbox" aria-label="Email templates">
              {templates.map(tpl => (
                <Box
                  key={tpl.id}
                  role="option"
                  aria-selected={tpl.id === activeTemplateId}
                  tabIndex={0}
                  onClick={() => handleTemplateSelect(tpl.id)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTemplateSelect(tpl.id); } }}
                  style={{
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    cursor: 'pointer',
                    backgroundColor: tpl.id === activeTemplateId ? t.colors.primaryScale[50] : t.colors.common.white,
                    borderBottom: `1px solid ${t.colors.neutral[50]}`,
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                  }}>
                    {tpl.name}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Recipient */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[2],
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 30, flexShrink: 0 }}>
            To:
          </Text>
          <Box style={{ 
            ...createBadgeStyle(t, 'primary'),
            borderRadius: badgeRadius,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <User size={ICON_SIZES.inline} />
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{recipientName}</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, opacity: 0.7 }}>{recipientEmail}</Text>
          </Box>
        </Box>

        {/* CC Recipients */}
        {ccRecipients.length > 0 && (
          <Box style={{
            padding: `${t.spacing[2]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[50]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 30, flexShrink: 0 }}>
              CC:
            </Text>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
              {ccRecipients.map((cc, i) => (
                <Box key={i} style={{
                  ...createBadgeStyle(t, 'secondary'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <Users size={ICON_SIZES.inline} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{cc}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* BCC Recipients */}
        {bccRecipients.length > 0 && (
          <Box style={{
            padding: `${t.spacing[2]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[50]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 30, flexShrink: 0 }}>
              BCC:
            </Text>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
              {bccRecipients.map((bcc, i) => (
                <Box key={i} style={{
                  ...createBadgeStyle(t, 'secondary'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}>
                  <Users size={ICON_SIZES.inline} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{bcc}</Text>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Subject */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[2],
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 30, flexShrink: 0 }}>
            Subj:
          </Text>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.medium,
            color: t.colors.neutral[800],
            flex: 1,
          }}>
            {resolvedSubject}
          </Text>
        </Box>

        {/* Body */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          minHeight: 200,
        }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[700],
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}>
            {resolvedBody}
          </Text>
        </Box>

        {/* Attachments */}
        {attachments.length > 0 && (
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex',
            flexDirection: 'column' as const,
            gap: t.spacing[2],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Paperclip size={ICON_SIZES.label} color={t.colors.neutral[500]} />
              <Text style={{ ...createMetadataLabelStyle(t, { personality: ptypo }), fontWeight: t.typography.fontWeight.semibold }}>
                Attachments ({attachments.length})
              </Text>
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[2] }}>
              {attachments.map((att, i) => (
                <Box key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                }}>
                  <Paperclip size={11} color={t.colors.primaryScale[500]} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>
                    {att.name}
                  </Text>
                  {att.size != null && (
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      ({(att.size / 1024).toFixed(1)} KB)
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Schedule & Tracking */}
        {(scheduleSendAt || trackOpens != null || trackClicks != null) && (
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[3],
            flexWrap: 'wrap',
          }}>
            {scheduleSendAt && (
              <Box style={{
                ...createBadgeStyle(t, 'info'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <Clock size={ICON_SIZES.inline} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  Scheduled: {new Date(scheduleSendAt).toLocaleString()}
                </Text>
              </Box>
            )}
            {trackOpens != null && (() => {
              const opensBadge = createBooleanBadgeStyles(t, trackOpens);
              return opensBadge && (
                <Box style={opensBadge}>
                  <Eye size={ICON_SIZES.inline} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {trackOpens ? 'Track Opens' : 'No Open Tracking'}
                  </Text>
                </Box>
              );
            })()}
            {trackClicks != null && (() => {
              const clicksBadge = createBooleanBadgeStyles(t, trackClicks);
              return clicksBadge && (
                <Box style={clicksBadge}>
                  <MousePointerClick size={ICON_SIZES.inline} />
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {trackClicks ? 'Track Clicks' : 'No Click Tracking'}
                  </Text>
                </Box>
              );
            })()}
          </Box>
        )}

        {/* Variables sidebar */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
            <Variable size={ICON_SIZES.label} color={t.colors.neutral[500]} />
            <Text style={{ ...createMetadataLabelStyle(t, { personality: ptypo }), fontWeight: t.typography.fontWeight.semibold }}>
              Variables
            </Text>
          </Box>
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1] }}>
            {variables.map(v => (
              <Box
                key={v.key}
                style={{
                  ...createBadgeStyle(t, 'secondary'),
                  borderRadius: badgeRadius,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {v.label}: {v.value}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
