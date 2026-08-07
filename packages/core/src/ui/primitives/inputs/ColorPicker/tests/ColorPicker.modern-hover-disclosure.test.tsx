import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernColorPicker from '../engines/modern';

/**
 * `trigger='hover'` disclosure ownership.
 *
 * The dropdown panel is the trigger's SIBLING inside the component root, so a
 * trigger-scoped `mouseleave` fired the instant the pointer travelled from the
 * swatch toward the panel — the hex input, preset swatches and clear control
 * were unreachable by pointer. Hover disclosure therefore belongs to the root,
 * which is the only element that contains both the trigger and the panel.
 */
describe('ColorPicker modern hover disclosure', () => {
  const queryPanel = (container: HTMLElement) =>
    container.querySelector('[data-part="dropdown"]');

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
    const panel = queryPanel(container);
    expect(panel).not.toBeNull();

    // Pointer crosses the trigger's own boundary on its way to the panel: the
    // trigger is left, the shared root ancestor is not.
    fireEvent.mouseOut(trigger, { relatedTarget: panel });
    fireEvent.mouseOver(panel as Element, { relatedTarget: trigger });
    expect(queryPanel(container)).not.toBeNull();

    // Panel content is reachable and operable once the pointer arrives.
    const swatches = container.querySelectorAll('[data-part="preset-swatch"]');
    expect(swatches.length).toBe(2);
    fireEvent.click(swatches[0] as HTMLElement);
    expect(queryPanel(container)).not.toBeNull();
  });

  it('closes only when the pointer leaves the whole component', () => {
    const { container } = render(<ModernColorPicker trigger="hover" />);

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    fireEvent.mouseOver(root, { relatedTarget: document.body });
    expect(queryPanel(container)).not.toBeNull();

    fireEvent.mouseOut(root, { relatedTarget: document.body });
    expect(queryPanel(container)).toBeNull();
  });

  it('does not arm hover disclosure while disabled', () => {
    const { container } = render(<ModernColorPicker trigger="hover" disabled />);

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    fireEvent.mouseOver(root, { relatedTarget: document.body });
    expect(queryPanel(container)).toBeNull();
  });
});
