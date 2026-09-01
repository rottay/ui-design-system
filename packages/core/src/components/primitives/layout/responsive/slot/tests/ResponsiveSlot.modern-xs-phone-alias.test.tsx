import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResponsiveSlot } from '../index';

/**
 * `xs` is contract-documented as the alias of `phone`. The device branch only
 * read phone/tablet/desktop, so mixing the two vocabularies dropped the `xs`
 * payload from the tree entirely.
 */
describe('ResponsiveSlot xs/phone alias', () => {
  it('renders xs content when it is mixed with a device alias', () => {
    render(
      <ResponsiveSlot
        xs={<span data-testid="small">Compact</span>}
        desktop={<span data-testid="wide">Wide</span>}
      />
    );

    expect(screen.getByTestId('small')).toBeInTheDocument();
    expect(screen.getByTestId('wide')).toBeInTheDocument();
  });

  it('cascades the xs payload into the tablet range like phone does', () => {
    render(
      <ResponsiveSlot
        xs={<span data-testid="small">Compact</span>}
        desktop={<span data-testid="wide">Wide</span>}
      />
    );

    // xs+tablet share one boundary, desktop takes the other: two wrappers, not three.
    expect(document.querySelectorAll('[class^="ds-show-"]')).toHaveLength(2);
  });

  it('lets an explicit phone slot win over xs', () => {
    render(
      <ResponsiveSlot
        xs={<span data-testid="alias">Alias</span>}
        phone={<span data-testid="explicit">Explicit</span>}
        desktop={<span data-testid="wide">Wide</span>}
      />
    );

    expect(screen.getByTestId('explicit')).toBeInTheDocument();
    expect(screen.queryByTestId('alias')).not.toBeInTheDocument();
  });

  it('leaves the pure-breakpoint path untouched', () => {
    render(
      <ResponsiveSlot
        xs={<span data-testid="small">Compact</span>}
        lg={<span data-testid="wide">Wide</span>}
      />
    );

    expect(screen.getByTestId('small')).toBeInTheDocument();
    expect(screen.getByTestId('wide')).toBeInTheDocument();
  });
});
