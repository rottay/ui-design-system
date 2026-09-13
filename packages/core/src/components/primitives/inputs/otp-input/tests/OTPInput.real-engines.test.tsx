import React from 'react';

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';

// ---------------------------------------------------------------------------
// The public component resolves through the genuine engine factory and the
// modern engine paints nothing inline; OTPInput.test.tsx mocks the factory, so
// behaviour through real engines lives here.
// ---------------------------------------------------------------------------

describe('OTPInput real engines', () => {
  it.each(['modern', 'rustic'] as const)(
    'types and completes a code through the real %s engine',
    async (engine) => {
      const { OTPInput } = await import('..');
      const onChange = vi.fn();
      const onComplete = vi.fn();

      renderWithEngine(<OTPInput engine={engine} length={4} onChange={onChange} onComplete={onComplete} />, engine);

      const slot0 = await screen.findByLabelText('Digit 1 of 4');
      fireEvent.change(slot0, { target: { value: '1' } });
      expect(onChange).toHaveBeenCalledWith('1');

      // Paste distributes from the first slot; a full-length paste completes.
      fireEvent.paste(screen.getByLabelText('Digit 2 of 4'), { clipboardData: { getData: () => '1234' } });
      expect(onChange).toHaveBeenCalledWith('1234');
      expect(onComplete).toHaveBeenCalledWith('1234');
    }
  );

  it('modern engine stamps skin-owned anatomy with no inline styles on any part', async () => {
    const { OTPInput } = await import('..');
    const { container } = renderWithEngine(
      <OTPInput engine="modern" length={4} size="lg" value="12" error errorMessage="Required" onChange={() => {}} />,
      'modern'
    );

    const root = (await waitFor(() => {
      const el = container.querySelector('.ds-otp-input.ds-otp-input--modern[data-part="root"]');
      expect(el).not.toBeNull();
      return el;
    })) as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root.getAttribute('style')).toBeNull();

    const slot = container.querySelector('[data-part="slot"]') as HTMLElement;
    expect(slot.getAttribute('style')).toBeNull();
    expect(slot).toHaveAttribute('data-error', 'true');
    expect(slot).toHaveAttribute('data-filled', 'true');

    const errorMessage = container.querySelector('[data-part="error-message"]') as HTMLElement;
    expect(errorMessage).toHaveTextContent('Required');
    expect(errorMessage.getAttribute('style')).toBeNull();
  });
});
