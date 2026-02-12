'use client';

/**
 * BhCandidateOutreach - Composer Preset
 * Multi-channel outreach composer with template library, A/B testing,
 * scheduling, and personalization preview. Slite-inspired warm design.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, getPersonalityBadgeRadius } from '../../../helpers';
import type {
  BhCandidateOutreachProps, OutreachRecipient, OutreachTemplate,
  ABVariant, ScheduleConfig, OutreachChannel,
} from '../../core';
import { getChannelColors, getRecipientInitials, getChannelLabel } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Mail, MessageSquare, Linkedin, Send, Clock, Users, Eye,
  Sparkles, X, ChevronDown, Plus, Copy, Shuffle, Calendar,
  Type, Hash, AtSign, Smartphone,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Default Data
 * -------------------------------------------------------------------------*/

const DEFAULT_RECIPIENTS: OutreachRecipient[] = [
  { id: 'r-1', name: 'Sarah Johnson', email: 'sarah.j@google.com', phone: '+1 415-555-0127' },
  { id: 'r-2', name: 'Michael Chen', email: 'mchen@stripe.com', phone: '+1 415-555-0189' },
  { id: 'r-3', name: 'Emily Rodriguez', email: 'emily@meta.com' },
  { id: 'r-4', name: 'James Kim', email: 'jkim@anthropic.com' },
  { id: 'r-5', name: 'Anna Kowalski', email: 'anna@vercel.com' },
];

const DEFAULT_TEMPLATES: OutreachTemplate[] = [
  { id: 't-1', name: 'Initial Outreach', category: 'First Touch', content: 'Hi {firstName}, I came across your profile and was impressed by your work at {company}...', variables: ['firstName', 'company'], effectiveness: 68 },
  { id: 't-2', name: 'Follow Up', category: 'Nurture', content: 'Hi {firstName}, I wanted to follow up on my previous message about the {role} opportunity...', variables: ['firstName', 'role'], effectiveness: 42 },
  { id: 't-3', name: 'Referral Intro', category: 'Warm Lead', content: 'Hi {firstName}, {referrer} suggested I reach out to you regarding...', variables: ['firstName', 'referrer'], effectiveness: 82 },
];

const CHANNELS: { key: OutreachChannel; icon: React.ReactNode; label: string }[] = [
  { key: 'email', icon: <Mail size={16} />, label: 'Email' },
  { key: 'sms', icon: <Smartphone size={16} />, label: 'SMS' },
  { key: 'whatsapp', icon: <MessageSquare size={16} />, label: 'WhatsApp' },
  { key: 'linkedin', icon: <Linkedin size={16} />, label: 'LinkedIn' },
];

/* ---------------------------------------------------------------------------
 * Preset
 * -------------------------------------------------------------------------*/

