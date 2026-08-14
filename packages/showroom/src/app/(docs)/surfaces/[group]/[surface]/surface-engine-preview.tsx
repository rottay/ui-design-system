'use client';

import { EngineComparison } from '@/components/playground';
import { SurfacePreview } from './surface-preview';
import { SINGLE_RUNTIME_SURFACE_SLUGS } from './surfaces-preview-fixtures';

export function SurfaceEnginePreview({ slug }: { slug: string }) {
  if (SINGLE_RUNTIME_SURFACE_SLUGS.has(slug)) {
    return <SurfacePreview slug={slug} />;
  }

  return (
    <EngineComparison
      title="Surface render check"
      description="Switch engines to re-render the same page recipe, one engine at a time, with the active brand untouched. Judge layout rhythm, chrome placement, and section cadence rather than the wrapper."
    >
      <SurfacePreview slug={slug} />
    </EngineComparison>
  );
}
