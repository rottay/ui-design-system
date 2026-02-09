'use client';

/**
 * AmlAlertMonitor - Monitor Preset
 * Real-time alert list with severity stats and status filters
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { AmlAlertMonitorProps, AlertStatus } from '../../core';
import { getSeverityColors, getAlertStatusColors, getAlertTypeIcon } from '../../core';
import {
  createBadgeStyle,
  createFilterPillStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 } as const;

const STATUS_FILTERS: Array<{ value: AlertStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'investigating', label: 'Investigating' },
  { value: 'escalated', label: 'Escalated' },
];

export const MonitorAmlAlertMonitor = createPreset<AmlAlertMonitorProps>({
  name: 'AmlAlertMonitor.Monitor',
  render: ({ primitives, props, tokens }: PresetContext<AmlAlertMonitorProps>) => {
    const { Box, Stack } = primitives;
    const severityColors = getSeverityColors(tokens);
    const statusColors = getAlertStatusColors(tokens);

    const {
      alerts,
      onInvestigate,
      onEscalate,
      onDismiss,
      selectedAlertId,
      title = 'AML Alerts',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [activeFilter, setActiveFilter] = useState<AlertStatus | 'all'>('all');

    const filteredAlerts = alerts
      .filter(a => activeFilter === 'all' || a.status === activeFilter)
      .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

    const criticalCount = alerts.filter(a => a.severity === 'critical').length;
    const highCount = alerts.filter(a => a.severity === 'high').length;
    const mediumCount = alerts.filter(a => a.severity === 'medium').length;
    const lowCount = alerts.filter(a => a.severity === 'low').length;

    const severityCounts = [
      { label: 'Critical', count: criticalCount, key: 'critical' as const },
      { label: 'High', count: highCount, key: 'high' as const },
      { label: 'Medium', count: mediumCount, key: 'medium' as const },
      { label: 'Low', count: lowCount, key: 'low' as const },
    ];

    const formatAmount = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Header */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h2 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{title}</h2>
            {subtitle && (
              <p style={{ margin: 0, marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{subtitle}</p>
            )}
          </Box>
          <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
            {alerts.length} total
          </Box>
        </Box>

        {/* Summary Stats */}
        <Box style={{ display: 'flex', gap: tokens.spacing[3], padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          {severityCounts.map((s) => {
            const sc = severityColors[s.key];
            return (
              <Box key={s.key} style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: sc.bgColor,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
              }}>
                <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: sc.color }}>{s.count}</span>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: sc.color, fontWeight: tokens.typography.fontWeight.medium }}>{s.label}</span>
              </Box>
            );
          })}
        </Box>

        {/* Filter Pills */}
        <Box style={{ display: 'flex', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              style={{
                ...createFilterPillStyle(tokens, { active: activeFilter === filter.value }),
                border: activeFilter === filter.value
                  ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`
                  : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                fontFamily: 'inherit',
              }}
            >
              {filter.label}
            </button>
          ))}
        </Box>

        {/* Alert List */}
        <Box style={{ flex: 1, overflow: 'auto' }}>
          {loading ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : filteredAlerts.length === 0 ? (
            <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>No alerts found</Box>
          ) : (
            filteredAlerts.map((alert) => {
              const sc = severityColors[alert.severity];
              const stc = statusColors[alert.status];
              const isSelected = alert.id === selectedAlertId;

              return (
                <Box
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                    transition: `background-color ${tokens.transitions?.fast || tokens.motion.hover}`,
                    cursor: 'pointer',
                  }}
                >
                  {/* Severity color bar */}
                  <Box style={{ width: 4, height: 48, borderRadius: tokens.borderRadius.full, backgroundColor: sc.dot, flexShrink: 0 }} />

                  {/* Main content */}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm }}>{getAlertTypeIcon(alert.type)}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</span>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{alert.entityName}</span>
                      {alert.amount != null && alert.currency && (
                        <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>
                          {formatAmount(alert.amount, alert.currency)}
                        </span>
                      )}
                    </Box>
                  </Box>

                  {/* Risk score circle */}
                  <Box style={{
                    width: 40,
                    height: 40,
                    borderRadius: tokens.borderRadius.full,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: alert.riskScore >= 75 ? tokens.colors.errorScale[700] : alert.riskScore >= 50 ? tokens.colors.warningScale[700] : tokens.colors.infoScale[700],
                    backgroundColor: alert.riskScore >= 75 ? tokens.colors.errorScale[50] : alert.riskScore >= 50 ? tokens.colors.warningScale[50] : tokens.colors.infoScale[50],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${alert.riskScore >= 75 ? tokens.colors.errorScale[200] : alert.riskScore >= 50 ? tokens.colors.warningScale[200] : tokens.colors.infoScale[200]}`,
                    flexShrink: 0,
                  }}>
                    {alert.riskScore}
                  </Box>

                  {/* Status badge */}
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: stc.color,
                    backgroundColor: stc.bgColor,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${stc.border}`,
                    flexShrink: 0,
                    textTransform: 'capitalize',
                  }}>
                    {alert.status}
                  </span>

                  {/* Quick actions */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[1], flexShrink: 0 }}>
                    {alert.status === 'new' && onInvestigate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onInvestigate(alert.id); }}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                          backgroundColor: tokens.colors.primaryScale[50],
                          color: tokens.colors.primaryScale[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        Investigate
                      </button>
                    )}
                    {(alert.status === 'new' || alert.status === 'investigating') && onEscalate && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onEscalate(alert.id); }}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                          backgroundColor: tokens.colors.errorScale[50],
                          color: tokens.colors.errorScale[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        Escalate
                      </button>
                    )}
                    {(alert.status === 'new' || alert.status === 'investigating') && onDismiss && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDismiss(alert.id); }}
                        style={{
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          backgroundColor: 'transparent',
                          color: tokens.colors.neutral[600],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        Dismiss
                      </button>
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
    );
  },
});
