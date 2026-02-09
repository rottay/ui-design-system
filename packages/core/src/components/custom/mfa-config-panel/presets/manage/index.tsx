'use client';

/**
 * MfaConfigPanel - Manage Preset
 * Manage configured MFA methods
 */

import { createPreset, PresetContext } from '../../../factory';
import type { MfaConfigPanelProps } from '../../core';
import { getMethodIcon, getMethodStatusColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const ManageMfaConfigPanel = createPreset<MfaConfigPanelProps>({
  name: 'MfaConfigPanel.Manage',
  render: ({ primitives, props, tokens }: PresetContext<MfaConfigPanelProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getMethodStatusColors(tokens);

    const {
      methods,
      onMethodToggle,
      onMethodSetup,
      onSetPrimary,
      onRegenerateRecoveryCodes,
      title = 'Multi-Factor Authentication',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const activeCount = methods.filter(m => m.status === 'active').length;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: activeCount > 0 ? tokens.colors.successScale[600] : tokens.colors.warningScale[600], fontWeight: tokens.typography.fontWeight.medium }}>
            {activeCount > 0 ? `${activeCount} active` : 'Not configured'}
          </span>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box>
            {methods.map((method) => {
              const colors = statusColors[method.status];
              const isRecovery = method.method === 'recovery-codes';

              return (
                <Box key={method.method} style={{
                  ...createListItemStyle(tokens),
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xl }}>{getMethodIcon(method.method)}</span>
                    <Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{method.label}</span>
                        {method.isPrimary && (
                          <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs }}>Primary</span>
                        )}
                      </Box>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{method.description}</span>
                      {method.lastUsed && (
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>Last used: {formatDistanceToNow(method.lastUsed, { addSuffix: true })}</span>
                      )}
                      {isRecovery && method.recoveryCodesRemaining !== undefined && (
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: method.recoveryCodesRemaining < 3 ? tokens.colors.warningScale[600] : tokens.colors.neutral[500] }}>
                          {method.recoveryCodesRemaining} codes remaining
                        </span>
                      )}
                    </Box>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                      <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                      {method.status === 'active' ? 'Active' : 'Inactive'}
                    </span>

                    {method.status === 'active' && !method.isPrimary && onSetPrimary && !isRecovery && (
                      <button onClick={() => onSetPrimary(method.method)} style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.neutral[300]}`,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[600],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Set Primary
                      </button>
                    )}

                    {isRecovery && method.status === 'active' && onRegenerateRecoveryCodes && (
                      <button onClick={onRegenerateRecoveryCodes} style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.warningScale[300]}`,
                        backgroundColor: tokens.colors.warningScale[50],
                        color: tokens.colors.warningScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Regenerate
                      </button>
                    )}

                    {method.status === 'active' && onMethodToggle && !isRecovery && (
                      <button onClick={() => onMethodToggle(method.method, false)} style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.errorScale[200]}`,
                        backgroundColor: tokens.colors.errorScale[50],
                        color: tokens.colors.errorScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Disable
                      </button>
                    )}

                    {method.status !== 'active' && onMethodSetup && (
                      <button onClick={() => onMethodSetup(method.method)} style={{
                        padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border: 'none',
                        backgroundColor: tokens.colors.primaryScale[500],
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Enable
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
