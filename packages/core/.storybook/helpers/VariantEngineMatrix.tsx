'use client';

/**
 * @fileoverview VariantEngineMatrix - Storybook Helper
 * @description Component to display a matrix of component variants across all engines
 */

import React from 'react';
import { EngineProvider } from '../../src/runtime/engines';
import type { EngineName } from '../types/engine';
import { EngineLabel } from './EngineLabel';

export interface VariantEngineMatrixProps<P extends object> {
  /** The component to render */
  component: React.ComponentType<P>;
  /** Base props for all variants */
  baseProps?: Partial<P>;
  /** Prop name for variants (e.g., 'variant', 'type') */
  variantProp?: string;
  /** Array of variant values to display */
  variants?: string[];
  /** Prop name for sizes (e.g., 'size') */
  sizeProp?: string;
  /** Array of size values to display */
  sizes?: string[];
  /** Engines to display (default: all 3) */
  engines?: EngineName[];
  /** Show engine labels in header (default: true) */
  showEngineLabels?: boolean;
  /** Show variant labels in rows (default: true) */
  showVariantLabels?: boolean;
  /** Gap between cells */
  gap?: number;
}

const DEFAULT_ENGINES: EngineName[] = ['titan', 'hermes', 'apollo'];

export function VariantEngineMatrix<P extends object>({
  component: Component,
  baseProps = {} as Partial<P>,
  variantProp = 'variant',
  variants = [],
  sizeProp = 'size',
  sizes = [],
  engines = DEFAULT_ENGINES,
  showEngineLabels = true,
  showVariantLabels = true,
  gap = 16,
}: VariantEngineMatrixProps<P>) {
  const hasVariants = variants.length > 0;
  const hasSizes = sizes.length > 0;

  // If we have sizes, create a size × engine matrix
  // If we have variants, create a variant × engine matrix
  // If we have both, create a variant section with size rows

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${gap * 2}px`,
    width: '100%',
  };

  const headerRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `120px repeat(${engines.length}, 1fr)`,
    gap: `${gap}px`,
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '8px',
  };

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `120px repeat(${engines.length}, 1fr)`,
    gap: `${gap}px`,
    alignItems: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: '#4b5563',
    textTransform: 'capitalize',
  };

  const cellStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    backgroundColor: '#fafafa',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    minHeight: '50px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: '12px',
    textTransform: 'capitalize',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
  };

  // Render a single row for a variant/size combination
  const renderRow = (label: string, extraProps: Partial<P>) => (
    <div key={label} style={rowStyle}>
      {showVariantLabels && <span style={labelStyle}>{label}</span>}
      {engines.map((engine) => (
        <div key={engine} style={cellStyle}>
          <EngineProvider defaultEngine={engine}>
            <Component {...(baseProps as P)} {...(extraProps as P)} />
          </EngineProvider>
        </div>
      ))}
    </div>
  );

  // Case 1: Only variants, no sizes
  if (hasVariants && !hasSizes) {
    return (
      <div className="storybook-variant-engine-matrix" style={containerStyle}>
        {showEngineLabels && (
          <div style={headerRowStyle}>
            <span style={labelStyle}>Variant</span>
            {engines.map((engine) => (
              <div key={engine} style={{ textAlign: 'center' }}>
                <EngineLabel engine={engine} size="sm" />
              </div>
            ))}
          </div>
        )}
        {variants.map((variant) =>
          renderRow(variant, { [variantProp]: variant } as Partial<P>)
        )}
      </div>
    );
  }

  // Case 2: Only sizes, no variants
  if (hasSizes && !hasVariants) {
    return (
      <div className="storybook-variant-engine-matrix" style={containerStyle}>
        {showEngineLabels && (
          <div style={headerRowStyle}>
            <span style={labelStyle}>Size</span>
            {engines.map((engine) => (
              <div key={engine} style={{ textAlign: 'center' }}>
                <EngineLabel engine={engine} size="sm" />
              </div>
            ))}
          </div>
        )}
        {sizes.map((size) =>
          renderRow(size, { [sizeProp]: size } as Partial<P>)
        )}
      </div>
    );
  }

  // Case 3: Both variants and sizes - create sections
  if (hasVariants && hasSizes) {
    return (
      <div className="storybook-variant-engine-matrix" style={containerStyle}>
        {variants.map((variant) => (
          <div key={variant} style={{ marginBottom: '24px' }}>
            <div style={sectionTitleStyle}>
              Variant: {variant}
            </div>
            {showEngineLabels && (
              <div style={headerRowStyle}>
                <span style={labelStyle}>Size</span>
                {engines.map((engine) => (
                  <div key={engine} style={{ textAlign: 'center' }}>
                    <EngineLabel engine={engine} size="sm" />
                  </div>
                ))}
              </div>
            )}
            {sizes.map((size) =>
              renderRow(size, {
                [variantProp]: variant,
                [sizeProp]: size,
              } as Partial<P>)
            )}
          </div>
        ))}
      </div>
    );
  }

  // Case 4: No variants or sizes - just show engines side by side
  return (
    <div className="storybook-variant-engine-matrix" style={containerStyle}>
      {showEngineLabels && (
        <div style={{ ...headerRowStyle, gridTemplateColumns: `repeat(${engines.length}, 1fr)` }}>
          {engines.map((engine) => (
            <div key={engine} style={{ textAlign: 'center' }}>
              <EngineLabel engine={engine} size="sm" />
            </div>
          ))}
        </div>
      )}
      <div style={{ ...rowStyle, gridTemplateColumns: `repeat(${engines.length}, 1fr)` }}>
        {engines.map((engine) => (
          <div key={engine} style={cellStyle}>
            <EngineProvider defaultEngine={engine}>
              <Component {...(baseProps as P)} />
            </EngineProvider>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VariantEngineMatrix;
