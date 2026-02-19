'use client';

/**
 * BhEvidenceBrowser - Compact Preset
 * Single-column evidence list with personality-driven typography,
 * glass-aware surfaces, entrance animations, and full ARIA accessibility.
 *
 * Aligned with dm-scoring Evidence entity (3-level impact: positive/negative/neutral).
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhEvidenceBrowserProps, EvidenceItem, EvidenceFilter } from '../../core';
import { getImpactColors, getImpactLabel, IMPACT_OPTIONS, n } from '../../core';
import {
  createCardStyle,
  createSurfaceStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createListItemStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,

  createDividerStyle,
} from '../../../helpers';
import { FileSearch, Quote, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock Data (fallback for dev/storybook)                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhEvidenceBrowser = createPreset<BhEvidenceBrowserProps>({
  name: 'BhEvidenceBrowser.Compact',
  render: (ctx: PresetContext<BhEvidenceBrowserProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      evidence: rawEvidence = [],
      selectedEvidenceId: selectedEvidenceIdProp,
      onEvidenceSelect,
      onValidate,
      candidateName,
      interviewTitle,
      loading,
      className,
      style,
    } = props;

    const evidence = Array.isArray(rawEvidence) ? rawEvidence : [];

    /* -- State -------------------------------------------------------- */
    const [internalSelectedId, setInternalSelectedId] = useState(selectedEvidenceIdProp ?? '');

    const selectedEvidenceId = selectedEvidenceIdProp ?? internalSelectedId;

    /* -- Memoized computations ---------------------------------------- */
    const impactColors = useMemo(() => getImpactColors(t), [t]);
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);

    const validatedCount = useMemo(() => evidence.filter(e => e.isValidated).length, [evidence]);

    /* -- Callbacks ---------------------------------------------------- */
    const handleSelect = useCallback((id: string) => {
      setInternalSelectedId(id);
      onEvidenceSelect?.(id);
    }, [onEvidenceSelect]);

    const handleValidate = useCallback((evidenceId: string, isValidated: boolean, e: React.MouseEvent) => {
      e.stopPropagation();
      onValidate?.(evidenceId, isValidated);
    }, [onValidate]);

    /* -- Entrance animation styles ------------------------------------ */
    const animStyle = entranceAnim.animate;
    const animTransition = entranceAnim.transition;

    /* -- Loading state ------------------------------------------------ */
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${t.spacing[10]}px`,
          ...style,
        }} role="status" aria-label="Loading evidence">
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading...</Text>
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <Box
        className={className}
        role="region"
        aria-label={interviewTitle ? `Evidence: ${interviewTitle}` : 'Evidence list'}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...animStyle,
          transition: animTransition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 32 })}>
              <FileSearch size={16} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              {interviewTitle ?? 'Evidence'} {candidateName ? `- ${candidateName}` : ''}
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{
              ...createBadgeStyle(t, 'success'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {validatedCount}/{evidence.length} validated
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {evidence.length} items
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Evidence list */}
        <Box role="list" aria-label={`${evidence.length} evidence items`} style={{ maxHeight: 420, overflowY: 'auto' as const }}>
          {evidence.map((ev, idx) => {
            const ic = (impactColors as Record<string, any>)[ev.impact ?? ''];
            const isSelected = selectedEvidenceId === ev.id;
            const evEntrance = createEntranceAnimation(t, { index: idx });

            return (
              <Box
                key={ev.id}
                role="listitem"
                aria-selected={isSelected}
                aria-label={`${ev.dimensionCode} ${ev.dimension}: ${(ev.quote ?? '').slice(0, 60)}${(ev.quote ?? '').length > 60 ? '...' : ''} - ${getImpactLabel((ev.impact ?? ''))}${ev.isValidated ? ' (validated)' : ' (unvalidated)'}`}
                tabIndex={0}
                onClick={() => handleSelect((ev.id ?? ''))}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect((ev.id ?? '')); } }}
                style={{
                  ...createListItemStyle(t, { active: isSelected, interactive: true }),
                  padding: `${t.spacing[4]}px ${t.spacing[6]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[100]}`,
                  ...cardHover.base,
                  ...evEntrance.animate,
                  // Validation visual indicator: left accent stripe
                  borderLeft: ev.isValidated
                    ? `3px solid ${t.colors.successScale[400]}`
                    : isSelected
                      ? `3px solid ${t.colors.primaryScale[400]}`
                      : '3px solid transparent',
                }}
              >
                {/* Top: dimension code, dimension name, impact badge */}
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing[2] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.neutral[800],
                    }}>{ev.dimensionCode}</Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[400],
                    }}>{ev.dimension}</Text>
                  </Box>
                  <Box style={{
                    ...createBadgeStyle(t, ev.impact === 'positive' ? 'success' : ev.impact === 'negative' ? 'error' : 'secondary'),
                    borderRadius: badgeRadius,
                    backgroundColor: ic.bgColor,
                    border: `1px solid ${ic.border}`,
                    color: ic.color,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: ic.color, fontWeight: t.typography.fontWeight.medium }}>
                      {getImpactLabel((ev.impact ?? ''))}
                    </Text>
                  </Box>
                </Box>

                {/* Quote */}
                <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                  <Quote size={12} color={t.colors.neutral[300]} style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    color: t.colors.neutral[600],
                    fontStyle: 'italic',
                    lineHeight: t.typography.lineHeight.relaxed,
                  }}>
                    {(ev.quote ?? '').length > 120 ? `${(ev.quote ?? '').slice(0, 120)}...` : ev.quote}
                  </Text>
                </Box>

                {/* Impact explanation (if present) */}
                {ev.impactExplanation && (
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    marginBottom: t.spacing[2],
                    lineHeight: t.typography.lineHeight.normal,
                  }}>
                    {ev.impactExplanation}
                  </Text>
                )}

                {/* Bottom: score + validation status */}
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      Score: {n(ev.score)}
                    </Text>
                    {ev.similarityScore !== undefined && (
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>
                        Match: {Math.round(n(ev.similarityScore) * 100)}%
                      </Text>
                    )}
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    {/* Validation indicator -- always visible */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      {ev.isValidated ? (
                        <ShieldCheck size={12} color={t.colors.successScale[500]} aria-hidden="true" />
                      ) : (
                        <Clock size={12} color={t.colors.neutral[300]} aria-hidden="true" />
                      )}
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: ev.isValidated ? t.colors.successScale[600] : t.colors.neutral[400],
                        fontWeight: t.typography.fontWeight.medium,
                      }}>
                        {ev.isValidated ? 'Validated' : 'Pending'}
                      </Text>
                    </Box>

                    {/* Validate action button */}
                    {onValidate && (
                      <Box
                        role="button"
                        tabIndex={0}
                        aria-label={ev.isValidated ? `Unvalidate evidence: ${ev.dimensionCode}` : `Validate evidence: ${ev.dimensionCode}`}
                        onClick={(e: React.MouseEvent) => handleValidate((ev.id ?? ''), !ev.isValidated, e)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            onValidate((ev.id ?? ''), !ev.isValidated);
                          }
                        }}
                        style={{
                          ...createBadgeStyle(t, ev.isValidated ? 'success' : 'secondary'),
                          borderRadius: badgeRadius,
                          cursor: 'pointer',
                          transition: `all ${t.motion.hover}`,
                        }}
                      >
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {ev.isValidated ? 'Undo' : 'Validate'}
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}

          {/* Empty state */}
          {evidence.length === 0 && (
            <Box style={emptyStyle}>
              <Box style={createIconContainerStyle(t, { size: 48 })}>
                <FileSearch size={24} color={t.colors.neutral[300]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[400],
                marginTop: t.spacing[2],
              }}>
                No evidence available
              </Text>
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
