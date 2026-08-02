/**
 * @fileoverview Common contracts - Rottay Design System
 * @description Shared low-level type building blocks (Size, Variant, Shape,
 * BaseComponentProps, and mixin interfaces) reused across all component contracts.
 *
 * @remarks
 * These types are intentionally generic and library-agnostic. If a type only
 * applies to one component family, it belongs next to that family instead.
 *
 * Mixin interfaces (LoadableProps, DisableableProps, ClickableProps, etc.) can
 * be composed via intersection to build component prop types without repeating
 * common fields like `loading`, `disabled`, or `onChange`.
 *
 * @module Contracts/Common
 * @category Types
 * @package @rottay/design-system
 */

import type { CSSProperties, ReactNode } from 'react';
/** Standard size scale used across all DS components. */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

/**
 * @deprecated Ant Design-compatible size vocabulary. Use {@link Size} ('sm' | 'md' | 'lg')
 * in public component prop types; the classic engine's antd adapters translate a canonical
 * `Size` step to this spelling internally via {@link toLegacySize}. Retained for one release
 * so existing `'small' | 'middle' | 'large' | 'default'` values keep compiling. Importable only
 * under `engines/classic/` (the antd size-vocabulary bridge) -- see the
 * `no-size-type-outside-classic` ESLint rule in `@rottay/design-system/eslint`. Public contract
 * files reference {@link LegacySizeAlias} instead so that restriction can be enforced by name.
 */
export type SizeType = 'small' | 'middle' | 'large' | 'default';

/**
 * @deprecated Same literal union as {@link SizeType}, exported under a second name so the six
 * retyped `*Size` contracts (Table, TimePicker, DatePicker, Form, InputNumber, Switch) can widen
 * their canonical `'sm' | 'md' | 'lg'` step with the deprecated antd-style spellings for one
 * release without importing `SizeType` itself (which is restricted to `engines/classic/`).
 * Every exported `*Props` size-typed field across the design system must stay assignable to
 * `Size | LegacySizeAlias` -- this is the axis-law ratchet enforced by
 * `scripts/size-axis-law-gate.mjs`. A follow-up release deletes this alias from the six
 * contracts' `*Size` unions (recorded in the roadmap, not silently).
 */
export type LegacySizeAlias = SizeType;

/** The `sm | md | lg` subset of {@link Size} that has a legacy `SizeType` counterpart. */
type CanonicalLegacySizeStep = 'sm' | 'md' | 'lg';

/** Every canonical `sm | md | lg` step mapped to its legacy antd-style spelling. */
const LEGACY_SIZE_BY_CANON: Record<CanonicalLegacySizeStep, 'small' | 'middle' | 'large'> = {
  sm: 'small',
  md: 'middle',
  lg: 'large',
};

/**
 * Resolves a canonical `Size` step to its legacy `SizeType` spelling for engine bindings that
 * still key an internal lookup table, CSS class suffix, or antd component prop by
 * `'small' | 'middle' | 'large'`. Any other input -- an already-legacy spelling, `'default'`,
 * or `undefined` -- passes through unchanged, so calling this once on a `size` prop before it
 * reaches existing lookup/switch/className logic keeps that logic's existing branches as the
 * single source of truth for both spellings. Scoped to string inputs: a component whose `size`
 * prop also accepts a number or tuple (e.g. `Space`) branches on `typeof`/`Array.isArray` first
 * and calls this only on the remaining string case.
 */
export function toLegacySize<T extends string | undefined>(
  size: T,
): Exclude<T, CanonicalLegacySizeStep> | 'small' | 'middle' | 'large' {
  if (size === 'sm' || size === 'md' || size === 'lg') {
    return LEGACY_SIZE_BY_CANON[size as CanonicalLegacySizeStep];
  }
  return size as Exclude<T, CanonicalLegacySizeStep>;
}

/** Every deprecated `SizeType` spelling (including the ambiguous `'default'`) mapped to its canonical `Size` step. */
const CANON_SIZE_BY_LEGACY: Record<'small' | 'middle' | 'large' | 'default', CanonicalLegacySizeStep> = {
  small: 'sm',
  middle: 'md',
  large: 'lg',
  default: 'md',
};

