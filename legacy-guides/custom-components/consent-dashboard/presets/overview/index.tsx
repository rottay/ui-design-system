'use client';

/**
 * ConsentDashboard - Overview Preset
 * Summary view with metrics and consent status cards
 */

import { createPreset, PresetContext } from '../../../factory';
import type { ConsentDashboardProps } from '../../core';
import { getConsentStatusColors, getPurposeIcon } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const OverviewConsentDashboard = createPreset<ConsentDashboardProps>({
  name: 'ConsentDashboard.Overview',
  render: ({ primitives, props, tokens }: PresetContext<ConsentDashboardProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getConsentStatusColors(tokens);

    const {
      consents,
      summary,
      onViewHistory,
      onExport,
      title = 'Consent Management',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const computedSummary = summary || {
      totalConsents: consents.length,
      granted: consents.filter(c => c.status === 'granted').length,
      denied: consents.filter(c => c.status === 'denied').length,
      withdrawn: consents.filter(c => c.status === 'withdrawn').length,
      expired: consents.filter(c => c.status === 'expired').length,
      pending: consents.filter(c => c.status === 'pending').length,
      complianceRate: consents.length > 0 ? Math.round((consents.filter(c => c.status === 'granted' || c.status === 'denied').length / consents.length) * 100) : 0,
    };

    const progressBar = createProgressBarStyle(tokens, { percent: computedSummary.complianceRate });

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          {onExport && (
            <button onClick={onExport} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.neutral[300]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700],
              fontSize: tokens.typography.fontSize.xs,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Export
            </button>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[4] }}>
            {/* Compliance Rate */}
            <Box style={{ marginBottom: tokens.spacing[4] }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>Compliance Rate</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{computedSummary.complianceRate}%</span>
              </Box>
              <Box style={progressBar.track}><Box style={progressBar.fill} /></Box>
            </Box>

            {/* Summary Stats */}
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
              {([
                { label: 'Granted', count: computedSummary.granted, status: 'granted' as const },
                { label: 'Denied', count: computedSummary.denied, status: 'denied' as const },
                { label: 'Withdrawn', count: computedSummary.withdrawn, status: 'withdrawn' as const },
                { label: 'Expired', count: computedSummary.expired, status: 'expired' as const },
                { label: 'Pending', count: computedSummary.pending, status: 'pending' as const },
              ]).map((stat) => {
                const colors = statusColors[stat.status];
                return (
                  <Box key={stat.label} style={{ textAlign: 'center', padding: tokens.spacing[2], borderRadius: tokens.borderRadius.md, backgroundColor: colors.bg }}>
                    <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: colors.color, display: 'block' }}>{stat.count}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.color }}>{stat.label}</span>
                  </Box>
                );
              })}
            </Box>

            {/* Consent Cards */}
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: tokens.spacing[3] }}>
              {consents.map((consent) => {
                const colors = statusColors[consent.status];
                return (
                  <Box key={consent.id} onClick={() => onViewHistory?.(consent.id)} style={{
                    ...createCardStyle(tokens, { elevation: 'sm', interactive: !!onViewHistory }),
                    padding: tokens.spacing[3],
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <Box style={createAccentBarStyle(tokens, { position: 'top', color: colors.dot })} />
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span>{getPurposeIcon(consent.purpose)}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{consent.label}</span>
                      </Box>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                        <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                        {consent.status}
                      </span>
                    </Box>
                    <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], margin: 0, lineHeight: 1.4 }}>{consent.description}</p>
                    {consent.isRequired && (
                      <span style={{ display: 'inline-block', marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[700], fontWeight: tokens.typography.fontWeight.medium }}>Required</span>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
