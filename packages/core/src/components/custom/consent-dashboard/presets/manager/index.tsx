'use client';

/**
 * ConsentDashboard - Manager Preset
 * Interactive consent toggle management
 */

import { createPreset, PresetContext } from '../../../factory';
import type { ConsentDashboardProps } from '../../core';
import { getConsentStatusColors, getPurposeIcon } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
} from '../../../helpers';

export const ManagerConsentDashboard = createPreset<ConsentDashboardProps>({
  name: 'ConsentDashboard.Manager',
  render: ({ primitives, props, tokens }: PresetContext<ConsentDashboardProps>) => {
    const { Box } = primitives;
    const statusColors = getConsentStatusColors(tokens);

    const {
      consents,
      onConsentToggle,
      onWithdraw,
      title = 'Manage Consents',
      subtitle,
      loading,
      className,
      style,
    } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box>
            {consents.map((consent) => {
              const colors = statusColors[consent.status];
              const isGranted = consent.status === 'granted';

              return (
                <Box key={consent.id} style={{
                  ...createListItemStyle(tokens),
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'flex-start', gap: tokens.spacing[3], flex: 1 }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xl, marginTop: 2 }}>{getPurposeIcon(consent.purpose)}</span>
                    <Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{consent.label}</span>
                        {consent.isRequired && (
                          <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.xs }}>Required</span>
                        )}
                        <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[500], fontSize: tokens.typography.fontSize.xs }}>v{consent.version}</span>
                      </Box>
                      <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{consent.description}</p>
                      {consent.dataCategories && consent.dataCategories.length > 0 && (
                        <Box style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[1], flexWrap: 'wrap' }}>
                          {consent.dataCategories.map((cat, i) => (
                            <span key={i} style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs }}>{cat}</span>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>

                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                      <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                      {consent.status}
                    </span>

                    {!consent.isRequired && onConsentToggle && (
                      <button onClick={() => onConsentToggle(consent.id, !isGranted)} style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: 'none',
                        backgroundColor: isGranted ? tokens.colors.errorScale[500] : tokens.colors.successScale[500],
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        {isGranted ? 'Withdraw' : 'Grant'}
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
