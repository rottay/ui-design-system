/** @fileoverview RecordField copy-to-clipboard confirm feedback (copy -> check morph). */

import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RecordField } from '../content';
import { renderWithEngine } from '../../../../tooling/testing/helpers/engine';

function stubClipboard(): ReturnType<typeof vi.fn> {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  return writeText;
}

describe('RecordField copy confirm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies the value and flips the affordance to a confirmed state on click', async () => {
    const writeText = stubClipboard();
    const { container } = renderWithEngine(
      <RecordField label="Reference" value="REC-1" copyValue="REC-1" />,
      'modern',
    );

    const button = await waitFor(() => {
      const found = container.querySelector('button[aria-label="Copy reference"]');
      if (!found) throw new Error('copy button not found');
      return found as HTMLButtonElement;
    });

    fireEvent.click(button);

    expect(writeText).toHaveBeenCalledWith('REC-1');
    // The affordance now reports the confirmed state (icon morphs copy -> check).
    await waitFor(() => {
      expect(container.querySelector('button[aria-label="Copied reference"]')).not.toBeNull();
    });
    expect(container.querySelector('button[aria-label="Copy reference"]')).toBeNull();
  });

  it('renders no copy affordance when the field has no copyValue', async () => {
    const { container } = renderWithEngine(
      <RecordField label="Reference" value="REC-1" />,
      'modern',
    );

    // Wait for the field to render, then assert the copy affordance is absent.
    await waitFor(() => {
      expect(container.querySelector('[data-part="field-value"]')).not.toBeNull();
    });
    expect(container.querySelector('button[aria-label^="Copy"]')).toBeNull();
  });
});
