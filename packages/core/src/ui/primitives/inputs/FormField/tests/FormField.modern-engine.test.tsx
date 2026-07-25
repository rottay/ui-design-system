import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernFormField from '../engines/modern';
import ModernInput from '../../Input/engines/modern';

describe('Modern FormField public anatomy', () => {
  it('wires label, help and caller descriptions without inline visual paint', () => {
    const { container } = render(
      <ModernFormField
        label="Candidate contact address with intentionally long localized copy"
        name="candidate-email"
        layout="horizontal"
        labelWidth="11rem"
        help="Used only for authorized recruiting communication."
      >
        <ModernInput aria-describedby="external-context" />
      </ModernFormField>
    );

    const root = container.querySelector('.ds-form-field[data-part="root"]') as HTMLElement;
    const control = screen.getByLabelText(/Candidate contact address/i);
    const help = screen.getByText(/authorized recruiting/i);

    expect(root).toHaveAttribute('data-layout', 'horizontal');
    expect(root.style.getPropertyValue('--ds-form-field-label-width')).toBe('11rem');
    expect(root.style.display).toBe('');
    expect(control.getAttribute('aria-describedby')).toContain('external-context');
    expect(control.getAttribute('aria-describedby')).toContain(help.id);
  });

  it('projects invalid and disabled state into the real Input contract', () => {
    const { container } = render(
      <ModernFormField
        label="Work email"
        name="work-email"
        error="The domain is not authorized."
        disabled
      >
        <ModernInput />
      </ModernFormField>
    );

    const control = screen.getByLabelText('Work email');
    const inputShell = container.querySelector('.rottay-input[data-part="root"]');

    expect(control).toBeDisabled();
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(inputShell).toHaveAttribute('data-invalid', 'true');
    expect(inputShell).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'formfield-work-email-error');
  });

  it('keeps the same anatomy in an Arabic RTL context', () => {
    const { container } = render(
      <div dir="rtl" lang="ar">
        <ModernFormField
          label="البريد الإلكتروني للمرشح"
          name="candidate-email-ar"
          help="تظل المساعدة في التدفق الطبيعي دون تداخل."
        >
          <ModernInput suffix={<span aria-hidden="true">@</span>} />
        </ModernFormField>
      </div>
    );

    expect(screen.getByLabelText('البريد الإلكتروني للمرشح')).toBeInTheDocument();
    expect(container.querySelector('[data-part="affix-suffix"]')).toBeInTheDocument();
    expect(container.querySelector('.ds-form-field[data-part="root"]')).toHaveAttribute('data-layout', 'vertical');
  });

  it('propagates required semantics instead of painting only an asterisk', () => {
    const { container } = render(
      <ModernFormField label="Portfolio URL" name="portfolio-url" required>
        <ModernInput />
      </ModernFormField>
    );

    const root = container.querySelector('.ds-form-field[data-part="root"]');
    const control = screen.getByRole('textbox', { name: /Portfolio URL/ });

    expect(root).toHaveAttribute('data-required', 'true');
    expect(control).toBeRequired();
    expect(control).toHaveAttribute('aria-required', 'true');
  });

  it('does not leak field-only props into intrinsic non-controls or Fragments', () => {
    render(
      <ModernFormField label="Composite content" name="composite" required disabled>
        <div data-testid="non-control">Read-only explanation</div>
        <React.Fragment>
          <span data-testid="fragment-content">Supplement</span>
        </React.Fragment>
      </ModernFormField>
    );

    for (const testId of ['non-control', 'fragment-content']) {
      const node = screen.getByTestId(testId);
      expect(node).not.toHaveAttribute('disabled');
      expect(node).not.toHaveAttribute('required');
      expect(node).not.toHaveAttribute('aria-invalid');
    }
  });
});
