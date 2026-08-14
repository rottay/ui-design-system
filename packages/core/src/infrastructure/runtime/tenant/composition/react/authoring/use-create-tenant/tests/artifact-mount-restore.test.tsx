import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
} from '@/infrastructure/runtime/theming/foundation/visual-authority';
import { ReservedTenantIdentityError } from '@/foundation/tokens/ts/presentation/brand-themes';
import { useCreateTenant } from '..';

const ARTIFACT = compileTenantThemeConfig(
  hydrateTenantThemeConfig({
    schemaVersion: 1,
    mode: 'simple',
    appearance: {
      palette: { primary: '#216A8A' },
      density: 'normal',
      motion: { intensity: 0.5, durationScale: 1, ambient: 'off' },
    },
  }, {
    tenantId: 'tenant_preview',
    slug: 'preview',
    verticalKey: 'bithire',
    rowVersion: 1,
  }),
  { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
);

afterEach(() => {
  document.getElementById('ds-tenant-css-preview')?.remove();
  document.getElementById('before')?.remove();
  document.getElementById('after')?.remove();
});

describe('useCreateTenant artifact mounting', () => {
  it('mounts exact verified bytes and restores the exact predecessor node and order', () => {
    const before = document.createElement('meta');
    before.id = 'before';
    const predecessor = document.createElement('style');
    predecessor.id = 'ds-tenant-css-preview';
    predecessor.dataset.owner = 'ssr';
    predecessor.textContent = '/* exact predecessor */';
    const after = document.createElement('meta');
    after.id = 'after';
    document.head.append(before, predecessor, after);
    const predecessorBytes = predecessor.outerHTML;

    const { result } = renderHook(() => useCreateTenant());
    result.current.injectTenantCss({ artifact: ARTIFACT });

    const mounted = document.getElementById('ds-tenant-css-preview') as HTMLStyleElement;
    expect(mounted).not.toBe(predecessor);
    expect(mounted.textContent).toBe(ARTIFACT.css);
    expect(mounted.getAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE)).toBe(ARTIFACT.digest);
    expect(mounted.getAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE)).toBe(ARTIFACT.slug);
    expect(mounted.getAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE)).toBe(ARTIFACT.verticalKey);
    expect(mounted.previousSibling).toBe(before);
    expect(mounted.nextSibling).toBe(after);

    result.current.removeTenantCss('preview');
    expect(document.getElementById('ds-tenant-css-preview')).toBe(predecessor);
    expect(predecessor.outerHTML).toBe(predecessorBytes);
    expect(predecessor.previousSibling).toBe(before);
    expect(predecessor.nextSibling).toBe(after);
  });

  it('validates before mutation and leaves the mounted artifact intact on tamper', () => {
    const { result } = renderHook(() => useCreateTenant());
    result.current.injectTenantCss({ artifact: ARTIFACT });
    const mounted = document.getElementById('ds-tenant-css-preview');

    expect(() => result.current.injectTenantCss({
      artifact: { ...ARTIFACT, css: `${ARTIFACT.css}\n/* tampered */` },
    })).toThrow(/Refusing invalid TenantThemeArtifact/);
    expect(document.getElementById('ds-tenant-css-preview')).toBe(mounted);
    expect(mounted?.textContent).toBe(ARTIFACT.css);
  });

  it('restores the predecessor on hook unmount', () => {
    const predecessor = document.createElement('style');
    predecessor.id = 'ds-tenant-css-preview';
    predecessor.textContent = '/* ssr */';
    document.head.appendChild(predecessor);
    const hook = renderHook(() => useCreateTenant());
    hook.result.current.injectTenantCss({ artifact: ARTIFACT });

    hook.unmount();
    expect(document.getElementById('ds-tenant-css-preview')).toBe(predecessor);
  });

  it.each(['rottay', 'Rottay', 'r-o-t-t-a-y'])(
    'rejects a direct artifact using reserved identity variant %s before verification',
    (slug) => {
      const { result } = renderHook(() => useCreateTenant());
      expect(() => result.current.injectTenantCss({
        artifact: { ...ARTIFACT, slug },
      })).toThrow(ReservedTenantIdentityError);
      expect(document.getElementById(`ds-tenant-css-${slug}`)).toBeNull();
    },
  );

  it('prevents a second hook from taking over or removing the first hook owner', () => {
    const first = renderHook(() => useCreateTenant());
    const second = renderHook(() => useCreateTenant());
    first.result.current.injectTenantCss({ artifact: ARTIFACT });
    const mounted = document.getElementById('ds-tenant-css-preview');

    second.result.current.removeTenantCss('preview');
    expect(document.getElementById('ds-tenant-css-preview')).toBe(mounted);
    expect(() => second.result.current.injectTenantCss({ artifact: ARTIFACT })).toThrow(
      /owned by another useCreateTenant instance/,
    );
    expect(document.getElementById('ds-tenant-css-preview')).toBe(mounted);

    first.result.current.removeTenantCss('preview');
    expect(document.getElementById('ds-tenant-css-preview')).toBeNull();
  });

  it('does not overwrite an external takeover while restoring its predecessor', () => {
    const predecessor = document.createElement('style');
    predecessor.id = 'ds-tenant-css-preview';
    predecessor.textContent = '/* predecessor */';
    document.head.appendChild(predecessor);
    const hook = renderHook(() => useCreateTenant());
    hook.result.current.injectTenantCss({ artifact: ARTIFACT });

    const foreign = document.createElement('style');
    foreign.id = 'ds-tenant-css-preview';
    foreign.textContent = '/* foreign takeover */';
    document.getElementById('ds-tenant-css-preview')?.replaceWith(foreign);
    hook.result.current.removeTenantCss('preview');

    expect(document.getElementById('ds-tenant-css-preview')).toBe(foreign);
    expect(predecessor.parentNode).toBeNull();
  });
});
