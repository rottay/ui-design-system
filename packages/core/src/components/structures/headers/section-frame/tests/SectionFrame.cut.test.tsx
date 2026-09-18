/**
 * SectionFrame, WO-FAM-10 sub-lot D.
 *
 * The family shipped with no test file at all, so this suite is both its first
 * accessibility evidence and the pin on what the cut changed: the anatomy the skin
 * now keys on, the document outline the numbered frame keeps, and the two readings
 * of the ordinal (inside the heading's name when there is a title, standing alone
 * when there is not) that the component decides between.
 */

import React from 'react';
import { describe, expect, it } from 'vitest';

import { SectionFrame } from '..';
import { renderWithEngine } from '@tests/support/engine';

function parts(container: HTMLElement): string[] {
  return [...container.querySelectorAll('[data-part]')]
    .map((node) => node.getAttribute('data-part') as string)
    .sort();
}

describe('SectionFrame (WO-FAM-10 cut)', () => {
  it('stamps every part the skin selects, and no BEM class it no longer selects', () => {
    const { container } = renderWithEngine(
      <SectionFrame index={1} title="Framing" meta="Numbered boundary">
        <span>Body</span>
      </SectionFrame>,
      'modern',
    );
    expect(parts(container)).toEqual(['body', 'dash', 'index', 'index-label', 'label-row', 'meta', 'root', 'title']);
    // The kit's scope class stays; the per-element names the skin dropped are gone.
    expect(container.querySelector('.rt-section-frame')).toBeTruthy();
    expect(container.innerHTML).not.toContain('rt-section-frame__');
  });

  it('keeps the section a real landmark and the title a real heading at the requested level', () => {
    const { container, getByRole } = renderWithEngine(
      <SectionFrame index={2} title="Sequence" headingLevel="h3" />,
      'modern',
    );
    expect(container.querySelector('section')).toBeTruthy();
    const heading = getByRole('heading', { level: 3 });
    // The ordinal joins the heading's own accessible name rather than announcing twice.
    expect(heading.textContent).toContain('02');
    expect(heading.textContent).toContain('Sequence');
  });

  it('hides the bracket chrome from assistive tech and leaves the announced ordinal alone', () => {
    const { container } = renderWithEngine(
      <SectionFrame index={3} title="Chrome" />,
      'modern',
    );
    const marker = container.querySelector("[data-part='index']") as HTMLElement;
    const dash = container.querySelector("[data-part='dash']") as HTMLElement;
    expect(marker.getAttribute('aria-hidden')).toBe('true');
    expect(dash.getAttribute('aria-hidden')).toBe('true');
    // The bracketed form is decoration; the announced ordinal carries no brackets.
    expect(marker.textContent).toBe('[03]');
    const announced = container.querySelector("[data-part='index-label']") as HTMLElement;
    expect(announced.getAttribute('aria-hidden')).toBeNull();
    expect(announced.textContent?.trim()).toBe('03');
  });

  it('gives an untitled section its ordinal as the only accessible carrier', () => {
    const { container } = renderWithEngine(<SectionFrame index={4} />, 'modern');
    expect(container.querySelector("[data-part='title']")).toBeNull();
    const announced = container.querySelector("[data-part='index-label']") as HTMLElement;
    expect(announced.textContent?.trim()).toBe('04');
    // Nothing announces it twice: the loose ordinal exists only without a heading.
    expect(container.querySelectorAll("[data-part='index-label']")).toHaveLength(1);
  });

  it('lets a consumer state the announced ordinal without touching the painted bracket', () => {
    const { container } = renderWithEngine(
      <SectionFrame index={5} indexLabel="Section five" />,
      'modern',
    );
    expect((container.querySelector("[data-part='index']") as HTMLElement).textContent).toBe('[05]');
    expect(
      (container.querySelector("[data-part='index-label']") as HTMLElement).textContent?.trim(),
    ).toBe('Section five');
  });

  it('paints nothing from the component: every visual value is the skin’s channel', () => {
    const { container } = renderWithEngine(
      <SectionFrame index={6} title="Paint" meta="None" />,
      'modern',
    );
    for (const node of container.querySelectorAll('[data-part]')) {
      expect({ part: node.getAttribute('data-part'), style: node.getAttribute('style') })
        .toEqual({ part: node.getAttribute('data-part'), style: null });
    }
  });
});
