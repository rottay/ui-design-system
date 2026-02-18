'use client';

/**
 * BhEvidenceBrowser - Split Pane Preset
 * Full split-pane layout: transcript left, evidence sidebar right.
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 *
 * Aligned with dm-scoring Evidence entity (3-level impact: positive/negative/neutral).
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhEvidenceBrowserProps, EvidenceImpact, TranscriptSegment, EvidenceItem, EvidenceFilter } from '../../core';
import { getImpactColors, getImpactLabel, getSpeakerColors, IMPACT_OPTIONS, n } from '../../core';
import {
  createCardStyle,
  createSurfaceStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  createDividerStyle,
} from '../../../helpers';
import { FileSearch, Quote, CheckCircle2, XCircle, Filter, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock Data (fallback for dev/storybook)                             */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const SplitPaneBhEvidenceBrowser = createPreset<BhEvidenceBrowserProps>({
  name: 'BhEvidenceBrowser.SplitPane',
  render: (ctx: PresetContext<BhEvidenceBrowserProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      transcript: rawTranscript = [],
      evidence: rawEvidence = [],
      dimensions: rawDimensions = [],
      selectedEvidenceId: selectedEvidenceIdProp,
      onEvidenceSelect,
      onValidate,
      filter,
      onFilterChange,
      candidateName,
      interviewTitle,
      loading,
      className,
      style,
    } = props;

    const transcript = Array.isArray(rawTranscript) ? rawTranscript : [];
    const evidence = Array.isArray(rawEvidence) ? rawEvidence : [];
    const dimensions = Array.isArray(rawDimensions) ? rawDimensions : [];

    /* -- State -------------------------------------------------------- */
    const [internalSelectedId, setInternalSelectedId] = useState(selectedEvidenceIdProp ?? '');
    const [internalFilter, setInternalFilter] = useState<EvidenceFilter>({});
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedEvidenceId = selectedEvidenceIdProp ?? internalSelectedId;
    const activeFilter = filter ?? internalFilter;

    /* -- Memoized computations ---------------------------------------- */
    const impactColors = useMemo(() => getImpactColors(t), [t]);
    const speakerColors = useMemo(() => getSpeakerColors(t), [t]);
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const dividerStyle = useMemo(() => createDividerStyle(t), [t]);

    const filteredEvidence = useMemo(() => {
      return evidence.filter(e => {
        if (activeFilter.dimension && e.dimension !== activeFilter.dimension) return false;
        if (activeFilter.impact && e.impact !== activeFilter.impact) return false;
        if (activeFilter.isValidated !== undefined && e.isValidated !== activeFilter.isValidated) return false;
        return true;
      });
    }, [evidence, activeFilter]);

    const uniqueDimensions = useMemo(() => {
      return dimensions.length > 0 ? dimensions : [...new Set(evidence.map(e => e.dimension))];
    }, [dimensions, evidence]);

    const highlightedSegmentIds = useMemo(() => {
      return new Set(filteredEvidence.map(e => e.transcriptSegmentId).filter(Boolean));
    }, [filteredEvidence]);

    const validatedCount = useMemo(() => filteredEvidence.filter(e => e.isValidated).length, [filteredEvidence]);

    /* -- Callbacks ---------------------------------------------------- */
    const handleEvidenceSelect = useCallback((id: string) => {
      setInternalSelectedId(id);
      onEvidenceSelect?.(id);
    }, [onEvidenceSelect]);

    const handleFilterChange = useCallback((newFilter: EvidenceFilter) => {
      setInternalFilter(newFilter);
      onFilterChange?.(newFilter);
    }, [onFilterChange]);

    const handleValidate = useCallback((evidenceId: string, isValidated: boolean, e: React.MouseEvent) => {
      e.stopPropagation();
      onValidate?.(evidenceId, isValidated);
    }, [onValidate]);

    /* -- Entrance animation styles ------------------------------------ */
    const animStyle = entranceAnim.animate;
    const animTransition = entranceAnim.transition;

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: `${t.spacing[10]}px`,
          ...style,
        }} role="status" aria-label="Loading evidence browser">
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading evidence...</Text>
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        ref={containerRef}
        className={className}
        role="region"
        aria-label={interviewTitle ? `Evidence browser: ${interviewTitle}` : 'Evidence browser'}
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
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              {interviewTitle ?? 'Evidence Browser'}
            </Text>
            {candidateName && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                {candidateName}
              </Text>
            )}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{
              ...createBadgeStyle(t, 'success'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {validatedCount}/{filteredEvidence.length} validated
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {filteredEvidence.length} items
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Filters */}
        <Box
          role="toolbar"
          aria-label="Evidence filters"
          style={{
            padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex',
            gap: t.spacing[3],
            flexWrap: 'wrap' as const,
            alignItems: 'center',
          }}
        >
          <Filter size={14} color={t.colors.neutral[400]} aria-hidden="true" />

          {/* Dimension filters */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexWrap: 'wrap' as const }} role="group" aria-label="Dimension filters">
            <Box
              onClick={() => handleFilterChange({ ...activeFilter, dimension: undefined })}
              role="button"
              tabIndex={0}
              aria-pressed={!activeFilter.dimension}
              aria-label="All dimensions"
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...activeFilter, dimension: undefined }); } }}
              style={createFilterPillStyle(t, { active: !activeFilter.dimension })}
            >
              <Text style={{ fontSize: t.typography.fontSize.xs }}>All</Text>
            </Box>
            {uniqueDimensions.map(dim => (
              <Box
                key={dim}
                onClick={() => handleFilterChange({ ...activeFilter, dimension: dim })}
                role="button"
                tabIndex={0}
                aria-pressed={activeFilter.dimension === dim}
                aria-label={`Filter by ${dim}`}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...activeFilter, dimension: dim }); } }}
                style={createFilterPillStyle(t, { active: activeFilter.dimension === dim })}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{dim}</Text>
              </Box>
            ))}
          </Box>

          {/* Divider */}
          <Box style={{ width: 1, height: 16, backgroundColor: t.colors.neutral[200], flexShrink: 0 }} aria-hidden="true" />

          {/* Impact filters */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexWrap: 'wrap' as const }} role="group" aria-label="Impact filters">
            <Box
              onClick={() => handleFilterChange({ ...activeFilter, impact: undefined })}
              role="button"
              tabIndex={0}
              aria-pressed={!activeFilter.impact}
              aria-label="All impacts"
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...activeFilter, impact: undefined }); } }}
              style={createFilterPillStyle(t, { active: !activeFilter.impact })}
            >
              <Text style={{ fontSize: t.typography.fontSize.xs }}>All</Text>
            </Box>
            {IMPACT_OPTIONS.map(imp => {
              const isActive = activeFilter.impact === imp;
              const ic = impactColors[imp];
              return (
                <Box
                  key={imp}
                  onClick={() => handleFilterChange({ ...activeFilter, impact: imp })}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`Filter by ${getImpactLabel(imp)}`}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFilterChange({ ...activeFilter, impact: imp }); } }}
                  style={{
                    ...createFilterPillStyle(t, { active: isActive }),
                    ...(isActive ? { backgroundColor: ic.bgColor, color: ic.color, borderColor: ic.border } : {}),
                  }}
                >
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{getImpactLabel(imp)}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Split Pane - responsive with flex-wrap and min-width */}
        <Box style={{ display: 'flex', flexWrap: 'wrap' as const, minHeight: 400 }}>
          {/* Transcript Panel */}
          <Box
            role="log"
            aria-label="Interview transcript"
            style={{
              flex: '1 1 360px',
              minWidth: 300,
              maxHeight: 520,
              overflowY: 'auto' as const,
              padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
              borderRight: `1px solid ${t.colors.neutral[100]}`,
            }}
          >
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              {transcript.map((seg, idx) => {
                const isHighlighted = highlightedSegmentIds.has(seg.id);
                const sc = speakerColors[seg.speaker];
                const segEntrance = createEntranceAnimation(t, { index: idx });
                return (
                  <Box
                    key={seg.id}
                    aria-label={`${seg.speakerName} at ${seg.timestamp}`}
                    style={{
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderRadius: t.borderRadius.lg,
                      background: isHighlighted ? t.colors.warningScale[50] : 'transparent',
                      borderLeft: isHighlighted ? `3px solid ${t.colors.warningScale[400]}` : '3px solid transparent',
                      transition: `all ${t.motion.hover}`,
                      ...segEntrance.animate,
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                        width: 8, height: 8, borderRadius: t.borderRadius.full,
                        backgroundColor: sc.color, flexShrink: 0,
                      }} aria-hidden="true" />
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.bold,
                        color: sc.color,
                      }}>{seg.speakerName}</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{seg.timestamp}</Text>
                      {isHighlighted && (
                        <Box style={{
                          ...createBadgeStyle(t, 'warning'),
                          borderRadius: badgeRadius,
                          padding: `0px ${t.spacing[1]}px`,
                        }}>
                          <Text style={{ fontSize: '10px' }}>has evidence</Text>
                        </Box>
                      )}
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      color: t.colors.neutral[700],
                      lineHeight: t.typography.lineHeight.relaxed,
                    }}>{seg.text}</Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Evidence Sidebar */}
          <Box
            role="list"
            aria-label={`Evidence items (${filteredEvidence.length})`}
            style={{
              flex: '0 0 340px',
              minWidth: 280,
              maxHeight: 520,
              overflowY: 'auto' as const,
              padding: `${t.spacing[4]}px`,
              ...createSurfaceStyle(t, { elevation: 'sm', glass: isGlass }),
              border: 'none',
              borderRadius: 0,
              backgroundColor: isGlass ? undefined : t.colors.neutral[50],
            }}
          >
            <Text style={sectionHeader}>
              Evidence ({filteredEvidence.length})
            </Text>

            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              {filteredEvidence.map((ev, idx) => {
                const ic = (impactColors as Record<string, any>)[ev.impact ?? ''];
                const isSelected = selectedEvidenceId === ev.id;
                const evEntrance = createEntranceAnimation(t, { index: idx });

                return (
                  <Box
                    key={ev.id}
                    role="listitem"
                    aria-selected={isSelected}
                    aria-label={`${ev.dimensionCode}: ${(ev.quote ?? '').slice(0, 60)}${(ev.quote ?? '').length > 60 ? '...' : ''} - ${getImpactLabel((ev.impact ?? ''))}${ev.isValidated ? ' (validated)' : ' (unvalidated)'}`}
                    tabIndex={0}
                    onClick={() => handleEvidenceSelect((ev.id ?? ''))}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEvidenceSelect((ev.id ?? '')); } }}
                    style={{
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      borderRadius: t.borderRadius.lg,
                      backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                      border: `1px solid ${isSelected ? t.colors.primaryScale[200] : t.colors.neutral[100]}`,
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                      boxShadow: t.shadows.sm,
                      ...cardHover.base,
                      ...evEntrance.animate,
                      position: 'relative' as const,
                      // Validation visual indicator: left accent stripe
                      borderLeft: ev.isValidated
                        ? `3px solid ${t.colors.successScale[400]}`
                        : `3px solid ${t.colors.neutral[200]}`,
                    }}
                  >
                    {/* Top row: dimension + impact badge */}
                    <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.bold,
                          color: t.colors.neutral[800],
                        }}>{ev.dimensionCode}</Text>
                        {ev.speakerRole && (
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[400],
                          }}>{ev.speakerName || ev.speakerRole}</Text>
                        )}
                      </Box>
                      <Box style={{
                        ...createBadgeStyle(t, ev.impact === 'positive' ? 'success' : ev.impact === 'negative' ? 'error' : 'secondary'),
                        borderRadius: badgeRadius,
                        backgroundColor: ic.bgColor,
                        border: `1px solid ${ic.border}`,
                        color: ic.color,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: ic.color, fontWeight: t.typography.fontWeight.semibold }}>
                          {getImpactLabel((ev.impact ?? ''))}
                        </Text>
                      </Box>
                    </Box>

                    {/* Quote */}
                    <Box style={{ display: 'flex', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Quote size={10} color={t.colors.neutral[300]} style={{ flexShrink: 0, marginTop: 3 }} aria-hidden="true" />
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        color: t.colors.neutral[600],
                        fontStyle: 'italic',
                        lineHeight: t.typography.lineHeight.normal,
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

                    {/* Validation notes */}
                    {ev.validationNotes && (
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                        fontStyle: 'italic',
                        marginBottom: t.spacing[2],
                        lineHeight: t.typography.lineHeight.normal,
                      }}>
                        {ev.validationNotes}
                      </Text>
                    )}

                    {/* Position / Turn info row */}
                    {(ev.turnIndex !== undefined || ev.startPosition !== undefined) && (
                      <Box style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: t.spacing[2],
                        marginBottom: t.spacing[2],
                        flexWrap: 'wrap' as const,
                      }}>
                        {ev.turnIndex !== undefined && (
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            Turn #{ev.turnIndex}{ev.turnRole ? ` (${ev.turnRole})` : ''}
                          </Text>
                        )}
                        {ev.startPosition !== undefined && ev.endPosition !== undefined && (
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>
                            pos {ev.startPosition}-{ev.endPosition}
                          </Text>
                        )}
                      </Box>
                    )}

                    {/* Bottom row: score + validation status + validate button */}
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
                        {/* Validation indicator */}
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
              {filteredEvidence.length === 0 && (
                <Box style={emptyStyle}>
                  <Box style={createIconContainerStyle(t, { size: 48 })}>
                    <FileSearch size={24} color={t.colors.neutral[300]} aria-hidden="true" />
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.sm,
                    color: t.colors.neutral[400],
                    marginTop: t.spacing[2],
                  }}>
                    No evidence matches the current filters
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
        </Box>
      </div>
    );
  },
});
