import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernFormField from '../engines/modern';
import ModernInput from '../../Input/engines/modern';

describe('Modern FormField label binding', () => {
  it('keeps a host child own id and points the label at that id', () => {
    render(
      <ModernFormField label="Email" name="email">
        <input id="account-email" />
      </ModernFormField>
    );

    const control = screen.getByLabelText('Email');
    expect(control).toHaveAttribute('id', 'account-email');
    expect(screen.getByText('Email').closest('label')).toHaveAttribute('for', 'account-email');
  });

  it('keeps a component child own id and still resolves the accessible name', () => {
    render(
      <ModernFormField label="Work email" name="work-email">
        <ModernInput id="account-email" />
      </ModernFormField>
    );

    const control = screen.getByRole('textbox', { name: 'Work email' });
    expect(control).toHaveAttribute('id', 'account-email');
  });

  it('keeps every control own id when several share one field', () => {
    render(
      <ModernFormField label="Range" name="range">
        <input id="range-start" />
        <input id="range-end" />
      </ModernFormField>
    );

    expect(screen.getByLabelText('Range')).toHaveAttribute('id', 'range-start');
    expect(document.getElementById('range-end')).not.toBeNull();
  });

  it('associates a component child that brings no id of its own', () => {
    render(
      <ModernFormField label="Phone" name="phone" help="Include the country code.">
        <ModernInput />
      </ModernFormField>
    );

    const control = screen.getByLabelText('Phone');
    expect(control).toHaveAttribute('id', 'formfield-phone');
    expect(control.getAttribute('aria-describedby')).toContain('formfield-phone-help');
  });

  it('merges the caller description with the field message id', () => {
    render(
      <ModernFormField label="Domain" name="domain" error="Not authorized.">
        <input id="account-domain" aria-describedby="external-context" />
      </ModernFormField>
    );

    const control = screen.getByLabelText('Domain');
    expect(control.getAttribute('aria-describedby')).toBe('external-context formfield-domain-error');
  });

  it('leaves a non-control host child untouched', () => {
    const { container } = render(
      <ModernFormField label="Notes" name="notes">
        <div data-testid="passthrough" />
      </ModernFormField>
    );

    const passthrough = container.querySelector('[data-testid="passthrough"]');
    expect(passthrough).not.toHaveAttribute('id');
    expect(screen.getByText('Notes').closest('label')).toHaveAttribute('for', 'formfield-notes');
  });
});
