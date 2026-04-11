/**
 * @fileoverview Tests for tenant CSS fixture exports and injection helpers.
 */

import { describe, expect, it } from 'vitest';

import {
  allTenantCSS,
  bithireCSS,
  defaultCSS,
  injectAllTenantCSS,
  injectTenantCSS,
  rottayCSS,
  tenantCSSMap,
} from '..';

describe('tenant CSS fixtures', () => {
  it('exposes the raw tenant CSS bundle and map', () => {
    expect(allTenantCSS).toContain(defaultCSS.trim());
    expect(allTenantCSS).toContain(rottayCSS.trim());
    expect(allTenantCSS).toContain(bithireCSS.trim());

    expect(tenantCSSMap).toMatchObject({
      default: defaultCSS,
      rottay: rottayCSS,
      bithire: bithireCSS,
    });
  });

  it('injects all tenant CSS into the document and cleans up afterwards', () => {
    const cleanup = injectAllTenantCSS();
    const style = document.getElementById('tenant-css-fixtures');

    expect(style).not.toBeNull();
    expect(style?.textContent).toContain(defaultCSS.trim());

    cleanup();
    expect(document.getElementById('tenant-css-fixtures')).toBeNull();
  });

  it('injects a single tenant CSS payload into the document and cleans up afterwards', () => {
    const cleanup = injectTenantCSS('bithire');
    const style = document.getElementById('tenant-css-bithire');

    expect(style).not.toBeNull();
    expect(style?.textContent).toBe(bithireCSS);

    cleanup();
    expect(document.getElementById('tenant-css-bithire')).toBeNull();
  });
});
