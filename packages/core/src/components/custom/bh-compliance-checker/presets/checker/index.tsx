'use client';

/**
 * BhComplianceChecker - Checker Preset
 * Full compliance checker view with overall score donut,
 * categorized rules, status badges, and recheck action.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, CheckCircle, XCircle, AlertTriangle,
  MinusCircle, RefreshCw, ChevronRight, Clock,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createProgressBarStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  formatDistanceToNow,
} from '../../../helpers';
import type { BhComplianceCheckerProps, ComplianceRule } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusIcon(status: ComplianceRule['status']) {
  switch (status) {
    case 'pass': return CheckCircle;
    case 'fail': return XCircle;
    case 'warning': return AlertTriangle;
    case 'na': return MinusCircle;
  }
}

function getStatusColor(status: ComplianceRule['status'], t: DesignTokens): string {
  switch (status) {
    case 'pass': return t.colors.successScale[600];
    case 'fail': return t.colors.errorScale[600];
    case 'warning': return t.colors.warningScale[600];
    case 'na': return t.colors.neutral[400];
  }
}

function getStatusBg(status: ComplianceRule['status'], t: DesignTokens): string {
  switch (status) {
    case 'pass': return t.colors.successScale[50];
    case 'fail': return t.colors.errorScale[50];
    case 'warning': return t.colors.warningScale[50];
    case 'na': return t.colors.neutral[100];
  }
}

function getStatusBadgeKey(status: ComplianceRule['status']): 'success' | 'error' | 'warning' | 'secondary' {
  switch (status) {
    case 'pass': return 'success';
    case 'fail': return 'error';
    case 'warning': return 'warning';
    case 'na': return 'secondary';
  }
}

function getStatusLabel(status: ComplianceRule['status']): string {
  switch (status) {
    case 'pass': return 'Pass';
    case 'fail': return 'Fail';
    case 'warning': return 'Warning';
    case 'na': return 'N/A';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RULES: ComplianceRule[] = [
  { id: 'c-1', name: 'Equal Opportunity Compliance', category: 'Employment Law', status: 'pass', description: 'All job postings include required equal opportunity statements.', lastChecked: new Date(Date.now() - 3600000) },
  { id: 'c-2', name: 'Data Retention Policy', category: 'Data Privacy', status: 'pass', description: 'Candidate data is retained within the defined period.', lastChecked: new Date(Date.now() - 7200000) },
  { id: 'c-3', name: 'GDPR Consent Collection', category: 'Data Privacy', status: 'warning', description: 'Some candidate profiles are missing explicit consent records.', lastChecked: new Date(Date.now() - 14400000) },
  { id: 'c-4', name: 'Background Check Authorization', category: 'Background Screening', status: 'pass', description: 'All background checks have valid authorization on file.', lastChecked: new Date(Date.now() - 21600000) },
  { id: 'c-5', name: 'Interview Bias Training', category: 'Training', status: 'fail', description: '3 interviewers have not completed required bias training.', lastChecked: new Date(Date.now() - 43200000) },
  { id: 'c-6', name: 'Salary Band Compliance', category: 'Compensation', status: 'pass', description: 'All offers fall within approved salary bands.', lastChecked: new Date(Date.now() - 86400000) },
  { id: 'c-7', name: 'Accessibility Standards', category: 'Accessibility', status: 'warning', description: 'Assessment platform meets WCAG 2.1 AA with minor exceptions.', lastChecked: new Date(Date.now() - 172800000) },
  { id: 'c-8', name: 'Right to Work Verification', category: 'Employment Law', status: 'na', description: 'Applicable only for international hires.', lastChecked: new Date(Date.now() - 259200000) },
];

/* ================================================================== */
/*  Checker Preset                                                     */
/* ================================================================== */

let Box: any;
let Text: any;

