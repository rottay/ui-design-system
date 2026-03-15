'use client';

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { UserLifecyclePanelProps } from '../../core';
import { getStateColors, getStateIcon, getActionLabel } from '../../core';
import { createCardStyle, createPanelHeaderStyle } from '../../../helpers';

export const ActionsUserLifecyclePanel = createPreset<UserLifecyclePanelProps>({
  name: 'UserLifecyclePanel.Actions',
  render: ({ primitives, props, tokens }: PresetContext<UserLifecyclePanelProps>) => {
    const { Box } = primitives;
    const stateColors = getStateColors(tokens);

    const { user, onTransition, onResendInvite, onResetPassword, title = 'User Actions', loading, className, style } = props;

    const [selectedAction, setSelectedAction] = useState<string | null>(null);
    const [reason, setReason] = useState('');

    const handleTransition = (toState: string) => {
      onTransition?.(user.userId, toState as any, reason || undefined);
      setSelectedAction(null);
      setReason('');
    };

    const currentColors = stateColors[user.currentState];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{user.displayName}</span>
              <span style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: currentColors.bg, color: currentColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>{getStateIcon(user.currentState)} {user.currentState}</span>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[4] }}>
            {/* Available state transitions */}
            <Box style={{ marginBottom: tokens.spacing[4] }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>State Transitions</span>
              <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2] }}>
                {user.availableActions.map(action => {
                  const actionColors = stateColors[action];
                  const isSelected = selectedAction === action;
                  return (
                    <button
                      key={action}
                      onClick={() => setSelectedAction(isSelected ? null : action)}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${isSelected ? actionColors.color : actionColors.border}`,
                        backgroundColor: isSelected ? actionColors.bg : tokens.colors.common.white,
                        color: actionColors.color,
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[1],
                      }}
                    >
                      {getStateIcon(action)} {getActionLabel(action)}
                    </button>
                  );
                })}
              </Box>
            </Box>

            {/* Reason input when action selected */}
            {selectedAction && (
              <Box style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], border: `1px solid ${tokens.colors.neutral[200]}`, marginBottom: tokens.spacing[3] }}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[1] }}>
                  Transition to: {selectedAction}
                </span>
                <input
                  type="text"
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${tokens.colors.neutral[300]}`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontFamily: 'inherit',
                    marginBottom: tokens.spacing[2],
                    boxSizing: 'border-box' as const,
                  }}
                />
                <Box style={{ display: 'flex', gap: tokens.spacing[2], justifyContent: 'flex-end' }}>
                  <button onClick={() => { setSelectedAction(null); setReason(''); }} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  <button onClick={() => handleTransition(selectedAction)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Confirm</button>
                </Box>
              </Box>
            )}

            {/* Quick actions */}
            <Box style={{ borderTop: `1px solid ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[3] }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700], display: 'block', marginBottom: tokens.spacing[2] }}>Quick Actions</span>
              <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                {onResendInvite && user.currentState === 'invited' && (
                  <button onClick={() => onResendInvite(user.userId)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.infoScale[200]}`, backgroundColor: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>📨 Resend Invite</button>
                )}
                {onResetPassword && (user.currentState === 'active' || user.currentState === 'locked') && (
                  <button onClick={() => onResetPassword(user.userId)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.warningScale[200]}`, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>🔑 Reset Password</button>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
