import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { TenantBranding, TenantConfig } from '@/foundation/contracts';
import { ReservedTenantIdentityError } from '@/foundation/tokens/ts/presentation/brand-themes';
import { useTenantContext } from '@/infrastructure/runtime/tenant/composition/react/provider';
import {
  getCodeOwnedGovernedBehavior,
  getCodeOwnedRuntimeConfig,
  getKnownTenantConfig,
  isCodeOwnedTenantConfig,
} from '@/infrastructure/runtime/tenant/foundation/configuration/registry';
import { MOTION_PROFILE_DEFAULTS } from '@/infrastructure/runtime/foundation/motion/policy';
import { resetVisualAuthorityDiagnostics } from '@/infrastructure/runtime/theming';
import { useI18nContext } from '@/infrastructure/runtime/i18n/runtime/context/provider';
import { useFeatures } from '@/infrastructure/runtime/features/composition/react/provider/features';
import { useThemeContext } from '@/infrastructure/runtime/theming/composition/react/provider';
import { useEngineContext } from '@/infrastructure/runtime/engines/composition/react/provider';
import { FALLBACK_ENGINE } from '@/infrastructure/runtime/engines/runtime/resolution';
import { useMotionPolicy } from '../../../../../motion';
import {
  BEHAVIOR_OVERRIDE_KEYS,
  DesignSystemProvider,
  mergeDefinedOwnEntries,
  mergeTokenOverrides,
} from '..';

/**
 * WHAT THIS DRILL PROTECTS.
 *
 * `tenantOverrides` used to run every key through one rebuild: it spread the
 * base config, spread the override on top, and then spread SEVEN token sections
 * whether or not the caller had written any of them. Two consequences followed,
 * and both were silent.
 *
 * 1. The rebuilt object was a new reference, so the code-owned registry could
 *    not recognise it. `isCodeOwnedTenantConfig` went false, the governed motion
 *    dial vanished, and `assertProviderTenantConfig` fell through to the
 *    reserved-identity assert -- a `ReservedTenantIdentityError` for the crime
 *    of asking for a different locale.
 * 2. `tokenOverrides` came out as `{ surface: {}, motion: {}, ... }`, seven keys
 *    the caller never wrote. `censusRuntimeVisualPayload` counts keys, so a
 *    tenant with no visual payload at all was reported as carrying one and the
 *    provider blocked it as `uncompiled-visual-payload`.
 *
 * The fix partitions the prop. `locale`, `fallbackLocale`, `customTranslations`,
 * `features` and `theme` are BEHAVIOR: delivered at the read sites that consume
 * them, never folded into the config. Everything else still rebuilds -- and
 * still meets the census and the identity assert, because that is the point of
 * the visual lane, not a regression in it.
 *
 * HOW THE BEHAVIOR LANE IS OBSERVED. A customer config is republished through
 * `buildResolvedRuntimeConfig` and then cloned and frozen, so the object a
 * consumer reads is a new sanitized snapshot no matter what this prop does.
 * Asserting `not.toHaveProperty('tokenOverrides')` on it would therefore pass
 * against the OLD code too. The honest observables are the three used below:
 * behavior values appearing at their read sites while the published config
 * still shows the tenant's own; reference identity on the code-owned path,
 * where the provider hands back the registry projection untouched; and
 * mount-versus-refusal, which is where fabricated keys actually showed up.
 */

/**
 * The behavior lane is asserted against the PRODUCTION declaration, imported
 * above. A local copy of the tuple would have agreed with itself forever: it
 * would stay green while the real set grew a sixth member, which is precisely
 * the regression the pin exists to catch. Deleting the production export now
 * fails this file at import; widening it fails the near-miss drill below.
 */

/** A key that exists in no DS dictionary, so `t()` echoes it on a total miss. */
const PROBE_KEY = 'common.tenantOverridesProbe';

/**
 * A customer tenant with ZERO runtime visual payload: identity branding only
 * (`logo` and `companyName` are not censused visual fields), no appearance, no
 * tokenOverrides, no personality, no brandTheme. The census reads all-false, so
 * it mounts with no artifact declaration -- which is what makes every refusal
 * below attributable to the override under test rather than to the fixture.
 */
