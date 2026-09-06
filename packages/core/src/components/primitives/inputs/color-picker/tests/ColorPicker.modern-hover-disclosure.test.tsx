import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernColorPicker from '../engines/modern';

/**
 * `trigger='hover'` disclosure ownership.
 *
 * A trigger-scoped `mouseleave` fired the instant the pointer travelled from
 * the swatch toward the panel — the hex input, preset swatches and clear
 * control were unreachable by pointer. The panel is now PORTALED (WO-CAN-05),
 * so no single DOM element contains both it and the trigger: `mouseover` /
 * `mouseout` bubble through the REACT tree (portaled children included) and
 * the close decision is a containment test against the field root AND the
 * panel. These tests assert that pair, not DOM ancestry.
 */
describe('ColorPicker modern hover disclosure', () => {
  // The panel leaves the render container for `#rottay-portal-root`.
  const queryPanel = () => document.querySelector('[data-part="dropdown"]');

  it('keeps the panel open while the pointer moves from the trigger into it', () => {
    const { container } = render(
      <ModernColorPicker
        trigger="hover"
        presets={[{ label: 'Brand', colors: ['#112233', '#445566'] }]}
      />
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
    expect(root).not.toBeNull();
    expect(trigger).not.toBeNull();

    fireEvent.mouseOver(root, { relatedTarget: document.body });
    const panel = queryPanel();
    expect(panel).not.toBeNull();
    // The honest new geometry the containment test has to survive.
    expect(container.contains(panel)).toBe(false);
    expect((panel as Element).closest('#rottay-portal-root')).not.toBeNull();

    // Pointer crosses the trigger's own boundary on its way to the panel: the
    // trigger is left, the shared root ancestor is not.
    fireEvent.mouseOut(trigger, { relatedTarget: panel });
    fireEvent.mouseOver(panel as Element, { relatedTarget: trigger });
    expect(queryPanel()).not.toBeNull();

    // Panel content is reachable and operable once the pointer arrives.
    const swatches = document.querySelectorAll('[data-part="preset-swatch"]');
    expect(swatches.length).toBe(2);
    fireEvent.click(swatches[0] as HTMLElement);
    expect(queryPanel()).not.toBeNull();
  });

  it('closes only when the pointer leaves the whole component', () => {
    const { container } = render(<ModernColorPicker trigger="hover" />);

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    fireEvent.mouseOver(root, { relatedTarget: document.body });
    expect(queryPanel()).not.toBeNull();

    fireEvent.mouseOut(root, { relatedTarget: document.body });
    expect(queryPanel()).toBeNull();
  });

  it('does not arm hover disclosure while disabled', () => {
    const { container } = render(<ModernColorPicker trigger="hover" disabled />);

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    fireEvent.mouseOver(root, { relatedTarget: document.body });
    expect(queryPanel()).toBeNull();
  });
});
