// @vitest-environment jsdom

/**
 * The server half of the mounted-artifact invariant.
 *
 * These drills exist to keep one specific dishonesty out of the runtime: an SSR
 * pass that admits a compiled artifact because it was ASKED to, rather than
 * because the design system itself produced the bytes. Every negative drill
 * below is a way an app could ask nicely.
 */

import { describe, expect, it } from 'vitest';
import type { TenantThemeArtifact } from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  auditTenantThemeArtifactSsrReceipt,
  emitTenantThemeArtifactForSsr,
  resolveVisualAuthority,
  tenantThemeArtifactElementId,
} from '..';

function buildArtifact(slug: string, rowVersion: number): TenantThemeArtifact {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig({
      schemaVersion: 1,
      mode: 'simple',
      appearance: {
        palette: { primary: '#2F6B9A', backgroundMode: 'dark' },
        density: 'compact',
        motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
      },
    }, {
      tenantId: `tenant_${slug}`,
      slug,
      verticalKey: 'bithire',
      rowVersion,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
  );
}

const ARTIFACT = buildArtifact('themanagement', 7);
const OTHER_ARTIFACT = buildArtifact('othertenant', 3);

const NO_PAYLOAD = {
  visualBranding: false,
  tokenOverrides: false,
  appearance: undefined,
  personality: false,
  brandTheme: false,
} as const;

function resolveOnServer(
  artifact: TenantThemeArtifact,
  ssrReceipt: unknown,
) {
  return resolveVisualAuthority({
    declaration: {
      authority: 'compiled-artifact',
      artifact,
      // `unknown` on purpose: every negative drill here is a caller supplying
      // something that is not a minted receipt.
      ssrReceipt: ssrReceipt as never,
    },
    slug: artifact.slug,
    verticalKey: artifact.verticalKey,
    payload: NO_PAYLOAD,
    documentRoot: null,
  });
}

describe('SSR emission receipt', () => {
  it('emits the exact artifact bytes and the three proof attributes', () => {
    const emission = emitTenantThemeArtifactForSsr(ARTIFACT);

    expect(emission.css).toBe(ARTIFACT.css);
    expect(emission.attributes[TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE]).toBe(ARTIFACT.digest);
    expect(emission.attributes[TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE]).toBe(ARTIFACT.slug);
    expect(emission.attributes[TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE]).toBe(ARTIFACT.verticalKey);
  });

  it('emits the same element id the client mount uses', () => {
    // If these drifted, hydration would either duplicate the tenant scope --
    // which the mount proof rejects -- or orphan the server's own element.
    const emission = emitTenantThemeArtifactForSsr(ARTIFACT);
    expect(emission.attributes.id).toBe(tenantThemeArtifactElementId(ARTIFACT.slug));
    expect(emission.receipt.elementId).toBe(emission.attributes.id);
  });

  it('admits a compiled artifact on the server against its own receipt', () => {
    const { receipt } = emitTenantThemeArtifactForSsr(ARTIFACT);
    const resolution = resolveOnServer(ARTIFACT, receipt);

    expect(resolution.conflict).toBeNull();
    expect(resolution.authority).toBe('compiled-artifact');
    expect(resolution.origin).toBe('ssr-emission-receipt');
    // No DOM was observed, so nothing may claim a mounted element. The client
    // is what proves the mount; this boundary must not pretend to.
    expect(resolution.mountedArtifact).toBeNull();
  });

  it('DRILL: refuses a compiled artifact with no receipt at all', () => {
    const resolution = resolveOnServer(ARTIFACT, undefined);

    expect(resolution.origin).toBe('unprovable-ssr-mount');
    expect(resolution.conflict).toMatch(/no SSR emission receipt was supplied/);
    expect(resolution.artifact).toBeNull();
  });

  it('DRILL: refuses a hand-built receipt that is structurally perfect', () => {
    // The whole point of minting. This object is indistinguishable by value
    // from the real one, and it must still be rejected.
    const { receipt: real } = emitTenantThemeArtifactForSsr(ARTIFACT);
    const forged = { ...real };

    expect(auditTenantThemeArtifactSsrReceipt(ARTIFACT, forged))
      .toMatch(/was not minted by this runtime/);
    expect(resolveOnServer(ARTIFACT, forged).origin).toBe('unprovable-ssr-mount');
  });

  it('DRILL: a receipt minted for one tenant cannot admit another', () => {
    const { receipt } = emitTenantThemeArtifactForSsr(ARTIFACT);
    const resolution = resolveOnServer(OTHER_ARTIFACT, receipt);

    expect(resolution.origin).toBe('unprovable-ssr-mount');
    expect(resolution.conflict).toMatch(/different artifact|different tenant scope/);
  });

  it('DRILL: a receipt does not survive a rewrite of the bytes it covers', () => {
    // The v1 digest does NOT cover `css`, so a receipt bound only to the digest
    // would still match here. The receipt binds the CSS bytes separately for
    // exactly this case, rather than leaning on a neighbouring check.
    const { receipt } = emitTenantThemeArtifactForSsr(ARTIFACT);
    const rewritten = { ...ARTIFACT, css: `${ARTIFACT.css}\n:root{--ds-color-primary:#f00}\n` } as TenantThemeArtifact;

    expect(receipt.digest).toBe(rewritten.digest);
    expect(auditTenantThemeArtifactSsrReceipt(rewritten, receipt))
      .toMatch(/minted for different artifact bytes/);
    expect(resolveOnServer(rewritten, receipt).origin).not.toBe('ssr-emission-receipt');
  });

  it('DRILL: refuses to emit an artifact whose CSS is not the deterministic rendering', () => {
    const tampered = { ...ARTIFACT, css: `${ARTIFACT.css}/*x*/` } as TenantThemeArtifact;
    expect(() => emitTenantThemeArtifactForSsr(tampered))
      .toThrow(/artifact CSS is not the deterministic v1 rendering/);
  });

  it('DRILL: refuses to emit CSS that would close its own style element', () => {
    // Today's compiler cannot produce this, so the guard is ordered ahead of
    // verification -- otherwise the deterministic-CSS check above would reject
    // first and this guard would be unreachable code that no test could cover
    // and no future compiler change would trip.
    const injected = { ...ARTIFACT, css: '</style><script>x()</script>' } as TenantThemeArtifact;
    expect(() => emitTenantThemeArtifactForSsr(injected))
      .toThrow(/closes its own style element/);
  });

  it('DRILL: an explicit null root is never answered by the ambient document', () => {
    // jsdom is present and the artifact is genuinely mounted, so a resolver
    // that let `null` fall through to the parameter default would admit this
    // as a normal client mount and report `compiled-envelope`.
    const style = document.createElement('style');
    style.setAttribute(TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE, ARTIFACT.digest);
    style.setAttribute(TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE, ARTIFACT.slug);
    style.setAttribute(TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE, ARTIFACT.verticalKey);
    style.textContent = ARTIFACT.css;
    document.head.appendChild(style);

    try {
      expect(resolveOnServer(ARTIFACT, undefined).origin).toBe('unprovable-ssr-mount');

      // Same document, same artifact, observed instead of declared away.
      const observed = resolveVisualAuthority({
        declaration: { authority: 'compiled-artifact', artifact: ARTIFACT },
        slug: ARTIFACT.slug,
        verticalKey: ARTIFACT.verticalKey,
        payload: NO_PAYLOAD,
      });
      expect(observed.origin).toBe('compiled-envelope');
      expect(observed.mountedArtifact).toBe(style);
    } finally {
      style.remove();
    }
  });

  it('DRILL: a receipt does not buy exemption from the raw-payload census', () => {
    // Admission is not the last word. A server render that also ships raw
    // visual payload is still two painters, receipt or not.
    const { receipt } = emitTenantThemeArtifactForSsr(ARTIFACT);
    const resolution = resolveVisualAuthority({
      declaration: { authority: 'compiled-artifact', artifact: ARTIFACT, ssrReceipt: receipt },
      slug: ARTIFACT.slug,
      verticalKey: ARTIFACT.verticalKey,
      payload: { ...NO_PAYLOAD, tokenOverrides: true },
      documentRoot: null,
    });

    expect(resolution.origin).toBe('invalid-declaration');
    expect(resolution.conflict).toMatch(/raw tokenOverrides/);
  });
});
