'use client';

/**
 * BhProctoringEventCard - Compact Preset
 * Inline compact card variant showing event info in a single row
 * with severity indicator, candidate, type, and quick actions.
 * Ideal for sidebar lists and dense layouts.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Eye, EyeOff, CheckCircle, XCircle, ChevronRight, Clock,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  AlertTriangle, Hash, Timer, FileText,
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
    default: return AlertTriangle;
  }
}

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel } from '../../../_shared/proctoring-labels';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhProctoringEventCard = createPreset<BhProctoringEventCardProps>({
  name: 'BhProctoringEventCard.Compact',
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

    const [isHovered, setIsHovered] = useState(false);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

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

    /* Build compact metadata summary */
    const metaSummary = useMemo(() => {
      const parts: string[] = [];
      const m = metadata;
      if (m.tabSwitchCount !== undefined) parts.push(`${m.tabSwitchCount} tabs`);
      if (m.pastedTextLength !== undefined) parts.push(`${m.pastedTextLength} chars pasted`);
      if (m.focusLostDuration !== undefined) parts.push(`${m.focusLostDuration}s lost`);
      if (m.screenShareTarget) parts.push(`Shared: ${m.screenShareTarget}`);
      if (m.typingSpeedWpm !== undefined) parts.push(`${m.typingSpeedWpm} WPM`);
      return parts.join(' | ');
    }, [metadata]);

    return (
      <Box
        className={className}
        role="article"
        tabIndex={onClick ? 0 : undefined}
        aria-label={`${candidateName}: ${getEventTypeLabel(eventType)}, ${getSeverityLabel(severity)} severity`}
        onClick={onClick ? handleClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={onClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } } : undefined}
        style={{
          ...card,
          ...hoverStyles.base,
          ...(isHovered && onClick ? hoverStyles.hover : {}),
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderLeft: `3px solid ${sevColor}`,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[3],
          ...(selected ? { borderColor: t.colors.primaryScale[400], backgroundColor: t.colors.primaryScale[50] } : {}),
          ...animStyle,
          ...style,
        }}
      >
        {/* Icon */}
        <Box style={createIconContainerStyle(t, { size: 36, color: sevBg })}>
          <EventIcon size={16} color={sevColor} />
        </Box>

        {/* Main Content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1], flexWrap: 'wrap' }}>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.neutral[900],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {candidateName}
            </Text>
            <Box style={{
              ...createBadgeStyle(t, getSeverityBadgeKey(severity)),
              borderRadius: badgeRadius,
              padding: `0px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {getSeverityLabel(severity)}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <EventIcon size={11} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {getEventTypeLabel(eventType)}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : 'Unknown'}
            </Text>
          </Box>
          {metaSummary && (
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[400],
              marginTop: t.spacing[1],
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {metaSummary}
            </Text>
          )}
        </Box>

        {/* Status + Actions */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
          {reviewed ? (
            <Box style={{
              ...createBadgeStyle(t, dismissed ? 'secondary' : 'success'),
              borderRadius: badgeRadius,
              display: 'inline-flex',
              alignItems: 'center',
              gap: t.spacing[1],
            }}>
              {dismissed ? <EyeOff size={10} /> : <CheckCircle size={10} />}
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {dismissed ? 'Dismissed' : 'Reviewed'}
              </Text>
            </Box>
          ) : isHovered ? (
            <Box style={{ display: 'flex', gap: t.spacing[1] }}>
              {onReview && (
                <button
                  onClick={handleReview}
                  aria-label="Review event"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white, color: t.colors.primaryScale[600],
                    cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                    transition: `transform ${t.motion.hover}`,
                  }}
                >
                  <Eye size={12} />
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  aria-label="Dismiss event"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white, color: t.colors.neutral[500],
                    cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                    transition: `transform ${t.motion.hover}`,
                  }}
                >
                  <XCircle size={12} />
                </button>
              )}
            </Box>
          ) : null}
          {onClick && <ChevronRight size={14} color={t.colors.neutral[300]} />}
        </Box>
      </Box>
    );
  },
});
