/**
 * Canonical imperative boundary for a static `data-part` stamp.
 *
 * JSX intrinsic attributes remain the default evidence path. This helper exists
 * for renderers such as D3 that own real DOM nodes outside JSX; GAT-07 recognizes
 * only calls imported from this module and still requires a finite static part.
 */
export interface DataPartAttributeTarget {
  setAttribute(name: 'data-part', value: string): void;
}

export function stampDataPart(target: DataPartAttributeTarget, part: string): void {
  target.setAttribute('data-part', part);
}
