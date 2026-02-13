'use client';

/**
 * BhProctoringReview - Split Preset
 * Side-by-side layout: event detail on the left, review form on the right.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, AlertTriangle, MonitorOff, Clipboard, ScreenShare,
  Keyboard, Globe, Clock, FileText, CheckCircle, XCircle,
  ChevronDown, Send,
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
  getAccentAwareLayout,
  createDividerStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhProctoringReviewProps,
  ProctoringEventDetail,
  ProctoringEventType,
  ProctoringEventSeverity,
  ReviewSubmission,
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

const SEVERITY_OPTIONS: ProctoringEventSeverity[] = ['low', 'medium', 'high', 'critical'];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_EVENT: ProctoringEventDetail = {
  id: 'pe-1',
  scorableId: 'int-1',
  candidateName: 'Sarah Johnson',
  eventType: 'screen_share',
  severity: 'critical',
  timestamp: new Date(Date.now() - 300000),
  description: 'Candidate initiated a screen sharing session with an external application during the coding assessment. The screen share lasted approximately 45 seconds before being automatically terminated.',
  metadata: { duration: 45, application: 'Discord', detectedAt: 'question_3' },
  sessionDuration: 2400,
  reviewed: false,
  dismissed: false,
};

/* ================================================================== */
/*  Split Preset                                                       */
/* ================================================================== */

