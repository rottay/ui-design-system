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
      (name.startsWith("data-") || name.startsWith("aria-")) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean")
    ) {
      attributes[name] = value;
    }
  }

  // Keep these reads explicit. Besides making the native allowlist auditable,
  // this avoids a computed-property capability edge in the supplier graph.
  const { role, tabIndex, title, lang, dir } = props as {
    role?: unknown;
    tabIndex?: unknown;
    title?: unknown;
    lang?: unknown;
    dir?: unknown;
  };

  if (typeof role === "string") attributes.role = role;
  if (typeof tabIndex === "number") attributes.tabIndex = tabIndex;
  if (typeof title === "string") attributes.title = title;
  if (typeof lang === "string") attributes.lang = lang;
  if (typeof dir === "string") attributes.dir = dir;

  return attributes;
}
