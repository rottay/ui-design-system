/**
 * An open tour's portaled chrome follows a live inline `--ds-*` change on its
 * scope lineage, with no scope attribute change to force a re-snapshot.
 */
import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ModernTour from '../engines/modern';

const flushMutations = () => act(async () => {
  await Promise.resolve();
});

afterEach(() => {
  cleanup();
  document.getElementById('rottay-portal-root')?.remove();
});

describe('Tour modern -- live portal variables', () => {
  it('re-stamps an ancestor inline --ds-* flip onto the open tour root', async () => {
    const { getByTestId } = render(
      <div data-ds-root="" data-tenant="acme" data-density="comfortable">
        <div data-testid="shell" style={{ '--ds-command-palette-search-gap': '6px' } as React.CSSProperties}>
          <ModernTour open steps={[{ title: 'Welcome', description: 'Start here' }]} />
        </div>
      </div>,
    );
    await flushMutations();
    const root = document.querySelector<HTMLElement>('.ds-tour--modern[data-part="root"]')!;
    const read = () => root.style.getPropertyValue('--ds-command-palette-search-gap');
    expect(read()).toBe('6px');

    const shell = getByTestId('shell');
    shell.style.setProperty('--ds-command-palette-search-gap', '61px');
    await flushMutations();

    expect(root.getAttribute('data-density')).toBe('comfortable');
    expect(read()).toBe('61px');
  });
});
