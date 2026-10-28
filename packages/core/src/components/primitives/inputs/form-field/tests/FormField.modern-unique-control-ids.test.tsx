import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernFormField from '../engines/modern';
import ModernInput from '../../input/engines/modern';

const ids = (container: HTMLElement) =>
  [...container.querySelectorAll('[data-part="control-slot"] input')].map((el) => el.id);

describe('Modern FormField control id uniqueness', () => {
  it('gives each id-less control its own id instead of repeating the field id', () => {
    const { container } = render(
      <ModernFormField label="Range" name="range">
        <input />
        <input />
      </ModernFormField>
    );

    const [firstId] = ids(container);
    expect(firstId).toMatch(/^formfield-range-.+$/);
    expect(ids(container)).toEqual([firstId, `${firstId}-2`]);
    expect(new Set(ids(container)).size).toBe(2);
    expect(container.querySelector('[data-part="label"]')).toHaveAttribute('id', `${firstId}-label`);
  });

  it('points the label at the first control, which keeps the instance field id', () => {
    const { container } = render(
      <ModernFormField label="Code" name="code">
        <input />
        <input />
      </ModernFormField>
    );

    const [first, second] = screen.getAllByRole('textbox');
    expect(first.id).toMatch(/^formfield-code-.+$/);
    expect(screen.getByLabelText('Code')).toBe(first);
    expect(first).toHaveAccessibleName('Code');
    expect(second).not.toHaveAccessibleName('Code');
    expect(container.querySelector('label')).toHaveAttribute('for', first.id);
    expect(first).toHaveAttribute('aria-labelledby', container.querySelector('[data-part="label"]')?.id);
  });

  it('does not renumber around a control that brought its own id', () => {
    const { container } = render(
      <ModernFormField label="Window" name="window">
        <input id="window-start" />
        <input />
        <input id="window-end" />
        <input />
      </ModernFormField>
    );

    const firstGeneratedId = container.querySelector('[data-part="label"]')?.id.replace(/-label$/, '');
    expect(firstGeneratedId).toMatch(/^formfield-window-.+$/);
    expect(ids(container)).toEqual(['window-start', firstGeneratedId, 'window-end', `${firstGeneratedId}-2`]);
    expect(new Set(ids(container)).size).toBe(4);
    expect(screen.getByLabelText('Window')).toHaveAttribute('id', 'window-start');
    expect(screen.getByLabelText('Window')).toHaveAccessibleName('Window');
    expect(container.querySelector('label')).toHaveAttribute('for', 'window-start');
  });

  it('keeps component children unique too', () => {
    const { container } = render(
      <ModernFormField label="Pair" name="pair">
        <ModernInput />
        <ModernInput />
      </ModernFormField>
    );

    const [firstId] = ids(container);
    expect(firstId).toMatch(/^formfield-pair-.+$/);
    expect(ids(container)).toEqual([firstId, `${firstId}-2`]);
    expect(new Set(ids(container)).size).toBe(2);
    expect(container.querySelector('[data-part="label"]')).toHaveAttribute('id', `${firstId}-label`);
    expect(screen.getByLabelText('Pair')).toHaveAttribute('id', firstId);
    expect(screen.getByLabelText('Pair')).toHaveAccessibleName('Pair');
  });

  it('leaves the single-control case on its stable instance field id', () => {
    const { container, rerender } = render(
      <ModernFormField label="Email" name="email">
        <input />
      </ModernFormField>
    );

    const [firstId] = ids(container);
    const labelId = container.querySelector('[data-part="label"]')?.id;
    expect(firstId).toMatch(/^formfield-email-.+$/);
    expect(labelId).toBe(`${firstId}-label`);
    expect(ids(container)).toEqual([firstId]);
    expect(container.querySelector('label')).toHaveAttribute('for', firstId);
    expect(screen.getByLabelText('Email')).toHaveAccessibleName('Email');

    rerender(
      <ModernFormField label="Email" name="email" help="Use your work address">
        <input />
      </ModernFormField>
    );

    expect(ids(container)).toEqual([firstId]);
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-labelledby', labelId);
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Use your work address');
  });

  it.each(['native', 'component'] as const)('keeps same-name %s field instances unique', (kind) => {
    const { container } = render(
      <>
        <ModernFormField label="First range" name="range">
          {kind === 'native' ? <input /> : <ModernInput />}
          {kind === 'native' ? <input /> : <ModernInput />}
        </ModernFormField>
        <ModernFormField label="Second range" name="range">
          {kind === 'native' ? <input /> : <ModernInput />}
          {kind === 'native' ? <input /> : <ModernInput />}
        </ModernFormField>
      </>
    );

    const [firstId, , secondId] = ids(container);
    expect(new Set(ids(container)).size).toBe(4);
    expect(firstId).toMatch(/^formfield-range-.+$/);
    expect(secondId).toMatch(/^formfield-range-.+$/);
    expect(ids(container)).toEqual([firstId, `${firstId}-2`, secondId, `${secondId}-2`]);
    expect(screen.getByLabelText('First range')).toHaveAttribute('id', firstId);
    expect(screen.getByLabelText('First range')).toHaveAccessibleName('First range');
    expect(screen.getByLabelText('Second range')).toHaveAttribute('id', secondId);
    expect(screen.getByLabelText('Second range')).toHaveAccessibleName('Second range');
  });

  it('keeps same-name single-control fields and their labels unique', () => {
    const { container } = render(
      <>
        <ModernFormField label="Work email" name="email"><input /></ModernFormField>
        <ModernFormField label="Personal email" name="email"><input /></ModernFormField>
      </>
    );

    const [workId, personalId] = ids(container);
    expect(new Set(ids(container)).size).toBe(2);
    expect(workId).toMatch(/^formfield-email-.+$/);
    expect(personalId).toMatch(/^formfield-email-.+$/);
    const labelIds = [...container.querySelectorAll('[data-part="label"]')].map((el) => el.id);
    expect(labelIds).toEqual([`${workId}-label`, `${personalId}-label`]);
    expect(new Set(labelIds).size).toBe(2);
    expect(screen.getByLabelText('Work email')).toHaveAttribute('id', workId);
    expect(screen.getByLabelText('Work email')).toHaveAccessibleName('Work email');
    expect(screen.getByLabelText('Personal email')).toHaveAttribute('id', personalId);
    expect(screen.getByLabelText('Personal email')).toHaveAccessibleName('Personal email');
  });
});
