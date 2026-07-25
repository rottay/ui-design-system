import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernCheckbox from '../engines/modern';

const here = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/checkbox.css'),
  'utf8',
);

describe('Modern Checkbox public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(
      <ModernCheckbox label="Agree to terms" size="lg" color="success" radius="md" defaultChecked />,
    );

    const root = container.querySelector('.ds-checkbox--modern[data-part="root"]') as HTMLElement;
    const box = container.querySelector('[data-part="box"]') as HTMLElement;
    const label = container.querySelector('[data-part="label"]') as HTMLElement;

    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-color', 'success');
    expect(root).toHaveAttribute('data-radius', 'md');
    expect(root).toHaveAttribute('data-checked', 'true');
    expect(root).toHaveAttribute('data-active', 'true');
    for (const el of [root, box, label]) {
      expect(el.style.background).toBe('');
      expect(el.style.border).toBe('');
      expect(el.style.color).toBe('');
    }
    expect(box.style.width).toBe('');
  });

  it('exposes indeterminate semantics on the native input', () => {
    const { container } = render(<ModernCheckbox label="Select all" indeterminate />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(input.indeterminate).toBe(true);
    expect(input).toHaveAttribute('aria-checked', 'mixed');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-indeterminate', 'true');
  });

  it('renders description anatomy and label placement without inline paint', () => {
    const { container } = render(
      <ModernCheckbox
        label="Share profile"
        description="Recruiters with an active mandate can view this candidate."
        labelPlacement="start"
      />,
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-label-placement', 'start');
    expect(root.style.flexDirection).toBe('');
    expect(screen.getByText(/active mandate/)).toHaveAttribute('data-part', 'description');
  });

  it('marks error and required on the control, not only on paint', () => {
    const { container } = render(<ModernCheckbox label="Consent" error required />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-error', 'true');
  });

  it('keeps label, box, and long copy intact in an Arabic RTL context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernCheckbox
          label="أوافق على مشاركة ملفي الشخصي مع جهات التوظيف المعتمدة لفترات طويلة جداً دون اقتطاع"
          defaultChecked
        />
      </div>,
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
    expect(screen.getByText(/أوافق/)).toHaveAttribute('data-part', 'label');
  });

  it('toggles uncontrolled state through the native input', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernCheckbox label="Toggle me" onChange={handleChange} />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
  });

  it('guards the label column against per-character collapse in narrow flex parents', () => {
    // Regression pin for the sighted Toggle-class defect: the text column must
    // carry an intrinsic minimum inline size, and no text part may opt into
    // break-anywhere wrapping (which makes min-content a single character).
    const textColumn = SKIN.match(/\[data-part='text'\]\s*\{([^}]*)\}/);
    expect(textColumn?.[1]).toContain('min-inline-size: min-content');

    for (const part of ['label', 'description']) {
      const rule = SKIN.match(new RegExp(`\\[data-part='${part}'\\][^{]*\\{([^}]*)\\}`));
      expect(rule?.[1] ?? '', `${part} must not wrap per character`).not.toContain('overflow-wrap: anywhere');
    }
  });
});
