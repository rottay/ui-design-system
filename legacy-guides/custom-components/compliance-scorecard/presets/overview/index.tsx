'use client';

/**
 * ComplianceScorecard - Overview Preset
 * Grid of compliance framework cards with scores
 */

import { createPreset, PresetContext } from '../../../factory';
import type { ComplianceScorecardProps } from '../../core';
import { getComplianceLevelColors, getScoreColor, getRegulationLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createInteractiveCardStyle,
  createProgressBarStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const OverviewComplianceScorecard = createPreset<ComplianceScorecardProps>({
  name: 'ComplianceScorecard.Overview',
  render: ({ primitives, props, tokens }: PresetContext<ComplianceScorecardProps>) => {
    const { Box, Stack } = primitives;
    const levelColors = getComplianceLevelColors(tokens);

    const {
      frameworks,
      onFrameworkClick,
      onExport,
      title = 'Compliance Scorecard',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const overallScore = frameworks.length > 0
      ? Math.round(frameworks.reduce((sum, f) => sum + (f.overallScore / f.maxScore) * 100, 0) / frameworks.length)
      : 0;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{ textAlign: 'right' }}>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: getScoreColor(tokens, overallScore, 100) }}>{overallScore}%</span>
              <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Overall Score</span>
            </Box>
            {onExport && (
              <button onClick={onExport} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
              }}>Export</button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: tokens.spacing[3], padding: tokens.spacing[4] }}>
            {frameworks.map((fw) => {
              const colors = levelColors[fw.level];
              const pct = fw.maxScore > 0 ? Math.round((fw.overallScore / fw.maxScore) * 100) : 0;
              const scoreColor = getScoreColor(tokens, fw.overallScore, fw.maxScore);
              const progress = createProgressBarStyle(tokens, { percent: pct, color: scoreColor });

              return (
                <Box key={fw.id} onClick={() => onFrameworkClick?.(fw.id)} style={{
                  ...createInteractiveCardStyle(tokens),
                  overflow: 'hidden',
                  cursor: onFrameworkClick ? 'pointer' : 'default',
                }}>
                  <Box style={createAccentBarStyle(tokens, { position: 'top', color: colors.dot })} />
                  <Box style={{ padding: tokens.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Box>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{fw.name}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{getRegulationLabel(fw.regulation)}</span>
                      </Box>
                      <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: scoreColor }}>{pct}%</span>
                    </Box>

                    <Box style={progress.track}><Box style={progress.fill} /></Box>

                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[2] }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                        <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                        {fw.level}
                      </span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {fw.requirements.length} requirements
                      </span>
                    </Box>

                    {fw.lastAssessment && (
                      <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                        Last: {fw.lastAssessment.toLocaleDateString()}
                      </span>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
