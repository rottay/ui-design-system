import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ModernButton from '../engines/modern';

const root = (container: HTMLElement) => container.querySelector('button') as HTMLButtonElement;

describe('Modern Button quiet destructive tone', () => {
  it('keeps an explicitly requested quiet variant and stamps the destructive tone', () => {
    const { container } = render(
      <ModernButton danger variant="ghost">
        Delete
      </ModernButton>
    );

    expect(root(container)).toHaveAttribute('data-variant', 'ghost');
    expect(root(container)).toHaveAttribute('data-tone', 'danger');
  });

  it('resolves the solid danger recipe when no variant was requested', () => {
    const { container } = render(<ModernButton danger>Delete</ModernButton>);

    expect(root(container)).toHaveAttribute('data-variant', 'danger');
    expect(root(container)).not.toHaveAttribute('data-tone');
  });

  it('resolves the solid danger recipe on a solid variant request', () => {
    const { container } = render(
      <ModernButton danger variant="primary">
        Delete
      </ModernButton>
    );

    expect(root(container)).toHaveAttribute('data-variant', 'danger');
    expect(root(container)).not.toHaveAttribute('data-tone');
  });

  it('leaves a quiet variant untoned when danger is absent', () => {
    const { container } = render(<ModernButton variant="text">Cancel</ModernButton>);

    expect(root(container)).toHaveAttribute('data-variant', 'text');
    expect(root(container)).not.toHaveAttribute('data-tone');
  });
});

describe('Modern Button width-stable busy reserve', () => {
  it('reserves the busy row as well as the resting row so the longer state cannot truncate', () => {
    const { container } = render(
      <ModernButton pending pendingLabel="Submitting your application">
        Send
      </ModernButton>
    );

    const reserves = container.querySelectorAll('[data-part="content"][data-layer="reserve"]');
    expect(reserves).toHaveLength(2);

    const busyReserve = container.querySelector('[data-reserve="busy"]');
    expect(busyReserve).not.toBeNull();
    expect(busyReserve).toHaveTextContent('Submitting your application');
    // The reserve exists only to size the frame; it must stay out of the a11y tree.
    expect(busyReserve).toHaveAttribute('aria-hidden', 'true');
  });

  it('falls back to the resting label when no busy label override is given (R1 unit 1, item 3/G8)', () => {
    // Changed on purpose: a `pending` button used to go spinner-only when no
    // `pendingLabel` was passed. G8 ("conserva la etiqueta visible cuando
    // existe") keeps the resting label visible next to the spinner instead,
    // so the busy row is now also reserved and populated with that label.
    const { container } = render(<ModernButton pending>Send</ModernButton>);

    expect(
      container.querySelectorAll('[data-part="content"][data-layer="reserve"]')
    ).toHaveLength(2);
    const busyReserve = container.querySelector('[data-reserve="busy"]');
    expect(busyReserve).not.toBeNull();
    expect(busyReserve).toHaveTextContent('Send');
    expect(container.querySelector('[data-part="busy-content"]')).toHaveTextContent('Send');
  });
});
