'use client';

/**
 * MfaConfigPanel - Policy Preset
 * MFA policy configuration for administrators
 */

import { createPreset, PresetContext } from '../../../factory';
import type { MfaConfigPanelProps } from '../../core';
import { getMethodIcon } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createBadgeStyle,
} from '../../../helpers';

export const PolicyMfaConfigPanel = createPreset<MfaConfigPanelProps>({
  name: 'MfaConfigPanel.Policy',
  render: ({ primitives, props, tokens }: PresetContext<MfaConfigPanelProps>) => {
    const { Box, Stack } = primitives;

    const {
      policies: rawPolicies = [],
      onPolicyToggle,
      title = 'MFA Policies',
      subtitle = 'Configure authentication requirements',
      loading,
      className,
      style,
    } = props;

    const policies = Array.isArray(rawPolicies) ? rawPolicies : [];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : policies.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No policies configured</Box>
        ) : (
          <Box>
            {policies.map((policy) => (
              <Box key={policy.id} style={{
                ...createListItemStyle(tokens),
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              }}>
                <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box style={{ flex: 1 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{policy.name}</span>
                      <span style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: policy.enforced ? tokens.colors.successScale[50] : tokens.colors.neutral[100], color: policy.enforced ? tokens.colors.successScale[700] : tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
                        {policy.enforced ? 'Enforced' : 'Disabled'}
                      </span>
                    </Box>
                    {policy.description && (
                      <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{policy.description}</p>
                    )}
                    <Box style={{ display: 'flex', gap: tokens.spacing[3], marginTop: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      <span>Applies to: <strong style={{ color: tokens.colors.neutral[700] }}>{policy.appliesTo}</strong></span>
                      <span>Min methods: <strong style={{ color: tokens.colors.neutral[700] }}>{policy.minMethods}</strong></span>
                      {policy.gracePeriodDays !== undefined && (
                        <span>Grace period: <strong style={{ color: tokens.colors.neutral[700] }}>{policy.gracePeriodDays}d</strong></span>
                      )}
                    </Box>
                    <Box style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[2] }}>
                      {policy.requiredMethods.map(m => (
                        <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.neutral[100], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                          {getMethodIcon(m)} {m}
                        </span>
                      ))}
                    </Box>
                  </Box>
                  {onPolicyToggle && (
                    <button onClick={() => onPolicyToggle(policy.id, !policy.enforced)} style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `1px solid ${policy.enforced ? tokens.colors.errorScale[300] : tokens.colors.successScale[300]}`,
                      backgroundColor: policy.enforced ? tokens.colors.errorScale[50] : tokens.colors.successScale[50],
                      color: policy.enforced ? tokens.colors.errorScale[700] : tokens.colors.successScale[700],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}>
                      {policy.enforced ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  },
});
