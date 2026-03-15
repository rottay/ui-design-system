'use client';

/**
 * BhProctoringReview - Stacked Preset
 * Top-bottom layout for mobile: event detail on top, review form below.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  Shield, AlertTriangle, MonitorOff, Clipboard, ScreenShare,
  Keyboard, Globe, Clock, FileText, CheckCircle, XCircle,
  ChevronDown,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  formatDistanceToNow,
  getAccentAwareLayout,

  createCardHoverStyles,
  createDividerStyle,
  createEmptyStateStyle,
} from '../../../helpers';
import type {
  BhProctoringReviewProps,
  ProctoringReviewEventView,
  ProctoringEventSeverity,
  ReviewSubmission,
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

const SEVERITY_OPTIONS: ProctoringEventSeverity[] = ['low', 'medium', 'high', 'critical'];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Stacked Preset                                                     */
/* ================================================================== */

export const StackedBhProctoringReview = createPreset<BhProctoringReviewProps>({
  name: 'BhProctoringReview.Stacked',
  render: (ctx: PresetContext<BhProctoringReviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      event: rawEventView,
      onSubmitReview,
      onDismiss,
      onSeverityOverride,
      loading,
      className,
      style,
    } = props;

    const eventView = (rawEventView ?? {}) as Partial<ProctoringReviewEventView>;

    /* Safely extract fields from the View wrapper */
    const ev = eventView?.event;
    const eventId = ev?.id ?? '';
    const eventType = ev?.eventType;
    const severity = ev?.severity;
    const timestamp = ev?.timestamp ?? new Date();
    const metadata = ev?.metadata as Record<string, unknown> | undefined;
    const reviewed = ev?.reviewed ?? false;
    const dismissed = ev?.dismissed ?? false;
    const candidateName = eventView?.candidateName ?? 'Unknown';
    const description = eventView?.description ?? '';
    const sessionDuration = eventView?.sessionDuration;

    const [notes, setNotes] = useState('');
    const [severityOverride, setSeverityOverride] = useState<ProctoringEventSeverity | undefined>(severity);
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const EventIcon = useMemo(() => getEventTypeIcon(eventType), [eventType]);
    const sevColor = useMemo(() => getSeverityColor(severity, t), [severity, t]);

    const handleSubmit = useCallback((action: 'confirm' | 'dismiss') => {
      const review: ReviewSubmission = {
        eventId,
        notes,
        severityOverride: severityOverride !== severity ? severityOverride : undefined,
        action,
      };
      onSubmitReview?.(review);
    }, [eventId, severity, notes, severityOverride, onSubmitReview]);

    const handleDismiss = useCallback(() => {
      onDismiss?.(eventId);
    }, [eventId, onDismiss]);

    const handleSeverityChange = useCallback((sev: ProctoringEventSeverity) => {
      setSeverityOverride(sev);
      setShowSeverityDropdown(false);
      onSeverityOverride?.(eventId, sev);
    }, [eventId, onSeverityOverride]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    return (
      <Box
        className={className}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: t.spacing[4],
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Event Detail Card */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden', ...animStyle(0) }}>
          {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

          {/* Compact header */}
          <Box style={{
            padding: `${t.spacing[4]}px ${t.spacing[4]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[3],
          }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: getSeverityBg(severity, t) })}>
              <EventIcon size={18} color={sevColor} />
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                }}>
                  {getEventTypeLabel(eventType)}
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
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], marginTop: 1 }}>
                {candidateName} -- {formatDistanceToNow(timestamp, { addSuffix: true })}
              </Text>
            </Box>
          </Box>

          {/* Description */}
          <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[600],
              lineHeight: 1.6,
              display: 'block',
            }}>
              {description}
            </Text>

            {/* Metadata row */}
            {metadata && Object.keys(metadata).length > 0 && (
              <Box style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: t.spacing[3],
                marginTop: t.spacing[3],
              }}>
                {Object.entries(metadata).map(([key, value]) => (
                  <Box key={key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    backgroundColor: t.colors.neutral[50],
                    borderRadius: t.borderRadius.sm,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: 'capitalize' as const }}>
                      {key.replace(/_/g, ' ')}:
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                      {String(value)}
                    </Text>
                  </Box>
                ))}
                {sessionDuration && (
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    backgroundColor: t.colors.neutral[50],
                    borderRadius: t.borderRadius.sm,
                  }}>
                    <Clock size={10} color={t.colors.neutral[400]} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {Math.floor(sessionDuration / 60)}m session
                    </Text>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Review Form Card */}
        <Box style={{ ...card, padding: t.spacing[4], ...animStyle(1) }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: ptypo.headingWeight,
            color: t.colors.neutral[900],
            marginBottom: t.spacing[3],
            display: 'block',
          }}>
            Review
          </Text>

          {/* Severity override inline */}
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Severity</Text>
            <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' }} role="radiogroup" aria-label="Severity selection">
              {SEVERITY_OPTIONS.map((sev) => (
                <button
                  key={sev}
                  role="radio"
                  aria-checked={severityOverride === sev}
                  onClick={() => handleSeverityChange(sev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: t.spacing[1],
                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                    borderRadius: badgeRadius,
                    border: `1px solid ${severityOverride === sev ? getSeverityColor(sev, t) : t.colors.neutral[200]}`,
                    backgroundColor: severityOverride === sev ? getSeverityBg(sev, t) : t.colors.common.white,
                    cursor: 'pointer',
                    fontSize: t.typography.fontSize.xs,
                    color: severityOverride === sev ? getSeverityColor(sev, t) : t.colors.neutral[600],
                    fontFamily: 'inherit',
                    fontWeight: t.typography.fontWeight.medium,
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Box style={{
                    width: 8, height: 8,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: getSeverityColor(sev, t),
                  }} />
                  {getSeverityLabel(sev)}
                </button>
              ))}
            </Box>
          </Box>

          {/* Notes */}
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[1] }}>Notes</Text>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Review notes..."
              aria-label="Review notes"
              rows={3}
              style={{
                width: '100%',
                padding: t.spacing[2],
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[800],
                fontFamily: 'inherit',
                resize: 'vertical' as const,
                lineHeight: 1.5,
                outline: 'none',
                boxSizing: 'border-box' as const,
              }}
            />
          </Box>

          {/* Actions */}
          <Box style={{ display: 'flex', gap: t.spacing[2] }}>
            <button
              onClick={() => handleSubmit('confirm')}
              disabled={loading}
              aria-label="Confirm and flag event"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                border: 'none',
                backgroundColor: t.colors.errorScale[600],
                color: t.colors.common.white,
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              <AlertTriangle size={13} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Flag</Text>
            </button>
            <button
              onClick={handleDismiss}
              disabled={loading}
              aria-label="Dismiss event"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: t.spacing[1],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                color: t.colors.neutral[700],
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              <XCircle size={13} />
              <Text style={{ fontSize: t.typography.fontSize.sm }}>Dismiss</Text>
            </button>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
