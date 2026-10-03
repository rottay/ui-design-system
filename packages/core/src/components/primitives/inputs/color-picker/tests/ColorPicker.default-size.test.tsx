import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { ColorPicker as ModernColorPicker } from '../engines/modern';
import { ColorPicker as RusticColorPicker } from '../engines/rustic';

describe('ColorPicker default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernColorPicker />, 'modern');
    expect(byDefault.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('middle');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernColorPicker size="md" />, 'modern');
    expect(explicit.container.querySelector('[data-size]')?.getAttribute('data-size')).toBe('middle');
  });

  it('keeps the rustic size class with no size and with the md step', () => {
    const byDefault = renderWithEngine(<RusticColorPicker />, 'rustic');
    expect(byDefault.container.querySelector('.rottay-colorpicker--middle')).not.toBeNull();
    byDefault.unmount();

    const explicit = renderWithEngine(<RusticColorPicker size="md" />, 'rustic');
    expect(explicit.container.querySelector('.rottay-colorpicker--middle')).not.toBeNull();
  });
});
