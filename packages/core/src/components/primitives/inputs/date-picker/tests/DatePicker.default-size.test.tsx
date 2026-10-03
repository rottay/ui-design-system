import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { DatePicker as ModernDatePicker } from '../engines/modern';
import { DatePicker as RusticDatePicker } from '../engines/rustic';

describe('DatePicker default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernDatePicker />, 'modern');
    expect(byDefault.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernDatePicker size="md" />, 'modern');
    expect(explicit.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
  });

  it('keeps the rustic size class with no size and with the md step', () => {
    const byDefault = renderWithEngine(<RusticDatePicker />, 'rustic');
    expect(byDefault.container.querySelector('.rottay-datepicker--md')).not.toBeNull();
    byDefault.unmount();

    const explicit = renderWithEngine(<RusticDatePicker size="md" />, 'rustic');
    expect(explicit.container.querySelector('.rottay-datepicker--md')).not.toBeNull();
  });
});
