import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { WebhookConfigProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const Compact = createPreset<WebhookConfigProps>((context: PresetContext<WebhookConfigProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Button } = primitives;

  const { webhooks, onCreate, onDelete, onToggle, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  return (
    <Box style={cardStyle} className={className}>
      <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[4] }}>
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold }}>
          Webhooks
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
            Add
          </Button>
        )}
      </Box>

      {webhooks.map((webhook) => (
        <Box
          key={webhook.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: tokens.spacing[2],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ flex: 1 }}>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], marginBottom: tokens.spacing[1] }}>
              {webhook.url}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
              {webhook.events.length} events
            </Text>
          </Box>

          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box
              style={{
                width: '8px',
                height: '8px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: webhook.active ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
              }}
            />
            {onToggle && (
              <Button
                onClick={() => onToggle(webhook.id)}
                style={{
                  backgroundColor: 'transparent',
                  color: tokens.colors.neutral[600],
                  padding: tokens.spacing[1],
                  border: 'none',
                  fontSize: tokens.typography.fontSize.xs,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Toggle
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(webhook.id)}
                style={{
                  backgroundColor: 'transparent',
                  color: tokens.colors.errorScale[600],
                  padding: tokens.spacing[1],
                  border: 'none',
                  fontSize: tokens.typography.fontSize.xs,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
});
