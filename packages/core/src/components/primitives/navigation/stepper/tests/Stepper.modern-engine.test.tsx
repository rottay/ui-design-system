import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernStepper from '../engines/modern';


const items = [
  { title: 'Draft', description: 'Write content' },
  { title: 'Review', description: 'Check details', subTitle: 'Optional' },
  { title: 'Publish', description: 'Go live', disabled: true, status: 'error' as const },
];

/**
 * Real-engine contract for modern Stepper (K3-B Pass 1): Daisy classes are
 * drained, the skin is the single paint owner of EVERY part including the
 * circle/connector pseudo-elements, `size`/`variant` are real again, and
 * clickable steps are real buttons.
 */
describe('Modern Stepper public anatomy', () => {
  it('paints nothing inline and stamps the ds-* data contract', () => {
    const { container } = render(<ModernStepper items={items} current={1} size="lg" variant="circles" />);

    const root = container.querySelector('.ds-stepper--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-direction', 'horizontal');
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-variant', 'circles');
    expect(root.style.cssText).toBe('');
    expect([...root.classList]).not.toContain('steps');

    const nodes = container.querySelectorAll('[data-part="item"]');
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toHaveAttribute('data-status', 'finish');
    expect(nodes[1]).toHaveAttribute('data-status', 'process');
    expect(nodes[2]).toHaveAttribute('data-status', 'error');
    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).style.cssText, `${el.getAttribute('data-part')} carries inline style`).toBe('');
      expect(el.className, 'DaisyUI step classes must stay drained').not.toMatch(/^(step|step-primary|step-error|step-content)$/);
    }
  });

  it('is a named navigation landmark wrapping a natural list', () => {
    // No I18nProvider here: the documented English contract applies, and the
    // missing-key marker must never leak into the accessible name.
    const { container } = render(<ModernStepper items={items} current={0} />);

    const nav = screen.getByRole('navigation', { name: 'Progress steps' });
    expect(nav).toBeInTheDocument();
    expect(nav.getAttribute('aria-label')).not.toContain('i18n:missing:');

    // axe listitem/aria-allowed-role: role="navigation" ON the <ul> stripped
    // the list semantics — the landmark wraps the list instead, and the list
    // carries no role of its own.
    const list = container.querySelector('.ds-stepper--modern[data-part="root"]') as HTMLElement;
    expect(list.tagName).toBe('UL');
    expect(list).not.toHaveAttribute('role');
    expect(list.parentElement).toBe(nav);
    expect(container.querySelectorAll('[data-part="root"] > li')).toHaveLength(3);
  });

  it('marks the current step with aria-current="step"', () => {
    render(<ModernStepper items={items} current={1} />);

    expect(screen.getByText('Review').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Draft').closest('li')).not.toHaveAttribute('aria-current');
  });

  it('renders clickable steps as real buttons and guards disabled steps', () => {
    const onChange = vi.fn();
    render(<ModernStepper items={items} current={0} clickable onChange={onChange} />);

    const trigger = screen.getByRole('button', { name: /Draft/ });
    expect(trigger).toHaveAttribute('data-part', 'trigger');
    fireEvent.click(trigger);
    expect(onChange).toHaveBeenCalledWith(0);

    // The disabled step never gets a trigger: keyboard cannot reach it.
    const publish = screen.getByText('Publish').closest('li') as HTMLElement;
    expect(publish).toHaveAttribute('data-disabled', 'true');
    expect(publish.querySelector('button')).toBeNull();
  });

  it('keeps clickable steps inert when clickable is false', () => {
    const onChange = vi.fn();
    render(<ModernStepper items={items} current={0} onChange={onChange} />);

    expect(screen.queryByRole('button')).toBeNull();
    fireEvent.click(screen.getByText('Draft'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('updates uncontrolled current on click', () => {
    render(<ModernStepper items={items} clickable />);

    fireEvent.click(screen.getByText('Review'));
    expect(screen.getByText('Review').closest('li')).toHaveAttribute('data-status', 'process');
    expect(screen.getByText('Draft').closest('li')).toHaveAttribute('data-status', 'finish');
  });

  it('keeps long titles intact in an Arabic RTL vertical context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernStepper
          direction="vertical"
          current={0}
          items={[{ title: 'إنشاء الحساب مع عنوان طويل عمداً يجب أن يلتف دون اقتطاع' }, { title: 'التحقق' }]}
        />
      </div>
    );

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-direction', 'vertical');
    expect(screen.getByText(/إنشاء الحساب/)).toHaveAttribute('data-part', 'label');
  });
});
