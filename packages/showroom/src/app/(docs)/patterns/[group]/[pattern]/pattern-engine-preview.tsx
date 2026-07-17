'use client';

import { EngineComparison } from '@/composition/components/playground';
import { useShowroom } from '@/composition/components/showroom-context';
import { PatternPreview } from './pattern-preview';
import { SINGLE_RUNTIME_PATTERN_SLUGS } from './pattern-preview-fixtures';

export function PatternEnginePreview({ slug }: { slug: string }) {
  const { tenantSlug } = useShowroom();

  if (SINGLE_RUNTIME_PATTERN_SLUGS.has(slug)) {
    return <PatternPreview slug={slug} />;
  }

  return (
    <EngineComparison tenantSlug={tenantSlug}>
      <PatternPreview slug={slug} />
    </EngineComparison>
  );
}
