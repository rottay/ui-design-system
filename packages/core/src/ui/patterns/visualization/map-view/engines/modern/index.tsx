'use client';

/**
 * @fileoverview MapView -- Modern engine (DS-token).
 *
 * ARCHITECTURE (documented, not changed): this pattern is an INTEGRATION
 * PLACEHOLDER -- there is no map provider (no Leaflet/Mapbox GL/Google
 * dependency, and none is added by this lane). The "map" region renders the
 * viewport metadata (center/zoom/marker count) a provider would consume;
 * the marker list below is the real interactive surface. When a provider
 * lands, the map region swaps its children for the library canvas (map
 * tiles are then DATA, like the marker color dot today).
 *
 * Composition law: the pattern composes the public Spinner primitive for the
 * loading state and Button for marker selection, and recreates nothing --
 * geometry and paint live in the
 * modern `pattern-map-view.css` skin (the old Tailwind utility chain and the
 * hand-rolled CSS spinner are retired). Own copy resolves through the
 * optional `components` i18n channel with an English floor pinned byte-
 * identical to the pre-i18n contract. Marker rows compose Button so selection
 * stays keyboard-operable (focus + Enter/Space) without a local control.
 *
 * @example
 * <ModernMapView
 *   markers={[{ id: '1', lat: 40.7128, lng: -74.006, label: 'NYC' }]}
 *   height={400}
 *   onMarkerClick={(m) => console.log(m.id)}
 * />
 */

import React from 'react';
import type { MapViewProps, MapMarker } from '../../contracts';
import ModernButton from '../../../../../primitives/inputs/Button/engines/modern';
import ModernSpinner from '../../../../../primitives/feedback/Spinner/engines/modern';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { interpolateTranslation } from '@/foundation/i18n/runtime/resolution/translation';

const ROOT_CLASS_NAME = 'ds-pattern-map-view ds-engine-modern';

/**
 * Modern (DS-token) implementation of the MapView integration placeholder.
 *
 * @param props - See {@link MapViewProps} for the full prop contract.
 * @returns The rendered map placeholder with its marker list.
 */
export default function ModernMapView<T>(props: MapViewProps<T>) {
  // Optional channel with an English floor: the view renders standalone
  // (no I18nProvider) without crashing, and never echoes a raw key.
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? interpolateTranslation(floor, params);

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

  const centerLabel = center
    ? tOr('map_view.center', 'Center: {lat}, {lng}', {
        lat: center.lat.toFixed(4),
        lng: center.lng.toFixed(4),
      })
    : tOr('map_view.no_center', 'No center set');
  const zoomLabel = zoom != null ? tOr('map_view.zoom', 'Zoom: {zoom}', { zoom }) : null;
  const countLabel =
    markers.length === 1
      ? tOr('map_view.marker_count_one', '{count} marker', { count: markers.length })
      : tOr('map_view.marker_count_other', '{count} markers', { count: markers.length });

  return (
    /* Row layout: optional fixed-width sidebar + fluid main area. Instance
       dimensions (sidebar width, map height) stay inline -- they are
       per-call consumer data, not paint. */
    <div
      data-part="root"
      data-loading={loading}
      data-empty={markers.length === 0}
      className={[ROOT_CLASS_NAME, className].filter(Boolean).join(' ')}
      style={style}
    >
      {sidebar && (
        <div data-part="sidebar" style={{ width: sidebarWidth }}>{sidebar}</div>
      )}
      <div data-part="content">
        {toolbar}
        {loading ? (
          <div data-part="loading" style={{ height }}>
            {/* Spinner primitive owns ring, cadence (ds-foundation-spin) and
                the status role -- the hand-rolled CSS spinner is retired. */}
            <ModernSpinner size="md" data-part="spinner" />
          </div>
        ) : (
          <>
            {/* Placeholder map area -- displays center/zoom/marker metadata.
                Replace this div's children with a real map library (Leaflet,
                Mapbox GL, etc.); tiles are then DATA. */}
            <div data-part="map-placeholder" style={{ height }}>
              <div data-part="placeholder-content">
                <div data-part="placeholder-label" data-detail="title">
                  {tOr('map_view.placeholder', 'Map placeholder')}
                </div>
                <div data-part="placeholder-label" data-detail="location">
                  {centerLabel}
                  {zoomLabel ? ` | ${zoomLabel}` : ''}
                </div>
                <div data-part="placeholder-label" data-detail="count">
                  {countLabel}
                </div>
              </div>
            </div>

            {/* Marker list -- the interactive surface until a provider lands. */}
            {markers.length === 0 ? (
              <div data-part="empty">{tOr('map_view.empty', 'No markers')}</div>
            ) : (
              <div data-part="marker-list">
                {markers.map((marker, i) => {
                  const isSelected = marker.id === selectedMarkerId;
                  return (
                    /* Public Button: keyboard selection (focus + Enter/Space)
                        and focus semantics come from the primitive. */
                    <ModernButton
                      variant="ghost"
                      size="sm"
                      data-part="marker-row"
                      data-selected={isSelected}
                      data-last={i === markers.length - 1}
                      key={marker.id}
                      onClick={() => onMarkerClick?.(marker)}
                    >
                      {/* Custom renderer takes priority; default shows icon,
                          color dot (consumer DATA, stays inline), label,
                          coords. */}
                      {renderMarker ? (
                        renderMarker(marker)
                      ) : (
                        <span data-part="marker-row-main">
                          {marker.icon}
                          {marker.color && (
                            <span
                              data-part="marker-color"
                              style={{ background: marker.color }}
                            />
                          )}
                          <span data-part="marker-text">
                            <span data-part="marker-label">
                              {marker.label ?? marker.id}
                            </span>
                            <span data-part="coordinates">
                              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                            </span>
                          </span>
                        </span>
                      )}
                      {/* Popup content expands below the selected row -- a
                          list-inline disclosure, not an overlay (Popover
                          does not apply; focus stays on the row). */}
                      {isSelected && renderPopup && (
                        <span data-part="popup">{renderPopup(marker)}</span>
                      )}
                    </ModernButton>
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
