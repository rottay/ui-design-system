/**
 * A native <progress> carries no implicit accessible name, so the line type
 * needs the same fallback the circle type already has.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';

import ModernProgress from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

describe('Progress modern engine accessible name', () => {
  it('line: names the determinate meter without an explicit aria-label', () => {
    const { container } = renderWithEngine(<ModernProgress percent={42} />, 'modern');

    const meter = container.querySelector('progress[data-part="fill"]') as HTMLElement;
    expect(meter).toBeTruthy();
    expect(meter.getAttribute('aria-label')).toBe('42% complete');
  });

  it('line: names the indeterminate meter without an explicit aria-label', () => {
    const { container } = renderWithEngine(<ModernProgress percent={0} indeterminate />, 'modern');

    const meter = container.querySelector('progress[data-part="fill"]') as HTMLElement;
    expect(meter.getAttribute('aria-label')).toBe('In progress');
  });

  it('line: an explicit aria-label still wins over the fallback', () => {
    const { container } = renderWithEngine(
      <ModernProgress percent={42} aria-label="Upload progress" />,
      'modern',
    );

    const meter = container.querySelector('progress[data-part="fill"]') as HTMLElement;
    expect(meter.getAttribute('aria-label')).toBe('Upload progress');
  });
});