/**
 * Resolves a legacy `SizeType` spelling -- or the ambiguous `'default'` -- to its canonical
 * `sm | md | lg` step, for engine bindings (modern/rustic) that key an internal lookup table,
 * CSS class suffix, or `data-size` attribute by the canonical vocabulary. Already-canonical
 * input, `undefined`, or any other `Size` step (`'xs'`, `'xl'`, ...) passes through unchanged,
 * so calling this once on a `size` prop before it reaches existing lookup/switch/className logic
 * normalizes both the deprecated antd-style spelling AND the new canonical spelling to the one
 * vocabulary modern/rustic render against. Inverse of {@link toLegacySize}; scoped to string
 * inputs the same way.
 */
export function toCanonicalSize<T extends string | undefined>(
  size: T,
): Exclude<T, 'small' | 'middle' | 'large' | 'default'> | CanonicalLegacySizeStep {
  if (size === 'small' || size === 'middle' || size === 'large' || size === 'default') {
    return CANON_SIZE_BY_LEGACY[size as 'small' | 'middle' | 'large' | 'default'];
  }
  return size as Exclude<T, 'small' | 'middle' | 'large' | 'default'>;
}

/** Status types for form control validation states. */
export type StatusType = '' | 'error' | 'warning';

/**
 * @deprecated Legacy color axis conflating semantic meaning (primary, success, warning, error)
 * with one structural value (gradient) in a single union. Use {@link Tone} for semantic color;
 * pair it with a component's own structural variant type (e.g. `BadgeStyle`) for rendering
 * style. Retained for one release so existing values keep compiling.
 */
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';

/**
 * Semantic color axis: what a component's color communicates, independent of how it renders.
 * Pairs with a component's own structural variant type (the rendering-style axis, e.g.
 * `BadgeStyle`'s `'solid' | 'outline' | 'soft' | 'ghost'`) rather than folding both concerns
 * into one union.
 */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Single-authority {@link Tone} -> internal color-token key mapping. Component engines that key
 * an internal lookup table, CSS class, or supplier prop (antd `type`/`status`) by a
 * component-local "variant" vocabulary resolve their `tone` prop through this map rather than
 * hand-rolling a parallel `TONE_TO_*` table; `as const` keeps every property's literal type
 * (not widened to `string`), so a component whose internal vocabulary is a strict subset of
 * these six values -- e.g. Tag has no `'info'` color tokens -- can still assign this object to
 * its own narrower `Record<XTone, XVariant>` binding: TypeScript checks each required key is
 * present with an assignable literal type and does not reject the unused extra keys on a
 * non-literal source. Only `danger` renames (`'error'`) because none of the internal
 * vocabularies spell it `danger`; `neutral` renders `'default'`, the spelling every
 * `Variant`-shaped internal vocabulary (Badge/Tag/Avatar) already uses for its unthemed case.
 * A component whose internal "unthemed" key is NOT spelled `'default'` (e.g. Progress's
 * `'normal'`) cannot derive from this shared object and keeps its own small bridge map --
 * that is a vocabulary difference, not a second semantic authority: {@link Tone} itself, defined
 * once above, remains what "neutral/primary/success/warning/danger/info" mean everywhere.
 */
export const TONE_TO_VARIANT = {
  neutral: 'default',
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'error',
  info: 'info',
} as const satisfies Record<Tone, string>;

/**
 * Modal width scale, shared by both Modal component families
 * (`primitives/feedback/Modal` and `primitives/overlay/Modal`) so the two parallel component
 * trees consume one declaration instead of two independently-maintained copies.
 */
export type ModalSize = Size | '4xl' | '5xl' | 'full';

/** Shape options for components that support geometric variants. */
export type Shape = 'circle' | 'square' | 'rounded';

/** Interaction states that drive visual feedback on interactive elements. */
export type InteractionState = 'idle' | 'hover' | 'active' | 'focus' | 'disabled';

/** Layout direction for flex/stack containers. */
export type Direction = 'horizontal' | 'vertical';

/** Alignment options for content within containers. */
export type Alignment = 'start' | 'center' | 'end';

