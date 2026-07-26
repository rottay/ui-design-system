/**
 * Provider-level ownership contract for a compiled tenant envelope.
 *
 * The app mounts the exact compiled artifact and hands the provider a typed
 * declaration. This suite proves the provider then emits NOTHING on the
 * channels the artifact covers, keeps emitting on the channels it does not,
 * and still READS the compiled appearance for the runtime semantics that are
 * not paint (density, motion dial, background mode, recipe profile).
 */

import React from 'react';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { TenantAppearance, TenantConfig } from '@/foundation/contracts';
import {
  TENANT_THEME_V1_COVERAGE,
  type TenantThemeArtifact,
  type TenantThemeDocument,
  type TenantVisualChannel,
} from '@/foundation/contracts/composition/tenants/themes/tenant-theme';
import {
  compileTenantThemeConfig,
  getTenantThemeVerticalEnvelope,
  hydrateTenantThemeConfig,
} from '@/infrastructure/compilers/composition/tenant-theme';
import type { VisualAuthorityDeclaration } from '@/infrastructure/runtime/theming';
import {
  PERSONALITY_CASCADE_LAYER,
  buildPersonalityRootRuleText,
} from '@/infrastructure/runtime/theming/foundation/cascade-layers';
import { useDensity } from '@/infrastructure/runtime/foundation/density';
import { useRecipeProfile } from '@/infrastructure/runtime/foundation/recipes/profiles';
import { useMotionPolicy } from '@/infrastructure/runtime/motion';
import { DesignSystemProvider } from '..';

const PERSONALITY_STYLE_ID = 'ds-personality-tokens';
const ARTIFACT_STYLE_ID = 'test-mounted-artifact';

function document_(document_: TenantThemeDocument): TenantThemeDocument {
  return document_;
}

const THEMANAGEMENT_DOCUMENT = document_({
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: { primary: '#2F6B9A', backgroundMode: 'dark' },
      density: 'compact',
      motion: { intensity: 0.4, durationScale: 0.9, ambient: 'off' },
    },
    advanced: {
      chrome: { sidebar: { bg: '#101014' } },
      tokenOverrides: { '--ds-radius-md': '10px' },
    },
    recipeProfile: 'rottay/technical-sharp@1',
  },
} as TenantThemeDocument);

/** Same shape, contradictory compiled values: the invariance control. */
const OTHER_TENANT_DOCUMENT = document_({
  schemaVersion: 1,
  mode: 'advanced',
  visualFoundation: {
    general: {
      palette: { primary: '#B3001B', backgroundMode: 'light' },
      density: 'spacious',
      motion: { intensity: 0.8, durationScale: 1.2, ambient: 'subtle' },
    },
    advanced: {
      chrome: { sidebar: { bg: '#FFFFFF' } },
      tokenOverrides: { '--ds-radius-md': '2px' },
    },
  },
} as TenantThemeDocument);

function compile(
  slug: string,
  tenantThemeDocument: TenantThemeDocument,
): TenantThemeArtifact {
  return compileTenantThemeConfig(
    hydrateTenantThemeConfig(tenantThemeDocument, {
      tenantId: `tenant_${slug}`,
      slug,
      verticalKey: 'bithire',
      rowVersion: 3,
    }),
    { verticalEnvelope: getTenantThemeVerticalEnvelope('bithire') },
  );
}

const THEMANAGEMENT = compile('themanagement', THEMANAGEMENT_DOCUMENT);
const OTHER_TENANT = compile('other-tenant', OTHER_TENANT_DOCUMENT);

/** The exact envelope `buildTenantConfig` hands the provider for a DB tenant. */
function dbTenantConfig(artifact: TenantThemeArtifact): TenantConfig {
  return {
    slug: artifact.slug,
    name: 'The Management',
    vertical: 'bithire',
    theme: artifact.normalizedAppearance.general?.palette?.backgroundMode ?? 'light',
    plan: 'enterprise',
    features: ['*'],
    // Identity only: companyName/logo are not paint.
    branding: { companyName: 'The Management' },
    appearance: artifact.normalizedAppearance as TenantAppearance,
  } as TenantConfig;
}

function declaration(
  artifact: TenantThemeArtifact,
  coverage: readonly TenantVisualChannel[] = artifact.coverage,
): VisualAuthorityDeclaration {
  return {
    authority: 'compiled-artifact',
    artifact: {
      digest: artifact.digest,
      compilerVersion: artifact.compilerVersion,
      coverage,
      normalizedAppearance: artifact.normalizedAppearance,
    },
  };
}

interface SemanticsProjection {
  density: string;
  recipeProfile: string | null;
  motionIntensity: number;
  motionDurationScale: number;
  motionAmbient: string;
}

function SemanticsProbe(): React.ReactElement {
  const { posture } = useDensity();
  const profile = useRecipeProfile();
  const motion = useMotionPolicy();
  const projection: SemanticsProjection = {
    density: posture,
    recipeProfile: profile?.id ?? null,
    motionIntensity: motion.intensity,
    motionDurationScale: motion.durationScale,
    motionAmbient: motion.ambient,
  };
  return <output data-testid="semantics">{JSON.stringify(projection)}</output>;
}

