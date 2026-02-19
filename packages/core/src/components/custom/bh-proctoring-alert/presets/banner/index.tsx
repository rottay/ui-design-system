'use client';

/**
 * BhProctoringAlert - Banner Preset
 * Full-width sticky banner for critical proctoring events.
 * Shows severity icon, event summary, candidate name, quick actions.
 */

import { useMemo, useCallback} from 'react';
import {
  Shield, AlertTriangle, X, Eye, XCircle,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
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
    case 'high': return t.colors.errorScale[100];
    case 'medium': return t.colors.warningScale[50];
    case 'low': return t.colors.infoScale[50];
  }
}

function getSeverityBorderColor(severity: ProctoringEventSeverity, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[200];
    case 'high': return t.colors.errorScale[200];
    case 'medium': return t.colors.warningScale[200];
    case 'low': return t.colors.infoScale[200];
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
  dismissed?: boolean;
  dismissedBy?: string;
  metadata?: Record<string, unknown>;
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
  // Support both flat (mock/inline) and nested (ProctoringAlertEvent) shapes
  const flat = raw as any;
  return {
    id: flat.id ?? flat.event?.id ?? 'unknown',
    candidateName: flat.candidateName ?? 'Unknown',
    eventType: flat.eventType ?? flat.event?.eventType ?? 'tab_switch',
    severity: flat.severity ?? flat.event?.severity ?? 'low',
    timestamp: flat.timestamp ?? flat.event?.timestamp ?? new Date(),
    summary: flat.summary ?? '',
    dismissed: flat.dismissed ?? flat.event?.dismissed ?? false,
    dismissedBy: flat.dismissedBy,
    metadata: flat.metadata ?? flat.event?.metadata,
  };
}

/* ================================================================== */
/*  Banner Preset                                                      */
/* ================================================================== */

export const BannerBhProctoringAlert = createPreset<BhProctoringAlertProps>({
  name: 'BhProctoringAlert.Banner',
  render: (ctx: PresetContext<BhProctoringAlertProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      event: rawEvent,
      variant = 'banner',
      onReview,
      onDismiss,
      onClose,
      className,
      style,
    } = props;

    const event = useMemo(() => resolveAlertEvent(rawEvent), [rawEvent]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const EventIcon = useMemo(() => getEventTypeIcon(event.eventType), [event.eventType]);
    const sevColor = useMemo(() => getSeverityColor(event.severity, t), [event.severity, t]);
    const sevBg = useMemo(() => getSeverityBg(event.severity, t), [event.severity, t]);
    const sevBorder = useMemo(() => getSeverityBorderColor(event.severity, t), [event.severity, t]);
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
        aria-live="assertive"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[4],
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          backgroundColor: sevBg,
          borderBottom: `2px solid ${sevBorder}`,
          fontFamily: 'inherit',
          position: variant === 'toast' ? 'fixed' : 'sticky',
          top: variant === 'toast' ? t.spacing[4] : 0,
          right: variant === 'toast' ? t.spacing[4] : undefined,
          zIndex: 50,
          ...(variant === 'toast' ? { maxWidth: 420, borderRadius: t.borderRadius.lg, boxShadow: t.shadows.lg } : {}),
          ...animStyle,
          ...(isGlass && t.glass ? {
            backdropFilter: t.glass.blur,
            WebkitBackdropFilter: t.glass.blur,
          } : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Severity icon */}
        <Box style={createIconContainerStyle(t, { size: 36, color: sevBg })}>
          <EventIcon size={18} color={sevColor} />
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap' }}>
            <Box style={{
              ...createBadgeStyle(t, getSeverityBadgeKey(event.severity)),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {getSeverityLabel(event.severity)}
              </Text>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[900],
            }}>
              {getEventTypeLabel(event.eventType)}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              --
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.medium,
              color: t.colors.neutral[700],
            }}>
              {event.candidateName}
            </Text>
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.xs,
            color: t.colors.neutral[600],
            marginTop: t.spacing[1],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            maxWidth: '100%',
          }}>
            {event.summary}
          </Text>
          {event.dismissed && (
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
              <Box style={{
                ...createBadgeStyle(t, 'secondary'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: t.spacing[1],
              }}>
                <XCircle size={10} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  Dismissed{event.dismissedBy ? ` by ${event.dismissedBy}` : ''}
                </Text>
              </Box>
            </Box>
          )}
        </Box>

        {/* Timestamp */}
        <Text style={{
          fontSize: t.typography.fontSize.xs,
          color: t.colors.neutral[400],
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {formatDistanceToNow(event.timestamp, { addSuffix: true })}
        </Text>

        {/* Actions */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
          <button
            onClick={handleReview}
            aria-label="Review event"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[1],
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              border: `1px solid ${sevColor}`,
              backgroundColor: t.colors.common.white,
              color: sevColor,
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Eye size={12} />
            <Text style={{ fontSize: t.typography.fontSize.xs, color: sevColor }}>Review</Text>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss event"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[1],
              padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white,
              color: t.colors.neutral[600],
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <XCircle size={12} />
            <Text style={{ fontSize: t.typography.fontSize.xs }}>Dismiss</Text>
          </button>
          <button
            onClick={handleClose}
            aria-label="Close alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: t.borderRadius.md,
              border: 'none',
              backgroundColor: 'transparent',
              color: t.colors.neutral[400],
              cursor: 'pointer',
              padding: 0,
              transition: `color ${t.motion.hover}`,
            }}
          >
            <X size={16} />
          </button>
        </Box>
      </Box>
    );
  },
});
