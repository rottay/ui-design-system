/**
 * Simple className utility for component styling.
 * Combines class names and filters out falsy values.
 *
 * @example
 * cn('btn', isActive && 'btn-active', className)
 * // => 'btn btn-active custom-class'
 */
export function cn(...classes: (string | undefined | null | false | boolean)[]): string {
  return classes.filter(Boolean).join(' ').trim().replace(/\s+/g, ' ');
}
