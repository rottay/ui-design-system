'use client';

/**
 * @fileoverview EngineComparison - Storybook Helper
 * @description Component to display a component in all 3 engines side-by-side
 */

import React from 'react';
import { EngineProvider } from '../system/providers';
import type { EngineName } from '../types/engine';
import { EngineLabel } from './EngineLabel';

export interface EngineComparisonProps<P extends object> {
  /** The component to render */
  component: React.ComponentType<P>;
  /** Props to pass to the component */
  props: P;
  /** Engines to display (default: all 3) */
  engines?: EngineName[];
  /** Show engine labels (default: true) */
  showLabels?: boolean;
  /** Show descriptions in labels (default: false) */
  showDescriptions?: boolean;
  /** Layout direction (default: 'horizontal') */
  direction?: 'horizontal' | 'vertical';
  /** Gap between panels */
  gap?: number;
  /** Custom panel styles */
  panelStyle?: React.CSSProperties;
}

const DEFAULT_ENGINES: EngineName[] = ['titan', 'hermes', 'apollo'];

export function EngineComparison<P extends object>({
  component: Component,
  props,
  engines = DEFAULT_ENGINES,
  showLabels = true,
  showDescriptions = false,
  direction = 'horizontal',
  gap = 24,
  panelStyle,
}: EngineComparisonProps<P>) {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: direction === 'horizontal' ? `repeat(${engines.length}, 1fr)` : '1fr',
    gap: `${gap}px`,
    width: '100%',
  };

  const panelBaseStyle: React.CSSProperties = {
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    ...panelStyle,
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '6px',
    minHeight: '60px',
  };

  return (
    <div className="storybook-engine-comparison" style={containerStyle}>
      {engines.map((engine) => (
        <div
          key={engine}
          className={`storybook-engine-panel storybook-engine-panel--${engine}`}
          style={panelBaseStyle}
        >
          {showLabels && (
            <div style={{ marginBottom: '4px' }}>
              <EngineLabel engine={engine} showDescription={showDescriptions} />
            </div>
          )}
          <div style={contentStyle}>
            <EngineProvider defaultEngine={engine}>
              <Component {...props} />
            </EngineProvider>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EngineComparison;
