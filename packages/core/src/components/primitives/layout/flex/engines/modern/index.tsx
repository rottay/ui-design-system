"use client";

/**
 * @fileoverview Flex Modern Engine - Rottay Design System
 * @description Modern token-backed implementation of the Flex component.
 *
 * @remarks
 * **When to use Flex vs the layout sisters (kept in sync with Box):**
 * - **Box** is the polymorphic single-element escape hatch (spacing and paint
 *   for ONE element, no child rhythm).
 * - **Stack** owns one-dimensional child rhythm with preset spacing defaults
 *   (`direction` + `spacing`) — the everyday column/row of siblings.
 * - **Flex** (this primitive) owns the explicit axis composition Stack does
 *   not expose: `wrap`, `justify` distributions, `align` (incl. `baseline`),
 *   `inline`, and uniform or `[column, row]` split gaps on the tenant spacing
 *   ramp. If you only need a gap between siblings, Stack is the simpler call.
 * - **Grid** owns two-dimensional tracks.
 *
 * Scalar geometry projects to neutral `data-*` attributes consumed by the
 * shared declarative skin (`presentation/components/skin/layout-primitives/index.css`),
 * so tenant and white-label layers participate in the normal cascade; only
 * numeric parameters, the gap custom properties and the consumer's own
 * `style` remain inline (plus `min-inline-size: 0`, pinned by the quality
 * contract so flexible content can shrink and ellipsize).
 *
 * @module Flex/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

import React, { useId } from "react";
import type { FlexProps } from "../../contracts";
import { generateResponsiveCSS } from "@/infrastructure/runtime/responsive/runtime/style-properties";
import {
  resolveFlexAttributes,
  resolveFlexParameterStyle,
} from "../../runtime/presentation";
import type { FlexPresentationAttributes } from "../../runtime/presentation";
import { collectFlexResponsiveEntries } from "../../runtime/responsive";

/**
 * Modern Flex component using declarative skin attributes and bounded tokens.
 */
export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    const {
      direction: _direction,
      wrap: _wrap,
      justify: _justify,
      align: _align,
      gap: _gap,
      flex: _flex,
      inline: _inline,
      width: _width,
      minWidth: _minWidth,
      maxWidth: _maxWidth,
      overflow: _overflow,
      motion: _motion,
      engine: _engine,
      children,
      className,
      style: consumerStyle,
      ...rest
    } = props;

    // The resolver always returns all ten keys explicitly (see
    // `resolveFlexAttributes`'s own return statement), so `resolved` is used
    // AS-IS below rather than rebuilt through a second, conditional pass.
    //
    // A PRIOR version of this block rebuilt the object with
    // `...(resolved[key] !== undefined && { [key]: resolved[key] })` per key.
    // That conditional-spread OMITS the key entirely when the resolver has
    // nothing to say for it, instead of carrying it forward as `undefined` --
    // and an omitted key does not override anything. Spread AFTER `...rest`
    // (below), an omitted `data-gap-preset` therefore left a caller-supplied
    // `data-gap-preset` from `rest` standing untouched: `<Flex gap={24}
    // data-gap-preset="4xl" />` rendered `data-gap-preset="4xl"` into the DOM
    // even though `gap` is numeric (exact geometry, no preset), which the
    // rhythm rule in layout-primitives.css would then multiply as if it were
    // a real rung -- a caller-controlled owned-attribute forgery.
    //
    // These ten names are OWNED presentation attributes, not general consumer
    // `data-*` passthrough (BaseComponentProps's index signature types them
    // as legal props, but this component is the sole author of their
    // meaning). `resolved` carries every key unconditionally -- including an
    // `undefined` one -- so spreading it after `...rest` always clears
    // whatever `rest` held for that name; React omits an attribute whose
    // value is `undefined`. This is Flex's version of the SAME unconditional
    // stamp Grid's modern engine already performs (engines/modern/index.tsx:
    // `"data-gap-preset": gridGapPresetSpelling(...)` etc., written directly
    // into the JSX object AFTER `...htmlAttributes`, always present, never
    // conditionally spread).
    //
    // Using `resolved` directly (rather than a re-typed copy) is still a
    // provably bounded, non-arbitrary paint site: `resolveFlexAttributes`'s
    // return type is `FlexPresentationAttributes` itself, so the compiler
    // fails here the moment that contract grows a key this engine forgets to
    // return -- the same guarantee the old key-by-key spread offered, without
    // the omission bug.
    const resolved = resolveFlexAttributes(props);
    const presentationAttributes: FlexPresentationAttributes = resolved;
    const parameterStyle = resolveFlexParameterStyle(props);
    const resolvedStyle =
      parameterStyle || consumerStyle
        ? { ...parameterStyle, ...consumerStyle }
        : undefined;

    const reactId = useId();
    // `rhythm: true` is Modern-only on purpose: the collector is shared with
    // the read-only Classic and Rustic engines, whose emitted CSS must not
    // move. A responsive preset gap has no `data-gap-preset` for the skin to
    // key on, so this is the only place rhythm can reach it.
    const responsiveEntries = collectFlexResponsiveEntries(props, {
      rhythm: true,
    });
    const needsResponsiveCSS = responsiveEntries.length > 0;

    const elementId = needsResponsiveCSS
      ? `flex-${reactId.replace(/:/g, "")}`
      : "";
    const responsive = needsResponsiveCSS
      ? generateResponsiveCSS(elementId, responsiveEntries)
      : null;

    const combinedClassName = ["rottay-flex", "rottay-flex--modern", className]
      .filter(Boolean)
      .join(" ");
    const modernStyle = {
      minInlineSize: 0,
      ...resolvedStyle,
    };

    return (
      <>
        {responsive && responsive.css && (
          <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
        )}
        <div
          {...rest}
          ref={ref}
          className={combinedClassName}
          style={modernStyle}
          {...presentationAttributes}
          {...(responsive ? responsive.attrs : {})}
          data-component="flex"
        >
          {children}
        </div>
      </>
    );
  }
);

Flex.displayName = "Flex.Modern";

export default Flex;
