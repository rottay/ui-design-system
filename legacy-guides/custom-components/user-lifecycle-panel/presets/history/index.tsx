'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { UserLifecyclePanelProps } from '../../core';
import { getStateColors, getStateIcon } from '../../core';
import { createCardStyle, createPanelHeaderStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const HistoryUserLifecyclePanel = createPreset<UserLifecyclePanelProps>({
  name: 'UserLifecyclePanel.History',
  render: ({ primitives, props, tokens }: PresetContext<UserLifecyclePanelProps>) => {
    const { Box } = primitives;
    const stateColors = getStateColors(tokens);

    const { user, title = 'Lifecycle History', subtitle, loading, className, style } = props;

    const sortedTransitions = [...user.transitions].sort((a, b) => b.performedAt.getTime() - a.performedAt.getTime());

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{sortedTransitions.length} transitions</span>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : sortedTransitions.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No transition history</Box>
        ) : (
          <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px` }}>
            {sortedTransitions.map((transition, idx) => {
              const fromColors = stateColors[transition.from];
              const toColors = stateColors[transition.to];

              return (
                <Box key={transition.id} style={{ display: 'flex', gap: tokens.spacing[3], paddingBottom: tokens.spacing[3], marginBottom: tokens.spacing[3], borderBottom: idx < sortedTransitions.length - 1 ? `1px solid ${tokens.colors.neutral[100]}` : 'none', position: 'relative' as const }}>
                  {/* Timeline dot and line */}
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', minWidth: 20 }}>
                    <Box style={{ width: 10, height: 10, borderRadius: tokens.borderRadius.full, backgroundColor: toColors.color, flexShrink: 0, marginTop: 4 }} />
                    {idx < sortedTransitions.length - 1 && (
                      <Box style={{ width: 2, flex: 1, backgroundColor: tokens.colors.neutral[200], marginTop: 4 }} />
                    )}
                  </Box>

                  {/* Content */}
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
                      <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: fromColors.bg, color: fromColors.color, fontSize: tokens.typography.fontSize.xs }}>{getStateIcon(transition.from)} {transition.from}</span>
                      <span style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs }}>→</span>
                      <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: toColors.bg, color: toColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>{getStateIcon(transition.to)} {transition.to}</span>
                    </Box>
                    <Box style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                      <span>by {transition.performedBy}</span>
                      <span>{formatDistanceToNow(transition.performedAt, { addSuffix: true })}</span>
                    </Box>
                    {transition.reason && (
                      <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], marginTop: tokens.spacing[1], fontStyle: 'italic' }}>"{transition.reason}"</span>
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
