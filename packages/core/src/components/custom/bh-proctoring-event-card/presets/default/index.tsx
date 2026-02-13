'use client';

/**
 * BhProctoringEventCard - Default Preset
 * Full-featured event card with severity badge, event type icon,
 * candidate info, detailed metadata section, timestamp, and review actions.
 * Glass-aware, personality-driven.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, Eye, EyeOff, CheckCircle, XCircle, Clock,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  AlertTriangle, User, MapPin, Monitor, FileText,
  Zap, Hash, Timer,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  createDividerStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhProctoringEventCardProps,
  ProctoringEventDetail,
  ProctoringEventType,
  ProctoringEventSeverity,
  ProctoringEventMetadata,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverityColor(severity: ProctoringEventSeverity, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'high': return t.colors.errorScale[400];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.infoScale[500];
  }
}

function getSeverityBg(severity: ProctoringEventSeverity, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[50];
    case 'high': return t.colors.errorScale[50];
    case 'medium': return t.colors.warningScale[50];
    case 'low': return t.colors.infoScale[50];
  }
}

function getSeverityBadgeKey(severity: ProctoringEventSeverity): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
  }
}

function getEventTypeIcon(type: ProctoringEventType) {
  switch (type) {
    case 'tab_switch': return MonitorOff;
    case 'copy_paste': return Clipboard;
    case 'screen_share': return ScreenShare;
    case 'unusual_typing': return Keyboard;
    case 'browser_focus_lost': return Globe;
  }
}

function getEventTypeLabel(type: ProctoringEventType): string {
  switch (type) {
    case 'tab_switch': return 'Tab Switch';
    case 'copy_paste': return 'Copy/Paste';
    case 'screen_share': return 'Screen Share';
    case 'unusual_typing': return 'Unusual Typing';
    case 'browser_focus_lost': return 'Focus Lost';
  }
}

function getSeverityLabel(severity: ProctoringEventSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

function getEventTypeDescription(type: ProctoringEventType): string {
  switch (type) {
    case 'tab_switch': return 'Candidate switched to a different browser tab during the assessment.';
    case 'copy_paste': return 'Copy/paste activity was detected in the assessment interface.';
    case 'screen_share': return 'Screen sharing to an external application was detected.';
    case 'unusual_typing': return 'Typing pattern anomaly detected, possibly indicating external assistance.';
    case 'browser_focus_lost': return 'Browser window lost focus, indicating candidate navigated away.';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_EVENT: ProctoringEventDetail = {
  id: 'pe-detail-1',
  candidateName: 'Sarah Johnson',
  candidateAvatar: undefined,
  eventType: 'screen_share',
  severity: 'critical',
  timestamp: new Date(Date.now() - 300000),
  metadata: {
    screenShareTarget: 'Discord',
    tabSwitchCount: 3,
    focusLostDuration: 45,
    ipAddress: '192.168.1.42',
    userAgent: 'Chrome 120 / macOS',
    notes: 'Detected active screen share to Discord for 45 seconds during coding challenge.',
  },
  reviewed: false,
  dismissed: false,
};

/* ================================================================== */
/*  Default Preset                                                     */
/* ================================================================== */

