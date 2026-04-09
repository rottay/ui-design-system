/**
 * @fileoverview Type definitions for the MapView pattern. Defines the generic
 * MapMarker shape (lat/lng/label/icon/data) and MapViewProps controlling
 * center, zoom, marker rendering, popup, sidebar, and interaction callbacks.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Represents a single point of interest on the map.
 * The generic parameter `T` allows each marker to carry arbitrary
 * domain-specific payload data that is forwarded to render callbacks.
 *
 * @typeParam T - Shape of the custom data attached to this marker.
 */
export interface MapMarker<T = unknown> {
  /** Unique identifier for the marker */
  id: string;
  /** Geographic latitude in decimal degrees */
  lat: number;
  /** Geographic longitude in decimal degrees */
  lng: number;
  /** Optional text label displayed near the marker */
  label?: string;
  /** CSS color value for the default marker pin */
  color?: string;
  /** Custom icon element rendered instead of the default pin */
  icon?: ReactNode;
  /** Arbitrary domain data associated with this marker */
  data?: T;
}

/**
 * Props for the MapView pattern component.
 * Renders an interactive map with typed markers, optional popup/sidebar,
 * and customizable marker rendering.
 *
 * @typeParam T - Shape of the custom data attached to each marker.
 *
 * @example
 * ```tsx
 * <MapView<Venue>
 *   markers={venues.map(v => ({ id: v.id, lat: v.lat, lng: v.lng, data: v }))}
 *   center={{ lat: 40.7128, lng: -74.006 }}
 *   zoom={12}
 *   onMarkerClick={(m) => selectVenue(m.data)}
 *   renderPopup={(m) => <VenuePopup venue={m.data!} />}
 *   height={600}
 *   sidebar={<VenueList />}
 *   sidebarWidth={320}
 * />
 * ```
 */
export interface MapViewProps<T> extends PatternBaseProps {
  /** Array of markers to render on the map */
  markers: MapMarker<T>[];
  /** Initial or controlled center coordinates of the map viewport */
  center?: { lat: number; lng: number };
  /** Zoom level of the map (higher values zoom in closer) */
  zoom?: number;
  /** Called when a marker is clicked, receiving the full marker object */
  onMarkerClick?: (marker: MapMarker<T>) => void;
  /** Custom render function for each marker element on the map */
  renderMarker?: (marker: MapMarker<T>) => ReactNode;
  /** Custom render function for the popup shown when a marker is selected */
  renderPopup?: (marker: MapMarker<T>) => ReactNode;
  /** ID of the currently selected/highlighted marker */
  selectedMarkerId?: string;
  /** Toolbar content rendered above the map (e.g. search, layer toggles) */
  toolbar?: ReactNode;
  /** Height of the map container (CSS value or pixel number) */
  height?: number | string;
  /** Side panel content rendered adjacent to the map */
  sidebar?: ReactNode;
  /** Width of the sidebar panel (CSS value or pixel number) */
  sidebarWidth?: number | string;
}
