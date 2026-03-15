'use client';

/**
 * @fileoverview ComponentPlayground - Ultimate Storybook Helper
 * @description Full-featured interactive playground for testing components
 * with engine switching, tenant switching, and multiple layout options
 */

import React, { useState, useCallback } from 'react';
import { ThemeProvider } from '../../src/theming';
import { EngineProvider } from '../../src/engines';
import type { EngineName } from '../types/engine';
import type { TemplateName } from '../themes/types';

// ============================================================================
// TYPES
// ============================================================================

export type ViewMode = 'single' | 'compare-engines' | 'compare-tenants' | 'matrix';

export interface ComponentPlaygroundProps<P extends object> {
  /** The component to render */
  component: React.ComponentType<P>;
  /** Props to pass to the component */
  props: P;
  /** Component name for display */
  componentName?: string;
  /** Initial view mode */
  initialView?: ViewMode;
  /** Show all controls */
  showControls?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ENGINES: { name: string; value: EngineName; color: string; tech: string }[] = [
  { name: 'Titan', value: 'titan', color: '#1677ff', tech: 'Ant Design' },
  { name: 'Hermes', value: 'hermes', color: '#7c3aed', tech: 'Tailwind CSS' },
  { name: 'Apollo', value: 'apollo', color: '#059669', tech: 'Vanilla CSS' },
];

const TENANTS: { name: string; value: TemplateName; color: string }[] = [
  { name: 'Base', value: 'base', color: '#6b7280' },
  { name: 'Spotify', value: 'spotify', color: '#1db954' },
  { name: 'Stripe', value: 'stripe', color: '#635bff' },
  { name: 'Airbnb', value: 'airbnb', color: '#ff5a5f' },
  { name: 'Slack', value: 'slack', color: '#4a154b' },
  { name: 'Notion', value: 'notion', color: '#000000' },
  { name: 'Linear', value: 'linear', color: '#5e6ad2' },
  { name: 'Vercel', value: 'vercel', color: '#000000' },
];

const VIEW_MODES: { label: string; value: ViewMode; icon: string }[] = [
  { label: 'Single', value: 'single', icon: '◻' },
  { label: 'Engines', value: 'compare-engines', icon: '⊟' },
  { label: 'Tenants', value: 'compare-tenants', icon: '⊞' },
  { label: 'Matrix', value: 'matrix', icon: '▦' },
];

// ============================================================================
// STYLES
// ============================================================================

const s = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  titleArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,

