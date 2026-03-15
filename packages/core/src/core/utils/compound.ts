/**
 * Component Composition Helpers
 *
 * Utilities for building compound components following the
 * sub-component pattern (e.g., Menu.Item, Tabs.Panel).
 */

import type { ComponentPropsWithRef, ElementType, FC } from 'react';

/**
 * Create a sub-component with a proper displayName for DevTools.
 *
 * @example
 * ```tsx
 * import { createSubComponent } from '@rottay/design-system';
 *
 * interface ItemProps {
 *   label: string;
 *   value: string;
 * }
 *
 * const MenuItem = createSubComponent<ItemProps>('Menu.Item', ({ label, value }) => {
 *   return <li data-value={value}>{label}</li>;
 * });
 * ```
 *
 * @param displayName - The name shown in React DevTools
 * @param component - The functional component
 * @returns The same component with displayName set
 */
export function createSubComponent<P extends Record<string, unknown>>(
  displayName: string,
  component: FC<P>
): FC<P> {
  component.displayName = displayName;
  return component;
}

/**
 * Attach sub-components to a parent component in a type-safe way.
 *
 * @example
 * ```tsx
 * import { createCompoundComponent, createSubComponent } from '@rottay/design-system';
 *
 * const MenuRoot: FC<MenuProps> = ({ children }) => <ul>{children}</ul>;
 * const MenuItem = createSubComponent<ItemProps>('Menu.Item', ({ label }) => <li>{label}</li>);
 * const MenuDivider = createSubComponent<{}>('Menu.Divider', () => <hr />);
 *
 * const Menu = createCompoundComponent(MenuRoot, {
 *   Item: MenuItem,
 *   Divider: MenuDivider,
 * });
 *
 * // Usage: <Menu><Menu.Item label="Save" /></Menu>
 * ```
 *
 * @param parent - The parent component
 * @param subs - Object mapping sub-component names to their implementations
 * @returns The parent component with sub-components attached
 */
export function createCompoundComponent<
  TParent extends FC<any>,
  TSubs extends Record<string, FC<any>>
>(parent: TParent, subs: TSubs): TParent & TSubs {
  return Object.assign(parent, subs);
}

/**
 * Type helper for creating polymorphic components that accept an `as` prop.
 *
 * @example
 * ```tsx
 * import { PolymorphicProps } from '@rottay/design-system';
 *
 * interface TextOwnProps {
 *   size?: 'sm' | 'md' | 'lg';
 *   weight?: 'normal' | 'bold';
 * }
 *
 * type TextProps<E extends ElementType = 'span'> = PolymorphicProps<E, TextOwnProps>;
 *
 * function Text<E extends ElementType = 'span'>({
 *   as,
 *   size = 'md',
 *   weight = 'normal',
 *   ...rest
 * }: TextProps<E>) {
 *   const Component = as || 'span';
 *   return <Component data-size={size} data-weight={weight} {...rest} />;
 * }
 *
 * // Usage: <Text as="h1" size="lg">Title</Text>
 * ```
 */
export type PolymorphicProps<E extends ElementType, P = {}> = P &
  Omit<ComponentPropsWithRef<E>, keyof P> & { as?: E };
