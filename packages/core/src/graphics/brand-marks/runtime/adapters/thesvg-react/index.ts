import type { CSSProperties } from 'react';

import type {
  MarkSize,
  MarkSizeToken,
} from '../../../foundation/catalog';

/**
 * Normalizes a package default across ESM and the provider's CJS `{ default }`
 * shape. Preserve-modules leaves the provider external, so this adapter—not a
 * consuming app or a bundler flag—owns the interop boundary.
 */
export function resolveMarkRendererDefault<Component>(candidate: Component): Component {
  const possibleCommonJsModule = candidate as Component & { readonly default?: Component };
  if (
    possibleCommonJsModule !== null
    && typeof possibleCommonJsModule === 'object'
    && 'default' in possibleCommonJsModule
    && possibleCommonJsModule.default !== undefined
  ) {
    return possibleCommonJsModule.default;
  }
  return candidate;
}

const MARK_SIZE_FALLBACKS: Readonly<Record<MarkSizeToken, string>> = {
  xs: 'var(--ds-mark-xs-size, var(--ds-icon-xs-size, 0.75rem))',
  sm: 'var(--ds-mark-sm-size, var(--ds-icon-sm-size, 1rem))',
  md: 'var(--ds-mark-md-size, var(--ds-icon-md-size, 1.25rem))',
  lg: 'var(--ds-mark-lg-size, var(--ds-icon-lg-size, 1.5rem))',
  xl: 'var(--ds-mark-xl-size, var(--ds-icon-xl-size, 2rem))',
};

export interface SharedMarkAdapterProps {
  size: MarkSize;
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  ariaDescribedBy?: string;
  testId?: string;
}

function resolveSize(size: MarkSize): string | number {
  if (typeof size === 'number') {
    return Number.isFinite(size) && size > 0 ? size : MARK_SIZE_FALLBACKS.md;
  }
  return MARK_SIZE_FALLBACKS[size] ?? MARK_SIZE_FALLBACKS.md;
}

function resolveDimension(
  value: string | number | undefined,
  fallback: string | number,
): string | number {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? value : fallback;
  if (typeof value === 'string') return value.trim().length > 0 ? value : fallback;
  return fallback;
}

export function sharedSvgProps({
  size,
  width,
  height,
  label,
  className,
  style,
  id,
  ariaDescribedBy,
  testId,
}: SharedMarkAdapterProps) {
  const fallback = resolveSize(size);
  const isLabeled = typeof label === 'string';

  return {
    id,
    width: resolveDimension(width, fallback),
    height: resolveDimension(height, fallback),
    className: `rottay-mark ${className ?? ''}`.trim(),
    style,
    focusable: 'false',
    role: isLabeled ? 'img' : undefined,
    'aria-label': isLabeled ? label : undefined,
    'aria-describedby': ariaDescribedBy,
    'aria-hidden': isLabeled ? undefined : true,
    'data-testid': testId,
    'data-part': 'mark',
    'data-mark-source': 'thesvg',
  } as const;
}
