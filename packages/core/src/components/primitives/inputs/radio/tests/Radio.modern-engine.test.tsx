import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernRadio from '../engines/modern';

describe('Modern Radio public anatomy', () => {
  it('paints nothing inline and stamps the skin contract', () => {
    const { container } = render(
      <ModernRadio label="Pro plan" value="pro" size="lg" color="success" defaultChecked />,
    );

    const root = container.querySelector('.ds-radio--modern[data-part="root"]') as HTMLElement;
    const circle = container.querySelector('[data-part="circle"]') as HTMLElement;
    const dot = container.querySelector('[data-part="dot"]') as HTMLElement;
    const label = container.querySelector('[data-part="label"]') as HTMLElement;

    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-color', 'success');
    expect(root).toHaveAttribute('data-checked', 'true');
    for (const el of [root, circle, dot, label]) {
      expect(el.style.background).toBe('');
      expect(el.style.backgroundColor).toBe('');
      expect(el.style.border).toBe('');
      expect(el.style.color).toBe('');
    }
    expect(circle.style.width).toBe('');
  });

  it('renders description anatomy and honors label placement', () => {
    const { container } = render(
      <ModernRadio
        label="Annual billing"
        description="Two months included, renews every twelve months without interruption."
        labelPlacement="start"
        value="annual"
      />,
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-label-placement', 'start');
    expect(screen.getByText(/Two months/)).toHaveAttribute('data-part', 'description');
  });

  it('marks error and required on the control, not only on paint', () => {
    const { container } = render(<ModernRadio label="Plan" value="x" error required />);
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement;

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toBeRequired();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-error', 'true');
  });

  it('keeps long localized labels intact in an Arabic RTL context', () => {
    render(
      <div dir="rtl" lang="ar">
        <ModernRadio
          label="الفوترة السنوية مع تجديد تلقائي ونسخ احتياطي كامل للبيانات طوال مدة الاشتراك"
          value="annual"
          defaultChecked
        />
      </div>,
    );

    expect(screen.getByText(/الفوترة/)).toHaveAttribute('data-part', 'label');
  });

  it('selects uncontrolled state through the native input', () => {
    const handleChange = vi.fn();
    const { container } = render(<ModernRadio label="Pick" value="a" onChange={handleChange} />);
    const input = container.querySelector('input[type="radio"]') as HTMLInputElement;

    fireEvent.click(input);
    expect(handleChange).toHaveBeenCalledOnce();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-checked', 'true');
  });
});
