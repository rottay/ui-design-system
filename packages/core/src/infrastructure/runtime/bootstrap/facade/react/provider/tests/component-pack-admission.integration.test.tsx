/**
 * @fileoverview Component-pack ADMISSION through the real bootstrap provider.
 *
 * `component-pack-resolution.integration.test.tsx` proves what the FACTORY does
 * with a pack once a tenant context already carries one: it switches, it falls
 * through, it paints nothing. It reaches that context by constructing
 * `TenantContext.Provider` by hand, so it proves nothing about whether a pack
 * can get there in the first place.
 *
 * That is the gap this file closes. Everything below mounts the actual
 * `DesignSystemProvider`, so `componentPack` has to survive the whole bootstrap
 * chain to be observable at all: the sync merge, `assertProviderTenantConfig`,
 * the visual-authority census, the runtime projection in
 * `buildResolvedRuntimeConfig`, and `TenantProvider`'s deep clone-and-freeze.
 * Two drills, one each way:
 *
 *   ADMITTED  -- an identity-only customer tenant (lower-kebab non-reserved
 *                slug, companyName-only branding, zero visual payload) reaches
 *                children, keeps its pack through the projection, resolves a
 *                bespoke component, and paints nothing.
 *   REFUSED   -- the same request built from a SPREAD of the exact code-owned
 *                `rottay` config fails closed before children exist, because
 *                provenance is object identity and a spread does not carry it.
 *
 * Switching, fallback-through and pack cross-contamination stay in the factory
 * suite; repeating them here would test the factory twice and admission never.
 */
import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TenantConfig } from '@/foundation/contracts';
import { ReservedTenantIdentityError } from '@/foundation/tokens/ts/presentation/brand-themes';
import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';
import {
  clearCustomRegistry,
  registerCustomComponents,
} from '@/infrastructure/runtime/engines/runtime/customization/component-registry';
import {
  getKnownTenantConfig,
  isCodeOwnedTenantConfig,
} from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { useTenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import {
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
  resetVisualAuthorityDiagnostics,
} from '@/infrastructure/runtime/theming';
import { DesignSystemProvider } from '..';

const ADMISSION_PACK = 'admission-pack';
const CUSTOMER_SLUG = 'admission-labs';

/**
 * The whole point of the positive drill: a tenant that carries a pack and
 * NOTHING a compiler would have had to compile. No branding colors, no
 * `tokenOverrides`, no `appearance`, no `personality`, no `brandTheme` -- so
 * `censusRuntimeVisualPayload` is empty and the provider admits it with no
 * `visualAuthority` declaration at all. `componentPack` rides along as
 * behavior, which is exactly the claim under test.
 *
 * `vertical: 'rottay'` is a first-party VERTICAL key, not a tenant identity:
 * `classifyTenantIdentity` reads slug/name/companyName only, so a customer is
 * entitled to render inside a first-party vertical baseline. The reserved-
 * identity refusal in the second drill is therefore about the tenant's own
 * identity, not about this field.
 */
const CUSTOMER_CONFIG: TenantConfig = {
  slug: CUSTOMER_SLUG,
  name: 'Admission Labs',
  theme: 'base',
  plan: 'pro',
  features: [],
  vertical: 'rottay',
  branding: { companyName: 'Admission Labs' },
  componentPack: ADMISSION_PACK,
};

let bespokeRenders = 0;
let fallbackRenders = 0;
let probeRenders = 0;

function BespokeWidget(): React.ReactElement {
  bespokeRenders += 1;
  return <output data-testid="bespoke-widget">bespoke</output>;
}

function FallbackWidget(): React.ReactElement {
  fallbackRenders += 1;
  return <output data-testid="fallback-widget">fallback</output>;
}

// A real engine component, built by the real factory. `Record<never, never>`
// rather than `Record<string, never>` for the reason the factory suite records:
// the latter's index signature types every key as `never` and erases the
// factory's own `engine?: EngineName` override.
const TestWidget = createEngineComponent<Record<never, never>>('TestWidget', {
  classic: async () => ({ default: FallbackWidget }),
  modern: async () => ({ default: FallbackWidget }),
  rustic: async () => ({ default: FallbackWidget }),
});

/**
 * The child sentinel. It renders only if the provider let children mount, and
 * it publishes the pack AS THE RUNTIME SEES IT -- read back out of
 * `useTenantContext`, downstream of the projection that strips every visual
 * field, not off the object the test passed in.
 */
function PackProbe(): React.ReactElement {
  probeRenders += 1;
  const { config } = useTenantContext();
  return (
    <>
      <output data-testid="pack-probe">{JSON.stringify(config)}</output>
      <TestWidget />
    </>
  );
}

function readProbe(): TenantConfig {
  return JSON.parse(screen.getByTestId('pack-probe').textContent ?? '{}') as TenantConfig;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error
      ? <output data-testid="provider-error">{this.state.error.name}</output>
      : this.props.children;
  }
}

