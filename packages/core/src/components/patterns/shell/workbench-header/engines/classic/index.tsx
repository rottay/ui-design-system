'use client';

/**
 * @fileoverview Classic engine for the WorkbenchHeader pattern.
 * Renders a role-home header card with briefing title, exception count badge,
 * saved view selector, and quick action buttons using DS primitives.
 */

import React from 'react';
import { Box, Flex } from '../../../../../primitives/layout';
import { Text, Badge } from '../../../../../primitives/display';
import { Button, Select } from '../../../../../primitives/inputs';
import type { WorkbenchHeaderProps } from '../../contracts';

/**
 * Classic engine WorkbenchHeader.
 * Renders a card with title row, exception badge, saved view selector,
 * and quick action buttons.
 */
export default function ClassicWorkbenchHeader(props: WorkbenchHeaderProps) {
  const {
    title,
    subtitle,
    exceptionCount,
    quickActions,
    savedViews,
    activeViewId,
    onViewChange,
    loading,
    className,
    style,
  } = props;

  if (loading) {
    return (
      <Box
        className={className}
        style={{
          padding: '24px',
          background: 'var(--ds-color-bg-primary)',
          borderRadius: 12,
          border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
          ...style,
        }}
      >
        <Flex direction="column" gap={12}>
          <Box
            style={{
              width: 200,
              height: 24,
              borderRadius: 4,
              background: 'var(--ds-color-bg-secondary)',
              animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
            }}
          />
          <Box
            style={{
              width: 300,
              height: 16,
              borderRadius: 4,
              background: 'var(--ds-color-bg-secondary)',
              animation: 'ds-foundation-pulse 1.5s ease-in-out infinite',
            }}
          />
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      className={`ds-pattern-workbench-header ds-engine-classic ${className ?? ''}`}
      style={{
        padding: '24px',
        background: 'var(--ds-color-bg-primary)',
        borderRadius: 12,
        border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
        ...style,
      }}
    >
      {/* Title row with exception badge */}
      <Flex justify="between" align="start" style={{ marginBottom: subtitle ? 4 : 16 }}>
        <Flex align="center" gap={12}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ds-color-text-primary)',
              lineHeight: 1.3,
            }}
          >
            {title}
          </Text>
          {exceptionCount != null && exceptionCount > 0 && (
            <Badge
              count={exceptionCount}
              style={{
                backgroundColor: 'var(--ds-color-error)',
              }}
            />
          )}
        </Flex>

        {/* Saved views selector */}
        {savedViews && savedViews.length > 0 && onViewChange && (
          <Select
            value={activeViewId}
            onChange={(val) => onViewChange(val as string)}
            options={savedViews.map((v) => ({ label: v.label, value: v.id }))}
            placeholder="Select view"
            style={{ minWidth: 180 }}
            size="sm"
          />
        )}

      </Flex>

      {/* Subtitle */}
      {subtitle && (
        <Text
          style={{
            fontSize: 14,
            color: 'var(--ds-color-text-muted)',
            marginBottom: 16,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </Text>
      )}

      {/* Quick actions row */}
      {quickActions && quickActions.length > 0 && (
        <Flex gap={8} style={{ flexWrap: 'wrap' }}>
          {quickActions.map((action, idx) => (
            <Button
              key={`qa-${idx}`}
              onClick={action.onClick}
              disabled={action.disabled}
              variant={action.variant === 'danger' ? 'danger' : action.variant === 'primary' ? 'primary' : 'default'}
              size="sm"
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </Flex>
      )}
    </Box>
  );
}
