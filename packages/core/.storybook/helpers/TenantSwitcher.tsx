'use client';

/**
 * @fileoverview TenantSwitcher - Storybook Helper
 * @description Interactive tenant/theme switcher for live preview
 */

import React, { useState, useCallback } from 'react';
import { ThemeProvider } from '../../src/runtime/theming';
import { EngineProvider } from '../../src/runtime/engines';
import type { EngineName } from '../types/engine';
import type { TemplateName } from '../themes/types';

// ============================================================================
// TYPES
// ============================================================================

export interface TenantConfig {
  name: string;
  value: TemplateName;
  description?: string;
  color: string;
  icon?: string;
}

export interface TenantSwitcherProps<P extends object> {
  /** The component to render */
  component: React.ComponentType<P>;
  /** Props to pass to the component */
  props: P;
  /** Available tenants/themes */
  tenants?: TenantConfig[];
  /** Initial tenant */
  initialTenant?: TemplateName;
  /** Show engine selector alongside tenant */
  showEngineSelector?: boolean;
  /** Initial engine */
  initialEngine?: EngineName;
  /** Show preview in grid layout */
  gridPreview?: boolean;
  /** Custom title */
  title?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_TENANTS: TenantConfig[] = [
  { name: 'Base', value: 'base', color: '#6b7280', description: 'Default theme' },
  { name: 'Spotify', value: 'spotify', color: '#1db954', description: 'Music streaming' },
  { name: 'Stripe', value: 'stripe', color: '#635bff', description: 'Payments' },
  { name: 'Airbnb', value: 'airbnb', color: '#ff5a5f', description: 'Travel' },
  { name: 'Slack', value: 'slack', color: '#4a154b', description: 'Messaging' },
  { name: 'Notion', value: 'notion', color: '#000000', description: 'Productivity' },
  { name: 'Linear', value: 'linear', color: '#5e6ad2', description: 'Issue tracking' },
  { name: 'Vercel', value: 'vercel', color: '#000000', description: 'Deployment' },
];

const ENGINES: { name: string; value: EngineName; color: string }[] = [
  { name: 'Titan', value: 'titan', color: '#1677ff' },
  { name: 'Hermes', value: 'hermes', color: '#7c3aed' },
  { name: 'Apollo', value: 'apollo', color: '#059669' },
];

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: '100%',
  } as React.CSSProperties,

  header: {
    marginBottom: '20px',
  } as React.CSSProperties,

  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937',
    margin: '0 0 16px 0',
  } as React.CSSProperties,

  controls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,

  controlRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  } as React.CSSProperties,

  controlLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    minWidth: '60px',
    paddingTop: '8px',
  } as React.CSSProperties,

  tenantGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    flex: 1,
  } as React.CSSProperties,

  tenantButton: (active: boolean, color: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: `2px solid ${active ? color : '#e5e7eb'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? `${color}10` : '#ffffff',
    color: active ? color : '#4b5563',
    transition: 'all 0.15s ease',
    boxShadow: active ? `0 0 0 3px ${color}20` : 'none',
  }) as React.CSSProperties,

  tenantDot: (color: string) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: color,
  }) as React.CSSProperties,

  engineButton: (active: boolean, color: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    border: `2px solid ${active ? color : '#e5e7eb'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: active ? `${color}15` : '#ffffff',
    color: active ? color : '#4b5563',
    transition: 'all 0.15s ease',
  }) as React.CSSProperties,

  previewContainer: {
    marginTop: '24px',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  } as React.CSSProperties,

  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #f3f4f6',
  } as React.CSSProperties,

  previewLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6b7280',
  } as React.CSSProperties,

  previewBadge: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
    borderRadius: '6px',
    backgroundColor: `${color}15`,
    color: color,
  }) as React.CSSProperties,

  previewContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
    padding: '16px',
  } as React.CSSProperties,

  // Grid preview mode
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '24px',
  } as React.CSSProperties,

  gridCard: (active: boolean, color: string) => ({
    padding: '16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: `2px solid ${active ? color : '#e5e7eb'}`,
    boxShadow: active ? `0 4px 12px ${color}20` : '0 1px 3px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }) as React.CSSProperties,

  gridCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  } as React.CSSProperties,

  gridCardTitle: (color: string) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#1f2937',
  }) as React.CSSProperties,

  gridCardContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80px',
    padding: '12px',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
  } as React.CSSProperties,

  activeIndicator: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '4px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontWeight: 500,
  } as React.CSSProperties,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function TenantSwitcher<P extends object>({
  component: Component,
  props,
  tenants = DEFAULT_TENANTS,
  initialTenant = 'base',
  showEngineSelector = true,
  initialEngine = 'titan',
  gridPreview = false,
  title = 'Theme/Tenant Switcher',
}: TenantSwitcherProps<P>) {
  const [selectedTenant, setSelectedTenant] = useState<TemplateName>(initialTenant);
  const [selectedEngine, setSelectedEngine] = useState<EngineName>(initialEngine);

  const currentTenant = tenants.find((t) => t.value === selectedTenant) || tenants[0];
  const currentEngine = ENGINES.find((e) => e.value === selectedEngine) || ENGINES[0];

  // Render grid preview mode
  if (gridPreview) {
    return (
      <div style={styles.container} className="tenant-switcher">
        <h3 style={styles.title}>{title}</h3>

        {showEngineSelector && (
          <div style={styles.controlRow}>
            <span style={styles.controlLabel}>Engine</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {ENGINES.map((engine) => (
                <button
                  key={engine.value}
                  style={styles.engineButton(selectedEngine === engine.value, engine.color)}
                  onClick={() => setSelectedEngine(engine.value)}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: engine.color,
                    }}
                  />
                  {engine.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.gridContainer}>
          {tenants.map((tenant) => (
            <div
              key={tenant.value}
              style={styles.gridCard(selectedTenant === tenant.value, tenant.color)}
              onClick={() => setSelectedTenant(tenant.value)}
            >
              <div style={styles.gridCardHeader}>
                <span style={styles.gridCardTitle(tenant.color)}>
                  <span style={styles.tenantDot(tenant.color)} />
                  {tenant.name}
                </span>
                {selectedTenant === tenant.value && (
                  <span style={styles.activeIndicator}>Active</span>
                )}
              </div>
              <div style={styles.gridCardContent}>
                <EngineProvider defaultEngine={selectedEngine}>
                  <ThemeProvider defaultTemplate={tenant.value}>
                    <Component {...props} />
                  </ThemeProvider>
                </EngineProvider>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard mode
  return (
    <div style={styles.container} className="tenant-switcher">
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>

        <div style={styles.controls}>
          {/* Tenant selector */}
          <div style={styles.controlRow}>
            <span style={styles.controlLabel}>Theme</span>
            <div style={styles.tenantGrid}>
              {tenants.map((tenant) => (
                <button
                  key={tenant.value}
                  style={styles.tenantButton(selectedTenant === tenant.value, tenant.color)}
                  onClick={() => setSelectedTenant(tenant.value)}
                  title={tenant.description}
                >
                  <span style={styles.tenantDot(tenant.color)} />
                  {tenant.name}
                </button>
              ))}
            </div>
          </div>

          {/* Engine selector */}
          {showEngineSelector && (
            <div style={styles.controlRow}>
              <span style={styles.controlLabel}>Engine</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {ENGINES.map((engine) => (
                  <button
                    key={engine.value}
                    style={styles.engineButton(selectedEngine === engine.value, engine.color)}
                    onClick={() => setSelectedEngine(engine.value)}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: engine.color,
                      }}
                    />
                    {engine.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div style={styles.previewContainer}>
        <div style={styles.previewHeader}>
          <span style={styles.previewLabel}>
            Preview:
            <span style={styles.previewBadge(currentTenant.color)}>
              <span style={styles.tenantDot(currentTenant.color)} />
              {currentTenant.name}
            </span>
            {showEngineSelector && (
              <span style={styles.previewBadge(currentEngine.color)}>
                {currentEngine.name}
              </span>
            )}
          </span>
        </div>
        <div style={styles.previewContent}>
          <EngineProvider defaultEngine={selectedEngine}>
            <ThemeProvider defaultTemplate={selectedTenant}>
              <Component {...props} />
            </ThemeProvider>
          </EngineProvider>
        </div>
      </div>
    </div>
  );
}

export default TenantSwitcher;