function customerConfig(overrides: Partial<TenantConfig> = {}): TenantConfig {
  return {
    slug: 'the-management',
    name: 'The Management',
    theme: 'base',
    locale: 'en',
    plan: 'enterprise',
    features: ['feature-a'],
    branding: { companyName: 'The Management', logo: '/logo.svg' },
    ...overrides,
  } as TenantConfig;
}

interface Observation {
  config: TenantConfig;
  locale: string;
  fallbackLocale: string;
  features: string[];
  theme: string;
  engine: string;
  motionIntensity: number;
  probeCopy: string;
}

let observed: Observation | null = null;
let caught: Error | null = null;

function Probe(): React.ReactElement {
  const { config } = useTenantContext();
  const i18n = useI18nContext();
  const features = useFeatures();
  const theme = useThemeContext();
  const engine = useEngineContext();
  const motion = useMotionPolicy();
  observed = {
    config,
    locale: i18n.locale,
    fallbackLocale: i18n.fallbackLocale,
    features: features.features,
    theme: theme.theme,
    engine: engine.engine,
    motionIntensity: motion.intensity,
    // Read through the real four-tier dictionary chain, so a customTranslations
    // override is observed where consumers see it rather than where we passed
    // it in. A total miss echoes the raw key, which is the baseline any layer
    // has to beat.
    probeCopy: i18n.t(PROBE_KEY),
  };
  return <output data-testid="probe">mounted</output>;
}

/**
 * The provider refuses a code-owned tenant by THROWING during render, so the
 * refusal needs a boundary to land in -- the idiom the tenant-resolution drill
 * already uses. Asserting on the caught instance, not merely on "it threw",
 * is what keeps these cases from passing on an unrelated render error.
 */
class RefusalBoundary extends React.Component<
  React.PropsWithChildren,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: Error): void {
    caught = error;
  }

  render(): React.ReactNode {
    return this.state.failed
      ? <output data-testid="refused">refused</output>
      : this.props.children;
  }
}

type ProviderProps = React.ComponentProps<typeof DesignSystemProvider>;

function renderSync(
  config: TenantConfig,
  tenantOverrides?: Partial<TenantConfig>,
  extra: Partial<ProviderProps> = {},
) {
  return render(
    <RefusalBoundary>
      <DesignSystemProvider
        tenantConfig={config}
        tenantOverrides={tenantOverrides}
        forceEngine="modern"
        {...extra}
      >
        <Probe />
      </DesignSystemProvider>
    </RefusalBoundary>,
  );
}

function renderCodeOwned(
  slug: 'bithire' | 'evnto' | 'rottay',
  tenantOverrides?: Partial<TenantConfig>,
  extra: Partial<ProviderProps> = {},
) {
  const config = getKnownTenantConfig(slug);
  if (!config) throw new Error(`missing code-owned tenant ${slug}`);
  return renderSync(config, tenantOverrides, { vertical: slug, ...extra });
}

function mounted(): boolean {
  return screen.queryByTestId('probe') !== null;
}

beforeEach(() => {
  observed = null;
  caught = null;
  resetVisualAuthorityDiagnostics();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  resetVisualAuthorityDiagnostics();
  const root = document.documentElement;
  for (const attribute of [
    'data-tenant',
    'data-theme',
    'data-engine',
    'data-density',
    'data-vertical',
  ]) {
    root.removeAttribute(attribute);
  }
  root.classList.remove('dark');
  root.style.cssText = '';
});

