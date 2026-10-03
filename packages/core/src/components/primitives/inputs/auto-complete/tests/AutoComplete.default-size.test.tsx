import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { AutoComplete as ModernAutoComplete } from '../engines/modern';
import { AutoComplete as RusticAutoComplete } from '../engines/rustic';

describe('AutoComplete default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernAutoComplete options={[]} />, 'modern');
    expect(byDefault.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernAutoComplete options={[]} size="md" />, 'modern');
    expect(explicit.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('md');
  });

  it('keeps the rustic size class with no size and with the md step', () => {
    const byDefault = renderWithEngine(<RusticAutoComplete options={[]} />, 'rustic');
    expect(byDefault.container.querySelector('.rottay-autocomplete--middle')).not.toBeNull();
    byDefault.unmount();

    const explicit = renderWithEngine(<RusticAutoComplete options={[]} size="md" />, 'rustic');
    expect(explicit.container.querySelector('.rottay-autocomplete--middle')).not.toBeNull();
  });
});
