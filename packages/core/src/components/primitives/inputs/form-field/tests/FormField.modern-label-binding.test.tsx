import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernFormField from '../engines/modern';
import ModernInput from '../../input/engines/modern';
import ModernSlider from '@/components/primitives/inputs/slider/engines/modern';
import ModernOTPInput from '@/components/primitives/inputs/otp-input/engines/modern';
import ModernRate from '@/components/primitives/feedback/rate/engines/modern';
import ModernUpload from '@/components/primitives/inputs/upload/engines/modern';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

const bindingCases = [
  { family: 'Slider', control: <ModernSlider />, unnamedName: 'Slider', selector: 'input[type="range"]' },
  { family: 'OTPInput', control: <ModernOTPInput length={4} />, unnamedName: 'Digit 1 of 4', selector: 'input' },
  { family: 'Rate', control: <ModernRate />, unnamedName: 'Rating', selector: '[role="radiogroup"]' },
  { family: 'Upload', control: <ModernUpload />, unnamedName: 'Upload file', selector: 'input[type="file"]' },
];

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
    expect(control.id).toMatch(/^formfield-phone-.+$/);
    expect(screen.getByText('Phone').closest('label')).toHaveAttribute('for', control.id);
    expect(control.getAttribute('aria-describedby')).toBe(screen.getByText('Include the country code.').id);
    expect(control).toHaveAccessibleDescription('Include the country code.');
  });

  it('merges the caller description with the field message id', () => {
    render(
      <ModernFormField label="Domain" name="domain" error="Not authorized.">
        <input id="account-domain" aria-describedby="external-context" />
      </ModernFormField>
    );

    const control = screen.getByLabelText('Domain');
    expect(control.getAttribute('aria-describedby')).toBe(`external-context ${screen.getByRole('alert').id}`);
    expect(screen.getByRole('alert').id).toMatch(/^formfield-domain-.+-error$/);
  });

  it('leaves a non-control host child untouched', () => {
    const { container } = render(
      <ModernFormField label="Notes" name="notes">
        <div data-testid="passthrough" />
      </ModernFormField>
    );

    const passthrough = container.querySelector('[data-testid="passthrough"]');
    expect(passthrough).not.toHaveAttribute('id');
    expect(screen.getByText('Notes').closest('label')?.getAttribute('for')).toMatch(/^formfield-notes-.+$/);
  });
});


