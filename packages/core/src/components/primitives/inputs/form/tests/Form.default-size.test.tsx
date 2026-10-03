import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithEngine } from '@tests/support/engine';
import { Form as ModernForm } from '../engines/modern';
import { Form as RusticForm } from '../engines/rustic';

describe('Form default size', () => {
  it('stamps the same modern data-size with no size as with the md step', () => {
    const byDefault = renderWithEngine(<ModernForm name="profile">content</ModernForm>, 'modern');
    expect(byDefault.container.querySelector('form')?.getAttribute('data-size')).toBe('md');
    byDefault.unmount();

    const explicit = renderWithEngine(<ModernForm name="profile" size="md">content</ModernForm>, 'modern');
    expect(explicit.container.querySelector('form')?.getAttribute('data-size')).toBe('md');
  });

  it('renders the same rustic markup with no size as with the md step', () => {
    const byDefault = renderWithEngine(
      <RusticForm name="profile">
        <RusticForm.Item name="nickname" label="Nickname">
          <input />
        </RusticForm.Item>
      </RusticForm>,
      'rustic',
    );
    const defaultMarkup = byDefault.container.querySelector('form')?.outerHTML;
    byDefault.unmount();

    const explicit = renderWithEngine(
      <RusticForm name="profile" size="md">
        <RusticForm.Item name="nickname" label="Nickname">
          <input />
        </RusticForm.Item>
      </RusticForm>,
      'rustic',
    );
    expect(defaultMarkup).toBeTruthy();
    expect(explicit.container.querySelector('form')?.outerHTML).toBe(defaultMarkup);
  });
});
