// @vitest-environment jsdom

/**
 * Carousel modern landmark-law axe proof (W8 remediation).
 *
 * Codex blocked this family: every modern Carousel rendered `role="region"`
 * + `aria-roledescription="carousel"` with NO accessible name, so the four
 * gallery cells on one page were indistinguishable landmarks (axe
 * landmark-unique, MODERATE x4).
 *
 * The remediated contract (mirror of the ScrollArea K3-C law), proven here
 * with axe-core:
 *
 *  - UNNAMED instances emit NO `role="region"` and NO `aria-roledescription`
 *    (a roledescription is invalid on a generic), so any number of them
 *    coexist without a landmark-unique violation — an unnamed carousel is
 *    not a landmark.
 *  - A consumer-supplied meaningful name (`aria-label`/`aria-labelledby`)
 *    promotes the root to a named `region` landmark with the carousel
 *    roledescription.
 *
 * The first test is a non-vacuity guard: it proves axe's landmark-unique
 * rule actually evaluates in this environment by showing that two carousels
 * with the SAME name (the pre-fix shape, had the old blanket role been
 * named) DO trip it.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';

import ModernCarousel from '../engines/modern';

const SLIDES = [
  <div key="1">Slide one</div>,
  <div key="2">Slide two</div>,
  <div key="3">Slide three</div>,
];

async function landmarkViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'rule', values: ['landmark-unique'] },
  });
  return results.violations;
}

describe('Carousel modern axe landmark-unique (W8)', () => {
  it('non-vacuity guard: two carousels with the SAME name trip landmark-unique', async () => {
    const { container } = render(
      <>
        <ModernCarousel aria-label="Featured">{SLIDES}</ModernCarousel>
        <ModernCarousel aria-label="Featured">{SLIDES}</ModernCarousel>
      </>
    );
    const violations = await landmarkViolations(container);
    expect(violations.map((v) => v.id)).toContain('landmark-unique');
  });

  it('multiple unnamed instances produce NO landmark-unique violation (no landmarks at all)', async () => {
    const { container } = render(
      <>
        <ModernCarousel>{SLIDES}</ModernCarousel>
        <ModernCarousel vertical>{SLIDES}</ModernCarousel>
        <ModernCarousel fade>{SLIDES}</ModernCarousel>
        <ModernCarousel dots={false}>{SLIDES}</ModernCarousel>
      </>
    );
    // None of the unnamed instances is a landmark, and the roledescription
    // is dropped with the role (invalid on a generic element).
    const roots = container.querySelectorAll('[data-part="root"]');
    expect(roots).toHaveLength(4);
    for (const root of roots) {
      expect(root.getAttribute('role')).toBeNull();
      expect(root.getAttribute('aria-roledescription')).toBeNull();
    }
    expect(container.querySelectorAll('[role="region"]')).toHaveLength(0);
    expect(await landmarkViolations(container)).toHaveLength(0);
  });

  it('named instances keep role=region + carousel roledescription and stay landmark-unique clean', async () => {
    const { container } = render(
      <>
        <ModernCarousel aria-label="Featured products">{SLIDES}</ModernCarousel>
        <ModernCarousel aria-label="Customer stories">{SLIDES}</ModernCarousel>
      </>
    );
    const first = screen.getByLabelText('Featured products');
    const second = screen.getByLabelText('Customer stories');
    expect(first.getAttribute('role')).toBe('region');
    expect(first.getAttribute('aria-roledescription')).toBe('carousel');
    expect(second.getAttribute('role')).toBe('region');
    expect(await landmarkViolations(container)).toHaveLength(0);
  });

  it('aria-labelledby also promotes the root to a named landmark', async () => {
    const { container } = render(
      <>
        <h2 id="gallery-title">Release highlights</h2>
        <ModernCarousel aria-labelledby="gallery-title">{SLIDES}</ModernCarousel>
      </>
    );
    const root = screen.getByLabelText('Release highlights');
    expect(root.getAttribute('role')).toBe('region');
    expect(root.getAttribute('aria-roledescription')).toBe('carousel');
    expect(root.getAttribute('aria-labelledby')).toBe('gallery-title');
    expect(await landmarkViolations(container)).toHaveLength(0);
  });

  it('a whitespace-only name does NOT promote the root (blank names are dropped)', async () => {
    const { container } = render(<ModernCarousel aria-label="   ">{SLIDES}</ModernCarousel>);
    const root = container.querySelector('[data-part="root"]')!;
    expect(root.getAttribute('role')).toBeNull();
    expect(root.getAttribute('aria-label')).toBeNull();
  });
});
