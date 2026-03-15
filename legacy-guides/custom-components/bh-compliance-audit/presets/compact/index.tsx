'use client';

/**
 * BhComplianceAudit - Compact Preset
 * Dashboard widget showing overall compliance status banner, category checklist
 * with progress bars, open issues with severity breakdown, next audit due date,
 * recent critical finding, and audit action link.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhComplianceAuditProps, ComplianceCategory, ComplianceFinding } from '../../core';
import { n } from '../../core';
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
  createProgressBarStyle,
  createStatusDotStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDate,
  ICON_SIZES,
} from '../../../helpers';
import {
  ShieldCheck,
  Check,
  AlertTriangle,
  X,
  ArrowRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusBanner(
  status: 'compliant' | 'at_risk' | 'non_compliant',
  tokens: any,
): { bg: string; text: string; border: string; label: string } {
  switch (status) {
    case 'compliant':
      return {
        bg: tokens.colors.successScale[50],
        text: tokens.colors.successScale[700],
        border: tokens.colors.successScale[200],
        label: 'Compliant',
      };
    case 'at_risk':
      return {
        bg: tokens.colors.warningScale[50],
        text: tokens.colors.warningScale[700],
        border: tokens.colors.warningScale[200],
        label: 'At Risk',
      };
    case 'non_compliant':
      return {
        bg: tokens.colors.errorScale[50],
        text: tokens.colors.errorScale[700],
        border: tokens.colors.errorScale[200],
        label: 'Non-Compliant',
      };
  }
}

function getCategoryIcon(status: 'pass' | 'warning' | 'fail'): typeof Check {
  switch (status) {
    case 'pass': return Check;
    case 'warning': return AlertTriangle;
    case 'fail': return X;
  }
}

function getCategoryIconColor(status: 'pass' | 'warning' | 'fail', tokens: any): string {
  switch (status) {
    case 'pass': return tokens.colors.successScale[500];
    case 'warning': return tokens.colors.warningScale[500];
    case 'fail': return tokens.colors.errorScale[500];
  }
}

function getCategoryBarColor(status: 'pass' | 'warning' | 'fail', tokens: any): string {
  switch (status) {
    case 'pass': return tokens.colors.successScale[500];
    case 'warning': return tokens.colors.warningScale[500];
    case 'fail': return tokens.colors.errorScale[500];
  }
}

function getSeverityColor(severity: ComplianceFinding['severity'], tokens: any): string {
  switch (severity) {
    case 'critical': return tokens.colors.errorScale[600];
    case 'high': return tokens.colors.errorScale[400];
    case 'medium': return tokens.colors.warningScale[500];
    case 'low': return tokens.colors.infoScale[500];
  }
}

function getSeverityBadgeColor(severity: ComplianceFinding['severity']): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical': return 'error';
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
  }
}

function getDaysUntil(date: Date | string): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhComplianceAudit = createPreset<BhComplianceAuditProps>({
  name: 'BhComplianceAudit.Compact',
  render: (ctx: PresetContext<BhComplianceAuditProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewFinding,
      onViewAudit,
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

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading compliance audit data">
          <Box style={{ ...skeletonStyle, height: 20, width: '55%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!data) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <ShieldCheck size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No compliance data available
            </Text>
          </Box>
        </Box>
      );
    }

    const statusBanner = getStatusBanner(data.status, t);
    const criticalFinding = data.recentFindings.find(
      (f) => (f.severity === 'critical' || f.severity === 'high') && !f.resolved,
    );
    const auditDueDays = data.auditDueDate ? getDaysUntil(data.auditDueDate) : null;
    const isAuditUrgent = auditDueDays !== null && auditDueDays <= 30 && auditDueDays > 0;

    // Severity breakdown for open issues
    const openFindings = data.recentFindings.filter((f) => !f.resolved);
    const severityCounts = {
      critical: openFindings.filter((f) => f.severity === 'critical').length,
      high: openFindings.filter((f) => f.severity === 'high').length,
      medium: openFindings.filter((f) => f.severity === 'medium').length,
      low: openFindings.filter((f) => f.severity === 'low').length,
    };

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Compliance Audit"
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

          {/* Title row */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: t.spacing[4],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Box style={createIconContainerStyle(t, { size: 32 })}>
                <ShieldCheck size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Compliance Audit
              </Text>
            </Box>
          </Box>

          {/* Overall status banner */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: statusBanner.bg,
            border: `1px solid ${statusBanner.border}`,
            marginBottom: t.spacing[4],
          }}>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.semibold,
              color: statusBanner.text,
            }}>
              {statusBanner.label}
            </Text>
            <Text style={{
              fontSize: t.typography.fontSize.lg,
              fontWeight: t.typography.fontWeight.bold,
              color: statusBanner.text,
            }}>
              {Math.round(n(data.overallScore))}%
            </Text>
          </Box>

          {/* Category checklist */}
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Categories</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {data.categories.slice(0, 5).map((cat, idx) => {
                const CatIcon = getCategoryIcon(cat.status);
                const iconColor = getCategoryIconColor(cat.status, t);
                const barColor = getCategoryBarColor(cat.status, t);
                const progress = cat.totalItems > 0 ? (cat.checkedItems / cat.totalItems) * 100 : 0;
                const bar = createProgressBarStyle(t, {
                  color: barColor,
                  percent: progress,
                });
                const catEntrance = createEntranceAnimation(t, { index: idx });

                return (
                  <Box
                    key={cat.name}
                    style={{
                      ...catEntrance.animate,
                      transition: catEntrance.transition,
                    }}
                  >
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 2,
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <CatIcon size={ICON_SIZES.label} color={iconColor} aria-hidden="true" />
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[700],
                        }}>
                          {cat.name}
                        </Text>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[500],
                      }}>
                        {cat.checkedItems}/{cat.totalItems}
                      </Text>
                    </Box>
                    <Box style={{ ...bar.track, height: 4 }}>
                      <Box style={bar.fill} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Open issues with severity breakdown */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.neutral[50],
            border: `1px solid ${t.colors.neutral[100]}`,
            marginBottom: t.spacing[3],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <AlertCircle size={ICON_SIZES.label} color={t.colors.neutral[500]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[600],
              }}>
                Open Issues
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
              }}>
                {n(data.openIssues)}
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {severityCounts.critical > 0 && (
                <Box style={createStatusDotStyle(t, t.colors.errorScale[600])} aria-label={`${severityCounts.critical} critical`} />
              )}
              {severityCounts.high > 0 && (
                <Box style={createStatusDotStyle(t, t.colors.errorScale[400])} aria-label={`${severityCounts.high} high`} />
              )}
              {severityCounts.medium > 0 && (
                <Box style={createStatusDotStyle(t, t.colors.warningScale[500])} aria-label={`${severityCounts.medium} medium`} />
              )}
              {severityCounts.low > 0 && (
                <Box style={createStatusDotStyle(t, t.colors.infoScale[500])} aria-label={`${severityCounts.low} low`} />
              )}
            </Box>
          </Box>

          {/* Next audit due date */}
          {data.auditDueDate && (
            <Box style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: isAuditUrgent ? t.colors.warningScale[50] : t.colors.neutral[50],
              border: `1px solid ${isAuditUrgent ? t.colors.warningScale[200] : t.colors.neutral[100]}`,
              marginBottom: t.spacing[3],
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Calendar size={ICON_SIZES.label} color={isAuditUrgent ? t.colors.warningScale[600] : t.colors.neutral[500]} aria-hidden="true" />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: isAuditUrgent ? t.colors.warningScale[700] : t.colors.neutral[600],
                }}>
                  Next Audit
                </Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: isAuditUrgent ? t.colors.warningScale[700] : t.colors.neutral[700],
                }}>
                  {formatDate(data.auditDueDate)}
                </Text>
                {isAuditUrgent && (
                  <Box style={{
                    ...createBadgeStyle(t, 'warning'),
                    borderRadius: badgeRadius,
                    padding: `0 ${t.spacing[1]}px`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>
                      {auditDueDays}d
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Recent critical finding */}
          {criticalFinding && (
            <Box
              {...(onViewFinding ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': `View finding: ${criticalFinding.description}`,
                onClick: () => onViewFinding(criticalFinding.id),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onViewFinding(criticalFinding.id);
                  }
                },
              } : {})}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                borderRadius: t.borderRadius.md,
                backgroundColor: t.colors.errorScale[50],
                border: `1px solid ${t.colors.errorScale[200]}`,
                marginBottom: t.spacing[3],
                cursor: onViewFinding ? 'pointer' : 'default',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <AlertTriangle size={ICON_SIZES.label} color={t.colors.errorScale[600]} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Box style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[1],
                  marginBottom: 2,
                }}>
                  <Box style={{
                    ...createBadgeStyle(t, getSeverityBadgeColor(criticalFinding.severity)),
                    borderRadius: badgeRadius,
                    padding: `0 ${t.spacing[1]}px`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>
                      {criticalFinding.severity.toUpperCase()}
                    </Text>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                  }}>
                    {criticalFinding.category}
                  </Text>
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.errorScale[700],
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap' as const,
                }}>
                  {criticalFinding.description}
                </Text>
              </Box>
            </Box>
          )}

          {/* Start Audit / View Report link */}
          {onViewAudit && (
            <Box
              role="button"
              tabIndex={0}
              aria-label={data.status === 'compliant' ? 'View audit report' : 'Start audit'}
              onClick={onViewAudit}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewAudit(); }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: t.spacing[1],
                marginTop: t.spacing[1],
                padding: `${t.spacing[2]}px`,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
              }}
            >
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.primaryScale[600],
              }}>
                {data.status === 'compliant' ? 'View Report' : 'Start Audit'}
              </Text>
              <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
            </Box>
          )}

        </Box>
      </div>
    );
  },
});
