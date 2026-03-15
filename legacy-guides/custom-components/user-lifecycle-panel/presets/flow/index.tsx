'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { UserLifecyclePanelProps } from '../../core';
import { getStateColors, getStateIcon } from '../../core';
import { createCardStyle, createPanelHeaderStyle } from '../../../helpers';

const FLOW_STATES = [
  'invited',
  'pending-verification',
  'active',
  'suspended',
  'deactivated',
  'locked',
  'archived',
  'deleted',
] as const;

export const FlowUserLifecyclePanel = createPreset<UserLifecyclePanelProps>({
  name: 'UserLifecyclePanel.Flow',
  render: ({ primitives, props, tokens }: PresetContext<UserLifecyclePanelProps>) => {
    const { Box } = primitives;
    const stateColors = getStateColors(tokens);

    const { user, title = 'User Lifecycle', subtitle, loading, className, style } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens) }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[4] }}>
            {/* Current state highlight */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[4], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.lg, backgroundColor: stateColors[user.currentState].bg, border: `1px solid ${stateColors[user.currentState].border}` }}>
              <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{getStateIcon(user.currentState)}</span>
              <Box>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: stateColors[user.currentState].color }}>{user.currentState.replace('-', ' ').toUpperCase()}</span>
                <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: 2 }}>{user.displayName} ({user.email})</span>
              </Box>
            </Box>

            {/* Flow diagram */}
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[2], justifyContent: 'center' }}>
              {FLOW_STATES.map((state, idx) => {
                const colors = stateColors[state];
                const isCurrent = state === user.currentState;
                const hasVisited = user.transitions.some(t => t.to === state || t.from === state);

                return (
                  <Box key={state} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <Box style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: isCurrent ? colors.bg : hasVisited ? tokens.colors.neutral[50] : tokens.colors.common.white,
                      border: `2px solid ${isCurrent ? colors.color : hasVisited ? tokens.colors.neutral[300] : tokens.colors.neutral[200]}`,
                      textAlign: 'center' as const,
                      minWidth: 80,
                      opacity: !isCurrent && !hasVisited ? 0.5 : 1,
                    }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, display: 'block' }}>{getStateIcon(state)}</span>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal, color: isCurrent ? colors.color : tokens.colors.neutral[600], display: 'block', marginTop: 2 }}>{state.replace('-', ' ')}</span>
                    </Box>
                    {idx < FLOW_STATES.length - 1 && (
                      <span style={{ color: tokens.colors.neutral[300], fontSize: tokens.typography.fontSize.lg }}>→</span>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Recent transition */}
            {user.transitions.length > 0 && (
              <Box style={{ marginTop: tokens.spacing[4], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>Last transition: </span>
                {user.transitions[0].from} → {user.transitions[0].to}
                <span style={{ color: tokens.colors.neutral[400] }}> by {user.transitions[0].performedBy} on {user.transitions[0].performedAt.toLocaleDateString()}</span>
                {user.transitions[0].reason && <span style={{ display: 'block', marginTop: 2, fontStyle: 'italic' }}>Reason: {user.transitions[0].reason}</span>}
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  },
});
