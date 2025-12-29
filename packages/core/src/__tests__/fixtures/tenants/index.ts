/**
 * @fileoverview Tenant CSS Fixtures Index
 * @description Exports tenant CSS as raw strings for test injection
 */

// Import CSS as raw strings (requires ?raw suffix in Vite/Vitest)
import defaultCSS from './default.css?raw';
import rottayCSS from './rottay.css?raw';
import bithireCSS from './bithire.css?raw';

export { defaultCSS, rottayCSS, bithireCSS };

/**
 * All tenant CSS combined in correct cascade order
 */
export const allTenantCSS = `
${defaultCSS}
${rottayCSS}
${bithireCSS}
`;

/**
 * Map of tenant name to CSS content
 */
export const tenantCSSMap: Record<string, string> = {
  default: defaultCSS,
  rottay: rottayCSS,
  bithire: bithireCSS,
};

/**
 * Injects all tenant CSS fixtures into the document
 * Returns a cleanup function
 */
export function injectAllTenantCSS(): () => void {
  const style = document.createElement('style');
  style.id = 'tenant-css-fixtures';
  style.textContent = allTenantCSS;
  document.head.appendChild(style);

  return () => {
    const el = document.getElementById('tenant-css-fixtures');
    if (el) {
      el.remove();
    }
  };
}

/**
 * Injects a specific tenant's CSS
 */
export function injectTenantCSS(tenant: 'default' | 'rottay' | 'bithire'): () => void {
  const css = tenantCSSMap[tenant];
  const style = document.createElement('style');
  style.id = `tenant-css-${tenant}`;
  style.textContent = css;
  document.head.appendChild(style);

  return () => {
    const el = document.getElementById(`tenant-css-${tenant}`);
    if (el) {
      el.remove();
    }
  };
}
