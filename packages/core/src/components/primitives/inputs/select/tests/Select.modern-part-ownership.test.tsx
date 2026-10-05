import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernSelect from '../engines/modern';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
];

// The engine's data-part='trigger' outranks a caller's data-part on both paths,
// so the skin keys the native select and its own arrow stays the only one.
describe('Select modern part ownership', () => {
  it('keeps the trigger part on the native select under a caller data-part', () => {
    const { container } = render(
      <ModernSelect data-part="field-input" data-testid="caller" aria-invalid options={OPTIONS} />
    );
    const native = container.querySelector('select');
    expect(native).toHaveAttribute('data-part', 'trigger');
    expect(native).toHaveAttribute('data-testid', 'caller');
    expect(native).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelectorAll('[data-part="native-arrow"]')).toHaveLength(1);
  });

  it('keeps the trigger part on the custom trigger under a caller data-part', () => {
    const { container } = render(<ModernSelect data-part="field-input" searchable options={OPTIONS} />);
    expect(container.querySelector('[role="combobox"]')).toHaveAttribute('data-part', 'trigger');
  });
});
