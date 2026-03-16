/**
 * @fileoverview Anchor Classic Engine - Rottay Design System
 * @description Ant Design implementation of the Anchor component.
 * The primary, full-featured engine for enterprise applications.
 *
 * @remarks
 * **Engine Overview:**
 * Classic is the default engine in the Rottay Design System, built on
 * Ant Design. It provides the most complete feature set including:
 * - Smooth scroll animations with easing
 * - Ink indicator showing active section
 * - Native affix/sticky support
 * - RTL (Right-to-Left) support
 *
 * **When to Use Classic:**
 * - Enterprise applications requiring full feature set
 * - Projects already using Ant Design
 * - When bundle size is not a primary concern
 * - When you need advanced features like ink indicator
 *
 * **Multi-Tenant Theming:**
 * Classic anchors inherit Ant Design's theme tokens which can be
 * customized per tenant via the ConfigProvider or CSS variables.
 *
 * **Direction Support:**
 * | Direction | Description |
 * |-----------|-------------|
 * | vertical | Traditional sidebar navigation (default) |
 * | horizontal | Tab-like horizontal layout |
 *
 * @example Basic Usage
 * ```tsx
 * import { Anchor } from '@rottay/design-system';
 *
 * // Classic is the default engine
 * <Anchor>
 *   <Anchor.Link href="#section1" title="Section 1" />
 *   <Anchor.Link href="#section2" title="Section 2" />
 * </Anchor>
 * ```
 *
 * @example Explicit Engine Selection
 * ```tsx
 * <Anchor engine="classic">
 *   <Anchor.Link href="#section" title="Section" />
 * </Anchor>
 * ```
 *
 * @example With All Features
 * ```tsx
 * <Anchor
 *   offsetTop={80}
 *   bounds={5}
 *   affix={true}
 *   showInkInFixed={true}
 *   direction="vertical"
 *   onChange={(key) => console.log('Active:', key)}
 *   onClick={(e, link) => console.log('Clicked:', link)}
 * >
 *   <Anchor.Link href="#intro" title="Introduction" />
 *   <Anchor.Link href="#features" title="Features">
 *     <Anchor.Link href="#feature-1" title="Feature 1" />
 *     <Anchor.Link href="#feature-2" title="Feature 2" />
 *   </Anchor.Link>
 * </Anchor>
 * ```
 *
 * @see {@link AnchorProps} - Component props interface
 * @see {@link ModernAnchor} - DaisyUI alternative
 * @see {@link RusticAnchor} - Vanilla alternative
 * @see {@link https://ant.design/components/anchor} - Ant Design Anchor docs
 * @module Anchor/Engines/Classic
 * @category Navigation
 * @package @rottay/design-system
 */

'use client';

import React from 'react';
import { Anchor as AntAnchor } from 'antd';
import type { AnchorProps, AnchorLinkProps } from '../Anchor.types';

// ============================================================================
// Anchor Component
// ============================================================================

/**
 * Classic Engine implementation of the Anchor component.
 *
 * @description
 * Wraps Ant Design's Anchor component with Rottay's standardized props API.
 * Provides enterprise-grade anchor navigation with full accessibility support.
 *
 * @remarks
 * **Key Features:**
 * - Ink indicator animation showing active section
 * - Native affix support for sticky positioning
 * - Configurable scroll container
 * - Smooth scroll to target sections
 *
 * **Prop Mappings to Ant Design:**
 * | Rottay Prop | Ant Design Prop |
 * |-------------|-----------------|
 * | activeKey | getCurrentAnchor |
 * | offsetTop | offsetTop |
 * | offsetBottom | targetOffset |
 * | bounds | bounds |
 * | affix | affix |
 *
 * @param props - {@link AnchorProps}
 * @param _ref - Forwarded ref (not used by Ant Design)
 * @returns The rendered Ant Design Anchor
 *
 * @example
 * ```tsx
 * <Anchor
 *   offsetTop={80}
 *   affix={true}
 *   onChange={(key) => setActiveSection(key)}
 * >
 *   <Anchor.Link href="#overview" title="Overview" />
 *   <Anchor.Link href="#api" title="API Reference" />
 * </Anchor>
 * ```
 */
export const Anchor = React.forwardRef<HTMLDivElement, AnchorProps>(
  (props, _ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const {
      getContainer,
      activeKey,
      offsetTop,
      offsetBottom,
      bounds,
      showInkInFixed,
      onChange,
      onClick,
      direction,
      affix,
      children,
      className,
      style,
    } = props;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    // getCurrentAnchor overrides AntD's built-in scroll detection with
    // our controlled activeKey, enabling parent-driven active state.
    // offsetBottom maps to targetOffset because AntD uses that name for
    // the pixel threshold that triggers section activation.
    return (
      <AntAnchor
        getContainer={getContainer}
        getCurrentAnchor={activeKey ? () => activeKey : undefined}
        offsetTop={offsetTop}
        targetOffset={offsetBottom}
        bounds={bounds}
        showInkInFixed={showInkInFixed}
        onChange={onChange}
        onClick={onClick}
        direction={direction}
        affix={affix}
        className={className}
        style={style}
      >
        {children}
      </AntAnchor>
    );
  }
);
Anchor.displayName = 'Anchor.Classic';

// ============================================================================
// Link Component
// ============================================================================

/**
 * Classic Engine implementation of the Anchor.Link component.
 *
 * @description
 * Wraps Ant Design's Anchor.Link component for navigation items.
 * Creates clickable links that scroll to target sections.
 *
 * @remarks
 * - Automatically inherits styling from parent Anchor
 * - Supports nested children for hierarchical navigation
 * - Includes hover and active state styling
 *
 * @param props - {@link AnchorLinkProps}
 * @param _ref - Forwarded ref (not used by Ant Design)
 * @returns The rendered Ant Design Anchor.Link
 *
 * @example
 * ```tsx
 * <Link href="#section" title="Section Title">
 *   <Link href="#subsection" title="Subsection" />
 * </Link>
 * ```
 */
export const Link = React.forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (props, _ref) => {
    // ---------------------------------------------------------------------------
    // Props Destructuring
    // ---------------------------------------------------------------------------

    const { href, title, target, replace, children, className } = props;

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <AntAnchor.Link
        href={href}
        title={title}
        target={target}
        replace={replace}
        className={className}
      >
        {children}
      </AntAnchor.Link>
    );
  }
);
Link.displayName = 'Anchor.Link.Classic';

export default Anchor;
