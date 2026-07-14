'use client';

/**
 * @fileoverview MapView -- Rustic engine (Vanilla / CSS variables).
 * Renders a placeholder map area with a marker list using only inline
 * styles referencing --ds-* design tokens. No external CSS framework
 * dependency -- all visual properties flow from the tenant's CSS custom
 * properties, making this engine fully theme-portable.
 *
 * @example
 * <RusticMapView
 *   markers={[{ id: '1', lat: 40.7128, lng: -74.006, label: 'NYC' }]}
 *   height={400}
 *   onMarkerClick={(m) => console.log(m.id)}
 * />
 */

import React from 'react';
import type { MapViewProps, MapMarker } from '../MapView.types';

const ROOT_CLASS_NAME = 'ds-pattern-map-view ds-engine-rustic';

/**
 * Rustic (Vanilla CSS) implementation of the MapView pattern.
 * All styling is done via inline styles with --ds-* CSS variable fallbacks,
 * ensuring full tenant-theme compatibility without framework lock-in.
 *
 * @param props - See {@link MapViewProps} for the full prop contract.
 * @returns The rendered map view with marker list.
 */
export default function RusticMapView<T>(props: MapViewProps<T>) {
  const {
    markers,
    center,
    zoom,
    onMarkerClick,
    renderMarker,
    renderPopup,
    selectedMarkerId,
    toolbar,
    height = 500,
    sidebar,
    sidebarWidth = 300,
    className,
    style,
    loading = false,
  } = props;

  return (
    /* Flex row: optional fixed-width sidebar + fluid main content area */
    <div
      data-part="root"
      data-loading={loading}
      data-empty={markers.length === 0}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={{ display: 'flex', gap: 16, ...style }}
    >
      {sidebar && (
        <div data-part="sidebar" style={{ width: sidebarWidth, flexShrink: 0 }}>{sidebar}</div>
      )}
      <div data-part="content" style={{ flex: 1 }}>
        {toolbar}
        {/* Plain text loading indicator -- no framework spinner dependency */}
        {loading ? (
          <div data-part="loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Placeholder map area */}
            {/* Placeholder map region -- uses bg-info token for a subtle
                 informational tint that visually distinguishes it from the marker list */}
            <div
              data-part="map-placeholder"
              style={{
                height,
                borderRadius: 'var(--ds-radius-md, 8px)',
                background: 'var(--ds-color-bg-info, var(--ds-color-bg-secondary))',
                border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <div data-part="placeholder-content" style={{ textAlign: 'center' }}>
                <div data-part="placeholder-label" data-detail="title" style={{ fontSize: 14, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
                  Map placeholder
                </div>
                <div data-part="placeholder-label" data-detail="location" style={{ fontSize: 12, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))', marginTop: 4 }}>
                  {center
                    ? `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
                    : 'No center set'}
                  {zoom != null ? ` | Zoom: ${zoom}` : ''}
                </div>
                <div data-part="placeholder-label" data-detail="count" style={{ fontSize: 12, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
                  {markers.length} marker{markers.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Marker list */}
            {markers.length === 0 ? (
              <div data-part="empty" style={{ textAlign: 'center', padding: 24, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))', fontSize: 14 }}>
                No markers
              </div>
            ) : (
              /* Marker list container with token-based border and radius */
              <div
                data-part="marker-list"
                style={{
                  border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
                  borderRadius: 'var(--ds-radius-md, 8px)',
                  overflow: 'hidden',
                }}
              >
                {markers.map((marker, i) => {
                  /* Selected row uses primary-50 tint; non-selected use elevated surface */
                  const isSelected = marker.id === selectedMarkerId;
                  return (
                    <div
                      data-part="marker-row"
                      data-selected={isSelected}
                      data-last={i === markers.length - 1}
                      key={marker.id}
                      onClick={() => onMarkerClick?.(marker)}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        background: isSelected
                          ? 'var(--ds-color-primary-50, var(--ds-color-bg-muted))'
                          : 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
                        /* Only render bottom border between items, not after the last one */
                        borderBottom:
                          i < markers.length - 1
                            ? '1px solid var(--ds-color-border-primary, var(--ds-color-border))'
                            : undefined,
                      }}
                    >
                      {/* Custom renderMarker replaces the entire row content when provided */}
                      {renderMarker ? (
                        renderMarker(marker)
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {marker.icon}
                          {/* Color dot -- a small filled circle representing the marker's color */}
                          {marker.color && (
                            <span
                              data-part="marker-color"
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: marker.color,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div>
                            {/* Selected markers get bold weight for visual emphasis */}
                            <div data-part="marker-label" style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: 'var(--ds-color-text-primary, var(--ds-color-text))' }}>
                              {marker.label ?? marker.id}
                            </div>
                            {/* Coordinates at 4-decimal precision (~11m accuracy) */}
                            <div data-part="coordinates" style={{ fontSize: 11, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
                              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      )}
                      {isSelected && renderPopup && (
                        <div data-part="popup" style={{ marginTop: 8, paddingLeft: 20 }}>{renderPopup(marker)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