async function readSemantics(rendered: RenderResult): Promise<SemanticsProjection> {
  const element = await waitFor(() => {
    const found = rendered.getByTestId('semantics');
    expect(found.textContent).toBeTruthy();
    return found;
  });
  return JSON.parse(element.textContent ?? '{}') as SemanticsProjection;
}

/** Every custom property the bridge wrote, read back through CSSOM text. */
function personalityVariables(): Record<string, string> {
  const element = document.getElementById(PERSONALITY_STYLE_ID) as HTMLStyleElement | null;
  const sheet = element?.sheet;
  if (!sheet) return {};

  const collect = (rules: CSSRuleList): CSSStyleRule[] =>
    Array.from(rules).flatMap((rule) => {
      const grouping = rule as CSSGroupingRule;
      if (grouping.cssRules && grouping.cssRules.length > 0 && !(rule as CSSStyleRule).style) {
        return collect(grouping.cssRules);
      }
      return (rule as CSSStyleRule).style ? [rule as CSSStyleRule] : [];
    });

  const variables: Record<string, string> = {};
  for (const rule of collect(sheet.cssRules)) {
    for (const [, name, value] of rule.cssText.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/gi)) {
      variables[name] = value.trim();
    }
  }
  return variables;
}

/** Provider-authored declarations only: the mounted artifact is excluded. */
function providerDeclaredCustomProperties(): Set<string> {
  const declared = new Set<string>();
  const inline = document.documentElement.getAttribute('style') ?? '';
  for (const [, name] of inline.matchAll(/(--[a-z0-9-]+)\s*:/gi)) declared.add(name);

  for (const element of Array.from(document.querySelectorAll('style'))) {
    if (element.id === ARTIFACT_STYLE_ID) continue;
    for (const [, name] of (element.textContent ?? '').matchAll(/(--[a-z0-9-]+)\s*:/gi)) {
      declared.add(name);
    }
    for (const rule of Array.from(element.sheet?.cssRules ?? [])) {
      for (const [, name] of rule.cssText.matchAll(/(--[a-z0-9-]+)\s*:/gi)) declared.add(name);
    }
  }
  return declared;
}

function renderCompiledEnvelope(
  artifact: TenantThemeArtifact,
  options: {
    coverage?: readonly TenantVisualChannel[];
    productProfile?: 'dashboard' | 'workspace';
  } = {},
): RenderResult {
  return render(
    <DesignSystemProvider
      tenantConfig={dbTenantConfig(artifact)}
      visualAuthority={declaration(artifact, options.coverage ?? artifact.coverage)}
      vertical="bithire"
      forceEngine="modern"
      {...(options.productProfile ? { productProfile: options.productProfile } : {})}
    >
      <style id={ARTIFACT_STYLE_ID} dangerouslySetInnerHTML={{ __html: artifact.css }} />
      <SemanticsProbe />
    </DesignSystemProvider>,
  );
}

afterEach(() => {
  const root = document.documentElement;
  root.removeAttribute('data-tenant');
  root.removeAttribute('data-theme');
  root.removeAttribute('data-engine');
  root.removeAttribute('data-density');
  root.classList.remove('dark');
  root.style.cssText = '';
  document.getElementById(PERSONALITY_STYLE_ID)?.remove();
});