function ScoreDonut({ score, tokens: t, size = 140 }: {
  score: number;
  tokens: DesignTokens;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 14;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  const color = score >= 80 ? t.colors.successScale[500]
    : score >= 60 ? t.colors.warningScale[500]
    : t.colors.errorScale[500];

  return (
    <Box style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Compliance score: ${score}%`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={t.colors.neutral[100]} strokeWidth={16} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color}
          strokeWidth={16}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: `stroke-dashoffset ${t.motion.hover}` }}
        />
      </svg>
      <Box style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
          {score}%
        </Text>
        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
          Score
        </Text>
      </Box>
    </Box>
  );
}

export const CheckerBhComplianceChecker = createPreset<BhComplianceCheckerProps>({
  name: 'BhComplianceChecker.Checker',
  render: (ctx: PresetContext<BhComplianceCheckerProps>) => {
    const { primitives, props, tokens: t } = ctx;
    Box = primitives.Box;
    Text = primitives.Text;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      rules = MOCK_RULES,
      overallScore = 82,
      title = 'Compliance Status',
      onRuleClick,
      onRecheck,
      loading,
      className,
      style,
    } = props;

    const [hoveredRule, setHoveredRule] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleClick = useCallback((id: string) => {
      onRuleClick?.(id);
    }, [onRuleClick]);

    const handleRecheck = useCallback(() => {
      onRecheck?.();
    }, [onRecheck]);

    const statusCounts = useMemo(() => ({
      pass: rules.filter(r => r.status === 'pass').length,
      fail: rules.filter(r => r.status === 'fail').length,
      warning: rules.filter(r => r.status === 'warning').length,
      na: rules.filter(r => r.status === 'na').length,
    }), [rules]);

    const categories = useMemo(() => {
      const cats = new Map<string, ComplianceRule[]>();
      rules.forEach(r => {
        if (!cats.has(r.category)) cats.set(r.category, []);
        cats.get(r.category)!.push(r);
      });
      return Array.from(cats.entries());
    }, [rules]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.successScale[50] })}>
                <Shield size={22} color={t.colors.successScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                  {rules.length} rules checked across {categories.length} categories
                </Text>
              </Box>
            </Box>
            <Box
              role="button"
              tabIndex={0}
              aria-label="Recheck compliance"
              onClick={handleRecheck}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRecheck(); } }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                backgroundColor: t.colors.primaryScale[600],
                color: t.colors.common.white,
                borderRadius: t.borderRadius.md,
                cursor: 'pointer',
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
                transition: `background-color ${t.motion.hover}`,
              }}
            >
              <RefreshCw size={16} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>Recheck</Text>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Score + Stats Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: t.spacing[6],
            marginBottom: t.spacing[7],
          }}>
            {/* Score Donut */}
            <Box style={{ ...card, ...animStyle(0), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ScoreDonut score={overallScore} tokens={t} />
            </Box>

            {/* Status Counts */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: t.spacing[4],
            }}>
              {[
                { label: 'Passed', value: statusCounts.pass, icon: CheckCircle, color: t.colors.successScale },
                { label: 'Failed', value: statusCounts.fail, icon: XCircle, color: t.colors.errorScale },
                { label: 'Warnings', value: statusCounts.warning, icon: AlertTriangle, color: t.colors.warningScale },
                { label: 'N/A', value: statusCounts.na, icon: MinusCircle, color: t.colors.neutral },
              ].map((sc, i) => {
                const Icon = sc.icon;
                return (
                  <Box
                    key={sc.label}
                    style={{ ...card, ...hoverStyles.base, ...animStyle(i + 1) }}
                    role="status"
                    aria-label={`${sc.label}: ${sc.value}`}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <Icon size={16} color={sc.color[600] || sc.color[500]} />
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xl,
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.neutral[900],
                      display: 'block',
                    }}>
                      {sc.value}
                    </Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[500],
                      textTransform: ptypo.labelTransform,
                      letterSpacing: ptypo.labelLetterSpacing,
                    }}>
                      {sc.label}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Rules by Category */}
          {categories.map(([catName, catRules], ci) => (
            <Box key={catName} style={{ ...card, ...animStyle(ci + 5), padding: 0, marginBottom: t.spacing[5] }}>
              <Box style={{
                padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
                borderBottom: `1px solid ${t.colors.neutral[100]}`,
                backgroundColor: t.colors.neutral[50],
                borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[800],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  {catName}
                </Text>
              </Box>

              <Box role="list" aria-label={`${catName} compliance rules`}>
                {catRules.map((rule) => {
                  const StatusIcon = getStatusIcon(rule.status);
                  const statusColor = getStatusColor(rule.status, t);
                  const isHovered = hoveredRule === rule.id;

                  return (
                    <Box
                      key={rule.id}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${rule.name}: ${getStatusLabel(rule.status)}`}
                      onClick={() => handleClick(rule.id)}
                      onMouseEnter={() => setHoveredRule(rule.id)}
                      onMouseLeave={() => setHoveredRule(null)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(rule.id); } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: t.spacing[3],
                        padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                        borderBottom: `1px solid ${t.colors.neutral[100]}`,
                        cursor: 'pointer',
                        backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
                        transition: `background-color ${t.motion.hover}`,
                      }}
                    >
                      <Box style={createIconContainerStyle(t, { size: 32, color: getStatusBg(rule.status, t) })}>
                        <StatusIcon size={14} color={statusColor} />
                      </Box>

                      <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[900],
                        }}>
                          {rule.name}
                        </Text>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          color: t.colors.neutral[500],
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {rule.description}
                        </Text>
                      </Box>

                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Clock size={10} color={t.colors.neutral[400]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            {formatDistanceToNow(rule.lastChecked, { addSuffix: true })}
                          </Text>
                        </Box>
                        <Box style={{
                          ...createBadgeStyle(t, getStatusBadgeKey(rule.status)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(rule.status)}</Text>
                        </Box>
                        <ChevronRight size={14} color={t.colors.neutral[300]} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}

          {rules.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Shield size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No compliance rules configured
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
