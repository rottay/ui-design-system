import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernFormField from '../engines/modern';
import ModernInput from '../../Input/engines/modern';

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

    expect(ids(container)).toEqual(['formfield-range', 'formfield-range-2']);
    expect(new Set(ids(container)).size).toBe(2);
  });

  it('points the label at the first control, which keeps the plain field id', () => {
    const { container } = render(
      <ModernFormField label="Code" name="code">
        <input />
        <input />
      </ModernFormField>
    );

    expect(screen.getByLabelText('Code')).toHaveAttribute('id', 'formfield-code');
    expect(container.querySelector('label')).toHaveAttribute('for', 'formfield-code');
  });

  it('does not renumber around a control that brought its own id', () => {
    const { container } = render(
      <ModernFormField label="Window" name="window">
        <input id="window-start" />
        <input />
      </ModernFormField>
    );

    expect(ids(container)).toEqual(['window-start', 'formfield-window']);
    expect(container.querySelector('label')).toHaveAttribute('for', 'window-start');
  });

  it('keeps component children unique too', () => {
    const { container } = render(
      <ModernFormField label="Pair" name="pair">
        <ModernInput />
        <ModernInput />
      </ModernFormField>
    );

    expect(ids(container)).toEqual(['formfield-pair', 'formfield-pair-2']);
  });

  it('leaves the single-control case on the unsuffixed field id', () => {
    const { container } = render(
      <ModernFormField label="Email" name="email">
        <input />
      </ModernFormField>
    );

    expect(ids(container)).toEqual(['formfield-email']);
  });
});