export const DefaultBhProctoringEventCard = createPreset<BhProctoringEventCardProps>({
  name: 'BhProctoringEventCard.Default',
  render: (ctx: PresetContext<BhProctoringEventCardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      event = MOCK_EVENT,
      onReview,
      onDismiss,
      onClick,
      selected,
      className,
      style,
    } = props;

    const [isHovered, setIsHovered] = useState(false);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sevColor = useMemo(() => getSeverityColor(event.severity, t), [event.severity, t]);
    const sevBg = useMemo(() => getSeverityBg(event.severity, t), [event.severity, t]);
    const EventIcon = useMemo(() => getEventTypeIcon(event.eventType), [event.eventType]);

    const handleClick = useCallback(() => {
      onClick?.();
    }, [onClick]);

    const handleReview = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onReview?.();
    }, [onReview]);

    const handleDismiss = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onDismiss?.();
    }, [onDismiss]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* Build metadata items */
    const metadataItems = useMemo(() => {
      const items: { icon: typeof Hash; label: string; value: string }[] = [];
      const m = event.metadata;

      if (m.tabSwitchCount !== undefined) {
        items.push({ icon: Hash, label: 'Tab Switches', value: String(m.tabSwitchCount) });
      }
      if (m.pastedTextLength !== undefined) {
        items.push({ icon: FileText, label: 'Pasted Text', value: `${m.pastedTextLength} chars` });
      }
      if (m.focusLostDuration !== undefined) {
        items.push({ icon: Timer, label: 'Focus Lost', value: `${m.focusLostDuration}s` });
      }
      if (m.screenShareTarget) {
        items.push({ icon: Monitor, label: 'Shared To', value: m.screenShareTarget });
      }
      if (m.typingSpeedWpm !== undefined) {
        items.push({ icon: Zap, label: 'Typing Speed', value: `${m.typingSpeedWpm} WPM` });
      }
      if (m.ipAddress) {
        items.push({ icon: MapPin, label: 'IP Address', value: m.ipAddress });
      }

      return items;
    }, [event.metadata]);

    return (
      <Box
        className={className}
        role="article"
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Proctoring event: ${event.candidateName}, ${getEventTypeLabel(event.eventType)}, ${getSeverityLabel(event.severity)} severity`}
        onClick={onClick ? handleClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
        style={{
          ...card,
          ...hoverStyles.base,
          ...(isHovered && onClick ? hoverStyles.hover : {}),
          padding: 0,
          overflow: 'hidden',
          borderLeft: `4px solid ${sevColor}`,
          ...(selected ? { borderColor: t.colors.primaryScale[400], backgroundColor: t.colors.primaryScale[50] } : {}),
          ...animStyle,
          ...(accentBar ? accentLayout.outer : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? accentLayout.inner : {}}>
        {/* Card Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          backgroundColor: t.colors.neutral[50],
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: t.spacing[3],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], minWidth: 0 }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: sevBg })}>
              <EventIcon size={22} color={sevColor} />
            </Box>
            <Box style={{ minWidth: 0 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1], flexWrap: 'wrap' }}>
                <Text style={{
                  fontSize: t.typography.fontSize.md,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {event.candidateName}
                </Text>
                <Box style={{
                  ...createBadgeStyle(t, getSeverityBadgeKey(event.severity)),
                  borderRadius: badgeRadius,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {getSeverityLabel(event.severity)}
                  </Text>
                </Box>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <EventIcon size={12} color={t.colors.neutral[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                  {getEventTypeLabel(event.eventType)}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Status badge */}
          {event.reviewed && (
            <Box style={{
              ...createBadgeStyle(t, event.dismissed ? 'secondary' : 'success'),
              borderRadius: badgeRadius,
              display: 'inline-flex',
              alignItems: 'center',
              gap: t.spacing[1],
              flexShrink: 0,
            }}>
              {event.dismissed ? <EyeOff size={10} /> : <CheckCircle size={10} />}
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {event.dismissed ? 'Dismissed' : 'Reviewed'}
              </Text>
            </Box>
          )}
        </Box>

        {/* Description */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[5]}px` }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            color: t.colors.neutral[600],
            lineHeight: 1.6,
          }}>
            {getEventTypeDescription(event.eventType)}
          </Text>
        </Box>

        {/* Metadata Grid */}
        {metadataItems.length > 0 && (
          <Box style={{
            padding: `0 ${t.spacing[5]}px ${t.spacing[3]}px`,
          }}>
            <Box style={{ ...divider, marginBottom: t.spacing[3] }} />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[500],
              textTransform: ptypo.labelTransform,
              letterSpacing: ptypo.labelLetterSpacing,
              marginBottom: t.spacing[2],
            }}>
              Event Details
            </Text>
            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: t.spacing[2],
            }}>
              {metadataItems.map((item) => {
                const MIcon = item.icon;
                return (
                  <Box
                    key={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[2],
                      padding: `${t.spacing[2]}px ${t.spacing[2]}px`,
                      backgroundColor: t.colors.neutral[50],
                      borderRadius: t.borderRadius.md,
                      border: `1px solid ${t.colors.neutral[100]}`,
                    }}
                  >
                    <MIcon size={12} color={t.colors.neutral[400]} style={{ flexShrink: 0 }} />
                    <Box style={{ minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                        textTransform: ptypo.labelTransform,
                        letterSpacing: ptypo.labelLetterSpacing,
                        display: 'block',
                      }}>
                        {item.label}
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[800],
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {item.value}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Notes */}
        {event.metadata.notes && (
          <Box style={{ padding: `0 ${t.spacing[5]}px ${t.spacing[3]}px` }}>
            <Box style={{
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              backgroundColor: t.colors.warningScale[50],
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.warningScale[100]}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: t.spacing[2],
            }}>
              <AlertTriangle size={14} color={t.colors.warningScale[600]} style={{ flexShrink: 0, marginTop: t.spacing[1] }} />
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.warningScale[800],
                lineHeight: 1.5,
              }}>
                {event.metadata.notes}
              </Text>
            </Box>
          </Box>
        )}

        {/* Review Info */}
        {event.reviewed && event.reviewedBy && (
          <Box style={{ padding: `0 ${t.spacing[5]}px ${t.spacing[3]}px` }}>
            <Box style={{
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              backgroundColor: t.colors.successScale[50],
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.successScale[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: event.reviewNotes ? t.spacing[1] : 0 }}>
                <User size={12} color={t.colors.successScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[700] }}>
                  Reviewed by {event.reviewedBy}
                  {event.reviewedAt && ` - ${formatDistanceToNow(event.reviewedAt, { addSuffix: true })}`}
                </Text>
              </Box>
              {event.reviewNotes && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600], marginTop: t.spacing[1] }}>
                  {event.reviewNotes}
                </Text>
              )}
            </Box>
          </Box>
        )}

        {/* Actions Footer */}
        {!event.reviewed && (onReview || onDismiss) && (
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
            borderTop: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.neutral[50],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: t.spacing[2],
          }}>
            {onDismiss && (
              <button
                onClick={handleDismiss}
                aria-label="Dismiss this event"
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[600],
                  cursor: 'pointer',
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  fontFamily: 'inherit',
                  boxShadow: t.shadows.sm,
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <XCircle size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm }}>Dismiss</Text>
              </button>
            )}
            {onReview && (
              <button
                onClick={handleReview}
                aria-label="Review this event"
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.primaryScale[300]}`,
                  backgroundColor: t.colors.primaryScale[600],
                  color: t.colors.common.white,
                  cursor: 'pointer',
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  fontFamily: 'inherit',
                  boxShadow: t.shadows.sm,
                  transition: `all ${t.motion.hover}`,
                }}
              >
                <Eye size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Review</Text>
              </button>
            )}
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