describe('tenantOverrides: the behavior lane never travels through the config', () => {
  it('delivers every behavior key while the published config keeps the tenant values', () => {
    renderSync(customerConfig(), {
      locale: 'es',
      features: ['feature-b'],
      theme: 'dark',
    });

    expect(mounted()).toBe(true);
    // Delivered at the read sites...
    expect(observed!.locale).toBe('es');
    expect(observed!.features).toEqual(['feature-a', 'feature-b']);
    expect(observed!.theme).toBe('dark');
    // ...and structurally absent from the config every consumer reads. A
    // rebuild would have published these three values instead, which is how an
    // app-owned runtime tune used to become indistinguishable from data the
    // tenant actually authored.
    expect(observed!.config.locale).toBe('en');
    expect(observed!.config.features).toEqual(['feature-a']);
    expect(observed!.config.theme).toBe('base');
  });

  it('mounts a customer tenant that carries no visual payload at all', () => {
    // The exact regression: with the old unconditional rebuild, ANY override
    // fabricated seven empty tokenOverrides sections, the census counted seven
    // keys, and this mount was refused as `uncompiled-visual-payload`.
    renderSync(customerConfig(), { locale: 'es' });
    expect(mounted()).toBe(true);
    expect(document.documentElement.getAttribute('data-tenant')).toBe('the-management');
  });

  it('keeps a code-owned config code-owned, down to the registry projection', () => {
    const source = getKnownTenantConfig('bithire')!;
    renderCodeOwned('bithire', { locale: 'es', features: ['extra'] });

    expect(mounted()).toBe(true);
    // Identity, not deep equality: the provider publishes the registry's own
    // cached projection, so the code-owned WeakSet and the governed-behavior
    // WeakMap still resolve. A structurally-equal rebuild would satisfy a
    // `toEqual` and have destroyed exactly what this atom protects.
    expect(observed!.config).toBe(getCodeOwnedRuntimeConfig(source));
    expect(isCodeOwnedTenantConfig(observed!.config)).toBe(true);
    expect(getCodeOwnedGovernedBehavior(observed!.config)).toBe(
      getCodeOwnedGovernedBehavior(source),
    );
    // The overlay still reached its consumers on this path.
    expect(observed!.locale).toBe('es');
    expect(observed!.features).toContain('extra');
  });

  it('keeps bithire on its authored 0.55 motion dial under a behavior override', () => {
    // The end-to-end consequence of the identity drill above. Before the
    // partition, `{ locale: 'es' }` rebuilt the config, the WeakMap lookup
    // missed, and bithire fell back to calm's 0.3 envelope -- when it managed
    // to mount at all.
    expect(MOTION_PROFILE_DEFAULTS.calm.intensity).toBe(0.3);
    renderCodeOwned('bithire', { locale: 'es' });

    expect(observed!.motionIntensity).toBe(0.55);
    expect(observed!.motionIntensity).not.toBe(MOTION_PROFILE_DEFAULTS.calm.intensity);
  });

  it('mounts both a customer and a code-owned tenant under the same override', () => {
    renderSync(customerConfig(), { locale: 'es' });
    expect(mounted()).toBe(true);
    cleanup();

    renderCodeOwned('rottay', { locale: 'es' });
    expect(mounted()).toBe(true);
  });
});

describe('tenantOverrides: one derivation across sync and both async call sites', () => {
  it('renders children on the sync path', () => {
    renderSync(customerConfig(), { locale: 'es' });
    expect(mounted()).toBe(true);
    expect(observed!.locale).toBe('es');
  });

  it('renders children through the async path, after its loading frame', async () => {
    render(
      <RefusalBoundary>
        <DesignSystemProvider
          tenantSlug="bithire"
          tenantOverrides={{ locale: 'es', features: ['async-extra'] }}
          forceEngine="modern"
          vertical="bithire"
        >
          <Probe />
        </DesignSystemProvider>
      </RefusalBoundary>,
    );

    // The async path starts in `loading`, so children are absent for the first
    // frame; the drill is that it RESOLVES rather than refusing forever.
    expect(mounted()).toBe(false);
    await waitFor(() => expect(mounted()).toBe(true));

    // The async render call site derives through the same partition as the
    // sync one -- identity survives, and the overlay is still delivered.
    expect(observed!.config).toBe(
      getCodeOwnedRuntimeConfig(getKnownTenantConfig('bithire')!),
    );
    expect(observed!.locale).toBe('es');
    expect(observed!.features).toContain('async-extra');
    expect(observed!.motionIntensity).toBe(0.55);
  });

  it('hands onTenantResolved the untouched base config, not a rebuild', async () => {
    const resolved: TenantConfig[] = [];
    render(
      <RefusalBoundary>
        <DesignSystemProvider
          tenantSlug="bithire"
          tenantOverrides={{ locale: 'es', theme: 'dark' }}
          forceEngine="modern"
          vertical="bithire"
          onTenantResolved={(tenant) => resolved.push(tenant)}
        >
          <Probe />
        </DesignSystemProvider>
      </RefusalBoundary>,
    );

    await waitFor(() => expect(resolved.length).toBe(1));
    // The callback is the store's own object for a first-party slug -- the
    // second async call site derives, it does not hand the caller a rebuild.
    expect(resolved[0]).toBe(getKnownTenantConfig('bithire'));
    expect(isCodeOwnedTenantConfig(resolved[0])).toBe(true);
    // And the overlay's values are not in it: bithire authors no locale and
    // ships the 'base' theme sentinel.
    expect(resolved[0].locale).toBeUndefined();
    expect(resolved[0].theme).toBe('base');
  });
});

