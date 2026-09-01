import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ClassicMapView from '../engines/classic';
import ModernMapView from '../engines/modern';
import RusticMapView from '../engines/rustic';
import type { MapMarker, MapViewProps } from '../contracts';

type Venue = {
  city: string;
};

const markers: MapMarker<Venue>[] = [
  { id: 'venue-1', lat: 40.7128, lng: -74.006, label: 'Main Hall', color: '#ff4d4f', data: { city: 'NYC' } },
  { id: 'venue-2', lat: 34.0522, lng: -118.2437, label: 'West Stage', data: { city: 'LA' } },
];

const ENGINE_COMPONENTS = [
  ['classic', ClassicMapView<Venue>],
  ['modern', ModernMapView<Venue>],
  ['rustic', RusticMapView<Venue>],
] as const;

function buildProps(overrides: Partial<MapViewProps<Venue>> = {}): MapViewProps<Venue> {
  return {
    markers,
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 10,
    toolbar: <div>Map controls</div>,
    sidebar: <div>Sidebar filters</div>,
    selectedMarkerId: 'venue-1',
    onMarkerClick: vi.fn(),
    renderPopup: (marker) => <div>Popup for {marker.label}</div>,
    ...overrides,
  };
}

describe('PatternMapView advanced engine coverage', () => {
  it.each(ENGINE_COMPONENTS)(
    'covers loading and empty-state branches in the %s engine',
    (_engine, Component) => {
      const { rerender } = render(
        <Component {...buildProps({ markers: [], loading: true, center: undefined, zoom: undefined })} />
      );

      expect(screen.getByText('Sidebar filters')).toBeInTheDocument();
      expect(screen.getByText('Map controls')).toBeInTheDocument();

      rerender(
        <Component
          {...buildProps({
            markers: [],
            loading: false,
            center: undefined,
            zoom: undefined,
          })}
        />
      );

      expect(screen.getByText(/no center set/i)).toBeInTheDocument();
      expect(screen.getByText(/no markers/i)).toBeInTheDocument();
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'covers marker rendering, popup rendering, and click branches in the %s engine',
    (_engine, Component) => {
      const onMarkerClick = vi.fn();

      render(
        <Component
          {...buildProps({
            onMarkerClick,
            renderMarker: (marker) => <div>Marker card {marker.label}</div>,
          })}
        />
      );

      expect(screen.getByText(/center: 40\.7128, -74\.0060/i)).toBeInTheDocument();
      expect(screen.getByText(/2 markers/i)).toBeInTheDocument();
      expect(screen.getByText('Marker card Main Hall')).toBeInTheDocument();
      expect(screen.getByText('Marker card West Stage')).toBeInTheDocument();
      expect(screen.getByText('Popup for Main Hall')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Marker card West Stage'));
      expect(onMarkerClick).toHaveBeenCalledWith(markers[1]);
    }
  );
});
