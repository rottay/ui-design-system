/**
 * Which theme state does an extension selector arm describe?
 *
 * `:not()` arguments must be stripped BEFORE testing for a positive theme
 * match: rottay's dark block is
 * `html[data-tenant='rottay']:not([data-theme='light']):not(.light)`, whose
 * literal text contains `data-theme='light'` and reads as LIGHT to a naive
 * regex. A block that merely EXCLUDES light is the tenant's default state,
 * which for a dark-default tenant is the dark map.
 */
export function stateOf(selector) {
  const positive = String(selector).replace(/:not\([^)]*\)/g, '');
  if (/data-theme=['"]?light|\.light\b/.test(positive)) return 'light';
  if (/data-theme=['"]?dark|\.dark\b/.test(positive)) return 'dark';
  if (/:not\(\[data-theme=['"]?light/.test(selector)) return 'dark';
  if (/:not\(\[data-theme=['"]?dark/.test(selector)) return 'light';
  return 'default';
}
