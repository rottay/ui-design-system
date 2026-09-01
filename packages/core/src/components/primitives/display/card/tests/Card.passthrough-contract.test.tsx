/**
 * Pass-through honesty law contract (audit SKN-02): engines win on `data-part`;
 * callers win on `id`, `aria-*`, and every other `data-*` attribute. Each
 * engine must forward the caller's passthrough to the root DOM element it owns
 * and stamp its own `data-part` after it, so the engine part always survives.
 * The law is documented on `BaseComponentProps` in
 * `foundation/contracts/kernel/common`.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ClassicCard from '../engines/classic';
import ModernCard from '../engines/modern';
import RusticCard from '../engines/rustic';

const passthrough = {
  id: 'caller-card-id',
  'aria-label': 'Caller label',
  'data-custom': 'caller-data',
  // The one attribute the caller must NOT win: the engine re-stamps its part.
  'data-part': 'caller-part-attempt',
} as const;

describe('Card pass-through honesty law', () => {
  it('modern: forwards id/aria-label/data-* to the root and keeps the engine data-part', () => {
    const { container } = render(
      <ModernCard title="Modern" {...passthrough}>
        Content
      </ModernCard>
    );

    const root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root).toHaveAttribute('id', 'caller-card-id');
    expect(root).toHaveAttribute('aria-label', 'Caller label');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  it('modern: the loading branch root obeys the same law', () => {
    const { container } = render(
      <ModernCard title="Modern" loading {...passthrough}>
        Content
      </ModernCard>
    );

    const root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root).toHaveAttribute('id', 'caller-card-id');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  it('rustic: forwards id/aria-label/data-* to the root and keeps the engine data-part', () => {
    const { container } = render(
      <RusticCard title="Rustic" {...passthrough}>
        Content
      </RusticCard>
    );

    const root = container.querySelector('.rottay-card--rustic') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root).toHaveAttribute('id', 'caller-card-id');
    expect(root).toHaveAttribute('aria-label', 'Caller label');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  it('classic: forwards id/aria-label/data-* through AntD and stamps data-part="root"', () => {
    const { container } = render(
      <ClassicCard title="Classic" {...passthrough}>
        Content
      </ClassicCard>
    );

    const root = container.querySelector('.rottay-card--classic') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root).toHaveAttribute('id', 'caller-card-id');
    expect(root).toHaveAttribute('aria-label', 'Caller label');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  it('never leaks non-DOM contract props (selection/extension fields) as attributes', () => {
    const { container } = render(
      <ModernCard title="Modern" selectable selected backgroundColor="#fff">
        Content
      </ModernCard>
    );

    const root = container.querySelector('.ds-card--modern') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.hasAttribute('selectable')).toBe(false);
    expect(root.hasAttribute('selected')).toBe(false);
    expect(root.hasAttribute('backgroundColor')).toBe(false);
    expect(root.hasAttribute('backgroundcolor')).toBe(false);
  });
});
