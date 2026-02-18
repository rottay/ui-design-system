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
  ProctoringEventCardView,
  ProctoringEventType,
  ProctoringEventSeverity,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverityColor(severity: string | undefined, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'high': return t.colors.errorScale[400];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.infoScale[500];
    default: return t.colors.neutral[400];
  }
}

function getSeverityBg(severity: string | undefined, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[50];
    case 'high': return t.colors.errorScale[50];
    case 'medium': return t.colors.warningScale[50];
    case 'low': return t.colors.infoScale[50];
    default: return t.colors.neutral[50];
  }
}

function getSeverityBadgeKey(severity: string | undefined): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low':
    default: return 'info';
  }
}

function getEventTypeIcon(type: string | undefined) {
  switch (type) {
    case 'tab_switch': return MonitorOff;
    case 'copy_paste': return Clipboard;
    case 'screen_share': return ScreenShare;
    case 'unusual_typing': return Keyboard;
    case 'browser_focus_lost': return Globe;
    default: return Shield;
  }
}

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel, getEventTypeDescription } from '@rottay/scoring';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

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
      event: rawEventView,
      onReview,
      onDismiss,
      onClick,
      selected,
      className,
      style,
    } = props;

    const eventView = (rawEventView ?? {}) as Partial<ProctoringEventCardView>;

    const ev = eventView?.event;
    const candidateName = eventView?.candidateName ?? 'Unknown';
    const eventType = ev?.eventType;
    const severity = ev?.severity;
    const timestamp = ev?.timestamp;
    const metadata = (ev?.metadata ?? {}) as Record<string, unknown>;
    const reviewed = ev?.reviewed ?? false;
    const dismissed = ev?.dismissed ?? false;
    const reviewedBy = ev?.reviewedBy;
    const reviewedAt = ev?.reviewedAt;
    const reviewNotes = ev?.reviewNotes;

    const [isHovered, setIsHovered] = useState(false);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sevColor = useMemo(() => getSeverityColor(severity, t), [severity, t]);
    const sevBg = useMemo(() => getSeverityBg(severity, t), [severity, t]);
    const EventIcon = useMemo(() => getEventTypeIcon(eventType), [eventType]);

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
      const m = metadata;

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
        items.push({ icon: Monitor, label: 'Shared To', value: String(m.screenShareTarget) });
      }
      if (m.typingSpeedWpm !== undefined) {
        items.push({ icon: Zap, label: 'Typing Speed', value: `${m.typingSpeedWpm} WPM` });
      }
      if (m.ipAddress) {
        items.push({ icon: MapPin, label: 'IP Address', value: String(m.ipAddress) });
      }

      return items;
    }, [metadata]);

    return (
      <Box
        className={className}
        role="article"
        tabIndex={onClick ? 0 : undefined}
        aria-label={`Proctoring event: ${candidateName}, ${getEventTypeLabel(eventType)}, ${getSeverityLabel(severity)} severity`}
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
                  {candidateName}
                </Text>
                <Box style={{
                  ...createBadgeStyle(t, getSeverityBadgeKey(severity)),
                  borderRadius: badgeRadius,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {getSeverityLabel(severity)}
                  </Text>
                </Box>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <EventIcon size={12} color={t.colors.neutral[500]} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[600] }}>
                  {getEventTypeLabel(eventType)}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : 'Unknown'}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Status badge */}
          {reviewed && (
            <Box style={{
              ...createBadgeStyle(t, dismissed ? 'secondary' : 'success'),
              borderRadius: badgeRadius,
              display: 'inline-flex',
              alignItems: 'center',
              gap: t.spacing[1],
              flexShrink: 0,
            }}>
              {dismissed ? <EyeOff size={10} /> : <CheckCircle size={10} />}
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {dismissed ? 'Dismissed' : 'Reviewed'}
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
            {getEventTypeDescription(eventType)}
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
        {!!metadata.notes && (
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
                {String(metadata.notes)}
              </Text>
            </Box>
          </Box>
        )}

        {/* Review Info */}
        {reviewed && reviewedBy && (
          <Box style={{ padding: `0 ${t.spacing[5]}px ${t.spacing[3]}px` }}>
            <Box style={{
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              backgroundColor: t.colors.successScale[50],
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.successScale[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: reviewNotes ? t.spacing[1] : 0 }}>
                <User size={12} color={t.colors.successScale[600]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[700] }}>
                  Reviewed by {reviewedBy}
                  {reviewedAt && ` - ${formatDistanceToNow(reviewedAt, { addSuffix: true })}`}
                </Text>
              </Box>
              {reviewNotes && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600], marginTop: t.spacing[1] }}>
                  {reviewNotes}
                </Text>
              )}
            </Box>
          </Box>
        )}

        {/* Actions Footer */}
        {!reviewed && (onReview || onDismiss) && (
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
