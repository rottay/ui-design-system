import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernMentions from '../engines/modern';

// ---------------------------------------------------------------------------
// K4-D Pass 1 -- modern Mentions paint-ownership ratchet.
//
// The engine's static geometry (textarea inline-size/padding/font, the
// auto-size `resize: none`, the popup's absolute placement + z-index +
// dropdown token channels, the empty state's padding/centering, the root's
// `relative` anchor) moved out of inline styles and Tailwind utilities into
// `modern/skin/mentions.css`, keyed on data-part / data-placement /
// data-autosize. Placement offsets are LOGICAL (inset-block / margin-block).
// Inline is reserved for the public `style` channel; the auto-size height
// measurements stay JS-owned (they change per keystroke).
// ---------------------------------------------------------------------------

const SKIN = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/mentions.css'
  ),
  'utf8'
);

/** Comment-stripped copy -- negative pins must not match prose in the header. */
const SKIN_NC = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

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
    const dropdown = (await waitFor(() => {
      const el = container.querySelector('[data-part="dropdown"]');
      expect(el).not.toBeNull();
      return el;
    })) as HTMLElement;

    expect(dropdown.getAttribute('style')).toBeNull();
    expect(dropdown).toHaveAttribute('data-placement', 'top');

    const option = container.querySelector('[data-part="option"]') as HTMLElement;
    expect(option.getAttribute('style')).toBeNull();
  });

  it('stamps data-autosize and keeps only the JS-owned height write inline', () => {
    const { container } = render(<ModernMentions options={OPTIONS} autoSize={{ minRows: 2, maxRows: 4 }} />);
    const textarea = container.querySelector('[data-part="textarea"]') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('data-autosize', 'true');
    // The auto-size measurement is the single JS-owned inline channel.
    expect(textarea.style.height).not.toBe('');
    expect(textarea.style.resize).toBe('');
    expect(textarea.style.padding).toBe('');
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

  it('skin pins: root anchor, textarea channels, autosize resize', () => {
    expect(/\.ds-mentions\.ds-mentions--modern\[data-part='root'\]\s*\{[^}]*position:\s*relative/.test(SKIN)).toBe(true);
    expect(/\[data-part='textarea'\]\s*\{[^}]*inline-size:\s*100%/.test(SKIN)).toBe(true);
    expect(/\[data-part='textarea'\]\s*\{[^}]*var\(--ds-input-md-padding-y,\s*8px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='textarea'\]\s*\{[^}]*var\(--ds-input-md-font-size,\s*14px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='textarea'\]\[data-autosize='true'\]\s*\{[^}]*resize:\s*none/.test(SKIN)).toBe(true);
  });

  it('skin pins: dropdown placement is logical (inset-block/margin-block), token channels intact', () => {
    expect(/\[data-part='dropdown'\]\s*\{[^}]*position:\s*absolute/.test(SKIN)).toBe(true);
    expect(/\[data-part='dropdown'\]\s*\{[^}]*z-index:\s*50/.test(SKIN)).toBe(true);
    expect(/\[data-part='dropdown'\]\s*\{[^}]*max-block-size:\s*var\(--ds-dropdown-max-height,\s*192px\)/.test(SKIN)).toBe(true);
    expect(/\[data-part='dropdown'\]\s*\{[^}]*padding:\s*var\(--ds-dropdown-padding,\s*6px\)/.test(SKIN)).toBe(true);
    expect(/\[data-placement='top'\]\s*\{[^}]*inset-block-end:\s*100%/.test(SKIN)).toBe(true);
    expect(/\[data-placement='top'\]\s*\{[^}]*margin-block-end:\s*var\(--ds-spacing-1,\s*4px\)/.test(SKIN)).toBe(true);
    expect(/\[data-placement='bottom'\]\s*\{[^}]*inset-block-start:\s*100%/.test(SKIN)).toBe(true);
    expect(/\[data-placement='bottom'\]\s*\{[^}]*margin-block-start:\s*var\(--ds-spacing-1,\s*4px\)/.test(SKIN)).toBe(true);
  });

  it('skin pins: empty state owns padding + centering (former p-3 text-center utilities)', () => {
    // Empty and loading intentionally share one quiet-state block. Pin the
    // complete selector group so either state cannot silently lose geometry
    // while a loose declaration grep stays green.
    const quietStateBlock =
      /\[data-part='empty'\],\s*\.ds-mentions\.ds-mentions--modern\[data-part='root'\]\s+\[data-part='loading'\]\s*\{[^}]*\}/
        .exec(SKIN)?.[0] ?? '';
    expect(quietStateBlock).toContain('padding: var(--ds-spacing-3');
    expect(quietStateBlock).toContain('text-align: center');
  });

  it('skin pins: control surface reads the certified --ds-input-bg channel, never the generic bg-input (TMM near-black regression)', () => {
    // The TMM DB projection resolves --ds-input-bg to its light control
    // surface (#FFFEFB) while --ds-color-bg-input resolves near-black
    // (#0F0F12) -- the InputNumber/TagInput guard idiom.
    expect(/background:\s*var\(--ds-mentions-input-bg,\s*var\(--ds-input-bg,\s*var\(--ds-surface-control\)\)\)/.test(SKIN_NC)).toBe(true);
    expect(SKIN_NC).not.toContain('var(--ds-color-bg-input');
  });

  it('skin pins: default-status hover repaints the border on the Input grammar (premium hover regression)', () => {
    expect(
      /\[data-part='textarea'\]:not\(\[data-disabled='true'\]\):not\(\[data-status\]\):hover:not\(:focus\)\s*\{[^}]*border-color:\s*var\(--ds-mentions-border-hover,\s*var\(--ds-color-border-hover\)\)/.test(SKIN_NC)
    ).toBe(true);
    // Motion honoured with the standard reduced-motion guard.
    expect(/\[data-part='textarea'\]\s*\{[^}]*transition:/.test(SKIN_NC)).toBe(true);
    const hoverRm = SKIN_NC.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\n([\s\S]*?)\n\}/);
    expect(hoverRm).not.toBeNull();
    expect(/\[data-part='textarea'\]/.test(hoverRm![1])).toBe(true);
    expect(/transition-duration:\s*0\.01ms/.test(hoverRm![1])).toBe(true);
  });

  it('skin pins: focus shows the certified Input/Textarea indicator (premium focus regression)', () => {
    // Default-status focus border on the Input focus channel, gated so the
    // error/warning status borders stay sovereign and disabled opts out.
    expect(
      /\[data-part='textarea'\]:not\(\[data-disabled='true'\]\):not\(\[data-status\]\):focus\s*\{[^}]*border-color:\s*var\(--ds-mentions-border-focus,\s*var\(--ds-input-border-focus,\s*var\(--ds-color-primary\)\)\)/.test(SKIN_NC)
    ).toBe(true);
    // Halo ring on ANY focus (mouse or keyboard), with status-aware halos.
    expect(
      /\[data-part='textarea'\]:focus:not\(\[data-disabled='true'\]\)\s*\{[^}]*box-shadow:\s*var\(--ds-mentions-shadow-focus,\s*var\(--ds-input-shadow-focus,\s*var\(--ds-focus-ring\)\)\)/.test(SKIN_NC)
    ).toBe(true);
    expect(
      /\[data-part='textarea'\]:focus:not\(\[data-disabled='true'\]\)\[data-status='error'\]\s*\{[^}]*box-shadow:\s*var\(--ds-input-error-shadow-focus,/.test(SKIN_NC)
    ).toBe(true);
    expect(
      /\[data-part='textarea'\]:focus:not\(\[data-disabled='true'\]\)\[data-status='warning'\]\s*\{[^}]*box-shadow:\s*var\(--ds-input-warning-shadow-focus,/.test(SKIN_NC)
    ).toBe(true);
  });

  it('skin pins: placeholder reads the certified placeholder channel with an escape hatch', () => {
    expect(/\[data-part='textarea'\]::placeholder\s*\{[^}]*var\(--ds-mentions-placeholder-color,\s*var\(--ds-input-color-placeholder,\s*var\(--ds-color-text-muted\)\)\)/.test(SKIN_NC)).toBe(true);
    expect(/::placeholder\s*\{[^}]*opacity:\s*var\(--ds-input-placeholder-opacity,\s*1\)/.test(SKIN_NC)).toBe(true);
  });

  it('skin pins: disabled textarea reads the Input grammar disabled channels (Pass-2 review)', () => {
    expect(
      /\[data-part='textarea'\]\[data-disabled='true'\]\s*\{[^}]*color:\s*var\(--ds-color-text-disabled\)/.test(SKIN_NC)
    ).toBe(true);
    expect(
      /\[data-part='textarea'\]\[data-disabled='true'\]\s*\{[^}]*background:\s*var\(--ds-mentions-input-bg-disabled,\s*var\(--ds-input-bg-disabled,\s*#fafafa\)\)/.test(SKIN_NC)
    ).toBe(true);
    expect(
      /\[data-part='textarea'\]\[data-disabled='true'\]\s*\{[^}]*cursor:\s*not-allowed/.test(SKIN_NC)
    ).toBe(true);
    expect(
      /\[data-part='textarea'\]\[data-disabled='true'\]\s*\{[^}]*opacity:\s*var\(--ds-mentions-disabled-opacity,\s*var\(--ds-input-disabled-opacity,\s*0\.6\)\)/.test(SKIN_NC)
    ).toBe(true);
  });

  it('skin pins: option rows carry the dropdown-family grammar (Pass-2 craft)', () => {
    // Block full-width rows, wrapped unbroken words, start-aligned.
    expect(/\[data-part='option'\]\s*\{[^}]*display:\s*block/.test(SKIN_NC)).toBe(true);
    expect(/\[data-part='option'\]\s*\{[^}]*inline-size:\s*100%/.test(SKIN_NC)).toBe(true);
    expect(/\[data-part='option'\]\s*\{[^}]*overflow-wrap:\s*break-word/.test(SKIN_NC)).toBe(true);
    // Hover AND keyboard-active repaint as a primary tint over the dropdown surface.
    expect(
      /\[data-part='option'\]:not\(\[data-disabled='true'\]\):hover,\s*\n\.ds-mentions\.ds-mentions--modern\[data-part='root'\] \[data-part='option'\]\[data-active='true'\]\s*\{[^}]*background:\s*var\(--ds-mentions-option-bg-hover,\s*color-mix\(in srgb,\s*var\(--ds-color-primary\) 9%,\s*var\(--ds-surface-card\)\)\)/.test(SKIN_NC)
    ).toBe(true);
    // Disabled posture via channels.
    expect(/\[data-part='option'\]\[data-disabled='true'\]\s*\{[^}]*opacity:\s*var\(--ds-mentions-option-disabled-opacity,/.test(SKIN_NC)).toBe(true);
    // Reduced-motion guard covers the option rows too.
    const rm = SKIN_NC.match(/@media \(prefers-reduced-motion: reduce\)\s*\{\n([\s\S]*?)\n\}/);
    expect(rm).not.toBeNull();
    expect(/\[data-part='option'\]/.test(rm![1])).toBe(true);
  });
});
