import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMentions from '../engines/modern';

// The textarea and the portaled panel carry anatomy and kernel geometry only; paint
// is the skin's, proven in a real browser by Mentions.causality.integration.test.tsx.

const OPTIONS = [
  { value: 'alice', label: 'Alice' },
  { value: 'archer', label: 'Archer' },
];

function typeMention(textarea: HTMLElement, value: string) {
  Object.defineProperty(textarea, 'selectionStart', {
    configurable: true,
    writable: true,
    value: value.length,
  });
  fireEvent.change(textarea, { target: { value } });
}

describe('Mentions modern -- geometry lives in the skin, hooks in the DOM', () => {
  it('textarea and open dropdown carry no inline geometry, only data hooks', async () => {
    const { container } = render(<ModernMentions options={OPTIONS} placement="top" />);

    const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
    // No autoSize: the JS height writer stays silent, so no style attribute at all.
    expect(textarea.getAttribute('style')).toBeNull();
    expect(textarea).not.toHaveAttribute('data-autosize');

    typeMention(textarea, '@a');
    // The panel is PORTALED (WO-CAN-05): it renders through the overlay
    // kernel into `#rottay-portal-root`, so it is a sibling of the render
    // container rather than a descendant of the field.
    const dropdown = (await waitFor(() => {
      const el = document.querySelector('[data-part="dropdown"]');
      expect(el).not.toBeNull();
      return el;
    })) as HTMLElement;

    expect(container.contains(dropdown)).toBe(false);
    expect(dropdown.closest('#rottay-portal-root')).not.toBeNull();
    expect(dropdown.closest('[data-portal-scope="true"]')).not.toBeNull();
    // The panel's ONLY inline declarations are the ones the kernel owns:
    // fixed placement coordinates, the measured anchor width and the band.
    // No paint reaches the style attribute -- that is the geometry law this
    // test has always enforced, now stated against the portaled shape.
    expect(new Set(Array.from(dropdown.style)).size).toBeGreaterThan(0);
    for (const property of Array.from(dropdown.style)) {
      expect(
        ['position', 'top', 'left', 'visibility', 'inline-size', 'z-index'],
        `${property} is not a kernel-owned geometry key`,
      ).toContain(property);
    }
    expect(dropdown).toHaveAttribute('data-placement', 'top');

    const option = document.querySelector('[data-part="option"]') as HTMLElement;
    expect(option.getAttribute('style')).toBeNull();
  });

  it('stamps data-autosize and publishes the measurement as runtime channels only', () => {
    const { container } = render(<ModernMentions options={OPTIONS} autoSize={{ minRows: 2, maxRows: 4 }} />);
    const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('data-autosize', 'true');
    expect(textarea.style.getPropertyValue('--ds-mentions-autosize-height')).not.toBe('');
    expect(textarea.style.getPropertyValue('--ds-mentions-autosize-overflow')).not.toBe('');
    for (const property of Array.from(textarea.style)) {
      expect(property.startsWith('--ds-mentions-'), property).toBe(true);
    }
  });

  it('empty state renders hooks only, with the documented English fallback (no provider)', async () => {
    const { container } = render(<ModernMentions options={OPTIONS} />);
    const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
    typeMention(textarea, '@zzz');

    const empty = (await screen.findByText('No results')) as HTMLElement;
    expect(empty).toHaveAttribute('data-part', 'empty');
    expect(empty.className).toBe('');
    expect(empty.getAttribute('style')).toBeNull();
  });

  it('textarea ARIA stays inside the textbox role (axe aria-allowed-attr/critical regression)', () => {
    const { container } = render(<ModernMentions options={OPTIONS} />);
    const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('role', 'textbox');
    expect(textarea).toHaveAttribute('aria-multiline', 'true');
    expect(textarea).toHaveAttribute('aria-haspopup', 'listbox');
    // The textbox role does not support aria-expanded (aria-query ground
    // truth); it must never be emitted, closed or open.
    expect(textarea).not.toHaveAttribute('aria-expanded');
    typeMention(textarea, '@a');
    expect(textarea).not.toHaveAttribute('aria-expanded');
  });

  it('textarea accessible name: aria-label prop wins, placeholder is the floor, i18n default last (axe label/critical regression)', () => {
    const { container, rerender } = render(<ModernMentions options={OPTIONS} aria-label="Team mentions" />);
    expect(container.querySelector('[data-part="textarea"]')).toHaveAttribute('aria-label', 'Team mentions');

    rerender(<ModernMentions options={OPTIONS} placeholder="Type @ to mention" />);
    expect(container.querySelector('[data-part="textarea"]')).toHaveAttribute('aria-label', 'Type @ to mention');

    rerender(<ModernMentions options={OPTIONS} />);
    expect(container.querySelector('[data-part="textarea"]')).toHaveAttribute('aria-label', 'Mentions');
  });
});
