import type { ReactNode } from 'react';
import type { VisualAuthorityDeclaration } from '../../../../../theming';
import type {
  EngineName,
  ProductProfile,
  ProductProfileKey,
  TenantConfig,
  VerticalKey,
  VerticalPreset,
} from '../../../../../../../foundation/contracts';
import type {
  LocaleTranslations,
  SupportedLocale,
} from '@/foundation/i18n/kernel/contracts';
import type { DocumentViewportHint } from '../../../../../foundation/root-attributes/ssr';
import type { EngineVisualDeclaration } from '@/foundation/contracts/composition/tenants/themes/engine-adapter';

export interface DesignSystemProviderProps {
  children: ReactNode;
  /**
   * Tenant slug to resolve config from registry/API.
   * Use this when you want the design system to handle config resolution.
   * An unresolved slug retains its own identity with generic DS defaults.
   */
  tenantSlug?: string | null;
  /**
   * Provide tenant config directly (standalone mode).
   * Takes precedence over tenantSlug if both are provided.
   */
  tenantConfig?: TenantConfig;
  /**
   * Selects the owner of each tenant visual channel.
   *
   * Prefer the typed declaration. `{ authority: 'compiled-artifact', artifact }`
   * carries the artifact's coverage and compiled appearance, so the provider
   * suppresses exactly the channels the artifact owns, recognises its own
   * compiled appearance echoed back through the config, and leaves uncovered
   * channels (personality) to their subordinate emitters.
   *
   * The declaration is EVIDENCE, not a switch, so there is no string form.
   * `'compiled-artifact'` as a bare string used to mean "trust me, it is
   * mounted"; it now resolves as `invalid-declaration` and the provider blocks,
   * because a string carries neither the coverage to suppress nor the bytes to
   * verify. `{ authority: 'provider' }` is the explicit context-only escape
   * hatch and is refused if the config still carries runtime visual payload.
   *
   * Omitting the prop is the honest default for a tenant with no visual
   * payload. It is NOT a way to skip the proof: a config carrying branding
   * colors, tokenOverrides, appearance, personality or brandTheme with no
   * declaration resolves `uncompiled-visual-payload` and blocks as well.
   */
  visualAuthority?: VisualAuthorityDeclaration;
  /**
   * The compiled engine projection for this tenant.
   *
   * Only an engine that seeds a third-party library needs it — `classic` seeds
   * antd — and that engine REFUSES to render without one, because the
   * alternative is re-deriving the same values from the live cascade after
   * mount and painting a guess before that. Produce it from the same
   * `compileTheme(resolution, resolveAdapter(engine))` call that produced the
   * mounted artifact.
   */
  engineVisual?: EngineVisualDeclaration;
  /**
   * Runtime tenant overrides applied on top of the resolved tenant.
   *
   * The prop has TWO lanes, and the split is a contract, not an optimization.
   *
   * BEHAVIOR lane — exactly `locale`, `fallbackLocale`, `customTranslations`,
   * `features` and `theme`. None of these is paint: they select a dictionary, a
   * capability set, or a light/dark/auto MODE. They are delivered at the read
   * sites that consume them (I18nProvider, FeatureProvider, ThemeProvider) and
   * are NEVER folded into the published `TenantConfig`. A behavior-only
   * override therefore publishes the SAME object it received — the exact
   * code-owned instance keeps its registry identity, its governed motion dial
   * and its `isCodeOwnedTenantConfig` membership. `theme` lands in the
   * `explicitTenantTheme` slot, under `forceTheme`, and passes the same
   * light/dark/auto validation the config's own `theme` passes; it can never
   * introduce a raw token.
   *
   * VISUAL/IDENTITY lane — every other key (`branding`, `tokenOverrides`,
   * `personality`, `brandTheme`, `appearance`, `slug`, ...). Supplying any of
   * them REBUILDS the config, which is exactly what makes it visible to the
   * runtime visual census and to the reserved-identity assert. That is the
   * intended outcome, not a regression: an app that wants to paint must publish
   * a compiled artifact, and an app that touches a code-owned tenant gets a
   * `ReservedTenantIdentityError`.
   *
   * The rebuild is key-conditional and transparent: a section absent from the
   * override is never fabricated, and a key present in the override is never
   * pruned. `tokenOverrides: {}` stays `{}` — zero census keys, so it mounts —
   * instead of expanding into seven empty sections that the census would read
   * as a real visual payload.
   */
  tenantOverrides?: Partial<TenantConfig>;
  /**
   * Product profile that sits between engine defaults and tenant overrides.
   *
   * The provider accepts either a registered key or an inline object so teams
   * can move fast locally without turning the DS into a bottleneck.
   */
  productProfile?: ProductProfileKey | ProductProfile;
  /**
   * Industry vertical preset.
   *
   * Accepts a registered vertical key (e.g., 'evnto', 'bithire', 'rottay')
   * or an inline VerticalPreset object. When provided, the vertical's engine
   * is used as the default (unless forceEngine overrides it) and the vertical's
   * defaultProductProfile is used when no explicit productProfile is given.
   *
   * The vertical personality is merged into the personality chain between
   * DEFAULT_PERSONALITY and the product profile personality.
   */
  vertical?: VerticalKey | VerticalPreset;
  /** Force a specific engine */
  forceEngine?: EngineName;
  /** Force a specific theme */
  forceTheme?: string;
  /** Force a specific locale on top of tenant defaults */
  locale?: SupportedLocale;
  /** Locale used when a key is missing in the active locale */
  fallbackLocale?: SupportedLocale;
  /** App-level translation overrides merged with tenant translations */
  customTranslations?: Partial<LocaleTranslations>;
  /** Callback when locale changes */
  onLocaleChange?: (locale: SupportedLocale) => void;
  /** Callback when tenant is resolved */
  onTenantResolved?: (tenant: TenantConfig) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /**
   * Skip loading individual tenant CSS files.
   * Defaults to true - assumes you import @rottay/design-system/styles in your app.
   * Set to false if you want to load tenant CSS dynamically from a URL.
   */
  skipCssLoading?: boolean;
  /** Base URL for tenant CSS files (only used when skipCssLoading=false) */
  cssBaseUrl?: string;
  /**
   * The viewport tier this REQUEST is for: exactly the value handed to
   * `mountTenantTheme` as `options.viewport`, forwarded to the responsive
   * runtime this provider mounts.
   *
   * WHY THE PROVIDER HAS TO CARRY IT. The mount projects the hint onto `<html>`
   * so CSS can match it, and it is tempting to let the client read it back from
   * there. It cannot: React asks the responsive store for its server answer on
   * a machine with no document AND again while hydrating in the browser, so an
   * attribute read makes those two answers disagree and React throws the whole
   * first paint away. Omitted, the tree renders mobile-first on the server --
   * the design system does not invent a viewport it was never told about.
   */
  ssrViewport?: DocumentViewportHint;
}