export const ComposerBhCandidateOutreach = createPreset<BhCandidateOutreachProps>({
  name: 'BhCandidateOutreach.Composer',
  render: ({ primitives, props, tokens: t }: PresetContext<BhCandidateOutreachProps>) => {
    const { Box, Text } = primitives;
    const br = getPersonalityBadgeRadius(t);
    const channelColors = getChannelColors(t);

    const {
      channel: cp = 'email', onChannelChange,
      recipients = DEFAULT_RECIPIENTS, onRecipientsChange,
      templates = DEFAULT_TEMPLATES, selectedTemplate: stp, onTemplateSelect,
      messageContent: mcp = '', onMessageChange,
      subject: sp = '', onSubjectChange,
      scheduleConfig: scp, onScheduleChange,
      variants: vp, onVariantsChange,
      previewRecipient: prp, onPreviewChange,
      onSend, loading,
      className, style,
    } = props;

    const [iChannel, setIChannel] = useState<OutreachChannel>('email');
    const [iTemplate, setITemplate] = useState<OutreachTemplate | null>(null);
    const [iSubject, setISubject] = useState('Exciting opportunity at your next career move');
    const [iMessage, setIMessage] = useState('Hi {firstName},\n\nI came across your profile and was really impressed by your experience at {company}. We have an exciting Senior Frontend Engineer role that I think would be a great fit for your background.\n\nWould you be open to a quick 15-minute chat this week?\n\nBest regards');
    const [showTemplates, setShowTemplates] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const channel = cp ?? iChannel;
    const subject = sp || iSubject;
    const message = mcp || iMessage;
    const selectedTemplate = stp ?? iTemplate;
    const cc = channelColors[channel];

    return (
      <Box className={className} style={{
        ...createCardStyle(t, { elevation: 'md' }),
        display: 'flex', flexDirection: 'column', height: '100%',
        backgroundColor: t.colors.common.white, overflow: 'hidden', ...style,
      }}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[900] }}>Compose Outreach</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 2 }}>
              {recipients.length} recipients via {getChannelLabel(channel)}
            </Text>
          </Box>
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <button onClick={() => setPreviewMode(!previewMode)} style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
              border: `1px solid ${previewMode ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
              backgroundColor: previewMode ? t.colors.primaryScale[50] : t.colors.common.white,
              color: previewMode ? t.colors.primaryScale[700] : t.colors.neutral[600],
              fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
            }}><Eye size={13} /> Preview</button>
            <button onClick={onSend} style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              padding: `${t.spacing[2]}px ${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
              border: 'none', backgroundColor: t.colors.primaryScale[600], color: t.colors.common.white,
              fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, cursor: 'pointer',
            }}><Send size={14} /> Send</button>
          </Box>
        </Box>

        <Box style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left: Compose area */}
          <Box style={{ flex: 1, overflow: 'auto', padding: `${t.spacing[6]}px` }}>
            {/* Channel selector */}
            <Box style={{ marginBottom: t.spacing[5] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[2] }}>Channel</Text>
              <Box style={{ display: 'flex', gap: t.spacing[2] }}>
                {CHANNELS.map(ch => {
                  const active = channel === ch.key;
                  const chc = channelColors[ch.key];
                  return (
                    <button key={ch.key} onClick={() => { onChannelChange?.(ch.key); setIChannel(ch.key); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[2],
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                        border: `1px solid ${active ? chc.border : t.colors.neutral[200]}`,
                        backgroundColor: active ? chc.bgColor : t.colors.common.white,
                        color: active ? chc.color : t.colors.neutral[600],
                        fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, cursor: 'pointer',
                      }}>
                      {ch.icon} {ch.label}
                    </button>
                  );
                })}
              </Box>
            </Box>

            {/* Recipients */}
            <Box style={{ marginBottom: t.spacing[5] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[2] }}>
                Recipients ({recipients.length})
              </Text>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[1], padding: `${t.spacing[2]}px`, borderRadius: t.borderRadius.lg, border: `1px solid ${t.colors.neutral[200]}`, minHeight: 40 }}>
                {recipients.slice(0, 8).map(r => (
                  <Box key={r.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                    padding: `2px ${t.spacing[2]}px 2px 2px`, borderRadius: br, backgroundColor: t.colors.neutral[50],
                    fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700],
                  }}>
                    <Box style={{
                      width: 18, height: 18, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.primaryScale[100], color: t.colors.primaryScale[700],
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: t.typography.fontWeight.bold,
                    }}>{getRecipientInitials(r.name)}</Box>
                    {r.name}
                  </Box>
                ))}
                {recipients.length > 8 && (
                  <Box style={{ padding: `2px ${t.spacing[2]}px`, borderRadius: br, backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700], fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium }}>
                    +{recipients.length - 8} more
                  </Box>
                )}
              </Box>
            </Box>

            {/* Subject (email only) */}
            {channel === 'email' && (
              <Box style={{ marginBottom: t.spacing[5] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[2] }}>Subject</Text>
                <input type="text" value={subject}
                  onChange={e => { onSubjectChange?.(e.target.value); setISubject(e.target.value); }}
                  style={{
                    width: '100%', padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                    border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.sm,
                    color: t.colors.neutral[800], outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                  }} />
              </Box>
            )}

            {/* Message body */}
            <Box style={{ marginBottom: t.spacing[5] }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em' }}>Message</Text>
                <button onClick={() => setShowTemplates(!showTemplates)} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: `2px ${t.spacing[2]}px`, borderRadius: br,
                  border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[600], fontSize: t.typography.fontSize.xs, cursor: 'pointer',
                }}><Sparkles size={11} /> Templates</button>
              </Box>
              <textarea value={message}
                onChange={e => { onMessageChange?.(e.target.value); setIMessage(e.target.value); }}
                rows={10}
                style={{
                  width: '100%', padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                  border: `1px solid ${t.colors.neutral[200]}`, fontSize: t.typography.fontSize.sm,
                  color: t.colors.neutral[800], outline: 'none', fontFamily: 'inherit',
                  lineHeight: t.typography.lineHeight.relaxed, resize: 'vertical', boxSizing: 'border-box',
                }} />
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginTop: t.spacing[2] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  Variables: {'{'}firstName{'}'}, {'{'}company{'}'}, {'{'}role{'}'}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Right sidebar: Templates or Preview */}
          <Box style={{
            width: 280, flexShrink: 0, borderLeft: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.neutral[50], overflow: 'auto', padding: `${t.spacing[5]}px`,
          }}>
            {previewMode ? (
              <>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[3] }}>Preview</Text>
                <Box style={{
                  padding: `${t.spacing[4]}px`, borderRadius: t.borderRadius.lg,
                  backgroundColor: t.colors.common.white, border: `1px solid ${t.colors.neutral[100]}`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                    <Box style={{ width: 28, height: 28, borderRadius: t.borderRadius.full, backgroundColor: t.colors.primaryScale[50], color: t.colors.primaryScale[700], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: t.typography.fontWeight.bold }}>SJ</Box>
                    <Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>Sarah Johnson</Text>
                      <Text style={{ fontSize: 10, color: t.colors.neutral[400] }}>sarah.j@google.com</Text>
                    </Box>
                  </Box>
                  {channel === 'email' && (
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], marginBottom: t.spacing[2] }}>
                      {subject}
                    </Text>
                  )}
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], lineHeight: t.typography.lineHeight.relaxed, whiteSpace: 'pre-wrap' }}>
                    {message.replace('{firstName}', 'Sarah').replace('{company}', 'Google').replace('{role}', 'Senior Frontend Engineer')}
                  </Text>
                </Box>
              </>
            ) : (
              <>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[400], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: t.spacing[3] }}>Template Library</Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {templates.map(tmpl => {
                    const active = selectedTemplate?.id === tmpl.id;
                    return (
                      <Box key={tmpl.id} onClick={() => { onTemplateSelect?.(tmpl); setITemplate(tmpl); }}
                        style={{
                          padding: `${t.spacing[3]}px`, borderRadius: t.borderRadius.lg,
                          border: `1px solid ${active ? t.colors.primaryScale[300] : t.colors.neutral[100]}`,
                          backgroundColor: active ? t.colors.primaryScale[50] : t.colors.common.white,
                          cursor: 'pointer', transition: `all ${t.motion.hover}`,
                        }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>{tmpl.name}</Text>
                          {tmpl.effectiveness && (
                            <Box style={{
                              padding: `0 ${t.spacing[1]}px`, borderRadius: br, fontSize: 10,
                              backgroundColor: tmpl.effectiveness >= 70 ? t.colors.successScale[50] : t.colors.warningScale[50],
                              color: tmpl.effectiveness >= 70 ? t.colors.successScale[700] : t.colors.warningScale[700],
                              fontWeight: t.typography.fontWeight.bold,
                            }}>{tmpl.effectiveness}%</Box>
                          )}
                        </Box>
                        <Text style={{ fontSize: 10, color: t.colors.neutral[500] }}>{tmpl.category}</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tmpl.content.slice(0, 60)}...
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
