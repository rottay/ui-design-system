import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernMapView from '../engines/modern';
import type { MapMarker } from '../contracts';

const markers: MapMarker[] = [
  { id: 'venue-1', lat: 40.7128, lng: -74.006, label: 'Main Hall' },
  { id: 'venue-2', lat: 40.7306, lng: -73.9352, label: 'Annex' },
];

describe('PatternMapView modern — popup disclosure is not nested in the row button', () => {
  it('renders the popup as a sibling of the marker row, never inside it', () => {
    const { container } = render(
      <ModernMapView
        markers={markers}
        selectedMarkerId="venue-1"
        renderPopup={(m) => <a href={`/venue/${m.id}`}>Open {m.label}</a>}
      />,
    );

    const popup = container.querySelector('[data-part="popup"]') as HTMLElement;
    expect(popup).not.toBeNull();

    // The popup must render as a sibling of the row button, not a
    // descendant — interactive popup content cannot sit inside a <button>.
    expect(popup.closest('button')).toBeNull();
    expect(popup.parentElement?.getAttribute('data-part')).toBe('marker-list');
  });

  it('keeps consumer-supplied interactive popup content out of any button', () => {
    const { container } = render(
      <ModernMapView
        markers={markers}
        selectedMarkerId="venue-1"
        renderPopup={() => (
          <div>
            <button type="button">Directions</button>
            <a href="/details">Details</a>
          </div>
        )}
      />,
    );

    const link = container.querySelector('a[href="/details"]') as HTMLElement;
    const nestedButton = container.querySelector(
      '[data-part="popup"] button',
    ) as HTMLElement;

    expect(link.closest('button')).toBeNull();
    expect(nestedButton.closest('[data-part="marker-row"]')).toBeNull();
  });

  it('does not re-toggle the marker when popup content is clicked', () => {
    const onMarkerClick = vi.fn();
    const { container } = render(
      <ModernMapView
        markers={markers}
        selectedMarkerId="venue-1"
        onMarkerClick={onMarkerClick}
        renderPopup={() => <button type="button">Directions</button>}
      />,
    );

    const directions = container.querySelector(
      '[data-part="popup"] button',
    ) as HTMLElement;
    fireEvent.click(directions);

    // A click inside the popup must not bubble to the enclosing marker-row
    // button and deselect the marker the popup belongs to.
    expect(onMarkerClick).not.toHaveBeenCalled();
  });

  it('points the row disclosure at the popup it controls', () => {
    const { container } = render(
      <ModernMapView
        markers={markers}
        selectedMarkerId="venue-1"
        renderPopup={() => <span>Venue detail</span>}
      />,
    );

    const rows = container.querySelectorAll('[data-part="marker-row"]');
    const selectedRow = rows[0] as HTMLElement;
    const unselectedRow = rows[1] as HTMLElement;
    const popup = container.querySelector('[data-part="popup"]') as HTMLElement;

    expect(selectedRow.getAttribute('aria-expanded')).toBe('true');
    expect(selectedRow.getAttribute('aria-controls')).toBe(popup.id);
    expect(popup.id).not.toBe('');

    // A collapsed row controls nothing: there is no popup element to name.
    expect(unselectedRow.getAttribute('aria-expanded')).toBe('false');
    expect(unselectedRow.getAttribute('aria-controls')).toBeNull();
  });
});
