'use client';

/**
 * MapView - Rustic Engine (Pure inline styles with --ds-* CSS vars)
 *
 * Placeholder map container with marker list.
 * Designed to be extended with Leaflet/Mapbox by consumers.
 */

import React from 'react';
import type { MapViewProps, MapMarker } from '../MapView.types';

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
    <div className={className} style={{ display: 'flex', gap: 16, ...style }}>
      {sidebar && (
        <div style={{ width: sidebarWidth, flexShrink: 0 }}>{sidebar}</div>
      )}
      <div style={{ flex: 1 }}>
        {toolbar}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Placeholder map area */}
            <div
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
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
                  Map placeholder
                </div>
                <div style={{ fontSize: 12, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))', marginTop: 4 }}>
                  {center
                    ? `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
                    : 'No center set'}
                  {zoom != null ? ` | Zoom: ${zoom}` : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
                  {markers.length} marker{markers.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Marker list */}
            {markers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))', fontSize: 14 }}>
                No markers
              </div>
            ) : (
              <div
                style={{
                  border: '1px solid var(--ds-color-border-primary, var(--ds-color-border))',
                  borderRadius: 'var(--ds-radius-md, 8px)',
                  overflow: 'hidden',
                }}
              >
                {markers.map((marker, i) => {
                  const isSelected = marker.id === selectedMarkerId;
                  return (
                    <div
                      key={marker.id}
                      onClick={() => onMarkerClick?.(marker)}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        background: isSelected
                          ? 'var(--ds-color-primary-50, var(--ds-color-bg-muted))'
                          : 'var(--ds-color-bg-elevated, var(--ds-color-bg-primary))',
                        borderBottom:
                          i < markers.length - 1
                            ? '1px solid var(--ds-color-border-primary, var(--ds-color-border))'
                            : undefined,
                      }}
                    >
                      {renderMarker ? (
                        renderMarker(marker)
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {marker.icon}
                          {marker.color && (
                            <span
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
                            <div style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: 'var(--ds-color-text-primary, var(--ds-color-text))' }}>
                              {marker.label ?? marker.id}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--ds-color-text-tertiary, var(--ds-color-text-muted))' }}>
                              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      )}
                      {isSelected && renderPopup && (
                        <div style={{ marginTop: 8, paddingLeft: 20 }}>{renderPopup(marker)}</div>
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