describe('tenantOverrides: every behavior key reaches its own consumer', () => {
  it('selects the locale, under an explicit app prop', () => {
    renderSync(customerConfig(), { locale: 'es' });
    expect(observed!.locale).toBe('es');

    cleanup();
    renderSync(customerConfig(), { locale: 'es' }, { locale: 'fr' });
    expect(observed!.locale).toBe('fr');
  });

  it('selects the fallback locale, under an explicit app prop', () => {
    renderSync(customerConfig(), { locale: 'es', fallbackLocale: 'fr' });
    expect(observed!.fallbackLocale).toBe('fr');

    cleanup();
    renderSync(
      customerConfig(),
      { locale: 'es', fallbackLocale: 'fr' },
      { fallbackLocale: 'pt' },
    );
    expect(observed!.fallbackLocale).toBe('pt');
  });

  it('layers translations config < tenantOverrides < app prop', () => {
    const fromConfig = customerConfig({
      customTranslations: { common: { tenantOverridesProbe: 'from-config' } },
    });

    renderSync(fromConfig);
    expect(observed!.probeCopy).toBe('from-config');

    cleanup();
    renderSync(fromConfig, {
      customTranslations: { common: { tenantOverridesProbe: 'from-override' } },
    });
    expect(observed!.probeCopy).toBe('from-override');

    cleanup();
    renderSync(
      fromConfig,
      { customTranslations: { common: { tenantOverridesProbe: 'from-override' } } },
      { customTranslations: { common: { tenantOverridesProbe: 'from-prop' } } },
    );
    expect(observed!.probeCopy).toBe('from-prop');
  });

  it('unions and dedupes features instead of replacing them', () => {
    renderSync(customerConfig(), { features: ['feature-a', 'feature-b'] });
    // 'feature-a' is in both lanes and appears exactly once.
    expect(observed!.features).toEqual(['feature-a', 'feature-b']);
  });

  it('selects the theme MODE in the explicitTenantTheme slot, under forceTheme', () => {
    renderSync(customerConfig(), { theme: 'dark' });
    expect(observed!.theme).toBe('dark');

    cleanup();
    renderSync(customerConfig(), { theme: 'dark' }, { forceTheme: 'light' });
    expect(observed!.theme).toBe('light');
  });

  it('validates the override theme exactly like the config theme', () => {
    // 'base' is the no-explicit-mode sentinel, not a mode. It fails the same
    // light/dark/auto test the config's own theme faces, so it falls through
    // to the tenant's explicit mode instead of displacing it -- and by
    // construction the slot can carry a mode and nothing else.
    renderSync(customerConfig({ theme: 'dark' }), { theme: 'base' });
    expect(observed!.theme).toBe('dark');
  });
});