describe('DesignSystemProvider under a compiled tenant envelope', () => {
  it('emits nothing on a covered channel, so the artifact is the single owner', async () => {
    const rendered = renderCompiledEnvelope(THEMANAGEMENT);
    await readSemantics(rendered);
    // The bridge writes in an effect. Waiting for it keeps the census below
    // from passing merely because no provider emitter had run yet.
    await waitFor(() => {
      expect(Object.keys(personalityVariables()).length).toBeGreaterThan(0);
    });

    // brand-chrome: no provider-generated tenant chrome element.
    expect(document.querySelector('style[id^="ds-chrome-"]')).toBeNull();
    // appearance + visual-branding + token-overrides: ThemeProvider received
    // undefined for each, so it wrote no inline custom property at all.
    expect(document.documentElement.getAttribute('style') ?? '').not.toMatch(/--ds-/);

    // The decisive assertion: no provider-authored rule anywhere declares a
    // variable the artifact declares. Contradictory values cannot arise,
    // because only one declaration of each key exists in the document.
    const declared = providerDeclaredCustomProperties();
    const contested = Object.keys(THEMANAGEMENT.variables).filter((token) =>
      declared.has(token),
    );
    expect(contested).toEqual([]);
    expect(Object.keys(THEMANAGEMENT.variables).length).toBeGreaterThan(10);
  });

  it('keeps the personality bridge mounted and disjoint from the artifact', async () => {
    const rendered = renderCompiledEnvelope(THEMANAGEMENT);
    await readSemantics(rendered);

    const personality = await waitFor(() => {
      const variables = personalityVariables();
      expect(Object.keys(variables).length).toBeGreaterThan(0);
      return variables;
    });

    // Personality is outside v1 coverage, so the bridge COMPLETES the channel.
    expect(TENANT_THEME_V1_COVERAGE).not.toContain('personality');
    expect(Object.keys(personality).some((name) => name.startsWith('--ds-personality-'))).toBe(
      true,
    );
    // The channel is wider than the `--ds-personality-*` prefix: it also
    // carries the component variables derived from those tokens.
    expect(Object.keys(personality).every((name) => name.startsWith('--ds-'))).toBe(true);
    expect(
      Object.keys(personality).filter((name) => THEMANAGEMENT.variables[name] !== undefined),
    ).toEqual([]);
  });

  it('keeps the artifact unlayered above the bridge, so a contested key resolves to it', () => {
    // Coverage prevents contention for the channels the artifact claims. The
    // cascade contract is what settles any key both would declare anyway: the
    // artifact rule is unlayered, and an unlayered declaration outranks every
    // named layer regardless of specificity or source order.
    expect(THEMANAGEMENT.css).not.toContain('@layer');
    expect(buildPersonalityRootRuleText()).toContain(`@layer ${PERSONALITY_CASCADE_LAYER}`);
  });

  it('unmounts the bridge when the coverage claims personality, so the artifact wins it', async () => {
    // Both would declare the same channel; coverage decides, deterministically
    // and in the artifact's favor. This is the rollback lever, not v1 behavior.
    const rendered = renderCompiledEnvelope(THEMANAGEMENT, {
      coverage: [...TENANT_THEME_V1_COVERAGE, 'personality'],
    });
    await readSemantics(rendered);

    expect(document.getElementById(PERSONALITY_STYLE_ID)).toBeNull();
  });

  it('feeds the bridge from the product/vertical baseline, never from DB-tenant values', async () => {
    const first = renderCompiledEnvelope(THEMANAGEMENT);
    await readSemantics(first);
    const forThemanagement = await waitFor(() => {
      const variables = personalityVariables();
      expect(Object.keys(variables).length).toBeGreaterThan(0);
      return variables;
    });
    first.unmount();
    document.getElementById(PERSONALITY_STYLE_ID)?.remove();

    const second = renderCompiledEnvelope(OTHER_TENANT);
    await readSemantics(second);
    const forOtherTenant = await waitFor(() => {
      const variables = personalityVariables();
      expect(Object.keys(variables).length).toBeGreaterThan(0);
      return variables;
    });
    second.unmount();
    document.getElementById(PERSONALITY_STYLE_ID)?.remove();

    // Two tenants whose compiled palette, density, motion and chrome all
    // differ produce byte-identical personality.
    expect(THEMANAGEMENT.variables).not.toEqual(OTHER_TENANT.variables);
    expect(forOtherTenant).toEqual(forThemanagement);

    // Non-vacuous: the channel the bridge DOES consume moves it.
    const third = renderCompiledEnvelope(THEMANAGEMENT, { productProfile: 'workspace' });
    await readSemantics(third);
    const forWorkspaceProfile = await waitFor(() => {
      const variables = personalityVariables();
      expect(Object.keys(variables).length).toBeGreaterThan(0);
      return variables;
    });
    expect(forWorkspaceProfile).not.toEqual(forThemanagement);
  });

  it('still reads the compiled appearance for the semantics that are not paint', async () => {
    const rendered = renderCompiledEnvelope(THEMANAGEMENT);
    const semantics = await readSemantics(rendered);

    expect(semantics.density).toBe('compact');
    expect(semantics.recipeProfile).toBe('rottay/technical-sharp@1');
    expect(semantics.motionIntensity).toBe(0.4);
    expect(semantics.motionDurationScale).toBe(0.9);
    expect(semantics.motionAmbient).toBe('off');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-density')).toBe('compact');

    // ...while zero appearance paint reached the document.
    expect(document.documentElement.getAttribute('style') ?? '').not.toMatch(/--ds-/);
  });
});

describe('DesignSystemProvider without a compiled envelope', () => {
  it('leaves a bundled vertical exactly as it was: provider-owned, nothing suppressed', async () => {
    const rendered = render(
      <DesignSystemProvider
        tenantConfig={{
          slug: 'bithire',
          name: 'BitHire',
          vertical: 'bithire',
          theme: 'light',
          plan: 'enterprise',
          features: [],
          branding: { companyName: 'BitHire', primaryColor: '#3355FF' },
        } as TenantConfig}
        vertical="bithire"
        forceEngine="modern"
      >
        <SemanticsProbe />
      </DesignSystemProvider>,
    );
    await readSemantics(rendered);

    // The bridge is the only emitter of the personality family for a bundled
    // vertical; unmounting it would blank the whole family.
    await waitFor(() => {
      expect(document.getElementById(PERSONALITY_STYLE_ID)).not.toBeNull();
    });
    expect(document.documentElement.style.getPropertyValue('--ds-color-primary')).toBe('#3355FF');
  });
});