let caughtError: Error | null = null;

class CapturingErrorBoundary extends ErrorBoundary {
  static getDerivedStateFromError(error: Error) {
    caughtError = error;
    return { error };
  }
}

/**
 * Style/link nodes are censused against a BASELINE taken before each drill
 * rather than against zero: the suite's own setup owns whatever is already in
 * the document, and this file must neither claim credit for it nor delete it.
 */
function styleAndLinkNodes(): Element[] {
  return Array.from(document.querySelectorAll('style, link'));
}

/**
 * The one non-tenant stylesheet the composed tree is allowed to hold.
 *
 * `SystemCssVariablesBridge` is mounted unconditionally and publishes
 * namespaced `--ds-personality-*` INPUTS into the named `rottay-personality`
 * cascade layer. It is a subordinate product/vertical data axis, deliberately
 * outside tenant v1 coverage, and it is not tenant paint -- so it is named here
 * explicitly instead of being waved through by a loose assertion. Anything else
 * appearing under a pack is a new painter and fails.
 */
const ALLOWED_NON_TENANT_STYLE_IDS: ReadonlySet<string> = new Set([
  'ds-personality-tokens',
]);

const ARTIFACT_SCOPE_ATTRIBUTES = [
  TENANT_THEME_ARTIFACT_DIGEST_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_SLUG_ATTRIBUTE,
  TENANT_THEME_ARTIFACT_VERTICAL_ATTRIBUTE,
] as const;

/**
 * The full observable `<html>` state: every attribute, in document order.
 * Inline style needs no separate field -- it IS the `style` attribute, and
 * carrying `cssText` alongside would make the restore write `style=""` onto a
 * predecessor that had no `style` attribute at all.
 */
interface RootSnapshot {
  readonly attributes: readonly (readonly [string, string])[];
}

function snapshotRoot(): RootSnapshot {
  return {
    attributes: Array.from(document.documentElement.attributes).map(
      (attribute) => [attribute.name, attribute.value] as const,
    ),
  };
}

/**
 * Restore `<html>` to the predecessor state EXACTLY -- same attribute set, same
 * values, same inline style text. `data-tenant`/`data-theme`/`data-engine`/
 * `data-density` are claimed by the tree under test and released on unmount,
 * but a blocked render releases nothing it never claimed, so the restore is
 * written to be correct in both directions: drop what appeared, put back what
 * changed or vanished.
 */
function restoreRoot(snapshot: RootSnapshot): void {
  const root = document.documentElement;
  const expected = new Map(snapshot.attributes);
  for (const name of Array.from(root.attributes).map((attribute) => attribute.name)) {
    if (!expected.has(name)) root.removeAttribute(name);
  }
  for (const [name, value] of snapshot.attributes) {
    if (root.getAttribute(name) !== value) root.setAttribute(name, value);
  }
}

function rootDsCustomProperties(): string[] {
  const style = document.documentElement.style;
  return Array.from({ length: style.length }, (_, index) => style.item(index))
    .filter((name) => name.startsWith('--ds-'))
    .sort();
}

let baselineNodes: Set<Element>;
let rootSnapshot: RootSnapshot;

beforeEach(() => {
  bespokeRenders = 0;
  fallbackRenders = 0;
  probeRenders = 0;
  caughtError = null;
  clearCustomRegistry();
  resetVisualAuthorityDiagnostics();
  baselineNodes = new Set(styleAndLinkNodes());
  rootSnapshot = snapshotRoot();
});

