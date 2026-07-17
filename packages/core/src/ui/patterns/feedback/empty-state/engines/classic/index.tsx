'use client';

/**
 * @fileoverview EmptyState -- Classic engine (Ant Design).
 * Centered empty-state placeholder with icon/image, title, description,
 * and up to two action buttons. Built on Ant Design's Empty component
 * with custom description rendering for richer typography control.
 * Supports three size presets (sm/md/lg) that scale padding and fonts.
 *
 * @example
 * <ClassicEmptyState
 *   title="No results found"
 *   description="Try adjusting your search filters."
 *   action={{ label: 'Reset Filters', onClick: reset, variant: 'primary' }}
 *   size="md"
 * />
 */

import React from 'react';
import { Empty, Button, Space } from 'antd';
import type { EmptyStateProps } from '../../contracts';

/** Size presets controlling padding, icon height, and font sizes */
const sizeMap = {
  sm: { padding: 24, iconSize: 48, titleSize: 14, descSize: 12 },
  md: { padding: 48, iconSize: 64, titleSize: 18, descSize: 14 },
  lg: { padding: 64, iconSize: 96, titleSize: 24, descSize: 16 },
};

/**
 * Classic (Ant Design) implementation of the EmptyState pattern.
 * Wraps Ant's Empty component with custom title/description rendering
 * and optional primary/secondary action buttons.
 *
 * @param props - See {@link EmptyStateProps} for the full prop contract.
 * @returns The rendered empty state.
 */
export default function ClassicEmptyState(props: EmptyStateProps) {
  const {
    icon,
    title,
    description,
    action,
    secondaryAction,
    image,
    size = 'md',
    loading,
    className,
    style,
  } = props;

  /* Resolve the size preset once -- avoids repeated lookups during render */
  const s = sizeMap[size];

  /* Short-circuit to a minimal loading placeholder before building the full layout */
  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: s.padding, ...style }}>
        {/* Uses double-fallback color tokens for broader tenant-theme compatibility */}
        <span style={{ color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`ds-pattern-empty-state ds-engine-classic ${className ?? ''}`} style={{ padding: s.padding, ...style }}>
      {/* Ant Empty accepts custom image and description slots; we override both for full control */}
      <Empty
        image={image ? <img src={image} alt={title} style={{ height: s.iconSize }} /> : icon ? <div style={{ fontSize: s.iconSize, lineHeight: 1 }}>{icon}</div> : undefined}
        styles={{ image: { height: s.iconSize } }}
        description={
          <div>
            <div
              style={{
                fontSize: s.titleSize,
                fontWeight: 600,
                marginBottom: 8,
                color: 'var(--ds-color-text, var(--ds-color-text-primary))',
              }}
            >
              {title}
            </div>
            {/* Description is optional -- when omitted, the title stands alone */}
            {description && (
              <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))' }}>
                {description}
              </div>
            )}
          </div>
        }
      >
        {/* Action buttons placed inside Empty's children slot (below description) */}
        {(action || secondaryAction) && (
          <Space>
            {/* Primary variant maps to Ant's "primary" type; everything else gets "default" */}
            {action && (
              <Button
                type={action.variant === 'primary' ? 'primary' : 'default'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </Space>
        )}
      </Empty>
    </div>
  );
}
