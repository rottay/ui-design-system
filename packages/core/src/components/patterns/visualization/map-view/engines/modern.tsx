'use client';

/**
 * @fileoverview MapView -- Modern engine (DaisyUI / Tailwind).
 * Renders a placeholder map area with a marker list beneath it, styled
 * entirely with Tailwind utility classes and DaisyUI loading spinners.
 * The map placeholder is a static container ready to be replaced by
 * Leaflet, Mapbox GL, or any other map library.
 *
 * @example
 * <ModernMapView
 *   markers={[{ id: '1', lat: 40.7128, lng: -74.006, label: 'NYC' }]}
 *   height={400}
 *   onMarkerClick={(m) => console.log(m.id)}
 * />
 */

import React from 'react';
import type { MapViewProps, MapMarker } from '../MapView.types';

/**
 * Modern (DaisyUI/Tailwind) implementation of the MapView pattern.
 * Uses Tailwind utility classes for layout and DaisyUI's loading spinner.
 * Marker list items are rendered as divided rows with hover states.
 *
 * @param props - See {@link MapViewProps} for the full prop contract.
 * @returns The rendered map view with marker list.
 */
export default function ModernMapView<T>(props: MapViewProps<T>) {
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
    className = '',
    style,
    loading = false,
  } = props;

  return (
    /* Flex row layout: optional fixed-width sidebar + fluid main area */
    <div className={`flex gap-4 ${className}`} style={style}>
      {/* Sidebar is shrink-0 so it keeps its explicit pixel width */}
      {sidebar && (
        <div className="shrink-0" style={{ width: sidebarWidth }}>{sidebar}</div>
      )}
      <div className="flex-1">
        {toolbar}
        {/* Loading state replaces the entire map + list with a centered DaisyUI spinner */}
        {loading ? (
          <div className="flex justify-center items-center" style={{ height }}>
            <span style={{ display: 'inline-block', width: 32, height: 32, border: '3px solid var(--ds-color-border)', borderTopColor: 'var(--ds-color-primary)', borderRadius: '50%', animation: 'ds-spin var(--ds-motion-glacial) linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Placeholder map area */}
            {/* Placeholder map area -- displays center/zoom/marker metadata.
                 Replace this div's children with a real map library (Leaflet, Mapbox GL, etc.) */}
            <div
              className="rounded-lg flex items-center justify-center mb-4 border"
              style={{ height, background: 'color-mix(in srgb, var(--ds-color-info) 10%, transparent)', borderColor: 'var(--ds-color-border)' }}
            >
              <div className="text-center">
                <div className="text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>Map placeholder</div>
                <div className="text-xs mt-1" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  {center
                    ? `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
                    : 'No center set'}
                  {zoom != null ? ` | Zoom: ${zoom}` : ''}
                </div>
                <div className="text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                  {markers.length} marker{markers.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Marker list -- uses divide-y for row separators without manual border logic */}
            {markers.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--ds-color-text-secondary)' }}>No markers</div>
            ) : (
              <div className="divide-y rounded-lg overflow-hidden border" style={{ borderColor: 'var(--ds-color-border)', '--tw-divide-color': 'var(--ds-color-border)' } as React.CSSProperties}>
                {markers.map((marker) => {
                  /* Selected marker gets a primary tint background */
                  const isSelected = marker.id === selectedMarkerId;
                  return (
                    <div
                      key={marker.id}
                      onClick={() => onMarkerClick?.(marker)}
                      className="p-3 cursor-pointer"
                      style={isSelected ? { background: 'color-mix(in srgb, var(--ds-color-primary) 10%, transparent)' } : {}}
                    >
                      {/* Custom renderer takes priority; default shows icon, color dot, label, and coords */}
                      {renderMarker ? (
                        renderMarker(marker)
                      ) : (
                        <div className="flex items-center gap-2">
                          {marker.icon}
                          {/* Color indicator rendered as a small filled circle */}
                          {marker.color && (
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ background: marker.color }}
                            />
                          )}
                          <div>
                            {/* Label falls back to marker id when no label is provided */}
                            <div className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                              {marker.label ?? marker.id}
                            </div>
                            {/* Coordinates formatted to 4 decimal places (~11m precision) */}
                            <div className="text-xs" style={{ color: 'var(--ds-color-text-secondary)' }}>
                              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Popup content appears below marker details when this row is selected */}
                      {isSelected && renderPopup && (
                        <div className="mt-2 pl-5">{renderPopup(marker)}</div>
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