afterEach(() => {
  // Unmount EXPLICITLY, and first. The suite setup registers its own
  // `cleanup()` afterEach, and Vitest runs afterEach hooks in reverse
  // registration order -- so the automatic one fires AFTER this hook. A live
  // tree still holds root-attribute claims, and releasing them after the
  // restore would re-dirty exactly what the restore just put back. Calling it
  // here is idempotent; the later automatic call finds nothing mounted.
  cleanup();
  vi.restoreAllMocks();
  clearCustomRegistry();
  resetVisualAuthorityDiagnostics();
  for (const node of styleAndLinkNodes()) {
    if (!baselineNodes.has(node)) node.remove();
  }
  // The tree is expected to hand `<html>` back by itself: every governed
  // attribute is taken through `claimRootAttribute`, whose release restores the
  // predecessor value rather than deleting it. So capture the handed-back state,
  // REPAIR it, and only then assert -- in that order. Asserting first would
  // throw past the repair and leave the leak in place, which under this
  // project's `retry: 1` is self-healing rather than load-bearing: the retry's
  // `beforeEach` would re-baseline the dirty root and the rerun would pass.
  // Repairing first keeps every retry starting from the true predecessor, so a
  // real leak fails again instead of laundering itself into the baseline.
  const handedBack = snapshotRoot();
  restoreRoot(rootSnapshot);
  expect(handedBack).toEqual(rootSnapshot);
});

/** Style/link nodes this drill's render is responsible for. */
function addedStyleAndLinkNodes(): Element[] {
  return styleAndLinkNodes().filter((node) => !baselineNodes.has(node));
}

