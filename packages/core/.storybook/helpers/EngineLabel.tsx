'use client';

/**
 * @fileoverview EngineLabel - Storybook Helper
 * @description Badge component to display the active engine name with visual distinction
 */

import React from 'react';
import type { EngineName } from '../types/engine';

export interface EngineLabelProps {
  engine: EngineName;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

const ENGINE_CONFIG: Record<EngineName, { label: string; description: string; color: string; bg: string }> = {
  titan: {
    label: 'Titan',
    description: 'Ant Design',
    color: '#1677ff',
    bg: '#e6f4ff',
  },
  hermes: {
    label: 'Hermes',
    description: 'DaisyUI + Tailwind',
    color: '#7c3aed',
    bg: '#f3e8ff',
  },
  apollo: {
    label: 'Apollo',
    description: 'Vanilla CSS',
    color: '#059669',
    bg: '#d1fae5',
  },
  athena: {
    label: 'Athena',
    description: 'Custom Engine',
    color: '#dc2626',
    bg: '#fee2e2',
  },
};

const SIZE_STYLES = {
  sm: { padding: '2px 8px', fontSize: '11px', gap: '4px' },
  md: { padding: '4px 12px', fontSize: '12px', gap: '6px' },
  lg: { padding: '6px 16px', fontSize: '14px', gap: '8px' },
};

export const EngineLabel: React.FC<EngineLabelProps> = ({
  engine,
  size = 'md',
  showDescription = false,
}) => {
  const config = ENGINE_CONFIG[engine];
  const sizeStyle = SIZE_STYLES[size];

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizeStyle.gap,
    padding: sizeStyle.padding,
    backgroundColor: config.bg,
    color: config.color,
    borderRadius: '6px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: sizeStyle.fontSize,
    fontWeight: 600,
    border: `1px solid ${config.color}20`,
  };

  const dotStyle: React.CSSProperties = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: config.color,
  };

  const descriptionStyle: React.CSSProperties = {
    fontWeight: 400,
    opacity: 0.8,
  };

  return (
    <span style={containerStyle} className={`storybook-engine-label storybook-engine-label--${engine}`}>
      <span style={dotStyle} />
      <span>{config.label}</span>
      {showDescription && (
        <span style={descriptionStyle}>({config.description})</span>
      )}
    </span>
  );
};

export default EngineLabel;
