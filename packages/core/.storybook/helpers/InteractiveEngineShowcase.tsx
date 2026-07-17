'use client';

/**
 * @fileoverview InteractiveEngineShowcase - Advanced Storybook Helper
 * @description Interactive component to compare engines with live controls
 */

import React, { useState, useCallback } from 'react';
import { EngineProvider } from '../../src/infrastructure/runtime/engines';
import type { EngineName } from '../types/engine';
import { EngineLabel } from './EngineLabel';

// ============================================================================
// TYPES
// ============================================================================

export type LayoutMode = 'horizontal' | 'vertical' | 'cards' | 'tabs' | 'slider';
export type ZoomLevel = 0.5 | 0.75 | 1 | 1.25 | 1.5;

export interface InteractiveEngineShowcaseProps<P extends object> {
  /** The component to render */
  component: React.ComponentType<P>;
  /** Props to pass to the component */
  props: P;
  /** Available engines (default: all 3) */
  engines?: EngineName[];
  /** Initial layout mode */
  initialLayout?: LayoutMode;
  /** Initial zoom level */
  initialZoom?: ZoomLevel;
  /** Show layout controls */
  showLayoutControls?: boolean;
  /** Show zoom controls */
  showZoomControls?: boolean;
  /** Show engine selector */
  showEngineSelector?: boolean;
  /** Allow selecting single engine (tabs mode) */
  allowSingleEngine?: boolean;
  /** Title for the showcase */
  title?: string;
  /** Description text */
  description?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ENGINES: EngineName[] = ['titan', 'hermes', 'apollo'];

const ZOOM_LEVELS: ZoomLevel[] = [0.5, 0.75, 1, 1.25, 1.5];

const LAYOUT_ICONS: Record<LayoutMode, string> = {
  horizontal: '⬌',
  vertical: '⬍',
  cards: '▦',
  tabs: '⊞',
  slider: '◧',
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    width: '100%',
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  } as React.CSSProperties,

  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  } as React.CSSProperties,

  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1f2937',
    margin: 0,
  } as React.CSSProperties,

  description: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  } as React.CSSProperties,

  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  } as React.CSSProperties,

  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
  } as React.CSSProperties,

  controlButton: (active: boolean) => ({
    padding: '6px 10px',
    fontSize: '12px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: active ? '#ffffff' : 'transparent',
    color: active ? '#1f2937' : '#6b7280',
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  }) as React.CSSProperties,

  zoomLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    padding: '0 4px',
  } as React.CSSProperties,

  // Layout-specific container styles
  horizontalContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  } as React.CSSProperties,

  verticalContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  } as React.CSSProperties,

  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  } as React.CSSProperties,

  // Panel styles
  panel: (isHovered: boolean, layoutMode: LayoutMode) => ({
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: layoutMode === 'cards' ? '12px' : '8px',
    border: `1px solid ${isHovered ? '#d1d5db' : '#e5e7eb'}`,
    boxShadow: isHovered
      ? '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)'
      : '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  }) as React.CSSProperties,

  panelHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#fafafa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,

  panelContent: (zoom: ZoomLevel) => ({
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80px',
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
  }) as React.CSSProperties,

  // Tab styles
  tabsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  } as React.CSSProperties,

  tabList: {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '0',
  } as React.CSSProperties,

  tab: (active: boolean) => ({
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 500,
    border: 'none',
    borderBottom: `2px solid ${active ? '#3b82f6' : 'transparent'}`,
    marginBottom: '-2px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: active ? '#3b82f6' : '#6b7280',
    transition: 'all 0.15s ease',
  }) as React.CSSProperties,

  tabPanel: {
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '0 0 8px 8px',
    border: '1px solid #e5e7eb',
    borderTop: 'none',
  } as React.CSSProperties,

  // Slider styles
  sliderContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  } as React.CSSProperties,

  sliderTrack: {
    display: 'flex',
    transition: 'transform 0.3s ease',
  } as React.CSSProperties,

  sliderSlide: {
    flex: '0 0 100%',
    padding: '24px',
    backgroundColor: '#ffffff',
  } as React.CSSProperties,

  sliderNav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #e5e7eb',
  } as React.CSSProperties,

  sliderDot: (active: boolean) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? '#3b82f6' : '#d1d5db',
    transition: 'all 0.15s ease',
  }) as React.CSSProperties,

  engineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,

  expandButton: {
    padding: '4px 8px',
    fontSize: '11px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    color: '#6b7280',
  } as React.CSSProperties,
};

// ============================================================================
// COMPONENT
// ============================================================================

