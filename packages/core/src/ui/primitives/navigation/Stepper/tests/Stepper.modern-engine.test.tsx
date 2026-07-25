import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernStepper from '../engines/modern';

const here = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/stepper.css'),
  'utf8'
);
/** Paint assertions run against rules only, never the documented history in comments. */
const SKIN_RULES = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

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

    const root = container.querySelector('.rottay-stepper--modern[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-direction', 'horizontal');
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-variant', 'circles');
    expect(root.style.cssText).toBe('');
    // The bare DaisyUI `steps` class is drained; only the rottay-* scope remains.
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
    const list = container.querySelector('.rottay-stepper--modern[data-part="root"]') as HTMLElement;
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

  it('makes the skin the single paint owner of the circle and the connector', () => {
    // The circle and the connector are skin pseudo-elements on data-part hooks,
    // never DaisyUI .step::before/::after (drained) nor theme.css (dead, P-73).
    expect(SKIN_RULES).toContain("[data-part='item']::after");
    expect(SKIN_RULES).toContain("[data-part='item']::before");
    expect(SKIN_RULES).not.toContain('.step::');
    expect(SKIN_RULES).not.toContain('--ds-steps-line-color');

    // Connector paint is owned here now.
    const connector = SKIN_RULES.match(/\[data-part='item'\]::before\s*\{([^}]*)\}/);
    expect(connector?.[1]).toContain('background:');

    // Status glyphs, the numbered counter and the size scale are skin-owned.
    expect(SKIN_RULES).toContain('content: counter(ds-stepper)');
    expect(SKIN_RULES).toContain("content: '✓'");
    expect(SKIN_RULES).toContain("content: '✕'");
    expect(SKIN_RULES).toContain("[data-size='sm']");
    expect(SKIN_RULES).toContain("[data-variant='simple']");

    // K3-B Pass-2: the errored step's label inks red (rustic parity).
    const errorLabel = SKIN_RULES.match(
      /\[data-status='error'\] \[data-part='label'\]\s*\{[^}]*\}/
    );
    expect(errorLabel?.[0]).toContain('color:');
    expect(errorLabel?.[0]).toContain('--ds-color-error');
  });

  it('keeps disabled text AA-legible instead of riding the chrome opacity', () => {
    // axe color-contrast measured the disabled wait item at 3.05:1 (label)
    // and 2.04:1 (description) when the whole item rode opacity 0.5. The fix:
    // chrome (circle/connector/icon) dims, text keeps a measured ink.
    expect(SKIN_RULES).not.toMatch(
      /\[data-part='item'\]\[data-disabled='true'\]\s*\{[^}]*opacity/
    );
    const disabledLabel = SKIN_RULES.match(
      /\[data-part='item'\]\[data-disabled='true'\] \[data-part='label'\]\s*\{([^}]*)\}/
    );
    expect(disabledLabel?.[1]).toContain('--ds-color-text-secondary');
    const disabledDescription = SKIN_RULES.match(
      /\[data-part='item'\]\[data-disabled='true'\] \[data-part='description'\]\s*\{([^}]*)\}/
    );
    expect(disabledDescription?.[1]).toContain('--ds-color-text-secondary');
  });

  it('makes the skin pair every text surface with the card chrome tokens', () => {
    // PAIRED-SURFACE LAW pin: raw --ds-surface-card may be a dark feature
    // surface (TMM #18181c) while the text tokens stay dark; the circle and
    // its status mixes ride --ds-card-bg instead.
    const stateRules = SKIN_RULES.match(/background[^;]*surface-card[^;]*;/g) ?? [];
    expect(stateRules.length).toBeGreaterThan(0);
    for (const rule of stateRules) {
      expect(rule, `surface mix bypasses the card pairing: ${rule}`).toContain('--ds-card-bg');
    }
  });
});
