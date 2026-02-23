'use client';

/**
 * BhGhostRiskPanel - Panel Preset
 * Dashboard-embeddable panel showing ghost risk candidates, stacked risk meter,
 * intervention controls, and summary statistics.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo, useState, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type {
  BhGhostRiskPanelProps,
  GhostRiskCandidate,
  RiskLevel,
} from '../../core';
import {
  getRiskLevelColor,
  getRiskLevelBgColor,
  getRiskLevelBorderColor,
  getRiskLevelLabel,
  getTrendInfo,
  n,
} from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  Zap,
  Calendar,
  UserCheck,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const PanelBhGhostRiskPanel = createPreset<BhGhostRiskPanelProps>({
  name: 'BhGhostRiskPanel.Panel',
  render: (ctx: PresetContext<BhGhostRiskPanelProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      candidates = [],
      stats,
      loading,
      onTriggerIntervention,
      onViewCandidate,
      maxDisplay = 6,
      className,
      style,
    } = props;

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    const candidateList = Array.isArray(candidates) ? candidates : [];
    const displayed = candidateList.slice(0, maxDisplay);

    /* -- Derived stats ------------------------------------------------ */
    const effectiveStats = useMemo(() => {
      if (stats) return stats;
      const criticalCount = candidateList.filter((c) => c.riskLevel === 'critical').length;
      const highCount = candidateList.filter((c) => c.riskLevel === 'high').length;
      const mediumCount = candidateList.filter((c) => c.riskLevel === 'medium').length;
      return {
        totalAtRisk: candidateList.length,
        criticalCount,
        highCount,
        mediumCount,
        avgDaysSilent: candidateList.length
          ? Math.round(candidateList.reduce((sum, c) => sum + c.daysSilent, 0) / candidateList.length)
          : 0,
        interventionSuccessRate: 0,
      };
    }, [stats, candidateList]);

    const totalForBar = effectiveStats.criticalCount + effectiveStats.highCount + effectiveStats.mediumCount;

    /* -- Intervention handler ----------------------------------------- */
    const [interventionLoading, setInterventionLoading] = useState<string | null>(null);

    const handleIntervene = useCallback(
      (candidateId: string, intervention?: string) => {
        if (!onTriggerIntervention) return;
        setInterventionLoading(candidateId);
        onTriggerIntervention(candidateId, intervention ?? 'email_reminder');
        // Reset after a brief delay for UX feedback
        setTimeout(() => setInterventionLoading(null), 1500);
      },
      [onTriggerIntervention]
    );

    /* -- Trend icon component ----------------------------------------- */
    const TrendIcon = useCallback(
      ({ trend, size }: { trend: GhostRiskCandidate['trend']; size: number }) => {
        const info = getTrendInfo(trend, t);
        switch (trend) {
          case 'improving':
            return <TrendingUp size={size} color={info.color} aria-hidden="true" />;
          case 'declining':
          case 'critical_decline':
            return <TrendingDown size={size} color={info.color} aria-hidden="true" />;
          default:
            return <Minus size={size} color={info.color} aria-hidden="true" />;
        }
      },
      [t]
    );

    /* -- Intervention icon -------------------------------------------- */
    const InterventionIcon = useCallback(
      ({ type }: { type?: string }) => {
        const iconColor = t.colors.primaryScale[500];
        const size = ICON_SIZES.inline;
        switch (type) {
          case 'recruiter_call':
            return <Phone size={size} color={iconColor} aria-hidden="true" />;
          case 'schedule_followup':
            return <Calendar size={size} color={iconColor} aria-hidden="true" />;
          case 'priority_boost':
            return <Zap size={size} color={iconColor} aria-hidden="true" />;
          default:
            return <Mail size={size} color={iconColor} aria-hidden="true" />;
        }
      },
      [t]
    );

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading ghost risk panel">
          <Box style={{ ...skeletonStyle, height: 20, width: '50%' }} />
          <Box style={{ ...skeletonStyle, height: 14, width: '80%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 64, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 64, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 64, width: '100%' }} />
        </Box>
      );
    }

    /* -- Empty / all-clear state -------------------------------------- */
    if (candidateList.length === 0 && !stats?.totalAtRisk) {
      return (
        <div
          className={className}
          role="region"
          aria-label="Ghost Risk Panel"
          style={{
            ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
            borderRadius: t.borderRadius.lg,
            overflow: 'hidden',
            ...entranceAnim.animate,
            transition: entranceAnim.transition,
            ...accentLayout.outer,
            ...style,
          }}
        >
          {accentBar && <Box style={accentBar} />}
          <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>
            {/* Header */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              marginBottom: t.spacing[4],
            }}>
              <Box style={createIconContainerStyle(t, { size: 32 })}>
                <ShieldAlert size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Ghost Risk
              </Text>
            </Box>

            {/* All-clear content */}
            <Box style={{ ...emptyStyle, padding: `${t.spacing[6]}px` }}>
              <Box style={createIconContainerStyle(t, { size: 48 })}>
                <CheckCircle size={ICON_SIZES.feature} color={t.colors.successScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.successScale[700],
                marginTop: t.spacing[3],
              }}>
                All Clear
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[400],
                marginTop: t.spacing[1],
              }}>
                No candidates at risk of ghosting
              </Text>
            </Box>
          </Box>
        </div>
      );
    }

    /* -- Main render -------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Ghost Risk Panel"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, cardHover.base); }}
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>

          {/* =========================================================== */}
          {/* HEADER                                                       */}
          {/* =========================================================== */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: t.spacing[4],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={createIconContainerStyle(t, { size: 32 })}>
                <ShieldAlert size={ICON_SIZES.section} color={t.colors.errorScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Ghost Risk
              </Text>
            </Box>
            {effectiveStats.totalAtRisk > 0 && (
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                backgroundColor: t.colors.errorScale[100],
                color: t.colors.errorScale[700],
                border: `1px solid ${t.colors.errorScale[200]}`,
                borderRadius: badgeRadius,
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.errorScale[700],
                }}>
                  {effectiveStats.totalAtRisk} at risk
                </Text>
              </Box>
            )}
          </Box>

          {/* =========================================================== */}
          {/* STATS SUMMARY                                                */}
          {/* =========================================================== */}
          <Box style={{
            display: 'flex', gap: t.spacing[3],
            marginBottom: t.spacing[4],
          }}>
            {/* Critical */}
            <Box style={{
              flex: 1,
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: `${t.spacing[2]}px`,
              backgroundColor: t.colors.errorScale[50],
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.errorScale[100]}`,
            }}>
              <Text style={createStatValueStyle(t, { size: 'lg' })}>
                <span style={{ color: t.colors.errorScale[700] }}>{effectiveStats.criticalCount}</span>
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.errorScale[600],
                fontWeight: t.typography.fontWeight.medium,
              }}>
                Critical
              </Text>
            </Box>
            {/* High */}
            <Box style={{
              flex: 1,
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: `${t.spacing[2]}px`,
              backgroundColor: t.colors.errorScale[50],
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.errorScale[100]}`,
            }}>
              <Text style={createStatValueStyle(t, { size: 'lg' })}>
                <span style={{ color: t.colors.errorScale[400] }}>{effectiveStats.highCount}</span>
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.errorScale[500],
                fontWeight: t.typography.fontWeight.medium,
              }}>
                High
              </Text>
            </Box>
            {/* Medium */}
            <Box style={{
              flex: 1,
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: `${t.spacing[2]}px`,
              backgroundColor: t.colors.warningScale[50],
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.warningScale[100]}`,
            }}>
              <Text style={createStatValueStyle(t, { size: 'lg' })}>
                <span style={{ color: t.colors.warningScale[600] }}>{effectiveStats.mediumCount}</span>
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.warningScale[600],
                fontWeight: t.typography.fontWeight.medium,
              }}>
                Medium
              </Text>
            </Box>
          </Box>

          {/* =========================================================== */}
          {/* RISK METER — Stacked horizontal bar                          */}
          {/* =========================================================== */}
          {totalForBar > 0 && (
            <Box style={{ marginBottom: t.spacing[4] }}>
              <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Risk Distribution</Text>
              <Box style={{
                display: 'flex', height: 12, borderRadius: t.borderRadius.md,
                overflow: 'hidden', backgroundColor: t.colors.neutral[100],
              }}>
                {effectiveStats.criticalCount > 0 && (
                  <Box
                    style={{
                      width: `${(effectiveStats.criticalCount / totalForBar) * 100}%`,
                      backgroundColor: t.colors.errorScale[700],
                      transition: `width ${t.motion.hover}`,
                    }}
                    aria-label={`Critical: ${effectiveStats.criticalCount}`}
                  />
                )}
                {effectiveStats.highCount > 0 && (
                  <Box
                    style={{
                      width: `${(effectiveStats.highCount / totalForBar) * 100}%`,
                      backgroundColor: t.colors.errorScale[400],
                      transition: `width ${t.motion.hover}`,
                    }}
                    aria-label={`High: ${effectiveStats.highCount}`}
                  />
                )}
                {effectiveStats.mediumCount > 0 && (
                  <Box
                    style={{
                      width: `${(effectiveStats.mediumCount / totalForBar) * 100}%`,
                      backgroundColor: t.colors.warningScale[500],
                      transition: `width ${t.motion.hover}`,
                    }}
                    aria-label={`Medium: ${effectiveStats.mediumCount}`}
                  />
                )}
              </Box>
              {/* Legend */}
              <Box style={{
                display: 'flex', gap: t.spacing[3], marginTop: t.spacing[2],
                flexWrap: 'wrap' as const,
              }}>
                {effectiveStats.criticalCount > 0 && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Box style={{
                      width: 8, height: 8, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.errorScale[700],
                    }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      Critical
                    </Text>
                  </Box>
                )}
                {effectiveStats.highCount > 0 && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Box style={{
                      width: 8, height: 8, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.errorScale[400],
                    }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      High
                    </Text>
                  </Box>
                )}
                {effectiveStats.mediumCount > 0 && (
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Box style={{
                      width: 8, height: 8, borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.warningScale[500],
                    }} />
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      Medium
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* =========================================================== */}
          {/* CANDIDATE LIST                                                */}
          {/* =========================================================== */}
          {displayed.length > 0 && (
            <Box>
              <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>At-Risk Candidates</Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {displayed.map((candidate, idx) => {
                  const rowEntrance = createEntranceAnimation(t, { index: idx });
                  const trendInfo = getTrendInfo(candidate.trend, t);
                  const riskColor = getRiskLevelColor(candidate.riskLevel, t);
                  const riskBg = getRiskLevelBgColor(candidate.riskLevel, t);
                  const riskBorder = getRiskLevelBorderColor(candidate.riskLevel, t);
                  const initials = candidate.candidateName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const isIntervening = interventionLoading === candidate.candidateId;

                  return (
                    <Box
                      key={candidate.candidateId}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${t.spacing[3]}px`,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: t.colors.neutral[50],
                        border: `1px solid ${t.colors.neutral[100]}`,
                        cursor: onViewCandidate ? 'pointer' : 'default',
                        transition: `all ${t.motion.hover}`,
                        ...rowEntrance.animate,
                      }}
                      {...(onViewCandidate
                        ? clickableProps(
                            () => onViewCandidate(candidate.candidateId),
                            `View candidate: ${candidate.candidateName}`
                          )
                        : {})}
                      onClick={onViewCandidate ? () => onViewCandidate(candidate.candidateId) : undefined}
                    >
                      {/* Left: Avatar + Info */}
                      <Box style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[3],
                        flex: 1, minWidth: 0,
                      }}>
                        {/* Avatar circle */}
                        <Box style={{
                          width: 36, height: 36,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: riskBg,
                          border: `2px solid ${riskBorder}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.semibold,
                            color: riskColor,
                          }}>
                            {initials}
                          </Text>
                        </Box>
                        {/* Name + job */}
                        <Box style={{
                          display: 'flex', flexDirection: 'column' as const,
                          minWidth: 0, gap: 2,
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.sm,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[800],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                          }}>
                            {candidate.candidateName}
                          </Text>
                          {candidate.jobTitle && (
                            <Text style={{
                              fontSize: t.typography.fontSize.xs,
                              color: t.colors.neutral[400],
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap' as const,
                            }}>
                              {candidate.jobTitle}
                            </Text>
                          )}
                        </Box>
                      </Box>

                      {/* Center: Risk badge + Days silent + Trend */}
                      <Box style={{
                        display: 'flex', alignItems: 'center', gap: t.spacing[2],
                        flexShrink: 0,
                      }}>
                        {/* Risk score badge */}
                        <Box style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                          backgroundColor: riskBg,
                          border: `1px solid ${riskBorder}`,
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            fontWeight: t.typography.fontWeight.semibold,
                            color: riskColor,
                          }}>
                            {candidate.riskScore}
                          </Text>
                        </Box>

                        {/* Days silent */}
                        <Box style={{
                          display: 'flex', alignItems: 'center', gap: 2,
                        }}>
                          <Clock size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[500],
                            whiteSpace: 'nowrap' as const,
                          }}>
                            {candidate.daysSilent}d
                          </Text>
                        </Box>

                        {/* Trend arrow */}
                        <Box style={{
                          display: 'flex', alignItems: 'center', gap: 2,
                        }} aria-label={`Trend: ${trendInfo.label}`}>
                          <TrendIcon trend={candidate.trend} size={ICON_SIZES.inline} />
                        </Box>

                        {/* Intervene button */}
                        {onTriggerIntervention && (
                          <Box
                            role="button"
                            tabIndex={0}
                            aria-label={`Intervene for ${candidate.candidateName}`}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleIntervene(candidate.candidateId, candidate.suggestedIntervention);
                            }}
                            onKeyDown={(e: React.KeyboardEvent) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleIntervene(candidate.candidateId, candidate.suggestedIntervention);
                              }
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                              backgroundColor: isIntervening
                                ? t.colors.successScale[100]
                                : t.colors.primaryScale[50],
                              color: isIntervening
                                ? t.colors.successScale[700]
                                : t.colors.primaryScale[600],
                              border: `1px solid ${isIntervening
                                ? t.colors.successScale[200]
                                : t.colors.primaryScale[200]}`,
                              borderRadius: badgeRadius,
                              cursor: isIntervening ? 'default' : 'pointer',
                              transition: `all ${t.motion.hover}`,
                              fontSize: t.typography.fontSize.xs,
                              fontWeight: t.typography.fontWeight.semibold,
                              opacity: isIntervening ? 0.8 : 1,
                            }}
                          >
                            {isIntervening ? (
                              <>
                                <CheckCircle size={ICON_SIZES.inline} aria-hidden="true" />
                                <Text style={{
                                  fontSize: t.typography.fontSize.xs,
                                  fontWeight: t.typography.fontWeight.semibold,
                                  color: t.colors.successScale[700],
                                }}>
                                  Sent
                                </Text>
                              </>
                            ) : (
                              <>
                                <InterventionIcon type={candidate.suggestedIntervention} />
                                <Text style={{
                                  fontSize: t.typography.fontSize.xs,
                                  fontWeight: t.typography.fontWeight.semibold,
                                  color: t.colors.primaryScale[600],
                                }}>
                                  Intervene
                                </Text>
                              </>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* =========================================================== */}
          {/* FOOTER: Avg days silent + intervention success               */}
          {/* =========================================================== */}
          {(effectiveStats.avgDaysSilent > 0 || effectiveStats.interventionSuccessRate > 0) && (
            <Box style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: t.spacing[4],
              paddingTop: t.spacing[3],
              borderTop: `1px solid ${t.colors.neutral[100]}`,
            }}>
              {effectiveStats.avgDaysSilent > 0 && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <Clock size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    Avg {effectiveStats.avgDaysSilent} days silent
                  </Text>
                </Box>
              )}
              {effectiveStats.interventionSuccessRate > 0 && (
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                  <UserCheck size={ICON_SIZES.label} color={t.colors.successScale[500]} aria-hidden="true" />
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {Math.round(effectiveStats.interventionSuccessRate)}% intervention success
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* More candidates indicator */}
          {candidateList.length > maxDisplay && (
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: t.spacing[3],
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[400],
              }}>
                +{candidateList.length - maxDisplay} more candidates at risk
              </Text>
            </Box>
          )}

        </Box>
      </div>
    );
  },
});