export function InteractiveEngineShowcase<P extends object>({
  component: Component,
  props,
  engines = DEFAULT_ENGINES,
  initialLayout = 'horizontal',
  initialZoom = 1,
  showLayoutControls = true,
  showZoomControls = true,
  showEngineSelector = true,
  allowSingleEngine = true,
  title,
  description,
}: InteractiveEngineShowcaseProps<P>) {
  const [layout, setLayout] = useState<LayoutMode>(initialLayout);
  const [zoom, setZoom] = useState<ZoomLevel>(initialZoom);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  const handleLayoutChange = useCallback((newLayout: LayoutMode) => {
    setLayout(newLayout);
    setActiveTab(0);
    setSliderIndex(0);
  }, []);

  // Render individual engine panel
  const renderPanel = (engine: EngineName, index: number) => {
    const isHovered = hoveredPanel === engine;
    const isExpanded = expandedPanel === engine;

    if (isExpanded) {
      return (
        <div
          key={engine}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '40px',
          }}
          onClick={() => setExpandedPanel(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.panelHeader}>
              <EngineLabel engine={engine} showDescription />
              <button
                style={styles.expandButton}
                onClick={() => setExpandedPanel(null)}
              >
                Close
              </button>
            </div>
            <div style={{ padding: '32px' }}>
              <EngineProvider defaultEngine={engine}>
                <Component {...props} />
              </EngineProvider>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        key={engine}
        style={styles.panel(isHovered, layout)}
        onMouseEnter={() => setHoveredPanel(engine)}
        onMouseLeave={() => setHoveredPanel(null)}
      >
        <div style={styles.panelHeader}>
          <div style={styles.engineBadge}>
            <EngineLabel engine={engine} size="sm" />
          </div>
          <button
            style={styles.expandButton}
            onClick={() => setExpandedPanel(engine)}
          >
            Expand
          </button>
        </div>
        <div style={styles.panelContent(zoom)}>
          <EngineProvider defaultEngine={engine}>
            <Component {...props} />
          </EngineProvider>
        </div>
      </div>
    );
  };

  // Render based on layout mode
  const renderContent = () => {
    switch (layout) {
      case 'horizontal':
        return (
          <div style={styles.horizontalContainer}>
            {engines.map((engine, i) => renderPanel(engine, i))}
          </div>
        );

      case 'vertical':
        return (
          <div style={styles.verticalContainer}>
            {engines.map((engine, i) => renderPanel(engine, i))}
          </div>
        );

      case 'cards':
        return (
          <div style={styles.cardsContainer}>
            {engines.map((engine, i) => renderPanel(engine, i))}
          </div>
        );

      case 'tabs':
        return (
          <div style={styles.tabsContainer}>
            <div style={styles.tabList}>
              {engines.map((engine, i) => (
                <button
                  key={engine}
                  style={styles.tab(activeTab === i)}
                  onClick={() => setActiveTab(i)}
                >
                  <EngineLabel engine={engine} size="sm" />
                </button>
              ))}
            </div>
            <div style={styles.tabPanel}>
              <div style={styles.panelContent(zoom)}>
                <EngineProvider defaultEngine={engines[activeTab]}>
                  <Component {...props} />
                </EngineProvider>
              </div>
            </div>
          </div>
        );

      case 'slider':
        return (
          <div style={styles.sliderContainer}>
            <div
              style={{
                ...styles.sliderTrack,
                transform: `translateX(-${sliderIndex * 100}%)`,
              }}
            >
              {engines.map((engine) => (
                <div key={engine} style={styles.sliderSlide}>
                  <div style={{ marginBottom: '12px' }}>
                    <EngineLabel engine={engine} showDescription />
                  </div>
                  <div style={styles.panelContent(zoom)}>
                    <EngineProvider defaultEngine={engine}>
                      <Component {...props} />
                    </EngineProvider>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.sliderNav}>
              {engines.map((engine, i) => (
                <button
                  key={engine}
                  style={styles.sliderDot(sliderIndex === i)}
                  onClick={() => setSliderIndex(i)}
                  aria-label={`Go to ${engine}`}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container} className="interactive-engine-showcase">
      {/* Header with controls */}
      <div style={styles.header}>
        {(title || description) && (
          <div style={styles.titleSection}>
            {title && <h3 style={styles.title}>{title}</h3>}
            {description && <p style={styles.description}>{description}</p>}
          </div>
        )}

        <div style={styles.controls}>
          {/* Layout controls */}
          {showLayoutControls && (
            <div style={styles.controlGroup}>
              {(['horizontal', 'vertical', 'cards', 'tabs', 'slider'] as LayoutMode[]).map(
                (mode) => (
                  <button
                    key={mode}
                    style={styles.controlButton(layout === mode)}
                    onClick={() => handleLayoutChange(mode)}
                    title={`${mode} layout`}
                  >
                    {LAYOUT_ICONS[mode]}
                  </button>
                )
              )}
            </div>
          )}

          {/* Zoom controls */}
          {showZoomControls && (
            <div style={styles.controlGroup}>
              <span style={styles.zoomLabel}>Zoom</span>
              {ZOOM_LEVELS.map((level) => (
                <button
                  key={level}
                  style={styles.controlButton(zoom === level)}
                  onClick={() => setZoom(level)}
                >
                  {Math.round(level * 100)}%
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content area */}
      {renderContent()}

      {/* Expanded panel overlay */}
      {expandedPanel && renderPanel(expandedPanel, -1)}
    </div>
  );
}

export default InteractiveEngineShowcase;
