import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { TreeSelect as ModernTreeSelect } from '../engines/modern';
import { TreeSelect as RusticTreeSelect } from '../engines/rustic';

describe('TreeSelect default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernTreeSelect treeData={[]} />, 'modern');
    expect(byDefault.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('middle');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernTreeSelect treeData={[]} size="md" />, 'modern');
    expect(explicit.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('middle');
  });

  it('keeps the rustic size class with no size and with the md step', () => {
    const byDefault = renderWithEngine(<RusticTreeSelect treeData={[]} />, 'rustic');
    expect(byDefault.container.querySelector('.rottay-treeselect--middle')).not.toBeNull();
    byDefault.unmount();

    const explicit = renderWithEngine(<RusticTreeSelect treeData={[]} size="md" />, 'rustic');
    expect(explicit.container.querySelector('.rottay-treeselect--middle')).not.toBeNull();
  });
});
