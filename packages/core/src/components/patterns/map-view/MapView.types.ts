import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface MapMarker<T = unknown> {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  icon?: ReactNode;
  data?: T;
}

export interface MapViewProps<T> extends PatternBaseProps {
  markers: MapMarker<T>[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMarkerClick?: (marker: MapMarker<T>) => void;
  renderMarker?: (marker: MapMarker<T>) => ReactNode;
  renderPopup?: (marker: MapMarker<T>) => ReactNode;
  selectedMarkerId?: string;
  toolbar?: ReactNode;
  height?: number | string;
  sidebar?: ReactNode;
  sidebarWidth?: number | string;
}
