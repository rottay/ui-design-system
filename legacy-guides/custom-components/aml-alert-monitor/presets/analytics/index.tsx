'use client';

/**
 * AmlAlertMonitor - Analytics Preset
 * Dashboard with summary cards, type/severity breakdowns, and recent activity
 */

import { createPreset, PresetContext } from '../../../factory';
import type { AmlAlertMonitorProps, AlertType, AlertSeverity } from '../../core';
import { getSeverityColors, getAlertStatusColors, getAlertTypeIcon } from '../../core';
import {
  createCardStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  'transaction-pattern': 'Transaction Pattern',
  'sanctions-match': 'Sanctions Match',
  'pep-match': 'PEP Match',
  'unusual-activity': 'Unusual Activity',
  'threshold-breach': 'Threshold Breach',
  'velocity-alert': 'Velocity Alert',
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const AnalyticsAmlAlertMonitor = createPreset<AmlAlertMonitorProps>({
  name: 'AmlAlertMonitor.Analytics',
  render: ({ primitives, props, tokens }: PresetContext<AmlAlertMonitorProps>) => {
    const { Box, Stack } = primitives;
    const severityColors = getSeverityColors(tokens);
    const statusColors = getAlertStatusColors(tokens);

    const {
      alerts,
      title = 'AML Alerts',
      subtitle,
      loading,
      className,
      style,
    } = props;

    // Summary calculations
    const totalAlerts = alerts.length;
    const avgRiskScore = totalAlerts > 0
      ? Math.round(alerts.reduce((sum, a) => sum + a.riskScore, 0) / totalAlerts)
      : 0;
    const resolvedCount = alerts.filter(a => a.status === 'resolved').length;
    const resolutionRate = totalAlerts > 0 ? Math.round((resolvedCount / totalAlerts) * 100) : 0;
    const escalatedCount = alerts.filter(a => a.status === 'escalated').length;
    const escalationRate = totalAlerts > 0 ? Math.round((escalatedCount / totalAlerts) * 100) : 0;

    // Alerts by type
    const alertsByType = alerts.reduce<Record<string, number>>((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});
    const maxTypeCount = Math.max(...Object.values(alertsByType), 1);

    // Alerts by severity
    const alertsBySeverity = alerts.reduce<Record<string, number>>((acc, a) => {
      acc[a.severity] = (acc[a.severity] || 0) + 1;
      return acc;
    }, {});
    const maxSeverityCount = Math.max(...Object.values(alertsBySeverity), 1);

    // Recent activity (last 5 resolved/dismissed)
    const recentActivity = alerts
      .filter(a => a.status === 'resolved' || a.status === 'dismissed')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    const summaryCards = [
      { label: 'Total Alerts', value: String(totalAlerts), color: tokens.colors.primaryScale[600], bgColor: tokens.colors.primaryScale[50], borderColor: tokens.colors.primaryScale[200] },
      { label: 'Avg Risk Score', value: String(avgRiskScore), color: avgRiskScore >= 75 ? tokens.colors.errorScale[600] : avgRiskScore >= 50 ? tokens.colors.warningScale[600] : tokens.colors.infoScale[600], bgColor: avgRiskScore >= 75 ? tokens.colors.errorScale[50] : avgRiskScore >= 50 ? tokens.colors.warningScale[50] : tokens.colors.infoScale[50], borderColor: avgRiskScore >= 75 ? tokens.colors.errorScale[200] : avgRiskScore >= 50 ? tokens.colors.warningScale[200] : tokens.colors.infoScale[200] },
      { label: 'Resolution Rate', value: `${resolutionRate}%`, color: tokens.colors.successScale[600], bgColor: tokens.colors.successScale[50], borderColor: tokens.colors.successScale[200] },
      { label: 'Escalation Rate', value: `${escalationRate}%`, color: tokens.colors.errorScale[600], bgColor: tokens.colors.errorScale[50], borderColor: tokens.colors.errorScale[200] },
    ];

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title} Analytics</h2>
          {subtitle && (
            <p style={{ margin: 0, marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{subtitle}</p>
          )}
        </Box>

        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
          <Stack direction="vertical" spacing="lg">
            {/* Summary Cards */}
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3] }}>
              {summaryCards.map((card) => (
                <Box key={card.label} style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: card.bgColor,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${card.borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: card.color }}>{card.value}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: card.color }}>{card.label}</span>
                </Box>
              ))}
            </Box>

            {/* Two-column layout for breakdowns */}
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[4] }}>
              {/* Alerts by Type */}
              <Box style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <Box style={createSectionHeaderStyle(tokens)}>Alerts by Type</Box>
                <Stack direction="vertical" spacing="sm">
                  {(Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map((type) => {
                    const count = alertsByType[type] || 0;
                    const barWidth = maxTypeCount > 0 ? (count / maxTypeCount) * 100 : 0;
                    return (
                      <Box key={type} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, width: 24, textAlign: 'center' }}>{getAlertTypeIcon(type)}</span>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700] }}>{ALERT_TYPE_LABELS[type]}</span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{count}</span>
                          </Box>
                          <Box style={{
                            height: 6,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.neutral[100],
                            overflow: 'hidden',
                          }}>
                            <Box style={{
                              height: '100%',
                              width: `${barWidth}%`,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.primaryScale[400],
                              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                            }} />
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {/* Alerts by Severity */}
              <Box style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}>
                <Box style={createSectionHeaderStyle(tokens)}>Alerts by Severity</Box>
                <Stack direction="vertical" spacing="sm">
                  {(['critical', 'high', 'medium', 'low'] as AlertSeverity[]).map((severity) => {
                    const count = alertsBySeverity[severity] || 0;
                    const barWidth = maxSeverityCount > 0 ? (count / maxSeverityCount) * 100 : 0;
                    const sc = severityColors[severity];
                    return (
                      <Box key={severity} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: sc.dot, flexShrink: 0 }} />
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color, fontWeight: tokens.typography.fontWeight.medium, textTransform: 'capitalize' }}>{SEVERITY_LABELS[severity]}</span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{count}</span>
                          </Box>
                          <Box style={{
                            height: 6,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.neutral[100],
                            overflow: 'hidden',
                          }}>
                            <Box style={{
                              height: '100%',
                              width: `${barWidth}%`,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: sc.dot,
                              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                            }} />
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>

            {/* Recent Activity */}
            <Box style={{
              padding: tokens.spacing[3],
              borderRadius: tokens.borderRadius.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <Box style={createSectionHeaderStyle(tokens)}>Recent Activity</Box>
              {recentActivity.length === 0 ? (
                <Box style={{ textAlign: 'center', padding: tokens.spacing[4], color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
                  No recent resolved or dismissed alerts
                </Box>
              ) : (
                recentActivity.map((alert, idx) => {
                  const stc = statusColors[alert.status];
                  return (
                    <Box
                      key={alert.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[3],
                        padding: `${tokens.spacing[2]}px 0`,
                        borderBottom: idx < recentActivity.length - 1
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                          : 'none',
                      }}
                    >
                      <Box style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: stc.color, flexShrink: 0 }} />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                          {alert.title}
                        </span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {alert.entityName}
                        </span>
                      </Box>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: stc.color,
                        backgroundColor: stc.bgColor,
                        textTransform: 'capitalize',
                        flexShrink: 0,
                      }}>
                        {alert.status}
                      </span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], flexShrink: 0 }}>
                        {formatDistanceToNow(alert.updatedAt, { addSuffix: true })}
                      </span>
                    </Box>
                  );
                })
              )}
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  },
});
