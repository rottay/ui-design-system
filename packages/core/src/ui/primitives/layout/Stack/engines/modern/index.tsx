/**
 * @fileoverview Stack Modern Engine - Rottay Design System
 * @description Modern, token-aware implementation of the Stack component.
 *
 * @remarks
 * **Stack vs Flex (composition law):** Stack owns READING RHYTHM along one
 * axis — a single governed gap from the preset spacing ramp (density-scaled),
 * optional interleaved dividers that center inside that rhythm, and reverse
 * order. Flex owns FREEFORM composition — ad-hoc clusters with uniform or
 * split (row/column) gaps and no divider contract. Reach for Stack when the
 * children form a sequence (form fields, list rows, page sections); reach
 * for Flex when they form a cluster (toolbar rows, action groups, media
 * objects). Nested Stacks inherit nothing: each instance re-declares its own
 * direction/spacing attributes, so nesting is predictable by construction.
 *
 * @module Stack/Engines/Modern
 * @category Layout
 * @package @rottay/design-system
 */

"use client";

import React, { forwardRef, useId, type ElementType, type Ref } from "react";
import type { StackProps, StackDirection } from "../../contracts";
import { STACK_DEFAULTS } from "../../contracts";
import {
  generateResponsiveCSS,
  scalarOrDefault,
} from "@/infrastructure/runtime/responsive/runtime/style-properties";
import {
  collectStackResponsiveEntries,
  renderStackChildren,
} from "../../runtime/responsive";
import { resolveStackPresentation } from "../../runtime/presentation";

/**
 * Modern (Hermes) engine implementation of the Stack component.
 */
const HermesStack = forwardRef<HTMLElement, StackProps>((props, ref) => {
  const {
    as: Component = STACK_DEFAULTS.as,
    direction,
    spacing: _spacing,
    gap: _gap,
    divider,
    className = "",
    children,
    align: _align,
    justify: _justify,
    wrap: _wrap,
    reverse: _reverse,
    fullWidth: _fullWidth,
    fullHeight: _fullHeight,
    motion: _motion,
    style: _style,
    engine: _engine,
    // StackProps extends HTMLAttributes: the remaining keys are real DOM
    // attributes (data-*, aria-*, id, handlers) and must reach the element.
    ...htmlAttributes
  } = props;

  const scalarDirection = scalarOrDefault<StackDirection>(
    direction,
    "vertical"
  );

  const presentation = resolveStackPresentation(props);
  const renderedChildren = renderStackChildren(
    children,
    divider,
    scalarDirection
  );

  // Responsive CSS generation
  const reactId = useId();
  const responsiveEntries = collectStackResponsiveEntries(props);
  const needsResponsiveCSS = responsiveEntries.length > 0;

  const elementId = needsResponsiveCSS
    ? `stack-${reactId.replace(/:/g, "")}`
    : "";
  const responsive = needsResponsiveCSS
    ? generateResponsiveCSS(elementId, responsiveEntries)
    : null;

  const classNames = ["rottay-stack", "rottay-stack--modern", className]
    .filter(Boolean)
    .join(" ");

  const ElementType = Component as ElementType;

  return (
    <>
      {responsive && responsive.css && (
        <style dangerouslySetInnerHTML={{ __html: responsive.css }} />
      )}
      {React.createElement(
        ElementType,
        {
          ...htmlAttributes,
          ref: ref as Ref<HTMLElement>,
          className: classNames,
          style: {
            minInlineSize: 0,
            ...presentation.style,
          },
          ...presentation.attributes,
          ...(responsive ? responsive.attrs : {}),
          "data-component": "stack",
        },
        renderedChildren
      )}
    </>
  );
});

HermesStack.displayName = "ModernStack";

export default HermesStack;
