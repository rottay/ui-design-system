'use client';

/**
 * @fileoverview useResponsiveValue — THE resolver of a `ResponsiveValue` at the
 * current viewport.
 *
 * @remarks
 * One contract, one cascade. The hook used to declare a `ResponsiveValueConfig`
 * of its own -- `base` required, no `xs`, no device aliases -- beside the
 * `ResponsiveValue` the layout primitives and the CSS projection already spoke,
 * so the same ladder had two incompatible spellings depending on which door a
 * caller came through. It now takes `ResponsiveValue<T>` and defers to
 * `resolveResponsiveValue`, the pure resolution every consumer shares.
 *
 * Mobile-first: the answer is the value declared at the active breakpoint, or
 * at the nearest declared step below it.
 *
 * @example Responsive columns
 * ```tsx
 * const cols = useResponsiveValue({ base: 1, sm: 2, md: 3, lg: 4 });
 * ```
 *
 * @module Infrastructure/Runtime/Responsive/ResponsiveValue
 * @category Runtime
 * @package @rottay/design-system
 */
import {
  resolveResponsiveValue,
  type ResponsiveValue,
} from '@/foundation/contracts/kernel/responsive/values';
import { useResponsive } from '..';

/**
 * Resolves a breakpoint-keyed value for the current viewport.
 *
 * A scalar applies at every width. `undefined` means the ladder declares
 * nothing at or below the active step -- which is a real answer, not a failure:
 * it is how `{ lg: 4 }` says "no columns prop below 1024px".
 *
 * @param values - A scalar, or an object keyed by breakpoint (`xs`/`base`,
 *   `sm`/`tablet`, `md`, `lg`/`desktop`, `xl`, `2xl`, `phone`).
 * @returns The value for the current viewport, or `undefined`.
 */
export function useResponsiveValue<T>(values: ResponsiveValue<T> | undefined): T | undefined {
  const { activeBreakpoint } = useResponsive();
  return resolveResponsiveValue(values, activeBreakpoint);
}
