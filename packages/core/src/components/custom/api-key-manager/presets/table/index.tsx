import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ApiKeyManagerProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const Table = createPreset<ApiKeyManagerProps>((context: PresetContext<ApiKeyManagerProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;

  const { keys, onCreate, onRevoke, onCopy, className, style } = props;

  const cardStyle = createCardStyle(tokens);

  return (
    <Box style={cardStyle} className={className}>
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

      <Box style={{ overflowX: 'auto' }}>
        <Box style={{ minWidth: '800px' }}>
          <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr 1fr', gap: tokens.spacing[4], padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm, marginBottom: tokens.spacing[1] }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Name</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Key Prefix</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Scopes</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Created</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Status</Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Actions</Text>
          </Box>

          {keys.map((key) => (
            <Box key={key.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 1fr 1fr', gap: tokens.spacing[4], padding: tokens.spacing[2], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, alignItems: 'center' }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], fontWeight: tokens.typography.fontWeight.medium }}>
                {key.name}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontFamily: 'monospace' }}>
                {key.prefix}•••
              </Text>
              <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
                {key.scopes && key.scopes.map((scope, idx) => (
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
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                {key.createdAt}
              </Text>
              <Box
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: key.status === 'active' ? tokens.colors.successScale[100] : tokens.colors.neutral[100],
                  color: key.status === 'active' ? tokens.colors.successScale[700] : tokens.colors.neutral[700],
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  display: 'inline-block',
                  width: 'fit-content',
                }}
              >
                {key.status}
              </Box>
              <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                {onCopy && key.status === 'active' && (
                  <Button
                    onClick={() => onCopy(key.key)}
                    style={{
                      backgroundColor: 'transparent',
                      color: tokens.colors.primaryScale[600],
                      padding: tokens.spacing[1],
                      border: 'none',
                      fontSize: tokens.typography.fontSize.xs,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Copy
                  </Button>
                )}
                {onRevoke && key.status === 'active' && (
                  <Button
                    onClick={() => onRevoke(key.id)}
                    style={{
                      backgroundColor: 'transparent',
                      color: tokens.colors.errorScale[600],
                      padding: tokens.spacing[1],
                      border: 'none',
                      fontSize: tokens.typography.fontSize.xs,
                      cursor: 'pointer',
                      textDecoration: 'underline',
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
    </Box>
  );
});
