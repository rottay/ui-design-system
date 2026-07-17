/** Runtime values and operations separated from the public type contract. */

import type { GalleryViewProps } from '../../contracts';

function readRecordValue(value: unknown, key: PropertyKey): unknown {
  if (typeof value !== 'object' || value === null) return undefined;
  return Reflect.get(value, key);
}

/**
 * Resolves a unique string key for a gallery item, used for React keys and
 * selection tracking. Falls back to the array index when `rowKey` is not
 * provided.
 *
 * @typeParam T - Data item shape.
 * @param item   - The data item.
 * @param rowKey - The `rowKey` prop from GalleryViewProps.
 * @param index  - The array index, used as fallback.
 * @returns A string uniquely identifying this item.
 */
export function resolveGalleryKey<T>(
  item: T,
  rowKey: GalleryViewProps<T>['rowKey'],
  index: number,
): string {
  if (!rowKey) return String(index);
  if (typeof rowKey === 'function') return rowKey(item);
  return String(readRecordValue(item, rowKey as string));
}
