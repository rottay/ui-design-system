'use client';

/**
 * @fileoverview ResponsiveSlot Component - Rottay Design System
 * @description CSS-first responsive content swapping component. Unlike Show/Hide
 * which control visibility of the SAME content, ResponsiveSlot renders DIFFERENT
 * content at different breakpoints. Uses the responsive family's shared
 * visibility runtime so everything works without JavaScript via server-rendered
 * CSS media queries.
 *
 * @remarks
 * ResponsiveSlot accepts two sets of breakpoint props:
 * - Device aliases: `phone`, `tablet`, `desktop`
 * - Standard breakpoints: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
 *
 * Content cascades like CSS: if no `tablet` is provided, the `phone` content
 * is shown on tablet-sized viewports. If no `desktop` is provided, `tablet`
 * content is used (or `phone` if neither exists).
 *
 * Standard breakpoints follow the same cascade: if `md` is not provided,
 * `sm` content is shown (or `xs` if `sm` is also absent).
 *
 * @example Device aliases
 * ```tsx
 * <ResponsiveSlot
 *   phone={<MobileNav />}
 *   tablet={<TabletNav />}
 *   desktop={<DesktopNav />}
 * />
 * ```
 *
 * @example With fallback (no tablet slot falls back to phone)
 * ```tsx
 * <ResponsiveSlot
 *   phone={<CompactLayout />}
 *   desktop={<WideLayout />}
 * />
 * ```
 *
 * @example Standard breakpoints
 * ```tsx
 * <ResponsiveSlot
 *   xs={<TinyView />}
 *   md={<MediumView />}
 *   xl={<LargeView />}
 * />
 * ```
 *
 * @see {@link Show} - Underlying visibility primitive
 * @see {@link Hide} - Inverse visibility primitive
 * @module ResponsiveSlot
 * @category Layout
 * @package @rottay/design-system
 */

