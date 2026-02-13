'use client';

/**
 * BhCandidateBulkEmail - Full Preset
 * Complete bulk email interface with recipient list, template preview,
 * and per-candidate preview panel. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Mail, Send, Users, Eye, CheckSquare,
  Square, User, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhCandidateBulkEmailProps, BulkEmailRecipient } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RECIPIENTS: BulkEmailRecipient[] = [
  { id: 'br-1', name: 'Sarah Johnson', email: 'sarah.johnson@email.com', variables: { position: 'Senior Frontend Engineer', interviewDate: 'March 15, 2026' } },
  { id: 'br-2', name: 'Michael Chen', email: 'michael.chen@email.com', variables: { position: 'Backend Developer', interviewDate: 'March 16, 2026' } },
  { id: 'br-3', name: 'Emily Rodriguez', email: 'emily.r@email.com', variables: { position: 'Product Designer', interviewDate: 'March 17, 2026' } },
  { id: 'br-4', name: 'James Kim', email: 'james.kim@email.com', variables: { position: 'DevOps Engineer', interviewDate: 'March 18, 2026' } },
  { id: 'br-5', name: 'Anna Kowalski', email: 'anna.k@email.com', variables: { position: 'Data Analyst', interviewDate: 'March 19, 2026' } },
];

const MOCK_SUBJECT = 'Interview Invitation - {{position}}';
const MOCK_BODY = 'Dear {{name}},\n\nWe are pleased to invite you for an interview for the {{position}} position.\n\nYour interview is scheduled for {{interviewDate}}.\n\nPlease confirm your availability.\n\nBest regards,\nThe Hiring Team';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function resolveTemplate(template: string, vars: Record<string, string>, name: string): string {
  let result = template;
  result = result.replace(/\{\{name\}\}/g, name);
  Object.entries(vars).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  return result;
}

/* ================================================================== */
/*  Full Preset                                                        */
/* ================================================================== */

