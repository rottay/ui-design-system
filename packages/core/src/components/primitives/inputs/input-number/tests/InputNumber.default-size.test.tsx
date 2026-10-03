import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { InputNumber as ModernInputNumber } from '../engines/modern';
import { InputNumber as RusticInputNumber } from '../engines/rustic';

describe('InputNumber default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernInputNumber />, 'modern');
    expect(byDefault.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernInputNumber size="md" />, 'modern');
    expect(explicit.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
  });

  it('keeps the rustic size class with no size and with the md step', () => {
    const byDefault = renderWithEngine(<RusticInputNumber />, 'rustic');
    expect(byDefault.container.querySelector('.rottay-inputnumber--md')).not.toBeNull();
    byDefault.unmount();

    const explicit = renderWithEngine(<RusticInputNumber size="md" />, 'rustic');
    expect(explicit.container.querySelector('.rottay-inputnumber--md')).not.toBeNull();
  });
});
