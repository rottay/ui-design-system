'use client';

import { EngineComparison } from '@/components/playground';
import { useShowroom } from '@/components/showroom-context';
import { SurfacePreview } from './surface-preview';
import { SINGLE_RUNTIME_SURFACE_SLUGS } from './surfaces-preview-fixtures';

export function SurfaceEnginePreview({ slug }: { slug: string }) {
  const { tenantSlug } = useShowroom();

  if (SINGLE_RUNTIME_SURFACE_SLUGS.has(slug)) {
    return <SurfacePreview slug={slug} />;
  }

  return (
    <EngineComparison
      tenantSlug={tenantSlug}
      title="Surface render check"
      description="Each engine renders the same page recipe with the same active brand. Judge layout rhythm, chrome placement, and section cadence rather than the wrapper."
    >
      <SurfacePreview slug={slug} />
    </EngineComparison>
  );
}