describe('tenantOverrides: pinned empty and undefined semantics', () => {
  it('treats an empty override as a no-op that publishes the same projection', () => {
    const base = getKnownTenantConfig('bithire')!;
    renderCodeOwned('bithire', {});
    expect(mounted()).toBe(true);
    expect(observed!.config).toBe(getCodeOwnedRuntimeConfig(base));
  });

  it('treats an all-undefined override as absence, not as presence', () => {
    const base = getKnownTenantConfig('bithire')!;
    renderCodeOwned('bithire', {
      locale: undefined,
      tokenOverrides: undefined,
      personality: undefined,
      branding: undefined,
    });
    // `{ key: undefined }` is what a caller writes when a conditional produced
    // nothing. Reading it as "the key is present" would rebuild the config and
    // take this code-owned tenant down with a reserved-identity refusal.
    expect(mounted()).toBe(true);
    expect(observed!.config).toBe(getCodeOwnedRuntimeConfig(base));
  });

  it('mounts a customer tenant under tokenOverrides:{} because the census counts zero keys', () => {
    // The config IS rebuilt here -- tokenOverrides is the visual lane -- but the
    // empty object stays empty instead of expanding into seven sections, so the
    // census reads zero keys and there is no payload to refuse.
    renderSync(customerConfig(), { tokenOverrides: {} });
    expect(mounted()).toBe(true);
    expect(caught).toBeNull();
  });

  it('refuses a code-owned tenant under tokenOverrides:{} with a reserved-identity error', () => {
    // Same empty payload, opposite verdict -- and correctly so. Touching the
    // visual lane at all rebuilds the object, and a rebuilt object carrying a
    // reserved slug is exactly what the identity assert exists to refuse.
    renderCodeOwned('bithire', { tokenOverrides: {} });
    expect(caught).toBeInstanceOf(ReservedTenantIdentityError);
    expect(mounted()).toBe(false);
  });

  it('refuses a customer tenant on tokenOverrides:{surface:{}} as uncompiled visual payload', () => {
    // One declared section is one declared channel: the census counts keys, not
    // leaves, so an empty `surface` is still a visual claim with no compiled
    // artifact behind it.
    renderSync(customerConfig(), { tokenOverrides: { surface: {} } });
    expect(mounted()).toBe(false);
    expect(caught).toBeNull();
    expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
  });

  it('refuses a code-owned tenant on tokenOverrides:{surface:{}}', () => {
    renderCodeOwned('bithire', { tokenOverrides: { surface: {} } });
    expect(caught).toBeInstanceOf(ReservedTenantIdentityError);
  });

  it('refuses personality:{} on both a customer and a code-owned tenant', () => {
    // `personality` is censused by presence, so an empty declaration is still a
    // declaration -- and the key-conditional merge publishes that empty object
    // rather than silently falling back to the base value.
    renderSync(customerConfig(), { personality: {} });
    expect(mounted()).toBe(false);
    expect(caught).toBeNull();

    cleanup();
    renderCodeOwned('bithire', { personality: {} });
    expect(caught).toBeInstanceOf(ReservedTenantIdentityError);
  });
});

/** Real payload in each visual/identity channel the census reads. */
const RAW_VISUAL_OVERRIDES: Array<{ label: string; override: Partial<TenantConfig> }> = [
  {
    label: 'branding color',
    override: { branding: { companyName: 'The Management', primaryColor: '#B3001B' } },
  },
  { label: 'token override', override: { tokenOverrides: { densityScale: 1.2 } } },
  { label: 'personality', override: { personality: { animation: { entrance: 'fade' } } } },
  { label: 'brandTheme', override: { brandTheme: getKnownTenantConfig('bithire')!.brandTheme } },
  {
    label: 'appearance',
    override: { appearance: { general: { palette: { primary: '#B3001B' } } } },
  },
];

describe('tenantOverrides: the visual lane is still refused', () => {
  for (const { label, override } of RAW_VISUAL_OVERRIDES) {
    it(`refuses a customer tenant carrying a raw ${label}`, () => {
      renderSync(customerConfig(), override);
      expect(mounted()).toBe(false);
      expect(caught).toBeNull();
      expect(document.documentElement.hasAttribute('data-tenant')).toBe(false);
    });
  }

  for (const { label, override } of RAW_VISUAL_OVERRIDES) {
    it(`refuses a code-owned tenant carrying a raw ${label}`, () => {
      renderCodeOwned('bithire', override);
      expect(caught).toBeInstanceOf(ReservedTenantIdentityError);
      expect(mounted()).toBe(false);
    });
  }

  it('keeps the behavior lane closed to exactly five keys', () => {
    // Against the PRODUCTION tuple, not a local restatement of it. A regression
    // that widened the set would be invisible in every drill above: the new key
    // would simply stop rebuilding the config, and one more channel would slip
    // past the census with nothing turning red.
    expect([...BEHAVIOR_OVERRIDE_KEYS]).toEqual([
      'locale',
      'fallbackLocale',
      'customTranslations',
      'features',
      'theme',
    ]);
    for (const { override } of RAW_VISUAL_OVERRIDES) {
      for (const key of Object.keys(override)) {
        expect(BEHAVIOR_OVERRIDE_KEYS).not.toContain(key);
      }
    }
  });
});

