'use client';

/**
 * BhProctoringAlert - Toast Preset
 * Compact floating notification for proctoring events.
 * Designed for corner placement with shadow and glass.
 */

import { useMemo, useCallback} from 'react';
import {
  AlertTriangle, X, Eye, XCircle,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhProctoringAlertProps,
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

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel } from '../../../_shared/proctoring-labels';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/** Flat display shape resolved from ProctoringAlertEvent + its nested DB entity */
interface ResolvedAlertEvent {
  id: string;
  candidateName: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  summary: string;
}

const FALLBACK_EVENT: ResolvedAlertEvent = {
  id: 'unknown',
  candidateName: 'Unknown',
  eventType: 'tab_switch',
  severity: 'low',
  timestamp: new Date(),
  summary: '',
};

function resolveAlertEvent(raw: BhProctoringAlertProps['event']): ResolvedAlertEvent {
  if (!raw) return FALLBACK_EVENT;
  const flat = raw as any;
  return {
    id: flat.id ?? flat.event?.id ?? 'unknown',
    candidateName: flat.candidateName ?? 'Unknown',
    eventType: flat.eventType ?? flat.event?.eventType ?? 'tab_switch',
    severity: flat.severity ?? flat.event?.severity ?? 'low',
    timestamp: flat.timestamp ?? flat.event?.timestamp ?? new Date(),
    summary: flat.summary ?? '',
  };
}

/* ================================================================== */
/*  Toast Preset                                                       */
/* ================================================================== */

export const ToastBhProctoringAlert = createPreset<BhProctoringAlertProps>({
  name: 'BhProctoringAlert.Toast',
  render: (ctx: PresetContext<BhProctoringAlertProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      event: rawEvent,
      variant = 'toast',
      onReview,
      onDismiss,
      onClose,
      className,
      style,
    } = props;

    const event = useMemo(() => resolveAlertEvent(rawEvent), [rawEvent]);
    const card = useMemo(() => createCardStyle(t, { elevation: 'lg', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const EventIcon = useMemo(() => getEventTypeIcon(event.eventType), [event.eventType]);
    const sevColor = useMemo(() => getSeverityColor(event.severity, t), [event.severity, t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleReview = useCallback(() => {
      onReview?.(event.id);
    }, [event.id, onReview]);

    const handleDismiss = useCallback(() => {
      onDismiss?.(event.id);
    }, [event.id, onDismiss]);

    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


    return (
      <Box
        className={className}
        role="alert"
        aria-live="polite"
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          width: variant === 'banner' ? '100%' : 360,
          maxWidth: '100%',
          ...(variant === 'banner' ? { borderRadius: 0, boxShadow: 'none', borderBottom: `2px solid ${sevColor}` } : {}),
          fontFamily: 'inherit',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Severity accent bar at top */}
        <Box style={{
          height: 3,
          width: '100%',
          backgroundColor: sevColor,
          borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
        }} />

        {/* Header row with close button */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${t.spacing[3]}px ${t.spacing[4]}px ${t.spacing[1]}px`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 28, color: getSeverityBg(event.severity, t) })}>
              <EventIcon size={14} color={sevColor} />
            </Box>
            <Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                }}>
                  {getEventTypeLabel(event.eventType)}
                </Text>
                <Box style={{
                  ...createBadgeStyle(t, getSeverityBadgeKey(event.severity)),
                  borderRadius: badgeRadius,
                  padding: `0px ${t.spacing[1]}px`,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {getSeverityLabel(event.severity)}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
          <button
            onClick={handleClose}
            aria-label="Close notification"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: t.borderRadius.sm,
              border: 'none',
              backgroundColor: 'transparent',
              color: t.colors.neutral[400],
              cursor: 'pointer',
              padding: 0,
              transition: `color ${t.motion.hover}`,
            }}
          >
            <X size={14} />
          </button>
        </Box>

        {/* Content */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], padding: `${t.spacing[1]}px ${t.spacing[4]}px` }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.medium,
            color: t.colors.neutral[800],
            display: 'block',
          }}>
            {event.candidateName}
          </Text>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[500],
            lineHeight: 1.5,
            display: 'block',
            marginTop: t.spacing[1],
          }}>
            {event.summary}
          </Text>
        </Box>

        {/* Footer with actions and timestamp */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${t.spacing[2]}px ${t.spacing[4]}px ${t.spacing[3]}px`,
          marginTop: t.spacing[2],
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {formatDistanceToNow(event.timestamp, { addSuffix: true })}
          </Text>
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <button
              onClick={handleReview}
              aria-label="Review event"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: t.borderRadius.sm,
                border: `1px solid ${t.colors.primaryScale[200]}`,
                backgroundColor: t.colors.primaryScale[50],
                color: t.colors.primaryScale[700],
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Eye size={11} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.primaryScale[700] }}>Review</Text>
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss event"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: t.borderRadius.sm,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                color: t.colors.neutral[500],
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <XCircle size={11} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Dismiss</Text>
            </button>
          </Box>
        </Box>
      </Box>
    );
  },
});
