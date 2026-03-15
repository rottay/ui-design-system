'use client';

/**
 * EmptyState - Classic Engine (Ant Design)
 */

import React from 'react';
import { Empty, Button, Space } from 'antd';
import type { EmptyStateProps } from '../EmptyState.types';

const sizeMap = {
  sm: { padding: 24, iconSize: 48, titleSize: 14, descSize: 12 },
  md: { padding: 48, iconSize: 64, titleSize: 18, descSize: 14 },
  lg: { padding: 64, iconSize: 96, titleSize: 24, descSize: 16 },
};

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

  const s = sizeMap[size];

  if (loading) {
    return (
      <div className={className} style={{ textAlign: 'center', padding: s.padding, ...style }}>
        <span style={{ color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`ds-pattern-empty-state ds-engine-classic ${className ?? ''}`} style={{ padding: s.padding, ...style }}>
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
            {description && (
              <div style={{ fontSize: s.descSize, color: 'var(--ds-color-text-secondary, var(--ds-color-text-muted))' }}>
                {description}
              </div>
            )}
          </div>
        }
      >
        {(action || secondaryAction) && (
          <Space>
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
