import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { TimePicker as ModernTimePicker } from '../engines/modern';
import { TimePicker as RusticTimePicker } from '../engines/rustic';

describe('TimePicker default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernTimePicker />, 'modern');
    expect(byDefault.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernTimePicker size="md" />, 'modern');
    expect(explicit.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
  });

  it('keeps the rustic size class with no size and with the md step', () => {
    const byDefault = renderWithEngine(<RusticTimePicker />, 'rustic');
    expect(byDefault.container.querySelector('.rottay-timepicker--md')).not.toBeNull();
    byDefault.unmount();

    const explicit = renderWithEngine(<RusticTimePicker size="md" />, 'rustic');
    expect(explicit.container.querySelector('.rottay-timepicker--md')).not.toBeNull();
  });
});
