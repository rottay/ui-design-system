import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMapView from '../engines/modern';
import type { MapMarker } from '../contracts';

const markers: MapMarker[] = [
  { id: 'venue-1', lat: 40.7128, lng: -74.006, label: 'Main Hall' },
];

describe('PatternMapView modern — rescue drills', () => {
  it('bounds the pinned sidebar to its container', () => {
    const { container } = render(
      <ModernMapView markers={markers} sidebar={<div>Filters</div>} />,
    );
    const sidebar = container.querySelector('[data-part="sidebar"]') as HTMLElement;

    expect(sidebar.style.width).toBe('300px');
    // Before: the skin pins the sidebar (`flex-shrink: 0`) and the bare
    // default width overflowed every container narrower than 300px.
    expect(sidebar.style.maxWidth).toBe('100%');
  });

  it('honours an explicit sidebarWidth while keeping the bound', () => {
    const { container } = render(
      <ModernMapView markers={markers} sidebar={<div>Filters</div>} sidebarWidth={240} />,
    );
    const sidebar = container.querySelector('[data-part="sidebar"]') as HTMLElement;

    expect(sidebar.style.width).toBe('240px');
    expect(sidebar.style.maxWidth).toBe('100%');
  });
});