export const FullBhCandidateBulkEmail = createPreset<BhCandidateBulkEmailProps>({
  name: 'BhCandidateBulkEmail.Full',
  render: (ctx: PresetContext<BhCandidateBulkEmailProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      recipients = MOCK_RECIPIENTS,
      subject = MOCK_SUBJECT,
      body = MOCK_BODY,
      title = 'Bulk Email',
      onRecipientToggle,
      onSend,
      onPreview,
      selectedIds: propSelectedIds,
      previewId: propPreviewId,
      className,
      style,
    } = props;

    const [localSelected, setLocalSelected] = useState<Set<string>>(
      new Set(propSelectedIds ?? recipients.map(r => r.id)),
    );
    const [previewId, setPreviewId] = useState<string | null>(propPreviewId ?? null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleToggle = useCallback((id: string) => {
      setLocalSelected(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      onRecipientToggle?.(id);
    }, [onRecipientToggle]);

    const handlePreview = useCallback((id: string) => {
      setPreviewId(prev => prev === id ? null : id);
      onPreview?.(id);
    }, [onPreview]);

    const handleSelectAll = useCallback(() => {
      if (localSelected.size === recipients.length) {
        setLocalSelected(new Set());
      } else {
        setLocalSelected(new Set(recipients.map(r => r.id)));
      }
    }, [recipients, localSelected.size]);

    const previewRecipient = useMemo(
      () => recipients.find(r => r.id === previewId),
      [recipients, previewId],
    );

    const resolvedPreviewSubject = useMemo(() => {
      if (!previewRecipient) return subject;
      return resolveTemplate(subject, previewRecipient.variables, previewRecipient.name);
    }, [previewRecipient, subject]);

    const resolvedPreviewBody = useMemo(() => {
      if (!previewRecipient) return body;
      return resolveTemplate(body, previewRecipient.variables, previewRecipient.name);
    }, [previewRecipient, body]);

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
                <Mail size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  {localSelected.size} of {recipients.length} recipients selected
                </Text>
              </Box>
            </Box>
            <Box
              tabIndex={0}
              role="button"
              aria-label={`Send to ${localSelected.size} recipients`}
              onClick={() => onSend?.()}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSend?.(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: localSelected.size > 0 ? t.colors.primaryScale[600] : t.colors.neutral[300],
                cursor: localSelected.size > 0 ? 'pointer' : 'default',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Send size={14} color={t.colors.common.white} />
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.common.white }}>
                Send ({localSelected.size})
              </Text>
            </Box>
          </Box>
        </Box>

        <Box style={{ display: 'flex' }}>
          {/* Recipients list */}
          <Box style={{
            flex: 1,
            borderRight: `1px solid ${t.colors.neutral[100]}`,
            maxHeight: 400,
            overflow: 'auto',
          }}>
            {/* Select all */}
            <Box
              tabIndex={0}
              role="button"
              aria-label="Select all recipients"
              onClick={handleSelectAll}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectAll(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[100]}`,
                backgroundColor: t.colors.neutral[50],
                cursor: 'pointer',
              }}
            >
              {localSelected.size === recipients.length ? (
                <CheckSquare size={14} color={t.colors.primaryScale[500]} />
              ) : (
                <Square size={14} color={t.colors.neutral[400]} />
              )}
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[600],
              }}>
                Select all ({recipients.length})
              </Text>
            </Box>

            <Box role="list" aria-label="Email recipients">
              {recipients.length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <Users size={24} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    No recipients
                  </Text>
                </Box>
              )}
              {recipients.map((recipient, i) => {
                const isSelected = localSelected.has(recipient.id);
                const isPreviewing = previewId === recipient.id;

                return (
                  <Box
                    key={recipient.id}
                    role="listitem"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[50]}`,
                      backgroundColor: isPreviewing ? t.colors.primaryScale[50] : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    {/* Checkbox */}
                    <Box
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={isSelected}
                      aria-label={`Select ${recipient.name}`}
                      onClick={() => handleToggle(recipient.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleToggle(recipient.id); } }}
                      style={{ cursor: 'pointer', flexShrink: 0 }}
                    >
                      {isSelected ? (
                        <CheckSquare size={14} color={t.colors.primaryScale[500]} />
                      ) : (
                        <Square size={14} color={t.colors.neutral[400]} />
                      )}
                    </Box>

                    {/* Info */}
                    <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[800],
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {recipient.name}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {recipient.email}
                      </Text>
                    </Box>

                    {/* Preview button */}
                    <Box
                      tabIndex={0}
                      role="button"
                      aria-label={`Preview email for ${recipient.name}`}
                      onClick={() => handlePreview(recipient.id)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePreview(recipient.id); } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: t.borderRadius.md,
                        border: `1px solid ${isPreviewing ? t.colors.primaryScale[300] : t.colors.neutral[200]}`,
                        backgroundColor: isPreviewing ? t.colors.primaryScale[50] : t.colors.common.white,
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: `all ${t.motion.hover}`,
                      }}
                    >
                      <Eye size={11} color={isPreviewing ? t.colors.primaryScale[600] : t.colors.neutral[500]} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Preview panel */}
          <Box style={{
            flex: 1,
            padding: t.spacing[5],
            backgroundColor: t.colors.neutral[50],
            minHeight: 300,
          }}>
            {previewRecipient ? (
              <Box>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                  <Eye size={14} color={t.colors.primaryScale[500]} />
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.primaryScale[600],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    Preview for {previewRecipient.name}
                  </Text>
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                  backgroundColor: t.colors.common.white,
                  borderRadius: t.borderRadius.lg,
                  border: `1px solid ${t.colors.neutral[100]}`,
                  padding: t.spacing[4],
                }}>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[2],
                    marginBottom: t.spacing[2],
                    paddingBottom: t.spacing[2],
                    borderBottom: `1px solid ${t.colors.neutral[100]}`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>To:</Text>
                    <Box style={{
                      ...createBadgeStyle(t, 'primary'),
                      borderRadius: badgeRadius,
                    }}>
                      <User size={10} style={{ marginRight: 3 }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>{previewRecipient.name}</Text>
                    </Box>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: t.typography.fontWeight.semibold,
                    color: t.colors.neutral[800],
                    marginBottom: t.spacing[3],
                  }}>
                    {resolvedPreviewSubject}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[700],
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {resolvedPreviewBody}
                  </Text>
                </Box>
              </Box>
            ) : (
              <Box style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 200,
              }}>
                <Eye size={32} color={t.colors.neutral[200]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[2] }}>
                  Select a recipient to preview
                </Text>
              </Box>
            )}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
