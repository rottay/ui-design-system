import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';

describe('Checkbox integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'toggles the live component in the %s engine',
    async (engine) => {
      const { Checkbox } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <Checkbox engine={engine} label="Accept terms" onChange={onChange} />,
        engine
      );

      const checkbox = await screen.findByRole('checkbox', { name: /accept terms/i });
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);

      expect(onChange).toHaveBeenCalledWith(
        true,
        expect.objectContaining({
          target: expect.objectContaining({
            checked: true,
          }),
        })
      );
      expect(checkbox).toBeChecked();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'renders indeterminate state accessibly in the %s engine',
    async (engine) => {
      const { Checkbox } = await import('.');

      renderWithEngine(
        <Checkbox engine={engine} label="Select all" indeterminate />,
        engine
      );

      const checkbox = await screen.findByRole('checkbox', { name: /select all/i });
      expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'updates checkbox groups in the %s engine',
    async (engine) => {
      const { Checkbox } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <Checkbox.Group
          engine={engine}
          onChange={onChange}
          options={[
            { value: 'email', label: 'Email alerts' },
            { value: 'sms', label: 'SMS alerts' },
          ]}
        />,
        engine
      );

      const email = await screen.findByRole('checkbox', { name: /email alerts/i });
      fireEvent.click(email);

      expect(onChange).toHaveBeenCalledWith(['email']);
      expect(email).toBeChecked();
    }
  );

  it.each(['full', 'none', 'sm', 'md', 'lg'] as const)(
    'renders rustic radius variant %s without crashing',
    async (radius) => {
      const { Checkbox } = await import('.');

      renderWithEngine(
        <Checkbox engine="rustic" label={`Radius ${radius}`} radius={radius} checked onChange={() => undefined} />,
        'rustic'
      );

      expect(await screen.findByRole('checkbox', { name: new RegExp(`radius ${radius}`, 'i') })).toBeInTheDocument();
    }
  );

  it.each(['primary', 'secondary', 'success', 'warning', 'error'] as const)(
    'renders rustic color variant %s without crashing',
    async (color) => {
      const { Checkbox } = await import('.');

      renderWithEngine(
        <Checkbox
          engine="rustic"
          label={`Color ${color}`}
          color={color}
          checked
          onChange={() => undefined}
        />,
        'rustic'
      );

      expect(await screen.findByRole('checkbox', { name: new RegExp(`color ${color}`, 'i') })).toBeInTheDocument();
    }
  );
});
