import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../../_internal/testing/helpers/engine-test-utils';

describe('Radio integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'selects the live component in the %s engine',
    async (engine) => {
      const { Radio } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <Radio engine={engine} name="plan" value="pro" label="Pro plan" onChange={onChange} />,
        engine
      );

      const radio = await screen.findByRole('radio', { name: /pro plan/i });
      fireEvent.click(radio);

      expect(onChange).toHaveBeenCalled();
      expect(radio).toBeChecked();
    }
  );

  it('supports keyboard activation in the rustic engine', async () => {
    const { Radio } = await import('.');
    const onChange = vi.fn();

    renderWithEngine(
      <Radio engine="rustic" name="visibility" value="public" label="Public" onChange={onChange} />,
      'rustic'
    );

    const label = screen.getByText('Public').closest('label');
    expect(label).toBeTruthy();

    fireEvent.keyDown(label!, { key: ' ' });

    expect(onChange).toHaveBeenCalled();
    expect(await screen.findByRole('radio', { name: /public/i })).toBeChecked();
  });

  it.each(['modern', 'rustic'] as const)(
    'updates radio groups in the %s engine',
    async (engine) => {
      const { Radio } = await import('.');
      const onChange = vi.fn();

      renderWithEngine(
        <Radio.Group
          engine={engine}
          onChange={onChange}
          options={[
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />,
        engine
      );

      const monthly = await screen.findByRole('radio', { name: /monthly/i });
      fireEvent.click(monthly);

      expect(onChange).toHaveBeenCalledWith('monthly');
      expect(monthly).toBeChecked();
    }
  );

  it.each(['solid', 'outline'] as const)(
    'renders rustic button-style radio groups with %s styling',
    async (buttonStyle) => {
      const { Radio } = await import('.');

      renderWithEngine(
        <Radio.Group
          engine="rustic"
          buttonStyle={buttonStyle}
          value="team"
          options={[
            { value: 'team', label: 'Team' },
            { value: 'personal', label: 'Personal' },
          ]}
        />,
        'rustic'
      );

      expect(await screen.findByRole('radio', { name: /team/i })).toBeChecked();
    }
  );

  it.each(['primary', 'secondary', 'success', 'warning', 'error'] as const)(
    'renders rustic color variant %s without crashing',
    async (color) => {
      const { Radio } = await import('.');

      renderWithEngine(
        <Radio engine="rustic" name={`color-${color}`} value={color} label={`Color ${color}`} color={color} checked onChange={() => undefined} />,
        'rustic'
      );

      expect(await screen.findByRole('radio', { name: new RegExp(`color ${color}`, 'i') })).toBeInTheDocument();
    }
  );
});