import React from 'react';
import { ResponsiveVisibility } from '../runtime/visibility';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ResponsiveSlotProps {
  /** Content to render on phone-sized viewports (0 -- 639px). */
  phone?: React.ReactNode;
  /** Content to render on tablet-sized viewports (640 -- 1023px). */
  tablet?: React.ReactNode;
  /** Content to render on desktop-sized viewports (1024px+). */
  desktop?: React.ReactNode;
  /** Content to render at xs breakpoint (0px+). Alias for phone. */
  xs?: React.ReactNode;
  /** Content to render from sm breakpoint (640px+). */
  sm?: React.ReactNode;
  /** Content to render from md breakpoint (768px+). */
  md?: React.ReactNode;
  /** Content to render from lg breakpoint (1024px+). */
  lg?: React.ReactNode;
  /** Content to render from xl breakpoint (1280px+). */
  xl?: React.ReactNode;
  /** Content to render from 2xl breakpoint (1536px+). */
  '2xl'?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Determines whether device-alias props or standard breakpoint props are
 * being used. Device aliases take precedence when any of phone/tablet/desktop
 * are provided.
 */
function usesDeviceAliases(props: ResponsiveSlotProps): boolean {
  return props.phone !== undefined || props.tablet !== undefined || props.desktop !== undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * CSS-first responsive content swapping component.
 *
 * Renders different React nodes at different viewport sizes using shared
 * CSS-first visibility boundaries. All variants are server-rendered with CSS media
 * queries controlling which one is visible, so there is no layout shift
 * or flash of wrong content.
 */
export function ResponsiveSlot(props: ResponsiveSlotProps): React.ReactElement | null {
  if (usesDeviceAliases(props)) {
    return renderDeviceSlots(props);
  }
  return renderBreakpointSlots(props);
}

ResponsiveSlot.displayName = 'ResponsiveSlot';

// ---------------------------------------------------------------------------
// Device-alias rendering (phone / tablet / desktop)
// ---------------------------------------------------------------------------

/**
 * Renders slots using device-alias breakpoints with cascade:
 * - phone: always the base
 * - tablet: falls back to phone
 * - desktop: falls back to tablet, then phone
 */
function renderDeviceSlots(props: ResponsiveSlotProps): React.ReactElement {
  const { phone, tablet, desktop } = props;

  const phoneContent = phone;
  const tabletContent = tablet ?? phone;
  const desktopContent = desktop ?? tablet ?? phone;

  // Optimization: if all three resolve to the same content, render without
  // any Show wrappers since the content is identical at all sizes.
  if (phoneContent === tabletContent && tabletContent === desktopContent) {
    if (phoneContent === undefined) return <></>;
    return <>{phoneContent}</>;
  }

  // Optimization: if only two unique values exist, use a single breakpoint
  // split instead of three Show wrappers.
  if (phoneContent === tabletContent && tabletContent !== desktopContent) {
    // phone + tablet share content, desktop is different
    return (
      <>
        <ResponsiveVisibility mode="show" below="desktop">{phoneContent}</ResponsiveVisibility>
        <ResponsiveVisibility mode="show" from="desktop">{desktopContent}</ResponsiveVisibility>
      </>
    );
  }

  if (tabletContent === desktopContent && phoneContent !== tabletContent) {
    // tablet + desktop share content, phone is different
    return (
      <>
        <ResponsiveVisibility mode="show" on="phone">{phoneContent}</ResponsiveVisibility>
        <ResponsiveVisibility mode="show" from="tablet">{tabletContent}</ResponsiveVisibility>
      </>
    );
  }

  // All three are different
  return (
    <>
      <ResponsiveVisibility mode="show" on="phone">{phoneContent}</ResponsiveVisibility>
      <ResponsiveVisibility mode="show" on="tablet">{tabletContent}</ResponsiveVisibility>
      <ResponsiveVisibility mode="show" on="desktop">{desktopContent}</ResponsiveVisibility>
    </>
  );
}

// ---------------------------------------------------------------------------
// Standard breakpoint rendering (xs / sm / md / lg / xl / 2xl)
// ---------------------------------------------------------------------------

/** Ordered list of standard breakpoint keys. */
const BREAKPOINT_ORDER = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

type StandardBreakpointKey = (typeof BREAKPOINT_ORDER)[number];

/** Map of breakpoint keys to the Show `from` prop values. */
const FROM_MAP: Record<StandardBreakpointKey, 'sm' | 'md' | 'lg' | 'xl' | '2xl' | undefined> = {
  xs: undefined, // xs starts at 0, no `from` needed (below sm)
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl',
};

/**
 * Renders slots using standard breakpoints with cascade.
 * Each breakpoint inherits from the nearest smaller breakpoint that has content.
 *
 * Groups consecutive breakpoints that resolve to the same content to minimize
 * the number of Show wrappers in the DOM.
 */
function renderBreakpointSlots(props: ResponsiveSlotProps): React.ReactElement {
  // Build the resolved content for each breakpoint (with cascade)
  const resolved: { key: StandardBreakpointKey; content: React.ReactNode }[] = [];
  let lastContent: React.ReactNode = undefined;

  for (const bp of BREAKPOINT_ORDER) {
    const explicit = props[bp];
    if (explicit !== undefined) {
      lastContent = explicit;
    }
    resolved.push({ key: bp, content: lastContent });
  }

  // Group consecutive breakpoints with the same content
  const groups: { from: StandardBreakpointKey; below: StandardBreakpointKey | null; content: React.ReactNode }[] = [];
  let currentGroup: { from: StandardBreakpointKey; content: React.ReactNode } | null = null;

  for (const { key, content } of resolved) {
    if (currentGroup === null || currentGroup.content !== content) {
      if (currentGroup !== null) {
        groups.push({ from: currentGroup.from, below: key, content: currentGroup.content });
      }
      currentGroup = { from: key, content };
    }
  }
  // Close the last group (extends to infinity -- no `below`)
  if (currentGroup !== null) {
    groups.push({ from: currentGroup.from, below: null, content: currentGroup.content });
  }

  // Filter out groups with undefined content (no slot provided at any breakpoint in range)
  const validGroups = groups.filter((g) => g.content !== undefined);

  if (validGroups.length === 0) {
    return <></>;
  }

  // If only one group covers the full range, render without Show
  if (validGroups.length === 1 && validGroups[0].from === 'xs' && validGroups[0].below === null) {
    return <>{validGroups[0].content}</>;
  }

  return (
    <>
      {validGroups.map((group, idx) => {
        const fromProp = FROM_MAP[group.from];
        const belowProp = group.below ? FROM_MAP[group.below] : undefined;

        // xs with a below: use Show below={...}
        if (group.from === 'xs' && belowProp) {
          return (
            <ResponsiveVisibility key={idx} mode="show" below={belowProp}>
              {group.content}
            </ResponsiveVisibility>
          );
        }

        // Last group (no upper bound): use Show from={...}
        if (!belowProp && fromProp) {
          return (
            <ResponsiveVisibility key={idx} mode="show" from={fromProp}>
              {group.content}
            </ResponsiveVisibility>
          );
        }

        // Middle groups need both from and below -- Show doesn't support both
        // simultaneously, so we nest: Show from={lower} wrapping a Hide from={upper}
        if (fromProp && belowProp) {
          return (
            <ResponsiveVisibility key={idx} mode="show" from={fromProp}>
              <ResponsiveVisibility mode="show" below={belowProp}>{group.content}</ResponsiveVisibility>
            </ResponsiveVisibility>
          );
        }

        // Fallback: xs with no upper bound (single group covering everything)
        return <React.Fragment key={idx}>{group.content}</React.Fragment>;
      })}
    </>
  );
}
