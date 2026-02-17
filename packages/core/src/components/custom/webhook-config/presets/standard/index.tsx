import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { WebhookConfigProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const Standard = createPreset<WebhookConfigProps>((context: PresetContext<WebhookConfigProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Button } = primitives;

  const { webhooks, events, deliveryLogs: rawDeliveryLogs = [], onCreate, onDelete, onToggle, onTest, className, style } = props;

    const deliveryLogs = Array.isArray(rawDeliveryLogs) ? rawDeliveryLogs : [];

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return tokens.colors.successScale[600];
      case 'failed': return tokens.colors.errorScale[600];
      case 'pending': return tokens.colors.warningScale[600];
      default: return tokens.colors.neutral[600];
    }
  };

  return (
    <Box className={className} style={style}>
      <Box style={cardStyle}>
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
              Create Webhook
            </Button>
          )}
        </Box>

        {webhooks.map((webhook) => (
          <Box
            key={webhook.id}
            style={{
              padding: tokens.spacing[4],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              marginBottom: tokens.spacing[4],
            }}
          >
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
              <Box style={{ flex: 1 }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontFamily: 'monospace', color: tokens.colors.neutral[700], marginBottom: tokens.spacing[1] }}>
                  {webhook.url}
                </Text>
                <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap', marginBottom: tokens.spacing[1] }}>
                  {webhook.events.map((eventKey) => {
                    const event = events.find(e => e.key === eventKey);
                    return (
                      <Box
                        key={eventKey}
                        style={{
                          padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                          backgroundColor: tokens.colors.primaryScale[100],
                          color: tokens.colors.primaryScale[700],
                          borderRadius: tokens.borderRadius.sm,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                        }}
                      >
                        {event?.label || eventKey}
                      </Box>
                    );
                  })}
                </Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Created {webhook.createdAt}
                </Text>
              </Box>

              <Box
                style={{
                  padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                  backgroundColor: webhook.active ? tokens.colors.successScale[100] : tokens.colors.neutral[100],
                  color: webhook.active ? tokens.colors.successScale[700] : tokens.colors.neutral[700],
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {webhook.active ? 'Active' : 'Inactive'}
              </Box>
            </Box>

            <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
              {onToggle && (
                <Button
                  onClick={() => onToggle(webhook.id)}
                  style={{
                    backgroundColor: tokens.colors.neutral[100],
                    color: tokens.colors.neutral[700],
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  {webhook.active ? 'Disable' : 'Enable'}
                </Button>
              )}
              {onTest && (
                <Button
                  onClick={() => onTest(webhook.id)}
                  style={{
                    backgroundColor: tokens.colors.neutral[100],
                    color: tokens.colors.neutral[700],
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                    fontSize: tokens.typography.fontSize.xs,
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  Test
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={() => onDelete(webhook.id)}
                  style={{
                    backgroundColor: tokens.colors.errorScale[50],
                    color: tokens.colors.errorScale[700],
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    borderRadius: tokens.borderRadius.md,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
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

      {deliveryLogs.length > 0 && (
        <Box style={{ ...cardStyle, marginTop: tokens.spacing[6] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
            Delivery Logs
          </Text>

          <Box style={{ overflowX: 'auto' }}>
            <Box style={{ minWidth: '700px' }}>
              <Box style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: tokens.spacing[4], padding: tokens.spacing[2], backgroundColor: tokens.colors.neutral[50], borderRadius: tokens.borderRadius.sm, marginBottom: tokens.spacing[1] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Timestamp</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Event</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Status</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Code</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Duration</Text>
              </Box>

              {deliveryLogs.slice(0, 10).map((log) => (
                <Box key={log.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: tokens.spacing[4], padding: tokens.spacing[2], borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{log.timestamp}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{log.event}</Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: getStatusColor(log.status), fontWeight: tokens.typography.fontWeight.medium }}>
                    {log.status}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                    {log.responseCode || '-'}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>
                    {log.duration ? `${log.duration}ms` : '-'}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
});
