import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ApiKeyManagerProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const Cards = createPreset<ApiKeyManagerProps>((context: PresetContext<ApiKeyManagerProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Button } = primitives;

  const { keys, onCreate, onRevoke, onCopy, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  return (
    <Box className={className} style={style}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold }}>
          API Keys
        </Text>
        {onCreate && (
          <Button
            onClick={onCreate}
            style={{
              backgroundColor: tokens.colors.primaryScale[500],
              color: tokens.colors.common.white,
              padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
              borderRadius: tokens.borderRadius.md,
              border: 'none',
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            Create Key
          </Button>
        )}
      </Box>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: tokens.spacing[4] }}>
        {keys.map((key) => (
          <Box key={key.id} style={cardStyle}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                {key.name}
              </Text>
              <Box
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: key.status === 'active' ? tokens.colors.successScale[100] : tokens.colors.neutral[100],
                  color: key.status === 'active' ? tokens.colors.successScale[700] : tokens.colors.neutral[700],
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {key.status}
              </Box>
            </Box>

            <Box style={{ marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                Key
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontFamily: 'monospace' }}>
                {key.prefix}•••••••••••••
              </Text>
            </Box>

            {key.scopes && key.scopes.length > 0 && (
              <Box style={{ marginBottom: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                  Scopes
                </Text>
                <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
                  {key.scopes.map((scope, idx) => (
                    <Box
                      key={idx}
                      style={{
                        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                        backgroundColor: tokens.colors.primaryScale[100],
                        color: tokens.colors.primaryScale[700],
                        borderRadius: tokens.borderRadius.sm,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                      }}
                    >
                      {scope}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box style={{ marginBottom: tokens.spacing[2] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                Created: {key.createdAt}
              </Text>
              {key.lastUsed && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Last used: {key.lastUsed}
                </Text>
              )}
            </Box>

            <Box style={{ display: 'flex', gap: tokens.spacing[2], paddingTop: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
              {onCopy && key.status === 'active' && (
                <Button
                  onClick={() => onCopy(key.key)}
                  style={{
                    flex: 1,
                    backgroundColor: tokens.colors.primaryScale[50],
                    color: tokens.colors.primaryScale[700],
                    padding: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Copy Key
                </Button>
              )}
              {onRevoke && key.status === 'active' && (
                <Button
                  onClick={() => onRevoke(key.id)}
                  style={{
                    flex: 1,
                    backgroundColor: tokens.colors.errorScale[50],
                    color: tokens.colors.errorScale[700],
                    padding: tokens.spacing[2],
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Revoke
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
});