export const SplitBhProctoringReview = createPreset<BhProctoringReviewProps>({
  name: 'BhProctoringReview.Split',
  render: (ctx: PresetContext<BhProctoringReviewProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      event = MOCK_EVENT,
      onSubmitReview,
      onDismiss,
      onSeverityOverride,
      loading,
      className,
      style,
    } = props;

    const [notes, setNotes] = useState('');
    const [severityOverride, setSeverityOverride] = useState<ProctoringEventSeverity>(event.severity);
    const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const divider = useMemo(() => createDividerStyle(t), [t]);

    const EventIcon = useMemo(() => getEventTypeIcon(event.eventType), [event.eventType]);
    const sevColor = useMemo(() => getSeverityColor(event.severity, t), [event.severity, t]);

    const handleSubmit = useCallback((action: 'confirm' | 'dismiss') => {
      const review: ReviewSubmission = {
        eventId: event.id,
        notes,
        severityOverride: severityOverride !== event.severity ? severityOverride : undefined,
        action,
      };
      onSubmitReview?.(review);
    }, [event.id, event.severity, notes, severityOverride, onSubmitReview]);

    const handleDismiss = useCallback(() => {
      onDismiss?.(event.id);
    }, [event.id, onDismiss]);

    const handleSeverityChange = useCallback((sev: ProctoringEventSeverity) => {
      setSeverityOverride(sev);
      setShowSeverityDropdown(false);
      onSeverityOverride?.(event.id, sev);
    }, [event.id, onSeverityOverride]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: t.spacing[6],
          minHeight: 400,
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Left: Event Detail */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden', ...animStyle(0), ...(accentBar ? accentLayout.outer : {}) }}>
          {accentBar && <Box style={accentBar} />}

          <Box style={accentBar ? accentLayout.inner : {}}>
          <Box style={{ padding: t.spacing[5] }}>
            {/* Event Header */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: getSeverityBg(event.severity, t) })}>
                <EventIcon size={22} color={sevColor} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                  display: 'block',
                }}>
                  {getEventTypeLabel(event.eventType)}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                  <Box style={{
                    ...createBadgeStyle(t, getSeverityBadgeKey(event.severity)),
                    borderRadius: badgeRadius,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>
                      {getSeverityLabel(event.severity)}
                    </Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box as="hr" style={divider} />

            {/* Candidate Info */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginTop: t.spacing[4], marginBottom: t.spacing[4] }}>
              <Text style={{ ...sectionLabel }}>Candidate</Text>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
                display: 'block',
              }}>
                {event.candidateName}
              </Text>
            </Box>

            {/* Description */}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], marginBottom: t.spacing[4] }}>
              <Text style={{ ...sectionLabel }}>Description</Text>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[600],
                lineHeight: 1.6,
                display: 'block',
              }}>
                {event.description}
              </Text>
            </Box>

            {/* Metadata */}
            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <Box style={{ marginBottom: t.spacing[4] }}>
                <Text style={{ ...sectionLabel }}>Details</Text>
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <Box key={key} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[500],
                        textTransform: 'capitalize' as const,
                      }}>
                        {key.replace(/_/g, ' ')}
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.medium,
                        color: t.colors.neutral[700],
                      }}>
                        {String(value)}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Timing */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Clock size={14} color={t.colors.neutral[400]} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Session duration: {event.sessionDuration ? `${Math.floor(event.sessionDuration / 60)}m` : 'N/A'}
              </Text>
            </Box>
          </Box>
          </Box>
        </Box>

        {/* Right: Review Form */}
        <Box style={{ ...card, padding: 0, overflow: 'hidden', ...animStyle(1), ...(accentBar ? accentLayout.outer : {}) }}>
          {accentBar && <Box style={accentBar} />}
          <Box style={accentBar ? accentLayout.inner : {}}>
          <Box style={{ padding: t.spacing[5], display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[5] }}>
              <FileText size={18} color={t.colors.primaryScale[600]} />
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Review Event
              </Text>
            </Box>

            {/* Severity Override */}
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{ ...sectionLabel }}>Severity Override</Text>
              <Box style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowSeverityDropdown(!showSeverityDropdown)}
                  aria-label="Select severity override"
                  aria-expanded={showSeverityDropdown}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    backgroundColor: t.colors.common.white,
                    cursor: 'pointer',
                    fontSize: t.typography.fontSize.sm,
                    color: t.colors.neutral[800],
                    fontFamily: 'inherit',
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Box style={{
                      width: 10, height: 10,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: getSeverityColor(severityOverride, t),
                    }} />
                    <Text style={{ fontSize: t.typography.fontSize.sm }}>
                      {getSeverityLabel(severityOverride)}
                    </Text>
                  </Box>
                  <ChevronDown size={14} color={t.colors.neutral[400]} />
                </button>
                {showSeverityDropdown && (
                  <Box style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: t.spacing[1],
                    backgroundColor: t.colors.common.white,
                    borderRadius: t.borderRadius.md,
                    border: `1px solid ${t.colors.neutral[200]}`,
                    boxShadow: t.shadows.md,
                    zIndex: 10,
                    overflow: 'hidden',
                  }} role="listbox" aria-label="Severity options">
                    {SEVERITY_OPTIONS.map((sev) => (
                      <Box
                        key={sev}
                        role="option"
                        aria-selected={severityOverride === sev}
                        tabIndex={0}
                        onClick={() => handleSeverityChange(sev)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSeverityChange(sev); } }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: t.spacing[2],
                          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                          cursor: 'pointer',
                          backgroundColor: severityOverride === sev ? t.colors.primaryScale[50] : t.colors.common.white,
                          transition: `background-color ${t.motion.hover}`,
                        }}
                      >
                        <Box style={{
                          width: 10, height: 10,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: getSeverityColor(sev, t),
                        }} />
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                          {getSeverityLabel(sev)}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            {/* Notes */}
            <Box style={{ marginBottom: t.spacing[5], flex: 1 }}>
              <Text style={{ ...sectionLabel }}>Review Notes</Text>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your review notes here..."
                aria-label="Review notes"
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: t.spacing[3],
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm,
                  color: t.colors.neutral[800],
                  fontFamily: 'inherit',
                  resize: 'vertical' as const,
                  lineHeight: 1.6,
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
            </Box>

            {/* Actions */}
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              <button
                onClick={() => handleSubmit('confirm')}
                disabled={loading}
                aria-label="Confirm and flag event"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderRadius: t.borderRadius.md,
                  border: 'none',
                  backgroundColor: t.colors.errorScale[600],
                  color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.semibold,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'inherit',
                  transition: `opacity ${t.motion.hover}`,
                }}
              >
                <AlertTriangle size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Confirm Flag</Text>
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
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderRadius: t.borderRadius.md,
                  border: `1px solid ${t.colors.neutral[200]}`,
                  backgroundColor: t.colors.common.white,
                  color: t.colors.neutral[700],
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.medium,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  fontFamily: 'inherit',
                  transition: `opacity ${t.motion.hover}`,
                }}
              >
                <XCircle size={14} />
                <Text style={{ fontSize: t.typography.fontSize.sm }}>Dismiss</Text>
              </button>
            </Box>
          </Box>
        </Box>
      </Box>
      </Box>
    );
  },
});
