'use client';

/**
 * ComplianceScorecard - Comparison Preset
 * Side-by-side comparison of compliance frameworks
 */

import { createPreset, PresetContext } from '../../../factory';
import type { ComplianceScorecardProps } from '../../core';
import { getComplianceLevelColors, getScoreColor, getRegulationLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
} from '../../../helpers';

export const ComparisonComplianceScorecard = createPreset<ComplianceScorecardProps>({
  name: 'ComplianceScorecard.Comparison',
  render: ({ primitives, props, tokens }: PresetContext<ComplianceScorecardProps>) => {
    const { Box } = primitives;
    const levelColors = getComplianceLevelColors(tokens);

    const {
      frameworks,
      onFrameworkClick,
      title = 'Compliance Comparison',
      loading,
      className,
      style,
    } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            {/* Table Header */}
            <Box style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
              gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50],
            }}>
              {['Framework', 'Score', 'Level', 'Requirements', 'Findings', 'Next Audit'].map(h => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </Box>

            {frameworks.map((fw) => {
              const colors = levelColors[fw.level];
              const pct = fw.maxScore > 0 ? Math.round((fw.overallScore / fw.maxScore) * 100) : 0;
              const scoreColor = getScoreColor(tokens, fw.overallScore, fw.maxScore);
              const totalFindings = fw.requirements.reduce((s, r) => s + (r.findings || 0), 0);
              const progress = createProgressBarStyle(tokens, { percent: pct, color: scoreColor });

              return (
                <Box key={fw.id} onClick={() => onFrameworkClick?.(fw.id)} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                  gap: tokens.spacing[2], padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  cursor: onFrameworkClick ? 'pointer' : 'default',
                  transition: `background-color ${tokens.motion.hover}`,
                  alignItems: 'center',
                }}>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{fw.name}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{getRegulationLabel(fw.regulation)}</span>
                  </Box>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: scoreColor, display: 'block' }}>{pct}%</span>
                    <Box style={{ ...progress.track, height: 4, marginTop: 2 }}><Box style={progress.fill} /></Box>
                  </Box>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>
                    <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                    {fw.level}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{fw.requirements.length}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: totalFindings > 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>{totalFindings || '—'}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{fw.nextAssessment?.toLocaleDateString() || '—'}</span>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
