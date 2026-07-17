import type { FC, ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import {
  createCompoundComponent,
  createSubComponent,
  type PolymorphicProps,
} from '..';

describe('React compound-component adapters', () => {
  it('keeps the component identity while assigning a useful display name', () => {
    const Item: FC<{ value: string }> = () => null;

    expect(createSubComponent('Menu.Item', Item)).toBe(Item);
    expect(Item.displayName).toBe('Menu.Item');
  });

  it('attaches sub-components without replacing the parent component', () => {
    const Root: FC<{ children?: ReactNode }> = ({ children }) => children;
    const Item: FC<{ value: string }> = () => null;

    const Compound = createCompoundComponent(Root, { Item });

    expect(Compound).toBe(Root);
    expect(Compound.Item).toBe(Item);
  });

  it('preserves native props in the polymorphic type contract', () => {
    const props: PolymorphicProps<'a', { tone?: 'muted' }> = {
      as: 'a',
      href: '/docs',
      tone: 'muted',
    };

    expect(props.href).toBe('/docs');
    expect(props.tone).toBe('muted');
  });
});
