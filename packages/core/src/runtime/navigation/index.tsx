'use client';

/**
 * @fileoverview Navigation link adapter -- framework-agnostic context for
 * injecting an app-specific Link component into DS patterns that render
 * internal routes.
 *
 * @description
 * The DS deliberately does not depend on any router (Next.js, Remix,
 * React Router, TanStack Router, etc.). When a DS pattern needs to render
 * an `href` for an internal app route, it should resolve the link
 * implementation via this context.
 *
 * Usage in an app's root layout:
 *
 * ```tsx
 * import Link from 'next/link';
 * import { NavigationLinkProvider } from '@rottay/design-system';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <NavigationLinkProvider Link={Link}>
 *       {children}
 *     </NavigationLinkProvider>
 *   );
 * }
 * ```
 *
 * Usage inside a DS pattern that renders an href:
 *
 * ```tsx
 * import { useNavigationLink } from '../../../runtime/navigation';
 *
 * function MyPattern({ href }: { href: string }) {
 *   const NavLink = useNavigationLink();
 *   return NavLink ? (
 *     <NavLink href={href}>Open</NavLink>
 *   ) : (
 *     <a href={href}>Open</a>
 *   );
 * }
 * ```
 *
 * The pattern stays framework-agnostic: when no provider is mounted,
 * the consumer falls back to a native `<a>` tag, which still works for
 * navigation but loses any router-specific features (client-side
 * transitions, prefetching, scroll restoration, etc.).
 *
 * @module @rottay/design-system/runtime/navigation
 */

import { createContext, useContext, type ComponentType, type CSSProperties, type ReactNode } from 'react';

/**
 * Props that any consumer-supplied Link component must accept. Designed
 * to match the lowest-common-denominator across Next.js Link, Remix Link,
 * React Router Link, TanStack Router Link, and a plain `<a>` tag.
 */
export interface NavigationLinkProps {
  /** Target route. May be relative or absolute. */
  href: string;
  /** Inner content (text, icon clusters, etc.). */
  children: ReactNode;
  /** Inline styles applied to the rendered anchor. */
  style?: CSSProperties;
  /** Optional className for additional styling. */
  className?: string;
  /** Optional aria-label override. */
  'aria-label'?: string;
  /** Optional title attribute. */
  title?: string;
}

/**
 * The shape of an injected Link component. Apps pass their framework's
 * Link primitive (e.g. Next.js's `Link`, Remix's `Link`, etc.) and the
 * DS patterns render it inline whenever they need to handle an internal
 * `href`.
 */
export type NavigationLinkComponent = ComponentType<NavigationLinkProps>;

const NavigationLinkContext = createContext<NavigationLinkComponent | null>(null);

export interface NavigationLinkProviderProps {
  /** The framework-specific Link component to inject. */
  Link: NavigationLinkComponent;
  children: ReactNode;
}

/**
 * Provider that supplies a framework-specific Link component to DS
 * patterns. Mount once at the app's root layout and DS patterns that
 * need internal navigation will pick it up automatically.
 */
export function NavigationLinkProvider({
  Link,
  children,
}: NavigationLinkProviderProps) {
  return (
    <NavigationLinkContext.Provider value={Link}>
      {children}
    </NavigationLinkContext.Provider>
  );
}

/**
 * Hook for DS patterns to read the consumer-supplied Link component.
 * Returns `null` when no provider is mounted; in that case the pattern
 * should fall back to a native `<a>` tag (or omit the link entirely).
 */
export function useNavigationLink(): NavigationLinkComponent | null {
  return useContext(NavigationLinkContext);
}