/**
 * `engine` and `componentPack` are the near misses of this partition. Both are
 * runtime SELECTIONS rather than paint, which is the argument that admitted
 * `theme` to the behavior lane -- and both must nevertheless stay OUT of it.
 *
 * `theme` earned its place because it lands in a slot that accepts a mode and
 * nothing else, below `forceTheme` and behind the same validation. `engine` has
 * no such slot: it names which physical implementation renders every component,
 * and `resolveEngine` deliberately ignores a non-bundled tenant's pin so that a
 * DB-driven tenant cannot change what product it is. `componentPack` is worse
 * still -- it names a registered component pack, an arbitrary code surface.
 *
 * A behavior key is delivered at its read site and never censused. Moving
 * either of these there would hand a customer an unreviewed rendering swap and
 * an identity assert that never runs. So the drill is causal in both
 * directions: they must remain observable in the published config, they must
 * still trigger the rebuild and its identity assert, and the engine must not
 * become effective merely because the tenant asked.
 */
describe('tenantOverrides: engine and componentPack are config, not behavior', () => {
  /**
   * Each near miss carries its own typed reader rather than a string index: a
   * `TenantConfig` is a declared shape, not a bag, and casting it to
   * `Record<string, unknown>` to look a key up is exactly the kind of assertion
   * the compiler is entitled to reject.
   */
  const NEAR_MISSES: Array<{
    key: string;
    override: Partial<TenantConfig>;
    read: (config: TenantConfig) => unknown;
    published: unknown;
  }> = [
    {
      key: 'engine',
      override: { engine: 'rustic' },
      read: (config) => config.engine,
      published: 'rustic',
    },
    {
      key: 'componentPack',
      override: { componentPack: 'acme-pack' },
      read: (config) => config.componentPack,
      published: 'acme-pack',
    },
  ];

  for (const { key, override, read, published } of NEAR_MISSES) {
    it(`excludes ${key} from the behavior lane`, () => {
      expect(BEHAVIOR_OVERRIDE_KEYS).not.toContain(key);
    });

    it(`carries ${key} through the config lane on a customer tenant`, () => {
      renderSync(customerConfig(), override, { forceEngine: undefined });

      // Neither key is censused visual payload, so the rebuild is allowed to
      // land -- and it must LAND, visibly, in the object consumers read. If the
      // key had been demoted to behavior it would be delivered at some read
      // site and vanish from here, unreviewed.
      expect(mounted()).toBe(true);
      expect(read(observed!.config)).toBe(published);
    });

    it(`refuses a code-owned tenant on a ${key} override`, () => {
      // The rebuild's own consequence, and the sharpest signal in this file:
      // touching the config lane at all produces a new object carrying a
      // reserved slug, which the identity assert exists to refuse. Widening the
      // behavior tuple with this key would skip the rebuild, mount cleanly, and
      // turn this red.
      renderCodeOwned('bithire', override);
      expect(caught).toBeInstanceOf(ReservedTenantIdentityError);
      expect(mounted()).toBe(false);
    });
  }

  it('publishes the tenant engine pin without ever honouring it', () => {
    renderSync(customerConfig(), { engine: 'rustic' }, { forceEngine: undefined });

    // Published: the config lane carried it. Ignored: `resolveEngine` honours a
    // tenant pin only for a BUNDLED tenant, and 'the-management' is a customer.
    // The distinction is the whole reason this key cannot be behavior -- a
    // behavior key is delivered to its consumer by construction, which is
    // exactly the outcome the engine resolution order refuses.
    expect(observed!.config.engine).toBe('rustic');
    expect(observed!.engine).toBe(FALLBACK_ENGINE);
    expect(observed!.engine).not.toBe('rustic');
  });
});

/**
 * The token merge, tested directly, because its two failure modes are silent at
 * the provider level: both produce a config that mounts, and the damage shows
 * up later as tokens the tenant never dropped or a census counting keys nobody
 * wrote.
 *
 * FABRICATION was the first: spreading all seven sections unconditionally gave
 * every override `{ surface: {}, motion: {}, ... }`.
 *
 * PRUNING is its mirror, and the one this round closes. `{ surface: undefined }`
 * is an OWN key, so a plain `{ ...base, ...override }` overwrote a real base
 * surface with `undefined` and left the key standing -- the tenant lost tokens
 * it never asked to drop, and gained an artificial key for the census to count.
 * `undefined` means "I wrote nothing here" everywhere else in this partition;
 * it means the same here.
 */
