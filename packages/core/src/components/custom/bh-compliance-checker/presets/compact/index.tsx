'use client';

/**
 * BhComplianceChecker - Compact Preset
 * Condensed compliance status widget with score and rule summary.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, CheckCircle, XCircle, AlertTriangle,
  MinusCircle, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createProgressBarStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
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
    case 'warning': return 'Warn';
    case 'na': return 'N/A';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RULES: ComplianceRule[] = [
  { id: 'c-1', name: 'Equal Opportunity', category: 'Employment Law', status: 'pass', description: 'EEO statements included.', lastChecked: new Date(Date.now() - 3600000) },
  { id: 'c-2', name: 'Data Retention', category: 'Data Privacy', status: 'pass', description: 'Data within retention period.', lastChecked: new Date(Date.now() - 7200000) },
  { id: 'c-3', name: 'GDPR Consent', category: 'Data Privacy', status: 'warning', description: 'Some missing consent records.', lastChecked: new Date(Date.now() - 14400000) },
  { id: 'c-4', name: 'Bias Training', category: 'Training', status: 'fail', description: '3 interviewers need training.', lastChecked: new Date(Date.now() - 43200000) },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhComplianceChecker = createPreset<BhComplianceCheckerProps>({
  name: 'BhComplianceChecker.Compact',
  render: (ctx: PresetContext<BhComplianceCheckerProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      rules = MOCK_RULES,
      overallScore = 82,
      onRuleClick,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((id: string) => {
      onRuleClick?.(id);
    }, [onRuleClick]);

    const scoreColor = useMemo(() =>
      overallScore >= 80 ? t.colors.successScale[500]
        : overallScore >= 60 ? t.colors.warningScale[500]
        : t.colors.errorScale[500],
    [overallScore, t]);

    const progress = useMemo(() => createProgressBarStyle(t, {
      percent: overallScore,
      color: scoreColor,
    }), [t, overallScore, scoreColor]);

    const failedRules = useMemo(() => rules.filter(r => r.status === 'fail' || r.status === 'warning'), [rules]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Shield size={16} color={t.colors.successScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Compliance
            </Text>
          </Box>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.bold,
            color: scoreColor,
          }}>
            {overallScore}%
          </Text>
        </Box>

        {/* Score bar */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={progress.track}>
            <Box style={progress.fill} />
          </Box>
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {rules.filter(r => r.status === 'pass').length} passed
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
              {failedRules.length} issues
            </Text>
          </Box>
        </Box>

        {/* Issue rules */}
        <Box role="list" aria-label="Compliance issues">
          {failedRules.slice(0, 4).map((rule) => {
            const StatusIcon = getStatusIcon(rule.status);
            const statusClr = getStatusColor(rule.status, t);

            return (
              <Box
                key={rule.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${rule.name}: ${getStatusLabel(rule.status)}`}
                onClick={() => handleClick(rule.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(rule.id); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <StatusIcon size={12} color={statusClr} />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {rule.name}
                  </Text>
                </Box>
                <Box style={{
                  ...createBadgeStyle(t, getStatusBadgeKey(rule.status)),
                  borderRadius: badgeRadius,
                  padding: `0px ${t.spacing[1]}px`,
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>{getStatusLabel(rule.status)}</Text>
                </Box>
              </Box>
            );
          })}
          {failedRules.length === 0 && (
            <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, textAlign: 'center' }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.successScale[600] }}>
                All checks passed
              </Text>
            </Box>
          )}
          {rules.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No rules
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