describe('ACT-11 current-source reproduction', () => {
  it.each(bindingCases)('$family resolves its visible field label to its real control', ({ family, control, selector }) => {
    const { container } = render(
      <I18nProvider locale="en">
        <ModernFormField label={`${family} field`} name={`binding-${family}`}>
          {control}
        </ModernFormField>
      </I18nProvider>
    );

    const target = container.querySelector(selector);
    expect(target).not.toBeNull();
    expect(screen.getByLabelText(`${family} field`)).toBe(target);
    expect(target).toHaveAccessibleName(`${family} field`);
  });

  it.each(bindingCases)('$family exposes the field error on its real control', ({ family, control, selector }) => {
    const { container } = render(
      <I18nProvider locale="en">
        <ModernFormField label={`${family} field`} name={`binding-${family}`} error="Choose a valid value.">
          {control}
        </ModernFormField>
      </I18nProvider>
    );

    const target = container.querySelector(selector);
    expect(target).not.toBeNull();
    expect(target).toHaveAccessibleDescription('Choose a valid value.');
    expect(target).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('ACT-11 preservation and negative controls', () => {
  it.each(bindingCases)('$family does not acquire a fabricated name from an empty label', ({ control, selector, unnamedName }) => {
    const { container } = render(
      <I18nProvider locale="en">
        <ModernFormField label="" name="unnamed-field">{control}</ModernFormField>
      </I18nProvider>
    );
    const target = container.querySelector(selector);
    expect(target).not.toBeNull();
    expect(target).not.toHaveAttribute('aria-labelledby');
    expect(target).not.toHaveAttribute('aria-describedby');
    expect(target).not.toHaveAttribute('aria-invalid', 'true');
    expect(target).toHaveAccessibleName(unnamedName);
  });

  it('preserves supported caller ids and ARIA on a real Rate radiogroup', () => {
    render(
      <>
        <p id="rate-context">Existing context.</p>
        <ModernFormField label="Visible rating" name="rating" error="Choose a rating.">
          <ModernRate id="caller-rate" aria-label="Caller rating" aria-describedby="rate-context" />
        </ModernFormField>
      </>
    );
    const group = screen.getByRole('radiogroup', { name: 'Caller rating' });
    expect(group).toHaveAttribute('id', 'caller-rate');
    expect(group).toHaveAccessibleDescription('Existing context. Choose a rating.');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    expect(group.querySelector('button, input:not([type="hidden"])')).toBeNull();
  });

  it('preserves OTP caller id prefixes and its own error description', () => {
    const { container } = render(
      <ModernFormField label="Verification" name="verification" error="Field error.">
        <ModernOTPInput length={2} id="caller-otp" error errorMessage="Code error." />
      </ModernFormField>
    );
    const first = screen.getByLabelText('Digit 1 of 2');
    expect(first).toHaveAttribute('id', 'caller-otp-0');
    expect(first).toHaveAccessibleDescription('Code error. Field error.');
    expect(container.querySelectorAll('[id="caller-otp-0"]')).toHaveLength(1);
  });

  it.each(bindingCases)('$family keeps two same-name field instances and message ids unique', ({ family, control }) => {
    const { container } = render(
      <I18nProvider locale="en">
        <ModernFormField label={`First ${family}`} name="shared" error="First error.">{control}</ModernFormField>
        <ModernFormField label={`Second ${family}`} name="shared" error="Second error.">{control}</ModernFormField>
      </I18nProvider>
    );
    const ids = Array.from(container.querySelectorAll('[id]'), (node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    const first = screen.getByLabelText(`First ${family}`);
    const second = screen.getByLabelText(`Second ${family}`);
    expect(first).not.toBe(second);
    expect(first).toHaveAccessibleDescription('First error.');
    expect(second).toHaveAccessibleDescription('Second error.');
  });

  it.each(bindingCases)('$family forwards help and clears error semantics on rerender', ({ family, control, selector }) => {
    const field = (error?: string) => (
      <I18nProvider locale="en">
        <ModernFormField label={`${family} field`} name="transition" help="Helpful context." error={error} reserveMessageSpace>
          {control}
        </ModernFormField>
      </I18nProvider>
    );
    const { container, rerender } = render(field('Invalid value.'));
    const target = container.querySelector(selector);
    expect(target).toHaveAccessibleDescription('Invalid value.');
    expect(target).toHaveAttribute('aria-invalid', 'true');
    rerender(field());
    expect(container.querySelector(selector)).toHaveAccessibleDescription('Helpful context.');
    expect(container.querySelector(selector)).not.toHaveAttribute('aria-invalid', 'true');
    expect(within(container).queryByRole('alert')).toBeNull();
    expect(container.querySelectorAll('[data-part="message-region"]')).toHaveLength(1);
  });
});


describe('Modern FormField composite binding precedence', () => {
  it.each(bindingCases)('$family preserves explicit names, ids and descriptions', ({ control, selector }) => {
    const { container } = render(
      <I18nProvider locale="en">
        <p id="caller-label">Referenced name</p>
        <p id="caller-description">Caller context.</p>
        <ModernFormField label="Visible label" name="precedence" help="Field context.">
          {React.cloneElement(control, {
            id: 'caller-control', 'aria-label': 'Direct name',
            'aria-labelledby': 'caller-label', 'aria-describedby': 'caller-description',
            'aria-invalid': 'grammar',
          })}
        </ModernFormField>
      </I18nProvider>
    );
    const target = container.querySelector(selector);
    expect(target).toHaveAccessibleName('Referenced name');
    expect(target).toHaveAttribute('aria-labelledby', 'caller-label');
    expect(target).toHaveAttribute('aria-label', 'Direct name');
    expect(target).toHaveAttribute('aria-invalid', 'grammar');
    expect(target).toHaveAccessibleDescription('Caller context. Field context.');
    expect(target?.id).toBe(selector === 'input' ? 'caller-control-0' : 'caller-control');
  });

  it.each(bindingCases)('$family preserves an explicit aria-label over the field name', ({ control, selector }) => {
    const { container } = render(
      <I18nProvider locale="en">
        <ModernFormField label="Visible label" name="direct-name">
          {React.cloneElement(control, { 'aria-label': 'Caller name' })}
        </ModernFormField>
      </I18nProvider>
    );
    const target = container.querySelector(selector);
    expect(target).toHaveAccessibleName('Caller name');
    expect(target).not.toHaveAttribute('aria-labelledby');
  });

  it('labels the range group and describes both distinctly named native thumbs', () => {
    render(
      <ModernFormField label="Budget" name="budget" error="Choose a valid range.">
        <ModernSlider range id="budget-range" defaultValue={[20, 80]} />
      </ModernFormField>
    );
    const group = screen.getByRole('group', { name: 'Budget' });
    expect(screen.getByLabelText('Budget')).toBe(group);
    expect(group).toHaveAttribute('id', 'budget-range');
    expect(group).toHaveAccessibleDescription('Choose a valid range.');
    const minimum = screen.getByRole('slider', { name: 'Minimum value' });
    const maximum = screen.getByRole('slider', { name: 'Maximum value' });
    const thumbs = [minimum, maximum];
    for (const thumb of thumbs) {
      expect(thumb).toHaveAccessibleDescription('Choose a valid range.');
      expect(thumb).toHaveAttribute('aria-invalid', 'true');
      expect(thumb).not.toHaveAttribute('aria-labelledby');
    }
    expect(minimum.id).toBe('budget-range-start');
    expect(maximum.id).toBe('budget-range-end');
  });

  it.each(bindingCases)('$family removes message references in the valid state and keeps stable ids', ({ control, selector }) => {
    const field = (error?: string) => (
      <I18nProvider locale="en">
        <ModernFormField label="Visible label" name="valid-transition" error={error} reserveMessageSpace>{control}</ModernFormField>
      </I18nProvider>
    );
    const { container, rerender } = render(field('Invalid.'));
    const before = container.querySelector(selector);
    const id = before?.id;
    const messageId = screen.getByRole('alert').id;
    expect(before).toHaveAttribute('aria-describedby', messageId);
    rerender(field());
    const after = container.querySelector(selector);
    expect(after).toBe(before);
    expect(after?.id).toBe(id);
    expect(after).not.toHaveAttribute('aria-describedby');
    expect(after).not.toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById(messageId)).toBeNull();
    expect(after).toHaveAccessibleName('Visible label');
  });

  it('preserves every positional OTP label and shares the message with every slot', () => {
    render(
      <ModernFormField label="Verification code" name="code" help="Check your messages.">
        <ModernOTPInput length={3} id="verification" />
      </ModernFormField>
    );
    const first = screen.getByLabelText('Verification code');
    expect(first).toHaveAttribute('id', 'verification-0');
    const positions = [1, 2, 3];
    for (const position of positions) {
      const slot = screen.getByLabelText(`Digit ${position} of 3`);
      expect(slot).toHaveAttribute('id', `verification-${position - 1}`);
      expect(slot).toHaveAccessibleDescription('Check your messages.');
      if (position > 1) expect(slot).toHaveAccessibleName(`Digit ${position} of 3`);
    }
  });
});


it('keeps same-name range fields, group ids, thumb ids and message references separate', () => {
  const { container } = render(
    <>
      <ModernFormField label="First interval" name="interval" error="First range error."><ModernSlider range /></ModernFormField>
      <ModernFormField label="Second interval" name="interval" error="Second range error."><ModernSlider range /></ModernFormField>
    </>
  );
  const ids = Array.from(container.querySelectorAll('[id]'), (node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  const first = screen.getByRole('group', { name: 'First interval' });
  const second = screen.getByRole('group', { name: 'Second interval' });
  expect(first).toHaveAccessibleDescription('First range error.');
  expect(second).toHaveAccessibleDescription('Second range error.');
  const firstThumbs = within(first).getAllByRole('slider');
  for (const thumb of firstThumbs) expect(thumb).toHaveAccessibleDescription('First range error.');
  const secondThumbs = within(second).getAllByRole('slider');
  for (const thumb of secondThumbs) expect(thumb).toHaveAccessibleDescription('Second range error.');
});
