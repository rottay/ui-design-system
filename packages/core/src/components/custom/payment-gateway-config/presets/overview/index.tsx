'use client';

/**
 * PaymentGatewayConfig - Overview Preset
 * Gateway overview with summary stats, grid of gateway cards, and actions
 */

import { createPreset, PresetContext } from '../../../factory';
import type { PaymentGatewayConfigProps } from '../../core';
import { getStatusColors, getProviderIcon, formatVolume } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
} from '../../../helpers';

export const OverviewPaymentGatewayConfig = createPreset<PaymentGatewayConfigProps>({
  name: 'PaymentGatewayConfig.Overview',
  render: ({ primitives, props, tokens }: PresetContext<PaymentGatewayConfigProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getStatusColors(tokens);

    const {
      gateways,
      onAddGateway,
      onEditGateway,
      onDeleteGateway,
      onToggleTestMode,
      onToggleStatus,
      title = 'Payment Gateways',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const activeCount = gateways.filter(g => g.status === 'active').length;
    const testModeCount = gateways.filter(g => g.isTestMode).length;
    const totalVolume = gateways.reduce((sum, g) => sum + g.monthlyVolume, 0);

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        {/* Header */}
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          {onAddGateway && (
            <button onClick={onAddGateway} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Add Gateway
            </button>
          )}
        </Box>

        {/* Summary Stats */}
        <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
          <Box style={{ textAlign: 'center' }}>
            <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{gateways.length}</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Total Gateways</Box>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.successScale[600] }}>{activeCount}</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Active</Box>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.warningScale[600] }}>{testModeCount}</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Test Mode</Box>
          </Box>
          <Box style={{ textAlign: 'center' }}>
            <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[600] }}>{formatVolume(totalVolume)}</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Monthly Volume</Box>
          </Box>
        </Box>

        {/* Gateway Cards */}
        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : gateways.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No gateways configured</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: tokens.spacing[3], padding: tokens.spacing[4] }}>
            {gateways.map((gateway) => {
              const sColors = statusColors[gateway.status];
              const progressBar = createProgressBarStyle(tokens, { percent: gateway.successRate, color: gateway.successRate >= 95 ? tokens.colors.successScale[500] : gateway.successRate >= 80 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500] });

              return (
                <Box key={gateway.id} style={{
                  ...createCardStyle(tokens, { elevation: 'sm' }),
                  padding: tokens.spacing[4],
                  display: 'flex',
                  flexDirection: 'column',
                  gap: tokens.spacing[3],
                }}>
                  {/* Card Header: Provider + Status */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xl }}>{getProviderIcon(gateway.provider)}</span>
                      <Box>
                        <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{gateway.name}</Box>
                        <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{gateway.provider}</Box>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      {gateway.isTestMode && (
                        <span style={{
                          padding: `0 ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          backgroundColor: tokens.colors.warningScale[100],
                          color: tokens.colors.warningScale[700],
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          border: `1px solid ${tokens.colors.warningScale[200]}`,
                        }}>
                          Test
                        </span>
                      )}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                        padding: `0 ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: sColors.bgColor,
                        color: sColors.color,
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        <span style={{ width: tokens.spacing[1], height: tokens.spacing[1], borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot }} />
                        {gateway.status}
                      </span>
                    </Box>
                  </Box>

                  {/* Success Rate */}
                  <Box>
                    <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Success Rate</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{gateway.successRate}%</span>
                    </Box>
                    <Box style={progressBar.track}>
                      <Box style={progressBar.fill} />
                    </Box>
                  </Box>

                  {/* Metrics Row */}
                  <Box style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{formatVolume(gateway.monthlyVolume)}</Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Monthly Volume</Box>
                    </Box>
                    <Box style={{ textAlign: 'right' }}>
                      <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{gateway.transactionCount.toLocaleString()}</Box>
                      <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Transactions</Box>
                    </Box>
                  </Box>

                  {/* Supported Methods */}
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                    {gateway.supportedMethods.map((method) => (
                      <span key={method} style={{
                        padding: `0 ${tokens.spacing[1]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.neutral[100],
                        color: tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                      }}>
                        {method}
                      </span>
                    ))}
                  </Box>

                  {/* Actions */}
                  <Box style={{ display: 'flex', gap: tokens.spacing[1], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[3] }}>
                    {onEditGateway && (
                      <button onClick={() => onEditGateway(gateway.id)} style={{
                        flex: 1,
                        padding: `${tokens.spacing[1]}px 0`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.neutral[300]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Edit
                      </button>
                    )}
                    {onToggleStatus && (
                      <button onClick={() => onToggleStatus(gateway.id)} style={{
                        flex: 1,
                        padding: `${tokens.spacing[1]}px 0`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${gateway.status === 'active' ? tokens.colors.warningScale[300] : tokens.colors.successScale[300]}`,
                        backgroundColor: gateway.status === 'active' ? tokens.colors.warningScale[50] : tokens.colors.successScale[50],
                        color: gateway.status === 'active' ? tokens.colors.warningScale[700] : tokens.colors.successScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        {gateway.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    {onToggleTestMode && (
                      <button onClick={() => onToggleTestMode(gateway.id)} style={{
                        flex: 1,
                        padding: `${tokens.spacing[1]}px 0`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.infoScale[300]}`,
                        backgroundColor: tokens.colors.infoScale[50],
                        color: tokens.colors.infoScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        {gateway.isTestMode ? 'Live Mode' : 'Test Mode'}
                      </button>
                    )}
                    {onDeleteGateway && (
                      <button onClick={() => onDeleteGateway(gateway.id)} style={{
                        flex: 1,
                        padding: `${tokens.spacing[1]}px 0`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.errorScale[200]}`,
                        backgroundColor: tokens.colors.errorScale[50],
                        color: tokens.colors.errorScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Delete
                      </button>
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
