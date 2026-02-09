'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { SsoConnectionCardProps } from '../../core';
import { getSsoStatusColors, getProtocolLabel, getProviderIcon } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createListItemStyle } from '../../../helpers';

export const CompactSsoConnectionCard = createPreset<SsoConnectionCardProps>({
  name: 'SsoConnectionCard.Compact',
  render: ({ primitives, props, tokens }: PresetContext<SsoConnectionCardProps>) => {
    const { Box } = primitives;
    const statusColors = getSsoStatusColors(tokens);

    const { connections, onConnectionClick, onToggle, onCreate, title = 'SSO Connections', loading, className, style } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {onCreate && (
            <button onClick={onCreate} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Add</button>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box>
            {connections.map((conn) => {
              const colors = statusColors[conn.status];
              return (
                <Box key={conn.id} onClick={() => onConnectionClick?.(conn.id)} style={{
                  ...createListItemStyle(tokens, { interactive: !!onConnectionClick }),
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span>{getProviderIcon(conn.provider)}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{conn.name}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{getProtocolLabel(conn.protocol)}</span>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                      <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                      {conn.status}
                    </span>
                    {onToggle && (
                      <button onClick={(e) => { e.stopPropagation(); onToggle(conn.id, conn.status !== 'active'); }} style={{
                        padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                      }}>{conn.status === 'active' ? 'Disable' : 'Enable'}</button>
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
