'use client';

/**
 * Chrome-free single-component preview used by the Claude Design card generator.
 *
 * Mirrors the proven provider wiring in docs-provider-shell.tsx but drops the
 * ShowroomShell so the harvested DOM contains only the component itself. The
 * engine is forced to `modern` (the house default) because the engine decides
 * the rendered DOM; tenant theming is pure CSS variables and is swapped at view
 * time by the generated card, so we render against a single tenant here.
 */

import {
  DesignSystemProvider,
  getKnownTenantConfig,
} from '@rottay/design-system';
import {
  getShowroomProductProfileKey,
  getShowroomVerticalKey,
} from '@/composition/components/showroom-context';
import { COMPONENT_MAP } from '@/app/(docs)/primitives/[category]/[component]/live-preview';
import { renderPatternPreview } from '@/app/(docs)/patterns/[group]/[pattern]/pattern-preview-fixtures';
import { STRUCTURE_PREVIEWS } from '@/app/(docs)/structures/[group]/[structure]/structure-preview-fixtures';

const TENANT = 'rottay' as const;
const ENGINE = 'modern' as const;

function resolvePreview(tier: string, slug: string) {
  switch (tier) {
    case 'primitives':
      return COMPONENT_MAP[slug];
    case 'patterns':
      return renderPatternPreview(slug) ?? undefined;
    case 'structures':
      return STRUCTURE_PREVIEWS[slug];
    default:
      return undefined;
  }
}

export function CardClient({ tier, slug }: { tier: string; slug: string }) {
  const node = resolvePreview(tier, slug);
  const tenantConfig = getKnownTenantConfig(TENANT);
  const productProfile = getShowroomProductProfileKey(TENANT, ENGINE);

  return (
    <DesignSystemProvider
      tenantConfig={tenantConfig ?? undefined}
      forceEngine={ENGINE}
      productProfile={productProfile}
      vertical={getShowroomVerticalKey(TENANT)}
    >
      <div
        style={{
          minHeight: 220,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
        }}
      >
        {/* Harvest sentinels — the generator slices the DOM between these. */}
        <span id="ds-card-start" style={{ display: 'none' }} />
        {node ?? <span data-missing="true">No fixture registered for {slug}</span>}
        <span id="ds-card-end" style={{ display: 'none' }} />
      </div>
    </DesignSystemProvider>
  );
}
