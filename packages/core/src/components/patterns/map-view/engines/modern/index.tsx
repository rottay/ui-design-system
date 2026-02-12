'use client';

/**
 * MapView - Modern Engine (DaisyUI / Tailwind)
 *
 * Placeholder map container with marker list.
 * Designed to be extended with Leaflet/Mapbox by consumers.
 */

import React from 'react';
import type { MapViewProps, MapMarker } from '../../types';

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
    <div className={`flex gap-4 ${className}`} style={style}>
      {sidebar && (
        <div className="shrink-0" style={{ width: sidebarWidth }}>{sidebar}</div>
      )}
      <div className="flex-1">
        {toolbar}
        {loading ? (
          <div className="flex justify-center items-center" style={{ height }}>
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <>
            {/* Placeholder map area */}
            <div
              className="rounded-lg bg-info/10 flex items-center justify-center mb-4 border border-base-300"
              style={{ height }}
            >
              <div className="text-center">
                <div className="text-sm text-base-content/50">Map placeholder</div>
                <div className="text-xs text-base-content/40 mt-1">
                  {center
                    ? `Center: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`
                    : 'No center set'}
                  {zoom != null ? ` | Zoom: ${zoom}` : ''}
                </div>
                <div className="text-xs text-base-content/40">
                  {markers.length} marker{markers.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Marker list */}
            {markers.length === 0 ? (
              <div className="text-center py-8 text-base-content/50 text-sm">No markers</div>
            ) : (
              <div className="divide-y divide-base-300 border border-base-300 rounded-lg overflow-hidden">
                {markers.map((marker) => {
                  const isSelected = marker.id === selectedMarkerId;
                  return (
                    <div
                      key={marker.id}
                      onClick={() => onMarkerClick?.(marker)}
                      className={`p-3 cursor-pointer hover:bg-base-200/50 ${isSelected ? 'bg-primary/10' : ''}`}
                    >
                      {renderMarker ? (
                        renderMarker(marker)
                      ) : (
                        <div className="flex items-center gap-2">
                          {marker.icon}
                          {marker.color && (
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ background: marker.color }}
                            />
                          )}
                          <div>
                            <div className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                              {marker.label ?? marker.id}
                            </div>
                            <div className="text-xs text-base-content/50">
                              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      )}
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