describe('DesignSystemProvider component-pack admission', () => {
  it('admits an identity-only customer tenant, resolves its bespoke pack, and paints nothing', async () => {
    registerCustomComponents({ TestWidget: BespokeWidget }, ADMISSION_PACK);

    const { unmount } = render(
      <DesignSystemProvider forceEngine="custom" tenantConfig={CUSTOMER_CONFIG}>
        <PackProbe />
      </DesignSystemProvider>,
    );

    // 1. Children mounted at all -- the barrier did not block an identity-only
    //    tenant that declared no visual authority, because it has nothing to
    //    declare authority over.
    await waitFor(() => expect(screen.getByTestId('pack-probe')).toBeTruthy());
    // Admission is visible on the document, under the CUSTOMER's own identity.
    // This is also what makes the root round-trip asserted in `afterEach`
    // non-vacuous: something was genuinely claimed and has to be given back.
    expect(document.documentElement.getAttribute('data-tenant')).toBe(CUSTOMER_SLUG);

    // 2. Bespoke pack resolution happened, through the real factory reading the
    //    real provider's tenant context. The engine loaders above resolve to
    //    FallbackWidget for every non-custom engine, so a fallback render here
    //    would mean the pack was never consulted.
    expect(await screen.findByTestId('bespoke-widget')).toBeTruthy();
    expect(screen.queryByTestId('fallback-widget')).toBeNull();
    expect(bespokeRenders).toBeGreaterThan(0);
    expect(fallbackRenders).toBe(0);

    // 3. The pack survived the runtime projection. `buildResolvedRuntimeConfig`
    //    destructures away every visual field; `componentPack` is behavior and
    //    must arrive intact, under the tenant's own identity.
    const resolved = readProbe();
    expect(resolved.componentPack).toBe(ADMISSION_PACK);
    expect(resolved.slug).toBe(CUSTOMER_SLUG);
    expect(resolved.branding).toEqual({ companyName: 'Admission Labs' });
    expect(resolved).not.toHaveProperty('brandTheme');
    expect(resolved).not.toHaveProperty('personality');
    expect(resolved).not.toHaveProperty('tokenOverrides');
    expect(resolved).not.toHaveProperty('appearance');

    // 4. No tenant paint. A pack selects WHICH component renders; it may not
    //    become a second visual authority anywhere along the bootstrap chain.
    const added = addedStyleAndLinkNodes();
    for (const node of added) {
      for (const attribute of ARTIFACT_SCOPE_ATTRIBUTES) {
        expect(node.hasAttribute(attribute)).toBe(false);
      }
      expect(node.hasAttribute('data-tenant-css')).toBe(false);
      expect(ALLOWED_NON_TENANT_STYLE_IDS.has(node.id)).toBe(true);
      expect(node.textContent ?? '').not.toContain(CUSTOMER_SLUG);
      expect(node.textContent ?? '').not.toContain(ADMISSION_PACK);
    }
    expect(document.querySelector('link[id^="tenant-theme-"]')).toBeNull();
    expect(document.getElementById('rottay-emergency-tokens')).toBeNull();
    expect(rootDsCustomProperties()).toEqual([]);

    // 5. And it stays that way through teardown: an unmount that left a
    //    stylesheet behind would be paint with a longer life than the tree.
    unmount();
    expect(
      addedStyleAndLinkNodes().filter((node) => !ALLOWED_NON_TENANT_STYLE_IDS.has(node.id)),
    ).toEqual([]);
    expect(rootDsCustomProperties()).toEqual([]);
  });

  it('refuses a pack request forged by spreading the exact code-owned rottay config, before children or pack resolution', async () => {
    const knownRottay = getKnownTenantConfig('rottay');
    expect(knownRottay).toBeDefined();

    // The planted control. Every byte of the first-party payload, plus a pack.
    // What it CANNOT clone is provenance: membership in the code-owned set is
    // proven by object identity through a WeakSet, so the spread is a
    // caller-provided object wearing a reserved identity.
    //
    // The SPREAD is the cause, not the slug. Handing the provider the exact
    // registry object instead admits it and mounts children -- verified by
    // mutating this line to `knownRottay` while writing this drill, which turns
    // the boundary assertion below red for want of any error at all.
    const forged = { ...(knownRottay as TenantConfig), componentPack: ADMISSION_PACK };
    expect(isCodeOwnedTenantConfig(knownRottay)).toBe(true);
    expect(isCodeOwnedTenantConfig(forged)).toBe(false);
    expect(Object.keys(forged).sort()).toEqual(
      [...Object.keys(knownRottay as TenantConfig), 'componentPack'].sort(),
    );

    registerCustomComponents({ TestWidget: BespokeWidget }, ADMISSION_PACK);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CapturingErrorBoundary>
        <DesignSystemProvider forceEngine="custom" tenantConfig={forged}>
          <PackProbe />
        </DesignSystemProvider>
      </CapturingErrorBoundary>,
    );

    await waitFor(() =>
      expect(screen.getByTestId('provider-error').textContent).toBe(
        'ReservedTenantIdentityError',
      ),
    );

    // Classify the refusal EXACTLY as it fires today. The barrier that closes
    // first is identity/provenance in `assertProviderTenantConfig`, inside the
    // provider's sync-config memo -- not the visual-authority census. The
    // forged object also carries `brandTheme`, so it would have been refused
    // for uncompiled visual payload too; asserting that instead would pin a
    // consequence this input never reaches and would go green for the wrong
    // reason the day identity validation moved.
    //
    // `reservedAs` is the DISPLAY NAME, not the slug that matched. Slug and
    // name fold onto one fingerprint (`normalizeIdentityFingerprint` lowercases
    // and strips punctuation), and the reserved map is built from both in that
    // order, so the name is the surviving label for the shared fingerprint.
    // Derived from the registry rather than restated, so a rename moves the
    // expectation with it instead of leaving a stale literal.
    expect(caughtError).toBeInstanceOf(ReservedTenantIdentityError);
    expect((caughtError as ReservedTenantIdentityError).classification).toEqual({
      kind: 'reserved-identity-violation',
      field: 'slug',
      value: (knownRottay as TenantConfig).slug,
      reservedAs: (knownRottay as TenantConfig).name,
    });

    // Fail-CLOSED, not fail-late. No child ever rendered, so pack resolution
    // was never reached even though the pack is registered and would have
    // resolved.
    expect(screen.queryByTestId('pack-probe')).toBeNull();
    expect(screen.queryByTestId('bespoke-widget')).toBeNull();
    expect(screen.queryByTestId('fallback-widget')).toBeNull();
    expect(probeRenders).toBe(0);
    expect(bespokeRenders).toBe(0);
    expect(fallbackRenders).toBe(0);

    // And no takeover of the document on the way out: a refused config must not
    // leave the reserved identity stamped on the root or a stylesheet behind.
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
    expect(
      addedStyleAndLinkNodes().filter((node) => !ALLOWED_NON_TENANT_STYLE_IDS.has(node.id)),
    ).toEqual([]);
    expect(rootDsCustomProperties()).toEqual([]);
  });
});
