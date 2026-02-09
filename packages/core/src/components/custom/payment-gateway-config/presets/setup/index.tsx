'use client';

/**
 * PaymentGatewayConfig - Setup Preset
 * Detail/configuration view for a single payment gateway
 */

import { createPreset, PresetContext } from '../../../factory';
import type { PaymentGatewayConfigProps } from '../../core';
import { getStatusColors, getProviderIcon, formatVolume } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
} from '../../../helpers';

export const SetupPaymentGatewayConfig = createPreset<PaymentGatewayConfigProps>({
  name: 'PaymentGatewayConfig.Setup',
  render: ({ primitives, props, tokens }: PresetContext<PaymentGatewayConfigProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getStatusColors(tokens);

    const {
      gateways,
      selectedGatewayId,
      onEditGateway,
      onToggleTestMode,
      onToggleStatus,
      title = 'Payment Gateways',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const gateway = gateways.find(g => g.id === selectedGatewayId) || gateways[0];

    if (loading) {
      return (
        <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>
          Loading...
        </Box>
      );
    }

    if (!gateway) {
      return (
        <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>
          Select a gateway to configure
        </Box>
      );
    }

    const sColors = statusColors[gateway.status];
    const progressBar = createProgressBarStyle(tokens, {
      percent: gateway.successRate,
      color: gateway.successRate >= 95 ? tokens.colors.successScale[500] : gateway.successRate >= 80 ? tokens.colors.warningScale[500] : tokens.colors.errorScale[500],
    });

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        {/* Header */}
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{getProviderIcon(gateway.provider)}</span>
            <Box>
              <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{gateway.name}</h3>
              {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            {gateway.isTestMode && (
              <span style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.warningScale[100],
                color: tokens.colors.warningScale[700],
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `1px solid ${tokens.colors.warningScale[200]}`,
              }}>
                Test Mode
              </span>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              backgroundColor: sColors.bgColor,
              color: sColors.color,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              <span style={{ width: tokens.spacing[1], height: tokens.spacing[1], borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot }} />
              {gateway.status}
            </span>
          </Box>
        </Box>

        <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column', gap: tokens.spacing[5] }}>
          {/* Provider Info */}
          <Box>
            <Box style={createSectionHeaderStyle(tokens)}>Provider</Box>
            <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
              <Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Provider</Box>
                <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{gateway.provider}</Box>
              </Box>
              <Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Name</Box>
                <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{gateway.name}</Box>
              </Box>
            </Box>
          </Box>

          {/* API Configuration */}
          <Box>
            <Box style={createSectionHeaderStyle(tokens)}>API Configuration</Box>
            <Stack direction="vertical" spacing="sm">
              {gateway.webhookUrl && (
                <Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Webhook URL</Box>
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderRadius: tokens.borderRadius.sm,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gateway.webhookUrl}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[500], cursor: 'pointer', flexShrink: 0 }}>Copy</span>
                  </Box>
                </Box>
              )}
              <Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Supported Currencies</Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                  {gateway.supportedCurrencies.map((currency) => (
                    <span key={currency} style={{
                      padding: `0 ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: tokens.colors.primaryScale[50],
                      color: tokens.colors.primaryScale[700],
                      fontSize: tokens.typography.fontSize.xs,
                      border: `1px solid ${tokens.colors.primaryScale[200]}`,
                    }}>
                      {currency}
                    </span>
                  ))}
                </Box>
              </Box>
              <Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Supported Methods</Box>
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
                  {gateway.supportedMethods.map((method) => (
                    <span key={method} style={{
                      padding: `0 ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: tokens.colors.neutral[100],
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                    }}>
                      {method}
                    </span>
                  ))}
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Fee Structure */}
          <Box>
            <Box style={createSectionHeaderStyle(tokens)}>Fee Structure</Box>
            <Box style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: tokens.spacing[3],
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <Box style={{ textAlign: 'center' }}>
                <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{gateway.fees.percentage}%</Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Percentage</Box>
              </Box>
              <Box style={{ textAlign: 'center' }}>
                <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${gateway.fees.fixed.toFixed(2)}</Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Fixed Fee</Box>
              </Box>
              <Box style={{ textAlign: 'center' }}>
                <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{gateway.fees.currency}</Box>
                <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Currency</Box>
              </Box>
            </Box>
          </Box>

          {/* Performance Metrics */}
          <Box>
            <Box style={createSectionHeaderStyle(tokens)}>Performance</Box>
            <Stack direction="vertical" spacing="sm">
              <Box>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Success Rate</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>{gateway.successRate}%</span>
                </Box>
                <Box style={progressBar.track}>
                  <Box style={progressBar.fill} />
                </Box>
              </Box>
              <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing[3] }}>
                <Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Transaction Count</Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{gateway.transactionCount.toLocaleString()}</Box>
                </Box>
                <Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Monthly Volume</Box>
                  <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>{formatVolume(gateway.monthlyVolume)}</Box>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Toggle Actions */}
          <Box style={{ display: 'flex', gap: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[4] }}>
            {onToggleTestMode && (
              <button onClick={() => onToggleTestMode(gateway.id)} style={{
                flex: 1,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${gateway.isTestMode ? tokens.colors.successScale[300] : tokens.colors.warningScale[300]}`,
                backgroundColor: gateway.isTestMode ? tokens.colors.successScale[50] : tokens.colors.warningScale[50],
                color: gateway.isTestMode ? tokens.colors.successScale[700] : tokens.colors.warningScale[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                {gateway.isTestMode ? 'Switch to Live Mode' : 'Switch to Test Mode'}
              </button>
            )}
            {onToggleStatus && (
              <button onClick={() => onToggleStatus(gateway.id)} style={{
                flex: 1,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${gateway.status === 'active' ? tokens.colors.errorScale[300] : tokens.colors.successScale[300]}`,
                backgroundColor: gateway.status === 'active' ? tokens.colors.errorScale[50] : tokens.colors.successScale[50],
                color: gateway.status === 'active' ? tokens.colors.errorScale[700] : tokens.colors.successScale[700],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                {gateway.status === 'active' ? 'Deactivate Gateway' : 'Activate Gateway'}
              </button>
            )}
            {onEditGateway && (
              <button onClick={() => onEditGateway(gateway.id)} style={{
                flex: 1,
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.primaryScale[300]}`,
                backgroundColor: tokens.colors.primaryScale[500],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: `all ${tokens.motion.hover}`,
              }}>
                Edit Configuration
              </button>
            )}
          </Box>
        </Box>
      </Box>
    );
  },
});
