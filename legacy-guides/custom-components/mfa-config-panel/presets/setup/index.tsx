'use client';

/**
 * MfaConfigPanel - Setup Preset
 * Step-by-step MFA setup wizard
 */

import { createPreset, PresetContext } from '../../../factory';
import type { MfaConfigPanelProps } from '../../core';
import { getMethodIcon, getMethodStatusColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createAccentBarStyle,
  createInteractiveCardStyle,
} from '../../../helpers';

export const SetupMfaConfigPanel = createPreset<MfaConfigPanelProps>({
  name: 'MfaConfigPanel.Setup',
  render: ({ primitives, props, tokens }: PresetContext<MfaConfigPanelProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getMethodStatusColors(tokens);

    const {
      methods,
      onMethodSetup,
      title = 'Set Up MFA',
      subtitle = 'Add an extra layer of security to your account',
      loading,
      className,
      style,
    } = props;

    const activeCount = methods.filter(m => m.status === 'active').length;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top' })} />
        <Box style={{ padding: tokens.spacing[5] }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}

          {activeCount > 0 && (
            <Box style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], marginTop: tokens.spacing[2], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[50], color: tokens.colors.successScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
              <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.successScale[500], display: 'inline-block' }} />
              {activeCount} method{activeCount > 1 ? 's' : ''} active
            </Box>
          )}

          {loading ? (
            <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3], marginTop: tokens.spacing[4] }}>
              {methods.map((method) => {
                const colors = statusColors[method.status];
                return (
                  <Box key={method.method} style={{
                    ...createInteractiveCardStyle(tokens, { active: method.status === 'active' }),
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: tokens.spacing[4],
                  }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{getMethodIcon(method.method)}</span>
                      <Box>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{method.label}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{method.description}</span>
                      </Box>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                        <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                        {method.status === 'active' ? 'Active' : method.status === 'pending-setup' ? 'Pending' : 'Inactive'}
                      </span>
                      {method.status !== 'active' && onMethodSetup && (
                        <button onClick={() => onMethodSetup(method.method)} style={{
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
                          Set Up
                        </button>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