/**
 * Base props inherited by most DS components.
 *
 * Keeping these centralized avoids dozens of tiny `className/style/id`
 * redefinitions across component-specific prop files.
 *
 * Pass-through honesty law (binding on every engine implementation):
 * `id`, `aria-*`, and `data-*` attributes declared here MUST reach the root
 * DOM element the engine owns -- an engine may not silently drop them.
 * `data-part` follows the anatomy-ownership rule (P-79, superseding the
 * SKN-03 always-engine-wins wording): an explicit caller `data-part` names
 * the part the COMPOSING component owns, so it MUST reach the DOM and win;
 * the engine stamps its own default root part only when the caller passed
 * none, so standalone use keeps the primitive's own anatomy contract. Inner
 * sub-parts (spinner/icon/label/content/...) stay engine-owned and can never
 * be renamed by a root `data-part`.
 */
export interface BaseComponentProps {
  /** Arbitrary semantic state hooks forwarded to the rendered DOM element. */
  [dataAttribute: `data-${string}`]: string | number | boolean | undefined;
  /** Arbitrary ARIA relationships/states forwarded to the rendered DOM element. */
  [ariaAttribute: `aria-${string}`]: string | number | boolean | undefined;
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** Element ID */
  id?: string;
  /**
   * Reading direction for this subtree; `auto` is safest for user-authored
   * mixed-script text.
   *
   * Every engine that spreads its rest props already forwards `dir` to the
   * DOM, and logical anatomy (`start`/`end` cover positions, inline padding,
   * mirrored affordances) resolves against it. Declaring it here is what lets
   * a caller scope direction to one component instead of the document, which
   * a mirrored-layout assertion cannot do otherwise. `Typography` has carried
   * this exact union since its locale props were introduced; this promotes it
   * to the shared base rather than widening it.
   */
  dir?: 'ltr' | 'rtl' | 'auto';
  /** Data attribute for testing */
  'data-testid'?: string;
  /** Skin anatomy hook: identifies a component part for tenant CSS selectors */
  'data-part'?: string;
  /** Accessible label for non-textual or landmark-style containers */
  'aria-label'?: string;
  /** Accessible description relationship for richer semantics */
  'aria-describedby'?: string;
}

/** Mixin for components that support loading states. */
export interface LoadableProps {
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Alternative text displayed during loading */
  loadingText?: string;
}

/** Mixin for components that support disabled states. */
export interface DisableableProps {
  /** Whether the component is disabled */
  disabled?: boolean;
}

/** Mixin for components that accept children. */
export interface WithChildren {
  children?: ReactNode;
}

/** Mixin for components that support click interaction. */
export interface ClickableProps {
  /** Whether the component is clickable */
  clickable?: boolean;
  /** Click event callback */
  onClick?: () => void;
}

/** Mixin for components that display error states. */
export interface ErrorableProps {
  /** Whether the component has an error */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
}

/** Mixin for components with label and helper text. */
export interface LabeledProps {
  /** Field label */
  label?: string;
  /** Helper/description text below the field */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
}

/** Mixin for components with placeholder text. */
export interface PlaceholderProps {
  /** Placeholder text shown when empty */
  placeholder?: string;
}

/**
 * Generic controlled/uncontrolled value contract.
 *
 * Components can specialize `T` when their value is not a string.
 */
export interface ControlledProps<T = string> {
  /** Current value (controlled) */
  value?: T;
  /** Default value (uncontrolled) */
  defaultValue?: T;
  /** Callback when the value changes */
  onChange?: (value: T) => void;
}

/** Mixin for components that support clearing their value. */
export interface ClearableProps {
  /** Whether the component shows a clear/reset control */
  clearable?: boolean;
  /** Callback when the value is cleared */
  onClear?: () => void;
}

/** Mixin for components that display an icon. */
export interface IconProps {
  /** Icon element to render */
  icon?: ReactNode;
  /** Icon placement relative to content */
  iconPosition?: 'start' | 'end';
}

/** Mixin for components that support a visible border. */
export interface BorderedProps {
  /** Whether to render a border */
  bordered?: boolean;
}

/** Mixin for components that support a box shadow. */
export interface ShadowedProps {
  /** Whether to render a shadow */
  shadowed?: boolean;
}

/** Absolute positioning options for overlay elements (tooltips, badges, etc.). */
export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'left-center'
  | 'right-center'
  | 'center';

/** Spacing density presets that control padding and gaps globally. */
export type Density = 'compact' | 'normal' | 'comfortable';

/** Semantic color token names available for component theming. */
export type ColorToken =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
