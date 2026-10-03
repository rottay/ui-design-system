import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Cascader as ModernCascader } from '../engines/modern';
import { Cascader as RusticCascader } from '../engines/rustic';

describe('Cascader default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernCascader options={[]} />, 'modern');
    expect(byDefault.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('middle');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernCascader options={[]} size="md" />, 'modern');
    expect(explicit.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('middle');
  });

  it('keeps the rustic size class with no size and with the md step', () => {
    const byDefault = renderWithEngine(<RusticCascader options={[]} />, 'rustic');
    expect(byDefault.container.querySelector('.rottay-cascader--middle')).not.toBeNull();
    byDefault.unmount();

    const explicit = renderWithEngine(<RusticCascader options={[]} size="md" />, 'rustic');
    expect(explicit.container.querySelector('.rottay-cascader--middle')).not.toBeNull();
  });
});
