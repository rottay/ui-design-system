import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import ModernFilterPanel from '../engines/modern';
import type { FilterDef } from '../contracts';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import type { SupportedLocale } from '@/infrastructure/runtime/i18n';
import { ActionSearchIcon } from '@/graphics/icons/semantic/generated/roles/action-search';

type Option = NonNullable<FilterDef['options']>[number];
const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const;
const tokens = [
  'Disclosed', 'Delivery', 'no_hire', 'no-show', 'hired', 'interviewer',
  'recruiter', 'candidate', 'debrief', 'job', 'company', 'pending',
  'completed', 'remote', 'date', 'person', 'route', 'target', 'status', 'security',
];
const slots = ['filter key', 'filter label', 'option value', 'option label'] as const;
const cases = slots.flatMap((slot) => tokens.map((token) => ({ slot, token })));

function filterFor(slot: typeof slots[number], token: string): FilterDef {
  return {
    key: slot === 'filter key' ? token : 'field',
    label: slot === 'filter label' ? token : 'Choice',
    type: 'select',
    options: [{
      value: slot === 'option value' ? token : 'entry',
      label: slot === 'option label' ? token : 'Amber',
    }],
  };
}

function openOptions(filter: FilterDef, locale?: SupportedLocale) {
  const panel = <ModernFilterPanel filters={[filter]} values={{}} onChange={vi.fn()} />;
  render(locale ? <I18nProvider locale={locale}>{panel}</I18nProvider> : panel);
  fireEvent.click(screen.getByRole('combobox', { name: filter.label }));
  return screen.getAllByRole('option');
}

function expectNeutral(option: HTMLElement) {
  const badge = option.querySelector('[data-part="option-icon-badge"]');
  expect(badge).not.toBeNull();
  expect(badge).toHaveAttribute('data-tone', 'neutral');
  expect(badge).toHaveAttribute('aria-hidden', 'true');
  expect(badge!.querySelectorAll('[data-icon-name]')).toHaveLength(1);
  expect(badge!.querySelector('[data-icon-name]')).toHaveAttribute('data-icon-name', 'status.neutral');
}

describe('ModernFilterPanel neutral option semantics', () => {
  it.each(cases)('does not infer $token from $slot', ({ slot, token }) => {
    const options = openOptions(filterFor(slot, token));
    expect(options).toHaveLength(1);
    options.forEach(expectNeutral);
  });

  const localeCases: { locale: SupportedLocale; label: string }[] = [
    { locale: 'en', label: 'Amber' }, { locale: 'es', label: 'Ámbar' },
    { locale: 'fr', label: 'Ambre' }, { locale: 'pt', label: 'Âmbar' },
    { locale: 'ar', label: 'كهرمان' },
  ];
  it.each(localeCases)('keeps arbitrary labels neutral under $locale', ({ locale, label }) => {
    const options = openOptions({
      key: 'field', label: 'Choice', type: 'select',
      options: [{ value: 'entry', label }, { value: 'Delivery', label: 'Disclosed' },
        { value: 'candidate', label: 'Recruiter' }],
    }, locale);
    expect(options).toHaveLength(3);
    expect(within(options.at(0)!).getByText(label)).toBeInTheDocument();
    options.forEach(expectNeutral);
  });

  it.each(tones)('preserves explicit %s tone without inferring an icon', (tone) => {
    const options = openOptions({
      key: 'no-hire', label: 'Rejected candidate', type: 'select',
      options: [{ value: 'no-show', label: 'Blocked', tone }],
    });
    const badge = options.at(0)!.querySelector('[data-part="option-icon-badge"]');
    expect(badge).toHaveAttribute('data-tone', tone);
    expect(badge!.querySelector('[data-icon-name]')).toHaveAttribute('data-icon-name', 'status.neutral');
  });

  it('renders the supplied semantic icon and supporting copy without a default badge', () => {
    const option: Option = {
      value: 'hired', label: 'Completed', tone: 'danger',
      icon: <ActionSearchIcon label="Consumer glyph" size={21} />,
      description: 'Consumer detail',
    };
    const options = openOptions({ key: 'candidate', label: 'Choice', type: 'select', options: [option] });
    expect(options).toHaveLength(1);
    expect(within(options.at(0)!).getByLabelText('Consumer glyph')).toHaveAttribute('data-icon-name', 'action.search');
    expect(within(options.at(0)!).getByLabelText('Consumer glyph')).toHaveAttribute('width', '21');
    expect(within(options.at(0)!).getByText('Consumer detail')).toBeInTheDocument();
    expect(options.at(0)!.querySelector('[data-part="option-icon-badge"]')).toBeNull();
  });

  it('preserves custom ReactNode icon, disabled state, selection value and unrelated values', () => {
    const onChange = vi.fn();
    render(<ModernFilterPanel filters={[{
      key: 'field', label: 'Choice', type: 'select', options: [
        { value: 'blocked', label: 'Disclosed', disabled: true, icon: <span data-testid="consumer-node">★</span> },
        { value: 'live', label: 'Delivery' },
      ],
    }]} values={{ query: 'keep' }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Choice' }));
    const disabled = screen.getByRole('option', { name: /Disclosed/ });
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(within(disabled).getByTestId('consumer-node')).toHaveTextContent('★');
    expect(disabled.querySelector('[data-part="option-icon-badge"]')).toBeNull();
    fireEvent.click(disabled);
    expect(onChange).not.toHaveBeenCalled();
    const delivery = screen.getByRole('option', { name: 'Delivery' });
    expectNeutral(delivery);
    fireEvent.click(delivery);
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ query: 'keep', field: 'live' });
  });
});
