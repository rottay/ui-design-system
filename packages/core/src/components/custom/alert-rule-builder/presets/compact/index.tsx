'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { AlertRuleBuilderProps } from '../../core';

export const CompactPreset = createPreset<AlertRuleBuilderProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button, Switch } = primitives;
  const { rules, onDelete, onToggle, className, style } = props;

  return (
    <Box className={className} style={style}>
      <Box style={{
        boxShadow: tokens.shadows.md, display: 'flex', flexDirection: 'column', gap: tokens.spacing[2] }}>
        {rules.map((rule) => (
          <Box
            key={rule.id}
            style={{
              padding: tokens.spacing[4],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.common.white,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box style={{ flex: 1 }}>
              <Text
                               style={{
                  fontWeight: tokens.typography.fontWeight.semibold,
                  marginBottom: tokens.spacing[1],
                }}
              >
                {rule.name}
              </Text>
              <Text
                               style={{ color: tokens.colors.neutral[600] }}
              >
                {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''} •{' '}
                {rule.actions.length} action{rule.actions.length !== 1 ? 's' : ''}
              </Text>
            </Box>

            <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
              <Switch
                checked={rule.enabled}
                onChange={() => onToggle?.(rule.id, !rule.enabled)}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(rule.id)}
                style={{ color: tokens.colors.errorScale[600] }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
});

CompactPreset.displayName = 'AlertRuleBuilderCompactPreset';
