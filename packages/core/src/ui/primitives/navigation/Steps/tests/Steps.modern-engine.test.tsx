import React from 'react';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernSteps from '../engines/modern';

const here = dirname(fileURLToPath(import.meta.url));
const SKIN = readFileSync(
  join(here, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/steps.css'),
  'utf8'
);
/** Paint assertions run against rules only, never the documented history in comments. */
const SKIN_RULES = SKIN.replace(/\/\*[\s\S]*?\*\//g, '');

const items = [
  { title: 'Draft', description: 'Write content' },
  { title: 'Review', subTitle: 'Optional' },
  { title: 'Publish', status: 'wait' as const },
];

/**
 * Real-engine contract for modern Steps (K3-B Pass 1): Daisy classes are
 * drained, the skin is the single paint owner of EVERY part including the
 * circle/connector pseudo-elements, and clickable steps are real buttons.
 */
describe('Modern Steps public anatomy', () => {
  it('paints nothing inline and stamps the ds-* data contract', () => {
    const { container } = render(<ModernSteps current={1} items={items} size="small" />);

    const root = container.querySelector('.rottay-steps--modern[data-part="root"]') as HTMLElement;
    expect(root.tagName).toBe('OL');
    expect(root).toHaveAttribute('data-direction', 'horizontal');
    expect(root).toHaveAttribute('data-size', 'small');
    // The bare DaisyUI `steps` class is drained; only the rottay-* scope remains.
    expect([...root.classList]).not.toContain('steps');

    const nodes = container.querySelectorAll('[data-part="item"]');
    expect(nodes).toHaveLength(3);
    expect(nodes[0]).toHaveAttribute('data-status', 'finish');
    expect(nodes[1]).toHaveAttribute('data-status', 'process');
    expect(nodes[2]).toHaveAttribute('data-status', 'wait');
    for (const el of nodes) {
      // No DaisyUI step classes survive anywhere in the render.
      expect(el.className, 'DaisyUI step classes must stay drained').toBe('');
      expect((el as HTMLElement).style.cssText).toBe('');
    }
    for (const el of container.querySelectorAll('[data-part]')) {
      expect((el as HTMLElement).style.cssText, `${el.getAttribute('data-part')} carries inline style`).toBe('');
    }
  });

  it('marks the current step with aria-current="step"', () => {
    render(<ModernSteps current={1} items={items} />);

    const review = screen.getByText('Review').closest('li') as HTMLElement;
    expect(review).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('Draft').closest('li')).not.toHaveAttribute('aria-current');
  });

  it('renders clickable steps as real buttons and guards disabled steps', () => {
    const onChange = vi.fn();
    render(
      <ModernSteps
        current={0}
        onChange={onChange}
        items={[
          { title: 'Draft' },
          { title: 'Locked', disabled: true },
        ]}
      />
    );

    const trigger = screen.getByRole('button', { name: 'Draft' });
    expect(trigger).toHaveAttribute('data-part', 'trigger');

    fireEvent.click(trigger);
    expect(onChange).toHaveBeenCalledWith(0);

    // The disabled step never gets a trigger: keyboard cannot reach it.
    const locked = screen.getByText('Locked').closest('li') as HTMLElement;
    expect(locked).toHaveAttribute('data-disabled', 'true');
    expect(locked.querySelector('button')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Locked' })).toBeNull();
  });

  it('renders the boolean dot mode and the custom progressDot slot', () => {
    const { container, rerender } = render(<ModernSteps current={0} progressDot items={items} />);
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-progress-dot', 'true');

    rerender(
      <ModernSteps
        current={1}
        items={items}
        progressDot={(info) => <span data-testid={`dot-${info.index}`}>{info.status}</span>}
      />
    );

    expect(screen.getByTestId('dot-0')).toHaveTextContent('finish');
    expect(screen.getByTestId('dot-1')).toHaveTextContent('process');
    expect(screen.getByTestId('dot-2')).toHaveTextContent('wait');
    expect(container.querySelectorAll('[data-part="dot-slot"]')).toHaveLength(3);
  });

  it('renders icon, subtitle and description parts', () => {
    render(
      <ModernSteps
        current={0}
        items={[{ title: 'With icon', subTitle: 'Required', description: 'Details', icon: <span data-testid="step-icon">*</span> }]}
      />
    );

    expect(screen.getByTestId('step-icon')).toBeInTheDocument();
    expect(screen.getByText('Required')).toHaveAttribute('data-part', 'subtitle');
    expect(screen.getByText('Details')).toHaveAttribute('data-part', 'description');
  });

  it('keeps long titles intact in an Arabic RTL vertical context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernSteps
          current={0}
          direction="vertical"
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

    // Status glyphs and the numbered counter are skin-owned content.
    expect(SKIN_RULES).toContain("content: counter(ds-step)");
    expect(SKIN_RULES).toContain("content: '✓'");
    expect(SKIN_RULES).toContain("content: '✕'");

    // K3-B Pass-2: the errored step's label inks red (rustic parity — the
    // rustic skin paints `[data-status='error'] [data-part='label']`).
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
