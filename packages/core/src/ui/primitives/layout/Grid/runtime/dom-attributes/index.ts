/**
 * Select caller-provided semantic DOM attributes without leaking layout props
 * such as `columns` or `gap` onto the native element.
 *
 * Engine-owned anatomy attributes are applied after this projection so a
 * caller cannot overwrite reserved invariants such as `data-component`.
 */
export function extractSemanticDOMAttributes(
  props: object
): Record<string, string | number | boolean> {
  const attributes: Record<string, string | number | boolean> = {};

  for (const [name, value] of Object.entries(props)) {
    if (
      value !== undefined &&
      (name.startsWith('data-') || name.startsWith('aria-')) &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    ) {
      attributes[name] = value;
    }
  }

  return attributes;
}
