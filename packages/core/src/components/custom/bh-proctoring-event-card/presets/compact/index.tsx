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
  ProctoringEventDetail,
  ProctoringEventType,
  ProctoringEventSeverity,
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

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_EVENT: ProctoringEventDetail = {
  id: 'pe-compact-1',
  candidateName: 'Michael Chen',
  eventType: 'copy_paste',
  severity: 'high',
  timestamp: new Date(Date.now() - 900000),
  metadata: {
    pastedTextLength: 245,
    tabSwitchCount: 2,
    ipAddress: '10.0.0.15',
  },
  reviewed: false,
  dismissed: false,
};

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

    /* Build compact metadata summary */
    const metaSummary = useMemo(() => {
      const parts: string[] = [];
      const m = event.metadata;
      if (m.tabSwitchCount !== undefined) parts.push(`${m.tabSwitchCount} tabs`);
      if (m.pastedTextLength !== undefined) parts.push(`${m.pastedTextLength} chars pasted`);
      if (m.focusLostDuration !== undefined) parts.push(`${m.focusLostDuration}s lost`);
      if (m.screenShareTarget) parts.push(`Shared: ${m.screenShareTarget}`);
      if (m.typingSpeedWpm !== undefined) parts.push(`${m.typingSpeedWpm} WPM`);
      return parts.join(' | ');
    }, [event.metadata]);

    return (
      <Box
        className={className}
        role="article"
        tabIndex={onClick ? 0 : undefined}
        aria-label={`${event.candidateName}: ${getEventTypeLabel(event.eventType)}, ${getSeverityLabel(event.severity)} severity`}
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
              {event.candidateName}
            </Text>
            <Box style={{
              ...createBadgeStyle(t, getSeverityBadgeKey(event.severity)),
              borderRadius: badgeRadius,
              padding: `0px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {getSeverityLabel(event.severity)}
              </Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <EventIcon size={11} color={t.colors.neutral[400]} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {getEventTypeLabel(event.eventType)}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {formatDistanceToNow(event.timestamp, { addSuffix: true })}
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
          {event.reviewed ? (
            <Box style={{
              ...createBadgeStyle(t, event.dismissed ? 'secondary' : 'success'),
              borderRadius: badgeRadius,
              display: 'inline-flex',
              alignItems: 'center',
              gap: t.spacing[1],
            }}>
              {event.dismissed ? <EyeOff size={10} /> : <CheckCircle size={10} />}
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {event.dismissed ? 'Dismissed' : 'Reviewed'}
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