  title: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  } as React.CSSProperties,

  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  } as React.CSSProperties,

  viewModes: {
    display: 'flex',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '4px',
    gap: '2px',
    border: '1px solid #e5e7eb',
  } as React.CSSProperties,

  viewModeBtn: (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? '#3b82f6' : 'transparent',
    color: active ? '#ffffff' : '#6b7280',
    transition: 'all 0.15s ease',
  }) as React.CSSProperties,

  controlsBar: {
    display: 'flex',
    gap: '24px',
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  controlSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,

  controlLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  } as React.CSSProperties,

  controlButtons: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  selectBtn: (active: boolean, color: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 500,
    border: `1.5px solid ${active ? color : '#e5e7eb'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: active ? `${color}12` : '#ffffff',
    color: active ? color : '#6b7280',
    transition: 'all 0.12s ease',
  }) as React.CSSProperties,

  dot: (color: string) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  }) as React.CSSProperties,

  // Preview area
  previewArea: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  } as React.CSSProperties,

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#fafafa',
  } as React.CSSProperties,

  previewBadges: {
    display: 'flex',
    gap: '8px',
  } as React.CSSProperties,

  badge: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '6px',
    backgroundColor: `${color}15`,
    color: color,
  }) as React.CSSProperties,

  previewContent: {
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '120px',
  } as React.CSSProperties,

  // Grid layouts
  enginesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  } as React.CSSProperties,

  tenantsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  } as React.CSSProperties,

  matrixGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  } as React.CSSProperties,

  card: (highlight: boolean, color: string) => ({
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: `1.5px solid ${highlight ? color : '#e5e7eb'}`,
    overflow: 'hidden',
    transition: 'all 0.15s ease',
    boxShadow: highlight ? `0 4px 12px ${color}15` : '0 1px 3px rgba(0,0,0,0.04)',
  }) as React.CSSProperties,

  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#fafafa',
  } as React.CSSProperties,

  cardTitle: (color: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#374151',
  }) as React.CSSProperties,

  cardContent: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80px',
  } as React.CSSProperties,

  // Matrix specific
  matrixSection: {
    marginBottom: '24px',
  } as React.CSSProperties,

  matrixSectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ComponentPlayground<P extends object>({
  component: Component,
  props,
  componentName = 'Component',
  initialView = 'single',
  showControls = true,
}: ComponentPlaygroundProps<P>) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [selectedEngine, setSelectedEngine] = useState<EngineName>('titan');
  const [selectedTenant, setSelectedTenant] = useState<TemplateName>('base');

  const currentEngine = ENGINES.find((e) => e.value === selectedEngine)!;
  const currentTenant = TENANTS.find((t) => t.value === selectedTenant)!;

  // Render a single component with provider
  const renderComponent = (engine: EngineName, tenant: TemplateName) => (
    <EngineProvider defaultEngine={engine}>
      <ThemeProvider defaultTemplate={tenant}>
        <Component {...props} />
      </ThemeProvider>
    </EngineProvider>
  );

  // Single view
  const renderSingleView = () => (
    <div style={s.previewArea}>
      <div style={s.previewHeader}>
        <div style={s.previewBadges}>
          <span style={s.badge(currentEngine.color)}>
            <span style={s.dot(currentEngine.color)} />
            {currentEngine.name}
          </span>
          <span style={s.badge(currentTenant.color)}>
            <span style={s.dot(currentTenant.color)} />
            {currentTenant.name}
          </span>
        </div>
      </div>
      <div style={s.previewContent}>
        {renderComponent(selectedEngine, selectedTenant)}
      </div>
    </div>
  );

  // Compare engines view
  const renderEnginesView = () => (
    <div style={s.enginesGrid}>
      {ENGINES.map((engine) => (
        <div
          key={engine.value}
          style={s.card(selectedEngine === engine.value, engine.color)}
        >
          <div style={s.cardHeader}>
            <span style={s.cardTitle(engine.color)}>
              <span style={s.dot(engine.color)} />
              {engine.name}
            </span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>{engine.tech}</span>
          </div>
          <div style={s.cardContent}>
            {renderComponent(engine.value, selectedTenant)}
          </div>
        </div>
      ))}
    </div>
  );

  // Compare tenants view
  const renderTenantsView = () => (
    <div style={s.tenantsGrid}>
      {TENANTS.map((tenant) => (
        <div
          key={tenant.value}
          style={s.card(selectedTenant === tenant.value, tenant.color)}
        >
          <div style={s.cardHeader}>
            <span style={s.cardTitle(tenant.color)}>
              <span style={s.dot(tenant.color)} />
              {tenant.name}
            </span>
          </div>
          <div style={s.cardContent}>
            {renderComponent(selectedEngine, tenant.value)}
          </div>
        </div>
      ))}
    </div>
  );

  // Matrix view (engines x tenants)
  const renderMatrixView = () => (
    <div>
      {TENANTS.slice(0, 4).map((tenant) => (
        <div key={tenant.value} style={s.matrixSection}>
          <div style={s.matrixSectionTitle}>
            <span style={s.dot(tenant.color)} />
            {tenant.name} Theme
          </div>
          <div style={s.matrixGrid}>
            {ENGINES.map((engine) => (
              <div key={engine.value} style={s.card(false, '#e5e7eb')}>
                <div style={s.cardHeader}>
                  <span style={s.cardTitle(engine.color)}>
                    <span style={s.dot(engine.color)} />
                    {engine.name}
                  </span>
                </div>
                <div style={s.cardContent}>
                  {renderComponent(engine.value, tenant.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={s.container} className="component-playground">
      {/* Header */}
      <div style={s.header}>
        <div style={s.titleArea}>
          <h3 style={s.title}>{componentName} Playground</h3>
          <p style={s.subtitle}>Interactive testing across engines and themes</p>
        </div>

        <div style={s.viewModes}>
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.value}
              style={s.viewModeBtn(viewMode === mode.value)}
              onClick={() => setViewMode(mode.value)}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar - only show for single/compare modes */}
      {showControls && (viewMode === 'single' || viewMode === 'compare-tenants') && (
        <div style={s.controlsBar}>
          <div style={s.controlSection}>
            <span style={s.controlLabel}>Engine</span>
            <div style={s.controlButtons}>
              {ENGINES.map((engine) => (
                <button
                  key={engine.value}
                  style={s.selectBtn(selectedEngine === engine.value, engine.color)}
                  onClick={() => setSelectedEngine(engine.value)}
                >
                  <span style={s.dot(engine.color)} />
                  {engine.name}
                </button>
              ))}
            </div>
          </div>

          {viewMode === 'single' && (
            <div style={s.controlSection}>
              <span style={s.controlLabel}>Theme</span>
              <div style={s.controlButtons}>
                {TENANTS.map((tenant) => (
                  <button
                    key={tenant.value}
                    style={s.selectBtn(selectedTenant === tenant.value, tenant.color)}
                    onClick={() => setSelectedTenant(tenant.value)}
                  >
                    <span style={s.dot(tenant.color)} />
                    {tenant.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showControls && viewMode === 'compare-engines' && (
        <div style={s.controlsBar}>
          <div style={s.controlSection}>
            <span style={s.controlLabel}>Theme (applied to all engines)</span>
            <div style={s.controlButtons}>
              {TENANTS.map((tenant) => (
                <button
                  key={tenant.value}
                  style={s.selectBtn(selectedTenant === tenant.value, tenant.color)}
                  onClick={() => setSelectedTenant(tenant.value)}
                >
                  <span style={s.dot(tenant.color)} />
                  {tenant.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'single' && renderSingleView()}
      {viewMode === 'compare-engines' && renderEnginesView()}
      {viewMode === 'compare-tenants' && renderTenantsView()}
      {viewMode === 'matrix' && renderMatrixView()}
    </div>
  );
}

export default ComponentPlayground;
