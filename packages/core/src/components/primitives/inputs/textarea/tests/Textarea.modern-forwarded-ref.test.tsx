/** The forwarded ref must not arrive via ...rest, or it overwrites the internal one. */
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Textarea } from '../index';
import { renderWithEngine } from '@tests/support/engine';

describe('Modern Textarea forwarded ref', () => {
  it('delivers the forwarded ref to the real textarea element', async () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    renderWithEngine(<Textarea ref={ref} defaultValue="one" />, 'modern');

    const ta = await screen.findByRole('textbox');
    expect(ta.tagName).toBe('TEXTAREA');
    await waitFor(() => expect(ref.current).toBe(ta));
  });

  it('still measures autoSize when a consumer forwards its own ref', async () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => 74,
    });

    renderWithEngine(<Textarea ref={ref} autoSize defaultValue={'a\nb\nc'} />, 'modern');
    const ta = (await screen.findByRole('textbox')) as HTMLTextAreaElement;

    // the internal ref survived, so the measurement wrote inline geometry
    await waitFor(() => expect(ta.style.blockSize).not.toBe(''));
    expect(ta.style.overflowY).toBe('hidden');
    expect(ref.current).toBe(ta);

    delete (HTMLTextAreaElement.prototype as unknown as Record<string, unknown>).scrollHeight;
  });
});
