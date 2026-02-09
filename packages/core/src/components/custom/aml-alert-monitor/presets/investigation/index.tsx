'use client';

/**
 * AmlAlertMonitor - Investigation Preset
 * Detailed investigation view for a selected alert
 */

import { createPreset, PresetContext } from '../../../factory';
import type { AmlAlertMonitorProps } from '../../core';
import { getSeverityColors, getAlertStatusColors, getAlertTypeIcon } from '../../core';
import {
  createBadgeStyle,
  createEmptyStateStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const InvestigationAmlAlertMonitor = createPreset<AmlAlertMonitorProps>({
  name: 'AmlAlertMonitor.Investigation',
  render: ({ primitives, props, tokens }: PresetContext<AmlAlertMonitorProps>) => {
    const { Box, Stack } = primitives;
    const severityColors = getSeverityColors(tokens);
    const statusColors = getAlertStatusColors(tokens);

    const {
      alerts,
      onEscalate,
      onResolve,
      onDismiss,
      onFileSar,
      selectedAlertId,
      loading,
      className,
      style,
    } = props;

    const alert = alerts.find(a => a.id === selectedAlertId) ?? alerts[0] ?? null;

    if (loading) {
      return (
        <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
          <Box style={{ textAlign: 'center', padding: tokens.spacing[8], color: tokens.colors.neutral[400] }}>Loading...</Box>
        </Box>
      );
    }

    if (!alert) {
      return (
        <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
          <Box style={createEmptyStateStyle(tokens)}>
            <span style={{ fontSize: tokens.typography.fontSize.xl, marginBottom: tokens.spacing[2] }}>{'\u{1F50D}'}</span>
            <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[500] }}>Select an alert to investigate</span>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>Choose an alert from the monitor view to see details</span>
          </Box>
        </Box>
      );
    }

    const sc = severityColors[alert.severity];
    const stc = statusColors[alert.status];
    const riskBarStyle = createProgressBarStyle(tokens, {
      color: alert.riskScore >= 75 ? tokens.colors.errorScale[500] : alert.riskScore >= 50 ? tokens.colors.warningScale[500] : tokens.colors.infoScale[500],
      percent: alert.riskScore,
    });

    const formatAmount = (amount: number, currency: string) => {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
    };

    const actionButtonBase = {
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.medium,
      cursor: 'pointer',
      fontFamily: 'inherit',
      transition: `all ${tokens.motion.hover}`,
    } as const;

    return (
      <Box className={className} style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: tokens.colors.common.white, ...style }}>
        {/* Alert Header */}
        <Box style={{
          padding: `${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: sc.bgColor,
        }}>
          <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3] }}>
            {/* Severity + Type icon */}
            <Box style={{
              width: 48,
              height: 48,
              borderRadius: tokens.borderRadius.lg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: tokens.colors.common.white,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
              fontSize: tokens.typography.fontSize.xl,
              flexShrink: 0,
            }}>
              {getAlertTypeIcon(alert.type)}
            </Box>

            <Box style={{ flex: 1, minWidth: 0 }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' }}>
                {/* Severity badge */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.full,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: sc.color,
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${sc.border}`,
                  textTransform: 'uppercase',
                }}>
                  {alert.severity}
                </span>
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
                  textTransform: 'capitalize',
                }}>
                  {alert.status}
                </span>
              </Box>
              <h2 style={{ margin: 0, marginTop: tokens.spacing[2], fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{alert.title}</h2>
              <p style={{ margin: 0, marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{alert.description}</p>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ flex: 1, overflow: 'auto', padding: tokens.spacing[4] }}>
          <Stack direction="vertical" spacing="md">
            {/* Entity Info Section */}
            <Box>
              <Box style={createSectionHeaderStyle(tokens)}>Entity Information</Box>
              <Box style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.neutral[50],
              }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Name</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{alert.entityName}</span>
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Type</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], textTransform: 'capitalize' }}>{alert.entityType}</span>
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Risk Score</span>
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: alert.riskScore >= 75 ? tokens.colors.errorScale[700] : alert.riskScore >= 50 ? tokens.colors.warningScale[700] : tokens.colors.infoScale[700],
                  }}>
                    {alert.riskScore}/100
                  </span>
                </Box>
                <Box style={riskBarStyle.track}>
                  <Box style={riskBarStyle.fill} />
                </Box>
              </Box>
            </Box>

            {/* Transaction Details */}
            {(alert.amount != null || alert.currency) && (
              <Box>
                <Box style={createSectionHeaderStyle(tokens)}>Transaction Details</Box>
                <Box style={{
                  padding: tokens.spacing[3],
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.neutral[50],
                }}>
                  {alert.amount != null && alert.currency && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Amount</span>
                      <span style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
                        {formatAmount(alert.amount, alert.currency)}
                      </span>
                    </Box>
                  )}
                  {alert.currency && (
                    <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Currency</span>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{alert.currency}</span>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Timeline / Notes */}
            {alert.notes && alert.notes.length > 0 && (
              <Box>
                <Box style={createSectionHeaderStyle(tokens)}>Timeline</Box>
                <Box style={{
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  overflow: 'hidden',
                }}>
                  {alert.notes.map((note, idx) => (
                    <Box
                      key={idx}
                      style={{
                        display: 'flex',
                        gap: tokens.spacing[3],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: idx < alert.notes!.length - 1
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                          : 'none',
                        backgroundColor: idx % 2 === 0 ? tokens.colors.common.white : tokens.colors.neutral[50],
                      }}
                    >
                      <Box style={{
                        width: 8,
                        height: 8,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[400],
                        marginTop: tokens.spacing[1],
                        flexShrink: 0,
                      }} />
                      <Box style={{ flex: 1 }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{note}</span>
                        <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1] }}>
                          {formatDistanceToNow(alert.updatedAt, { addSuffix: true })}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Timestamps */}
            <Box>
              <Box style={createSectionHeaderStyle(tokens)}>Dates</Box>
              <Box style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                backgroundColor: tokens.colors.neutral[50],
              }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Created</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{alert.createdAt.toLocaleDateString()}</span>
                </Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>Updated</span>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{alert.updatedAt.toLocaleDateString()}</span>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Action Buttons */}
        <Box style={{
          display: 'flex',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[50],
        }}>
          {onEscalate && alert.status !== 'escalated' && alert.status !== 'resolved' && alert.status !== 'dismissed' && (
            <button
              onClick={() => onEscalate(alert.id)}
              style={{
                ...actionButtonBase,
                backgroundColor: tokens.colors.errorScale[50],
                color: tokens.colors.errorScale[700],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
              }}
            >
              Escalate
            </button>
          )}
          {onResolve && alert.status !== 'resolved' && alert.status !== 'dismissed' && (
            <button
              onClick={() => onResolve(alert.id)}
              style={{
                ...actionButtonBase,
                backgroundColor: tokens.colors.successScale[50],
                color: tokens.colors.successScale[700],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
              }}
            >
              Resolve
            </button>
          )}
          {onDismiss && alert.status !== 'resolved' && alert.status !== 'dismissed' && (
            <button
              onClick={() => onDismiss(alert.id)}
              style={{
                ...actionButtonBase,
                backgroundColor: 'transparent',
                color: tokens.colors.neutral[600],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              }}
            >
              Dismiss
            </button>
          )}
          {onFileSar && (
            <button
              onClick={() => onFileSar(alert.id)}
              style={{
                ...actionButtonBase,
                marginLeft: 'auto',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[700]}`,
              }}
            >
              File SAR
            </button>
          )}
        </Box>
      </Box>
    );
  },
});