describe('mergeTokenOverrides: fail-closed, fabricating and pruning nothing', () => {
  const BASE_SURFACE = { borderWidth: '1px', useGlass: true } as const;

  function baseTokens(): NonNullable<TenantConfig['tokenOverrides']> {
    return { surface: { ...BASE_SURFACE }, densityScale: 1.2 };
  }

  it('keeps a real base surface when the override declares it undefined', () => {
    const base = baseTokens();
    const merged = mergeTokenOverrides(base, {
      surface: undefined,
      motion: { durationScale: 2 },
    });

    // Deep-exact AND reference-exact: the base section is carried, not rebuilt.
    expect(merged.surface).toEqual(BASE_SURFACE);
    expect(merged.surface).toBe(base.surface);
    // The declared half of the override still lands.
    expect(merged.motion).toEqual({ durationScale: 2 });
    // Untouched base scalars survive an unrelated override.
    expect(merged.densityScale).toBe(1.2);
  });

  it('invents no sibling section that neither side wrote', () => {
    const merged = mergeTokenOverrides(baseTokens(), {
      surface: undefined,
      motion: { durationScale: 2 },
    });

    // Own keys, exactly: `toEqual` would pass against `{ borderRadius:
    // undefined }` and the census counts KEYS, so presence is what to assert.
    expect(Object.keys(merged).sort()).toEqual(['densityScale', 'motion', 'surface']);
    for (const section of ['borderRadius', 'shadows', 'glass', 'gradients', 'overlays']) {
      expect(merged).not.toHaveProperty(section);
    }
  });

  it('merges a section field-wise when BOTH sides declare it', () => {
    const merged = mergeTokenOverrides(baseTokens(), {
      surface: { useGlass: false },
    });

    // Last write wins per field; the field the override omitted survives.
    expect(merged.surface).toEqual({ borderWidth: '1px', useGlass: false });
    expect(Object.keys(merged).sort()).toEqual(['densityScale', 'surface']);
  });

  it('applies the same discipline INSIDE a section, field by field', () => {
    // Drill C. The top-level rule alone is not enough: a section merged with a
    // raw spread loses fields one at a time, and the loss is invisible from
    // outside the section because `surface` itself is still there.
    const merged = mergeTokenOverrides(baseTokens(), {
      surface: { useGlass: undefined, borderWidth: '2px' },
    });

    expect(merged.surface).toEqual({ borderWidth: '2px', useGlass: true });
    // Presence, not just value: a raw spread leaves `useGlass` sitting there
    // holding `undefined`, which `toEqual` alone would happily accept.
    expect(merged.surface).toHaveProperty('useGlass', true);
    expect(Object.keys(merged.surface!).sort()).toEqual(['borderWidth', 'useGlass']);
  });

  it('drops undefined override keys even with no base to protect', () => {
    const merged = mergeTokenOverrides(undefined, {
      surface: undefined,
      motion: { durationScale: 2 },
    });

    // Returning the override object by reference would have published its
    // `surface` own key -- one census-visible channel out of thin air.
    expect(Object.keys(merged)).toEqual(['motion']);
    expect(merged).not.toHaveProperty('surface');
  });
});

/**
 * BRANDING, the last place the undefined discipline was missing.
 *
 * The token merge was fixed at the top level and the branding merge kept the
 * raw `{ ...base, ...override }` -- so the exact same defect survived one field
 * over, in the channel that carries a tenant's IDENTITY rather than its paint.
 * `{ branding: { companyName, favicon: '/f.ico', logo: undefined } }` mounted
 * cleanly and published a tenant with no logo: the override never asked to drop
 * it, the census saw nothing wrong, and the only symptom was a missing mark.
 *
 * The type forces `companyName` into every branding override, so the shape below
 * carries it. That is not a softening of the counterexample -- `logo: undefined`
 * next to a defined `favicon` is the whole defect, and it is intact.
 */
