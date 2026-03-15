'use client';

/**
 * ComplianceScorecard - Detail Preset
 * Detailed view of a single compliance framework
 */

import { createPreset, PresetContext } from '../../../factory';
import type { ComplianceScorecardProps } from '../../core';
import { getComplianceLevelColors, getScoreColor } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createProgressBarStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const DetailComplianceScorecard = createPreset<ComplianceScorecardProps>({
  name: 'ComplianceScorecard.Detail',
  render: ({ primitives, props, tokens }: PresetContext<ComplianceScorecardProps>) => {
    const { Box, Stack } = primitives;
    const levelColors = getComplianceLevelColors(tokens);

    const {
      frameworks,
      selectedFrameworkId,
      onRequirementClick,
      onScheduleAudit,
      title,
      loading,
      className,
      style,
    } = props;

    const framework = frameworks.find(f => f.id === selectedFrameworkId) || frameworks[0];

    if (loading || !framework) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>{loading ? 'Loading...' : 'No framework selected'}</Box>;
    }

    const colors = levelColors[framework.level];
    const pct = framework.maxScore > 0 ? Math.round((framework.overallScore / framework.maxScore) * 100) : 0;
    const scoreColor = getScoreColor(tokens, framework.overallScore, framework.maxScore);
    const mainProgress = createProgressBarStyle(tokens, { percent: pct, color: scoreColor });

    const categories = [...new Set(framework.requirements.map(r => r.category).filter(Boolean))] as string[];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: colors.dot })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title || framework.name}</h3>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                {framework.level}
              </span>
              {framework.auditor && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Auditor: {framework.auditor}</span>}
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <span style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: tokens.typography.fontWeight.bold, color: scoreColor }}>{pct}%</span>
            {onScheduleAudit && (
              <button onClick={() => onScheduleAudit(framework.id)} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.primaryScale[300]}`, backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
              }}>Schedule Audit</button>
            )}
          </Box>
        </Box>

        <Box style={{ padding: tokens.spacing[4] }}>
          {/* Overall Progress */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>Overall Compliance</span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{framework.overallScore}/{framework.maxScore}</span>
            </Box>
            <Box style={mainProgress.track}><Box style={mainProgress.fill} /></Box>
          </Box>

          {/* Requirements by Category */}
          {categories.length > 0 ? (
            categories.map(cat => {
              const catReqs = framework.requirements.filter(r => r.category === cat);
              return (
                <Box key={cat} style={{ marginBottom: tokens.spacing[3] }}>
                  <h4 style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, margin: `0 0 ${tokens.spacing[2]}px`, letterSpacing: '0.05em' }}>{cat}</h4>
                  {catReqs.map(req => {
                    const rColors = levelColors[req.level];
                    const rPct = req.maxScore > 0 ? Math.round((req.score / req.maxScore) * 100) : 0;
                    const rProgress = createProgressBarStyle(tokens, { percent: rPct, color: getScoreColor(tokens, req.score, req.maxScore) });

                    return (
                      <Box key={req.id} onClick={() => onRequirementClick?.(req.id)} style={{
                        ...createListItemStyle(tokens, { interactive: !!onRequirementClick }),
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      }}>
                        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{req.name}</span>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                            {req.criticalFindings ? (
                              <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs }}>{req.criticalFindings} critical</span>
                            ) : null}
                            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: getScoreColor(tokens, req.score, req.maxScore) }}>{rPct}%</span>
                          </Box>
                        </Box>
                        <Box style={{ ...rProgress.track, height: 4 }}><Box style={rProgress.fill} /></Box>
                      </Box>
                    );
                  })}
                </Box>
              );
            })
          ) : (
            framework.requirements.map(req => {
              const rColors = levelColors[req.level];
              const rPct = req.maxScore > 0 ? Math.round((req.score / req.maxScore) * 100) : 0;

              return (
                <Box key={req.id} onClick={() => onRequirementClick?.(req.id)} style={{
                  ...createListItemStyle(tokens, { interactive: !!onRequirementClick }),
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: rColors.dot }} />
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{req.name}</span>
                  </Box>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: getScoreColor(tokens, req.score, req.maxScore) }}>{rPct}%</span>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    );
  },
});