describe('branding overrides: undefined never erases tenant identity', () => {
  const BASE_BRANDING: TenantBranding = {
    companyName: 'The Management',
    logo: '/logo.svg',
    primaryColor: '#B3001B',
  };

  it('preserves every base field the override left undefined (drill A)', () => {
    const merged = mergeDefinedOwnEntries(BASE_BRANDING, {
      logo: undefined,
      favicon: '/f.ico',
    });

    // Untouched identity and visual fields, by value...
    expect(merged.logo).toBe('/logo.svg');
    expect(merged.companyName).toBe('The Management');
    expect(merged.primaryColor).toBe('#B3001B');
    // ...the one defined override field applied...
    expect(merged.favicon).toBe('/f.ico');
    // ...and no artificial own key: a raw spread would leave `logo` present and
    // holding `undefined`, which is both a lost logo and a key the census can
    // see. Presence is the assertion, because `toEqual` ignores the difference.
    expect(Object.keys(merged).sort()).toEqual([
      'companyName',
      'favicon',
      'logo',
      'primaryColor',
    ]);
    expect(merged).toHaveProperty('logo', '/logo.svg');
    // The base object is an input, not scratch space.
    expect(BASE_BRANDING).not.toHaveProperty('favicon');
  });

  it('mounts the counterexample and publishes base logo plus the new favicon (drill B)', () => {
    // Identity-only branding: `logo`, `logoMark`, `favicon` and `companyName`
    // are not censused visual fields, so this tenant carries no runtime visual
    // payload and the mount is attributable to the merge alone.
    renderSync(customerConfig(), {
      branding: {
        companyName: 'The Management',
        favicon: '/f.ico',
        logo: undefined,
      },
    });

    expect(mounted()).toBe(true);
    expect(caught).toBeNull();
    // The end-to-end consequence, through the real config lane: the rebuild
    // lands, the favicon is published, and the logo the caller never mentioned
    // is still there.
    expect(observed!.config.branding.logo).toBe('/logo.svg');
    expect(observed!.config.branding.favicon).toBe('/f.ico');
    expect(observed!.config.branding.companyName).toBe('The Management');
  });
});

/**
 * `customTranslations` is merged recursively across three layers: tenant config
 * -> tenantOverrides -> app prop. An own nested `undefined` in any overlay must
 * be treated as absence, exactly as it is for the config lane, so a partial
 * override does not delete a sibling key or an entire namespace the tenant
 * actually authored.
 */
describe('customTranslations: nested undefined is absence, not erasure', () => {
  const BASE_COPY = {
    common: {
      tenantOverridesProbe: 'from-config',
      sibling: 'base-sibling',
      nested: { keep: 'deep-base', drop: 'deep-drop' },
    },
  } as const;

  it('tenant layer: nested undefined keeps the base value, lands siblings, and preserves empty string', () => {
    const fromConfig = customerConfig({ customTranslations: BASE_COPY });

    renderSync(fromConfig, {
      customTranslations: {
        common: {
          tenantOverridesProbe: undefined,
          sibling: 'override-sibling',
          nested: { keep: undefined, drop: 'deep-override' },
          empty: '',
        },
      },
    });

    expect(observed!.probeCopy).toBe('from-config');
    expect(observed!.config.customTranslations).toEqual(BASE_COPY);
    // Empty string is a deliberate translation, not a deletion.
    expect(observed!.probeCopy).not.toBe('');
  });

  it('app layer: nested undefined keeps the tenant value, lands siblings, and preserves empty string', () => {
    const fromConfig = customerConfig({ customTranslations: BASE_COPY });

    renderSync(
      fromConfig,
      { customTranslations: { common: { sibling: 'override-sibling' } } },
      {
        customTranslations: {
          common: {
            tenantOverridesProbe: undefined,
            sibling: undefined,
            nested: { keep: undefined, drop: 'deep-app' },
            empty: '',
          },
        },
      },
    );

    expect(observed!.probeCopy).toBe('from-config');
    expect(observed!.config.customTranslations).toEqual(BASE_COPY);
  });

  it('empty string survives as a valid translation at both overlay layers', () => {
    const fromConfig = customerConfig({
      customTranslations: { common: { tenantOverridesProbe: 'from-config' } },
    });

    renderSync(fromConfig, {
      customTranslations: { common: { tenantOverridesProbe: '' } },
    });
    expect(observed!.probeCopy).toBe('');

    cleanup();
    renderSync(
      fromConfig,
      { customTranslations: { common: { tenantOverridesProbe: 'from-override' } } },
      { customTranslations: { common: { tenantOverridesProbe: '' } } },
    );
    expect(observed!.probeCopy).toBe('');
  });
});
